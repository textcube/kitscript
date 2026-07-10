# metaball — Metaball Masking (YouTube & Generative Geometry)

`metaball/index.html`은 **화면 전체를 덮는 검은 마스크에 메타볼 모양의 구멍을 뚫어, 그 구멍으로만 배경(유튜브 영상 또는 제너러티브 노드 그래프)이 보이게 하는 단일 파일 비주얼라이저**입니다. 구멍의 윤곽은 매 프레임 **marching squares**로 다시 계산됩니다.

- 파일: [`index.html`](index.html) (641줄), 단일 파일, 외부 의존은 YouTube IFrame API 하나
- 필드: [`getField`](index.html:491)가 각 격자점에서 `Σ r²/(d²+1)` 를 합산
- 윤곽: [`draw`](index.html:558)의 이중 루프가 셀마다 4비트 state를 만들고 16개 case로 폴리곤 생성, [`lerp`](index.html:502)로 경계 보간
- 합성: 오프스크린 캔버스에 검은 사각형 → `destination-out` 으로 메타볼 폴리곤을 파냄 → 메인 캔버스에 `drawImage`
- 조작: 슬라이더 6종, 배경 소스 토글(GEN / YOUTUBE), `H`(UI 토글) · `R`(노드 리셋)

## 개요 (동작 규칙)

| 영역 | 설명 |
| --- | --- |
| `#video-container` / `#yt-player` | `z-index:1`. `100vw × 56.25vw` + `min-*` 로 화면을 꽉 채우는 커버 크롭 |
| `#canvas` | `z-index:10`. 마스크가 그려지는 유일한 가시 캔버스 |
| `offCanvas` | DOM에 없는 오프스크린. 마스크 합성 전용 |
| `#control-panel` | `z-index:100`. 인라인 `onclick`으로 [`setBgMode`](index.html:376), [`toggleSound`](index.html:394) 호출 |
| `config` | `numBalls`, `baseRadius`, `threshold`, `cellSize`, `opacity`, `speed`, `numNodes`, `isMuted`, `ytId` |

- `GEN` 모드에서는 [`drawGenerativeBG`](index.html:514)가 노드/선을 메인 캔버스에 먼저 그린 뒤 마스크가 그 위를 덮으므로, **노드는 메타볼 내부에서만 보입니다.**
- `YOUTUBE` 모드에서는 메인 캔버스에 아무것도 그리지 않고 마스크만 얹으므로, **영상이 메타볼 내부에서만 보입니다.**
- 즉 두 모드 모두 "구멍으로 들여다보는" 동일한 합성 구조이고, 바뀌는 것은 `z-index:1` 레이어의 내용뿐입니다.

---

## 품질 관점 분석

실제 코드에서 확인한 항목만 적습니다. 가장 심각한 것은 **`Liquid Mass` 슬라이더가 아무 일도 하지 않는 것**, **`Opacity` 슬라이더가 몇 프레임 만에 무력화되는 것**, **saddle case의 자기교차 폴리곤**입니다. 셋 다 제품의 핵심 기능이 광고된 대로 동작하지 않는 경우입니다.

### 기능 결함 (최우선)

- **`Liquid Mass` 슬라이더가 기존 공에 반영되지 않음**: [`Ball.init`](index.html:430)은 `this.r = (0.7 + Math.random()*0.7) * config.baseRadius` 로 **생성 시점의 반지름을 고정**합니다. [`syncBalls`](index.html:479)는 개수만 맞출 뿐 기존 공을 건드리지 않으므로, 슬라이더를 30↔250 끝까지 끌어도 화면은 그대로입니다. 개수를 바꿔 새 공이 생겨야만 반영됩니다. 공은 랜덤 배수(`this.scale`)만 갖고, [`getField`](index.html:497)에서 `b.scale * config.baseRadius` 를 매 프레임 계산해야 합니다.

- **`Opacity` 슬라이더가 잔상만 남기고 즉시 불투명으로 포화됨**: [`draw`](index.html:552)는 `offCanvas`를 **지우지 않고** `source-over` 로 `rgba(0,0,0,opacity)` 를 덧칠합니다. `opacity=0.5` 라면 바깥 영역 알파가 `0.5 → 0.75 → 0.875 …` 로 누적되어 몇 프레임 만에 1.0이 됩니다. 동시에 이전 프레임에 파둔 구멍 자리는 알파가 낮게 남아 **메타볼이 지나간 궤적이 얼룩으로** 보입니다. `fillRect` 앞에 `octx.clearRect(0,0,width,height)` 를 넣거나 `octx.globalCompositeOperation = 'copy'` 로 시작해야 합니다.

