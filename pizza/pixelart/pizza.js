/* Pizza's self-contained pixel artwork. No image downloads or sprite sheets. */
(function (root) {
    'use strict';
    const UI = root.PixelUI;
    if (!UI) return; // Keep the original renderer available if the UI kit is missing.
    const buffer = document.createElement('canvas');
    buffer.width = 480; buffer.height = 320;
    const c = buffer.getContext('2d');
    const portrait = document.createElement('canvas'); portrait.width = 284; portrait.height = 454;
    const mobile = () => root.innerWidth < 600;
    const logicalHeight = () => mobile() ? Math.round(454 / 284 * 960) : 640;
    const P = { ink: '#17131b', wall: '#30232b', brick: '#734238', mortar: '#452d30',
        wood: '#84563e', edge: '#bc8555', dark: '#453035', cream: '#fff2d2',
        paper: '#e8cf99', red: '#b84c45', gold: '#f7c95d', green: '#8db653', teal: '#82ecd2' };
    const reducedMotion = root.matchMedia('(prefers-reduced-motion: reduce)');
    const r = (x, y, w, h, color) => { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
    function text(str, x, y, color = 'w', scale = 1, align = 'left') {
        UI.drawText(c, String(str), x, y, { color, scale, align });
    }
    function panel(x, y, w, h, fill = P.dark, rim = P.edge) {
        r(x, y, w, h, P.ink); r(x + 1, y + 1, w - 2, h - 2, rim);
        r(x + 3, y + 3, w - 6, h - 6, fill);
        r(x + 3, y + h - 4, w - 6, 1, '#33272a');
        r(x + 1, y + h, w, 2, P.ink);
    }
    function sprite(w, h, paint) {
        const image = document.createElement('canvas'); image.width = w; image.height = h;
        const sc = image.getContext('2d');
        const box = (x, y, bw, bh, color) => { sc.fillStyle = color; sc.fillRect(x, y, bw, bh); };
        paint(box); return image;
    }
    // Integer scanlines keep rounded silhouettes crisp, without anti-aliased edges.
    function oval(b, x, y, w, h, color) {
        for (let row = 0; row < h; row++) {
            const half = Math.sqrt(Math.max(0, 1 - Math.pow((row + 0.5 - h / 2) / (h / 2), 2))) * w / 2;
            const left = Math.ceil(w / 2 - half), right = Math.floor(w / 2 + half);
            b(x + left, y + row, Math.max(1, right - left), 1, color);
        }
    }
    // All ten recipes have individual, readable ingredients at native 32px size.
    const smallPizzas = Array.from({ length: 10 }, (_, i) => sprite(32, 32, b => {
        const level = i + 1;
        oval(b, 2, 22, 29, 8, '#172328');
        if (level === 1) {
            oval(b, 5, 8, 23, 20, '#765547'); oval(b, 5, 6, 23, 20, '#cda675');
            oval(b, 6, 6, 21, 17, '#eed3a0'); oval(b, 8, 7, 15, 9, '#fff0c8');
            [[11, 10], [15, 13], [12, 17]].forEach(([x, y]) => { b(x, y, 7, 1, '#cda675'); b(x + 1, y + 1, 5, 1, '#e3bd88'); });
            [[4, 25], [8, 28], [26, 26], [3, 22], [25, 7]].forEach(([x,y]) => b(x,y,1,1,'#fff0c8'));
            return;
        }
        const special = level >= 8, royal = level === 10;
        // Ink outline, two-tone crust (lit from the top-left) and a sauce lip.
        oval(b, 1, 2, 31, 27, P.ink);
        oval(b, 2, 4, 29, 24, royal ? '#9a5a22' : '#7e4c2c');
        oval(b, 2, 3, 29, 23, royal ? '#e9a93c' : special ? '#c27e3e' : '#cf9552');
        oval(b, 3, 3, 26, 20, royal ? '#ffd76a' : special ? '#e7a956' : '#eabd78');
        [[7,5],[13,3],[22,4],[4,11],[27,13],[6,21],[24,22],[15,25]].forEach(([x,y],n) => b(x,y,2,1,n%3 ? '#fff0c4' : '#a9693a'));
        oval(b, 6, 6, 21, 18, '#8e3029'); oval(b, 6, 6, 21, 17, '#b8432f');
        const cheese = level >= 3 && level !== 7;
        if (cheese) {
            oval(b, 7, 7, 19, 15, '#e8a948'); oval(b, 7, 7, 19, 14, '#f7cf63'); oval(b, 8, 7, 15, 10, '#ffe596');
            [[7,12],[24,10],[12,20],[22,19]].forEach(([x,y]) => b(x,y,2,2,'#f7cf63')); // drips onto the sauce lip
        } else { oval(b, 7, 7, 19, 15, '#d4553a'); b(10,9,6,1,'#ec8462'); b(9,10,2,2,'#ec8462'); b(20,17,3,1,'#9c3a2e'); }
        const slices = () => { b(16,7,1,15,'#d99b3e'); b(7,14,19,1,'#d99b3e'); b(17,7,1,15,'#fff0b0'); };
        const browned = (x,y) => { b(x,y,2,1,'#d58b37'); b(x+1,y+1,1,1,'#b06a2c'); };
        const pepperoni = (x,y) => { oval(b,x,y,5,5,'#6e2224'); oval(b,x,y,5,4,'#c2403a'); b(x+1,y+1,2,1,'#ef8466'); b(x+3,y+2,1,1,'#7e2a28'); };
        const mushroom = (x,y) => { b(x+1,y,3,1,'#5a3f36'); b(x,y+1,5,2,'#e9dcbd'); b(x,y+1,5,1,'#8d6a55'); b(x+2,y+3,1,2,'#e9dcbd'); b(x+3,y+3,1,2,'#a78c72'); };
        const olive = (x,y) => { b(x+1,y,2,1,'#22232b'); b(x,y+1,1,2,'#22232b'); b(x+3,y+1,1,2,'#22232b'); b(x+1,y+3,2,1,'#22232b'); b(x+1,y,1,1,'#686d7a'); };
        const greenPepper = (x,y) => { b(x,y,3,1,'#3f7a35'); b(x+3,y+1,1,2,'#3f7a35'); b(x,y,2,1,'#8fc95e'); };
        const basil = (x,y) => { b(x,y+3,1,1,'#2d5a32'); b(x+1,y+1,3,3,'#4f8f42'); b(x+2,y,3,2,'#7dbb52'); b(x+3,y,1,1,'#b6dc78'); b(x+1,y+3,2,1,'#2d5a32'); };
        const mozza = (x,y) => { oval(b,x,y,5,4,'#d9c79a'); oval(b,x,y,5,3,'#fff8e6'); b(x+1,y,1,1,'#ffffff'); };
        if (level === 3) [[10,9],[19,8],[15,13],[9,16],[21,15],[17,19]].forEach(([x,y]) => browned(x,y));
        if (level === 4) [[8,8],[17,7],[13,13],[20,14],[9,16],[15,19]].forEach(([x,y]) => pepperoni(x,y));
        if (level === 5) { [[8,9],[18,8],[12,15],[20,15]].forEach(([x,y]) => mushroom(x,y)); browned(15,11); browned(9,19); }
        if (level === 6) { [[9,8],[19,9],[14,12],[8,16],[21,16],[15,19]].forEach(([x,y]) => olive(x,y)); greenPepper(16,7); greenPepper(10,13); greenPepper(18,15); }
        if (level === 7) { [[9,8],[18,11],[11,16]].forEach(([x,y]) => mozza(x,y)); [[15,8],[21,16],[8,12],[16,17]].forEach(([x,y]) => basil(x,y)); }
        if (level === 8) { slices(); pepperoni(9,8); pepperoni(19,16); mushroom(19,8); mushroom(9,16); olive(13,10); olive(22,11); greenPepper(13,18); greenPepper(9,13); }
        if (level === 9) { slices(); pepperoni(9,8); mushroom(19,8); olive(9,16); olive(12,18); basil(19,16); browned(13,10); browned(22,12); }
        if (level === 10) {
            slices(); pepperoni(9,8); mozza(19,8); basil(19,16); pepperoni(9,16); olive(13,11); basil(13,17); mushroom(21,12);
            // Crown hovering over the crust, plus a sparkle.
            b(11,0,11,5,P.ink); b(12,1,1,2,'#ffe58a'); b(16,0,1,2,'#ffe58a'); b(20,1,1,2,'#ffe58a');
            b(12,3,9,2,'#f7c95d'); b(12,4,9,1,'#c8892e'); b(16,3,1,1,'#ea5b75'); b(13,3,1,1,'#82ecd2'); b(19,3,1,1,'#82ecd2');
            b(27,1,1,5,'#fff2ac'); b(25,3,5,1,'#fff2ac'); b(27,3,1,1,'#ffffff'); b(3,6,1,3,'#fff2ac'); b(2,7,3,1,'#fff2ac');
        }
    }));
    const profiles = {
        zombie: ['#8fae6e', '#5f7a4c', '#52677b'], dracula: ['#e2d6e6', '#a58aa8', '#2a2233'],
        ghost: ['#e3f0f2', '#9db6c8', '#a8bdcb'], skeleton: ['#ece2c2', '#a9a084', '#3a3340'],
        mummy: ['#ead5a4', '#b19a76', '#c8b48a'], witch: ['#9bb36c', '#6b8a56', '#5a3a70'],
        frankenstein: ['#8ca478', '#61795a', '#5d4a3e'], pumpkin: ['#f1a951', '#c4723c', '#4e5a3c'],
        imp: ['#e07a62', '#a34a48', '#4a2a3a']
    };
    // 48x60 actors, drawn 1:1 into the 480x320 scene: chibi head, readable outfits.
    const actors = {};
    Object.entries(profiles).forEach(([type, [skin, shade, coat]]) => {
        ['idle', 'angry', 'happyLeaving'].forEach(mood => {
            actors[type + ':' + mood] = sprite(48, 60, b => {
                const O = P.ink, ov = (x, y, w, h, col) => oval(b, x, y, w, h, col);
                const blob = (x, y, w, h, fill) => { ov(x, y, w, h, O); ov(x + 1, y + 1, w - 2, h - 2, fill); };
                const box = (x, y, w, h, fill) => { b(x, y, w, h, O); b(x + 1, y + 1, w - 2, h - 2, fill); };
                const angry = mood === 'angry', happy = mood === 'happyLeaving';
                const glow = angry ? '#ff5a4f' : '#ffd25e';
                const ghost = type === 'ghost', bony = type === 'skeleton';
                ov(8, 54, 32, 5, '#18262b');
                // Behind the body: capes, wings, tails, hair.
                if (type === 'dracula') { box(7, 27, 34, 26, '#5c1f2e'); b(10, 30, 28, 21, '#a8384f'); b(10, 30, 2, 21, '#c9506a'); }
                if (type === 'imp') {
                    [[1, 6], [39, 41]].forEach(([x, rx]) => { box(x, 28, 9, 13, '#6d2f3f'); b(x + 2, 30, 1, 10, '#a34a48'); b(x + 5, 30, 1, 9, '#a34a48'); });
                    b(34, 46, 9, 3, O); b(35, 47, 7, 1, shade); b(40, 40, 3, 8, O); b(41, 41, 1, 6, shade);
                    box(38, 35, 7, 6, skin); b(40, 34, 3, 1, O);
                }
                if (type === 'witch') { b(7, 14, 7, 20, O); b(8, 14, 5, 19, '#d4733a'); b(34, 14, 7, 20, O); b(35, 14, 5, 19, '#b45a2d'); }
                if (ghost) {
                    blob(7, 5, 34, 34, shade); ov(8, 6, 30, 32, skin);
                    b(7, 22, 34, 20, O); b(8, 22, 32, 20, skin); b(35, 22, 5, 20, shade);
                    for (let x = 7; x < 41; x += 8) { ov(x, 37, 9, 9, O); ov(x + 1, 37, 7, 7, x > 30 ? shade : skin); }
                    blob(2, 27, 8, 9, skin); blob(38, 25, 8, 9, shade);
                    b(13, 9, 9, 2, '#ffffff'); b(11, 12, 3, 1, '#ffffff');
                } else {
                    // Legs and shoes.
                    [16, 25].forEach(x => {
                        if (bony) { b(x + 1, 46, 5, 7, O); b(x + 2, 46, 3, 6, skin); }
                        else { b(x, 46, 7, 7, O); b(x + 1, 46, 5, 6, type === 'mummy' ? skin : '#3b3142'); }
                        b(x - 1, 51, 9, 4, O); b(x, 52, 7, 2, '#5b5153'); b(x, 52, 3, 1, '#867b7e');
                    });
                    // Torso and arms with a left key light.
                    box(13, 30, 22, 18, coat); b(29, 31, 5, 16, '#17131b40'); b(15, 32, 2, 12, '#ffffff22');
                    [9, 34].forEach(x => {
                        box(x, 32, 5, 12, bony ? O : coat);
                        if (bony) b(x + 2, 33, 1, 10, skin);
                        blob(x - 1, 41, 7, 6, x > 20 ? shade : skin);
                    });
                    if (type === 'zombie') { b(20, 31, 8, 5, '#e7c79b'); b(23, 33, 2, 3, O); b(16, 38, 4, 3, '#6e8a55'); b(30, 41, 2, 4, '#3a4a5a'); [15, 20, 26, 31].forEach(x => b(x, 46, 2, 2, O)); }
                    if (type === 'dracula') { b(20, 31, 8, 9, '#fff2d2'); b(23, 32, 2, 2, '#ea5b75'); b(23, 36, 2, 1, O); box(8, 25, 7, 9, '#5c1f2e'); box(33, 25, 7, 9, '#5c1f2e'); }
                    if (bony) { b(23, 31, 2, 15, skin); for (let y = 33; y < 44; y += 3) { b(16, y, 7, 1, skin); b(25, y, 7, 1, shade); } b(18, 44, 12, 2, shade); }
                    if (type === 'mummy') { for (let y = 32; y < 46; y += 3) b(14 + (y % 2) * 2, y, 18, 1, shade); b(34, 39, 7, 2, skin); b(39, 41, 2, 4, skin); }
                    if (type === 'witch') { b(19, 31, 10, 3, '#d4733a'); b(14, 40, 20, 2, '#c78a2d'); b(23, 40, 3, 2, P.gold); b(10, 34, 3, 1, '#7a5490'); b(35, 34, 3, 1, '#7a5490'); }
                    if (type === 'frankenstein') { b(13, 30, 22, 3, '#3a2e28'); b(16, 36, 5, 5, '#7a6a52'); b(16, 36, 5, 1, O); b(27, 40, 4, 4, '#4a6a7a'); b(23, 33, 2, 13, '#3a2e28'); }
                    if (type === 'pumpkin') { b(20, 31, 8, 3, '#8db653'); b(14, 38, 20, 1, '#3b4630'); b(16, 41, 2, 2, '#c58c4e'); b(28, 35, 3, 3, '#8db653'); }
                    if (type === 'imp') { b(19, 31, 10, 4, '#a34a48'); b(21, 34, 6, 1, P.gold); }
                }
                // Ears before the head so the skull overlaps them.
                if (['zombie', 'frankenstein', 'witch'].includes(type)) { blob(5, 15, 7, 9, skin); blob(36, 15, 7, 9, shade); }
                if (type === 'dracula' || type === 'imp') { b(3, 14, 8, 6, O); b(4, 15, 6, 4, skin); b(3, 13, 2, 2, O); b(37, 14, 8, 6, O); b(38, 15, 6, 4, shade); b(43, 13, 2, 2, O); }
                if (!ghost) {
                    if (type === 'frankenstein') { box(9, 5, 30, 28, skin); b(32, 6, 6, 26, shade); b(12, 7, 10, 2, '#ffffff40'); }
                    else if (type === 'pumpkin') {
                        blob(5, 4, 38, 29, shade); ov(6, 5, 33, 27, skin);
                        [15, 24, 33].forEach(x => b(x, 7, 1, 24, shade)); b(10, 8, 4, 2, '#ffd08a'); b(19, 6, 4, 1, '#ffd08a');
                        b(21, 0, 6, 7, O); b(22, 1, 4, 6, '#6c7752'); b(27, 1, 7, 4, O); b(28, 2, 5, 2, '#8db653');
                    } else { blob(9, 4, 30, 29, shade); ov(10, 5, 26, 26, skin); b(15, 7, 9, 2, '#ffffff45'); b(13, 9, 3, 1, '#ffffff30'); }
                }
                // Hair, hats and head markings.
                if (type === 'zombie') { b(12, 4, 22, 5, '#3d4a3a'); b(14, 2, 3, 3, '#3d4a3a'); b(20, 1, 3, 4, '#3d4a3a'); b(28, 2, 3, 3, '#3d4a3a'); b(12, 9, 4, 2, '#3d4a3a'); b(31, 20, 1, 6, '#3d4a3a'); b(30, 21, 3, 1, '#3d4a3a'); b(30, 24, 3, 1, '#3d4a3a'); }
                if (type === 'dracula') { b(10, 4, 28, 7, '#2a2233'); b(11, 11, 4, 4, '#2a2233'); b(33, 11, 4, 4, '#2a2233'); b(21, 10, 6, 2, '#2a2233'); b(23, 12, 2, 2, '#2a2233'); b(14, 5, 7, 1, '#5a4a6a'); }
                if (bony) { b(30, 8, 1, 3, shade); b(31, 11, 1, 3, shade); b(17, 26, 14, 6, skin); b(17, 31, 14, 1, shade); }
                if (type === 'mummy') { for (let y = 7; y < 31; y += 4) b(10, y, 28, 1, shade); b(28, 9, 6, 1, skin); b(12, 28, 8, 1, '#f4e4bd'); }
                if (type === 'witch') {
                    b(17, 4, 15, 7, O); b(18, 5, 13, 6, '#4a2f5c'); b(20, 1, 9, 5, O); b(21, 1, 7, 5, '#4a2f5c');
                    b(26, 0, 7, 3, O); b(27, 0, 5, 2, '#4a2f5c'); ov(3, 9, 42, 7, O); ov(4, 10, 40, 5, '#4a2f5c'); b(8, 11, 30, 1, '#6b4a80');
                    b(17, 8, 15, 2, '#c78a2d'); box(22, 7, 5, 4, P.gold);
                }
                if (type === 'frankenstein') {
                    b(9, 3, 30, 7, '#24282a'); [12, 18, 26, 32].forEach(x => b(x, 10, 3, 2, '#24282a'));
                    b(14, 13, 10, 1, O); [15, 18, 21].forEach(x => b(x, 12, 1, 3, O));
                    box(4, 24, 6, 5, '#a7b2b3'); box(38, 24, 6, 5, '#a7b2b3'); b(5, 25, 2, 1, '#e3eaea'); b(39, 25, 2, 1, '#e3eaea');
                }
                if (type === 'imp') { box(10, 0, 5, 9, '#f5ce96'); box(33, 0, 5, 9, '#f5ce96'); b(11, 0, 1, 2, O); b(36, 0, 1, 2, O); b(13, 13, 22, 1, shade); }
                // Eyes.
                const y = 15;
                [14, 27].forEach((ex, side) => {
                    if (bony || type === 'pumpkin' || ghost) {
                        if (happy) { b(ex, y + 3, 1, 2, O); b(ex + 1, y + 2, 4, 1, O); b(ex + 5, y + 3, 1, 2, O); return; }
                        if (type === 'pumpkin') { b(ex, y + 1, 7, 5, O); b(ex + 1, y + 2, 5, 3, glow); b(ex + 2, y, 3, 1, O); b(ex + 3, y + 1, 1, 1, glow); return; }
                        ov(ex, y, 6, ghost ? 8 : 7, O);
                        if (ghost) b(ex + 1, y + 1, 2, 2, '#ffffff'); else b(ex + 2, y + 2, 2, 2, glow);
                    } else if (happy) { b(ex, y + 3, 1, 2, O); b(ex + 1, y + 2, 4, 1, O); b(ex + 5, y + 3, 1, 2, O); }
                    else {
                        b(ex, y, 6, 7, O); b(ex + 1, y + 1, 4, 5, angry ? '#ffd2b8' : '#fff2d2');
                        b(ex + 2 + side, y + 2, 2, 3, angry ? '#c2303a' : O); b(ex + 1, y + 1, 1, 1, '#ffffff');
                        if (angry) b(ex + 1, y + 1, 4, 1, O);
                    }
                    if (angry) side ? (b(ex, y - 1, 2, 1, O), b(ex + 2, y - 2, 2, 1, O), b(ex + 4, y - 3, 2, 1, O))
                        : (b(ex, y - 3, 2, 1, O), b(ex + 2, y - 2, 2, 1, O), b(ex + 4, y - 1, 2, 1, O));
                });
                if (type === 'zombie' && !happy) b(15, 16, 4, 2, shade); // droopy lid
                if (type === 'mummy') { b(26, 14, 10, 3, skin); b(26, 16, 10, 1, shade); }
                if (!ghost && type !== 'pumpkin') b(23, 22, 2, 1, shade);
                if (bony) { b(22, 21, 4, 2, O); b(23, 23, 2, 1, O); }
                // Mouths.
                if (type === 'pumpkin') {
                    b(15, 24, 18, 5, O); b(16, 25, 16, 3, glow); [19, 25].forEach(x => b(x, 25, 2, 1, O)); b(22, 27, 2, 1, O);
                    if (happy) { b(14, 23, 2, 2, O); b(32, 23, 2, 2, O); }
                } else if (bony) {
                    b(17, 26, 14, happy ? 5 : 3, O); for (let x = 18; x < 30; x += 2) b(x, 26, 1, 2, skin);
                    if (angry) { b(17, 25, 2, 1, O); b(29, 25, 2, 1, O); }
                } else if (angry) {
                    b(18, 24, 12, 5, O); b(19, 25, 10, 3, '#fff2d2'); [21, 24, 27].forEach(x => b(x, 25, 1, 3, O));
                } else if (happy) {
                    b(18, 24, 12, 1, O); b(19, 25, 10, 3, O); b(20, 25, 8, 2, '#7a2a33'); b(22, 26, 4, 1, '#ea8d8a');
                    if (!ghost) { b(11, 22, 4, 2, '#ea8d8a'); b(33, 22, 4, 2, '#ea8d8a'); }
                } else if (ghost) { ov(21, 25, 5, 4, O); }
                else { b(20, 26, 8, 1, O); b(27, 25, 1, 1, O); }
                if (type === 'dracula' && !angry) { b(20, 27, 1, 2, '#fff2d2'); b(26, 27, 1, 2, '#fff2d2'); }
                if (type === 'imp') b(26, happy ? 25 : 27, 1, 2, '#fff2d2');
                if (type === 'zombie' && !angry) b(22, 27, 1, 2, '#fff2d2');
            });
        });
    });
    // 40px recipes for the board; the 32px set above stays for small icons so nothing is downsampled.
    const S = v => Math.round(v * 1.25);
    const pizzas = Array.from({ length: 10 }, (_, i) => sprite(40, 40, b => {
        const level = i + 1;
        oval(b, 3, 28, 35, 10, '#172328');
        if (level === 1) {
            oval(b, 5, 10, 30, 25, P.ink); oval(b, 6, 11, 28, 23, '#765547'); oval(b, 6, 8, 28, 24, '#cda675');
            oval(b, 7, 8, 26, 21, '#eed3a0'); oval(b, 10, 9, 18, 11, '#fff0c8'); b(13, 10, 5, 1, '#ffffff');
            [[13, 13], [18, 17], [14, 22]].forEach(([x, y]) => { b(x, y, 9, 1, '#cda675'); b(x + 1, y + 1, 7, 1, '#e3bd88'); });
            [[4, 31], [9, 35], [32, 32], [3, 27], [31, 8], [34, 12]].forEach(([x, y]) => b(x, y, 1, 1, '#fff0c8'));
            return;
        }
        const special = level >= 8, royal = level === 10;
        oval(b, 1, 3, 38, 33, P.ink);
        oval(b, 2, 5, 36, 30, royal ? '#9a5a22' : '#7e4c2c');
        oval(b, 2, 4, 36, 29, royal ? '#e9a93c' : special ? '#c27e3e' : '#cf9552');
        oval(b, 3, 4, 33, 26, royal ? '#ffd76a' : special ? '#e7a956' : '#eabd78');
        b(9, 5, 8, 1, royal ? '#fff3c0' : '#f8d9a0');
        [[8,6],[16,4],[27,5],[4,14],[34,16],[7,27],[30,28],[19,32],[24,4],[35,22]].forEach(([x,y],n) => b(x,y,2,1,n%3 ? '#fff0c4' : '#a9693a'));
        oval(b, 7, 7, 26, 23, '#8e3029'); oval(b, 7, 7, 26, 22, '#b8432f');
        const cheese = level >= 3 && level !== 7;
        if (cheese) {
            oval(b, 9, 9, 22, 19, '#e8a948'); oval(b, 9, 9, 22, 18, '#f7cf63'); oval(b, 10, 9, 18, 12, '#ffe596');
            b(13, 10, 6, 1, '#fff6c8');
            [[8,15],[30,13],[14,26],[27,24]].forEach(([x,y]) => { b(x,y,3,2,'#f7cf63'); b(x+1,y+2,1,1,'#e8a948'); });
        } else { oval(b, 9, 9, 22, 19, '#d4553a'); b(12,11,8,1,'#ec8462'); b(11,12,2,3,'#ec8462'); b(25,22,4,1,'#9c3a2e'); b(14,24,3,1,'#9c3a2e'); }
        const slices = () => { b(20,9,1,19,'#d99b3e'); b(9,18,23,1,'#d99b3e'); b(21,9,1,19,'#fff0b0'); b(9,19,23,1,'#fff0b0'); };
        const browned = (x,y) => { b(x,y,3,1,'#d58b37'); b(x+1,y+1,2,1,'#b06a2c'); };
        const pepperoni = (x,y) => { oval(b,x,y,7,7,'#6e2224'); oval(b,x,y,7,6,'#c2403a'); oval(b,x+1,y+1,5,4,'#d24e40'); b(x+1,y+1,3,1,'#ef8466'); b(x+4,y+3,1,1,'#7e2a28'); b(x+2,y+4,1,1,'#7e2a28'); };
        const mushroom = (x,y) => { b(x+1,y,5,1,'#5a3f36'); b(x,y+1,7,3,'#e9dcbd'); b(x,y+1,7,1,'#8d6a55'); b(x+1,y+3,5,1,'#cbb894'); b(x+2,y+4,3,3,'#e9dcbd'); b(x+4,y+4,1,3,'#a78c72'); };
        const olive = (x,y) => { b(x+1,y,3,1,'#22232b'); b(x,y+1,1,3,'#22232b'); b(x+4,y+1,1,3,'#22232b'); b(x+1,y+4,3,1,'#22232b'); b(x+1,y,1,1,'#686d7a'); b(x+1,y+1,1,1,'#3a3c46'); };
        const greenPepper = (x,y) => { b(x,y,4,1,'#3f7a35'); b(x+4,y+1,1,3,'#3f7a35'); b(x,y,3,1,'#8fc95e'); b(x+3,y+1,1,1,'#2d5a28'); };
        const basil = (x,y) => { b(x,y+4,1,1,'#2d5a32'); b(x+1,y+2,4,3,'#4f8f42'); b(x+2,y+1,4,2,'#7dbb52'); b(x+4,y,2,1,'#7dbb52'); b(x+4,y,1,1,'#b6dc78'); b(x+2,y+3,2,1,'#2d5a32'); };
        const mozza = (x,y) => { oval(b,x,y,7,5,'#d9c79a'); oval(b,x,y,7,4,'#fff8e6'); b(x+1,y+1,2,1,'#ffffff'); };
        const at = (f, list) => list.forEach(([x,y]) => f(S(x), S(y)));
        if (level === 3) at(browned, [[10,9],[19,8],[15,13],[9,16],[21,15],[17,19],[12,12]]);
        if (level === 4) at(pepperoni, [[8,8],[17,7],[13,13],[20,14],[8,16],[15,19]]);
        if (level === 5) { at(mushroom, [[8,9],[18,8],[12,15],[20,15]]); at(browned, [[15,11],[9,19],[23,12]]); }
        if (level === 6) { at(olive, [[9,8],[19,9],[14,12],[8,16],[21,16],[15,19]]); at(greenPepper, [[16,7],[10,13],[18,15],[22,12]]); }
        if (level === 7) { at(mozza, [[9,8],[18,11],[11,16]]); at(basil, [[15,7],[21,16],[8,12],[16,17]]); }
        if (level === 8) { slices(); at(pepperoni, [[9,8],[19,16]]); at(mushroom, [[19,8],[9,16]]); at(olive, [[13,10],[22,11]]); at(greenPepper, [[13,18],[9,13]]); }
        if (level === 9) { slices(); at(pepperoni, [[9,8]]); at(mushroom, [[19,8]]); at(olive, [[9,16],[12,18]]); at(basil, [[19,16],[22,18]]); at(browned, [[13,11],[23,12]]); }
        if (level === 10) {
            slices(); at(pepperoni, [[9,8],[9,16]]); at(mozza, [[19,8]]); at(basil, [[19,16],[13,17]]); at(olive, [[13,11]]); at(mushroom, [[21,12]]);
            b(13,0,15,7,P.ink); b(14,1,1,3,'#ffe58a'); b(20,0,1,3,'#ffe58a'); b(26,1,1,3,'#ffe58a');
            b(14,4,13,2,'#f7c95d'); b(14,5,13,1,'#c8892e'); b(20,4,1,1,'#ea5b75'); b(16,4,1,1,'#82ecd2'); b(24,4,1,1,'#82ecd2');
            b(34,1,1,7,'#fff2ac'); b(31,4,7,1,'#fff2ac'); b(34,4,1,1,'#ffffff'); b(4,8,1,5,'#fff2ac'); b(2,10,5,1,'#fff2ac');
        }
    }));
    // 36x48 head chef: puffed toque, curled moustache, double-breasted whites.
    const chef = sprite(36, 48, b => {
        const O = P.ink, skin = '#f3b892', white = '#fff2d2', fold = '#d9cfb8';
        [[4, 2, 12, 11], [11, 0, 14, 11], [20, 2, 12, 11]].forEach(([x, y, w, h]) => oval(b, x, y, w, h, O));
        [[5, 3, 10, 9], [12, 1, 12, 9], [21, 3, 10, 9]].forEach(([x, y, w, h]) => oval(b, x, y, w, h, white));
        b(10, 7, 1, 4, fold); b(24, 7, 1, 4, fold); b(14, 3, 4, 1, '#ffffff');
        b(7, 9, 22, 6, O); b(8, 10, 20, 4, white); b(8, 13, 20, 1, fold); b(25, 10, 3, 3, fold);
        b(5, 17, 4, 6, O); b(6, 18, 2, 4, skin); b(27, 17, 4, 6, O); b(28, 18, 2, 4, '#d9967a');
        b(8, 15, 20, 14, O); b(9, 15, 18, 13, skin); b(24, 15, 3, 13, '#e3a284');
        b(12, 18, 3, 3, O); b(21, 18, 3, 3, O); b(12, 18, 1, 1, '#ffffff'); b(21, 18, 1, 1, '#ffffff');
        b(11, 16, 4, 1, '#7a5648'); b(21, 16, 4, 1, '#7a5648');
        b(10, 22, 3, 1, '#ea8d8a'); b(23, 22, 3, 1, '#ea8d8a'); b(16, 20, 4, 3, '#e09a80'); b(16, 20, 2, 1, '#ffd2b8');
        b(11, 23, 14, 2, '#5b3f36'); b(8, 24, 5, 2, '#5b3f36'); b(23, 24, 5, 2, '#5b3f36'); b(7, 23, 2, 1, '#5b3f36'); b(27, 23, 2, 1, '#5b3f36'); b(13, 23, 3, 1, '#7a5648');
        b(15, 26, 6, 1, '#9c4a40');
        b(11, 28, 14, 3, '#b84c45'); b(16, 30, 4, 3, '#d9625a'); b(17, 30, 1, 1, '#f08a80');
        b(5, 30, 26, 15, O); b(6, 31, 24, 13, white); b(25, 31, 5, 13, fold); b(17, 31, 1, 13, fold);
        [[13, 33], [20, 33], [13, 38], [20, 38]].forEach(([x, y]) => { b(x, y, 2, 2, '#bba78c'); b(x, y, 1, 1, '#fff'); });
        b(0, 32, 6, 10, O); b(1, 33, 4, 8, white); b(30, 32, 6, 10, O); b(31, 33, 4, 8, fold);
        b(0, 40, 6, 4, O); b(1, 40, 4, 3, skin); b(30, 40, 6, 4, O); b(31, 40, 4, 3, skin);
        b(0, 42, 36, 2, '#efbc67'); b(0, 44, 36, 3, '#84563e'); b(0, 44, 36, 1, '#bc8555'); b(0, 47, 36, 1, O);
    });
    function item(level, x, y, scale = 1, badge = true) {
        const big = scale >= 0.9;
        const image = (big ? pizzas : smallPizzas)[Math.max(0, Math.min(9, level - 1))];
        const size = Math.max(12, Math.round((big ? 40 : 32) * scale));
        const px = Math.round(x - size / 2), py = Math.round(y - size / 2);
        c.drawImage(image, px, py, size, size);
        if (badge) {
            const inset = big ? 11 : 8, bx = px + size - inset, by = py + size - inset;
            r(bx - 1, by - 1, 12, 11, P.ink); r(bx, by, 10, 9, level >= 8 ? '#7c4a2a' : '#304640');
            r(bx, by, 10, 1, level >= 8 ? P.gold : '#739486');
            text(level, bx + 5, by + 1, level >= 8 ? 'G' : 'w', 1, 'center');
        }
    }
    const scene = document.createElement('canvas'); scene.width = 480; scene.height = 320;
    function makeScene() {
        const hash = (x, y) => Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        r(0, 0, 480, 320, P.mortar);
        // Hand-laid bricks: each one tinted, lit on top and shadowed underneath.
        for (let y = 0; y < 58; y += 10) for (let x = -((y / 10) % 2) * 13; x < 480; x += 26) {
            const h = hash(x, y), tone = h < 0.3 ? '#6a3b33' : h < 0.8 ? P.brick : '#82493b';
            r(x, y, 24, 8, tone); r(x + 1, y, 22, 1, h < 0.3 ? '#7d4a3c' : '#9a5a46'); r(x, y + 7, 24, 1, '#55302b');
            if (h > 0.85) r(x + 6, y + 3, 3, 1, '#55302b'); if (h < 0.12) r(x + 15, y + 4, 2, 2, '#9a5a46');
        }
        // Teal kitchen tiles with bevels and a little grime.
        for (let y = 59; y < 320; y += 16) for (let x = 0; x < 480; x += 16) {
            const odd = (x / 16 + (y - 59) / 16) % 2, h = hash(x, y);
            r(x, y, 16, 16, '#1f2e30'); r(x + 1, y + 1, 15, 15, odd ? '#2a4040' : '#324a4a');
            r(x + 1, y + 1, 14, 1, odd ? '#365252' : '#3f5c5a'); r(x + 1, y + 2, 1, 13, odd ? '#304848' : '#38524f');
            r(x + 2, y + 15, 14, 1, '#223333');
            if (h > 0.7) r(x + 3 + Math.floor(h * 9), y + 6 + Math.floor(h * 7), 1, 1, '#4a6664');
            if (h < 0.08) r(x + 9, y + 10, 3, 2, '#253838');
        }
        r(0, 55, 480, 6, P.ink); r(0, 55, 480, 2, P.edge); r(0, 57, 480, 1, '#8a5e3e');
        panel(22, 58, 250, 250, '#714b38', '#d1a36a');
        // Butcher-block board: plank seams, grain streaks and knots.
        for (let y = 63; y < 304; y += 12) {
            r(25, y, 244, 1, '#5a3a2e'); r(25, y + 1, 244, 1, '#8a5a40');
            for (let x = 30; x < 262; x += 23) { const h = hash(x, y); r(x + Math.floor(h * 9), y + 4 + Math.floor(h * 5), 6 + Math.floor(h * 10), 1, h > 0.5 ? '#9b6748' : '#634030'); }
        }
        for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++) {
            const x = 30 + col * 48, y = 65 + row * 48;
            r(x - 1, y - 1, 44, 44, '#2b2428'); r(x, y, 42, 42, '#9d7955');
            r(x + 1, y + 1, 40, 39, '#3e534c'); r(x + 2, y + 2, 38, 1, '#6a7e68');
            r(x + 2, y + 3, 1, 36, '#52695b'); r(x + 3, y + 39, 36, 1, '#253a36');
            r(x + 4, y + 4, 4, 1, '#8e9c77'); r(x + 4, y + 4, 1, 4, '#8e9c77');
            r(x + 34, y + 37, 4, 1, '#67826b'); r(x + 37, y + 34, 1, 4, '#67826b');
            r(x + 7, y + 32, 1, 1, '#7b8c70'); r(x + 31, y + 7, 2, 1, '#607762');
        }
        [[24,60],[268,60],[24,304],[268,304]].forEach(([x,y])=>{ r(x,y,2,2,'#f1d79b'); r(x+1,y+1,1,1,'#4c3432'); });
        r(279, 61, 3, 248, P.ink); r(282, 61, 1, 248, '#765247');
        for (let i = 0; i < 4; i++) {
            const y = 65 + i * 62;
            // Worn burgundy runner and brass service markers.
            r(294, y - 3, 66, 60, '#4d353a'); r(297, y - 3, 1, 60, '#ab7550'); r(356, y - 3, 1, 60, '#ab7550');
            r(299, y - 3, 1, 60, '#3a2830'); r(354, y - 3, 1, 60, '#3a2830');
            for (let d = 0; d < 5; d++) { const cy = y + 4 + d * 11; r(325, cy, 4, 1, '#6e4a4c'); r(324, cy + 1, 6, 1, '#7e5052'); r(325, cy + 2, 4, 1, '#6e4a4c'); }
            r(301, y + 48, 52, 4, '#28262c'); r(305, y + 51, 44, 2, '#66473e');
            r(289, y + 21, 3, 3, P.gold); r(290, y + 25, 1, 12, '#966d44');
        }
        // Ovens, copper hood and a tiny herb pot frame the working chef.
        panel(106, 3, 85, 52, '#9c5640', '#c78a58');
        for (let y = 6; y < 50; y += 6) { r(109, y, 79, 1, '#6b3e35'); for (let x = 110 + ((y / 6) % 2) * 6; x < 188; x += 12) r(x, y, 1, 6, '#6b3e35'); }
        for (let y = 7; y < 50; y += 6) for (let x = 111; x < 187; x += 12) if (hash(x, y) > 0.6) r(x + 1, y, 9, 1, '#b4684c');
        // Domed oven mouth with a stone arch and a glowing hearth.
        oval(r, 110, 10, 40, 44, P.ink); oval(r, 111, 11, 38, 42, '#d7a16b'); oval(r, 112, 12, 34, 40, '#b37551');
        oval(r, 115, 15, 30, 38, P.ink); oval(r, 116, 17, 28, 34, '#2a1814'); r(117, 36, 26, 12, '#4a2016'); r(119, 41, 22, 6, '#6e2c18');
        [[128, 11], [117, 16], [140, 16], [112, 27], [146, 27]].forEach(([x, y]) => r(x, y, 2, 3, '#7c4a2a'));
        r(108, 46, 44, 3, '#efbc67'); r(108, 46, 44, 1, '#fff0b0'); r(108, 49, 44, 4, '#7c4a2a'); r(108, 53, 44, 1, P.ink);
        r(152, 6, 1, 4, '#9a9a9a'); r(150, 9, 5, 2, '#c4c4c4'); // hook for the peel
        scene.getContext('2d').drawImage(buffer, 0, 0);
    }
    makeScene();
    // 8-frame idle cycles cut from each base sprite: the head breathes on its own, eyes blink,
    // and every monster gets one signature motion. Frames play at 8 fps.
    const FRAMES = 8;
    const headBob = [0, 0, 0, 1, 1, 1, 0, 0];
    const actorFrames = {};
    Object.keys(actors).forEach(key => {
        const [type, mood] = key.split(':'), base = actors[key], skin = profiles[type][0];
        const blinks = mood !== 'happyLeaving' && !['skeleton', 'ghost', 'pumpkin'].includes(type);
        actorFrames[key] = Array.from({ length: FRAMES }, (_, f) => sprite(48, 60, () => {}));
        actorFrames[key].forEach((frame, f) => {
            const fc = frame.getContext('2d'), part = (sx, sy, w, h, dx, dy) => fc.drawImage(base, sx, sy, w, h, dx, dy, w, h);
            const box = (x, y, w, h, color) => { fc.fillStyle = color; fc.fillRect(x, y, w, h); };
            if (type === 'ghost') {
                // Floats up and down while the hem ripples sideways.
                const lift = [0, -1, -1, -2, -2, -1, -1, 0][f], ripple = f % 4 < 2 ? 1 : -1;
                part(0, 0, 48, 40, 0, lift); part(0, 40, 48, 20, ripple, 40 + lift);
                part(0, 52, 48, 8, 0, 52); return;
            }
            const dy = mood === 'angry' ? [0, 1, 0, 1, 0, 1, 0, 1][f] : headBob[f];
            const tilt = type === 'zombie' && f >= 4 ? 1 : 0; // lolling head
            part(0, 31, 48, 29, 0, 31); part(0, 0, 48, 33, tilt, dy);
            if (blinks && f === 5) [14, 27].forEach(ex => { ex += tilt; box(ex, 15 + dy, 6, 7, skin); box(ex, 18 + dy, 6, 1, P.ink); });
            if (type === 'skeleton' && f % 2) part(16, 26, 16, 6, 16, 27 + dy); // chattering jaw
            if (type === 'witch' && f < 4) { fc.clearRect(16, dy, 18, 7); part(16, 0, 18, 7, 17, dy); } // hat tip sways
            if (type === 'pumpkin' && f % 4 === 2) { fc.globalCompositeOperation = 'lighter'; fc.globalAlpha = 0.4; part(14, 15, 21, 15, 14, 15 + dy); fc.globalAlpha = 1; fc.globalCompositeOperation = 'source-over'; } // candle flicker
            if (type === 'imp') { const wag = [0, -1, -2, -1, 0, 1, 0, 1][f]; fc.clearRect(40, 33, 6, 9); part(40, 33, 6, 9, 40, 33 + wag); } // tail wags
            if (type === 'dracula' && f >= 4) { fc.clearRect(0, 46, 48, 8); part(0, 46, 48, 8, 1, 46); } // cape hem sways
            if (type === 'frankenstein' && f === 6) { box(3, 22, 2, 2, '#fff2ac'); box(43, 22, 2, 2, '#fff2ac'); box(2, 21, 1, 1, '#82ecd2'); box(45, 21, 1, 1, '#82ecd2'); }
        });
    });
    const frameOf = (key, time, seed) => {
        const set = actorFrames[key] || actorFrames[key.split(':')[0] + ':idle'];
        return set[reducedMotion.matches ? 0 : Math.floor(time * 8 + seed * 3) % FRAMES];
    };
    // HUD icons.
    const coin = sprite(14, 14, b => {
        oval(b, 0, 1, 14, 13, P.ink); oval(b, 1, 1, 12, 12, '#c8892e'); oval(b, 1, 1, 11, 11, P.gold);
        oval(b, 3, 3, 7, 7, '#e0a63c'); b(5, 4, 3, 1, '#fff2ac'); b(4, 5, 1, 3, '#fff2ac'); b(3, 2, 3, 1, '#ffffff');
    });
    const flame = sprite(11, 14, b => {
        b(4, 0, 2, 2, P.ink); b(3, 2, 4, 2, P.ink); b(1, 4, 9, 9, P.ink); b(2, 13, 7, 1, P.ink);
        b(4, 1, 1, 2, '#f08a3c'); b(3, 3, 3, 2, '#f08a3c'); b(2, 5, 7, 7, '#e0582c'); b(3, 12, 5, 1, '#c4502c');
        b(4, 7, 3, 5, P.gold); b(5, 9, 1, 3, '#fff2ac');
    });
    const heart = sprite(7, 6, b => { b(0, 0, 3, 3, P.red); b(4, 0, 3, 3, P.red); b(0, 1, 7, 2, P.red); b(1, 3, 5, 1, P.red); b(2, 4, 3, 1, P.red); b(3, 5, 1, 1, P.red); b(1, 0, 1, 1, '#f5a0a0'); });
    // Edge vignette and warm oven light, baked once and laid over every frame.
    const shade = document.createElement('canvas'); shade.width = 480; shade.height = 320;
    (function () {
        const sc = shade.getContext('2d');
        [0.22, 0.16, 0.11, 0.07, 0.04].forEach((a, k) => {
            sc.fillStyle = 'rgba(10,6,14,' + a + ')'; const d = k * 4;
            sc.fillRect(d, d, 480 - d * 2, 4); sc.fillRect(d, 316 - d, 480 - d * 2, 4);
            sc.fillRect(d, d + 4, 4, 312 - d * 2); sc.fillRect(476 - d, d + 4, 4, 312 - d * 2);
        });
    })();
    let shownGold = 0, lastGold = 0, lastClock = 0, primed = false;
    const seen = new WeakSet(), launches = new Map(), LAUNCH = 0.55;
    const popups = [];
    const spark = (x, y, s, color) => { r(x - s, y, s * 2 + 1, 1, color); r(x, y - s, 1, s * 2 + 1, color); r(x, y, 1, 1, '#ffffff'); };
    function hud(state, time, dt) {
        // Revenue counts up instead of jumping, and every sale pops a +N tag.
        if (state.gold < shownGold || state.gold < lastGold) shownGold = state.gold;
        else shownGold += Math.max(1, (state.gold - shownGold) * Math.min(1, dt * 8));
        if (shownGold > state.gold) shownGold = state.gold;
        if (state.gold > lastGold) {
            const fresh = popups.find(p => p.age < 0.4);
            if (fresh) { fresh.amount += state.gold - lastGold; fresh.age = 0; }
            else popups.push({ amount: state.gold - lastGold, x: 76, y: 47, age: 0 });
        }
        lastGold = state.gold;
        panel(8, 8, 96, 41); c.drawImage(coin, 14, 12); text('REVENUE', 31, 15, 'y');
        const rising = shownGold < state.gold;
        text(Math.floor(shownGold).toLocaleString('en-US'), 16, 29, rising ? 'G' : 'g', shownGold < 1000000 ? 2 : 1);
        panel(193, 8, 79, 41); c.drawImage(flame, 200, 12); text('NEXT BAKE', 213, 15, 'y');
        const fill = Math.max(0, Math.min(1, state.turnTimer / 2)), w = Math.floor(61 * fill);
        r(201, 30, 63, 9, P.ink); r(202, 31, 61, 7, '#2a2026');
        r(202, 31, w, 7, '#e0582c'); r(202, 31, w, 4, '#f08a3c'); r(202, 31, w, 1, P.gold);
        if (w > 1) r(201 + w, 31, 1, 7, '#fff2ac');
        for (let i = 1; i < 8; i++) r(201 + i * 8, 31, 1, 7, '#17131b88');
        if (fill > 0.9 && Math.floor(time * 8) % 2) { r(200, 29, 65, 1, P.gold); r(200, 39, 65, 1, P.gold); }
        // Neon sign with chasing marquee bulbs.
        panel(291, 7, 180, 43, '#1e3432', '#bc8555');
        r(296, 12, 170, 33, '#223d3a'); r(296, 12, 170, 1, '#2f5450');
        const chase = Math.floor(time * 6);
        for (let n = 0, x = 299; x < 468; x += 12, n++) {
            const on = (n + chase) % 3 !== 0;
            r(x, 9, 3, 3, on ? '#fff2ac' : '#7c5a2a'); r(x, 44, 3, 3, on ? '#fff2ac' : '#7c5a2a');
            if (on) { r(x + 1, 10, 1, 1, '#ffffff'); r(x + 1, 45, 1, 1, '#ffffff'); }
        }
        const flicker = !reducedMotion.matches && Math.sin(time * 23) > 0.97;
        text('MIDNIGHT', 381, 15, flicker ? 'O' : 'g', 1, 'center');
        text('PIZZERIA', 380, 27, 'O', 2, 'center'); text('PIZZERIA', 381, 26, 'w', 2, 'center');
        c.drawImage(smallPizzas[3], 300, 19, 22, 22); c.drawImage(smallPizzas[6], 442, 19, 22, 22);
    }
    function customer(person, time) {
        const type = person.undeadProfile.type, mood = person.animState;
        const bob = reducedMotion.matches || !person.isLeaving ? 0 : Math.floor(Math.sin(time * 9 + person.orderSeed) * 1.5);
        const x = Math.round(person.x / 2 - 18), y = Math.round(person.y / 2 - 7 + bob);
        r(x + 9, y + 48, 34, 3, '#28212a');
        c.drawImage(frameOf(type + ':' + mood, time, person.orderSeed), x, y, 48, 60);
        if (person.isLeaving) {
            const rise = Math.floor((time * 20 + person.orderSeed) % 10);
            text('THANKS!', x + 24, y - 6, 'G', 1, 'center'); c.drawImage(heart, x + 38, y + 6 - rise);
            return;
        }
        if (person.x - person.targetX >= 24) return;
        // Pinned order ticket: torn bottom edge, patience meter that shakes when critical.
        const critical = person.hunger > 85;
        const shake = critical && !reducedMotion.matches ? (Math.floor(time * 30) % 2 ? 1 : -1) : 0;
        const tx = Math.round(person.x / 2 + 45) + shake, ty = Math.round(person.y / 2 + 5);
        r(tx + 2, ty + 3, 87, 48, '#17131b66');
        r(tx, ty, 87, 46, P.ink); r(tx + 1, ty + 1, 85, 44, '#f6e6c0'); r(tx + 1, ty + 1, 85, 1, '#fff8e6');
        for (let n = 1; n < 86; n += 4) { r(tx + n, ty + 45, 2, 2, '#f6e6c0'); r(tx + n, ty + 47, 2, 1, P.ink); r(tx + n + 2, ty + 45, 2, 1, P.ink); }
        r(tx + 4, ty + 4, 79, 11, critical ? '#c23a3a' : '#a94e43'); r(tx + 4, ty + 14, 79, 1, '#6e2c28');
        r(tx + 40, ty - 3, 7, 6, P.ink); r(tx + 41, ty - 2, 5, 4, '#d9625a'); r(tx + 42, ty - 2, 2, 1, '#f5a0a0');
        text('#' + String(Math.floor(person.orderSeed)).padStart(3, '0'), tx + 8, ty + 6, 'w');
        text(person.requirements.length + 'X', tx + 79, ty + 6, 'G', 1, 'right');
        person.requirements.forEach((level, i) => item(level, tx + 21 + i * 32, ty + 27, 0.67));
        const bar = critical ? P.red : person.hunger > 60 ? P.gold : P.green;
        c.drawImage(heart, tx + 5, ty + 38);
        const bw = 69, fill = Math.floor(bw * (1 - person.hunger / 100));
        r(tx + 14, ty + 38, bw + 2, 6, P.ink); r(tx + 15, ty + 39, bw, 4, '#b49a76');
        r(tx + 15, ty + 39, fill, 4, bar); r(tx + 15, ty + 39, fill, 1, '#ffffff55');
        if (critical && Math.floor(time * 6) % 2) text('!', tx - 9, ty + 4, 'r', 2);
    }
    function draw(target, state) {
        c.imageSmoothingEnabled = false;
        c.drawImage(scene, 0, 0);
        const time = reducedMotion.matches ? 0 : state.gameTime;
        for (let i = 0; i < 5; i++) {
            const height = 5 + Math.floor((Math.sin(time * 7 + i * 2) + 1) * 4);
            r(119 + i * 5, 46 - height, 4, height, '#c4502c');
            r(120 + i * 5, 46 - Math.round(height * 0.7), 2, Math.round(height * 0.7), '#f08a3c');
            r(120 + i * 5, 46 - Math.round(height * 0.35), 2, Math.round(height * 0.35), P.gold);
        }
        r(118, 45, 24, 1, '#fff0b0');
        const chefY = 6 + Math.floor(Math.sin(time * 3));
        c.drawImage(chef, 152, chefY, 36, 48);
        if (Math.floor(time * 8) % 26 === 0 && time) { r(164, chefY + 18, 3, 3, '#f3b892'); r(173, chefY + 18, 3, 3, '#f3b892'); r(164, chefY + 19, 3, 1, P.ink); r(173, chefY + 19, 3, 1, P.ink); }
        const now = performance.now() / 1000, dt = lastClock ? Math.min(0.1, now - lastClock) : 0; lastClock = now;
        // Warm light spilling from the oven mouth.
        c.globalAlpha = 0.10 + (reducedMotion.matches ? 0 : Math.sin(time * 9) * 0.03);
        oval(r, 98, 18, 64, 48, '#ff9a3c'); oval(r, 110, 28, 40, 30, '#ffc060');
        c.globalAlpha = 1;
        hud(state, reducedMotion.matches ? 0 : now, dt);
        // Fresh dough is flung out of the oven and lands in its cell. A board refill (start or reset)
        // brings many tiles at once, so those simply appear.
        const fresh = state.grid.filter(it => it && !seen.has(it));
        fresh.forEach(it => seen.add(it));
        if (primed && fresh.length <= 3) fresh.forEach((it, n) => { if (it.level === 1) launches.set(it, -n * 0.12); });
        primed = true;
        let ovenFlash = 0;
        state.grid.forEach(it => {
            if (!it || it.isAnimating) return;
            const p = it.getPos(), cx = (p.x + 42) / 2, cy = (p.y + 42) / 2;
            if (!launches.has(it)) { item(it.level, cx, cy, it.scale); return; }
            const age = launches.get(it) + dt;
            if (age >= LAUNCH + 0.18 || reducedMotion.matches) { launches.delete(it); item(it.level, cx, cy, it.scale); return; }
            launches.set(it, age);
            if (age < 0) return;
            ovenFlash = Math.max(ovenFlash, 1 - age / 0.25);
            if (age < LAUNCH) {
                const t = age / LAUNCH, e = 1 - (1 - t) * (1 - t);
                const x = 130 + (cx - 130) * e, y = 40 + (cy - 40) * e - Math.sin(Math.PI * t) * 34;
                r(Math.round(x) - 7, Math.round(40 + (cy - 40) * e) + 12, 14, 2, '#17131b55');
                item(1, x, y, 0.55 + 0.45 * t, false);
                if (Math.floor(age * 30) % 2) spark(Math.round(x - (cx - 130) * 0.08), Math.round(y + 6), 1, '#fff0c8');
            } else {
                // Squash on landing, then a puff of flour.
                const k = (age - LAUNCH) / 0.18, squash = Math.sin(Math.PI * k) * 0.18;
                const img = pizzas[0], w = Math.round(40 * (1 + squash)), h = Math.round(40 * (1 - squash));
                c.drawImage(img, Math.round(cx - w / 2), Math.round(cy + 20 - h), w, h);
                c.globalAlpha = 1 - k;
                [[-14, 8], [14, 8], [-9, 13], [10, 13], [0, 15]].forEach(([dx, dy]) => r(Math.round(cx + dx * (1 + k)), Math.round(cy + dy - k * 3), 2, 2, '#fff2d2'));
                c.globalAlpha = 1;
            }
        });
        launches.forEach((_, it) => { if (!state.grid.includes(it)) launches.delete(it); });
        if (ovenFlash > 0) { c.globalAlpha = ovenFlash * 0.6; oval(r, 117, 18, 26, 30, '#ffe596'); c.globalAlpha = 1; }
        state.animations.forEach(a => {
            const x = a.startPos.x + (a.endPos.x - a.startPos.x) * a.progress;
            const y = a.startPos.y + (a.endPos.y - a.startPos.y) * a.progress;
            item(a.level, (x + 42) / 2, (y + 42) / 2, a.type === 'merge' ? 1.15 : 1);
        });
        state.bakePulses.forEach(p => {
            const t = Math.max(0, Math.min(1, p.age / p.life)), radius = Math.round(5 + p.radius * t / 2);
            c.globalAlpha = 1 - t;
            const x = Math.round(p.x / 2), y = Math.round(p.y / 2);
            // A ring of twinkling stars instead of a hard square outline.
            for (let k = 0; k < 8; k++) {
                const a = k / 8 * Math.PI * 2 + t;
                spark(Math.round(x + Math.cos(a) * radius), Math.round(y + Math.sin(a) * radius), k % 2 ? 1 : 2, k % 2 ? '#fff2ac' : P.gold);
            }
            if (t < 0.3) { c.globalAlpha = (0.3 - t) * 2; r(x - 19, y - 19, 38, 38, '#fff2ac'); }
        });
        c.globalAlpha = 1;
        state.effectParticles.forEach(p => {
            c.globalAlpha = Math.max(0, Math.min(1, p.life));
            r(p.x / 2, p.y / 2, 2, 2, p.color); r(p.x / 2, p.y / 2, 1, 1, '#ffffff');
        });
        c.globalAlpha = 1;
        state.customers.forEach(person => customer(person, time));
        if (!state.customers.length) { text('THE NIGHT IS YOUNG...', 380, 164, 'y', 1, 'center'); text('HUNGRY GUESTS ARE ON THEIR WAY', 380, 179, 'y', 1, 'center'); }
        state.deliveries.forEach(d => {
            const t = Math.min(1, d.progress), e = t * t * (3 - 2 * t);
            for (let k = 1; k < 4; k++) { const q = Math.max(0, e - k * 0.06); c.globalAlpha = 0.5 / k; spark(Math.round((d.sx + (d.tx - d.sx) * q) / 2), Math.round((d.sy + (d.ty - d.sy) * q - Math.sin(Math.PI * Math.max(0, t - k * 0.06)) * 48) / 2), 1, P.gold); }
            c.globalAlpha = 1;
            item(d.level, (d.sx + (d.tx - d.sx) * e) / 2, (d.sy + (d.ty - d.sy) * e - Math.sin(Math.PI * t) * 48) / 2, 1 - 0.42 * e);
        });
        r(0, 309, 480, 11, P.ink);
        text('MERGE. BAKE. SERVE.', 12, 311, 'g');
        text('AUTO KITCHEN / ' + Math.floor(state.gameTime / 60) + ':' + String(Math.floor(state.gameTime % 60)).padStart(2, '0'), 468, 311, 'y', 1, 'right');
        for (let i = popups.length - 1; i >= 0; i--) {
            const p = popups[i]; p.age += dt;
            if (p.age > 1.2) { popups.splice(i, 1); continue; }
            c.globalAlpha = Math.min(1, (1.2 - p.age) * 3);
            text('+' + p.amount.toLocaleString('en-US'), p.x, Math.round(p.y - p.age * 2), 'G', 1, 'center');
        }
        c.globalAlpha = 1;
        c.drawImage(shade, 0, 0);
        if (state.over) {
            r(0, 0, 480, 320, '#17131bd9');
            ['zombie', 'pumpkin', 'dracula', 'imp', 'skeleton'].forEach((type, i) => c.drawImage(actors[type + ':angry'], 0, 0, 48, 34, 120 + i * 50, 64, 48, 34));
            panel(69, 97, 342, 140, '#3a2430', P.red);
            r(72, 100, 336, 22, '#7a2a33'); r(72, 121, 336, 1, P.ink);
            text('UNDEAD RIOT!', 240, 104, 'g', 2, 'center');
            text('THE HUNGRY HORDE BREACHED THE KITCHEN', 240, 130, 'w', 1, 'center');
            c.drawImage(coin, 120, 148); text('REVENUE', 138, 151, 'y'); text(state.gold.toLocaleString('en-US'), 360, 151, 'g', 1, 'right');
            c.drawImage(flame, 121, 168); text('SURVIVED', 138, 171, 'y');
            text(Math.floor(state.gameTime / 60) + ':' + String(Math.floor(state.gameTime % 60)).padStart(2, '0'), 360, 171, 'g', 1, 'right');
            r(118, 186, 244, 1, '#6e4a4c');
            text('REOPENING IN ' + Math.ceil(state.restartCountdown) + 's', 240, 194, 'G', 2, 'center');
            const left = Math.max(0, Math.min(1, state.restartCountdown / 7));
            r(120, 218, 240, 8, P.ink); r(121, 219, Math.floor(238 * (1 - left)), 6, P.gold); r(121, 219, Math.floor(238 * (1 - left)), 2, '#fff2ac');
        }
        target.save(); target.imageSmoothingEnabled = false;
        if (mobile()) {
            const pc = portrait.getContext('2d'); pc.imageSmoothingEnabled = false;
            pc.fillStyle = P.wall; pc.fillRect(0, 0, 284, 454);
            UI.drawText(pc, 'MIDNIGHT PIZZERIA', 142, 5, { color: 'g', align: 'center' });
            pc.drawImage(buffer, 0, 0, 282, 55, 1, 18, 282, 55);
            pc.drawImage(buffer, 22, 58, 250, 250, 17, 77, 250, 250);
            UI.drawText(pc, 'HUNGRY GUESTS / ' + state.customers.filter(p => !p.isLeaving).length, 142, 332, { color: 'y', align: 'center' });
            state.customers.filter(p => !p.isLeaving).slice(0, 4).forEach((person, i) => {
                const x = 12 + i * 66;
                const box = (dx, dy, w, h, color) => { pc.fillStyle = color; pc.fillRect(x + dx, dy, w, h); };
                box(0, 345, 62, 88, P.ink); box(1, 346, 60, 86, P.wood); box(2, 347, 58, 84, P.dark);
                pc.drawImage(frameOf(person.undeadProfile.type + ':' + person.animState, time, person.orderSeed), 0, 0, 48, 40, x + 7, 347, 48, 40);
                box(4, 387, 54, 42, P.paper);
                person.requirements.forEach((level, j) => {
                    pc.drawImage(smallPizzas[level - 1], x + 5 + j * 26, 389, 24, 24);
                    UI.drawText(pc, String(level), x + 15 + j * 26, 413, { color: 'O' });
                });
                pc.drawImage(heart, x + 5, 422); box(13, 422, 42, 5, P.ink); box(14, 423, 40, 3, '#b49a76');
                box(14, 423, Math.floor((1 - person.hunger / 100) * 40), 3, person.hunger > 85 ? P.red : person.hunger > 60 ? P.gold : P.green);
            });
            if (!state.customers.some(p => !p.isLeaving)) UI.drawText(pc, 'GUESTS ARE ON THEIR WAY...', 142, 381, { color: 'y', align: 'center' });
            UI.drawText(pc, 'MERGE. BAKE. SERVE. / AUTO KITCHEN', 142, 441, { color: 'g', align: 'center' });
            if (state.over) {
                pc.fillStyle = '#17131be8'; pc.fillRect(0, 0, 284, 454);
                UI.drawText(pc, 'UNDEAD RIOT!', 142, 180, { color: 'g', scale: 2, align: 'center' });
                UI.drawText(pc, 'REVENUE ' + state.gold.toLocaleString('en-US'), 142, 206, { color: 'g', align: 'center' });
                UI.drawText(pc, 'REOPENING IN ' + Math.ceil(state.restartCountdown) + 's', 142, 224, { color: 'G', align: 'center' });
            }
            target.drawImage(portrait, 0, 0, 960, logicalHeight());
        } else target.drawImage(buffer, 0, 0, 960, 640);
        target.restore();
    }
    function install() {
        UI.install({ k: 2 });
        document.querySelector('.game-subtitle').textContent = 'MIDNIGHT PIZZERIA / WOOD-FIRED & UNDEAD';
        document.querySelectorAll('.link-zone a').forEach(a => a.style.setProperty('--pizza-icon', `var(--pxu-i-${a.classList.contains('youtube-btn') ? 'play' : 'home'}-normal)`));
        const mark = document.createElement('canvas'); mark.width = 32; mark.height = 32;
        mark.getContext('2d').drawImage(smallPizzas[3], 0, 0); document.querySelector('.brand-mark').appendChild(mark);
    }
    root.PizzaPixel = { install, draw, logicalHeight };
})(window);
