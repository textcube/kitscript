# PixelArt — Sopranian / Undeath 도트 스프라이트 팩

[rogue](../rogue)와 [sopraknight](../sopraknight)가 **함께 쓰는** 도트(픽셀아트) 캐릭터 에셋이다. 두 게임 모두 빌드 없는 단일 HTML이므로, 팩도 **의존성 없는 스크립트 한 장(`sprites.js`)** 으로 끝난다. 아직 두 게임에는 연결하지 않았다 — 이 폴더는 "다음 빌드에 끼워 넣을 디자인 에셋"이다.

* 미리보기 갤러리: [`index.html`](index.html) (`file://`로 그대로 열린다. 전 스프라이트 애니메이션 1×/2×/4×, 배경 토글, 복원 시퀀스, rogue·sopraknight 인게임 목업, 사용 코드)
* 한눈에 보는 PNG: [`sheets/preview-musicians.png`](sheets/preview-musicians.png), [`sheets/preview-undead.png`](sheets/preview-undead.png), [`sheets/preview-restore.png`](sheets/preview-restore.png), [`sheets/preview-musicians-bust.png`](sheets/preview-musicians-bust.png), [`sheets/preview-undead-bust.png`](sheets/preview-undead-bust.png), 인게임 목업 스냅샷 [`sheets/preview-mock-rogue.png`](sheets/preview-mock-rogue.png) · [`sheets/preview-mock-sopraknight.png`](sheets/preview-mock-sopraknight.png)

## 파일 구성

| 경로 | 설명 |
|---|---|
| `sprites.js` | 팔레트 + 스프라이트 데이터 + 렌더러. `<script src>`로 불러오거나 통째로 인라인 붙여넣기 가능. `window.PixelArt` 노출 (약 345KB, gzip 시 약 35KB) |
| `index.html` | 자체 완결 미리보기 갤러리 |
| `sheets/<그룹>.png` / `.json` | 그룹(캐릭터)별 스프라이트 시트 + 프레임 아틀라스 (PNG만 쓰는 경우용) |
| `sheets/all.png` / `all.json` | 전 그룹을 세로로 쌓은 통합 시트 + 통합 아틀라스 |
| `sheets/preview-*.png` | 눈으로 보기 위한 확대(3~8×) 몽타주 |
| `tools/export-sheets.js` | `sprites.js`를 헤드리스 Chromium에서 실행해 위 PNG/JSON을 다시 만드는 스크립트 |

## 스타일 가이드

### 크기와 이유

| 종류 | 크기 | 피벗(anchor) | 이유 |
|---|---|---|---|
| 연주자·언데드 전신 | **32×32** | 발밑 중앙 (기본 16,31) | sopraknight의 액터는 92~122px, rogue 타일은 36~96px. 32px 스프라이트를 정수 배(2×~4×)로 키우면 두 게임의 기존 크기와 거의 맞아떨어진다. 머리:몸 ≈ 1:1 의 SD 비율을 유지하면서 악기(첼로·하프)를 그릴 수 있는 최소 크기이기도 하다. |
| 초상화(bust) | **64×64** | 하단 중앙 (32,63) | rogue 프로필 패널(2×3 타일 ≈ 폭 190px)에 3×로 꽉 찬다. 머리 폭이 약 40px라 눈 6×8, 하이라이트·홍조·치아까지 그릴 수 있다. 32px 머리를 단순 2배 확대한 것이 아니라 **처음부터 다시 그린** 것이다. |
| 아이템 아이콘 | **16×16** | 중앙 (8,8) | 타일의 66%(`.item-orb`)에 3~4×로 들어간다. |
| 파티클 | 16×16 셀 안의 3~8px 도형 | 중앙 (8,8) | 음표/스파클/파동/하트 |
| 타일 | seat 32×32 · stage 32×16 · spot 32×16 · floor 16×16 | — | 객석 의자, 무대 마루, 조명 풀, 던전 바닥 |

