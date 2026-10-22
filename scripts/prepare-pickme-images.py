"""Resize generated menu covers and verify every route has both deliverables.

Usage: python scripts/prepare-pickme-images.py path/to/generated-manifest.json
Manifest entries: {"id": "city", "source": "...png", "prompt": "..."}.
Requires Pillow. Generation itself uses the built-in image tool.
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1] / 'pickme'
entries = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
representatives = root / 'images' / 'representatives'
thumbnails = root / 'images' / 'thumbnails'
representatives.mkdir(parents=True, exist_ok=True)
thumbnails.mkdir(parents=True, exist_ok=True)
ledger = []
for entry in entries:
    slug = entry['id']
    if not slug or any(c not in 'abcdefghijklmnopqrstuvwxyz0123456789-' for c in slug):
        raise ValueError(f'Invalid image ID: {slug}')
    with Image.open(entry['source']) as source:
        cover = ImageOps.fit(source.convert('RGB'), (1080, 1080), method=Image.Resampling.LANCZOS)
        cover.save(representatives / f'{slug}.webp', 'WEBP', quality=93, method=6)
        cover.resize((256, 256), Image.Resampling.LANCZOS).save(thumbnails / f'{slug}.webp', 'WEBP', quality=85, method=6)
    ledger.append({
        'id': slug, 'prompt': entry['prompt'], 'mode': 'built-in imagegen',
        'representative': f'representatives/{slug}.webp', 'representativeSize': [1080, 1080],
        'thumbnail': f'thumbnails/{slug}.webp', 'thumbnailSize': [256, 256],
    })
(root / 'images' / 'prompts.json').write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
routes = json.loads((root / 'routes.json').read_text(encoding='utf-8'))
for route in routes:
    path = root / route['image']
    with Image.open(path) as image:
        assert image.size == (256, 256), path
    with Image.open(representatives / path.name) as image:
        assert image.size == (1080, 1080), path
sheet = Image.new('RGB', (7 * 160, 7 * 184), '#101018')
draw = ImageDraw.Draw(sheet)
for index, entry in enumerate(entries):
    x, y = (index % 7) * 160, (index // 7) * 184
    with Image.open(thumbnails / f"{entry['id']}.webp") as image:
        sheet.paste(image.resize((152, 152)), (x + 4, y + 4))
    draw.text((x + 4, y + 160), entry['id'], fill='white')
sheet.save(root / 'images' / 'contact-sheet.jpg', quality=90)
print(f'Validated {len(routes)} representative images and thumbnails.')
