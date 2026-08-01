#!/usr/bin/env python3
"""파비콘·앱 아이콘을 만든다.

images/mark.svg 와 같은 형태를 PIL 로 다시 그린다. SVG 를 래스터화하는 라이브러리
(cairosvg 등)를 깔지 않으려고 도형을 직접 그린다. 4배로 그린 뒤 줄여서 가장자리를
매끄럽게 만든다.

    python oxpizza/tools/build_brand.py

로고가 바뀌면 아래 색과 GEOM 만 고치면 된다.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    sys.exit("[!] Pillow 가 필요합니다.  pip install pillow")

PARCHMENT = (242, 237, 227, 255)   # 로고 바탕 크림색
BRICK     = (59, 42, 28, 255)      # 아치 진갈색
FLAME     = (238, 113, 38, 255)    # 불꽃 주황
FLAME_HI  = (245, 163, 58, 255)    # 불꽃 안쪽 밝은 부분

SS = 4          # 슈퍼샘플링 배수
BASE = 64.0     # mark.svg 의 viewBox 기준


def draw_mark(size: int, bg: bool) -> Image.Image:
    """size 픽셀 정사각 아이콘 한 장."""
    n = size * SS
    k = n / BASE                                  # viewBox → 픽셀 배율
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    def S(v):                                     # 좌표 변환
        return v * k

    if bg:
        d.ellipse([0, 0, n - 1, n - 1], fill=PARCHMENT)

    # --- 화덕 아치 ---
    # 원 안에 들어와야 한다. 아래 y=50 에서 원의 반폭은 √(32²-18²)≈26.5 이므로
    # 다리를 x 11~53 에 두면 어느 지점에서도 원 밖으로 나가지 않는다.
    arch = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    ad = ImageDraw.Draw(arch)
    ad.pieslice([S(11), S(13), S(53), S(55)], 180, 360, fill=BRICK)   # 바깥 돔
    ad.rectangle([S(11), S(34), S(53), S(50)], fill=BRICK)            # 다리
    ad.pieslice([S(20), S(22), S(44), S(46)], 180, 360, fill=(0, 0, 0, 0))  # 안쪽을 뚫는다
    ad.rectangle([S(20), S(34), S(44), S(50)], fill=(0, 0, 0, 0))
    img.alpha_composite(arch)

    # 벽돌 이음새 — 작은 크기에서는 뭉개지므로 큰 아이콘에만 넣는다
    if size >= 64:
        import math
        seam = ImageDraw.Draw(img)
        for deg in (206, 232, 258, 284, 308, 334):
            a = math.radians(deg)
            x0, y0 = 32 + 12.4 * math.cos(a), 34 + 12.4 * math.sin(a)
            x1, y1 = 32 + 20.6 * math.cos(a), 34 + 20.6 * math.sin(a)
            seam.line([S(x0), S(y0), S(x1), S(y1)], fill=PARCHMENT, width=max(1, int(S(1.1))))

    # --- 불꽃: 아래는 둥글고 위는 뾰족한 물방울 두 겹 ---
    def flame(cx, tip_y, base_y, r, fill):
        cy = base_y - r
        d.ellipse([S(cx - r), S(cy - r), S(cx + r), S(cy + r)], fill=fill)
        d.polygon([(S(cx - r * 0.98), S(cy)), (S(cx), S(tip_y)), (S(cx + r * 0.98), S(cy))], fill=fill)

    flame(32, 27, 48, 5.6, FLAME)
    flame(32, 35, 48, 3.0, FLAME_HI)

    return img.resize((size, size), Image.LANCZOS)


def build_logo(src: Path, out: Path) -> list[Path]:
    """원형 풀 로고를 웹용으로 굽는다.

    원본은 흰 사각 바탕 위에 크림색 원이 얹힌 형태다. 어두운 푸터에 그대로 올리면
    네 귀퉁이가 흰 사각으로 남으므로, 원 바깥을 투명하게 잘라 낸다.
    """
    made = []
    with Image.open(src) as im:
        im = im.convert("RGBA")
        n = min(im.size)

        # 원이 정사각에 내접한다고 보고, 흰 테두리가 비치지 않게 살짝 안쪽으로 자른다
        mask = Image.new("L", (n * 2, n * 2), 0)
        ImageDraw.Draw(mask).ellipse([6, 6, n * 2 - 7, n * 2 - 7], fill=255)
        mask = mask.resize((n, n), Image.LANCZOS)

        sq = im.crop(((im.width - n) // 2, (im.height - n) // 2,
                      (im.width + n) // 2, (im.height + n) // 2))
        sq.putalpha(mask)

        for size in (560, 280):
            p = out / (f"brand-logo{'' if size == 560 else '-sm'}.png")
            sq.resize((size, size), Image.LANCZOS).save(p, optimize=True)
            made.append(p)

        # 공유 카드(카톡·SNS 썸네일) — 어두운 바탕에 로고를 앉힌다.
        # 광원은 동심원을 겹쳐 만든다. 타원 하나를 흐리면 캔버스 밖으로 나간 부분이
        # 하드하게 잘려 사각 자국이 남는다.
        W, H = 1200, 630
        card = Image.new("RGB", (W, H), (20, 16, 13))
        g = Image.new("L", (W, H), 0)
        gd = ImageDraw.Draw(g)
        steps, rmax = 64, 560
        for i in range(steps):
            t = i / (steps - 1)                  # 0 = 바깥, 1 = 중심
            r = rmax * (1 - t)
            gd.ellipse([W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r], fill=int(96 * t))
        g = g.filter(ImageFilter.GaussianBlur(40))
        card = Image.composite(Image.new("RGB", (W, H), (58, 33, 18)), card, g)

        logo = sq.resize((430, 430), Image.LANCZOS)
        card.paste(logo, ((W - 430) // 2, (H - 430) // 2), logo)
        p = out / "og-card.jpg"
        card.save(p, "JPEG", quality=88, optimize=True, progressive=True)
        made.append(p)

    return made


def main() -> int:
    here = Path(__file__).resolve().parent
    root = here.parent

    ap = argparse.ArgumentParser(description="파비콘·앱 아이콘·로고 생성")
    ap.add_argument("--out", type=Path, default=root / "images")
    ap.add_argument("--logo", type=Path, default=root / "images" / "logo.png",
                    help="원형 풀 로고 원본 (없으면 건너뛴다)")
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)

    made = []
    if args.logo.is_file():
        made += build_logo(args.logo, args.out)
    else:
        print(f"  [i] 로고 원본이 없어 건너뜁니다: {args.logo}")

    # 브라우저 탭: 배경 없이 두면 어두운 탭에서 아치가 묻힌다 → 크림 원을 깐다
    for size in (16, 32, 48):
        p = args.out / f"favicon-{size}.png"
        draw_mark(size, bg=True).save(p)
        made.append(p)

    ico = args.out / "favicon.ico"
    draw_mark(64, bg=True).save(ico, sizes=[(16, 16), (32, 32), (48, 48)])
    made.append(ico)

    # iOS 홈 화면 — 투명을 검게 칠하므로 배경 필수
    p = args.out / "apple-touch-icon.png"
    draw_mark(180, bg=True).save(p)
    made.append(p)

    for size in (192, 512):
        p = args.out / f"icon-{size}.png"
        draw_mark(size, bg=True).save(p)
        made.append(p)

    for p in made:
        print(f"  {p.name:<24} {p.stat().st_size / 1024:.1f}KB")
    print(f"\n{len(made)}개 생성 → {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
