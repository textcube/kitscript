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

- Procedural cave terrain: a pure function of distance travelled (continuous at any scroll speed) with a per-run random seed, so every run is a different cave. The corridor narrows with distance, and a cheap layered-stroke glow plus a far parallax ridge sit on a pre-rendered backdrop.
- Sector structure: a new sector every 6000 world px with a "SECTOR N" banner, sector bonus score, a small fuel top-up, a chime, and a new terrain palette (Outer Caverns / Magma Vents / Toxic Grove / Crystal Depths / Ion Storm, cycling). The enemy mix changes per sector: ground units first, then SAMs and UFOs, then fighters, then alternating ground-heavy and air-heavy sectors.
- Auto-pilot AI: flies the middle of the safe corridor band over a speed-scaled look-ahead, dives toward NRG cells when fuel < 60%, holds its line to shoot down distant air units and homing missiles, sidesteps close ones, never drifts toward a near-miss lane, and times bombs with a ballistic solution.
- Six entity types: base (200), fuel cell (+40 fuel, 150; also collected by touching it), tank (350), SAM tower (500) with a homing missile (75 to shoot down), UFO (300), fighter (400). Ground units ride the terrain; air units are clamped inside the corridor; bomb blasts have a radius that also takes out neighbouring ground units.
- Homing SAM missiles have a limited turn rate, a lifetime, and lose their motor once they overshoot, so nothing chases the ship's tail.
- Difficulty is a soft function of distance (scroll speed x1 -> x2, slightly denser spawns per sector) with distance-based spawn cadence and a fuel "pity" spawn after a long drought.
- Feel: subtle screen shake, hit/pickup flashes, shockwave rings, additive spark/ember explosions, engine trail, score and "+40 FUEL" popups, death slow-motion, a shielded fly-in "get ready" moment at every (re)start, blinking low-fuel HUD + on-canvas warning + beep. Shake, flashes and slow-mo are disabled under `prefers-reduced-motion`.
- Controls (all optional, layered over the auto-pilot): arrows/WASD steer, Space bombs; touch/mouse drag steers (relative drag), a tap or a second finger bombs, plus an on-screen BOMB button on touch devices. Releasing hands control back to the AI after a short grace period; the HUD badge switches between "Auto-Pilot Active" and "Manual Override". A controls hint fades out by itself.
- Responsive layout: the 960x540 playfield is letterboxed (no page scroll) in portrait and landscape, the HUD/top bar switch to compact layouts on phones, the backing store is sized to the displayed size x devicePixelRatio (cap 2), and the page uses `100dvh` and safe-area insets.
- WebAudio procedural SFX (shoot / bomb / launch / noise-based explosions / collect / low-fuel warning / sector chime), off by default, master compressor and voice cap, preference persisted; the AudioContext is created lazily on the first gesture and everything degrades silently if Web Audio or `localStorage` is unavailable.
- Robust loop: a single rAF loop (no intervals or timeouts anywhere - the game-over countdown is frame-timed), long frames are split into sub-steps, the loop survives an exception, and the game pauses naturally when the tab is hidden.
- Release metadata: title, description, Open Graph/Twitter tags, theme-color, inline SVG favicon, `rel="noopener"` links, ARIA labels, visible keyboard focus.

## Code Review & Improvement Plan (2026-07-09)

Full review of `pilot/index.html` (819 lines). Ordered by priority. None of these change the attract-first scope.

### P1 — Bugs (all done, commit 945bfac; re-verified in the release pass)

