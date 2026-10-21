# Eternal Invasion: Pizza Edition

A pixel-art merge game set in a wood-fired pizza shop. Drag matching pizzas together on a 5x5 counter to bake bigger recipes while undead customers (zombie, ghost, skeleton, dracula, mummy, witch, frankenstein, pumpkin, imp) queue up with orders. Serve them before they starve or the kitchen falls to an undead riot.

The player merges by dragging one pizza onto a matching one, or by tapping one and then the other. Orders are served automatically once a matching pizza is on the board. Keyboard: Space/Enter starts or retries, P/Esc pauses.

## Current Build

- Entry file: `pizza/index.html`
- No build step
- No backend
- Canvas 2D at a fixed 960x640 logical resolution, DPR-aware backing store
- Responsive: the canvas scales down to fit the viewport (header wraps on narrow screens)
- Default artwork: local `pixelart/pizza.js`, `pixelart/pizza.css`, and `pixelart/ui.js`; no image downloads or build step
- Legacy SVG artwork remains under `assets/` as a fallback if the pixel renderer is unavailable

## Pixel-Art Design

The default renderer draws into a 480x320 pixel buffer and presents it at the game's existing 960x640 logical size with smoothing disabled. It also draws the title, pause and results cards, lives, combo ribbon, drag preview and merge-target outlines.

On viewports narrower than 600px, a 284x454 portrait composition puts the board above four compact customer cards with recipe thumbnails and hunger meters. The canvas fits the available height in either orientation.

- Warm brick oven, flickering block flames, animated chef, wooden worktop, and tiled shop floor.
- Ten distinct 32px pizza recipes, from scored dough to a fully topped masterpiece, with numbered level badges.
- Nine original customer sprites, each with waiting, angry, and satisfied expressions. Paper tickets show recipe thumbnails and stepped hunger meters.
- Bitmap text, square frames, pixel button icons, revenue and bake meters, and a pixel game-over card.
- Refined artwork uses integer-scanline silhouettes, shaded crusts and recipe-specific toppings instead of stacking every ingredient. Dark sage work surfaces separate the pizzas from the walnut counter. Customer faces have eye highlights, expressive mouths, layered clothing, and distinct ghost/monster silhouettes. Brass runners, an illuminated shop sign, and clipped red-header order tickets complete the shop skin.
- Reduced-motion preference stops decorative chef, flame, and customer bobbing while keeping gameplay feedback visible.

All active pixel artwork is generated locally from code. `pixelart/ui.js` is a bundled copy of the repository's UI kit for the bitmap font and header icons. The game does not load the shared parent `pixelart/` folder, exported sprite sheets, or legacy images in pixel mode. Copy the complete `pizza/` folder to run it independently.

The sections below also describe the retained legacy renderer and asset pipeline.

## Game Loop

1. The page opens in a demo: a glove cursor plays like a person, pausing to think, then picking up a pizza and dragging it onto a match. It favours the recipe the hungriest guest is waiting for and otherwise tidies up small pizzas, with some randomness. The demo restarts itself when it loses and never touches the best score. Any tap or key leaves the demo for the title card. Idling 10 s on the title card or 15 s on the results card returns to the demo.
   The title card explains the rules; tap (or press Space) to open the kitchen.
2. The 5x5 grid starts with 12 dough balls; a new dough is baked every 2.5 seconds into an empty cell.
3. Drag a pizza onto an equal one to merge it one level up (max 10). Dropping on an empty cell moves it; dropping on a different pizza swaps them.
4. Undead guests queue up (up to 4) with 1-2 orders. Order levels start at 2-3 and reach up to 8 as the night goes on; guests also arrive faster and get hungry sooner.
5. A matching pizza on the board is served automatically for `level x 400`. Serving again within 4 seconds builds a combo worth +20% per step, up to x2.
6. A guest whose hunger reaches 100 storms out and costs one of 3 lives. Losing the last life ends the run.
7. The results card shows revenue, time survived and the best revenue (saved in localStorage); tap to play again. The game pauses when the tab is hidden.

## Main Systems

### Merge AI (`processTurn`)

No longer called: merging is now the player's job (`playMove` and the pointer handlers in `index.html`). The function is kept for reference.

- Scans tiles from highest level down.
- For each tile, finds the nearest same-level tile (Manhattan distance).
- Adjacent pair → merge animation (level +1, flame particles).
- Distant pair → the partner walks one step closer through an empty cell.
- One action per turn, so the board resolves visibly instead of instantly.

### Pizza Chain

10 levels defined in `PIZZA_DATA` (Flour Dough → Oksu Masterpiece), each with an SVG sprite (`assets/items/pizza_lv1-10.svg`) and a fully procedural canvas fallback that layers toppings by level.

### Customers

- 9 archetypes in `UNDEAD_ARCHETYPES` with per-type palettes and silhouettes: zombie, dracula, ghost, skeleton, mummy, witch, frankenstein, pumpkin, imp.
- Three animation states: `idle`, `angry` (hunger > 72), `happyLeaving`.
- Sprite resolution order per state: SVG asset → procedural layered sprite sheet → vector fallback drawing.
- Queue positions re-pack smoothly when a customer leaves.
- Hunger growth accelerates with elapsed game time (`0.35 + gameTime / 600` per second).

### Undeath Roster Sprites (`assets/undeath/`)