연주자마다 악기 크기가 달라 스프라이트 안에서 몸 위치가 다를 수 있다(하피스트는 하프가 왼쪽, 트럼페터는 트럼펫이 오른쪽). 그래서 **피벗을 스프라이트별로 지정**한다 (`PixelArt.info(id).ax/ay`). `render()`는 항상 피벗을 (x, y)에 맞춰 그리므로 게임 쪽은 "발 위치"만 넘기면 된다.

### 팔레트 (마스터 32색 + 투명 `.`)

한 스타일의 공용 팔레트 하나로 두 게임의 모든 스프라이트를 칠한다. 한 글자가 한 색이다.

| 램프 | 글자(밝음→어두움) | 쓰임 |
|---|---|---|
| 남색 indigo | `l m d n k` | 검은 드레스·머리카락·그림자·외곽선. "검정"도 순검정이 아니라 남보라 계열로 쓴다 |
| 피부 skin | `s t u` + 홍조 `r` | 피부, 볼 |
| 금 gold | `G g o O` | 드레스 자수, 악기, 머리핀 |
| 주황/나무 | `a b B` | 첼로, 러너의 원피스, 나무 |
| 초록 green | `e f h j` | 좀비·엘리트 피부, 브루트 재킷 |
| 뼈 bone | `w i y` | 해골, 가면, 흰 건반 |
| 얼음/유령 ice | `c C A` | 유령, 플루트, 얼음색 포인트 |
| 보라 violet | `p P q` | 드라큘라 망토, 하피스트 포인트 |
| 빨강 | `R x` | 눈(angry), 하트, 객석 |
| 희망 hope | `T` | 눈(leaving), 희망 입자 |

연주자별 포인트 컬러는 게임의 `musicianTypes.color`를 따른다: 소프라노 금 · 피아니스트 크림(`w`) · 첼리스트 구리(`a/b`) · 플루티스트 얼음(`C`) · 트럼페터 호박(`a`, 넥타이) · 하피스트 라벤더(`p`).

### 조명 · 음영 · 외곽선 규칙

* **광원은 항상 왼쪽 위.** 하이라이트는 좌상단, 그림자는 우하단. 원형 덩어리는 "같은 모양을 좌상단으로 옮겨 빼는" 셀 셰이딩으로 그려 pillow shading(모서리마다 밝은 테두리)을 피했다.
* **색상 이동(hue-shift).** 어두운 쪽은 파랑/보라로, 밝은 쪽은 노랑으로 이동한다 (피부 `s→t→u`는 살구→분홍 갈색, 초록은 `e→f→h→j`가 청록으로).
* **선택적·채색 외곽선(selective / coloured outline).** 외곽선은 스프라이트 데이터에 그리지 않고 **렌더 전 단계에서 자동으로 1px** 붙인다 (`DATA.outline`). 색은 인접한 채움색의 더 어두운 계열이다: 피부·금·뼈는 갈색 `B/O`, 초록은 `j`, 얼음/유령은 `d`, 남색은 `k`. 팔·악기처럼 몸 위에 겹치는 조각은 조각 단위 `ol` 옵션으로 **내부 윤곽선**을 새겨 넣는다.
* **읽기 쉬운 실루엣.** 각 연주자는 1×에서도 악기·포즈로 즉시 구분된다(건반, 첼로, 플루트, 트럼펫, 하프, 벌린 팔). 검은 드레스는 `m/l` 림라이트와 금색 트림으로 던전 배경(`#0f172a`)과 네이비/금색 홀 배경 모두에서 분리된다. 갤러리 상단 토글로 배경을 바꿔 확인할 수 있다.
* **톤.** 귀여운 SD/치비. 언데드는 피나 상처 없이 **멍하거나 슬픈 표정**(waiting)이고, 음악으로 표정이 돌아오는 것이 서사의 핵심이다. `restore` 시퀀스가 그 장면이다.

## 캐릭터와 애니메이션

