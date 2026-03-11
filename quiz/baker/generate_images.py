from __future__ import annotations

import argparse
import base64
import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from prompt_builder import build_prompt_variants, slugify


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def resolve_default_input(script_dir: Path) -> Path:
    repo_root = script_dir.parent.parent
    return repo_root / "quiz_items.json"


def load_items(path: Path) -> List[Dict[str, Any]]:
    with path.open("r", encoding="utf-8-sig") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("quiz_items.json must be a list of objects")
    return data


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, payload: Any) -> None:
    with path.open("w", encoding="utf-8-sig") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def _download_bytes(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=90) as resp:
        return resp.read()


def generate_image_bytes(
    api_key: str,
    model: str,
    prompt: str,
    size: str,
    retries: int,
    sleep_seconds: float,
) -> Tuple[Optional[bytes], Optional[str], int]:
    last_error: Optional[str] = None

    for attempt in range(1, retries + 1):
        try:
            payload = json.dumps(
                {
                    "model": model,
                    "prompt": prompt,
                    "size": size,
                }
            ).encode("utf-8")
            request = urllib.request.Request(
                "https://api.openai.com/v1/images/generations",
                data=payload,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )

            with urllib.request.urlopen(request, timeout=180) as response:
                data = json.loads(response.read().decode("utf-8"))

            item = (data.get("data") or [None])[0]
            if not item:
                last_error = "No image data returned from API"
            elif item.get("b64_json"):
                return base64.b64decode(item["b64_json"]), None, attempt
            elif item.get("url"):
                return _download_bytes(item["url"]), None, attempt
            else:
                last_error = "No b64_json/url field in image response"
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="ignore")
            last_error = f"HTTP {exc.code}: {body}"
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)

        if attempt < retries:
            time.sleep(sleep_seconds * attempt)

    return None, last_error, retries


def build_filename(item_slug: str, variant_slug: str, index: int) -> str:
    return f"{item_slug}_{variant_slug}_{index:02d}.png"


def process_item(
    api_key: str,
    item: Dict[str, Any],
    output_root: Path,
    model: str,
    size: str,
    retries: int,
    sleep_seconds: float,
) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    item_slug = slugify(str(item.get("id") or item.get("title") or "item"))
    item_dir = output_root / item_slug
    ensure_dir(item_dir)

    prompts = build_prompt_variants(item)
    records: List[Dict[str, Any]] = []
    failures: List[Dict[str, Any]] = []

    for idx, variant in enumerate(prompts, start=1):
        filename = build_filename(item_slug, variant["slug"], idx)
        file_path = item_dir / filename

        rec: Dict[str, Any] = {
            "type": variant["type"],
            "variant_slug": variant["slug"],
            "prompt": variant["prompt"],
            "filename": filename,
            "status": "pending",
            "created_at": utc_now_iso(),
            "attempts": 0,
            "error": None,
            "skipped": False,
        }

        if file_path.exists():
            rec["status"] = "success"
            rec["skipped"] = True
            rec["note"] = "already_exists"
            records.append(rec)
            print(f"[SKIP] {item_slug} -> {filename} already exists")
            continue

        print(f"[GEN ] {item_slug} -> {filename}")
        image_bytes, err, attempts = generate_image_bytes(
            api_key=api_key,
            model=model,
            prompt=variant["prompt"],
            size=size,
            retries=retries,
            sleep_seconds=sleep_seconds,
        )
        rec["attempts"] = attempts

        if image_bytes is None:
            rec["status"] = "failed"
            rec["error"] = err
            failures.append(
                {
                    "item_id": item.get("id"),
                    "slug": item_slug,
                    "variant": variant["type"],
                    "filename": filename,
                    "error": err,
                    "timestamp": utc_now_iso(),
                }
            )
            print(f"[FAIL] {item_slug} -> {filename}: {err}")
        else:
            file_path.write_bytes(image_bytes)
            rec["status"] = "success"
            print(f"[ OK ] {item_slug} -> {filename}")

        records.append(rec)

    statuses = [r["status"] for r in records]
    if statuses and all(s == "success" for s in statuses):
        overall_status = "success"
    elif any(s == "success" for s in statuses):
        overall_status = "partial"
    else:
        overall_status = "failed"

    meta = {
        "item": item,
        "slug": item_slug,
        "generated_at": utc_now_iso(),
        "model": model,
        "size": size,
        "status": overall_status,
        "prompts": records,
    }
    write_json(item_dir / "meta.json", meta)

    return meta, failures


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent

    parser = argparse.ArgumentParser(description="Generate quiz image batches from quiz_items.json")
    parser.add_argument("--input", type=Path, default=resolve_default_input(script_dir), help="Path to quiz_items.json")
    parser.add_argument("--output", type=Path, default=script_dir / "outputs", help="Output directory")
    parser.add_argument("--model", default="gpt-image-1", help="OpenAI image model")
    parser.add_argument("--size", default="1024x1024", help="Image size, e.g., 1024x1024")
    parser.add_argument("--retries", type=int, default=3, help="Retries per image")
    parser.add_argument("--retry-sleep", type=float, default=2.0, help="Base sleep seconds between retries")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    ensure_dir(args.output)

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    if not args.input.exists():
        raise FileNotFoundError(f"Input file not found: {args.input}")

    items = load_items(args.input)
    print(f"[INFO] Loaded {len(items)} items from {args.input}")
    print(f"[INFO] Output dir: {args.output}")

    all_meta: List[Dict[str, Any]] = []
    all_failures: List[Dict[str, Any]] = []

    for item in items:
        meta, failures = process_item(
            api_key=api_key,
            item=item,
            output_root=args.output,
            model=args.model,
            size=args.size,
            retries=args.retries,
            sleep_seconds=args.retry_sleep,
        )
        all_meta.append(meta)
        all_failures.extend(failures)

    write_json(args.output / "failed.json", all_failures)
    write_json(args.output / "run_summary.json", {"generated_at": utc_now_iso(), "items": all_meta})

    print(f"[DONE] Completed {len(items)} items")
    print(f"[DONE] failed.json entries: {len(all_failures)}")


if __name__ == "__main__":
    main()

