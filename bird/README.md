# Eternal Invasion Bird

A single-file HTML5 canvas runner. Flappy-bird-style physics (tap to flap, gravity pulls down), but the obstacles are columns of animated Space Invader pixel sprites and the bird has a shield energy bar instead of one-hit death: crashing through invaders destroys them and drains energy, and at zero energy the bird can no longer flap and falls. Speed scales with score.

## Design Identity (attract-first)

Like other kitscript games, this game is built to be watchable, not just playable:

- Starts instantly in AUTO MODE: a lookahead AI flies the bird through the gaps on its own — the game plays itself as a spectacle.
- One-input control: the first tap/click/Space switches to MANUAL MODE and every input is a flap. There is nothing else to learn.
- On death, the game auto-restarts after 7 seconds (or immediately on tap/Space) and returns to AUTO MODE, so it loops forever as an attract demo.

Improvements must preserve this identity. Do not add menus, difficulty selectors, or anything that blocks the instant-start / auto-loop flow.

## Current Features

- Auto-pilot AI with two-pipe lookahead blending, jump-peak prediction, and gap-entry safety margins.
- Shield energy system: hits destroy the touched invader (particle burst + SFX) and drain energy on a damage cooldown; zero energy disables flapping.
- Procedural invader columns with a randomized gap, two-frame sprite animation, and pass-through scoring.
- Score-scaled game speed (`BASE_SPEED + score * SPEED_INCREMENT`).
- Three-layer parallax starfield, scanline overlay, and vignette.
- WebAudio procedural SFX (flap, hit) behind a sound toggle.
- DOM HUD: score, color-coded energy bar, AUTO/MANUAL mode indicator.
- Game-over overlay with 7-second auto-restart and tap-to-skip.

## Code Review & Improvement Plan (2026-07-09)

Full review of `bird/index.html` (508 lines). Ordered by priority. None of these change the attract-first scope.

### P1 — Bugs (fix first)

1. **No delta-time — game speed is tied to display refresh rate**: gravity (`0.56`/frame), column/parallax movement, particle life, wing/sprite animation, and the frame-based damage cooldown all advance per `requestAnimationFrame` tick. On a 144 Hz display the whole game runs 2.4× faster and the physics tuning (and the auto-AI's jump-peak math) breaks. Fix: compute a clamped `dt` in the loop and scale per-frame updates by `dt * 60` so the current 60 fps tuning is preserved exactly. Frame-count-driven timers (`lastHitFrame`, blink, sprite animation) should advance with the scaled frame count.
2. **Flap sound is deafening**: `playJumpSound` sets gain to `4.8` — 12× the hit sound's `0.4` and far above full scale, so the oscillator clips into a loud distorted blast. Reduce to a sane level (~`0.15`) with the same envelope.
3. **Invincibility blink and damage cooldown disagree**: the bird blinks for `INVINCIBILITY_TIME` (25 frames) after a hit, but damage can be taken again after only 8 frames (`frameCount - lastHitFrame > 8`), so the player takes damage while visibly "invincible". Unify: use `INVINCIBILITY_TIME` for the damage cooldown as well.
4. **Space key auto-repeat and default action**: holding Space fires repeated `keydown` events (machine-gun flapping), and the key's default action is not prevented (scrolls the host page in embeds). Ignore `e.repeat` and call `e.preventDefault()` for Space.
5. **Game-over overlay shows no result**: only "SYSTEM FAILURE" and links — no final score. Show the final score (and best score, item 6) on the overlay.

### P2 — Attract & UX hardening

6. **Persistent best score**: `localStorage` key `bird_best_score` (try/catch guarded), shown in the HUD near the score and on the game-over overlay.
7. **Persist sound preference**: `localStorage` key `bird_sound_on`; restore the toggle state on load, defer AudioContext creation/resume to the first user gesture (autoplay policy).
8. **Idle return to AUTO MODE**: once the player switches to manual, there is no way back until death — an abandoned screen in manual mode just falls and death-loops. After ~7 seconds without player input in MANUAL MODE, revert to AUTO MODE (update the mode indicator). Any input immediately switches back to manual and resets the idle timer. This keeps an unattended screen flying indefinitely, which is the core of the attract identity.
9. **Touch support**: only `mousedown` is handled; on mobile, rapid taps are unreliable. Add a `touchstart` listener (with `preventDefault` to suppress the synthetic mouse event and scrolling) that routes through the same `handleInput` path.
10. **HiDPI rendering**: the canvas backing store is CSS-pixel sized, so it renders blurry on retina displays. Scale by `devicePixelRatio` in `resize()` (`canvas.width = innerWidth * dpr`, `ctx.setTransform(dpr,0,0,dpr,0,0)`), keeping game logic in CSS pixels.
11. **Minor cleanup**: update the game-over countdown text only when the remaining-seconds value changes (currently written every frame); on window resize, clamp the player back inside the new canvas bounds.

### P3 — Deferred (do not start in this pass)

- Energy regeneration or balance changes (e.g. +energy per column passed) — the no-regen death spiral looks intentional; needs a design decision.
- New obstacle patterns or enemy variety.
- Replacing the Tailwind CDN with static CSS.

### Non-goals

- No start menus, pause screens, or difficulty selectors — instant start and the auto-restart loop are the core of the attract identity.
- No frameworks or build steps beyond the existing Tailwind CDN; the game stays one self-contained HTML file.

## Local File

- Main game: `bird/index.html`
