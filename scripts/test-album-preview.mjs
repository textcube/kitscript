import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = readFileSync(new URL('../album/index.html', import.meta.url), 'utf8');
const fields = new Map();
const context = vm.createContext({
  $: (id) => {
    if (!fields.has(id)) fields.set(id, {
      value: '18', checked: true, listeners: {},
      addEventListener(type, listener) { this.listeners[type] = listener; },
    });
    return fields.get(id);
  },
  clamp: (value, min = 0, max = 1) => Math.min(max, Math.max(min, value)),
  performance: { now: () => 1000 },
  document: { querySelectorAll: () => [], querySelector: () => ({}) },
  window: { addEventListener() {} },
  ResizeObserver: class { observe() {} },
  setTimeout, clearTimeout,
});
vm.runInContext(html.slice(html.indexOf('    class MosaicApp {'), html.indexOf('    new MosaicApp();')), context);
vm.runInContext(html.slice(html.indexOf('    class MotionEngine {'), html.indexOf('    class TransitionEngine {')), context);
const appPrototype = vm.runInContext('MosaicApp.prototype', context);
const motionPrototype = vm.runInContext('MotionEngine.prototype', context);
vm.runInContext(html.slice(html.indexOf('    class AssetManager {'), html.indexOf('    class MotionEngine {')), context);
const assetPrototype = vm.runInContext('AssetManager.prototype', context);
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

function fixture() {
  const draws = [];
  const builds = [];
  const app = Object.assign(Object.create(appPrototype), {
    sourceMode: 'images', planBuildToken: 0, previewSeekToken: 0,
    previewStartTime: 20, previewStartedAt: 1000, previewRate: 1, previewing: false,
    pendingPreviewSeekX: null, previewSeekPromise: null,
    assets: { images: [{ id: 'image' }] },
    motion: { buildPlan: () => { const build = deferred(); builds.push(build); return build.promise; } },
    renderer: { configure() {}, frameAt(time) { draws.push(time); } },
    saveSettings() {},
    getDuration: () => 100, updateCanvasShape() {},
    syncMediaToProjectTime: async () => {},
    renderProjectFrame: async (time) => { draws.push(time); },
    updatePreviewProgress(time) { this.progress = time; },
  });
  context.$('resolution').value = '1280x720';
  context.$('previewProgress').getBoundingClientRect = () => ({ left: 0, width: 100 });
  return { app, draws, builds };
}

test('settings rebuild preserves a seek made while the plan is pending', async () => {
  const { app, draws, builds } = fixture();
  app.plan = [{}];
  const rebuild = app.rebuildPlan();
  await app.seekPreview(70);
  builds[0].resolve([{}]);
  await rebuild;
  assert.deepEqual(draws, [70, 70]);
  assert.equal(app.progress, 70);
});

test('all three numeric change handlers preserve the plan and keep the seek queue usable', async () => {
  const { app, builds, draws } = fixture();
  const plan = [{}];
  app.plan = plan;
  app.bind();
  for (const [id, value] of [['textSpeed', '35'], ['textLineDelay', '340'], ['textCommaDelay', '280']]) {
    context.$(id).value = value;
    context.$(id).listeners.change();
    await app.queuePreviewSeek(70);
    await app.queuePreviewSeek(30);
    assert.equal(app.plan, plan);
    assert.equal(app.progress, 30);
    assert.equal(app.previewSeekPromise, null);
  }
  assert.equal(builds.length, 0);
  assert.equal(draws.at(-1), 30);
});

test('text edit during an outstanding seek does not start another media seek', async () => {
  const { app, builds } = fixture();
  app.plan = [{}];
  const media = deferred();
  let seeks = 0;
  app.syncMediaToProjectTime = () => { seeks++; return media.promise; };
  const seek = app.queuePreviewSeek(60);
  app.textSettingsChanged();
  media.resolve();
  await seek;
  assert.equal(seeks, 1);
  assert.equal(builds.length, 0);
  assert.equal(app.progress, 60);
  assert.equal(app.previewSeekPromise, null);
});

test('missing video seeked event cannot permanently block later slider requests', async () => {
  const { app } = fixture();
  const listeners = new Map();
  const video = {
    src: 'test-video', currentTime: 0, duration: 100,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
    requestVideoFrameCallback: (fn) => fn(),
  };
  const assets = Object.assign(Object.create(assetPrototype), { video: { duration: 100 }, videoElement: video });
  app.plan = [{}];
  app.syncMediaToProjectTime = (time) => assets.prepareVideoFrame(time);
  const seek = app.queuePreviewSeek(60);
  await seek;
  assert.equal(app.progress, 60);
  assert.equal(app.previewSeekPromise, null);
  assert.equal(listeners.size, 0);
  await app.queuePreviewSeek(60);
  assert.equal(app.progress, 60);
});

test('only the latest settings rebuild installs its plan', async () => {
  const { app, draws, builds } = fixture();
  const first = app.rebuildPlan();
  const second = app.rebuildPlan();
  const newest = [{ id: 'new' }];
  builds[1].resolve(newest);
  await second;
  builds[0].resolve([{ id: 'old' }]);
  await first;
  assert.equal(app.plan, newest);
  assert.deepEqual(draws, [20]);
});

test('a seek supersedes a rebuild waiting for a media frame', async () => {
  const { app, draws, builds } = fixture();
  const media = deferred();
  const waiting = deferred();
  app.syncMediaToProjectTime = () => { waiting.resolve(); return media.promise; };
  const rebuild = app.rebuildPlan();
  builds[0].resolve([{}]);
  await waiting.promise;
  app.syncMediaToProjectTime = async () => {};
  await app.seekPreview(80);
  media.resolve();
  await rebuild;
  assert.deepEqual(draws, [80]);
  assert.equal(app.progress, 80);
});

test('overlapping worker requests resolve with their own responses', async () => {
  const listeners = new Set();
  const messages = [];
  const motion = Object.assign(Object.create(motionPrototype), {
    nextRequestId: 0,
    worker: {
      addEventListener: (_, fn) => listeners.add(fn),
      removeEventListener: (_, fn) => listeners.delete(fn),
      postMessage: (data) => messages.push(data),
    },
  });
  const first = motion.buildPlan([{ id: 'first' }], 10, 10);
  const second = motion.buildPlan([{ id: 'second' }], 20, 20);
  for (const message of messages.reverse()) {
    for (const listener of [...listeners]) {
      listener({ data: { requestId: message.requestId, motions: [{ id: message.ids[0] }] } });
    }
  }
  const plans = await Promise.all([first, second]);
  assert.equal(plans[0][0].asset.id, 'first');
  assert.equal(plans[0][0].duration, 10);
  assert.equal(plans[1][0].asset.id, 'second');
  assert.equal(plans[1][0].duration, 20);
  assert.equal(listeners.size, 0);
});
