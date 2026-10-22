import { pathToFileURL, fileURLToPath } from 'node:url';

// Use an installed Vite, or pass its module path as the first argument.
const { build } = process.argv[2] ? await import(pathToFileURL(process.argv[2]).href) : await import('vite');
await build({
  configFile: false,
  publicDir: false,
  build: {
    emptyOutDir: false,
    outDir: fileURLToPath(new URL('../cowboy/skin2d/', import.meta.url)),
    lib: {
      entry: fileURLToPath(new URL('../cowboy/skin2d/adapter.ts', import.meta.url)),
      name: 'CowboySkin', formats: ['iife'], fileName: () => 'runtime.js',
    },
  },
});
