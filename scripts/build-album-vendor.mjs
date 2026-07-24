import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const output = new URL('../album/vendor/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await cp(new URL('../node_modules/mediabunny/dist/bundles/mediabunny.min.mjs', import.meta.url), new URL('mediabunny.mjs', output));
await cp(new URL('../node_modules/@mediabunny/aac-encoder/dist/bundles/mediabunny-aac-encoder.min.mjs', import.meta.url), new URL('mediabunny-aac-encoder.mjs', output));
await cp(new URL('../node_modules/@ffmpeg/ffmpeg/dist/esm/', import.meta.url), new URL('ffmpeg/', output), { recursive: true });
await cp(new URL('../node_modules/@ffmpeg/util/dist/esm/', import.meta.url), new URL('ffmpeg-util/', output), { recursive: true });
await mkdir(new URL('ffmpeg-core/', output), { recursive: true });
await cp(new URL('../node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js', import.meta.url), new URL('ffmpeg-core/ffmpeg-core.js', output));
await cp(new URL('../node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm', import.meta.url), new URL('ffmpeg-core/ffmpeg-core.wasm', output));
await mkdir(new URL('licenses/', output), { recursive: true });
await cp(new URL('../node_modules/mediabunny/LICENSE', import.meta.url), new URL('licenses/mediabunny-LICENSE.txt', output));
await cp(new URL('../node_modules/@mediabunny/aac-encoder/LICENSE', import.meta.url), new URL('licenses/mediabunny-aac-encoder-LICENSE.txt', output));
await writeFile(new URL('licenses/ffmpeg-wasm-NOTICE.txt', output), `ffmpeg.wasm packages\n@ffmpeg/ffmpeg 0.12.10\n@ffmpeg/util 0.12.1\n@ffmpeg/core 0.12.6\nLicense: MIT\nSource: https://github.com/ffmpegwasm/ffmpeg.wasm\n`);

const standardHtml = await readFile(new URL('../album/index.html', import.meta.url), 'utf8');
const localHtml = standardHtml.replace('const LOCAL_ENCODERS = false;', 'const LOCAL_ENCODERS = true;');
if (localHtml === standardHtml) throw new Error('Unable to find the local encoder build marker in album/index.html.');
await writeFile(new URL('../album/index.local.html', import.meta.url), localHtml);

console.log('Offline album written to album/index.local.html with dependencies in album/vendor/.');