1. **No delta-time — game speed is tied to display refresh rate**: everything advances per `requestAnimationFrame` tick: `state.timer++`, fuel depletion, difficulty growth, player/enemy/bullet/bomb/missile movement, particle decay, star scroll, and spawn cadence (`state.timer % spawnRate === 0`). On a 144 Hz display the game runs 2.4× faster and fuel drains 2.4× faster. Fix as in the other kitscript games: compute a clamped `dt` and scale per-frame updates by `dt * 60` to preserve current 60 fps tuning. Note the knock-ons: `state.timer` becomes fractional, so replace `timer % spawnRate === 0` with an accumulator, and keep the frame-based fire/bomb cooldowns (`lastShot`, `lastBomb`) working against the scaled timer.
2. **Array mutation during iteration corrupts combat logic**: bullets, bombs, SAM missiles, enemies, and particles are all `splice()`d inside `forEach` loops, skipping the next element each time. Worse, `destroyEnemy(e, i)` is called from *nested* bullet/bomb loops using the outer enemy index — if a bullet and a bomb (or two bullets) hit the same enemy in one frame, it is destroyed twice: score is double-awarded and the second `splice(i, 1)` removes a different, innocent enemy. Fix: mark-and-filter removal (dead/expired flags applied after the loops), guard `destroyEnemy` with a `dead` flag, and stop checking projectiles against an enemy once it dies.
3. **Terrain collision only samples the player's left edge**: `state.terrain.find(t => t.x >= p.x && t.x <= p.x + 15)` grabs a single terrain point near the tail of a 48px-wide ship, so the nose can visibly pass through a rising floor or dipping ceiling without dying (and vice versa a floor spike under the tail kills "unfairly"). Sample 2–3 points across the ship's width (keep the existing 6px fairness margin).
4. **Fighters and UFOs can spawn inside terrain**: a fighter spawns at `player.y ± 75` and a UFO at `ceiling + 80..200`, neither clamped against the corridor at the spawn column — as the gap narrows they can appear embedded in rock, then glide out of it. Clamp spawn `y` into `[ceiling + margin, floor - h - margin]` at the spawn column.
5. **UFO bobbing drifts and is framerate-dependent**: `e.y += Math.sin(state.timer * 0.1) * 5` integrates a sine into position — the effective amplitude is ~±50px around spawn height and doubles with refresh rate, pushing UFOs into terrain or the player lane unpredictably. Store `e.baseY` and set `e.y = e.baseY + Math.sin(...) * amp` instead.
6. **Stuck keys on focus loss**: `state.keys` is never cleared on `blur`/tab switch, so a key held while alt-tabbing stays "pressed" forever — the manual override never releases and the auto-pilot never resumes, breaking the attract loop. Clear the keys object on `window` blur and on `visibilitychange`.

### P2 — Attract & UX hardening (all done, commit 945bfac; re-verified in the release pass)

7. **Persistent best score**: no record exists, and the game-over overlay shows no results at all. Store best score in `localStorage` (key `pilot_best_score`, try/catch guarded), show `BEST` on the HUD, and show the run's final score + best on the game-over overlay.
8. **Distance score**: score only comes from kills, so a cautious auto-pilot run shows a frozen counter — dull to watch. Award a small continuous survival/distance trickle (Scramble-style progression points) so the counter always climbs during the demo.
9. **AI missile evasion**: the auto-pilot never reacts to homing SAM missiles, so unattended runs end quickly and repetitively. When a missile is within a threat window, bias the AI's target Y away from it (still clamped to the corridor midpoint band) so attract runs live longer and look smarter.
10. **Instant restart on any key**: on the game-over overlay, restart on any keypress in addition to the Deploy button (keep the 7-second auto-restart).
11. **Keep the scene alive during game over**: `update()` early-returns on death, freezing the explosion particles and starfield for up to 7 seconds. Keep particles and stars animating (and skip only gameplay logic) so the loop stays visually alive.
12. **Persist sound preference**: audio resets to OFF every load. Persist `pilot_sound_on` in `localStorage` (try/catch), restore the button state on load, create/resume the AudioContext on the first user gesture.
13. **Cache CSS variable colors**: `varColor()` calls `getComputedStyle` several times per entity per frame. Read the five neon colors once at startup into a plain object.
14. **HiDPI canvas**: the 960×540 backing store renders blurry on retina displays. Scale the backing store by `devicePixelRatio` (cap ~2) with `ctx.setTransform`, keeping 960×540 logical coordinates.
15. **Minor cleanup**: score text `toLocaleString().padStart(7,'0')` mixes zero-padding with thousands separators (`001,500`) — pick one format; guard `deployBtn`/`soundBtn` from Space-key re-trigger while playing (blur after click); remove the unused `slide` ramp target of 10 Hz hitting `exponentialRampToValueAtTime` with near-zero values.

