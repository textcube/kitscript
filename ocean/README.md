# Eternal Invasion: Ocean Edition

A single-file HTML5 canvas defense game. Enemy aircraft and surface ships invade from the right across three air lanes and three surface lanes; the player's submarine and three auto-firing escort ships defend the base on the left. Win by surviving 300 seconds or reaching 50,000 points.

## Design Identity (attract-first)

Like other kitscript games, this game is built to be watchable, not just playable:

- Starts instantly with no menu.
- The submarine auto-fires (A-LAUNCH) and the three escort ships fight on their own, so the game plays itself as a spectacle.
- Player input is low-density: move (arrows/WASD) and an optional manual launch (Space) with a shorter cooldown.
- On win/lose, the game auto-restarts after 7 seconds (or immediately via the R key / on-screen button), so it loops forever as an attract demo.

Improvements must preserve this identity. Do not add menus, difficulty selection screens, or anything that blocks the instant-start / auto-loop flow.

## Current Features

- Three-band battlefield: sky (air enemies), surface lanes (enemy ships + escort fleet), deep water (player submarine and base).
- Homing missiles with underwater-to-air acceleration and splash effects at the waterline.
- Escort ships with heat/overheat gauges and auto-targeting.
- Enemy scaling: speed and fire rate increase with elapsed time.
- Bombs: air bombs dropped by aircraft, depth charges with a 4-second fuse dropped by ships.
- Chain explosions with area damage (`checkExplosionDamage`).
- WebAudio-based procedural SFX (launch, hit, explosion, splash) behind a sound toggle.
- Canvas-drawn HUD: score/target, progress timer, manual/auto launch cooldown gauges, fleet heat gauge.
- Game over overlay with auto-restart countdown, click-to-restart button, and R-key restart.

## Code Review & Improvement Plan (2026-07-09)

Full review of `ocean/index.html` (697 lines). Ordered by priority. None of these change the attract-first scope.

### P1 — Gameplay bugs (fix first)

1. **Air bombs are inert**: `Bomb` with `type === 'air'` has `timer = 999`, never explodes, and there is no collision check against the submarine, escorts, or the water surface — air bombs simply fall off-screen and do nothing. Every air enemy's attack is therefore harmless. Fix: detonate air bombs when they reach the waterline (`SURFACE_LAYER`) with a splash plus a small explosion (e.g. radius ~55) that uses the existing `checkExplosionDamage`, and/or detonate on proximity to the submarine. Keep depth charges as they are.
2. **Frame-rate dependent probabilities**: enemy spawning (`Math.random() < spawnProb` per frame), escort firing (`Math.random() < 0.012` per frame), and bubble spawning (`Math.random() < 0.12` per frame) all run per-frame, so a 144 Hz display gets ~2.4× the spawn and fire rate of a 60 Hz display. Convert each to a per-second rate scaled by `dt` (e.g. `Math.random() < ratePerSecond * dt`).
3. **Negative HP bar rendering**: `sub.hp` and `base.hp` can go below zero before the lose check, making the HP bar rectangles draw with negative width. Clamp HP to 0 on damage (or clamp the bar ratio with `Math.max(0, ...)`).
4. **Game keys scroll the page**: Space and arrow keys are not `preventDefault()`ed; in an iframe or scrollable embed they scroll the host page. Prevent default for the game's control keys only.

### P2 — Attract & UX hardening

5. **Persistent best score**: store the best score in `localStorage` (e.g. key `ocean_best_score`), show `BEST: n` on the HUD and on the game-over overlay. This gives the endless attract loop a visible long-term hook.
6. **Persist sound preference**: remember the sound on/off choice in `localStorage` and restore it on load (WebAudio still requires the first user gesture — keep `initAudio()` on the first click/keydown before honoring a stored "on" preference).
7. **Responsive canvas scaling**: the canvas is fixed at 960×540 and clips on smaller screens. Scale it down with CSS (preserving the 16:9 ratio and the 960×540 logical resolution) and correct mouse coordinates in the restart-button hit test by the actual scale factor (`canvas.width / rect.width`).
8. **Idle attract motion**: when there is no player input for ~6 seconds, let the submarine drift gently (e.g. slow sine-wave patrol within its movement bounds) so an unattended screen still looks alive. Any real key input takes over instantly and resets the idle timer. Keep it subtle — no auto-dodging AI.
9. **Minor cleanup**: remove the redundant `if (isSoundOn)` guard around `sfx.launch(120)` in `Enemy.shoot()` (the sfx functions already check `isSoundOn`), and clamp the gauge label position so HUD text never overlaps the gauges.

### P3 — Deferred (do not start in this pass)

- Touch controls for mobile.
- Escort ships taking damage / temporary disable (changes balance; needs playtesting).
- Wave/stage structure or new enemy types.
- Visual rework of the surface-lane waterline (surface ships render above the drawn wave line at `SURFACE_LAYER`; acceptable as a pseudo-3D lane presentation for now).

### Non-goals

- No start menus, pause screens, or difficulty selectors — instant start and the 7-second auto-restart loop are the core of the attract identity.
- No frameworks or build steps; the game stays one self-contained HTML file.

## Local File

- Main game: `ocean/index.html`
