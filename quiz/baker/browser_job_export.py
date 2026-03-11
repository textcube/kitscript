from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from prompt_builder import build_prompt_variants, slugify


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def resolve_default_input(script_dir: Path) -> Path:
    return script_dir.parent.parent / "quiz_items.json"


def load_items(path: Path) -> List[Dict[str, Any]]:
    with path.open("r", encoding="utf-8-sig") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("quiz_items.json must be a list")
    return data


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def build_filename(item_slug: str, variant_slug: str, index: int) -> str:
    return f"{item_slug}_{variant_slug}_{index:02d}.png"


def export_jobs(
    items: List[Dict[str, Any]],
    outputs: Path,
    job_limit: int | None = None,
    variants_per_item: int = 4,
) -> Dict[str, Any]:
    ensure_dir(outputs)
    jobs: List[Dict[str, Any]] = []
    remaining = job_limit  # None = no limit

    for item in items:
        if remaining is not None and remaining <= 0:
            break
        item_slug = slugify(str(item.get("id") or item.get("title") or "item"))
        item_dir = outputs / item_slug
        ensure_dir(item_dir)

        variants = build_prompt_variants(item)[:variants_per_item]
        prompt_records = []
        for idx, variant in enumerate(variants, start=1):
            if remaining is not None and remaining <= 0:
                break
            filename = build_filename(item_slug, variant["slug"], idx)
            prompt_records.append(
                {
                    "type": variant["type"],
                    "variant_slug": variant["slug"],
                    "prompt": variant["prompt"],
                    "filename": filename,
                    "status": "pending_browser",
                    "created_at": utc_now_iso(),
                }
            )
            jobs.append(
                {
                    "item_id": item.get("id"),
                    "item_title": item.get("title"),
                    "slug": item_slug,
                    "type": variant["type"],
                    "variant_slug": variant["slug"],
                    "filename": filename,
                    "prompt": variant["prompt"],
                }
            )
            if remaining is not None:
                remaining -= 1

        meta = {
            "item": item,
            "slug": item_slug,
            "generated_at": utc_now_iso(),
            "model": "browser_manual",
            "size": "1024x1024",
            "status": "pending_browser",
            "prompts": prompt_records,
        }
        with (item_dir / "meta.json").open("w", encoding="utf-8-sig") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)

    payload = {
        "generated_at": utc_now_iso(),
        "job_count": len(jobs),
        "jobs": jobs,
    }

    with (outputs / "browser_jobs.json").open("w", encoding="utf-8-sig") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return payload


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Export browser/manual jobs for ChatGPT web image generation")
    parser.add_argument("--input", type=Path, default=resolve_default_input(script_dir), help="Path to quiz_items.json")
    parser.add_argument("--output", type=Path, default=script_dir / "outputs", help="Output directory")
    parser.add_argument("--limit", type=int, default=None, metavar="N", help="Export only first N jobs (e.g. 5 for sample test)")
    parser.add_argument("--variants", type=int, default=4, metavar="N", help="Variants per item (1–4, default 4)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    variants = max(1, min(4, args.variants))
    items = load_items(args.input)
    payload = export_jobs(items, args.output, job_limit=args.limit, variants_per_item=variants)
    print(f"[DONE] browser_jobs.json written: {args.output / 'browser_jobs.json'}")
    print(f"[DONE] job_count={payload['job_count']}" + (f" (limit={args.limit})" if args.limit else "") + f", variants={variants}")


if __name__ == "__main__":
    main()

