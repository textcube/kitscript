# Eternal Invasion: Bomb Edition

A single-file HTML5 canvas defense game. Halloween monsters (zombies, skeletons, pumpkins, ghosts, vampires) swarm toward a fortress at the bottom of the screen. The fortress defends itself with an auto-firing machine gun (short range) and a tactical bomb lobbed on a curved Bezier trajectory (large area damage, 8-second cooldown). Waves escalate with score.

## Design Identity (attract-first)

Like other kitscript games, this game is built to be watchable, not just playable:

- Starts instantly with no menu.
- The Auto-Targeting System is ON by default: the turret tracks the nearest enemy, the machine gun fires automatically, and the tactical bomb launches itself at the nearest threat — the game plays itself as a spectacle.
- Player input is optional and low-density: uncheck auto-targeting to aim the bomb manually with the mouse.
- On defeat, the game auto-restarts after 7 seconds, so it loops forever as an attract demo.

Improvements must preserve this identity. Do not add menus, difficulty selectors, or anything that blocks the instant-start / auto-loop flow.

## Current Features

- Five enemy types with distinct hand-drawn canvas art, walk animation, and stats (speed / health / score).
- Curved artillery: quadratic Bezier projectile with alternating curve direction, trajectory preview line, and target reticle.
- Machine gun with range limit, cooldown, and muzzle flash.
- Expanding-ring area explosions with per-enemy damage dedup (`damaged` Set).
- Wave system: spawn interval shrinks and group size / difficulty factor grow as score passes thresholds.
- Lighting pass (radial base glow + turret beam) over a grid background with ambient dust particles.
- DOM HUD: wave, score, fortress health bar, auto-targeting toggle, sound toggle, bomb cooldown status.
- WebAudio procedural SFX (shot, explosion, UI blip).
- Game-over overlay with 7-second auto-restart countdown.

## Code Review & Improvement Plan (2026-07-09)

Full review of `bomb/index.html` (946 lines). Ordered by priority. None of these change the attract-first scope.

### P1 — Bugs (fix first)

1. **No delta-time anywhere — game speed is tied to display refresh rate**: `gameLoop` runs on `requestAnimationFrame` with per-frame constants: enemy movement (`speed` px/frame), bullets (15 px/frame), projectile progress (`t += 0.008`/frame), explosion life (`-0.015`/frame), particle life (`-0.02`/frame), floating text drift. On a 144 Hz display the entire game runs 2.4× faster than on 60 Hz. Fix: compute a clamped `dt` in `gameLoop` (e.g. `Math.min(dt, 0.1)`) and scale every per-frame update by `dt * 60` so the current 60 fps tuning is preserved exactly.
2. **Machine-gun kills award nothing**: score, floating text, and death effects are granted only inside `Explosion.update()`. Enemies killed by bullets (or any other future source) are silently filtered out in `gameLoop` with no score, no particles, no sound. Fix: centralize kill handling in one `killEnemy(enemy)` path (score + floating text + particles + explosion SFX) and call it from every damage source; the bomb explosion keeps its area-damage behavior but routes deaths through the same function.
3. **Dead audio icon**: the bottom-right `#audio-status-icon` ("Mute"/"Audio") has `cursor: pointer` but no click handler — clicking it does nothing. Wire it to toggle the sound checkbox (single source of truth: reuse the checkbox `change` path).
4. **Run-scoped timers survive restart**: `startGame()` does not reset `lastSpawn`, `lastShot`, `lastGunShot`, `turretAngle`, or `curveDirection`. After a reboot the stale `lastSpawn` triggers an immediate oversized spawn and the bomb cooldown state carries over. Reset all run-scoped timing state in `startGame()`.
5. **Game-over overlay shows no result**: the overlay has only flavor text and links — no final score or wave reached. Show `FINAL SCORE` and `WAVE` on the overlay.

### P2 — Attract & UX hardening

6. **Persistent best score**: store the best score in `localStorage` (key `bomb_best_score`, guarded with try/catch), show `BEST` in the HUD panel and on the game-over overlay.
7. **Persist sound preference**: `localStorage` key `bomb_sound_on`; restore the checkbox state on load, but only create/resume the AudioContext on the first user gesture (WebAudio autoplay policy).
8. **Instant restart from the overlay**: keep the 7-second auto-restart, but also restart immediately on overlay click (excluding the link buttons) or the R key.
9. **HiDPI rendering**: the canvas is sized in CSS pixels only, so it renders blurry on retina/HiDPI displays. Scale the backing store by `devicePixelRatio` in `resize()` (`canvas.width = width * dpr`, `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`), keeping all game logic in CSS-pixel coordinates.
10. **Minor cleanup**: bullets should skip enemies whose `health <= 0` (they can currently waste hits on already-dead enemies still in the array); write `cooldownStatus`/score/wave DOM text only when the value actually changes instead of every frame; remove the redundant `ctx.clearRect` before the full-screen background fill.

### P3 — Deferred (do not start in this pass)

- Touch controls for manual aiming on mobile.
- New enemy types, bosses, or wave banners.
- Balance changes (bomb damage vs. difficulty-scaled pumpkin health).

### Non-goals

- No start menus, pause screens, or difficulty selectors — instant start and the 7-second auto-restart loop are the core of the attract identity.
- No frameworks or build steps; the game stays one self-contained HTML file.

## Local File

- Main game: `bomb/index.html`