- **saddle case(5, 10)가 자기교차 폴리곤을 만듦**: [index.html:578](index.html:578)의 `case 5: fillPolyO(octx, [t, r, pTR, b, l, pBL])`, [index.html:583](index.html:583)의 `case 10`. state 5는 TR·BL 두 코너만 내부이므로 **분리된 삼각형 두 개**(`[t,pTR,r]`, `[l,pBL,b]`)여야 합니다. 현재는 여섯 점을 한 subpath로 이어 붙여 나비넥타이 모양이 되고, nonzero winding `fill()` 이 엉뚱한 영역을 파냅니다. 두 메타볼이 막 붙기 시작하는 **가장 눈에 띄는 순간**에만 나타나는 결함입니다.

- **공이 화면 밖에서 영원히 진동함**: [`Ball.update`](index.html:439)의 `if (this.x < 0 || this.x > width) this.vx *= -1;` 은 **부호를 무조건 뒤집습니다.** 창을 줄이면 `x > width` 인 공이 남는데, 안으로 향하던 속도까지 매 프레임 반전되어 경계 밖에 갇힙니다. 위치 클램프가 없어 스스로 복귀하지 못합니다. `if (this.x < 0 && this.vx < 0)` 처럼 **진행 방향까지 확인**하고 `x`를 클램프해야 합니다.

### 입력 · 상호작용

- **Video ID 입력 중 `h`·`r` 이 전역 단축키로 발동**: [index.html:624](index.html:624)의 `window.addEventListener('keydown', …)` 에 `e.target` 검사가 없습니다. YouTube ID는 `[A-Za-z0-9_-]{11}` 이라 `h`/`r` 이 흔하고, 타이핑 도중 제어판이 사라지거나 노드가 리셋됩니다. `e.target.closest('input, textarea')` 와 `e.isComposing` 을 모두 확인해야 합니다.
- **Video ID 무검증 + 루프 깨짐**: [`updateYouTubeVideo`](index.html:416)는 임의 문자열을 `loadVideoById` 에 넘깁니다. `^[A-Za-z0-9_-]{11}$` 검증(및 전체 URL 붙여넣기 지원)이 필요합니다. 더 중요한 건 [index.html:358](index.html:358)의 `playlist: config.ytId` 는 **초기 ID로 고정**이라 영상을 교체하면 재생이 끝났을 때 원래 영상으로 되돌아갑니다 — 반복 재생이 새 영상에 붙지 않습니다. `loadPlaylist({ playlist: [id], loop: true })` 로 교체해야 합니다.
- **버튼을 `innerText` 로 식별**: [`setBgMode`](index.html:382)의 `b.innerText.includes('YOUTUBE')`. 라벨을 번역하거나 아이콘으로 바꾸는 순간 깨집니다. `data-mode` 속성으로 찾아야 합니다.
- **패널 숨김 상태를 CSS 문자열에서 읽음**: [index.html:626](index.html:626)의 `panel.style.transform.includes('translateX(400px)')`. 클래스 토글 + `aria-expanded` 로 바꿔야 합니다.
- **모바일에서 조작 불가**: `body { overflow: hidden }` + 고정 `280px` 패널이라 세로 화면에서 하단 슬라이더에 닿을 수 없고, `H` 키가 없는 터치 환경에는 **패널을 접을 수단 자체가 없습니다.** 가시적인 접기 버튼과 좁은 화면용 레이아웃이 필요합니다.
- **`playsinline` 누락**: [`playerVars`](index.html:353)에 없습니다. iOS Safari에서 영상이 네이티브 전체화면으로 열려 마스크 효과가 통째로 무너집니다. 함께 있는 `showinfo` 는 2018년에 제거된 파라미터라 무의미합니다.
- **YouTube API 로드 실패 시 무한 검은 화면**: [index.html:315](index.html:315)의 `<script src>` 가 차단되면 `onYouTubeIframeAPIReady` 가 영영 호출되지 않고, UI는 `YOUTUBE` 활성 상태 그대로 아무것도 없는 구멍만 보여줍니다. 타임아웃을 두고 `generative` 로 폴백해야 합니다.

### 성능

