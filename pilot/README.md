# Eternal Invasion: Dawn of Strike Back

A single-file HTML5 canvas **Scramble-style shoot-'em-up** with six hand-authored stages, two big boss fights and a mid-boss, procedural chiptune music, lives/continues, checkpoints, a local top-10 high-score table and full keyboard / mouse / touch support. One self-contained file (`index.html`): no frameworks, no build step, no external assets (all graphics and audio are generated procedurally).

## Direction (2026-09-30)

The game started life as an "attract-first" toy: instant start, no menus, an auto-pilot that played itself. That direction has been **replaced**. The goal is now a proper arcade game with real level design:

- a title screen (with the auto-pilot demo playing behind it as the classic arcade **attract mode**), a start, and a real game loop;
- authored stages with their own themes, terrain, enemy sets, set-pieces and pacing;
- lives, checkpoints, fuel economy designed per stage, bosses, scoring, results, continue, high scores, ending and a harder second loop.

The auto-pilot survives as (1) the attract demo behind the title and (2) the headless test bot used for verification. During real play the player flies the ship.

Non-goals: no frameworks or build step (stays one HTML file), no external assets, no online services (scores are local).

## How to play

| Input | Action |
| --- | --- |
| Arrows / WASD | Steer |
| Space / X / Z | Drop a bomb |
| P / Esc | Pause (also pauses automatically when the tab loses focus) |
| Touch | Drag anywhere to steer (relative drag), tap or the BOMB button to bomb, `II` button to pause |
| Mouse | Drag to steer, click to bomb |
| Enter / Space / tap | Start, advance results, continue |

The cannon **auto-fires**. Bombs arc forward and down and are the only way to hit ground targets (a bomb blast also takes out neighbouring ground units). Air enemies are shot by lining up with them.

- **Fuel** drains constantly. Bomb/shoot **NRG tanks** on the ground or grab/shoot floating **F pods** to refuel (+34). Run dry and you crash. Fuel is frozen during boss fights.
- **Checkpoints** (yellow ticks on the progress bar) save your place; you respawn there after losing a life with a fuel floor of 72%. Boss fights restart just before the arena.
- **Power-ups** (placed by design, never random): **S** shield (absorbs one hit), **W** spread shot (until you die).
- **Lives**: 3 to start, extra lives at 20,000 / 60,000 / 120,000 points and every 80,000 after. When you run out there is a 10-second **Continue?** (3 per game); otherwise the run ends and, if the score qualifies, you enter 3-letter initials (keyboard letters, or the on-screen keyboard on touch).
- **Chain**: kills in quick succession build a score multiplier (x2 to x4).
- **Stage clear bonus**: clear bonus, remaining fuel, enemies-destroyed %, no-miss bonus (+ boss bonus). After stage 6 the credits roll and **Loop 2** starts: 10% faster scroll, faster enemy fire, tougher bosses and more fuel drain (scaling up to loop 5).

## Stages

Each stage is authored data (see `SECTION 4` in `index.html`): terrain keypoint segments, enemies and fuel placed at explicit world positions, tutorial hints, checkpoints and a scroll speed. Pacing runs intro, build, peak, breather, climax. Fuel drain for each stage is tuned at load time so the stage is finishable while collecting only ~60% of the fuel (see Verification).

| # | Name | Design intent |
| --- | --- | --- |
| 1 | Outskirts | Gentle hills, open sky. Teaches shooting, bombing and refuelling with on-screen hints; introduces tanks, turrets, fighters and the first SAM. |
| 2 | Rocket Field | Ground rockets wake up as you approach (bomb them first); staggered volleys, SAM batteries, a low ceiling ridge with turrets in the middle, a triple-SAM gauntlet at the end. |
| 3 | UFO Cavern | Enclosed cave that squeezes down to 120 px; sine-wave UFO swarms, stalactites that drop as you pass, mine lines, floating fuel pods. Ends with the **Hive Mothership** boss. |
| 4 | Meteor Belt | No floor, no walls: indestructible meteors in walls-with-a-gap and diagonal rain, fast fighters, mines; fuel only from floating pods placed in risky spots. |
| 5 | Citadel | Blocky city with narrow streets and vertical shafts (40-110 px of free room), rooftop and ceiling turrets, rockets, timed laser gates. Ends with the **Citadel Warden** mid-boss. |
| 6 | Core | The reactor maze: tightest corridors, back-to-back laser gates, SAMs and fighters, scarcest fuel. Ends with the **Reactor Guardian** final boss. |