스프라이트 ID는 `그룹.애니메이션` (예: `harpist.perform`). 프레임 수 / 총 길이는 `PixelArt.info(id)`로도 얻을 수 있다.

### 연주자 6종 (32×32, 그룹 id = `soprano` `pianist` `cellist` `flutist` `trumpeter` `harpist`)

| 애니메이션 | 프레임 | 내용 |
|---|---|---|
| `idle` | 4 | 호흡(상체 1px 상하) + 머리카락 흔들림. 앉아서 연주하는 자세(피아노·첼로·하프)와 서 있는 자세(소프라노·플루트·트럼펫) |
| `stand` | 4 | rogue용 "서 있는" 자세. 소프라노/플루티스트/트럼페터는 `idle`의 별칭, 피아니스트/첼리스트/하피스트는 악기를 들고 선 자세(키보드 옆구리·첼로 등에 업음·작은 하프) |
| `perform` | 6 | 실제 연주 동작(건반 교대 타건·활 왕복·운지·밸브·하프 글리산도·노래하며 팔 휘젓기) + 떠오르는 음표(`fx/note_*`) + 음파/스파클 |
| `walk` | 4 | rogue용. 상체 보빙 + 신발/다리 교대 (피아니스트·첼리스트·하피스트는 악기를 들고/업고 걷는다) |
| `hit` | 2 | 경직·팔 뻗기(표정 `>_<`). 흰색 플래시는 `opts.flash`로 |
| `cheer` | 4 | 두 팔을 들고 점프, 스파클 (승리/환호) |
| `bust` | 4 (64×64) | 초상화. 미소 ↔ 깜빡임 + 호흡. `bust_sing`, `bust_hit`, `bust_cheer`는 표정 변형(각 2프레임) |

### 언데드 8종 (32×32)

| 그룹 | 게임 | 시점 | 비고 |
|---|---|---|---|
| `zombie` `skeleton` `ghost` `dracula` | rogue | 정면 | 기존 SVG(초록 좀비·뼈·파란 유령·보라 망토 드라큘라)의 도트 재해석 |
| `shambler` `runner` `brute` `elite` | sopraknight | 좌향 측면 | `images/undeath/*.png`의 큰 해골 아이 / 단발 인형 / 하키 마스크 / 프랑켄슈타인 |

| 애니메이션 | 프레임 | 내용 |
|---|---|---|
| `idle` | 2 | 호흡 |
| `walk` | 4 | 다리 교대 + 팔 흔들림 (러너는 같은 4프레임을 더 빠르게 재생해 달리기로 쓴다) |
| `attack` | 3 | 예비 동작 → 돌진(팔 들기) → 회복. 표정 angry 고정 |
| `hit` | 1 | `x_x` 표정 + 경직 |
| `mood` | 4 | waiting · angry · leaving · satisfied 한 프레임씩 (도감용) |
| `restore` | 8 | **변신 시퀀스**: 회색·절망 → 빛기둥 → 희망 틴트 → 흰 섬광 → 채색된 표정 있는 모습 → 하트. 프레임별 `g`(회색도) / `h`(금빛) / `m`(복원 팔레트 혼합) / `f`(섬광) 값으로 만든다 |
| `audience` | 4 | 객석에 앉아 환호하는 관객 루프 (복원 팔레트, 의자 앞면 포함) |
| `bust` | 2 (64×64) | rogue TARGET 패널용. `opts.mood`로 기분 4종 |

**기분(mood) 변형.** rogue의 `waiting / angry / leaving / satisfied` 는 별도 스프라이트가 아니라 `opts.mood` 하나로 고른다 (얼굴 조각 + 오버레이 조각 교체). `idle`·`walk`·`bust`에 모두 먹는다. `attack`과 `hit`은 표정이 고정이다.

