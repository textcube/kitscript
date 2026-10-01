/*!
 * PixelUI  v1.0  -  pixel-art UI kit that goes with pixelart/sprites.js
 *
 *   bitmap font (canvas text + a generated TrueType @font-face for DOM text),
 *   9-slice frames / buttons for CSS border-image, pixel icons, tiling patterns,
 *   dithered gradients and a device-pixel "pixel canvas" helper.
 *
 * Dependency free.  Load it with <script src="../pixelart/ui.js"></script>
 * (before or after sprites.js) and call PixelUI.install({ theme: 'stone' | 'hall' }).
 * Everything is drawn from the same 32-colour master palette as the sprites and
 * every image is generated once at load and cached.
 */
(function (root) {
  "use strict";

  // ------------------------------------------------------------------ palette
  var PAL = {
    k: '#0f0c1d', n: '#1b1731', d: '#2c2751', m: '#453f79', l: '#7973ad',
    s: '#ffdfc0', t: '#f3b892', u: '#cf8779', r: '#ff8d8d',
    G: '#fff2ac', g: '#f7c95d', o: '#c78a2d', O: '#7c4a2a',
    a: '#ffbb6e', b: '#dd7a3c', B: '#9c4a30',
    e: '#cfe27d', f: '#8db653', h: '#517a47', j: '#2f4a3a',
    w: '#fff8e8', i: '#ecdfc0', y: '#bba78c',
    c: '#e6f3ff', C: '#a7d1ff', A: '#6289d8',
    p: '#c7a8ff', P: '#8459d1', q: '#51308f',
    R: '#ea5b75', x: '#8f2848', T: '#82ecd2'
  };
  if (root.PixelArt && root.PixelArt.palette) PAL = root.PixelArt.palette;
  function rgb(k) { var h = PAL[k]; return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mkCanvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  // ------------------------------------------------------------ tiny pixel image
  // Img keeps palette keys ('' = transparent) so everything stays on-palette.
  function Img(w, h) { this.w = w; this.h = h; this.a = new Array(w * h); for (var i = 0; i < w * h; i++) this.a[i] = ''; }
  Img.prototype.set = function (x, y, k) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y * this.w + x] = k; return this; };
  Img.prototype.get = function (x, y) { return (x >= 0 && y >= 0 && x < this.w && y < this.h) ? this.a[y * this.w + x] : ''; };
  Img.prototype.rect = function (x, y, w, h, k) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, k); return this; };
  Img.prototype.stamp = function (rows, x, y, map) {
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < rows[j].length; i++) {
      var ch = rows[j][i]; if (ch === '.' || ch === ' ') continue;
      this.set(x + i, y + j, map && map[ch] ? map[ch] : ch);
    }
    return this;
  };
  Img.prototype.ring = function (n, tl, br) {   // 1px ring inset n from the edge; tl = top/left colour, br = bottom/right colour
    var w = this.w, h = this.h, i;
    for (i = n; i < w - n; i++) { this.set(i, n, tl); this.set(i, h - 1 - n, br); }
    for (i = n; i < h - n; i++) { this.set(n, i, tl); this.set(w - 1 - n, i, br); }
    this.set(w - 1 - n, n, br === tl ? tl : tl);       // top-right corner takes the light colour
    this.set(n, h - 1 - n, br === tl ? tl : br);       // bottom-left corner takes the shade
    return this;
  };
  Img.prototype.toCanvas = function (scale) {
    scale = scale || 1;
    var c = mkCanvas(this.w * scale, this.h * scale), x = c.getContext('2d');
    var id = x.createImageData(c.width, c.height), d = id.data;
    for (var j = 0; j < this.h; j++) for (var i = 0; i < this.w; i++) {
      var k = this.a[j * this.w + i]; if (!k) continue;
      var col = rgb(k);
      for (var sy = 0; sy < scale; sy++) for (var sx = 0; sx < scale; sx++) {
        var p = ((j * scale + sy) * c.width + i * scale + sx) * 4;
        d[p] = col[0]; d[p + 1] = col[1]; d[p + 2] = col[2]; d[p + 3] = 255;
      }
    }
    x.putImageData(id, 0, 0);
    return c;
  };

  // ================================================================== FONT ====
  // 5x7 caps/digits/punctuation, lowercase with x-height 5 + descenders (8 rows).
  // Rows are '/'-separated; '#' = pixel.  Advance is derived from the glyph bounds.
  var G5 = {
    'A': '.###./#...#/#...#/#####/#...#/#...#/#...#', 'B': '####./#...#/#...#/####./#...#/#...#/####.',
    'C': '.###./#...#/#..../#..../#..../#...#/.###.', 'D': '####./#...#/#...#/#...#/#...#/#...#/####.',
    'E': '#####/#..../#..../####./#..../#..../#####', 'F': '#####/#..../#..../####./#..../#..../#....',
    'G': '.###./#...#/#..../#.###/#...#/#...#/.###.', 'H': '#...#/#...#/#...#/#####/#...#/#...#/#...#',
    'I': '.###./..#../..#../..#../..#../..#../.###.', 'J': '..###/...#./...#./...#./...#./#..#./.##..',
    'K': '#...#/#..#./#.#../##.../#.#../#..#./#...#', 'L': '#..../#..../#..../#..../#..../#..../#####',
    'M': '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#', 'N': '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#',
    'O': '.###./#...#/#...#/#...#/#...#/#...#/.###.', 'P': '####./#...#/#...#/####./#..../#..../#....',
    'Q': '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#', 'R': '####./#...#/#...#/####./#.#../#..#./#...#',
    'S': '.####/#..../#..../.###./....#/....#/####.', 'T': '#####/..#../..#../..#../..#../..#../..#..',
    'U': '#...#/#...#/#...#/#...#/#...#/#...#/.###.', 'V': '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
    'W': '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#', 'X': '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
    'Y': '#...#/#...#/.#.#./..#../..#../..#../..#..', 'Z': '#####/....#/...#./..#../.#.../#..../#####',
    '0': '.###./#...#/#..##/#.#.#/##..#/#...#/.###.', '1': '..#../.##../..#../..#../..#../..#../.###.',
    '2': '.###./#...#/....#/...#./..#../.#.../#####', '3': '.###./#...#/....#/..##./....#/#...#/.###.',
    '4': '...#./..##./.#.#./#..#./#####/...#./...#.', '5': '#####/#..../####./....#/....#/#...#/.###.',
    '6': '..##./.#.../#..../####./#...#/#...#/.###.', '7': '#####/....#/...#./..#../.#.../.#.../.#...',
    '8': '.###./#...#/#...#/.###./#...#/#...#/.###.', '9': '.###./#...#/#...#/.####/....#/...#./.##..',
    '!': '#/#/#/#/#/ /#', '"': '#.#/#.#/.../.../.../.../...', '#': '.#.#./.#.#./#####/.#.#./#####/.#.#./.#.#.',
    '$': '..#../.####/#.#../.###./..#.#/####./..#..', '%': '##..#/##..#/...#./..#../.#.../#..##/#..##',
    '&': '.##../#..#./#.#../.#.../#.#.#/#..#./.##.#', "'": '#/#/#/././././.',
    '(': '..#/.#./#../#../#../.#./..#', ')': '#../.#./..#/..#/..#/.#./#..',
    '*': '...../..#../#.#.#/.###./#.#.#/..#../.....', '+': '...../..#../..#../#####/..#../..#../.....',
    ',': '.../.../.../.../.##/..#/.#.', '-': '...../...../...../#####/...../...../.....',
    '.': '.../.../.../.../.../##./##.', '/': '....#/....#/...#./..#../.#.../#..../#....',
    ':': '.../##./##./.../##./##./...', ';': '.../##./##./.../##./.#./#..', '<': '...#./..#../.#.../#..../.#.../..#../...#.',
    '=': '...../...../#####/...../#####/...../.....', '>': '.#.../..#../...#./....#/...#./..#../.#...',
    '?': '.###./#...#/....#/...#./..#../...../..#..', '@': '.###./#...#/#.###/#.#.#/#.###/#..../.###.',
    '[': '###/#../#../#../#../#../###', '\\': '#..../#..../.#.../..#../...#./....#/....#',
    ']': '###/..#/..#/..#/..#/..#/###', '^': '..#../.#.#./#...#/...../...../...../.....',
    '_': '...../...../...../...../...../...../#####', '`': '#../.#./.../.../.../.../...',
    '{': '..##/.#../.#../#.../.#../.#../..##', '|': '#/#/#/#/#/#/#', '}': '##../..#./..#./...#/..#./..#./##..',
    '~': '...../...../.#.../#.#.#/...#./...../.....',
    'a': '...../...../.###./....#/.####/#...#/.####', 'b': '#..../#..../#.##./##..#/#...#/##..#/#.##.',
    'c': '...../...../.###./#..../#..../#...#/.###.', 'd': '....#/....#/.##.#/#..##/#...#/#..##/.##.#',
    'e': '...../...../.###./#...#/#####/#..../.###.', 'f': '..##./.#..#/.#.../###../.#.../.#.../.#...',
    'g': '...../...../.####/#...#/#...#/.####/....#/.###.', 'h': '#..../#..../#.##./##..#/#...#/#...#/#...#',
    'i': '.#./.../##./.#./.#./.#./###', 'j': '..#/.../.##/..#/..#/..#/..#/##.',
    'k': '#..../#..../#..#./#.#../##.../#.#../#..#.', 'l': '##./.#./.#./.#./.#./.#./###',
    'm': '...../...../##.#./#.#.#/#.#.#/#...#/#...#', 'n': '...../...../#.##./##..#/#...#/#...#/#...#',
    'o': '...../...../.###./#...#/#...#/#...#/.###.', 'p': '...../...../####./#...#/#...#/####./#..../#....',
    'q': '...../...../.####/#...#/#...#/.####/....#/....#', 'r': '...../...../#.##./##..#/#..../#..../#....',
    's': '...../...../.####/#..../.###./....#/####.', 't': '.#.../.#.../###../.#.../.#.../.#..#/..##.',
    'u': '...../...../#...#/#...#/#...#/#..##/.##.#', 'v': '...../...../#...#/#...#/#...#/.#.#./..#..',
    'w': '...../...../#...#/#...#/#.#.#/#.#.#/.#.#.', 'x': '...../...../#...#/.#.#./..#../.#.#./#...#',
    'y': '...../...../#...#/#...#/#...#/.####/....#/.###.', 'z': '...../...../#####/...#./..#../.#.../#####',
    // symbols the games use (private to the kit, also available through the PUA map below)
    '♪': '..###/..#../..#../..#../.##../.##../.....', '☠': '.###./#####/#.#.#/#####/.###./.#.#./.....',
    '⚠': '..#../.#.#./.#.#./#.#.#/#.#.#/#...#/#####', '←': '...../..#../.#.../#####/.#.../..#../.....',
    '→': '...../..#../...#./#####/...#./..#../.....', '↑': '..#../.###./#.#.#/..#../..#../..#../.....',
    '↓': '..#../..#../..#../#.#.#/.###./..#../.....', '♥': '...../##.##/#####/#####/.###./..#../.....',
    '★': '..#../..#../#####/.###./.###./#...#/.....', '×': '...../#...#/.#.#./..#../.#.#./#...#/.....',
    '•': '...../...../.###./.###./.###./...../.....', '✓': '...../....#/...#./#.#../.#.../...../.....',
    '✕': '...../#...#/.#.#./..#../.#.#./#...#/.....', '·': '.../.../.../.#./.../.../...'
  };
  var FONT_EXTRA = { '✕': '×' };   // aliases (same bitmap)
  var ASC = 7, DESC = 1, CELL_H = 8;          // caps rows 0..6, descender row 7

  var glyphs = {};                             // ch -> {rows:[...8 strings], w, x0, adv}
  Object.keys(G5).forEach(function (ch) {
    var rows = G5[ch].split('/');
    var h = rows.length, w = 0, i, j;
    rows = rows.map(function (r) { return r.replace(/\./g, '.').replace(/ /g, '.'); });
    for (i = 0; i < rows.length; i++) w = Math.max(w, rows[i].length);
    rows = rows.map(function (r) { while (r.length < w) r += '.'; return r; });
    while (rows.length < CELL_H) rows.push(new Array(w + 1).join('.'));
    var x0 = w, x1 = -1;
    for (j = 0; j < CELL_H; j++) for (i = 0; i < w; i++) if (rows[j][i] === '#') { x0 = Math.min(x0, i); x1 = Math.max(x1, i); }
    if (x1 < 0) { x0 = 0; x1 = -1; }
    glyphs[ch] = { rows: rows, w: w, x0: x0, x1: x1, adv: (x1 >= x0 ? (x1 - x0 + 1) : 0) + 1 };
  });
  glyphs[' '] = { rows: [], w: 0, x0: 0, x1: -1, adv: 3 };
  Object.keys(FONT_EXTRA).forEach(function (a) { glyphs[a] = glyphs[FONT_EXTRA[a]]; });
  function glyphOf(ch) { return glyphs[ch] || glyphs['?']; }

  // ---- tiny 3x5 caps font (labels in dense canvas UIs); lowercase maps to uppercase -------------
  var T3 = {
    'A': '.#./#.#/###/#.#/#.#', 'B': '##./#.#/##./#.#/##.', 'C': '.##/#../#../#../.##', 'D': '##./#.#/#.#/#.#/##.',
    'E': '###/#../##./#../###', 'F': '###/#../##./#../#..', 'G': '.##/#../#.#/#.#/.##', 'H': '#.#/#.#/###/#.#/#.#',
    'I': '###/.#./.#./.#./###', 'J': '..#/..#/..#/#.#/.#.', 'K': '#.#/#.#/##./#.#/#.#', 'L': '#../#../#../#../###',
    'M': '#.#/###/#.#/#.#/#.#', 'N': '##./#.#/#.#/#.#/#.#', 'O': '.#./#.#/#.#/#.#/.#.', 'P': '##./#.#/##./#../#..',
    'Q': '.#./#.#/#.#/###/.##', 'R': '##./#.#/##./#.#/#.#', 'S': '.##/#../.#./..#/##.', 'T': '###/.#./.#./.#./.#.',
    'U': '#.#/#.#/#.#/#.#/###', 'V': '#.#/#.#/#.#/#.#/.#.', 'W': '#.#/#.#/###/###/#.#', 'X': '#.#/#.#/.#./#.#/#.#',
    'Y': '#.#/#.#/.#./.#./.#.', 'Z': '###/..#/.#./#../###',
    '0': '###/#.#/#.#/#.#/###', '1': '.#./##./.#./.#./###', '2': '##./..#/.#./#../###', '3': '##./..#/.#./..#/##.',
    '4': '#.#/#.#/###/..#/..#', '5': '###/#../##./..#/##.', '6': '.##/#../###/#.#/###', '7': '###/..#/.#./.#./.#.',
    '8': '###/#.#/###/#.#/###', '9': '###/#.#/###/..#/##.',
    '.': '.../.../.../.../.#.', ',': '.../.../.../.#./#..', ':': '.../.#./.../.#./...', '/': '..#/..#/.#./#../#..',
    '-': '.../.../###/.../...', '!': '.#./.#./.#./.../.#.', '?': '##./..#/.#./.../.#.', "'": '.#./.#./.../.../...',
    '+': '.../.#./###/.#./...', 'x': '.../#.#/.#./#.#/...', '%': '#.#/..#/.#./#../#.#', '(': '.#./#../#../#../.#.', ')': '.#./..#/..#/..#/.#.',
    '\u2190': '..#/.#./#../.#./..#', '\u2192': '#../.#./..#/.#./#..', '\u266a': '.##/.#./.#./##./##.', '\u2665': '#.#/###/###/.#./...'
  };
  var tinyGlyphs = {};
  Object.keys(T3).forEach(function (ch) {
    var rows = T3[ch].split('/'), x0 = 3, x1 = -1, i, j;
    for (j = 0; j < rows.length; j++) for (i = 0; i < 3; i++) if (rows[j][i] === '#') { x0 = Math.min(x0, i); x1 = Math.max(x1, i); }
    tinyGlyphs[ch] = { rows: rows, x0: x0, x1: x1, adv: (x1 >= x0 ? x1 - x0 + 1 : 0) + 1 };
  });
  tinyGlyphs[' '] = { rows: [], x0: 0, x1: -1, adv: 2 };
  var FONTS = { main: { glyphs: glyphs, h: CELL_H, get: glyphOf }, tiny: { glyphs: tinyGlyphs, h: 5, get: function (ch) { var u = ch.toUpperCase(); return tinyGlyphs[u] || tinyGlyphs[ch] || tinyGlyphs['?']; } } };

  // ---- canvas text ----------------------------------------------------------
  // Text is rendered once per (string, colours) at 1 art pixel = 1 canvas pixel and cached;
  // callers scale it by an integer with imageSmoothingEnabled = false.
  var textCache = {}, textCount = 0;
  function measure(str, font) { var f = FONTS[font || 'main'], w = 0; for (var i = 0; i < str.length; i++) w += f.get(str[i]).adv; return Math.max(0, w - 1); }
  function textCanvas(str, o) {
    o = o || {};
    var f = FONTS[o.font || 'main'];
    var key = (o.font || '') + '\u0002' + str + '\u0001' + (o.color || 'w') + '\u0001' + (o.outline || '') + '\u0001' + (o.shadow || '') + '\u0001' + (o.fill || '');
    var c = textCache[key];
    if (c) return c;
    var pad = o.outline ? 1 : 0, sh = o.shadow ? 1 : 0;
    var w = measure(str, o.font) + pad * 2 + sh, h = f.h + pad * 2 + sh;
    var im = new Img(w, h), x = pad, i, j, g, a;
    var put = function (ox, oy, col) {
      var cx = pad;
      for (var n = 0; n < str.length; n++) {
        var gg = f.get(str[n]);
        for (var jj = 0; jj < f.h; jj++) for (var ii = gg.x0; ii <= gg.x1; ii++) if (gg.rows[jj] && gg.rows[jj][ii] === '#') im.set(cx + ii - gg.x0 + ox, pad + jj + oy, col);
        cx += gg.adv;
      }
    };
    if (o.outline) { for (a = -1; a <= 1; a++) for (j = -1; j <= 1; j++) if (a || j) put(a + 0, j + 0, o.outline); }
    if (o.shadow) put(1, 1, o.shadow);
    put(0, 0, o.color || 'w');
    c = im.toCanvas(1);
    if (++textCount > 4000) { textCache = {}; textCount = 0; }
    textCache[key] = c;
    return c;
  }
  // draw text at (x,y) = top-left, scale = integer device pixels per art pixel
  function drawText(ctx, str, x, y, o) {
    o = o || {};
    var sc = o.scale || 1, c = textCanvas(str, o), w = c.width * sc;
    if (o.align === 'center') x -= Math.round(w / 2); else if (o.align === 'right') x -= w;
    var sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(c, Math.round(x), Math.round(y), w, c.height * sc);
    ctx.imageSmoothingEnabled = sm;
    return w;
  }

  // ---- TrueType font generator (for DOM text) ---------------------------------
  // 1 art pixel = 128 font units, em = 1024 (8 pixels) so font-size 8px*k gives k css px per pixel.
  var U = 128;
  function u16(v) { return [(v >> 8) & 255, v & 255]; }
  function i16(v) { v = v & 0xffff; return [(v >> 8) & 255, v & 255]; }
  function u32(v) { return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]; }
  function pad4(a) { while (a.length % 4) a.push(0); return a; }
  function checksum(bytes) {
    var s = 0, b = bytes.slice(); while (b.length % 4) b.push(0);
    for (var i = 0; i < b.length; i += 4) s = (s + ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3])) >>> 0;
    return s;
  }
  function glyphContours(g) {
    // merge pixels into rectangles: horizontal runs, then identical runs on consecutive rows
    var runs = [], j, i;
    for (j = 0; j < CELL_H; j++) {
      i = g.x0;
      while (i <= g.x1) {
        if (g.rows[j][i] === '#') { var s = i; while (i <= g.x1 && g.rows[j][i] === '#') i++; runs.push({ x0: s - g.x0, x1: i - g.x0, r0: j, r1: j + 1 }); }
        else i++;
      }
    }
    var out = [];
    runs.forEach(function (r) {
      for (var n = 0; n < out.length; n++) { var o = out[n]; if (o.x0 === r.x0 && o.x1 === r.x1 && o.r1 === r.r0) { o.r1 = r.r1; return; } }
      out.push({ x0: r.x0, x1: r.x1, r0: r.r0, r1: r.r1 });
    });
    return out;
  }
  function buildTTF() {
    var chars = Object.keys(glyphs).filter(function (ch) { return ch !== ' ' && ch.length === 1; });
    var codes = chars.map(function (ch) { return ch.charCodeAt(0); });
    var order = codes.map(function (c, i) { return i; }).sort(function (a, b) { return codes[a] - codes[b]; });
    var list = [{ ch: null }, { ch: ' ' }].concat(order.map(function (i) { return { ch: chars[i] }; }));   // glyph 0 .notdef, 1 space
    var glyf = [], loca = [0], hmtx = [], maxPts = 0, maxCont = 0, xMax = 0, advMax = 0;
    list.forEach(function (e, gi) {
      var g, cont = [], adv;
      if (e.ch === null) {        // .notdef: hollow box
        g = { x0: 0, x1: 4 }; adv = 6 * U;
        cont = [{ x0: 0, x1: 5, r0: 0, r1: 1 }, { x0: 0, x1: 5, r0: 6, r1: 7 }, { x0: 0, x1: 1, r0: 1, r1: 6 }, { x0: 4, x1: 5, r0: 1, r1: 6 }];
      } else if (e.ch === ' ') { g = glyphs[' ']; adv = g.adv * U; }
      else { g = glyphs[e.ch]; adv = g.adv * U; cont = glyphContours(g); }
      var bytes = [];
      if (cont.length) {
        var pts = [], ends = [], gx0 = 1e9, gy0 = 1e9, gx1 = -1e9, gy1 = -1e9;
        cont.forEach(function (r) {
          var xa = r.x0 * U, xb = r.x1 * U, yt = (ASC - r.r0) * U, yb = (ASC - r.r1) * U;
          pts.push([xa, yb], [xa, yt], [xb, yt], [xb, yb]);
          ends.push(pts.length - 1);
          gx0 = Math.min(gx0, xa); gx1 = Math.max(gx1, xb); gy0 = Math.min(gy0, yb); gy1 = Math.max(gy1, yt);
        });
        bytes = bytes.concat(i16(cont.length), i16(gx0), i16(gy0), i16(gx1), i16(gy1));
        ends.forEach(function (e2) { bytes = bytes.concat(u16(e2)); });
        bytes = bytes.concat(u16(0));
        pts.forEach(function () { bytes.push(1); });
        var px = 0, py = 0;
        pts.forEach(function (p) { bytes = bytes.concat(i16(p[0] - px)); px = p[0]; });
        pts.forEach(function (p) { bytes = bytes.concat(i16(p[1] - py)); py = p[1]; });
        maxPts = Math.max(maxPts, pts.length); maxCont = Math.max(maxCont, cont.length); xMax = Math.max(xMax, gx1);
        pad4(bytes);
      }
      glyf = glyf.concat(bytes);
      loca.push(glyf.length);
      hmtx = hmtx.concat(u16(adv), i16(0));
      advMax = Math.max(advMax, adv);
    });
    var n = list.length;
    // cmap (format 4, one segment per code point)
    var segs = codes.slice().sort(function (a, b) { return a - b; });
    var segCount = segs.length + 1, sr = 2 * Math.pow(2, Math.floor(Math.log(segCount) / Math.LN2));
    var cm = [].concat(u16(4), u16(16 + segCount * 8), u16(0), u16(segCount * 2), u16(sr), u16(Math.floor(Math.log(segCount) / Math.LN2)), u16(segCount * 2 - sr));
    var gidOf = {}; list.forEach(function (e, gi) { if (e.ch) gidOf[e.ch.charCodeAt(0)] = gi; });
    segs.forEach(function (c) { cm = cm.concat(u16(c)); }); cm = cm.concat(u16(0xffff)); cm = cm.concat(u16(0));
    segs.forEach(function (c) { cm = cm.concat(u16(c)); }); cm = cm.concat(u16(0xffff));
    segs.forEach(function (c) { cm = cm.concat(u16((gidOf[c] - c) & 0xffff)); }); cm = cm.concat(u16(1));
    segs.forEach(function () { cm = cm.concat(u16(0)); }); cm = cm.concat(u16(0));
    var cmap = [].concat(u16(0), u16(1), u16(3), u16(1), u32(12), cm);
    // name
    var nm = function (s) { var b = []; for (var i = 0; i < s.length; i++) b = b.concat(u16(s.charCodeAt(i))); return b; };
    var strs = ['PixelUI', 'Regular', 'PixelUI Regular', 'PixelUI-Regular'], ids = [1, 2, 4, 6], so = 0, rec = [], sd = [];
    ids.forEach(function (id, i) { var b = nm(strs[i]); rec = rec.concat(u16(3), u16(1), u16(0x409), u16(id), u16(b.length), u16(so)); sd = sd.concat(b); so += b.length; });
    var name = [].concat(u16(0), u16(ids.length), u16(6 + ids.length * 12), rec, sd);
    var head = [].concat(u32(0x00010000), u32(0x00010000), u32(0), u32(0x5f0f3cf5), u16(3), u16(1024), u32(0), u32(0), u32(0), u32(0),
      i16(0), i16(-DESC * U), i16(xMax), i16(ASC * U), u16(0), u16(8), i16(2), i16(1), i16(0));
    var hhea = [].concat(u32(0x00010000), i16(ASC * U), i16(-DESC * U), i16(0), u16(advMax), i16(0), i16(0), i16(xMax), i16(1), i16(0), i16(0),
      i16(0), i16(0), i16(0), i16(0), i16(0), u16(n));
    var maxp = [].concat(u32(0x00010000), u16(n), u16(maxPts), u16(maxCont), u16(0), u16(0), u16(2), u16(0), u16(0), u16(0), u16(0), u16(0), u16(0), u16(0), u16(0));
    var os2 = [].concat(u16(0), i16(6 * U), u16(400), u16(5), u16(0), i16(650), i16(600), i16(0), i16(75), i16(650), i16(600), i16(0), i16(350), i16(50), i16(250),
      i16(0), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], u32(1), u32(0), u32(0), u32(0), [80, 88, 85, 73], u16(0x40), u16(32), u16(0x2715), i16(ASC * U), i16(-DESC * U), i16(0), u16(ASC * U), u16(DESC * U));
    var post = [].concat(u32(0x00030000), u32(0), i16(-100), i16(50), u32(1), u32(0), u32(0), u32(0), u32(0));
    var locaB = []; loca.forEach(function (o) { locaB = locaB.concat(u32(o)); });
    var tables = [['OS/2', os2], ['cmap', cmap], ['glyf', glyf], ['head', head], ['hhea', hhea], ['hmtx', hmtx], ['loca', locaB], ['maxp', maxp], ['name', name], ['post', post]];
    var nt = tables.length, srch = 16 * Math.pow(2, Math.floor(Math.log(nt) / Math.LN2));
    var out = [].concat(u32(0x00010000), u16(nt), u16(srch), u16(Math.floor(Math.log(nt) / Math.LN2)), u16(nt * 16 - srch));
    var off = 12 + nt * 16, body = [], headOff = 0;
    tables.forEach(function (t) {
      var tag = t[0].split('').map(function (c) { return c.charCodeAt(0); });
      if (t[0] === 'head') headOff = off;
      out = out.concat(tag, u32(checksum(t[1])), u32(off), u32(t[1].length));
      var b = t[1].slice(); pad4(b); body = body.concat(b); off += b.length;
    });
    var all = out.concat(body);
    var adj = (0xB1B0AFBA - checksum(all)) >>> 0, a = u32(adj);
    for (var q = 0; q < 4; q++) all[headOff + 8 + q] = a[q];
    return new Uint8Array(all);
  }
  var fontURL = null;
  function getFontURL() {
    if (fontURL) return fontURL;
    var bytes = buildTTF(), s = '';
    for (var i = 0; i < bytes.length; i += 0x2000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x2000));
    return (fontURL = 'data:font/ttf;base64,' + btoa(s));
  }

  // =============================================================== PATTERNS ===
  // Ordered (Bayer 4x4) dither between two palette keys: t in 0..1
  var BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function dither(img, x, y, w, h, a, b, t) {
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) img.set(x + i, y + j, (BAYER[(y + j) & 3][(x + i) & 3] + .5) / 16 < t ? b : a);
  }
  // vertical banded-dither gradient through palette stops (array of keys), as an Img
  function gradient(w, h, stops) {
    var im = new Img(w, h), n = stops.length - 1;
    for (var j = 0; j < h; j++) {
      var f = (j / (h - 1 || 1)) * n, s = Math.min(n - 1, Math.floor(f)), t = f - s;
      for (var i = 0; i < w; i++) im.set(i, j, (BAYER[j & 3][i & 3] + .5) / 16 < t ? stops[s + 1] : stops[s]);
    }
    return im;
  }

  // deterministic pseudo-random for texture speckles
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  var patterns = {};
  // 32x32 dungeon brick wall (page backdrop): dark, low contrast so UI stays readable
  patterns.wall = function () {
    var im = new Img(32, 32), r = rng(7), y, x;
    im.rect(0, 0, 32, 32, 'n');
    for (var row = 0; row < 4; row++) {
      var y0 = row * 8, off = (row % 2) * 8;
      for (x = 0; x < 32; x++) { im.set(x, y0, 'k'); }
      for (var bx = -8; bx < 32; bx += 16) {
        var xs = bx + off;
        for (y = y0; y < y0 + 8; y++) im.set(((xs % 32) + 32) % 32, y, 'k');
        // brick face: light top-left edge, dark bottom edge, speckles
        for (x = 1; x < 16; x++) { im.set(((xs + x) % 32 + 32) % 32, y0 + 1, 'd'); }
        for (x = 1; x < 16; x++) { im.set(((xs + x) % 32 + 32) % 32, y0 + 7, 'k'); }
      }
      for (var s = 0; s < 6; s++) { var sx = Math.floor(r() * 32), sy = y0 + 2 + Math.floor(r() * 5); if (im.get(sx, sy) === 'n') im.set(sx, sy, r() < .5 ? 'd' : 'k'); }
    }
    return im;
  };
  // 32x32 floor slabs, four variants (cracks / speckles); light from top-left
  function floorTile(v) {
    var im = new Img(32, 32), r = rng(31 + v * 17), i, j;
    im.rect(0, 0, 32, 32, 'd');
    // slab seams
    im.rect(0, 31, 32, 1, 'k'); im.rect(31, 0, 1, 32, 'k');
    im.rect(0, 0, 32, 1, 'm'); im.rect(0, 0, 1, 32, 'm');
    im.rect(1, 1, 30, 1, 'd');
    // shading band along bottom/right inside the slab
    im.rect(1, 29, 30, 2, 'n'); im.rect(29, 1, 2, 30, 'n');
    // subtle dithered light patch top-left
    dither(im, 2, 2, 14, 10, 'd', 'm', .12);
    // speckles
    for (var s = 0; s < 14; s++) { var sx = 3 + Math.floor(r() * 25), sy = 3 + Math.floor(r() * 25); im.set(sx, sy, r() < .5 ? 'n' : 'm'); }
    if (v === 1) { var cx = 8, cy = 12; for (i = 0; i < 9; i++) { im.set(cx + i, cy + (i >> 1) - (i % 3 === 0 ? 1 : 0), 'k'); } im.set(cx + 9, cy + 4, 'k'); }
    if (v === 2) { for (i = 0; i < 7; i++) { im.set(18 + (i >> 1), 18 + i, 'k'); } im.set(17, 17, 'k'); im.set(21, 25, 'k'); }
    if (v === 3) { im.rect(10, 10, 6, 1, 'n'); im.rect(10, 11, 1, 4, 'n'); im.rect(14, 14, 5, 1, 'm'); }
    return im;
  }
  patterns.floor0 = function () { return floorTile(0); };
  patterns.floor1 = function () { return floorTile(1); };
  patterns.floor2 = function () { return floorTile(2); };
  patterns.floor3 = function () { return floorTile(3); };
  // 32x32 hall floor (stage planks)
  patterns.planks = function () {
    var im = new Img(32, 32), r = rng(5);
    im.rect(0, 0, 32, 32, 'B');
    for (var row = 0; row < 4; row++) {
      var y0 = row * 8; im.rect(0, y0, 32, 1, 'O'); im.rect(0, y0 + 1, 32, 1, 'b');
      im.rect(0, y0 + 7, 32, 1, 'O');
      var sx = (row * 11) % 32; for (var y = y0; y < y0 + 8; y++) im.set(sx, y, 'O');
      for (var s = 0; s < 8; s++) { var x = Math.floor(r() * 32), yy = y0 + 2 + Math.floor(r() * 5); im.set(x, yy, r() < .5 ? 'O' : 'b'); }
    }
    return im;
  };
  // 16x32 velvet curtain pleats (vertical), tiles horizontally
  patterns.curtain = function () {
    var im = new Img(16, 32);
    for (var x = 0; x < 16; x++) {
      var col = x < 2 ? 'x' : x < 5 ? 'R' : x < 7 ? 'x' : x < 9 ? 'x' : x < 12 ? 'R' : x < 14 ? 'x' : 'k';
      if (x === 3) col = 'r';
      for (var y = 0; y < 32; y++) im.set(x, y, col);
    }
    return im;
  };
  // 8x8 seat velvet
  patterns.velvet = function () { var im = new Img(8, 8); im.rect(0, 0, 8, 8, 'x'); for (var i = 0; i < 8; i += 2) im.set(i, (i + 1) & 7, 'R'); return im; };
  // 48x32 torch sheet (3 flame frames of 16x32): iron bracket + animated fire
  patterns.torch = function () {
    var im = new Img(48, 32);
    var flames = [
      ['...GG...', '..GggG..', '..gaag..', '.gaaaag.', '.abbbba.', '.abRRba.', '..bRRb..', '...RR...'],
      ['....G...', '...Gg...', '..GgaG..', '.gaaaag.', '.aabbba.', '.abbRRa.', '..bRRb..', '...RR...'],
      ['..G.....', '..Gg.GG.', '..gaagG.', '.gaaaag.', '.abbbaa.', '.abRRba.', '..bRRb..', '...RR...']
    ];
    for (var f = 0; f < 3; f++) {
      var ox = f * 16;
      im.stamp(flames[f], ox + 4, 6, { R: 'R' });
      im.rect(ox + 4, 15, 8, 2, 'l'); im.rect(ox + 5, 17, 6, 1, 'm');                   // cup
      im.rect(ox + 5, 15, 1, 2, 'w');
      im.rect(ox + 7, 18, 2, 12, 'm'); im.rect(ox + 7, 18, 1, 12, 'l'); im.rect(ox + 8, 18, 1, 12, 'd');   // post
      im.rect(ox + 5, 28, 6, 2, 'l'); im.rect(ox + 5, 30, 6, 1, 'd');
    }
    return im;
  };
  // 64x16 impact burst (4 frames of 16x16): growing star, last frames dithered out
  patterns.fxImpact = function () {
    var im = new Img(64, 16);
    for (var f = 0; f < 4; f++) {
      var ox = f * 16 + 8, oy = 8, L = 2 + f * 2, i;
      for (i = -L; i <= L; i++) { if (f < 3 || (i & 1)) { im.set(ox + i, oy, f < 2 ? 'w' : 'G'); im.set(ox, oy + i, f < 2 ? 'w' : 'G'); } }
      for (i = -L + 1; i <= L - 1; i++) { if (f < 3 || (i & 1)) { im.set(ox + i, oy + i, 'g'); im.set(ox + i, oy - i, 'g'); } }
      if (f < 2) { im.set(ox, oy, 'w'); im.rect(ox - 1, oy - 1, 3, 3, 'w'); }
    }
    return im;
  };
  // 96x24 sonic wave (4 frames of 24x24): expanding pixel rings
  patterns.fxWave = function () {
    var im = new Img(96, 24);
    for (var f = 0; f < 4; f++) {
      var cx = f * 24 + 12, cy = 12, R = 3 + f * 3;
      for (var y = -R - 1; y <= R + 1; y++) for (var x = -R - 1; x <= R + 1; x++) {
        var d = Math.sqrt(x * x + y * y);
        if (d <= R + .5 && d > R - .5 && (f < 2 || ((x + y) & 1) === 0)) im.set(cx + x, cy + y, f === 0 ? 'w' : (f === 1 ? 'G' : 'g'));
      }
    }
    return im;
  };
  // 4x4 ordered-dither overlays (transparent / dark) used for scrims
  patterns.scrim = function () { var im = new Img(4, 4); for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) if ((i + j) % 2 === 0) im.set(i, j, 'k'); return im; };
  patterns.scrim3 = function () { var im = new Img(4, 4); for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) if (BAYER[j][i] < 12) im.set(i, j, 'k'); return im; };
  patterns.scrim2 = function () { var im = new Img(4, 4); for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) if (BAYER[j][i] < 4) im.set(i, j, 'k'); return im; };

  var patCache = {};
  function pattern(name) {
    if (patCache[name]) return patCache[name];
    var im = patterns[name](); var c = im.toCanvas(1);
    return (patCache[name] = { name: name, w: im.w, h: im.h, canvas: c, url: c.toDataURL('image/png'), img: im });
  }

  // ================================================================ FRAMES ====
  // Each frame is a (2S+2)x(2S+2) image: S px corners/edges + a 2px stretchable middle.
  // Use with border-image: url() S fill / (S*k)px / 0 stretch   (see install()).
  function frameImg(spec) {
    var S = spec.S, N = S * 2 + 2, im = new Img(N, N), i;
    im.rect(0, 0, N, N, spec.fill || '');
    spec.rings.forEach(function (rg, n) {
      if (rg === null) return;
      var tl = rg[0], br = rg.length > 1 ? rg[1] : rg[0];
      im.ring(n, tl, br);
    });
    (spec.dots || []).forEach(function (d) {   // corner studs (x,y inset from each corner)
      var x = d[0], y = d[1], c = d[2];
      im.set(x, y, c); im.set(N - 1 - x, y, c); im.set(x, N - 1 - y, c); im.set(N - 1 - x, N - 1 - y, c);
    });
    if (spec.notch) { im.set(0, 0, ''); im.set(N - 1, 0, ''); im.set(0, N - 1, ''); im.set(N - 1, N - 1, ''); }
    return im;
  }
  var FRAMES = {
    // ----- dungeon (rogue) ------------------------------------------------
    // iron-bound stone slab: black outline, lit top-left bevel, stone body with inner groove, gold rivets
    stone:   { S: 6, fill: 'n', rings: [['k'], ['l', 'd'], ['m'], ['m', 'm'], ['d', 'm'], ['k']], dots: [[2, 2, 'g']] },
    stoneHi: { S: 6, fill: 'n', rings: [['k'], ['G', 'o'], ['m'], ['m', 'm'], ['d', 'm'], ['k']], dots: [[2, 2, 'G']] },
    stoneRed:{ S: 6, fill: 'n', rings: [['k'], ['r', 'x'], ['R'], ['R', 'R'], ['x', 'R'], ['k']], dots: [[2, 2, 'g']] },
    stoneViolet: { S: 6, fill: 'n', rings: [['k'], ['p', 'q'], ['P'], ['P', 'P'], ['q', 'P'], ['k']], dots: [[2, 2, 'g']] },
    plaque:  { S: 4, fill: 'k', rings: [['k'], ['g', 'o'], ['O'], ['d']], dots: [] },
    inset:   { S: 3, fill: 'k', rings: [['n', 'm'], ['k', 'd'], ['k']], dots: [] },
    well:    { S: 3, fill: 'k', rings: [['k'], ['n', 'd'], ['k']], dots: [] },
    // iron buttons: normal / hover / pressed / disabled
    btn:     { S: 4, fill: 'm', rings: [['k'], ['l', 'd'], ['m', 'd'], ['m', 'd']], dots: [] },
    btnHover:{ S: 4, fill: 'l', rings: [['k'], ['w', 'm'], ['l', 'm'], ['l', 'm']], dots: [] },
    btnDown: { S: 4, fill: 'd', rings: [['k'], ['n', 'm'], ['d', 'm'], ['d', 'd']], dots: [] },
    btnOff:  { S: 4, fill: 'n', rings: [['k'], ['d', 'd'], ['n', 'n'], ['n', 'n']], dots: [] },
    // gold (primary) buttons
    gbtn:    { S: 4, fill: 'g', rings: [['k'], ['G', 'o'], ['g', 'o'], ['g', 'o']], dots: [] },
    gbtnHover:{ S: 4, fill: 'G', rings: [['k'], ['w', 'g'], ['G', 'g'], ['G', 'g']], dots: [] },
    gbtnDown:{ S: 4, fill: 'o', rings: [['k'], ['O', 'g'], ['o', 'g'], ['o', 'o']], dots: [] },
    gbtnOff: { S: 4, fill: 'O', rings: [['k'], ['B', 'B'], ['O', 'O'], ['O', 'O']], dots: [] },
    // active (toggled on) button: gold rim on dark face
    btnOn:   { S: 4, fill: 'd', rings: [['k'], ['g', 'o'], ['d', 'n'], ['d', 'n']], dots: [] },
    // ----- concert hall (sopraknight) ----------------------------------------
    // dark wood slab with gold inlay line and corner studs
    wood:    { S: 6, fill: 'n', rings: [['k'], ['B', 'O'], ['b', 'B'], ['O', 'O'], ['g', 'o'], ['k']], dots: [[1, 1, 'G']] },
    woodHi:  { S: 6, fill: 'n', rings: [['k'], ['G', 'o'], ['g', 'o'], ['O', 'O'], ['G', 'g'], ['k']], dots: [[1, 1, 'w']] },
    velvet:  { S: 4, fill: 'x', rings: [['k'], ['g', 'o'], ['R', 'x'], ['x', 'x']], dots: [] },
    hallPlaque: { S: 4, fill: 'n', rings: [['k'], ['g', 'o'], ['O', 'O'], ['d']], dots: [] },
    card:    { S: 4, fill: 'n', rings: [['k'], ['O', 'k'], ['d', 'n'], ['n']], dots: [] },
    cardOn:  { S: 4, fill: 'd', rings: [['k'], ['g', 'o'], ['m', 'n'], ['d']], dots: [] },
    cardOff: { S: 4, fill: 'k', rings: [['k'], ['O', 'k'], ['n', 'k'], ['k']], dots: [] },
    hbtn:    { S: 4, fill: 'B', rings: [['k'], ['a', 'O'], ['b', 'O'], ['B', 'O']], dots: [] },
    hbtnHover:{ S: 4, fill: 'b', rings: [['k'], ['G', 'B'], ['a', 'B'], ['b', 'B']], dots: [] },
    hbtnDown:{ S: 4, fill: 'O', rings: [['k'], ['k', 'B'], ['O', 'B'], ['O', 'O']], dots: [] },
    hbtnOff: { S: 4, fill: 'n', rings: [['k'], ['d', 'd'], ['n', 'n'], ['n', 'n']], dots: [] },
    hbtnOn:  { S: 4, fill: 'd', rings: [['k'], ['g', 'o'], ['d', 'n'], ['d', 'n']], dots: [] },
    bar:     { S: 2, fill: 'k', rings: [['k'], ['n', 'd']], dots: [] },
    toast:   { S: 4, fill: 'k', rings: [['k'], ['g', 'o'], ['n'], ['n']], dots: [] }
  };
  var frameCache = {};
  function frame(name) {
    var f = frameCache[name]; if (f) return f;
    var spec = FRAMES[name]; if (!spec) throw new Error('PixelUI: unknown frame "' + name + '"');
    var im = frameImg(spec), c = im.toCanvas(1);
    f = frameCache[name] = { name: name, S: spec.S, w: im.w, h: im.h, canvas: c, url: c.toDataURL('image/png'), img: im };
    return f;
  }
  // draw a 9-slice frame onto a canvas rect with `k` device px per art pixel (corners keep their size)
  function drawFrame(ctx, name, x, y, w, h, k) {
    var f = frame(name), S = f.S, s = S * k, mid = f.w - 2 * S, c = f.canvas;
    var sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    var iw = w - 2 * s, ih = h - 2 * s;
    // centre, edges, corners
    ctx.drawImage(c, S, S, mid, mid, x + s, y + s, iw, ih);
    ctx.drawImage(c, S, 0, mid, S, x + s, y, iw, s);
    ctx.drawImage(c, S, f.h - S, mid, S, x + s, y + h - s, iw, s);
    ctx.drawImage(c, 0, S, S, mid, x, y + s, s, ih);
    ctx.drawImage(c, f.w - S, S, S, mid, x + w - s, y + s, s, ih);
    ctx.drawImage(c, 0, 0, S, S, x, y, s, s);
    ctx.drawImage(c, f.w - S, 0, S, S, x + w - s, y, s, s);
    ctx.drawImage(c, 0, f.h - S, S, S, x, y + h - s, s, s);
    ctx.drawImage(c, f.w - S, f.h - S, S, S, x + w - s, y + h - s, s, s);
    ctx.imageSmoothingEnabled = sm;
  }

  // ================================================================= ICONS ====
  // 12x12 icons drawn with 'w' = body, 'd'/'k' = shade; recoloured per tone.
  var ICONS = {
    sound:   ['............', '.....w......', '....ww..w...', '..www.w..w..', '..www..w.w..', '..www..w.w..', '..www.w..w..', '....ww..w...', '.....w......', '............', '............', '............'],
    mute:    ['............', '.....w......', '....ww......', '..www..w..w.', '..www...ww..', '..www...ww..', '..www..w..w.', '....ww......', '.....w......', '............', '............', '............'],
    home:    ['............', '.....ww.....', '....wwww....', '...wwwwww...', '..wwwwwwww..', '.wwwwwwwwww.', '...ww..ww...', '...ww..ww...', '...ww.wwww..', '...wwwwwww..', '............', '............'],
    play:    ['............', '...wwwwww...', '..w......w..', '.w..w.....w.', '.w..ww....w.', '.w..www...w.', '.w..ww....w.', '.w..w.....w.', '..w......w..', '...wwwwww...', '............', '............'],
    github:  ['............', '..w......w..', '..ww....ww..', '..wwwwwwww..', '.wwwwwwwwww.', '.ww.wwww.ww.', '.wwwwwwwwww.', '..wwwwwwww..', '...wwwwww...', '....wwww....', '............', '............'],
    close:   ['............', '..ww....ww..', '...ww..ww...', '....wwww....', '.....ww.....', '....wwww....', '...ww..ww...', '..ww....ww..', '............', '............', '............', '............'],
    lock:    ['............', '....wwww....', '...w....w...', '...w....w...', '..wwwwwwww..', '..wwwwwwww..', '..www..www..', '..www..www..', '..wwwwwwww..', '..wwwwwwww..', '............', '............'],
    heart:   ['............', '..ww....ww..', '.wwww..wwww.', '.wwwwwwwwww.', '.wwwwwwwwww.', '..wwwwwwww..', '...wwwwww...', '....wwww....', '.....ww.....', '............', '............', '............'],
    menu:    ['............', '............', '..wwwwwwww..', '............', '..wwwwwwww..', '............', '..wwwwwwww..', '............', '............', '............', '............', '............'],
    star:    ['............', '.....ww.....', '.....ww.....', '..wwwwwwww..', '...wwwwww...', '....wwww....', '...wwwwww...', '..ww....ww..', '............', '............', '............', '............']
  };
  var TONES = { normal: 'i', hover: 'w', dim: 'l', gold: 'g', cyan: 'C', red: 'R', dark: 'm', hope: 'T' };
  var iconCache = {};
  function icon(name, tone) {
    tone = tone || 'normal'; var key = name + '|' + tone, e = iconCache[key]; if (e) return e;
    var rows = ICONS[name]; if (!rows) throw new Error('PixelUI: unknown icon "' + name + '"');
    var col = TONES[tone] || tone, im = new Img(12, 12), i, j, shade = (tone === 'hover' || tone === 'normal') ? 'm' : 'o';
    for (j = 0; j < 12; j++) for (i = 0; i < 12; i++) if (rows[j][i] === 'w') im.set(i, j, col);
    // 1px pixel drop-shadow to the bottom-right keeps icons readable on light buttons
    var sh = new Img(12, 12); for (j = 0; j < 12; j++) for (i = 0; i < 12; i++) if (im.get(i, j) && !im.get(i + 1, j + 1) && !sh.get(i + 1, j + 1)) sh.set(i + 1, j + 1, 'k');
    for (j = 0; j < 12; j++) for (i = 0; i < 12; i++) if (sh.get(i, j) && !im.get(i, j)) im.set(i, j, 'k');
    var c = im.toCanvas(1);
    return (iconCache[key] = { name: name, tone: tone, w: 12, h: 12, canvas: c, url: c.toDataURL('image/png') });
  }

  // ============================================================ PIXEL CANVAS ==
  // Device-pixel drawing helper: logical coordinates are mapped with `r` (device px per
  // logical px) and every shape snaps to a grid of `u` device px (one art pixel).
  function PixelCanvas(ctx) { this.ctx = ctx; this.r = 1; this.u = 1; }
  PixelCanvas.prototype.setScale = function (r, u) { this.r = r; this.u = Math.max(1, u | 0); return this; };
  PixelCanvas.prototype.sx = function (x) { return Math.round(x * this.r / this.u) * this.u; };
  PixelCanvas.prototype.fill = function (key) { this.ctx.fillStyle = PAL[key] || key; };
  PixelCanvas.prototype.rect = function (x, y, w, h, key) {
    var x0 = this.sx(x), y0 = this.sx(y), x1 = this.sx(x + w), y1 = this.sx(y + h);
    if (x1 <= x0) x1 = x0 + this.u; if (y1 <= y0) y1 = y0 + this.u;
    this.fill(key); this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  };
  PixelCanvas.prototype.px = function (ax, ay, key) { this.fill(key); this.ctx.fillRect(ax * this.u, ay * this.u, this.u, this.u); };
  // line / circle in art-pixel coordinates around a logical centre
  PixelCanvas.prototype.line = function (x0, y0, x1, y1, key) {
    var u = this.u, a0 = Math.round(x0 * this.r / u), b0 = Math.round(y0 * this.r / u), a1 = Math.round(x1 * this.r / u), b1 = Math.round(y1 * this.r / u);
    var dx = Math.abs(a1 - a0), dy = -Math.abs(b1 - b0), sx = a0 < a1 ? 1 : -1, sy = b0 < b1 ? 1 : -1, e = dx + dy;
    this.fill(key);
    for (var n = 0; n < 4000; n++) { this.ctx.fillRect(a0 * u, b0 * u, u, u); if (a0 === a1 && b0 === b1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; a0 += sx; } if (e2 <= dx) { e += dx; b0 += sy; } }
  };
  PixelCanvas.prototype.ring = function (cx, cy, rad, key, thick) {
    var u = this.u, ca = Math.round(cx * this.r / u), cb = Math.round(cy * this.r / u), R = Math.max(1, Math.round(rad * this.r / u)), t = thick || 1;
    this.fill(key);
    for (var y = -R - 1; y <= R + 1; y++) for (var x = -R - 1; x <= R + 1; x++) {
      var d = Math.sqrt(x * x + y * y); if (d <= R + .5 && d > R + .5 - t) this.ctx.fillRect((ca + x) * u, (cb + y) * u, u, u);
    }
  };
  PixelCanvas.prototype.disc = function (cx, cy, rad, key, dith) {
    var u = this.u, ca = Math.round(cx * this.r / u), cb = Math.round(cy * this.r / u), R = Math.max(1, Math.round(rad * this.r / u));
    this.fill(key);
    for (var y = -R; y <= R; y++) for (var x = -R; x <= R; x++) if (x * x + y * y <= R * R + R * .5) { if (dith && (((ca + x) + (cb + y)) & 1)) continue; this.ctx.fillRect((ca + x) * u, (cb + y) * u, u, u); }
  };
  PixelCanvas.prototype.ellipse = function (cx, cy, rx, ry, key, dith) {
    var u = this.u, ca = Math.round(cx * this.r / u), cb = Math.round(cy * this.r / u), RX = Math.max(1, Math.round(rx * this.r / u)), RY = Math.max(1, Math.round(ry * this.r / u));
    this.fill(key);
    for (var y = -RY; y <= RY; y++) for (var x = -RX; x <= RX; x++) if ((x * x) / (RX * RX) + (y * y) / (RY * RY) <= 1) { if (dith && (((ca + x) + (cb + y)) & 1)) continue; this.ctx.fillRect((ca + x) * u, (cb + y) * u, u, u); }
  };
  // checker/bayer dither fill of a logical rect: density t (0..1)
  PixelCanvas.prototype.dither = function (x, y, w, h, key, t) {
    var u = this.u, a0 = Math.round(x * this.r / u), b0 = Math.round(y * this.r / u), a1 = Math.round((x + w) * this.r / u), b1 = Math.round((y + h) * this.r / u);
    this.fill(key);
    for (var b = b0; b < b1; b++) for (var a = a0; a < a1; a++) if ((BAYER[b & 3][a & 3] + .5) / 16 < t) this.ctx.fillRect(a * u, b * u, u, u);
  };
  // tile an Img/canvas pattern over a logical rect (pattern pixel = u device px)
  PixelCanvas.prototype.tile = function (name, x, y, w, h, ox, oy) {
    var p = pattern(name), u = this.u, x0 = this.sx(x), y0 = this.sx(y), x1 = this.sx(x + w), y1 = this.sx(y + h);
    var ctx = this.ctx; ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip(); ctx.imageSmoothingEnabled = false;
    var tw = p.w * u, th = p.h * u, sx = x0 - (((ox || 0) * u) % tw + tw) % tw, sy = y0 - (((oy || 0) * u) % th + th) % th;
    for (var yy = sy; yy < y1; yy += th) for (var xx = sx; xx < x1; xx += tw) ctx.drawImage(p.canvas, xx, yy, tw, th);
    ctx.restore();
  };
  PixelCanvas.prototype.frame = function (name, x, y, w, h) {
    var x0 = this.sx(x), y0 = this.sx(y), x1 = this.sx(x + w), y1 = this.sx(y + h);
    drawFrame(this.ctx, name, x0, y0, x1 - x0, y1 - y0, this.u);
  };
  PixelCanvas.prototype.text = function (str, x, y, o) {
    o = o || {}; var sc = o.scale || 1;
    var c = textCanvas(str, o), w = c.width * sc * this.u;
    var X = this.sx(x), Y = this.sx(y);
    if (o.align === 'center') X -= Math.round(w / 2 / this.u) * this.u; else if (o.align === 'right') X -= w;
    var ctx = this.ctx, sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(c, X, Y, w, c.height * sc * this.u); ctx.imageSmoothingEnabled = sm;
    return w / this.r;
  };
  PixelCanvas.prototype.icon = function (name, x, y, tone, sc) {
    var ic = icon(name, tone), u = this.u * (sc || 1), ctx = this.ctx, sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(ic.canvas, this.sx(x), this.sx(y), ic.w * u, ic.h * u); ctx.imageSmoothingEnabled = sm;
  };

  // ================================================================ INSTALL ===
  var installed = null;
  function cssFrame(name, k) { var f = frame(name); return 'url("' + f.url + '") ' + f.S + ' fill / ' + (f.S * k) + 'px / 0 stretch'; }
  // Injects @font-face, CSS custom properties (urls) and the generic .pxu-* classes.
  function install(opt) {
    opt = opt || {};
    var doc = document, k = opt.k || 2;
    var css = '@font-face{font-family:"PixelUI";src:url("' + getFontURL() + '") format("truetype");font-display:block}\n';
    var vars = ':root{';
    Object.keys(FRAMES).forEach(function (n) { var f = frame(n); vars += '--pxu-f-' + n + ':url("' + f.url + '");--pxu-s-' + n + ':' + f.S + ';'; });
    Object.keys(patterns).forEach(function (n) { var p = pattern(n); vars += '--pxu-p-' + n + ':url("' + p.url + '");'; });
    Object.keys(ICONS).forEach(function (n) { ['normal', 'hover', 'dim', 'gold', 'cyan', 'red', 'dark', 'hope'].forEach(function (t) { vars += '--pxu-i-' + n + '-' + t + ':url("' + icon(n, t).url + '");'; }); });
    vars += '--pxu-font:"PixelUI","Courier New",monospace;--k:' + k + '}\n';
    css += vars;
    css += '.pxu-text{font-family:var(--pxu-font);font-weight:400;font-style:normal;text-rendering:optimizeSpeed;-webkit-font-smoothing:none;font-smooth:never;letter-spacing:0}\n';
    css += '.pxu-img{image-rendering:pixelated;image-rendering:crisp-edges;image-rendering:pixelated}\n';
    var el = doc.getElementById('pxui-kit') || doc.createElement('style');
    el.id = 'pxui-kit'; el.textContent = css; (doc.head || doc.documentElement).appendChild(el);
    function setK() {
      var w = root.innerWidth || 1280, kk = opt.kFor ? opt.kFor(w) : (w <= 480 ? 1 : 2);
      var st = doc.documentElement.style;
      st.setProperty('--k', kk); doc.documentElement.dataset.pxk = kk;
      st.setProperty('--m-small', kk >= 2 ? 2 : 1); st.setProperty('--m-body', 2); st.setProperty('--m-head', kk + 1);   // css px per art pixel for text
    }
    setK(); root.addEventListener('resize', setK);
    installed = { k: k };
    if (opt.rootClass !== false) doc.documentElement.classList.add('pxui');
    return PixelUI;
  }

  var PixelUI = {
    version: '1.0.0',
    palette: PAL,
    install: install,
    // font
    font: { family: 'PixelUI', glyphs: glyphs, cellHeight: CELL_H, ascent: ASC, descent: DESC, url: getFontURL, build: buildTTF },
    measure: measure, textCanvas: textCanvas, drawText: drawText,
    // images
    Img: Img, frame: frame, frames: function () { return Object.keys(FRAMES); }, drawFrame: drawFrame, frameCSS: cssFrame,
    icon: icon, icons: function () { return Object.keys(ICONS); }, tones: TONES,
    pattern: pattern, patterns: function () { return Object.keys(patterns); },
    dither: dither, gradient: gradient, Canvas: PixelCanvas,
    // extension points for game-specific art
    definePattern: function (name, fn) { patterns[name] = fn; delete patCache[name]; },
    defineFrame: function (name, spec) { FRAMES[name] = spec; delete frameCache[name]; },
    defineIcon: function (name, rows) { ICONS[name] = rows; }
  };
  root.PixelUI = PixelUI;
  if (typeof module !== 'undefined' && module.exports) module.exports = PixelUI;
})(typeof window !== 'undefined' ? window : this);
