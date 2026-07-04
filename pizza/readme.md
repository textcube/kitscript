# Eternal Invasion: Pizza Edition

A single-file, auto-playing merge game set in a wood-fired pizza shop. Pizzas merge and level up on a 5x5 counter grid while undead customers (zombie, ghost, skeleton, dracula) queue up with orders. Serve them before their hunger peaks or the kitchen falls to an undead riot.

The game plays itself — it is a zero-input demo loop in the same spirit as the other kitscript modules, with sound as the only user control.

## Current Build

- Entry file: `pizza/index.html`
- No build step
- No backend
- Canvas 2D at a fixed 960x640 logical resolution, DPR-aware backing store
- Responsive: the canvas scales down to fit the viewport (header wraps on narrow screens)
- All shipped art is SVG under `pizza/assets/`, organized by category with `PROMPTS.txt` regeneration notes and a shared `STYLE_GUIDE.txt`

## Game Loop

1. The 5x5 grid starts full of level-1 dough tiles.
2. Every 2 seconds the merge turn runs; every 4 seconds a new dough spawns in an empty cell.
3. Undead customers join the queue (up to 4 waiting) with 1-2 order items of levels 1-5.
4. When the grid holds a pizza matching an order item, it is served automatically: revenue increases by `level x 400` and the item is consumed.
5. A fully served customer leaves happy; hunger reaching 100 on any customer ends the run.
6. Game over auto-restarts after a 7-second countdown.

## Main Systems

### Merge AI (`processTurn`)

- Scans tiles from highest level down.
- For each tile, finds the nearest same-level tile (Manhattan distance).
- Adjacent pair → merge animation (level +1, flame particles).
- Distant pair → the partner walks one step closer through an empty cell.
- One action per turn, so the board resolves visibly instead of instantly.

### Pizza Chain

10 levels defined in `PIZZA_DATA` (Flour Dough → Oksu Masterpiece), each with an SVG sprite (`assets/items/pizza_lv1-10.svg`) and a fully procedural canvas fallback that layers toppings by level.

### Customers

- 4 archetypes in `UNDEAD_ARCHETYPES` with per-type palettes and silhouettes.
- Three animation states: `idle`, `angry` (hunger > 72), `happyLeaving`.
- Sprite resolution order per state: SVG asset → procedural layered sprite sheet → vector fallback drawing.
- Queue positions re-pack smoothly when a customer leaves.
- Hunger growth accelerates with elapsed game time (`0.35 + gameTime / 600` per second).

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

- Oven glow and ember particles behind the header to sell the wood-fired theme.
- A brief "baking" flash when a merge completes (the flame particles now render after the sprite fix).
- Customer entrance animation (walk in from the right) to match the exit animation.

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