| mood | 표정/오버레이 | rogue 매핑 |
|---|---|---|
| `waiting` | 멍한 눈, 일자 입 | 기본(`ani-idle`) |
| `angry` | 붉은 눈, 찌푸린 눈썹, 붉은 ✕ | 전투 충돌 프레임(`ani-damage`) |
| `leaving` | 청록(`T`) 눈, 작은 미소, 머리 위 주황 ↑ | 처치 연출(`ani-leaving`) |
| `satisfied` | 감은 눈 ^ ^, 홍조, 스파클 | 미사용이던 `zombie_satisfied` 자리 |

### 기타

| 그룹 | 내용 |
|---|---|
| `item` (16×16) | `potion` `maxmp` `shield` `breaker` `key` `portal`(4프레임 회전) — rogue의 🧪💖🔮⚡🔑 자리 |
| `fx` (16×16) | `note` `note_white` `note_hope`(각 3종 음표), `sparkle` `sparkle_hope`(4프레임 반짝임), `wave`(음파 3단), `heart` |
| `tile` | `seat`(32×32 객석 의자 앞면), `stage`(32×16 마루), `spot`(32×16 조명 풀, 디더링), `floor`(16×16 던전 바닥 2종) |

## API

```js
PixelArt.render(ctx, spriteId, frameIndex, x, y, scale, opts)
PixelArt.play(ctx, spriteId, timeMs, x, y, scale, opts)    // frameAt + render
PixelArt.frameAt(spriteId, timeMs, {loop})                 // 시간 → 프레임 번호
PixelArt.toCanvas(spriteId, frameIndex, opts)              // 캐시된 오프스크린 캔버스 (opts.scale 정수배)
PixelArt.toDataURL(spriteId, frameIndex, opts)             // 캐시된 PNG data URL → <img src>
PixelArt.list([접두어|kind])                               // 전체 스프라이트 메타 (id, w, h, frames, durations, ax, ay ...)
PixelArt.info(id)  PixelArt.groups()  PixelArt.has(id)
PixelArt.sheet(group)                                      // {canvas, atlas} (내보내기용)
PixelArt.dump(id, frame, mood)                             // 합성된 프레임을 문자열 배열로 (디버그)
PixelArt.define(group, def)                                // 런타임에 스프라이트 그룹 추가
PixelArt.palette / ramps / moods                           // 팔레트 데이터
```

`(x, y)` 는 스프라이트의 **피벗**(보통 발밑 중앙)이 놓일 캔버스 좌표다. `opts`:

| 옵션 | 효과 |
|---|---|
| `flipX` | 피벗 기준 좌우 반전 (sopraknight의 언데드가 오른쪽을 볼 때 등) |
| `flash` | `true` 또는 0~1 — 피격용 흰색 플래시 틴트 |
| `despair` | 0~1 — 회색조 "절망" 틴트 |
| `hope` | 0~1 — 금색 "희망" 틴트 |
| `mood` | 언데드 기분: `waiting` `angry` `leaving` `satisfied` |
| `outline` | 색 문자열 — 선택/호버용 바깥 외곽선(`'#f5c86a'`) |
| `alpha` | 전역 알파 |
| `anchor` | `'pivot'`(기본) / `'topleft'` / `'center'` |

**캐시.** 로드할 때 모든 프레임(언데드는 기분 4종 포함)을 합성해 오프스크린 캔버스에 미리 그려둔다. 틴트 변형은 0.25 단위로 양자화해 처음 쓸 때 한 번만 만들고 재사용한다. `render()`는 캐시된 캔버스를 `drawImage` 한 번으로 그릴 뿐이라 프레임마다 계산하는 것이 없다. `imageSmoothingEnabled`는 내부에서 끄므로 배율은 **정수**로 쓰는 것이 깔끔하다.

## rogue에 끼워 넣기

`rogue/index.html` 의 스프라이트는 전부 `<img>` 이다 (`getPerformerArt` → `assets/sopranian/*.png`, `getEnemySVG` → `assets/undeath/*.svg`, 아이템은 이모지). 가장 작은 변경은 `src`만 data URL로 바꾸는 것이다.

