"""
크롬 확장으로 다운로드한 이미지를 브라우저 기본 '다운로드' 폴더에서
프로젝트 outputs 폴더로 복사합니다.

사용법:
  python copy_downloaded_images.py
  python copy_downloaded_images.py --downloads-dir "D:/Downloads"
  python copy_downloaded_images.py --move   # 복사 대신 이동
"""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path


def get_default_downloads_dir() -> Path:
    home = Path.home()
    return home / "Downloads"


def find_downloaded_outputs(downloads_root: Path) -> Path:
    """확장이 저장하는 하위 경로: quiz/baker/outputs"""
    return downloads_root / "quiz" / "baker" / "outputs"


def copy_downloaded_images(downloads_dir: Path, outputs_dir: Path, move: bool = False) -> tuple[int, list[str]]:
    src_base = find_downloaded_outputs(downloads_dir)
    if not src_base.is_dir():
        return 0, []

    copied: list[str] = []
    for slug_dir in src_base.iterdir():
        if not slug_dir.is_dir():
            continue
        dest_slug = outputs_dir / slug_dir.name
        dest_slug.mkdir(parents=True, exist_ok=True)
        for f in slug_dir.iterdir():
            if f.is_file() and f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp"):
                dest_file = dest_slug / f.name
                if move:
                    shutil.move(str(f), str(dest_file))
                else:
                    shutil.copy2(str(f), str(dest_file))
                copied.append(f"{slug_dir.name}/{f.name}")

    return len(copied), copied


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(
        description="Copy images from browser Downloads (quiz/baker/outputs) to project outputs"
    )
    parser.add_argument(
        "--downloads-dir",
        type=Path,
        default=None,
        help="Browser default Downloads folder (default: user's Downloads)",
    )
    parser.add_argument("--output", type=Path, default=script_dir / "outputs", help="Project outputs directory")
    parser.add_argument("--move", action="store_true", help="Move files instead of copy")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    downloads_dir = args.downloads_dir or get_default_downloads_dir()
    src_base = find_downloaded_outputs(downloads_dir)

    if not src_base.is_dir():
        print(f"[INFO] 다운로드 폴더에 확장 저장 경로가 없습니다: {src_base}")
        print("       먼저 크롬 확장에서 'Download Images'로 이미지를 받아주세요.")
        return

    count, files = copy_downloaded_images(downloads_dir, args.output, move=args.move)
    if count == 0:
        print("[INFO] 복사할 이미지 파일이 없습니다.")
        return

    action = "이동" if args.move else "복사"
    print(f"[DONE] {count}개 파일을 outputs로 {action}했습니다.")
    for name in files[:20]:
        print(f"  - {name}")
    if len(files) > 20:
        print(f"  ... 외 {len(files) - 20}개")


if __name__ == "__main__":
    main()
