from __future__ import annotations

import re
import unicodedata
from typing import Any, Dict, List

NEGATIVE_CONSTRAINTS = (
    "No text, no letters, no logo, no watermark, no brand marks, no title words, "
    "no readable UI labels."
)

# 브라우저/웹에서 사용 시 ChatGPT가 디테일 질문 없이 바로 이미지를 생성하도록 강제
IMMEDIATE_IMAGE_INSTRUCTION = (
    " Generate the image now. Do not ask for clarification, style choices, or details. "
    "Do not reply with text first—output only the image(s)."
)


def slugify(value: str) -> str:
    """Convert text into a filesystem-safe slug."""
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "item"


def _join_keywords(item: Dict[str, Any]) -> str:
    keywords = item.get("visual_keywords") or []
    if not isinstance(keywords, list):
        return ""
    clean = [str(x).strip() for x in keywords if str(x).strip()]
    return ", ".join(clean)


def _base_context(item: Dict[str, Any]) -> str:
    title = item.get("title", "Unknown Game")
    year = item.get("year", "unknown year")
    genre = item.get("genre", "game")
    hint = item.get("hint", "")
    description = item.get("description", "")
    visual_keywords = _join_keywords(item)

    lines = [
        f"Game reference context: title={title}, year={year}, genre={genre}.",
        f"Core scene description: {description}",
    ]
    if hint:
        lines.append(f"Quiz hint context: {hint}")
    if visual_keywords:
        lines.append(f"Visual motifs: {visual_keywords}")
    return " ".join(lines)


def build_prompt_variants(item: Dict[str, Any]) -> List[Dict[str, str]]:
    """Build four prompt variants for one quiz item."""
    base = _base_context(item)
    immediate = IMMEDIATE_IMAGE_INSTRUCTION

    action_prompt = (
        f"{base} "
        "Create a dynamic gameplay-like action scene in retro arcade spirit, with strong motion, "
        "clear player-vs-threat composition, cinematic lighting, and sharp silhouette readability. "
        "Square 1:1 composition, high detail, game art style. "
        f"{NEGATIVE_CONSTRAINTS}"
        f"{immediate}"
    )

    mood_prompt = (
        f"{base} "
        "Create a mood-focused atmospheric scene inspired by this game world: environmental storytelling, "
        "dramatic color palette, depth, and tension. Keep it evocative and less literal than gameplay. "
        "Square 1:1 composition, polished digital illustration. "
        f"{NEGATIVE_CONSTRAINTS}"
        f"{immediate}"
    )

    focus_prompt = (
        f"{base} "
        "Create an object/character focus composition: one iconic-like subject in foreground, "
        "supporting background elements for context, strong contrast, minimal clutter. "
        "Square 1:1 composition, stylized concept art look. "
        f"{NEGATIVE_CONSTRAINTS}"
        f"{immediate}"
    )

    # Intentionally indirect: avoids direct title/logo/UI recreation while keeping solvable clues.
    hint_prompt = (
        "Create an indirect quiz-hint image inspired by this game concept without directly revealing the answer. "
        f"Use mechanics and atmosphere from this context: {item.get('description', '')} "
        "Prefer symbolic cues, scene metaphor, and recognizable rhythm of play, "
        "but avoid exact trademarked character/logo reproduction. "
        "Square 1:1 composition, readable silhouette, medium complexity. "
        f"{NEGATIVE_CONSTRAINTS}"
        f"{immediate}"
    )

    return [
        {"type": "action", "slug": "action", "prompt": action_prompt},
        {"type": "mood", "slug": "mood", "prompt": mood_prompt},
        {"type": "focus", "slug": "focus", "prompt": focus_prompt},
        {"type": "hint", "slug": "hint", "prompt": hint_prompt},
    ]