```html
<script src="../pixelart/sprites.js"></script>
<style>
  /* 도트는 픽셀이 뭉개지면 안 된다 */
  .char-container img, .item-orb img { image-rendering: pixelated; }
</style>
<script>
  // 1) 플레이어 초상화/타일 — getPerformerArt 안의 <img src>
  //    profile 패널 → bust (64px), 보드 타일 → stand/walk 1프레임
  const perfSrc = (id, panel) => panel
      ? PixelArt.toDataURL(`${id}.bust`, 0, { scale: 4 })
      : PixelArt.toDataURL(`${id}.stand`, 0, { scale: 3 });

  // 2) 적 — getEnemySVG 의 pose 문자열을 그대로 mood 로 쓴다
  const enemySrc = (trait, stateClass, panel) => {
    const mood = stateClass === 'ani-damage' ? 'angry'
               : stateClass === 'ani-leaving' ? 'leaving' : 'waiting';
    return panel
      ? PixelArt.toDataURL(`${trait}.bust`, 0, { scale: 4, mood })
      : PixelArt.toDataURL(`${trait}.idle`, 0, { scale: 3, mood });
  };

  // 3) 아이템 이모지 → 16×16 아이콘
  const itemSrc = (subtype) => PixelArt.toDataURL(`item.${subtype}`, 0, { scale: 3 }); // potion|maxmp|shield|breaker|key
</script>
```

* 정적 `<img>`는 위처럼 첫 프레임만 쓰고, 기존 CSS 애니메이션(`wizard-idle` 부유, `unit-damage` 플래시 등)은 그대로 둔다.
* 프레임 애니메이션까지 쓰려면 타일마다 `<canvas>`를 하나 얹고 `PixelArt.play(ctx, "zombie.walk", performance.now(), w/2, h, 2, {mood})` 를 rAF로 돌린다. 플레이어가 이동 중이면 `walk`, 공격 때는 `cheer`/`perform`, 피격 때는 `hit`을 고르면 된다. 갤러리의 "rogue 목업"이 그 구현 예다.
* 열쇠를 든 적·클러스터 표시 등 기존 테두리/글로우는 `.tile-enemy`의 CSS 그대로 쓴다. 회색 "처치 불가" 표현은 `CSS filter` 대신 `{ despair: 0.6 }` 틴트를 쓸 수도 있다.
* 잠긴 포탈: `item.portal` 을 `{ despair: 0.75 }` 로 그리면 비활성 소용돌이가 된다.
* 처치 연출: 지금의 `leaving` 포즈 축소·페이드를 `mood: 'leaving'`으로 그대로 재현할 수 있고, 더 나아가 `restore` 시퀀스를 재생해도 된다(0.25초 구간을 잘라 쓰려면 프레임 4~5).

## sopraknight에 끼워 넣기

`sopraknight/index.html` 은 캔버스에 `ctx.drawImage(sprite, …)` 로 512px PNG를 줄여 그린다(`drawMusicianActor` 112px, `drawEnemyActor` `spriteSize` 92~122px). 이를 `PixelArt.play/render` 로 바꾸면 된다.

```js
// drawMusicianActor(m): drawImage(sopranianSprites[...]) 대신
const id = m.type.id;
const anim = state.running && m.cooldown < 0.3 ? 'perform' : 'idle';
PixelArt.play(ctx, `${id}.${anim}`, state.time * 1000 + m.tile.lane * 170,
              m.x, m.y + 35, 3, { flash: m.castFlash > 0.2 });   // 3× → 96px

// drawEnemyActor(e): 희망이 차오를수록 회색 → 금색
const d = clamp(e.despair / e.maxDespair);
PixelArt.play(ctx, `${e.type}.walk`, state.time * 1000, e.x, e.y + e.spriteSize * .34, 3,
              { despair: d, hope: 1 - d, flipX: false });         // 언데드는 좌향이 기본 (왼쪽으로 전진)

// 복원 변신 → 관객: 기존 state.audienceMembers 원(circle) 대신
const f = PixelArt.frameAt(`${e.type}.restore`, e.restoreT * 1000, { loop: false });
PixelArt.render(ctx, `${e.type}.restore`, f, e.x, e.y + 34, 3);
// 변신이 끝나면 좌석에 앉힌다
PixelArt.play(ctx, `${a.type}.audience`, state.time * 1000 + a.x * 7, a.x, a.y + 14, 1.5);
PixelArt.render(ctx, 'tile.seat', 0, seat.x, seat.y + 14, 1.5);  // 빈 좌석
```

