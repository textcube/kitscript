#!/usr/bin/env python3
"""홈페이지에 쓸 사진을 photos/ 원본에서 골라 웹용으로 굽는다.

photos/ 에는 손대지 않은 원본(장당 1.5~5MB, 합쳐서 1.5GB)이 들어 있다.
여기서 필요한 것만 골라 images/ 로 리사이즈·재인코딩한다.

    python oxpizza/tools/build_images.py
    python oxpizza/tools/build_images.py --force
    python oxpizza/tools/build_images.py --quality 78

사진을 바꾸려면 아래 PICKS 의 원본 파일명만 고치면 된다.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("[!] Pillow 가 필요합니다.  pip install pillow")

# (출력이름, 원본상대경로, 최대 가로폭)
# 폭은 쓰임새에 맞춘다: 히어로/와이드 1600, 섹션 1200, 카드 900
PICKS = [
    # --- 옥수동 본점 (내용은 눈으로 확인하고 이름을 붙였다) ---
    ("hero-peel",         "oxpizza/IMG_6760.JPG",                    1600),  # 화덕에서 피자를 꺼내는 순간
    ("oven-fire",         "oxpizza/IMG_6788.JPG",                    1200),  # 불꽃 이는 화덕 입구
    ("dough-stretch",     "oxpizza/IMG_6844.JPG",                    1200),  # 반죽을 늘리는 손
    ("dough-scale",       "oxpizza/IMG_6860.JPG",                     900),  # 저울 위 반죽 한 덩이
    ("kitchen-oven",      "oxpizza/IMG_6876.JPG",                    1400),  # 주방과 화덕 전경
    ("interior-oksu",     "oxpizza/IMG_6724.JPG",                    1400),  # 창가 자리
    ("table-detail",      "oxpizza/P20260709_131428_5402C.JPG",      1200),  # 세팅된 테이블
    ("wine-shelf",        "oxpizza/IMG_6752.JPG",                     900),  # 와인 선반
    ("menu-calzone",      "oxpizza/IMG_6836.JPG",                    1200),  # 옥수 칼조네
    ("menu-bismarck",     "oxpizza/IMG_6820.JPG",                    1200),  # 비스마르크
    ("menu-sourdough",    "oxpizza/IMG_6800.JPG",                     900),  # 사워도우 브레드
    ("table-spread",      "oxpizza/IMG_6810.JPG",                    1200),  # 파스타까지 함께 깔린 한 상
    # --- 로얄맨션 반포점 ---
    ("rm-sign",           "royalmansion/P20260629_132841_7640B.JPG", 1400),  # ROYAL MANSION 사인
    ("rm-interior",       "royalmansion/P20260629_132506_527B5.JPG", 1200),  # 홀 전경
    ("rm-steak",          "royalmansion/P20260629_141752_2A9C6.JPG",  900),  # 스테이크 스킬렛
    ("rm-flatbread",      "royalmansion/P20260629_134011_74BF3.JPG",  900),  # 플랫브레드
    ("rm-pasta",          "royalmansion/P20260629_140416_CD23C.JPG",  900),  # 크림 파스타
]


def human(n: int) -> str:
    return f"{n / 1_048_576:.2f}MB" if n >= 1_048_576 else f"{n / 1024:.0f}KB"


def main() -> int:
    here = Path(__file__).resolve().parent
    root = here.parent

    ap = argparse.ArgumentParser(description="photos/ 원본 → images/ 웹용 사진")
    ap.add_argument("--photos", type=Path, default=root / "photos")
    ap.add_argument("--out", type=Path, default=root / "images")
    ap.add_argument("--quality", type=int, default=82, help="JPEG 품질 (기본: 82)")
    ap.add_argument("--force", action="store_true", help="이미 있어도 다시 굽는다")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not args.photos.is_dir():
        sys.exit(f"[!] 원본 폴더가 없습니다: {args.photos}")
    args.out.mkdir(parents=True, exist_ok=True)

    made = skipped = missing = 0
    total_in = total_out = 0

    for name, rel, width in PICKS:
        src = args.photos / rel
        dst = args.out / f"{name}.jpg"

        if not src.is_file():
            print(f"  [!] 원본 없음: {rel}")
            missing += 1
            continue

        if dst.exists() and not args.force and dst.stat().st_mtime >= src.stat().st_mtime:
            print(f"  {dst.name:<22} 건너뜀 (이미 최신)")
            skipped += 1
            continue

        if args.dry_run:
            print(f"  {dst.name:<22} [dry-run] {rel} → 폭 {width}")
            continue

        with Image.open(src) as im:
            # 휴대폰 사진은 EXIF 로만 회전 정보를 갖고 있다. 여기서 실제로 돌려 두지 않으면
            # EXIF 를 떼는 순간 눕는다.
            im = ImageOps.exif_transpose(im)
            if im.mode != "RGB":
                im = im.convert("RGB")
            if im.width > width:
                h = round(im.height * width / im.width)
                im = im.resize((width, h), Image.LANCZOS)
            im.save(dst, "JPEG", quality=args.quality, optimize=True, progressive=True)

        total_in += src.stat().st_size
        total_out += dst.stat().st_size
        made += 1
        print(f"  {dst.name:<22} {im.width}x{im.height}  "
              f"{human(src.stat().st_size)} → {human(dst.stat().st_size)}")

    print()
    print(f"생성 {made} / 건너뜀 {skipped} / 원본없음 {missing}")
    if made:
        print(f"용량: {human(total_in)} → {human(total_out)}")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
