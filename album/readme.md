# Project Mosaic

Project Mosaic is a single-file, rule-driven video generator. It turns a set of images (or one source video), an optional soundtrack, and a text stream into a rendered video or a standalone HTML player — without a traditional editing timeline.

Instead of arranging hundreds of clips by hand, the user defines rules once (scene duration, transition, motion, text pacing) and the composition flows on its own.

## Current Build

- Entry file: `album/index.html`
- No build step
- No backend
- Runs as a plain browser HTML file
- Canvas 2D rendering, Web Audio analysis, Web Worker motion planning
- Media persisted in IndexedDB (`project_mosaic_media_v1`)
- Settings persisted in localStorage (`project_mosaic_settings_v1`)
- First run auto-creates 5 generated sample images and a 30-second demo beat

## UI Layout

Left panel with three tabs plus a generate area:

- **Assets**: source type toggle (Image Sequence / Video), image or video upload, optional audio upload, per-image POI (point of interest) selector, source volume sliders
- **Rendering Rules**: transition, resolution (16:9 / 9:16 / 4:5 / 1:1), frame rate (30/60), image duration, transition frames, waveform toggle, motion distribution summary, timing summary
- **Text Stream**: font, size, visible lines, color, typing speed, line/comma delays, cursor/outline/shadow toggles, end behavior, home button URL, broadcast text editor, "Load Reader Documents" button

Right workspace: preview canvas with play/restart/4x speed controls and progress bar, plus a render progress footer with download link.

## Main Systems

### Asset Pipeline (`MediaStorage`, `AssetManager`)

- Images: JPG/PNG/WEBP, decoded via `Image.decode()`, each with a POI anchor
- Video mode: single MP4/WEBM/MOV source (transitions disabled)
- Audio: MP3/WAV/M4A; duration becomes the master timing source when present
- Everything is persisted to IndexedDB and restored on reload
- Audio is pre-analyzed into a 720-bin peak waveform and up to 3600 frames of 24-band spectrum data (`spectrumVersion: 3`) so baked players can visualize without an AnalyserNode

### Motion (`MotionEngine`)

Motion plans are built in a Web Worker:

- 80% zoom in (100% → 110%)
- 10% zoom out (110% → 100%)
- 10% pan (subtle axis drift at 106% scale)
- All anchored to the per-image POI

### Transitions (`TransitionEngine`)

- `mosaic` — deterministic tile-shuffle reveal
- `fade` — crossfade
- `rotation` — page turn (right page folds over the spine; the current image is frozen during the turn so motion never shifts the spine)

### Renderer

- Scene drawing with cover-fit, POI-anchored motion transforms
- **Text Stream**: pre-planned typing broadcast. Lines are wrapped by measured width, each character gets a timestamp (comma/pause-aware), lines scroll upward with smooth tweens, with repeat or stop-and-exit end behavior
- **Audio visualization**: 24 log-spaced bands rendered as a segmented equalizer with per-band adaptive floor/peak normalization and gravity-style falloff. Live playback uses an `AnalyserNode`; baked players interpolate the precomputed spectrum frames

### Encoder

- Records the canvas with `captureStream` + `MediaRecorder` (VP9/VP8 WebM, 12 Mbps) in real time, driving frames by audio clock
- Converts WebM to H.264 MP4 in-browser via ffmpeg.wasm, loaded on demand from CDN (esm.sh / unpkg)
- WebM download is offered immediately; MP4 follows when conversion succeeds

### Bake HTML

`Bake HTML` produces a fully standalone player file:

- All images and audio embedded as base64 data URIs
- Waveform + spectrum frames embedded (no Web Audio required for the visualizer)
- Minimal player chrome: play/pause, home link, restart, mute, loop, time, fullscreen
- Keyboard: Space (play/pause), M (mute), R (repeat), F (fullscreen)
- Poster image + loading state for slow loads

### Reader Integration

`Load Reader Documents` pulls text from `reader/index.html` via the shared localStorage key `textcast_reader_v2_store`, joining all enabled documents into one broadcast stream.

