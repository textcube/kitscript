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
    const pizzas = Array.from({ length: 10 }, (_, i) => sprite(32, 32, b => {
        const level = i + 1;
        oval(b, 2, 22, 29, 8, '#172328');
        if (level === 1) {
            oval(b, 5, 8, 23, 20, '#765547'); oval(b, 5, 6, 23, 20, '#cda675');
            oval(b, 6, 6, 21, 17, '#eed3a0'); oval(b, 8, 7, 15, 9, '#fff0c8');
            [[11, 10], [15, 13], [12, 17]].forEach(([x, y]) => { b(x, y, 7, 1, '#cda675'); b(x + 1, y + 1, 5, 1, '#e3bd88'); });
            [[4, 25], [8, 28], [26, 26], [3, 22], [25, 7]].forEach(([x,y]) => b(x,y,1,1,'#fff0c8'));
            return;
        }
        const special = level >= 8;
        oval(b, 2, 5, 29, 24, '#51362e'); oval(b, 2, 3, 29, 24, special ? '#bb7838' : '#c8904e');
        oval(b, 3, 3, 27, 21, special ? '#f1b957' : '#efca82');
        oval(b, 6, 6, 21, 17, '#a63e35'); oval(b, 7, 6, 19, 15, '#d96040');
        if (level >= 3) { oval(b, 7, 7, 19, 14, '#f0bd55'); oval(b, 8, 7, 16, 11, '#ffe18b'); }
        [[8,5],[16,4],[24,7],[4,13],[7,21],[19,24],[27,16]].forEach(([x,y],n) => {
            b(x,y,2,1,n%2 ? '#a96b3c' : '#fff0bb');
        });
        const pepper = (x,y) => { oval(b,x,y,5,5,'#a83a39'); b(x+1,y,3,2,'#e16a4d'); b(x+1,y+3,1,1,'#f1b172'); };
        const mushroom = (x,y) => { b(x+2,y+3,2,3,'#9e7457'); b(x+2,y+3,1,2,'#fff0c8'); oval(b,x,y,6,4,'#795350'); b(x+1,y,4,2,'#ddd1ae'); };
        const olive = (x,y) => { oval(b,x,y,4,4,'#303239'); b(x+1,y+1,2,2,'#d5b862'); b(x,y,2,1,'#617357'); };
        const basil = (x,y) => { b(x+1,y,3,1,'#75aa55'); b(x,y+1,4,3,'#4b824b'); b(x+1,y+1,2,2,'#a8c56b'); b(x+3,y+4,1,1,'#365c42'); };
        if (level === 2) { b(10,9,7,1,'#ed8960'); b(9,10,2,3,'#ed8960'); b(19,16,3,1,'#a63e35'); }
        if (level === 3) [[10,10],[18,9],[14,17],[21,16]].forEach(([x,y]) => { b(x,y,2,2,'#dca443'); b(x,y,1,1,'#fff2bd'); });
        if (level === 4) [[10,9],[19,10],[14,17]].forEach(([x,y]) => pepper(x,y));
        if (level === 5) [[9,9],[18,10],[13,17]].forEach(([x,y]) => mushroom(x,y));
        if (level === 6) [[10,9],[19,9],[14,14],[9,18],[20,17]].forEach(([x,y]) => olive(x,y));
        if (level === 7) { [[10,9],[19,11],[13,17]].forEach(([x,y]) => basil(x,y)); b(16,10,2,2,'#d96040'); b(10,17,2,2,'#d96040'); }
        if (level === 8) { pepper(9,9); mushroom(18,8); basil(18,17); olive(11,18); [[4,12],[8,23],[23,22],[25,7]].forEach(([x,y])=>b(x,y,2,2,'#754435')); }
        if (level === 9) { [[9,9],[19,9],[14,16]].forEach(([x,y]) => { oval(b,x,y,5,4,'#fff1c0'); b(x+1,y+2,3,1,'#edbc58'); }); basil(20,17); b(8,18,2,2,'#dca443'); }
        if (level === 10) {
            pepper(9,10); mushroom(19,9); basil(18,18); olive(11,19);
            b(13,1,1,4,'#fff2ac'); b(19,1,1,4,'#fff2ac'); b(16,0,1,5,'#fff2ac'); b(13,4,7,2,'#f7c95d');
            b(27,2,1,5,'#fff2ac'); b(25,4,5,1,'#fff2ac');
        }
    }));
    const profiles = {
        zombie: ['#8fae6e', '#516543', '#52677b'], dracula: ['#d8c9de', '#8e718f', '#73394b'],
        ghost: ['#d6e6e9', '#8da8bd', '#a8bdcb'], skeleton: ['#e7dcba', '#a39a80', '#796354'],
        mummy: ['#e8cf99', '#aa9479', '#ad9b81'], witch: ['#9bb36c', '#5e7c51', '#684777'],
        frankenstein: ['#8ca478', '#5c7659', '#735e4b'], pumpkin: ['#f1a951', '#be6c3f', '#6c7752'],
        imp: ['#d87562', '#9c4746', '#754151']
    };
    const actors = {};
    Object.entries(profiles).forEach(([type, [skin, shade, coat]]) => {
        ['idle', 'angry', 'happyLeaving'].forEach(mood => {
            actors[type + ':' + mood] = sprite(32, 40, b => {
                const ink = P.ink;
                oval(b, 5, 36, 23, 3, '#18262b');
                if (type !== 'ghost') {
                    oval(b, 8, 21, 17, 14, ink); b(10, 23, 13, 10, coat);
                    b(11, 24, 2, 7, '#ffffff18'); b(21, 25, 2, 8, '#17131b50');
                    b(15, 23, 3, 7, '#e7c79b'); b(16, 26, 1, 2, ink);
                    b(7, 24, 3, 6, coat); b(24, 24, 3, 6, coat);
                    oval(b, 5, 28, 5, 5, ink); oval(b, 6, 28, 4, 4, skin);
                    oval(b, 23, 28, 5, 5, ink); oval(b, 23, 28, 4, 4, skin);
                    b(10, 33, 5, 4, ink); b(19, 33, 5, 4, ink);
                    b(9, 36, 6, 2, '#5b5153'); b(19, 36, 6, 2, '#5b5153');
                }
                oval(b, 6, 5, 21, 19, ink); oval(b, 7, 6, 19, 17, shade);
                oval(b, 7, 6, 17, 15, skin); b(11, 7, 9, 1, '#ffffff35');
                oval(b, 4, 13, 4, 6, ink); b(5, 14, 3, 3, skin);
                oval(b, 25, 13, 4, 6, ink); b(25, 14, 3, 3, shade);
                b(15, 16, 3, 2, shade); b(15, 16, 2, 1, skin);
                if (type === 'zombie') { b(9, 5, 14, 3, '#455347'); b(11, 20, 4, 3, skin); b(18, 26, 3, 5, '#a68d65'); }
                if (type === 'dracula') { b(8, 5, 17, 4, '#302635'); b(14, 8, 6, 3, '#302635'); b(6, 21, 4, 13, '#8f4050'); b(24, 21, 4, 13, '#8f4050'); b(13, 20, 2, 3, '#fff2d2'); b(20, 20, 2, 3, '#fff2d2'); }
                if (type === 'skeleton') { b(13, 17, 6, 2, shade); b(14, 23, 2, 10, skin); for (let y = 24; y < 32; y += 3) b(11, y, 10, 1, skin); b(15, 14, 3, 2, ink); }
                if (type === 'ghost') { oval(b,5,17,24,17,shade); oval(b,5,17,22,15,skin); b(5,29,4,5,skin); b(12,30,5,5,skin); b(22,29,5,4,shade); b(8,22,2,6,'#eff9ee'); b(23,22,2,6,'#a8c5ce'); }
                if (type === 'mummy') { for (let y = 9; y < 32; y += 4) b(9, y, 15, 1, shade); b(19, 21, 2, 12, '#f4e4bd'); }
                if (type === 'witch') { b(5, 8, 23, 3, ink); b(10, 4, 13, 4, coat); b(13, 0, 7, 5, coat); b(16, 0, 3, 2, '#a5788c'); b(9, 7, 16, 2, '#c78a2d'); }
                if (type === 'frankenstein') { b(8, 5, 17, 4, '#303634'); b(5, 15, 3, 3, '#a7b2b3'); b(25, 15, 3, 3, '#a7b2b3'); b(21, 9, 1, 4, ink); b(19, 10, 4, 1, ink); }
                if (type === 'pumpkin') { b(15, 3, 3, 4, '#8db653'); b(18, 2, 4, 2, '#517a47'); b(13, 9, 1, 4, shade); b(21, 9, 1, 3, shade); b(11, 18, 12, 2, '#7b3a30'); b(12, 21, 9, 4, '#b9975c'); }
                if (type === 'imp') { b(8, 2, 3, 6, '#f5ce96'); b(22, 2, 3, 6, '#f5ce96'); b(3, 22, 4, 9, '#9c4746'); b(27, 22, 3, 9, '#9c4746'); b(28, 29, 3, 5, '#d87562'); }
                const eye = mood === 'angry' ? '#ef7d57' : '#fff2d2';
                const hollow = type === 'skeleton' || type === 'ghost' || type === 'pumpkin';
                oval(b, 10, 11, 5, 5, ink); oval(b, 19, 11, 5, 5, ink);
                b(11, 12, 3, 2, hollow ? shade : eye); b(20, 12, 3, 2, hollow ? shade : eye);
                b(12, 12, 2, 3, ink); b(21, 12, 2, 3, ink);
                if (hollow) { b(12,12,1,1, mood === 'angry' ? '#ea5b75' : '#f7c95d'); b(21,12,1,1,mood === 'angry' ? '#ea5b75' : '#f7c95d'); }
                if (mood === 'angry') { b(10, 10, 3, 1, ink); b(12, 11, 3, 1, ink); b(19, 11, 3, 1, ink); b(21, 10, 3, 1, ink); b(14, 19, 7, 2, ink); b(15,19,5,1,'#fff2d2'); }
                else if (mood === 'happyLeaving') { b(10, 11, 5, 5, skin); b(19, 11, 5, 5, skin); b(11,12,3,1,ink); b(10,13,1,1,ink); b(14,13,1,1,ink); b(20,12,3,1,ink); b(19,13,1,1,ink); b(23,13,1,1,ink); b(14, 18, 7, 2, ink); b(15,20,5,1,ink); b(16,19,3,1,'#ea8d8a'); }
                else { b(15, 20, 5, 1, ink); b(19,19,1,1,ink); }
                if (type === 'dracula') { b(14,19,1,3,'#fff2d2'); b(20,19,1,3,'#fff2d2'); b(12,24,3,3,'#d88578'); b(19,24,3,3,'#d88578'); }
                if (type === 'zombie') { b(8,18,3,1,shade); b(10,18,1,3,shade); b(17,20,1,2,'#fff2d2'); }
                if (type === 'witch') { b(8,19,2,9,'#d4a069'); b(24,17,2,11,'#a16b4e'); b(7,21,2,6,'#e0b97d'); }
                if (type === 'pumpkin') { b(15,18,4,1,'#79442c'); b(13,26,1,5,'#d2af72'); b(20,27,2,2,'#c58c4e'); }
            });
        });
    });
    const chef = sprite(32, 40, b => {
        b(7, 32, 20, 3, P.ink); b(9, 19, 16, 14, P.ink); b(10, 20, 14, 11, '#fff2d2');
        b(8, 10, 17, 12, P.ink); b(9, 11, 15, 10, '#f3b892'); b(22, 12, 2, 7, '#cf8779');
        b(7, 4, 20, 9, P.ink); b(9, 2, 16, 11, '#fff2d2'); b(6, 5, 22, 5, '#fff2d2');
        b(9, 11, 16, 2, '#bba78c'); b(11, 15, 2, 2, P.ink); b(20, 15, 2, 2, P.ink);
        b(14, 18, 7, 2, '#5b3f36'); b(15, 21, 6, 2, '#b84c45');
        b(17, 25, 1, 1, P.ink); b(17, 28, 1, 1, P.ink);
        b(6, 23, 4, 5, '#fff2d2'); b(24, 23, 4, 5, '#fff2d2');
        b(6, 28, 4, 3, '#f3b892'); b(24, 28, 4, 3, '#f3b892');
        b(5, 31, 24, 2, '#bba78c'); b(3, 33, 28, 3, '#84563e');
    });
    function item(level, x, y, scale = 1, badge = true) {
        const image = pizzas[Math.max(0, Math.min(9, level - 1))];
        const size = Math.max(12, Math.round(32 * scale));
        const px = Math.round(x - size / 2), py = Math.round(y - size / 2);
        c.drawImage(image, px, py, size, size);
        if (badge) {
            const bx = px + size - 8, by = py + size - 8;
            r(bx - 1, by - 1, 12, 11, P.ink); r(bx, by, 10, 9, level >= 8 ? '#7c4a2a' : '#304640');
            r(bx, by, 10, 1, level >= 8 ? P.gold : '#739486');
            text(level, bx + 5, by + 1, level >= 8 ? 'G' : 'w', 1, 'center');
        }
    }
    const scene = document.createElement('canvas'); scene.width = 480; scene.height = 320;
    function makeScene() {
        r(0, 0, 480, 320, P.wall);
        for (let y = 0; y < 58; y += 10) for (let x = -(y % 20); x < 480; x += 26) { r(x, y, 24, 8, P.brick); r(x + 1, y + 1, 21, 1, '#8e5140'); }
        for (let y = 59; y < 320; y += 16) for (let x = 0; x < 480; x += 16) {
            r(x, y, 16, 16, ((x / 16 + (y - 59) / 16) % 2) ? '#283d3d' : '#314747');
            r(x, y, 16, 1, '#243234'); r(x, y, 1, 16, '#243234');
        }
        r(0, 55, 480, 6, P.ink); r(0, 55, 480, 2, P.edge);
        panel(22, 58, 250, 250, '#714b38', '#d1a36a');
        for (let y = 63; y < 304; y += 12) { r(27, y, 240, 1, '#6c4738'); for (let x = 40; x < 260; x += 53) r(x + y % 7, y + 5, 14, 1, '#9b6748'); }
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
            r(301, y + 48, 52, 4, '#28262c'); r(305, y + 51, 44, 2, '#66473e');
            r(289, y + 21, 3, 3, P.gold); r(290, y + 25, 1, 12, '#966d44');
        }
        // Ovens, copper hood and a tiny herb pot frame the working chef.
        panel(109, 3, 57, 52, '#9c5640', '#c78a58');
        for (let y = 7; y < 46; y += 7) { r(113,y,49,1,'#6b3e35'); for(let x=114+(y%2)*7;x<162;x+=14)r(x,y,1,7,'#6b3e35'); }
        r(121, 18, 33, 30, P.ink); r(117, 25, 41, 23, P.ink);
        r(124,14,27,4,'#d7a16b'); r(120,18,4,7,'#d7a16b'); r(151,18,4,7,'#d7a16b');
        r(116,25,3,19,'#d7a16b'); r(155,25,3,19,'#b37551');
        r(115, 47, 45, 3, '#efbc67'); r(117, 50, 41, 3, '#7c4a2a');
        r(174, 35, 10, 15, '#bc6b4c'); r(172, 33, 14, 3, '#f3b892');
        r(177, 23, 2, 12, '#8db653'); r(172, 25, 6, 3, '#517a47'); r(178, 22, 6, 3, '#8db653');
        scene.getContext('2d').drawImage(buffer, 0, 0);
    }
    makeScene();
    function customer(person, time) {
        const type = person.undeadProfile.type, mood = person.animState;
        const bob = reducedMotion.matches ? 0 : Math.floor(Math.sin(time * (person.isLeaving ? 9 : 3) + person.orderSeed) * 1.5);
        const x = Math.round(person.x / 2 - 18), y = Math.round(person.y / 2 - 7 + bob);
        r(x + 9, y + 48, 34, 3, '#28212a');
        c.drawImage(actors[type + ':' + mood] || actors[type + ':idle'], x, y, 48, 60);
        if (person.isLeaving) { text('THANKS!', x + 24, y - 4, 'G', 1, 'center'); return; }
        if (person.x - person.targetX >= 24) return;
        const tx = Math.round(person.x / 2 + 45), ty = Math.round(person.y / 2 + 5);
        panel(tx, ty, 87, 48, '#f2dfb3', '#fff2d2');
        r(tx+4,ty+4,79,11,'#a94e43'); r(tx+5,ty+15,77,1,'#ceab7e');
        for (let n = 5; n < 83; n += 6) r(tx + n, ty - 1, 3, 2, P.ink);
        r(tx+40,ty-3,8,3,'#c69c66'); r(tx+42,ty-2,4,2,'#fff2d2');
        text('ORDER ' + String(Math.floor(person.orderSeed)).padStart(3, '0'), tx + 8, ty + 6, 'w');
        person.requirements.forEach((level, i) => item(level, tx + 21 + i * 32, ty + 27, 0.67));
        const bar = person.hunger > 85 ? P.red : person.hunger > 60 ? P.gold : P.green;
        r(tx + 6, ty + 41, 75, 3, '#b49a76'); r(tx + 6, ty + 41, Math.floor(75 * person.hunger / 100), 3, bar);
        for(let i=1;i<10;i++)r(tx+6+i*7,ty+41,1,3,'#f2dfb3');
        if (person.hunger > 80) text('!', tx - 8, ty + 4, 'R', 2);
    }
    function draw(target, state) {
        c.imageSmoothingEnabled = false;
        c.drawImage(scene, 0, 0);
        const time = reducedMotion.matches ? 0 : state.gameTime;
        for (let i = 0; i < 5; i++) {
            const height = 6 + Math.floor((Math.sin(time * 7 + i * 2) + 1) * 5);
            r(121 + i * 6, 46 - height, 5, height, '#d86e3c');
            r(122 + i * 6, 48 - height / 2, 3, height / 2, P.gold);
        }
        c.drawImage(chef, 134, 15 + Math.floor(Math.sin(time * 3)), 32, 40);
        panel(8, 8, 96, 41); text('REVENUE', 16, 15, 'y');
        text(state.gold.toLocaleString('en-US'), 16, 29, 'g', state.gold < 1000000 ? 2 : 1);
        panel(193, 8, 79, 41); text('NEXT BAKE', 201, 15, 'y');
        r(201, 30, 63, 9, P.ink); r(202, 31, Math.floor(61 * Math.min(1, state.turnTimer / 2)), 7, P.gold);
        for (let i = 1; i < 8; i++) r(201 + i * 8, 31, 1, 7, P.dark);
        panel(291, 7, 180, 43, '#253e3c', '#bc8555');
        for(let x=299;x<468;x+=12){r(x,10,2,2,'#f7c95d');r(x,45,2,2,'#f7c95d');}
        text('MIDNIGHT', 381, 14, 'g', 1, 'center');
        text('PIZZERIA', 381, 25, 'w', 2, 'center');
        c.drawImage(pizzas[3],300,19,22,22); c.drawImage(pizzas[6],442,19,22,22);
        state.grid.forEach(it => { if (it && !it.isAnimating) { const p = it.getPos(); item(it.level, (p.x + 42) / 2, (p.y + 42) / 2, it.scale); } });
        state.animations.forEach(a => {
            const x = a.startPos.x + (a.endPos.x - a.startPos.x) * a.progress;
            const y = a.startPos.y + (a.endPos.y - a.startPos.y) * a.progress;
            item(a.level, (x + 42) / 2, (y + 42) / 2, a.type === 'merge' ? 1.15 : 1);
        });
        state.bakePulses.forEach(p => {
            const t = p.age / p.life, radius = Math.round(5 + p.radius * t / 2);
            c.globalAlpha = 1 - t;
            const x = Math.round(p.x / 2), y = Math.round(p.y / 2);
            r(x - radius, y - radius, radius * 2, 1, P.gold); r(x - radius, y + radius, radius * 2, 1, P.gold);
            r(x - radius, y - radius, 1, radius * 2, P.gold); r(x + radius, y - radius, 1, radius * 2, P.gold);
        });
        c.globalAlpha = 1;
        state.effectParticles.forEach(p => { c.globalAlpha = Math.max(0, Math.min(1, p.life)); r(p.x / 2, p.y / 2, 2, 2, p.color); });
        c.globalAlpha = 1;
        state.customers.forEach(person => customer(person, time));
        if (!state.customers.length) { text('THE NIGHT IS YOUNG...', 380, 164, 'y', 1, 'center'); text('HUNGRY GUESTS ARE ON THEIR WAY', 380, 179, 'y', 1, 'center'); }
        state.deliveries.forEach(d => {
            const t = Math.min(1, d.progress), e = t * t * (3 - 2 * t);
            item(d.level, (d.sx + (d.tx - d.sx) * e) / 2, (d.sy + (d.ty - d.sy) * e - Math.sin(Math.PI * t) * 48) / 2, 1 - 0.42 * e);
        });
        r(0, 309, 480, 11, P.ink);
        text('MERGE. BAKE. SERVE.', 12, 311, 'g');
        text('AUTO KITCHEN / ' + Math.floor(state.gameTime / 60) + ':' + String(Math.floor(state.gameTime % 60)).padStart(2, '0'), 468, 311, 'y', 1, 'right');
        if (state.over) {
            r(0, 0, 480, 320, '#17131bd9'); panel(69, 97, 342, 126, '#452c34', P.red);
            text('UNDEAD RIOT!', 240, 115, 'g', 3, 'center');
            text('THE HUNGRY HORDE BREACHED THE KITCHEN', 240, 153, 'w', 1, 'center');
            text('REOPENING IN ' + Math.ceil(state.restartCountdown) + 's', 240, 179, 'G', 2, 'center');
            text('A FRESH BATCH IS ON THE WAY', 240, 205, 'y', 1, 'center');
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
                pc.drawImage(actors[person.undeadProfile.type + ':' + person.animState], x + 15, 347);
                box(4, 387, 54, 42, P.paper);
                person.requirements.forEach((level, j) => {
                    pc.drawImage(pizzas[level - 1], x + 5 + j * 26, 389, 24, 24);
                    UI.drawText(pc, String(level), x + 15 + j * 26, 413, { color: 'O' });
                });
                box(6, 424, 50, 3, '#b49a76'); box(6, 424, Math.floor(person.hunger / 100 * 50), 3, person.hunger > 80 ? P.red : P.green);
            });
            if (!state.customers.some(p => !p.isLeaving)) UI.drawText(pc, 'GUESTS ARE ON THEIR WAY...', 142, 381, { color: 'y', align: 'center' });
            UI.drawText(pc, 'MERGE. BAKE. SERVE. / AUTO KITCHEN', 142, 441, { color: 'g', align: 'center' });
            if (state.over) {
                pc.fillStyle = '#17131be8'; pc.fillRect(0, 0, 284, 454);
                UI.drawText(pc, 'UNDEAD RIOT!', 142, 180, { color: 'g', scale: 2, align: 'center' });
                UI.drawText(pc, 'REOPENING IN ' + Math.ceil(state.restartCountdown) + 's', 142, 218, { color: 'G', align: 'center' });
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
        mark.getContext('2d').drawImage(pizzas[3], 0, 0); document.querySelector('.brand-mark').appendChild(mark);
    }
    root.PizzaPixel = { install, draw, logicalHeight };
})(window);
