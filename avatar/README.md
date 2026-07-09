# Avatar Factory

Avatar Factory is a lightweight avatar motion tool built for speed.

The goal is not to compete with complex professional animation editors. The goal is to let someone open the page, start from a preset, swap visuals, combine a few simple motions, and export quickly.

## Product Direction

- Start from a ready-made preset, not a blank canvas.
- Keep animation simple: `POSITION`, `ROTATION`, `SCALE`.
- Combine complexity through parent-child node structure.
- Use node order as draw order.
- Use duplication to enrich visuals instead of adding advanced design systems.
- Keep the timeline fast and direct rather than turning it into a full keyframe editor.

## Current Features

- Default geometric avatar preset with body, head, arms, and legs.
- Node hierarchy for parent-child transforms.
- Local transform editing for position, rotation, and scale.
- Visual editing with rectangle, circle, and uploaded sprite support.
- Simple motion system with target-based animation:
  - `POSITION`
  - `ROTATION`
  - `SCALE`
- Motion timing controls:
  - duration
  - strength
  - delay
  - loop
- Canvas drag editing for node placement.
- JSON save/load.
- IndexedDB autosave.
- PNG snapshot export.
- WebM video export.

## Interaction Model

The intended workflow is:

1. Start from the default preset.
2. Select a part.
3. Change the visual or upload a sprite.
4. Pick one motion target for that node.
5. If you need multiple motion types on one visible part, duplicate the node or create a child node.
6. Adjust timing and export.

## Structure Rules

- One node should usually own one main motion target.
- If a part needs combined motion, use child nodes.
- If a part needs richer visual layering, duplicate the node.
- If a part needs front/back ordering changes, move the node among siblings.

This keeps the tool easy to learn while still allowing richer output through composition.

## Data Model

Each node contains:

- `id`
- `parent`
- `transform`
- `visual`
- `motion`

Project-level data contains:

- `global.duration`
- `global.fps`
- `nodes`

## Version Notes

### Current Version

The current build focuses on a usable single-page editor with a preset-first workflow.

### Implemented In This Update

- Added `Duplicate` and `Duplicate as Child` actions.
- Added sibling order controls in the node tree.
- Added timeline drag editing for:
  - moving a motion block
  - resizing the start
  - resizing the end
- Updated autosave/export to use project-level global settings as well as nodes.
- Improved node renaming so child references follow the renamed parent.
- Added clearer editor guidance about combining motion through child nodes.

## Code Review & Improvement Plan (2026-07-09)

Full review of `avatar/index.html` (1,277 lines). Items are ordered by priority. None of these change product scope; they fix defects and harden the existing feature set.

### P1 — Bugs (fix first)

1. **Dead code in `updateUI()`**: everything after the `return;` near line 1086 (the old node list / timeline / inspector rendering, ~120 lines) is unreachable legacy code. Delete it entirely.
2. **Canvas selection highlight is broken**: `drawNode()` sets `this.ctx.strokeStyle = 'var(--pro-cyan)'`. Canvas 2D does not resolve CSS variables, so the selection outline renders black. Use the literal color `#00e5ff`.
3. **App can hang on startup**: `loadImgAsync()` never settles if an image fails to load (no `onerror`). A corrupted `imageSrc` in the IndexedDB autosave makes `applyProjectData()`'s `Promise.all` wait forever, so `init()` never reaches `setupEvents()` / `renderLoop()` and the app is dead. Resolve (or resolve-with-null) on error and skip drawing that sprite.
4. **NaN poisoning from numeric inputs**: `updateTransform` / `updateVisual` / `updateMotion` store raw `parseFloat(v)`; clearing an input writes `NaN` into the model, which then persists to autosave. Guard with a fallback to the previous value (or 0). Also guard `getMotionOffset()` against `motion.duration <= 0` (division by zero → NaN transforms).
5. **Root node protection is incomplete**: `deleteNode` refuses `'BODY'` and the delete-button check is hardcoded to `'BODY'`, but `updateNodeId` allows renaming it. After a rename the root becomes deletable and `selectedNodeId = 'BODY'` fallbacks break. Either block renaming the root node or track the root by reference instead of the hardcoded id.
6. **JSON load UX**: on parse failure the error goes only to `console.error` — surface it in the status pill. Also reset `fileInput.value` after load so the same file can be loaded twice.

### P2 — Robustness / UX hardening

7. **Video export compatibility**: `MediaRecorder` with `video/webm;codecs=vp9` throws on Safari and older browsers. Feature-detect with `MediaRecorder.isTypeSupported`, fall back vp9 → vp8 → default webm, and show an error pill when recording is unsupported instead of throwing.
8. **Autosave data-loss window**: `requestSave()` debounces 4 s; closing the tab inside that window loses changes. Flush the pending save on `visibilitychange` (hidden) / `pagehide`.
9. **Drag performance**: `handleMouseMove` and timeline drags call `updateUI()` on every mousemove, rebuilding the node list, timeline, and inspector DOM each frame. During drags, update only what changed (e.g. throttle the full rebuild, or update the inspector numbers and bar positions directly).
10. **Timeline usability**: the ruler has no second markers and the tracks do not scroll horizontally when duration × 50 px exceeds the viewport. Add tick marks with second labels on `#timelineRuler` and shared horizontal scrolling for tracks + ruler (this also covers part of the V2.2 plan).
11. **Circle hit-testing**: canvas picking uses the bounding box for circles; use radial distance for `CIRCLE` visuals.

### P3 — Deferred (tracked in the roadmap below)

- More starter presets, motion copy/paste, compact mobile layout, inspector simplification — see V2.2–V2.4. Do not start these as part of the bug-fix pass.

### Non-goals for this pass

- No keyframe/curve/graph editor features (see "What This Tool Should Not Become").
- No framework or build-step introduction; the tool stays a single self-contained HTML file. Replacing the Tailwind CDN with static CSS is acceptable later but out of scope for the bug-fix pass.

## Next Version Plan

### V2.2

- Add more starter presets such as robot, blob, and animal.
- Add clearer motion presets on top of the current target system.
- Improve timeline readability with second markers and snapping feedback.
- Add quick actions like mirror, reset transform, and duplicate visual layer.

### V2.3

- Add compact mobile and tablet layout behavior.
- Add motion copy/paste between nodes.
- Add better export defaults and browser compatibility fallback for video recording.

### V2.4

- Reduce inspector complexity by separating basic controls from advanced controls.
- Add preset packs for faster batch production.
- Add onboarding hints directly inside the canvas and node panel.

## What This Tool Should Not Become

- A full keyframe editor
- A graph editor
- A curve editor
- A complex rigging system
- A large multi-panel DCC-style tool

If those become the focus, the core value of speed and accessibility is lost.

## Local File

- Main app: `avatar/index.html`

