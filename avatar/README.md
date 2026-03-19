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

