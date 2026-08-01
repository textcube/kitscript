#!/usr/bin/env python3
"""역재생(reverse) 클립 일괄 생성 도구.

랜딩 페이지에서 메뉴를 바꿀 때 현재 영상을 되감아야 하는데,
브라우저에서 currentTime 을 계속 되돌리는 방식은 서버가 HTTP Range 를
지원해야 하고, seek 이 키프레임 단위로 튀어서 부드럽지 않다.
그래서 역재생 클립을 미리 만들어 두고 정방향으로 재생한다.

    pizza01.mp4  →  pizza01_rev.mp4

기본 동작
    - assets 폴더의 pizzaNN.mp4 를 모두 찾아 pizzaNN_rev.mp4 생성
    - 이미 있고 원본보다 최신이면 건너뜀 (--force 로 무시)
    - 역재생 중에는 항상 무음이므로 오디오 트랙 제거
    - 길이는 원본 그대로 유지 (재생 속도는 index.html 의 REVERSE_RATE 가 결정)

사용 예
    python oxpizza/tools/make_reverse.py
    python oxpizza/tools/make_reverse.py --force --crf 26
    python oxpizza/tools/make_reverse.py --only 3 5
    python oxpizza/tools/make_reverse.py --speed 6.125   # 클립 자체를 시간 압축
    python oxpizza/tools/make_reverse.py --dry-run
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

REV_SUFFIX = "_rev"
DURATION_RE = re.compile(r"Duration:\s*(\d+):(\d\d):(\d\d\.\d+)")
# 스트림 ID(0x1)나 코덱 태그(0x31637661)에 걸리지 않도록 자릿수를 제한한다
SIZE_RE = re.compile(r"\b(\d{2,5})x(\d{2,5})\b")


# ----------------------------------------------------------------------
# ffmpeg 찾기
# ----------------------------------------------------------------------

def resolve_ffmpeg(explicit: str | None) -> str:
    """--ffmpeg > imageio-ffmpeg 번들 > PATH 순서로 찾는다."""
    if explicit:
        if not Path(explicit).exists():
            sys.exit(f"[!] 지정한 ffmpeg 을 찾을 수 없습니다: {explicit}")
        return explicit

    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        pass

    found = shutil.which("ffmpeg")
    if found:
        return found

    sys.exit(
        "[!] ffmpeg 을 찾을 수 없습니다.\n"
        "    pip install imageio-ffmpeg  (또는 winget install Gyan.FFmpeg)"
    )


# ----------------------------------------------------------------------
# 미디어 정보
# ----------------------------------------------------------------------

def probe(ffmpeg: str, path: Path) -> dict:
    """ffmpeg -i 의 stderr 를 읽어 길이와 해상도를 뽑는다 (ffprobe 없이)."""
    proc = subprocess.run(
        [ffmpeg, "-hide_banner", "-i", str(path)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    text = proc.stderr or ""

    duration = None
    m = DURATION_RE.search(text)
    if m:
        h, mnt, s = m.groups()
        duration = int(h) * 3600 + int(mnt) * 60 + float(s)

    resolution = None
    for line in text.splitlines():
        if "Video:" in line:
            m2 = SIZE_RE.search(line)
            if m2:
                resolution = f"{m2.group(1)}x{m2.group(2)}"
            break

    return {"duration": duration, "resolution": resolution}


def human(n: int) -> str:
    return f"{n / 1_048_576:.1f}MB" if n >= 1_048_576 else f"{n / 1024:.0f}KB"


# ----------------------------------------------------------------------
# 변환
# ----------------------------------------------------------------------

def build_filter(speed: float) -> str:
    """reverse 뒤에 필요하면 시간 압축을 붙인다."""
    chain = ["reverse"]
    if abs(speed - 1.0) > 1e-6:
        chain.append(f"setpts=PTS/{speed:g}")
    return ",".join(chain)


def encode(ffmpeg: str, src: Path, dst: Path, args) -> tuple[bool, str]:
    cmd = [
        ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(src),
        "-vf", build_filter(args.speed),
        "-an",                                  # 되감기는 항상 무음
        "-c:v", "libx264",
        "-crf", str(args.crf),
        "-preset", args.preset,
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
    ]
    if args.fps:
        cmd += ["-r", str(args.fps)]
    cmd.append(str(dst))

    proc = subprocess.run(cmd, capture_output=True, text=True,
                          encoding="utf-8", errors="replace")
    if proc.returncode != 0:
        lines = (proc.stderr or "").strip().splitlines()
        return False, lines[-1] if lines else f"ffmpeg 종료코드 {proc.returncode}"
    return True, ""


# ----------------------------------------------------------------------

def main() -> int:
    here = Path(__file__).resolve().parent
    default_assets = here.parent / "assets"

    ap = argparse.ArgumentParser(
        description="pizzaNN.mp4 → pizzaNN_rev.mp4 역재생 클립 일괄 생성",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("--assets", type=Path, default=default_assets,
                    help=f"영상 폴더 (기본: {default_assets})")
    ap.add_argument("--pattern", default="pizza*.mp4",
                    help="입력 파일 glob (기본: pizza*.mp4)")
    ap.add_argument("--only", nargs="*", default=None,
                    help="특정 번호만 처리. 예: --only 3 5")
    ap.add_argument("--speed", type=float, default=1.0,
                    help="시간 압축 배수. 1.0 이면 원본 길이 유지 (기본: 1.0)")
    ap.add_argument("--crf", type=int, default=23,
                    help="libx264 품질. 낮을수록 고화질/큰 용량 (기본: 23)")
    ap.add_argument("--preset", default="slow",
                    help="libx264 preset (기본: slow)")
    ap.add_argument("--fps", type=float, default=None,
                    help="출력 프레임레이트 고정. 생략하면 원본 유지")
    ap.add_argument("--force", action="store_true",
                    help="이미 있는 결과물도 다시 만든다")
    ap.add_argument("--dry-run", action="store_true",
                    help="무엇을 만들지만 출력하고 실제로는 변환하지 않는다")
    ap.add_argument("--ffmpeg", default=None,
                    help="ffmpeg 실행 파일 경로 직접 지정")
    args = ap.parse_args()

    assets: Path = args.assets
    if not assets.is_dir():
        sys.exit(f"[!] 폴더가 없습니다: {assets}")

    ffmpeg = resolve_ffmpeg(args.ffmpeg)

    sources = sorted(
        p for p in assets.glob(args.pattern)
        if p.is_file() and not p.stem.endswith(REV_SUFFIX)
    )
    if args.only:
        wanted = {s.zfill(2) for s in args.only}
        sources = [p for p in sources
                   if any(p.stem.endswith(w) for w in wanted)]

    if not sources:
        sys.exit(f"[!] 대상 파일이 없습니다: {assets / args.pattern}")

    print(f"ffmpeg : {ffmpeg}")
    print(f"assets : {assets}")
    print(f"설정   : speed={args.speed:g}x  crf={args.crf}  preset={args.preset}"
          + (f"  fps={args.fps:g}" if args.fps else ""))
    print(f"대상   : {len(sources)}개\n")

    made = skipped = failed = 0
    total_in = total_out = 0
    started = time.time()

    for i, src in enumerate(sources, 1):
        dst = src.with_name(f"{src.stem}{REV_SUFFIX}{src.suffix}")
        tag = f"[{i}/{len(sources)}] {src.name} → {dst.name}"

        if dst.exists() and not args.force and dst.stat().st_mtime >= src.stat().st_mtime:
            print(f"{tag}  건너뜀 (이미 최신)")
            skipped += 1
            continue

        info = probe(ffmpeg, src)
        dur = info["duration"]
        expect = (dur / args.speed) if dur else None
        detail = f"{info['resolution'] or '?'}, {dur:.2f}s" if dur else "정보 없음"
        if expect and abs(args.speed - 1.0) > 1e-6:
            detail += f" → {expect:.2f}s"

        if args.dry_run:
            print(f"{tag}  [dry-run] {detail}")
            continue

        print(f"{tag}  ({detail}) 인코딩 중...", end="", flush=True)
        t0 = time.time()
        ok, err = encode(ffmpeg, src, dst, args)

        if not ok:
            print(f"\r{tag}  실패: {err}")
            failed += 1
            continue

        out = probe(ffmpeg, dst)
        in_size, out_size = src.stat().st_size, dst.stat().st_size
        total_in += in_size
        total_out += out_size
        made += 1

        # 역재생 결과가 기대한 길이인지 확인한다
        warn = ""
        if dur and out["duration"] and expect:
            if abs(out["duration"] - expect) > max(0.15, expect * 0.05):
                warn = f"  [!] 길이 불일치: 기대 {expect:.2f}s / 실제 {out['duration']:.2f}s"

        print(f"\r{tag}  완료 {out['duration'] or 0:.2f}s  "
              f"{human(in_size)} → {human(out_size)}  ({time.time() - t0:.1f}s){warn}")

    print()
    print(f"생성 {made} / 건너뜀 {skipped} / 실패 {failed}"
          f"   총 {time.time() - started:.1f}s")
    if made:
        print(f"용량: 원본 {human(total_in)} → 역재생 {human(total_out)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