## Baked Examples

`ex1.html` – `ex5.html` are baked outputs of the K-Food artwork series (10–11 images plus an MP3 track each).

**Warning:** these files are 52–80 MB each (~307 MB total) because every asset is embedded as base64. GitHub already warns about them on every push (recommended max 50 MB, hard limit 100 MB).

## Known Issues / Design Notes

- The baked examples bloat the repository and every clone; see improvements below.
- Baking embeds the original PNG files untouched. A 2–3 MB PNG becomes ~4 MB of base64; ten of them plus audio is how an 80 MB player happens.
- Korean fonts (Noto Sans KR, Nanum Gothic) are offered in the font list but never loaded by the page — they only work if installed on the viewer's system, and text wrapping is measured before any web font could load.
- Rendering is real-time: a 4-minute song records for 4 minutes, and dropped frames under load end up in the output. There is no deterministic offline render path.
- MP4 conversion depends on CDN downloads at runtime (fails offline; ~30 MB ffmpeg core).
- Transition duration is not clamped against scene duration (120 transition frames at 30 FPS = 4 s inside a 2 s scene).
- The preview progress bar is display-only; there is no seeking/scrubbing.
- Images cannot be reordered after adding; order is add order.
- Per-image duration overrides are not supported (one global duration).
- Video mode supports exactly one clip with transitions disabled.
- The standalone player duplicates the renderer, text stream, and visualizer logic as a minified copy inside a template string — two implementations to keep in sync.

## Improvements

### Repository

- Remove `ex1.html`–`ex5.html` from the repo (or keep one small sample). Host demos on GitHub Pages/Releases or external storage, or move them to Git LFS. This is the highest-impact change: it fixes push warnings and shrinks clones by ~300 MB.
- If examples must stay, re-bake them with compressed assets (see below) to get each file well under 10 MB.

### Bake Pipeline

- Recompress images during bake: draw to canvas at the output resolution and export WebP/JPEG (quality ~0.85). Typical savings of 5–10x with no visible loss at video resolutions.
- Offer an audio bitrate choice, or at least warn about the projected file size before baking.
- Show the estimated standalone file size in the UI as assets are added.

### Rendering & Export

- Add a deterministic offline render path with WebCodecs (`VideoEncoder`) + an MP4 muxer: frame-exact output, renders faster than real time, and removes the ffmpeg.wasm CDN dependency for the common case.
- Keep MediaRecorder as the fallback for browsers without WebCodecs.
- Clamp transition frames to a fraction of the scene duration.
- Load the offered web fonts (`document.fonts.load`) before measuring text, or self-host the two Korean fonts.

### Editing UX

- Drag-to-reorder images in the asset list.
- Click-to-seek on the preview progress bar.
- Per-image duration override and per-image transition choice.
- Visual POI picker (click the thumbnail to set the focus point instead of a dropdown).
- Multi-video sequences, or video + image mixed timelines, with transitions.

### Text Stream

- Live preview of font/size changes without restarting playback.
- Per-line styling markers (e.g. a leading `#` renders as a headline).
- SRT/VTT export of the computed line timings for subtitle reuse.

### Player

- Add a seek bar to the standalone player (currently play/pause/restart only).
- Optional watermark/credit line rendered from bake settings.
- `prefers-reduced-motion` handling for the equalizer and text tweens.

### Code Structure

The current project is intentionally a single HTML prototype. If it grows, split into modules and share them between the editor and the baked player instead of maintaining a minified copy:

- `engine/storage.js`
- `engine/assets.js`
- `engine/motion.js`
- `engine/transitions.js`
- `engine/renderer.js`
- `engine/encoder.js`
- `player/player.js` (used by both the editor preview and the bake template)

For now, keep the single-file version easy to copy and deploy.

## Important Design Principle

Project Mosaic is rule-driven, not timeline-driven. New features should stay declarative: a setting the user chooses once that shapes the whole composition, never a hand-placed keyframe.
