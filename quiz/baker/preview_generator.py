from __future__ import annotations

import argparse
import html
import json
from pathlib import Path
from typing import Any, Dict, List


def load_meta(meta_path: Path) -> Dict[str, Any]:
    with meta_path.open("r", encoding="utf-8-sig") as f:
        return json.load(f)


def collect_cards(outputs_dir: Path) -> List[Dict[str, Any]]:
    cards: List[Dict[str, Any]] = []

    for item_dir in sorted(outputs_dir.iterdir() if outputs_dir.exists() else []):
        if not item_dir.is_dir() or item_dir.name == "preview":
            continue

        meta_path = item_dir / "meta.json"
        meta = load_meta(meta_path) if meta_path.exists() else {}

        title = (meta.get("item") or {}).get("title") or item_dir.name
        item_id = (meta.get("item") or {}).get("id") or item_dir.name
        status = meta.get("status", "unknown")

        images = []
        prompt_records = meta.get("prompts") or []
        for rec in prompt_records:
            if rec.get("status") != "success":
                continue
            filename = rec.get("filename")
            if not filename:
                continue
            img_path = item_dir / filename
            if not img_path.exists():
                continue
            images.append(
                {
                    "filename": filename,
                    "type": rec.get("type", "unknown"),
                    "src": f"../{item_dir.name}/{filename}",
                }
            )

        if not images:
            for img in sorted(item_dir.glob("*.png")):
                images.append(
                    {
                        "filename": img.name,
                        "type": "image",
                        "src": f"../{item_dir.name}/{img.name}",
                    }
                )

        cards.append(
            {
                "title": title,
                "item_id": item_id,
                "status": status,
                "folder": item_dir.name,
                "images": images,
            }
        )

    return cards


def render_html(cards: List[Dict[str, Any]]) -> str:
    blocks: List[str] = []

    for card in cards:
        image_blocks: List[str] = []
        for img in card["images"]:
            image_blocks.append(
                f"""
                <figure class=\"thumb\">
                  <img src=\"{html.escape(img['src'])}\" loading=\"lazy\" alt=\"{html.escape(img['filename'])}\" />
                  <figcaption>{html.escape(img['filename'])} <span class=\"tag\">{html.escape(img['type'])}</span></figcaption>
                </figure>
                """
            )

        blocks.append(
            f"""
            <section class=\"card\">
              <header>
                <h2>{html.escape(str(card['title']))}</h2>
                <div class=\"meta\">id: {html.escape(str(card['item_id']))} | folder: {html.escape(card['folder'])} | status: {html.escape(card['status'])}</div>
              </header>
              <div class=\"grid\">{''.join(image_blocks) or '<div class="empty">No images</div>'}</div>
            </section>
            """
        )

    return f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Quiz Image Preview</title>
  <style>
    :root {{ --bg:#0f1115; --panel:#181c22; --text:#eef2f7; --muted:#9aa4b2; --accent:#4cc9f0; }}
    body {{ margin:0; font-family:Segoe UI, Arial, sans-serif; background:var(--bg); color:var(--text); }}
    .wrap {{ max-width:1400px; margin:24px auto; padding:0 16px; }}
    h1 {{ margin:0 0 16px; font-size:24px; }}
    .card {{ background:var(--panel); border:1px solid #2b3440; border-radius:12px; padding:14px; margin-bottom:16px; }}
    .meta {{ color:var(--muted); font-size:13px; margin-top:4px; }}
    .grid {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:12px; margin-top:12px; }}
    .thumb {{ margin:0; background:#101419; border:1px solid #2b3440; border-radius:10px; overflow:hidden; }}
    .thumb img {{ width:100%; aspect-ratio:1/1; object-fit:cover; display:block; }}
    figcaption {{ font-size:12px; color:#d6dde7; padding:8px; line-height:1.4; word-break:break-all; }}
    .tag {{ color:var(--accent); margin-left:6px; }}
    .empty {{ color:var(--muted); font-size:13px; padding:8px; }}
  </style>
</head>
<body>
  <main class=\"wrap\">
    <h1>Quiz Image Preview</h1>
    <p>Generated items: {len(cards)}</p>
    {''.join(blocks) if blocks else '<p>No generated outputs found.</p>'}
  </main>
</body>
</html>"""


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Build preview HTML for generated quiz images")
    parser.add_argument("--outputs", type=Path, default=script_dir / "outputs", help="Generated outputs root")
    parser.add_argument("--preview", type=Path, default=script_dir / "outputs" / "preview", help="Preview output folder")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    args.preview.mkdir(parents=True, exist_ok=True)

    cards = collect_cards(args.outputs)
    html_text = render_html(cards)

    index_path = args.preview / "index.html"
    index_path.write_text(html_text, encoding="utf-8-sig")
    print(f"[DONE] Preview written: {index_path}")


if __name__ == "__main__":
    main()

