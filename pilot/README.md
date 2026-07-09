# Eternal Invasion: Dawn of Strike Back

A single-file HTML5 canvas Scramble-style side-scroller. A neon jet flies through a procedurally generated cave (scrolling floor + ceiling) that slowly narrows, auto-firing forward and dropping bombs on ground targets. Fuel drains constantly and is refilled by destroying green NRG cells. Enemies: ground bases, tanks, SAM towers that launch homing missiles, UFOs, and fast fighters. Death comes from terrain collision, enemy contact, a SAM hit, or running dry.

## Design Identity (attract-first)

Like other kitscript games, this game is built to be watchable, not just playable:

- Starts instantly with no menu.
- An auto-pilot AI flies the corridor, seeks fuel cells when low, and bombs ground targets — the game plays itself as a spectacle (`Auto-Pilot Active` badge on screen).
- Player input is optional and layered on top: arrows/WASD temporarily override the AI's steering, Space force-drops bombs. Releasing the keys hands control back to the AI.
- The main gun auto-fires continuously; the player never manages shooting.
- On death, the game auto-restarts after 7 seconds (or instantly via the Deploy button), looping forever as an attract demo.

Improvements must preserve this identity. Do not add menus, difficulty selectors, or anything that blocks the instant-start / auto-loop flow.

## Current Features

- Procedural cave terrain (sine-stacked floor/ceiling) whose gap narrows over the run; parallax starfield and nebula glows behind it.
- Auto-pilot AI: steers toward the corridor midpoint sampled ahead, diverts toward fuel cells when fuel < 45%, and bombs ground targets in a forward window.
- Six entity types: base (200), fuel cell (+45 fuel, 150), tank (350), SAM tower (500) with homing missile, UFO (300), fighter (400).
- Physics-y bombs (forward lob + gravity) and homing SAM missiles with rotation-matched rendering.
- Difficulty scaling: scroll speed and spawn rate rise continuously with time.
- Neon vector rendering with canvas shadows, particle explosions, CSS CRT scanline overlay.
- WebAudio procedural SFX (shoot / bomb / launch / explode / collect), off by default.
- DOM HUD: score, fuel bar with low-fuel color shift; game-over overlay with death reason and 7-second auto-restart countdown.

## Code Review & Improvement Plan (2026-07-09)

Full review of `pilot/index.html` (819 lines). Ordered by priority. None of these change the attract-first scope.

### P1 — Bugs (fix first)

1. **No delta-time — game speed is tied to display refresh rate**: everything advances per `requestAnimationFrame` tick: `state.timer++`, fuel depletion, difficulty growth, player/enemy/bullet/bomb/missile movement, particle decay, star scroll, and spawn cadence (`state.timer % spawnRate === 0`). On a 144 Hz display the game runs 2.4× faster and fuel drains 2.4× faster. Fix as in the other kitscript games: compute a clamped `dt` and scale per-frame updates by `dt * 60` to preserve current 60 fps tuning. Note the knock-ons: `state.timer` becomes fractional, so replace `timer % spawnRate === 0` with an accumulator, and keep the frame-based fire/bomb cooldowns (`lastShot`, `lastBomb`) working against the scaled timer.
2. **Array mutation during iteration corrupts combat logic**: bullets, bombs, SAM missiles, enemies, and particles are all `splice()`d inside `forEach` loops, skipping the next element each time. Worse, `destroyEnemy(e, i)` is called from *nested* bullet/bomb loops using the outer enemy index — if a bullet and a bomb (or two bullets) hit the same enemy in one frame, it is destroyed twice: score is double-awarded and the second `splice(i, 1)` removes a different, innocent enemy. Fix: mark-and-filter removal (dead/expired flags applied after the loops), guard `destroyEnemy` with a `dead` flag, and stop checking projectiles against an enemy once it dies.
3. **Terrain collision only samples the player's left edge**: `state.terrain.find(t => t.x >= p.x && t.x <= p.x + 15)` grabs a single terrain point near the tail of a 48px-wide ship, so the nose can visibly pass through a rising floor or dipping ceiling without dying (and vice versa a floor spike under the tail kills "unfairly"). Sample 2–3 points across the ship's width (keep the existing 6px fairness margin).
4. **Fighters and UFOs can spawn inside terrain**: a fighter spawns at `player.y ± 75` and a UFO at `ceiling + 80..200`, neither clamped against the corridor at the spawn column — as the gap narrows they can appear embedded in rock, then glide out of it. Clamp spawn `y` into `[ceiling + margin, floor - h - margin]` at the spawn column.
5. **UFO bobbing drifts and is framerate-dependent**: `e.y += Math.sin(state.timer * 0.1) * 5` integrates a sine into position — the effective amplitude is ~±50px around spawn height and doubles with refresh rate, pushing UFOs into terrain or the player lane unpredictably. Store `e.baseY` and set `e.y = e.baseY + Math.sin(...) * amp` instead.
6. **Stuck keys on focus loss**: `state.keys` is never cleared on `blur`/tab switch, so a key held while alt-tabbing stays "pressed" forever — the manual override never releases and the auto-pilot never resumes, breaking the attract loop. Clear the keys object on `window` blur and on `visibilitychange`.

