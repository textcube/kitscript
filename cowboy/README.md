# Eternal Invasion: Cowboy Edition

A single-file HTML5 canvas defense game. A cowboy stands on the left of a night-desert scene and auto-aims / auto-fires at monsters marching in from the right. The player's only job is choosing the right weapon for the situation — five slots (Revolver, Shotgun, Rifle, Dynamite, Gatling) selected by keys 1–5 or clicking the dock, each with its own damage, reload circle, penetration, and firing behavior. Waves escalate: kill quotas grow and spawn intervals shrink.

## Design Identity (attract-first)

Like other kitscript games, this game is built to be watchable, not just playable:

- Starts instantly with no menu.
- The cowboy always auto-aims and auto-fires — combat runs itself as a spectacle.
- Player input is minimal and strategic: pick one of five weapons. Nothing else.
- After 30 seconds without input, an AI takes over weapon selection too (`[AI]` tag on the HUD), so an unattended screen keeps playing intelligently.
- On defeat, the game auto-restarts after 7 seconds, looping forever as an attract demo.

Improvements must preserve this identity. Do not add menus, difficulty selectors, or anything that blocks the instant-start / auto-loop flow.

## Current Features

- Five weapons with distinct stats (damage / reload / projectile speed / penetration / spread count / bomb radius) and per-slot SVG reload-progress rings.
- Four enemy types (walker, runner, brute, swarm) with randomized palettes, procedural walk/arm/leg animation, hit-flash, and y-depth sorting against the player.
- Auto-aim with smoothed turret rotation, muzzle flash, recoil, shell-casing and dust particles, screen shake.
- Wave system with growing kill quotas and accelerating spawns.
- AI weapon evaluator (brutes → rifle, close threat → shotgun, big crowds → dynamite/gatling).
- Procedural night-desert background: twinkling stars, meteors, moon, mountain silhouettes, cacti/palms, sand grains.
- WebAudio procedural SFX per weapon plus noise-based explosion.
- DOM HUD: wave, health bar, active loadout; game-over overlay with 7-second auto-restart countdown.

## Code Review & Improvement Plan (2026-07-09)

Full review of `cowboy/index.html` (468 lines). Ordered by priority. None of these change the attract-first scope.

### P1 — Bugs (fix first)

1. **Enemy spawn distribution collapses from wave 4**: `spawn()` draws one random `r` and applies overlapping bands in sequence (`r<0.3` → runner, then `r<0.2` → brute, then `r<0.4` → swarm), each overwriting the last. Once wave ≥ 4, any `r < 0.4` ends up as swarm — brutes and runners never spawn again, flattening the difficulty curve. Rewrite with non-overlapping probability bands that preserve the intended mix (e.g. wave ≥ 3: brute 20%; wave ≥ 2: runner 30%; wave ≥ 4: swarm 40%; remainder walker — allocate bands cumulatively so all unlocked types keep spawning).
2. **Array mutation during iteration corrupts combat logic**: enemies, bullets, particles, and meteors are all `splice()`d inside `forEach` loops, skipping the next element each time. Worse, penetrating bullets track hits by enemy **index** (`b.hitList.includes(ei)`) — when a killed enemy is spliced out, indices shift and a rifle round can hit the same enemy twice or skip one entirely. And after a dynamite bullet explodes and splices itself, the enemy loop keeps processing the same (removed) bullet and can splice a second, unrelated bullet. Fix: switch to mark-and-filter removal (dead/expired flags applied after the loops), track `hitList` by enemy object reference (or unique id) instead of index, and stop processing a bullet immediately once it is consumed.
3. **Dynamite kills don't advance the wave**: `explode()` increments `waveKillCount` but the wave-completion check (`waveKillCount >= waveTotalCount` → next wave) and `updateUI()` live only in the bullet-hit path, so a wave finished by splash damage doesn't advance until the next direct hit. Centralize kill handling in one `killEnemy(enemy)` function (particles, kill count, wave-completion check, UI update) called from both paths.
4. **No delta-time — game speed is tied to display refresh rate**: `animTime += 0.05`, enemy movement (`e.x -= e.spd`), walk animation, bullets, particles, recoil/shake decay, and the meteor spawn probability (`Math.random() < 0.006` per frame) all advance per `requestAnimationFrame` tick — 2.4× faster on a 144 Hz display. Fix: compute a clamped `dt` and scale per-frame updates by `dt * 60` to preserve the current 60 fps tuning. The `Date.now()`-based reload/spawn/idle timers are already frame-rate independent — leave them.
5. **HP not clamped**: `this.hp` can go negative (brute hit at low HP), producing an invalid negative CSS width for the health bar. Clamp HP to `[0, 100]` when applying damage.

### P2 — Attract & UX hardening

6. **Persistent best wave**: no score or record exists. Store the best wave reached in `localStorage` (key `cowboy_best_wave`, try/catch guarded), show `BEST WAVE` on the HUD and show the reached wave + best on the game-over overlay (the overlay currently shows no results at all).
7. **Faster AI weapon evaluation**: in auto mode the weapon evaluator runs only every 60 seconds, so the AI visibly ignores brutes/swarms for up to a minute — a dull attract show. Re-evaluate every ~5 seconds while in auto mode (switch only when the recommendation differs, which `autoEvaluateWeapon` already handles).
8. **Persist sound preference**: `localStorage` key `cowboy_sound_on`; restore the button state on load, defer AudioContext creation to the first user gesture; also `resume()` a suspended context inside `play()`.
9. **Instant restart**: on the game-over overlay, restart immediately on click or key press (keep the 7-second auto-restart).
10. **Responsive + HiDPI canvas**: the canvas is fixed at 800×500 CSS pixels — it clips on small screens and renders blurry on retina displays. Scale the viewport down with CSS (preserve the 8:5 ratio and 800×500 logical coordinates) and scale the backing store by `devicePixelRatio` with `ctx.setTransform`.
11. **Minor cleanup**: start the game loop directly instead of waiting for `window.onload` (the script already runs after the DOM); update the restart countdown text only when the second value changes; clear `meteors` in `reset()`.

### P3 — Deferred (do not start in this pass)

- Touch/mobile weapon-dock ergonomics.
- New weapons, enemy types, or boss waves.
- Balance tuning (weapon damage vs. enemy HP curves).

### Non-goals

- No start menus, pause screens, or difficulty selectors — instant start and the auto-restart loop are the core of the attract identity.
- No frameworks or build steps; the game stays one self-contained HTML file.

## Local File

- Main game: `cowboy/index.html`
