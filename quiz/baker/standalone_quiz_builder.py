from __future__ import annotations

import argparse
import base64
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

from prompt_builder import slugify


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8-sig")


def extract_main_style(source_html: str) -> str:
    m = re.search(r"<style>([\s\S]*?)</style>", source_html)
    if not m:
        raise ValueError("Could not find main <style> block in quiz/index.html")
    return m.group(1).strip()


def extract_arcade_sound_class(source_html: str) -> str:
    m = re.search(r"class ArcadeSound\s*\{[\s\S]*?\n\s*\}\n\n\s*class RetroMenuApp", source_html)
    if not m:
        raise ValueError("Could not extract ArcadeSound class from quiz/index.html")
    block = m.group(0)
    return block.rsplit("class RetroMenuApp", 1)[0].rstrip()


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8-sig") as f:
        return json.load(f)


def to_data_url(image_path: Path) -> str:
    ext = image_path.suffix.lower()
    mime = "image/png"
    if ext in {".jpg", ".jpeg"}:
        mime = "image/jpeg"
    elif ext == ".webp":
        mime = "image/webp"
    elif ext == ".gif":
        mime = "image/gif"

    payload = base64.b64encode(image_path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{payload}"


def choose_image_file(item_slug: str, item_dir: Path, selection: Dict[str, str]) -> Optional[Path]:
    chosen = selection.get(item_slug)
    if chosen:
        p = item_dir / chosen
        if p.exists() and p.is_file():
            return p

    candidates = sorted(item_dir.glob("*.png"))
    if not candidates:
        candidates = sorted(item_dir.glob("*.jpg")) + sorted(item_dir.glob("*.jpeg")) + sorted(item_dir.glob("*.webp"))

    return candidates[0] if candidates else None


def build_quiz_items(
    quiz_items: List[Dict[str, Any]],
    outputs_dir: Path,
    selection: Dict[str, str],
) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []

    for raw in quiz_items:
        title = str(raw.get("title") or raw.get("id") or "UNKNOWN")
        item_slug = slugify(str(raw.get("id") or title))
        item_dir = outputs_dir / item_slug

        image_data_url: Optional[str] = None
        if item_dir.exists() and item_dir.is_dir():
            image_path = choose_image_file(item_slug, item_dir, selection)
            if image_path:
                image_data_url = to_data_url(image_path)

        year = raw.get("year")
        genre = raw.get("genre")
        meta = " / ".join([str(x) for x in [year, genre] if x not in (None, "")]).strip() or "UNKNOWN"

        quiz_item = {
            "id": item_slug,
            "name": title,
            "cat": "GAME",
            "price": str(year) if year else "",
            "desc": str(raw.get("description") or ""),
            "hint": str(raw.get("hint") or ""),
            "meta": meta,
            "size": "large",
            "image": image_data_url,
        }
        results.append(quiz_item)

    return results


def build_standalone_html(
    css: str,
    arcade_sound_class: str,
    store_name: str,
    shop_url: str,
    countdown: int,
    reveal: int,
    items: List[Dict[str, Any]],
) -> str:
    items_json = json.dumps(items, ensure_ascii=False)
    config_json = json.dumps({"countdown": countdown, "reveal": reveal}, ensure_ascii=False)

    return f"""<!DOCTYPE html>
<html lang=\"ko\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>{store_name} - STANDALONE QUIZ</title>
    <link href=\"https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap\" rel=\"stylesheet\">
    <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/NeoDunggeunmo.css\">
    <style>{css}
        #quizPlayer {{ display: flex; position: static; height: calc(100vh - 60px); overflow-x: hidden; }}
        .standalone-header {{
            height: 60px; background: #000; border-bottom: 2px solid #333;
            display: flex; justify-content: space-between; align-items: center;
            padding: 0 30px; position: relative; z-index: 100;
        }}
    </style>
</head>
<body>
    <div id=\"flashOverlay\" class=\"reveal-flash-screen\"></div>
    <header class=\"standalone-header\">
        <div class=\"header-title\">{store_name}</div>
        <a href=\"{shop_url}\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"header-home\"><svg viewBox=\"0 0 24 24\"><path d=\"M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z\"/></svg></a>
    </header>
    <div id=\"quizPlayer\">
        <div class=\"quiz-card\" id=\"quizCard\">
            <div style=\"display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:5px;\">
                <div style=\"font-size:8px; color:var(--neon-blue);\">QUIZ</div>
                <div id=\"quizIndex\" style=\"font-size:8px; color:#444;\">STAGE 00/00</div>
            </div>
            <div class=\"quiz-countdown-wrapper\"><div id=\"quizCountdownDisplay\" class=\"quiz-countdown-display\">00</div></div>
            <div id=\"quizMedia\" class=\"quiz-image-box\"></div>
            <div id=\"quizAnswerZone\" class=\"quiz-answer-zone\">
                <div class=\"ans-side-info\">
                    <div id=\"ansName\" class=\"ans-name\"></div>
                    <div id=\"ansMeta\" class=\"ans-meta\"></div>
                </div>
                <div id=\"ansDesc\" class=\"ans-main-desc\"></div>
            </div>
        </div>
        <div style=\"margin-top:15px; display:flex; gap:10px;\">
            <button class=\"btn\" onclick=\"location.reload()\">RESTART</button>
            <button class=\"btn\" id=\"nextBtn\">SKIP</button>
            <button id=\"soundToggleBtn\" class=\"btn\">SOUND: OFF</button>
        </div>
    </div>
    <script>
        const items = {items_json};
        const config = {config_json};
        {arcade_sound_class}

        const sound = new ArcadeSound();
        let activeIndex = 0;
        let timerId = null;
        let intervalId = null;
        const shuffled = [...items].sort(() => Math.random() - 0.5);

        function updateCountdownUI(count) {{
            const el = document.getElementById('quizCountdownDisplay');
            if (!el) return;
            el.innerText = count.toString().padStart(2, '0');
            el.classList.remove('count-slam');
            void el.offsetWidth;
            el.classList.add('count-slam');
            if (count <= 3 && count > 0) {{
                el.classList.add('warning');
                sound.playWarning();
            }} else {{
                el.classList.remove('warning');
                sound.playTick();
            }}
        }}

        function revealAnswer(item) {{
            document.getElementById('ansName').innerText = (item.name || '').toUpperCase();
            document.getElementById('ansMeta').innerText = item.meta || 'UNKNOWN';
            document.getElementById('ansDesc').innerText = item.desc || '';
            document.getElementById('flashOverlay').classList.add('active-flash');
            document.getElementById('quizCard').classList.add('shake');
            document.getElementById('quizAnswerZone').classList.add('reveal');
            sound.playReveal();
            timerId = setTimeout(() => {{
                activeIndex += 1;
                runLoop();
            }}, (Number(config.reveal) || 3) * 1000);
            setTimeout(() => document.getElementById('flashOverlay').classList.remove('active-flash'), 400);
        }}

        function renderMedia(item) {{
            const media = document.getElementById('quizMedia');
            if (!media) return;
            if (item.image) {{
                media.innerHTML = '<img alt="quiz" src="' + item.image + '">';
            }} else {{
                media.innerHTML = '<div class="big-hint-label">MISSION_HINT</div><div class="big-hint-text">' + (item.hint || 'NO HINT') + '</div>';
            }}
        }}

        function runLoop() {{
            if (!shuffled.length) return;
            if (activeIndex >= shuffled.length) activeIndex = 0;
            const item = shuffled[activeIndex];

            document.getElementById('quizAnswerZone').classList.remove('reveal');
            document.getElementById('quizCard').classList.remove('shake');
            document.getElementById('quizIndex').innerText = 'STAGE ' + (activeIndex + 1).toString().padStart(2, '0') + '/' + shuffled.length.toString().padStart(2, '0');
            renderMedia(item);

            let count = Number(config.countdown) || 5;
            updateCountdownUI(count);
            clearInterval(intervalId);
            intervalId = setInterval(() => {{
                count -= 1;
                updateCountdownUI(count);
                if (count <= 0) {{
                    clearInterval(intervalId);
                    revealAnswer(item);
                }}
            }}, 1000);
        }}

        document.getElementById('nextBtn').onclick = () => {{
            clearTimeout(timerId);
            clearInterval(intervalId);
            activeIndex += 1;
            runLoop();
        }};

        document.getElementById('soundToggleBtn').onclick = (e) => {{
            sound.enabled = !sound.enabled;
            e.target.innerText = 'SOUND: ' + (sound.enabled ? 'ON' : 'OFF');
            if (sound.enabled) e.target.classList.add('active-blue');
            else e.target.classList.remove('active-blue');
        }};

        window.onload = runLoop;
    </script>
</body>
</html>
"""


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Build standalone quiz page from quiz_items.json + baked outputs")
    parser.add_argument("--quiz-source", type=Path, default=script_dir.parent / "index.html", help="Path to quiz/index.html")
    parser.add_argument("--items", type=Path, default=script_dir.parent.parent / "quiz_items.json", help="Path to quiz_items.json")
    parser.add_argument("--outputs", type=Path, default=script_dir / "outputs", help="Path to generated image outputs")
    parser.add_argument("--selection", type=Path, default=script_dir / "selected_images.json", help="Optional selected image mapping JSON")
    parser.add_argument("--store-name", default="RETRO GAME FACTORY", help="Standalone header/store name")
    parser.add_argument("--shop-url", default="https://kitscript.com/game/quiz/", help="Home/shop URL")
    parser.add_argument("--countdown", type=int, default=5, help="Countdown seconds")
    parser.add_argument("--reveal", type=int, default=3, help="Answer reveal seconds")
    parser.add_argument("--output-file", type=Path, default=script_dir / "standalone" / "retro-quiz-standalone.html", help="Output standalone HTML path")
    parser.add_argument("--write-report", action="store_true", help="Write build report JSON next to output")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    source_html = read_text(args.quiz_source)
    css = extract_main_style(source_html)
    arcade_sound = extract_arcade_sound_class(source_html)

    quiz_items = load_json(args.items)
    if not isinstance(quiz_items, list):
        raise ValueError("quiz_items.json must be a list")

    selection: Dict[str, str] = {}
    if args.selection.exists():
        sel_raw = load_json(args.selection)
        if isinstance(sel_raw, dict):
            selection = {str(k): str(v) for k, v in sel_raw.items()}

    baked_items = build_quiz_items(quiz_items, args.outputs, selection)
    html_text = build_standalone_html(
        css=css,
        arcade_sound_class=arcade_sound,
        store_name=args.store_name,
        shop_url=args.shop_url,
        countdown=args.countdown,
        reveal=args.reveal,
        items=baked_items,
    )

    write_text(args.output_file, html_text)
    print(f"[DONE] Standalone quiz written: {args.output_file}")
    print(f"[INFO] Items embedded: {len(baked_items)}")

    if args.write_report:
        report = {
            "output_file": str(args.output_file),
            "items": len(baked_items),
            "countdown": args.countdown,
            "reveal": args.reveal,
            "store_name": args.store_name,
            "shop_url": args.shop_url,
        }
        report_path = args.output_file.with_suffix(".build.json")
        write_text(report_path, json.dumps(report, ensure_ascii=False, indent=2))
        print(f"[DONE] Build report: {report_path}")


if __name__ == "__main__":
    main()

