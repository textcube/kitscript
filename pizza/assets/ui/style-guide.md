# Pizza UI Style Guide

## Core Palette
- `#1a120b`: Base background (dark oven space)
- `#2d1e12`: Deep wood shadow / panel base
- `#ff9f43`: Primary accent (brand + key progression)
- `#ff6b6b`: Alert accent (danger, hunger urgency)
- `#f8efba`: Parchment highlight
- `#e1d49a`: Parchment midtone
- `#f8efe2`: High-contrast body copy on dark overlays

## Typography
- Primary UI font: `Pretendard`, fallback `Segoe UI`, sans-serif
- Headline emphasis: `900` weight
- UI labels: `700` weight
- Small metadata (order numbers, captions): `11px - 13px`, bold
- Game-over hierarchy:
  - Banner title: `900 70px`
  - Description: `20px`
  - Countdown: `700 24px`

## Texture and Framing Rules
- **Order ticket**
  - Prefer parchment texture image (`parchment_texture.svg`) in clipped ticket shape.
  - Keep ruled lines in low-opacity brown (`rgba(93, 64, 55, 0.12)`).
- **Top header bar**
  - Use wood/oven texture (`header_wood_texture.svg`) with dark overlay (`~25% black`) for legibility.
- **Timer bar**
  - Render dynamic fill only in canvas gradient (`#ff9f43 -> #ff6b6b`).
  - Surround with fixed image frame (`timer_frame.svg`).
- **Game over**
  - Render frame as static art (`gameover_frame.svg`).
  - Keep all textual state dynamic in canvas.

## Status Icons
- Icons live beside each order ticket.
- States:
  - Hungry warning: red/orange warning icon (`icon_hungry.svg`)
  - Satisfied: green check icon (`icon_satisfied.svg`)
  - Leaving: blue directional icon (`icon_leaving.svg`)
- Recommended icon size: `28x28`.

## Motion & FX Notes
- Keep texture elements static to avoid noise.
- Dynamic emphasis should come from:
  - Hunger/timer fill movement
  - Character bob animation
  - Particles and merge effects
