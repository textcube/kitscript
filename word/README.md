# Eternal Invasion: Sheriff of Word City

A single-file HTML5 canvas spelling game. Letters (A–Z) stream in from the right; the player's orb sits on the left, auto-firing a short-range twin shot. Letters that belong to the current target word are "spies" (shoot or ram them to fill the word's slots); every other letter is a "civilian" — hit one and you lose a heart. A definition hint and empty slots show the hidden word; destroying its letters spells it out. Complete a word to heal, gain mana, and roll the next word. Charge mana to 100 and fire **Overload**, which reveals spy/civilian color-coding and clears pressure. Five hearts; difficulty (letter speed + spawn rate) ramps with real elapsed time until you die, then it loops.

## Design Identity (attract-first)

Like other kitscript games, this game is built to be watchable, not just playable:

- Starts instantly with no menu (words load from a built-in mission database).
- A sophisticated auto-pilot AI flies the orb by default (`AUTO` badge): it scores incoming spies by urgency and needed-letter weight, plans shoot-vs-ram approaches, routes around civilians, dodges frontal blockers, and auto-fires Overload when swarmed. The game plays itself as a spectacle.
- Player input is optional and layered on top: drag (mouse/touch) or WASD/arrows to steer, Space for Overload. After 10 seconds of no input the AI resumes (`MANUAL (Ns)` countdown on the badge).
- On defeat, the game auto-restarts after 7 seconds (or instantly via **FORCE REBOOT**), looping forever as an attract demo.

Improvements must preserve this identity. Do not add menus that block start, difficulty selectors, or anything that interrupts the instant-start / auto-loop flow. (The Settings modal editing the word list is fine — it's optional and pauses only while open.)

## Current Features

- Hidden-word spelling loop: definition hint + length slots, fill slots by destroying matching letters, duplicate-letter aware (fills leftmost empty matching slot).
- Letters are visually uniform (cyan) until **Overload** reveals spy=green / civilian=red — reading each incoming letter against the target word is the core skill.
- Advanced auto-pilot: `chooseAutoTarget` (urgency × needed-char weight × shot-window risk), civilian path/lane/shot-line risk fields, frontal-blocker dodging, safest idle-fire lane selection.
- Mana/skill economy: passive regen + kill rewards; Overload (100 mana, 5s) with expanding scan-wave FX.
- Hearts with heal-on-word-complete; screen shake, hit-flash, particle bursts, "SECURED"/"BREACH" floating FX.
- Editable mission database (Settings) parsing `WORD - HINT` lines; procedural neon background (parallax stars + perspective grid) and CRT overlay.
- WebAudio procedural SFX; responsive header with mobile breakpoints; drag + touch steering.

## Code Review & Improvement Plan (2026-07-09)

Full review of `word/index.html` (972 lines). Delta-time and mark-and-filter removal are already implemented for gameplay movement — so this list is lighter on core-loop bugs than the other games and heavier on consistency, dead code, and attract/UX polish. Ordered by priority. None change the attract-first scope.

### P1 — Bugs (fix first)

1. **Dead AI code block shipped in production**: `update()` contains an `if (false) { ... }` block (~lines 837–865) holding an entire earlier version of the autopilot ("중앙 복귀 로직 삭제…"), never executed. Delete it entirely — it's ~29 lines of confusing dead code that shadows the real `chooseAutoTarget`/`applyAutoMovement` logic above it.
2. **Double initialization on load**: `window.onload` calls `saveSettings()` (which itself ends with `startGame()`) and then calls `startGame()` again — the game inits twice and `nextWord()` runs twice on every load. Call the init path once (e.g. `resize(); saveSettings();` and let that be the single start, or drop the `saveSettings()` call from `startGame`'s callers).
3. **Delta-time applied inconsistently**: gameplay movement scales by `deltaScale`, but several per-frame decays do NOT, so on a 144 Hz display they run ~2.4× too fast: particles (`pa.x += pa.vx; pa.life -= 0.02`, line ~902), FX lifetimes (`f.life -= 0.02`, ~904), screen-shake decay (`state.shake *= 0.9`, ~906), letter `hitFlash--` (~881), and the background `gridOffset` step (~369). Scale each by `deltaScale` (use `Math.pow(0.9, deltaScale)` for the shake decay) so effects last the same wall-clock time at any refresh rate.
4. **Stuck keys on focus loss**: `state.keys` is never cleared on `blur`/tab switch. A key held while alt-tabbing stays "pressed", pinning the orb in MANUAL mode against a wall and preventing the AI from ever resuming — breaking the attract loop. Clear `state.keys = {}` (and drop manual mode) on `window` blur and `visibilitychange`.
5. **`varColor` vs `getCol` inconsistency**: the `bonus_hit` FX (line ~939) calls `varColor('--spy')` — a `getComputedStyle` DOM read every frame it's alive — while everything else uses the cached `getCol('spy')`. Replace it with `getCol('spy')` and remove the now-unused `varColor` helper.

### P2 — Attract & UX hardening

6. **No score system**: the game tracks hearts/mana/words but exposes no score or run length, so there's nothing to show off or persist — a flat attract demo. Add a visible counter (words SECURED and/or a score from kills + words), and store a best/high value in `localStorage` (key `word_best`, try/catch guarded); show it on the HUD and on the game-over modal (which currently shows only the death reason).
7. **Word list and sound preference aren't persisted**: edits in the Settings mission database are lost on reload, and audio resets to OFF every load. Persist the word list (`word_list`) and sound flag (`word_sound_on`) in `localStorage`; restore both on load; create/resume the AudioContext on the first user gesture.
8. **Immediate word repeats**: `nextWord()` picks uniformly at random and can select the same word twice in a row — dull to watch. Exclude the current word when the list has more than one entry.
9. **Instant restart on any key**: on the game-over overlay, restart on any keypress or pointer/tap in addition to FORCE REBOOT (keep the 7-second auto-restart).
10. **Freeze-frame on game over**: `update()` is skipped when `!active`, so particles and FX freeze for the 7-second countdown while only the background animates. Let particle/FX decay (and shake settle) keep running during game-over so the scene stays alive.
11. **HiDPI canvas**: `resize()` sets the backing store to CSS pixels only, so letters/text render blurry on retina displays. Scale the backing store by `devicePixelRatio` (cap ~2) with `ctx.setTransform`, keeping logical coordinates in CSS pixels.
12. **Minor cleanup**: replace the comma-operator spawn line (`spawn(), state.lastSpawn = now`) with a normal block; the `maxHp` field on letters is stored but never read (either render a 2-hit indicator or drop it); set `ctx.font`/`textAlign` once instead of re-setting inside the letter loop each frame.

### P3 — Deferred (do not start in this pass)

- New letter/enemy behaviors, boss words, or combo/streak scoring.
- Balance tuning (spy:civilian spawn ratio, difficulty ramp shape, mana economy).
- Richer mobile ergonomics beyond the existing drag steering.

### Non-goals

- No start menus, pause-to-play gates, or difficulty selectors — instant start and the auto-restart loop are the core of the attract identity. (The optional Settings word-list editor stays.)
- No frameworks or build steps; the game stays one self-contained HTML file.

## Local File

- Main game: `word/index.html`