Five archetypes (mummy, witch, frankenstein, pumpkin, imp), 3 states each, sourced from a design pass over `sopraknight/samples/undeath/` — 18 chibi character turnarounds. That folder mixes original monster archetypes with sprites that trace recognizable, trademarked horror-movie characters (Chucky/Child's Play, Ghostface/Scream, Michael Myers/Halloween, Jason Voorhees/Friday the 13th, Freddy Krueger/Nightmare on Elm Street, Predator). Those six were excluded; only the generic-archetype designs (skeleton, zombie, mummy, dracula, witch, pumpkin-scarecrow, imp) informed the new sprites, and every SVG here is an original drawing in the pizza game's own vector style (160x160, flat cel shading, black outlines) — not a trace or recolor of the source images. `assets/staff/` holds a chef and a waiter sprite from the same source pass, kept separate since they aren't undead and aren't wired into the live game (which already draws its own procedural chef).

### Order Tickets

Each waiting customer renders a parchment ticket with order thumbnails, an `ORDER #`, a hunger bar, and a status icon (ok / hungry-warning / leaving) drawn from `assets/ui/icon_*.svg` with a vector fallback.

### Asset Pipeline

`ASSET_MANIFEST` lists every asset with `webp` and `png` paths; the loader tries WebP → PNG → SVG (derived from the WebP path). Only SVG files ship today, so the chain always lands on SVG. A loading screen tracks progress, and every asset class has a procedural fallback so the game renders even with all assets missing.

### Sound

Web Audio oscillator SFX for move / merge / serve. Off by default; toggled from the page header.

## Recent Fixes

- `initGeneratedSprites()` was defined but never called — particle sprites (cheese, flame, smoke) and the layered zombie sheets never existed, so particles rendered as plain circles. Now initialized before asset loading.
- `parchment`, `headerTexture`, `timerFrame`, and `gameoverFrame` were referenced by the draw code but missing from `ASSET_MANIFEST`, so the shipped SVGs were never loaded. Added a `ui` manifest section.
- Status icons now use the shipped `icon_hungry/leaving/satisfied.svg` art (previously drawn ad hoc).
- The `assets/ui/*.svg` files had no `width`/`height` attributes, which breaks canvas `drawImage` in some browsers (notably Firefox). Intrinsic sizes added.
- The canvas was fixed at 960px and overflowed small screens; it now scales to fit the viewport.

## Visual Overhaul

- **Wood-fired oven**: a brick arch with animated, flickering flames now sits behind the chef, with a pulsing mouth glow and embers rising through the header band.
- **Scene layer** (cached offscreen): wood-plank floor shading, dashed queue floor markers, and a re-skinned counter — wood-grain gradient, flour dusting, gold trim, and double-rimmed cell wells.
- **Lighting**: two gently flickering warm light pools over the counter and the queue, plus a global vignette that frames the scene.
- **Tile decor**: level badges on every pizza from level 2 up (gold at level 10), steam wisps rising from freshly baked level 7+ pizzas, and a rotating sparkle on the level-10 masterpiece.
- **Delivery flight**: served pizzas fly in an arc from the counter to the customer's ticket; revenue, particles, and the success sound land on arrival.
- **Customer entrance**: customers walk in from off-screen right and only place their order once seated.

## Header Redesign

- **Brand mark**: `BUNTGAMES` now sits next to a wood-and-gold badge with a pizza-slice glyph, replacing the bare text logo.
- **Icon buttons**: Sound/Homepage/YouTube switched from text pills (`Sound: OFF`, `Homepage`, `YouTube`) to square icon buttons matching the `icon-btn` pattern used in `sopraknight` and `album`, with the sound button showing a distinct on/off glyph and a cyan active glow.
- **Stat plaques**: the revenue readout and the "NEXT BAKE" merge-timer gauge (next to the chef) now share one `drawHeaderPlaque()` painter — same wood-gradient panel, gold trim, and inner highlight — instead of one being bare text and the other a floating bordered box. The timer plaque also gained a small flickering flame icon to tie it to the oven.

## Known Issues / Design Notes

- Every asset load tries WebP and PNG first, producing two 404s per asset (~50 failed requests at startup). Harmless but noisy; ship WebP files or reorder the candidate list to fix.
- Orders only request levels 1-5, so levels 6-10 exist purely as merge-chain spectacle — high pizzas accumulate and occupy board space with no sink.
- Revenue (gold) is displayed but never spent; there is no score persistence or high-score memory.
- There is no player interaction with the board — intentional for a demo loop, but the merge grid is naturally clickable.
- Difficulty is a single hunger-rate ramp; no wave structure or pacing beats.
- No game-over or customer-arrival sound.

## Improvements

### Gameplay

- Add a manual mode: drag a tile onto a same-level tile to merge instantly, with auto mode as the default demo (mirrors the auto/manual toggle pattern used in `sopraknight`).
- Give levels 6-10 a purpose: VIP customers that order high tiers for outsized revenue, or auto-sell top-level pizzas for a burst of gold.
- Spend revenue: upgrades between runs (faster merge turn, slower hunger, extra queue slot).
- Wave pacing: calm/rush cycles instead of a single linear ramp, with a lane-style warning before rush hour.

### Visuals

Shipped in the visual overhaul (see below): oven ambience, merge flash, customer entrance, delivery flight, scene relighting, level badges. Remaining ideas:

- Animated chef sprite frames (kneading / peel motion) to replace the procedural overlay.
- Customer reaction pop (heart / music note) when a delivery lands.
- Seasonal reskin hooks (palette + background swap).

### Audio

- Game-over sting and customer-arrival chime.
- Low simmering ambience loop while sound is on.

### Code Structure

Single-file prototype by design. If it grows, split along the existing seams:

- `engine/grid.js` (merge AI, spawn)
- `engine/customers.js`
- `render/draw.js` (item/chef/customer painters and fallbacks)
- `render/particles.js`
- `data/pizzas.js`, `data/undead.js`

For now, keep the single-file version easy to copy and deploy.