### P2 — Attract & UX hardening

7. **Persistent best score**: no record exists, and the game-over overlay shows no results at all. Store best score in `localStorage` (key `pilot_best_score`, try/catch guarded), show `BEST` on the HUD, and show the run's final score + best on the game-over overlay.
8. **Distance score**: score only comes from kills, so a cautious auto-pilot run shows a frozen counter — dull to watch. Award a small continuous survival/distance trickle (Scramble-style progression points) so the counter always climbs during the demo.
9. **AI missile evasion**: the auto-pilot never reacts to homing SAM missiles, so unattended runs end quickly and repetitively. When a missile is within a threat window, bias the AI's target Y away from it (still clamped to the corridor midpoint band) so attract runs live longer and look smarter.
10. **Instant restart on any key**: on the game-over overlay, restart on any keypress in addition to the Deploy button (keep the 7-second auto-restart).
11. **Keep the scene alive during game over**: `update()` early-returns on death, freezing the explosion particles and starfield for up to 7 seconds. Keep particles and stars animating (and skip only gameplay logic) so the loop stays visually alive.
12. **Persist sound preference**: audio resets to OFF every load. Persist `pilot_sound_on` in `localStorage` (try/catch), restore the button state on load, create/resume the AudioContext on the first user gesture.
13. **Cache CSS variable colors**: `varColor()` calls `getComputedStyle` several times per entity per frame. Read the five neon colors once at startup into a plain object.
14. **HiDPI canvas**: the 960×540 backing store renders blurry on retina displays. Scale the backing store by `devicePixelRatio` (cap ~2) with `ctx.setTransform`, keeping 960×540 logical coordinates.
15. **Minor cleanup**: score text `toLocaleString().padStart(7,'0')` mixes zero-padding with thousands separators (`001,500`) — pick one format; guard `deployBtn`/`soundBtn` from Space-key re-trigger while playing (blur after click); remove the unused `slide` ramp target of 10 Hz hitting `exponentialRampToValueAtTime` with near-zero values.

### P3 — Deferred (do not start in this pass)

- Touch controls (drag-to-steer as manual override, tap to bomb) — currently mobile users can only watch, which is acceptable for the attract identity but worth revisiting.
- New enemy types, boss encounters, or stage structure (Scramble's themed sections).
- Balance tuning (fuel economy vs. spawn mix, difficulty curve shape).

### Non-goals

- No start menus, pause screens, or difficulty selectors — instant start and the auto-restart loop are the core of the attract identity.
- No frameworks or build steps; the game stays one self-contained HTML file.

## Local File

- Main game: `pilot/index.html`