* 배율은 정수(3×)가 가장 선명하다. 캔버스가 축소 표시되면(CSS `max-width`) 브라우저가 한 번 더 보간하므로 `canvas { image-rendering: pixelated; }` 를 권장한다.
* 스폰 위치에서 `perform` 때 나오는 음표·음파는 스프라이트 안에 이미 들어있다. 별도 파티클이 필요하면 `fx.note`, `fx.sparkle_hope`, `fx.heart` 를 `PixelArt.play`로 뿌린다.
* 선택/호버된 무대 칸에는 `{ outline: '#f5c86a' }` 를 주면 금색 윤곽이 생긴다.
* 이미지를 안 쓰는 대안: `sheets/*.png` + `*.json` 아틀라스를 `drawImage(sheet, f.x, f.y, f.w, f.h, dx, dy, f.w*3, f.h*3)` 로 직접 자른다. (틴트 옵션은 JS 경로에서만 지원)

## 스프라이트 추가/수정하기

### 데이터 구조

`sprites.js` 의 `DATA.sprites.<그룹>` 하나가 캐릭터 1명이다.

```js
harpist: {
  kind: "musician", label: "하피스트",
  w: 32, h: 32, ax: 20, ay: 31,           // 캔버스 크기와 피벗(발밑)
  pieces: {                                // ① 조각: 문자 1개 = 픽셀 1개, '.' = 투명
    head: { x: 13, y: 1, r: [              //   (x, y) = 캔버스 상 좌상단 위치
      "....ndd....",
      "..nddmmd..",
      ...
    ]},
    aL_up: { x: 9, y: 11, r: [ ... ], ol: "u" },   // ol = 이 조각 둘레에 내부 윤곽선(색 글자) 새기기
    face_smile: { ... }, face_cheer: { ... },
  },
  anims: {                                 // ② 애니메이션: 프레임 = 레이어 문자열 + 길이(ms)
    idle:  { loop: true, frames: [
      { d: 360, l: "harp hairb skirt torso head face_smile ear aL_a aR_a" },
      { d: 240, l: "harp hairb:1,0 skirt torso head face_smile ear aL_a aR_a" },
      ...
    ]},
    stand: { alias: "idle" },              // 같은 프레임을 다른 이름으로
  },
  pal2: { w: "s", i: "s" }                 // (언데드) restore/audience 에서 섞을 복원 팔레트
}
```

레이어 문자열은 공백으로 나눈 **조각 이름[`:dx,dy`]** 목록이며 **앞에서부터 그린다**(뒤쪽이 위).

| 표기 | 의미 |
|---|---|
| `head` / `head:0,1` | 조각을 (dx, dy)만큼 옮겨 그림 — 호흡·점프·스웨이는 전부 이것으로 만든다 |
| `+note_a` | `+` 접두어: **외곽선 생성 후에** 그림(음표·스파클처럼 윤곽이 붙으면 안 되는 것) |
| `-tile/beam` | `-` 접두어: 스프라이트 **뒤** 빈 픽셀에만 그림 (빛기둥) |
| `~face` | `~` 접두어: `face_<mood>` 조각을 `opts.mood`로 고름(없으면 `face_waiting`) |
| `fx/note_a_g:25,8` | `그룹/조각`: 다른 그룹의 조각을 공유 |

프레임 객체의 그 밖의 키: `g`(0~1 회색도) · `h`(금빛) · `m`(`pal2` 혼합) · `f`(흰 섬광) · `mo`(기분 고정). 애니메이션 객체: `loop`, `noline`(자동 외곽선 끄기), `w/h/ax/ay`(그룹과 다른 크기, 예: bust 64×64).

