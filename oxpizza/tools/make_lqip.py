#!/usr/bin/env python3
"""빈 홀 사진의 초저해상도 축소본을 index.html 의 .stage 배경에 인라인으로 박는다.

첫 화면에서 배경 사진(pizza00.png, 1MB 넘음)이 도착하기 전까지 무대가 빈 상자로
보이는 문제가 있었다. 40x40 JPEG 를 data URI 로 CSS 안에 넣어 두면 네트워크를
타지 않으므로 첫 페인트부터 무조건 그려지고, 원본이 도착하면 그 위에 덮인다.

pizza00.png 를 교체했다면 다시 실행하면 된다.

    python oxpizza/tools/make_lqip.py
    python oxpizza/tools/make_lqip.py --size 48 --quality 7
    python oxpizza/tools/make_lqip.py --dry-run
"""

from __future__ import annotations

import argparse
import base64
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

# .stage 안에서 교체할 블록. url("data:...") 한 줄만 갈아끼운다.
URL_RE = re.compile(r'(url\(")data:image/[^"]*("\) center / cover no-repeat)')


def resolve_ffmpeg(explicit: str | None) -> str:
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
    sys.exit("[!] ffmpeg 을 찾을 수 없습니다.  pip install imageio-ffmpeg")


def main() -> int:
    here = Path(__file__).resolve().parent
    root = here.parent

    ap = argparse.ArgumentParser(description="빈 홀 사진의 LQIP 를 index.html 에 인라인 삽입")
    ap.add_argument("--source", type=Path, default=root / "assets" / "pizza00.png",
                    help="원본 이미지 (기본: assets/pizza00.png)")
    ap.add_argument("--target", type=Path, default=root / "index.html",
                    help="삽입 대상 (기본: index.html)")
    ap.add_argument("--size", type=int, default=40, help="축소본 한 변 픽셀 (기본: 40)")
    ap.add_argument("--quality", type=int, default=6,
                    help="JPEG 품질. 2=최고화질/큰용량 ~ 31 (기본: 6)")
    ap.add_argument("--dry-run", action="store_true", help="크기만 재보고 파일은 건드리지 않는다")
    ap.add_argument("--ffmpeg", default=None, help="ffmpeg 실행 파일 경로 직접 지정")
    args = ap.parse_args()

    if not args.source.is_file():
        sys.exit(f"[!] 원본이 없습니다: {args.source}")
    if not args.target.is_file():
        sys.exit(f"[!] 대상이 없습니다: {args.target}")

    ffmpeg = resolve_ffmpeg(args.ffmpeg)

    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "lqip.jpg"
        proc = subprocess.run(
            [ffmpeg, "-y", "-loglevel", "error", "-i", str(args.source),
             "-vf", f"scale={args.size}:{args.size}", "-q:v", str(args.quality), str(out)],
            capture_output=True, text=True, encoding="utf-8", errors="replace",
        )
        if proc.returncode != 0 or not out.is_file():
            sys.exit(f"[!] 축소 실패: {(proc.stderr or '').strip()[-300:]}")
        raw = out.read_bytes()

    uri = "data:image/jpeg;base64," + base64.b64encode(raw).decode()
    print(f"원본   : {args.source.name} ({args.source.stat().st_size / 1024:.0f}KB)")
    print(f"축소본 : {args.size}x{args.size} q{args.quality} → JPEG {len(raw)}B, data URI {len(uri)}B")

    html = args.target.read_text(encoding="utf-8")
    if not URL_RE.search(html):
        sys.exit("[!] .stage 배경의 data URI 를 찾지 못했습니다. index.html 이 바뀌었는지 확인하세요.")

    if args.dry_run:
        print("[dry-run] 파일은 수정하지 않았습니다.")
        return 0

    # 정규식 치환에서 base64 의 백슬래시 해석을 피하려고 람다를 쓴다
    new_html, n = URL_RE.subn(lambda m: m.group(1) + uri + m.group(2), html, count=1)
    args.target.write_text(new_html, encoding="utf-8")
    print(f"{args.target.name} 갱신 완료 ({n}곳)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
