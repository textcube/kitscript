#!/usr/bin/env node
/*
 * pixelart/sprites.js 를 헤드리스 Chromium 에서 실행해 PNG 스프라이트 시트 + JSON 아틀라스를 내보낸다.
 *
 *   node pixelart/tools/export-sheets.js [--chromium /path/to/chromium]
 *
 * 필요: `playwright` npm 패키지 (브라우저 다운로드 불필요 - 설치된 Chromium 경로를 --chromium 으로 지정).
 * 출력: pixelart/sheets/<group>.png, <group>.json, all.png, all.json, preview-*.png
 */
const fs = require('fs'), path = require('path');
let playwright;
try { playwright = require('playwright'); }
catch (e) { try { playwright = require(path.join(process.cwd(), 'node_modules', 'playwright')); } catch (e2) { console.error('playwright 패키지를 찾을 수 없습니다.'); process.exit(1); } }

const args = process.argv.slice(2);
const cIdx = args.indexOf('--chromium');
const exe = cIdx >= 0 ? args[cIdx + 1] : (process.env.CHROMIUM_PATH || undefined);
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'sheets');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await playwright.chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.setContent('<!doctype html><body style="margin:0"></body>');
  await page.addScriptTag({ path: path.join(root, 'sprites.js') });

  const data = await page.evaluate(() => {
    const PA = window.PixelArt, res = { sheets: [], all: null, previews: {} };
    const png = c => c.toDataURL('image/png');
    const groups = PA.groups();
    groups.forEach(g => { const s = PA.sheet(g.id); res.sheets.push({ id: g.id, png: png(s.canvas), atlas: s.atlas }); });

    // ---- combined atlas: every group stacked vertically in one PNG
    const parts = groups.map(g => PA.sheet(g.id));
    const W = Math.max.apply(null, parts.map(p => p.canvas.width)), H = parts.reduce((a, p) => a + p.canvas.height + 2, 0);
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    let y = 0; const all = { image: 'all.png', size: { w: W, h: H }, groups: {} };
    parts.forEach((p, i) => {
      x.drawImage(p.canvas, 0, y);
      const a = JSON.parse(JSON.stringify(p.atlas));
      Object.keys(a.anims).forEach(k => a.anims[k].frames.forEach(f => { f.y += y; }));
      delete a.image; all.groups[groups[i].id] = a; y += p.canvas.height + 2;
    });
    res.all = { png: png(c), atlas: all };

    // ---- preview montages (4x, on a dark navy stage) for quick eyeballing
    function montage(rows, scale, bg, pad) {
      pad = pad || 4;
      const cells = rows.map(r => r.map(spec => { const i = PA.info(spec.id); return { spec, i }; }));
      const w = Math.max.apply(null, cells.map(r => r.reduce((a, c) => a + c.i.w * scale + pad, pad)));
      const h = cells.reduce((a, r) => a + Math.max.apply(null, r.map(c => c.i.h)) * scale + pad, pad);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const cx = cv.getContext('2d');
      cx.fillStyle = bg; cx.fillRect(0, 0, w, h);
      let yy = pad;
      cells.forEach(r => { const rh = Math.max.apply(null, r.map(c => c.i.h)); let xx = pad;
        r.forEach(c => { PA.render(cx, c.spec.id, c.spec.f || 0, xx + c.i.ax * scale, yy + (rh - c.i.h) * scale + c.i.ay * scale, scale, Object.assign({ anchor: 'pivot' }, c.spec.o || {})); xx += c.i.w * scale + pad; });
        yy += rh * scale + pad; });
      return png(cv);
    }
    const M = ['soprano', 'pianist', 'cellist', 'flutist', 'trumpeter', 'harpist'];
    const U = ['zombie', 'skeleton', 'ghost', 'dracula', 'shambler', 'runner', 'brute', 'elite'];
    const row = (ids, anim, f, o) => ids.map(id => ({ id: id + '.' + anim, f: f, o: o }));
    res.previews.musicians = montage([
      row(M, 'idle', 0), row(M, 'perform', 1), row(M, 'perform', 4), row(M, 'walk', 0), row(M, 'hit', 0), row(M, 'cheer', 2),
    ], 5, '#0f1c3a');
    res.previews.musicians_bust = montage([row(M, 'bust', 0)], 3, '#0f1c3a');
    res.previews.undead = montage([
      row(U, 'idle', 0), row(U, 'walk', 0), row(U, 'attack', 1), row(U, 'hit', 0),
      U.map(id => ({ id: id + '.idle', f: 0, o: { mood: 'angry' } })),
      U.map(id => ({ id: id + '.idle', f: 0, o: { mood: 'leaving' } })),
      U.map(id => ({ id: id + '.idle', f: 0, o: { mood: 'satisfied' } })),
      row(U, 'audience', 1),
    ], 5, '#0f1c3a');
    res.previews.undead_bust = montage([U.map(id => ({ id: id + '.bust', f: 0 })), U.map(id => ({ id: id + '.bust', f: 0, o: { mood: 'angry' } }))], 3, '#0f1c3a');
    // restore sequences: every frame of every undead
    const rrows = U.map(id => { const n = PA.info(id + '.restore').frames; const r = []; for (let f = 0; f < n; f++) r.push({ id: id + '.restore', f: f, o: { mood: 'waiting' } }); r.push({ id: id + '.audience', f: 0 }); return r; });
    res.previews.restore = montage(rrows, 4, '#0f1c3a');
    res.previews.items = montage([
      ['item.potion', 'item.maxmp', 'item.shield', 'item.breaker', 'item.key', 'item.portal'].map(id => ({ id: id })),
      [0, 1, 2, 3].map(f => ({ id: 'item.portal', f: f })).concat([0, 1, 2].map(f => ({ id: 'fx.note', f: f })), [0, 1, 2, 3].map(f => ({ id: 'fx.sparkle', f: f })), [0, 1].map(f => ({ id: 'fx.heart', f: f })), [0, 1, 2].map(f => ({ id: 'fx.wave', f: f }))),
    ], 8, '#0f1c3a');
    res.previews.dungeon_bg = montage([row(M, 'idle', 0).concat(row(U.slice(0, 4), 'idle', 0))], 6, '#0f172a');
    res.previews.hall_bg = montage([row(M, 'idle', 0).concat(row(U.slice(4), 'idle', 0))], 6, '#2a1a12');
    return res;
  });

  const w = (f, b64) => fs.writeFileSync(path.join(out, f), Buffer.from(b64.split(',')[1], 'base64'));
  data.sheets.forEach(s => { w(s.id + '.png', s.png); fs.writeFileSync(path.join(out, s.id + '.json'), JSON.stringify(s.atlas, null, 1)); });
  w('all.png', data.all.png); fs.writeFileSync(path.join(out, 'all.json'), JSON.stringify(data.all.atlas, null, 1));
  Object.keys(data.previews).forEach(k => w('preview-' + k.replace(/_/g, '-') + '.png', data.previews[k]));
  if (errors.length) { console.error('ERRORS', errors); process.exitCode = 1; }
  console.log('exported', data.sheets.length, 'sheets + all + ' + Object.keys(data.previews).length + ' previews ->', out);
  await browser.close();
})();