### Bosses

- **Hive Mothership** (stage 3): phase 1 fan shots + UFO escorts; phase 2 rotating ring bursts; phase 3 telegraphed horizontal dashes across the whole screen (a red line shows the lane).
- **Citadel Warden** (stage 5): three cannons to destroy (the core is shielded), then the exposed core fires fans and homing missiles and calls down telegraphed full-height laser columns.
- **Reactor Guardian** (stage 6): four orbiting satellites shield the core; then a 3-arm spiral plus telegraphed laser lanes; at 50% core HP it goes into **Overload** (satellites return, 4-arm spiral, 3 lanes at once).

## Presentation

- Per-stage palette, parallax backdrop and terrain decoration; stage intro cards, hyperspace warp between stages, results tally, ending credits.
- Procedural WebAudio chiptune (lead/arp/bass/drums scheduled from the render loop, no timers): title, one theme per stage, two boss themes, entry and ending themes, plus clear / game over / extra-life / start jingles and SFX. **Music** and **SFX** toggles (top bar and pause menu), persisted; everything degrades silently if Web Audio or `localStorage` is unavailable.
- Screen shake, flashes, shockwave rings, additive sparks, popups, low-fuel alarm; `prefers-reduced-motion` disables shake, flashes and slow-motion.
- Responsive letterboxed layout for desktop, landscape and portrait phones, HiDPI backing store, compact HUD, safe-area insets, no page scroll.
- Persistence (`localStorage`): `pilot_hiscores_v2` (top 10), `pilot_max_stage` (title offers **Continue: Stage N**), `pilot_music_on`, `pilot_sfx_on`, `pilot_best_score`.

## Code layout (`index.html`)

1. Engine basics (constants, helpers, storage, URL params)
2. Audio: SFX + music sequencer and track data
3. Persistence (high scores, progress)
4. **Stage data** (terrain DSL, six stages, fuel tuning, terrain analysis)
5-13. Game state, entities, run lifecycle, effects, score/lives/fuel, destruction, player actions, per-frame simulation, stage clear
15. **Bosses**
16. **Bot / auto-pilot** (predictive planner: hazard prediction + terrain band + ballistic bombing)
17. Renderer
18-22. Input, DOM screens (title, how to play, scores, pause, results, continue, entry), game flow, HUD, main loop
23. **Debug hooks**
24. Boot

## Debug / verification hooks (hidden, off by default)

Only enabled through URL parameters; nothing is reachable from normal play.

| Param | Effect |
| --- | --- |
| `?stage=N` | Skip the title and start at stage N (1-6). Does not touch saved progress. |
| `?god=1` | Invulnerable (terrain pushes you out instead of killing). |
| `?bot=1` | The bot flies the ship. |
| `?speed=N` | Run N game frames per real frame (0.25-12). |
| `?cam=X` | Start the stage at world x X (use with `stage`). |
| `?loop=N` | Start in loop N. |
| `?debug=1` | Expose `window.__pilot` (also implied by any of the params above): `run(stage, {god, lives, cam, maxFrames})` synchronous headless run returning `{cleared, deaths, nan, minFuel, bossKilled, ...}`, `analyze(stage)` (min corridor gap + reachability sweep), `fuelTimeline`, `STAGES`, `step(n)`, etc. |

## Verification (headless Chromium)

- **Terrain**: every stage has a minimum gap of at least 121 px (stages 3/5/6: 121 / 138 / 148 px), and a reachability sweep at the ship's real climb speed (with a 44 px ship window) finds a passable path through all six stages.
- **Fuel**: drain is tuned so that a run collecting only 60% of the fuel sources never runs dry across 5 even-skip patterns and 600 seeded random subsets; an independent check with 400 fresh random 60% subsets per stage reports a worst-case minimum fuel of about 4 to 21% with no failures.
- **Bot, god mode**: all six stages (bosses included) clear with no NaN and no exceptions in loops 1, 2 and 3.
- **Bot, no god mode**: clears stages 1-4 with no deaths (3 of 3 runs each, three lives); stages 5 and 6 need continues/checkpoints (clears 3 of 3 with unlimited lives at about 6-8 deaths each), which is deliberately harder than the bot's reaction quality.
- **Flow** (real Chromium, keyboard and touch emulation): title, how to play, high scores, start, play, pause (P, blur, button), death, respawn, game over, continue, give up, high-score entry (keyboard and on-screen keys), stage clear tally, warp, next stage, ending credits, loop 2 - with 0 console errors.
