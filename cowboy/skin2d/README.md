# Cowboy × SKIN2D

`vendor/` contains the original SKIN2D core/spec/motion source copied from
`MovieBaker/skin2d/src` on 2026-10-22. The source project is not modified.
The adapter uses SKIN2D's actual PNG validation/slicing, hierarchical transforms,
keyframe sampling and character renderer, rather than a sprite-sheet imitation.

`adapter.ts` paints seven 512×512 SD skin atlases and binds them to game state.
The cowboy's front arm follows auto-aim; muzzle coordinates are derived from
the same weapon bone used to draw the gun. All five weapons keep their original
combat rules. Monsters share the original walk/run/hit motions with distinct skins.

`runtime.js` is a checked-in classic browser bundle. Open `../index.html` directly;
no development server, network, build step, or MovieBaker installation is needed.
Keep this file with the page when deploying. The other files are authoring sources.

The skin controls import SKIN2D PNG files, download the default cowboy atlas,
and restore the default appearance. Imports are local to this browser session.
Invalid imports leave the current character intact. The built-in gun replaces
the PNG weapon so changing skins does not change weapon reach or damage.

To rebuild after editing sources, use Vite (the source project already has it):

```sh
node scripts/build-cowboy-skin2d.mjs /path/to/vite/dist/node/index.js
```

`world.ts` defines six illustrated regions and 100 bilingual encounters, including 20 boss stages, lane composition, cadence and bounded campaign-loop scaling. Its background canvases are cached by region. See `../LEVELS.md` for the complete encounter plan.