### 고치는 순서

1. **조각 수정** — `pieces.<이름>.r` 의 문자열을 직접 고친다. 한 줄의 길이가 같아야 하고(안 맞으면 합성 결과가 어긋난다), 글자는 위 팔레트 표를 따른다. 광원(좌상단)·외곽선(자동) 규칙을 지킨다.
2. **프레임 수정** — `anims.<이름>.frames[i].l` 의 조각 이름/오프셋, `d`(ms)를 고친다.
3. **확인** — `index.html` 을 열면 곧바로 반영된다. 디버그는 `PixelArt.dump("harpist.idle", 0)` 가 합성 결과를 문자열로 찍어준다.
4. **새 스프라이트** — 런타임에서 `PixelArt.define("myhero", { kind:"musician", w:32, h:32, ax:16, ay:31, pieces:{...}, anims:{...} })` 로 추가하거나, 같은 모양으로 `DATA.sprites` 에 넣는다.
5. **시트 재생성** — `node pixelart/tools/export-sheets.js --chromium /opt/pw-browsers/chromium` (playwright 필요). `sheets/` 의 PNG·JSON·미리보기가 갱신된다.

### 체크리스트

- 팔레트 밖의 글자를 쓰지 않는다(새 색이 꼭 필요하면 `DATA.palette` + `DATA.outline` 양쪽에 추가).
- 스프라이트 가장자리 1px는 자동 외곽선 자리이므로 **x·y 1~30 안쪽**에 그린다.
- 새 얼굴/표정은 `face_<mood>` 이름을 따르고, 복원 후 모습은 `pal2` + `face_restored` 로 만든다.
- 1×·2×에서 눈이 읽히는지, 던전색(`#0f172a`)과 홀 갈색 배경 양쪽에서 실루엣이 분리되는지 갤러리 배경 토글로 확인한다.

## 시트와 아틀라스

`sheets/<그룹>.png` 는 애니메이션마다 한 줄, 프레임마다 한 칸(패딩 없음, 원본 픽셀 크기)인 시트다. 언데드 시트는 `idle@angry` 같은 기분 변형 줄이 추가로 들어 있다. `sheets/<그룹>.json`:

```json
{
  "image": "zombie.png", "size": { "w": 256, "h": 448 }, "group": "zombie", "cell": { "w": 32, "h": 32 },
  "anims": {
    "walk": { "loop": true, "pivot": { "x": 16, "y": 31 }, "total": 560,
              "frames": [ { "x": 0, "y": 64, "w": 32, "h": 32, "d": 140 }, ... ] },
    "walk@angry": { "mood": "angry", "loop": true, "frames": [ ... ] }
  }
}
```

`d` 는 프레임 길이(ms). `all.png`/`all.json` 은 모든 그룹을 한 장에 쌓은 버전이다 (`groups.<id>.anims...` 구조, `y` 가 이미 오프셋 반영).

## 알려진 한계

* 연주자 6명의 머리·얼굴은 같은 얼굴 템플릿에 헤어스타일·포인트 컬러·악기로 차별화했다. 참고 이미지처럼 개별 얼굴 차이까지는 아니다.
* 검은 드레스는 어두운 배경에서 림라이트와 금 트림에 의존한다. 아주 밝은 배경에서는 실루엣이 매우 진하게 나온다.
* `audience`는 상반신 + 의자 앞면만 있어 앉은 다리가 없다. `stand`의 "들고 선" 자세(피아노·첼로·하프)는 `idle`의 앉은 자세와 포즈가 다르므로 전환 시 튄다.
* 언데드 측면 4종은 좌향 고정이다. 오른쪽으로 걷는 연출에는 `flipX` 를 쓴다.
* 전체 데이터가 문자열이라 파일이 크다(345KB, gzip ~35KB). 문자열 압축(RLE)은 사람이 편집하기 어려워 하지 않았다.
