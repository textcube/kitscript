# Eternal Invasion: Infection Protocol

A single-file HTML5 canvas infection simulation. A 64×64 grid cellular automaton runs a zombie outbreak: scattered humans (white dots) wander by day and flee to shelters at dusk; a single infection seed incubates for 7 ticks, becomes a zombie, and then — only at night, in total darkness, or from inside abandoned houses — activates to hunt the nearest survivor and infect adjacent humans. A global power reserve drains every tick; when it hits zero, powered houses (the only safe shelters) go dark and the infection becomes unstoppable. The run ends when infection reaches 100%, then auto-restarts. There is no player avatar — the sim is the show.

## Design Identity (attract-first, zero-input)

This is the purest form of the kitscript "관전형(attract)" identity — a simulation you watch, not a game you play:

- Starts instantly, runs itself, and loops forever with **zero required input**. There is no avatar to steer and no auto-pilot to model — the cellular automaton *is* the spectacle.
- The day/night cycle, power drain, human flight, and zombie activation create emergent drama on their own.
- On total infection, an end card shows and the sim auto-restarts after 7 seconds.
- The only control is the sound toggle.

Improvements must preserve this identity. Do not add menus, difficulty selectors, win/lose player-goals, or anything that turns the observation piece into a click-to-play game. Any interaction added must be strictly optional "low-density" flavor (see P3) that never blocks the auto-loop.

## Current Features

- 64×64 cellular-automaton grid with six cell types (empty, human, infected, zombie, powered house, abandoned house) and sub-type tracking so entities remember the terrain they stand on.
- Emergent human AI: random daytime wandering, dusk flight to the nearest shelter (Manhattan-distance seek), and safety inside lit powered houses.
- Zombie AI: incubation (infected → zombie after 7 ticks), night/darkness/abandoned-house activation gating, nearest-survivor pursuit, and probabilistic neighbor infection boosted at night and in blackout.
- Global power reserve that drains to a "total darkness" blackout state, flipping powered houses from safe to exposed.
- 24-second day/night cycle driving background color transitions, HUD status, and cycle SFX.
- Stylized rendering: pulsing human dots, jittery infected squares, glowing zombie diamonds, procedural house windows, scanline grid, vignette, and a CSS CRT overlay.
- Live HUD (infection rate, power bar, survivor count) and a 7-second auto-restart end overlay.
- WebAudio procedural SFX (infection, cycle change, countdown beep), off by default.

## Code Review & Improvement Plan (2026-07-10)

Full review of `pandemic/index.html` (722 lines). Because the tick loop is a fixed `setInterval(500ms)`, this game does **not** have the frame-rate-scaling gameplay bug the action titles had — but the render loop, cellular-automaton integrity, and performance all have issues that degrade the spectacle. Ordered by priority. None change the zero-input attract scope.

### P1 — Bugs (fix first)

1. **Procedural house windows strobe every frame**: in `render()` (lines ~647–650) lit windows are re-rolled with `Math.random() > 0.1` on *every* animation frame, so windows flicker violently between yellow and dark 60+ times a second instead of twinkling occasionally — and the flicker rate scales with refresh rate. Give each window cell a stable state that twinkles slowly on a time base (e.g. seed from `x,y` and modulate with `Math.sin(now/500 + seed)`), so windows shimmer gently and identically at any refresh rate.
2. **Infected jitter is framerate-dependent**: the "jittery square" (lines ~679–682) offsets by a fresh `Math.random()` each frame, so infected cells vibrate faster on high-refresh displays. Drive the jitter from a time base (`now`) with a per-cell phase so the vibration looks the same at 60 Hz and 144 Hz.
3. **Cellular-automaton entity duplication / loss**: movement reads the original entity from `grid[y][x]` and writes to `nextGrid`, but processing is row-major and a cell that already *received* a mover into `nextGrid[y][x]` earlier this tick gets overwritten when its original occupant is then processed and vacates (human move ~461–466, zombie move ~507–518). This silently destroys or duplicates entities. Add an occupancy guard: track which `nextGrid` cells have already been claimed this tick (a parallel `moved`/`occupied` set) and skip moving an entity whose source cell was already overwritten, or whose destination was already claimed.
4. **Placeholder homepage link**: the header "Homepage" button points at `https://example.com` (line ~215) — a shipped placeholder. Point it at the real kitscript/BuntGames URL used by the sibling games.
5. **Uncapped render delta**: `delta = now - lastFrameTime` (line ~605) is added straight into `timeInCycle`. After a tab is backgrounded, the first frame's delta is huge and can skip an entire day/night transition (and its SFX/color change). Clamp `delta` (e.g. to ~100 ms) so the cycle advances smoothly on return.

### P2 — Attract & UX hardening

6. **Persist sound preference**: `isSoundEnabled` resets to OFF every load. Persist it in `localStorage` (key `pandemic_sound_on`, try/catch guarded), restore the button state on load, defer AudioContext creation to the first user gesture, and `resume()` a suspended context inside the toggle.
7. **Add a persisted "record" stat**: the sim tracks nothing run-to-run, so there is nothing to anchor repeat viewing. Track a meaningful record — e.g. **Longest Resistance** (real seconds from start until total infection) and/or **Peak Survivors** — display it in the HUD and store the best in `localStorage` (key `pandemic_record`, try/catch). This gives the eternal loop a sense of progression without adding player control.
8. **Show run results on the end card**: the end overlay only says "GLOBAL INFECTION COMPLETE" + countdown. Add the finished run's stats (how long humanity lasted, peak survivors, vs. the record) before the 7-second reset, so the climax of each loop reads as an outcome.
9. **Performance — precompute static shelter list**: `findNearestShelter` and `findNearestSurvivor` scan all 4096 cells per entity per tick (thousands of full-grid scans/tick with hundreds of entities), and each tick also deep-clones the whole grid via `JSON.parse(JSON.stringify(grid))`. Shelters never move after `initGrid`, so cache their coordinates once in a list and seek against that; replace the JSON deep-clone with a lighter per-cell copy. This removes jank spikes that stutter the spectacle on lower-end machines.
10. **HiDPI canvas**: `resize()` sizes the backing store in CSS pixels only, so the small grid cells render blurry on retina displays. Scale the backing store by `devicePixelRatio` (cap ~2) with `ctx.setTransform`, keeping logical coordinates in CSS pixels.
11. **Minor cleanup**: `image-rendering: pixelated` on the canvas for crisp cell edges; guard `triggerEnd`'s countdown interval so a stray double-call can't stack intervals (currently only the `gameActive` flag protects it); optionally reseed the infection origin away from dense human clusters occasionally so successive loops don't all look identical.

### P3 — Deferred (do not start in this pass)

- **Optional low-density interaction**: consistent with the kitscript "저밀도 조작" identity, a single optional intervention (e.g. click a cell to drop a quarantine/barricade, call a one-shot airstrike, or restore power) — but it must be purely optional flavor and never block or gate the zero-input auto-loop. Deferred because it's a design addition, not a fix.
- New scenarios, mutation/variant events, or a mutation that lets humans occasionally fight back.
- Pacing/balance tuning of the day-night infection curve and power-drain rate (worst-case runs can approach ~7 minutes before blackout forces completion).

### Non-goals

- No start menus, difficulty selectors, or player win/lose objectives — instant start and the zero-input auto-restart loop are the core of this observation piece.
- No frameworks or build steps; the sim stays one self-contained HTML file.

## Local File

- Main simulation: `pandemic/index.html`