- **필드 계산이 화면 크기 × 공 개수에 그대로 비례**: [`draw`](index.html:545)가 매 프레임 `cols × rows` 개 격자점마다 [`getField`](index.html:491)를 부르고, 그 안에서 **모든 공을 순회**합니다. 1920×1080 · `cellSize=10` · `numBalls=40` 이면 프레임당 약 84만 회의 제곱·나눗셈이며, 슬라이더 최댓값 조합이 바로 그 지점입니다. 공마다 영향권(예: `4r`) 바운딩 박스 안의 셀에만 기여를 **누산**하는 scatter 방식으로 뒤집으면 대부분의 셀이 계산에서 빠집니다.
- **매 프레임 격자를 새로 할당**: [index.html:544](index.html:544)의 `grid = []` 이후 `cols` 개의 배열을 새로 만듭니다. `init()` 에서 `Float32Array(cols*rows)` 를 한 번 잡고 재사용해야 합니다.
- **오프스크린 캔버스 자체가 불필요**: 검은 사각형을 메인 `ctx`에 직접 칠하고 `destination-out` 으로 파내면 결과가 동일합니다. 현재 구조는 전체 화면 합성 1회와 `drawImage` 1회를 매 프레임 낭비합니다.
- **모든 셀에서 4개의 `lerp` 를 무조건 계산**: [index.html:569](index.html:569). `case 15`(전부 내부)는 보간점을 하나도 쓰지 않고, 대부분의 case는 2개만 씁니다. state별로 필요한 변만 계산해야 합니다.
- **`cellSize` 변경이 `init()` 전체를 호출**: [index.html:615](index.html:615). 캔버스 두 개의 `width`/`height` 를 재대입하면 버퍼가 재할당되고 GPU 텍스처가 버려집니다. 격자 크기만 다시 잡으면 됩니다.
- **`resize` 디바운스 없음**: [index.html:634](index.html:634)이 `init` 을 직결합니다. 모바일 주소창 접힘/펼침만으로 연속 재할당이 일어납니다.
- **프레임레이트 종속**: `b.update()` 가 델타 타임을 쓰지 않아 144Hz 모니터에서 액체가 60Hz의 2.4배 속도로 움직입니다. 이 저장소의 다른 모듈(`clock`, `invasion`)에서 이미 정규화한 항목입니다.

### 접근성 · 메타

- **슬라이더에 접근 가능한 이름이 없음**: `.control-label` 은 `<div>` 라 `<label for>` 가 아닙니다. 스크린 리더에는 여섯 개의 이름 없는 slider가 나열됩니다. `aria-label` + `aria-valuetext` 가 필요합니다.
- **숨긴 패널이 여전히 포커스를 받음**: `opacity: 0` + `translateX` 만 적용되어 `H`로 감춘 뒤에도 `Tab` 이 보이지 않는 컨트롤로 들어갑니다. `inert` 또는 `visibility: hidden` 을 함께 줘야 합니다.
- **`target="_blank"` 에 `rel` 누락**: [index.html:297](index.html:297), [index.html:300](index.html:300), [index.html:304](index.html:304). `rel="noopener noreferrer"` 필요.
- **`prefers-reduced-motion` 무시**: 전체 화면이 쉬지 않고 움직입니다. 최소한 정지 프레임 옵션이 필요합니다.
- **`<canvas>` 에 대체 텍스트/`aria-hidden` 없음**, **`#ui-hint` 는 키보드 힌트를 시각적으로만 제공**.
- **메타 태그 부재**: `description`, Open Graph, `theme-color`, 파비콘이 모두 없습니다. 저장소의 다른 모듈은 이미 갖추고 있습니다.
- **HiDPI 미대응**: `canvas.width = window.innerWidth`. `devicePixelRatio` 를 반영하지 않아 레티나에서 구멍 가장자리가 계단처럼 보입니다. 다만 마스크는 부하가 크므로 **DPR을 1.5 정도로 상한**을 두는 절충이 적절합니다.
- **`Pretendard` 를 지정하고 로드하지 않음**: [index.html:22](index.html:22). 항상 시스템 폰트로 폴백합니다.
- **인라인 `onclick` 3곳**으로 CSP 적용이 불가능합니다.

---

## 개선안 (우선순위)

1. **P0 — 동작하지 않는 컨트롤 복구**: `Ball`에 `scale` 도입해 `Liquid Mass` 실시간 반영, `octx.clearRect` 추가해 `Opacity` 복구.
2. **P0 — 렌더 정확도**: `case 5` / `case 10` 을 삼각형 두 개로 분리.
3. **P0 — 입력 격리**: `keydown` 에서 `input`/`textarea`/`isComposing` 제외.
4. **P1 — 물리 안정화**: 속도 부호를 확인하는 반사 + 위치 클램프, `requestAnimationFrame` 델타 타임 정규화(`dt` 상한 `1/30`s).
5. **P1 — 성능**: `Float32Array` 격자 재사용, 공 단위 바운딩 박스 누산, 오프스크린 캔버스 제거, state별 필요한 `lerp` 만 계산, `resize` 디바운스.
6. **P1 — YouTube 견고성**: ID 정규식 검증 + URL 파싱, `playsinline: 1`, `showinfo` 제거, `loadPlaylist` 로 루프 유지, API 로드 실패 시 `generative` 폴백.
7. **P2 — 접근성/모바일**: 슬라이더 `aria-label`, 숨긴 패널 `inert`, 가시적 패널 토글 버튼, 좁은 화면 레이아웃, `prefers-reduced-motion`, `rel="noopener noreferrer"`.
8. **P2 — 구조/메타**: 인라인 `onclick` → `addEventListener`, `data-mode` 로 버튼 식별, 패널 상태를 클래스로, `description`/OG/`theme-color`/파비콘 추가, DPR 상한 적용.

단일 파일 · 외부 의존 없음이라는 저장소 원칙은 유지합니다. 빌드 도구나 프레임워크는 도입하지 않습니다.