### P3 — Deferred items (done in the 2026-09-30 release pass)

- [x] Touch controls: drag-to-steer as a manual override, tap / second finger / BOMB button to bomb.
- [x] Stage structure: distance-based sectors with banner, palette and enemy-mix changes. (New enemy types and boss encounters were deliberately not added.)
- [x] Balance tuning: distance-based difficulty and spawn cadence, fuel economy (+40 per cell, touch pickup, pity spawn, sector top-up), fairer missiles.

### Non-goals

- No start menus, pause screens, or difficulty selectors — instant start and the auto-restart loop are the core of the attract identity.
- No frameworks or build steps; the game stays one self-contained HTML file.

## Release Polish (2026-09-30)

Headless play-testing (Chromium, ~150 unattended runs simulated frame by frame plus real-time runs, desktop and touch-emulated phones) drove this pass. Before: the auto-pilot lasted 12 s on average and died to a missile or fighter every time; on a 390 px phone the top bar and HUD overflowed and the canvas was stretched.

**Bugs fixed**
- Terrain depended on `timer + x` while scrolling by `speed`, and had no randomness, so every run was the identical cave and the shape was tied to the frame counter. It is now a function of world distance plus a per-run seed.
- SAM missiles never moved horizontally (`vx` was accumulated but never applied) and could not be shot; they now home properly, expire, hit terrain, can be shot down, and cut their motor after overshooting.
- Bullets could tunnel through fast targets on long frames (swept collision now); long frames are split into sub-steps.
- Touching a fuel cell killed the ship; it now collects it.
- Ground units were placed from the last terrain point but never followed the terrain; air units could end up inside rock. Ground units now ride the interpolated surface, air units are clamped into the corridor.
- Terrain collision and bomb impacts now use interpolated terrain rather than a step lookup.
- Holding a key while dying (key repeat) or any modifier/Tab press instantly skipped the game-over screen; restarts now ignore repeats and modifiers and have a short guard.
- The game-over `setInterval` is gone (frame-timed countdown), so nothing can leak or double-fire across restarts.
- The sound preference no longer creates a suspended AudioContext at load (console warning); the context is created on the first gesture and audio is suspended while the tab is hidden.
- Buttons lost keyboard focus after keyboard activation, focus outlines were removed, and Space on a focused button also triggered game input.
- Canvas was stretched with `image-rendering: pixelated` at non-native sizes; the HUD, top bar and overlay overflowed on phones.
- Per-frame allocations (array `filter`s, gradients, DOM writes every frame) were removed; expensive full-terrain `shadowBlur` was replaced with layered strokes.

**Added**: sector progression, palettes and enemy mixes; touch/mouse drag steering, tap-to-bomb and a BOMB button; auto-pilot rewrite (proportional steering, lane hazards, ballistic bombing); screen shake, flashes, rings, richer explosions, engine trail, popups, death slow-mo; get-ready fly-in with shield; low-fuel warning; fading controls hint; manual-override badge; new-record callout; noise-based audio with compressor; responsive letterboxed layout with HiDPI backing store; metadata, favicon, ARIA and reduced-motion support.

**Balance**: unattended runs now typically last about 1 to 4 minutes (mean about 3 minutes and a range of roughly 0.5 to 5 minutes over 40 simulated runs, sector 10+ is common) and always end eventually, mostly by air-unit contact and about one run in five by running out of fuel; terrain collisions by the auto-pilot are essentially gone. Auto-restart is still 7 seconds; any key or tap redeploys.

**Not done on purpose**: no pause screen or menus (the game just pauses while the tab is hidden), no difficulty selector, no new enemy classes or bosses, no external assets or Open Graph image (the file must stay self-contained).

## Local File

- Main game: `pilot/index.html`
