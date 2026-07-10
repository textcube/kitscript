# quiz — Retro Quiz Factory (레트로 퀴즈 저작 도구 + 플레이어)

`quiz/index.html`은 **아이템(게임/스낵/음료)을 등록해 카운트다운 → 정답 공개 형식의 퀴즈 쇼를 만들고, 독립 실행 HTML로 굽는(BAKE) 도구**입니다. 편집(EDIT) · 진열(MENU) · 재생(QUIZ) 세 모드를 한 파일에 담고 있습니다. 플레이어는 사용자가 정답을 입력하는 구조가 아니라 **카운트다운 후 자동으로 답을 공개하고 다음 문제로 넘어가는 무한 루프**이며, 이는 이 저장소의 관전형(attract) 정체성과 일치합니다 — 결함이 아니라 설계 의도로 봅니다.

- 파일: [`index.html`](index.html) (691줄), 단일 파일
- 외부 의존: Google Fonts(Press Start 2P), jsDelivr(둥근모). 네트워크 API 호출은 없음
- 저장: localStorage 단독([`LS_KEY`](index.html:328) `RETRO_QUIZ_FACTORY_DATA_v6`)
- 상태: [`RetroMenuApp.state`](index.html:358) — `currentMode` / `storeName` / `shopUrl` / `items[]` / `categories[]` / `quizSettings{countdown,reveal}` / `filter`
- 재생: [`startQuiz`](index.html:477) → [`runLoop`](index.html:479) → [`renderQuizSlide`](index.html:481) → `setInterval` 카운트다운 → [`revealAnswer`](index.html:509) → `setTimeout` → 다음 문항
- 사운드: [`ArcadeSound`](index.html:335) — WebAudio 오실레이터, 기본 OFF
- 출력: [`bake`](index.html:581)가 현재 `<style>`을 통째로 복사하고 `ArcadeSound.toString()`으로 클래스 소스를 인라인해 독립 HTML 생성
- 이웃: [`baker/`](baker/README.md)는 `quiz_items.json`으로 이미지를 대량 생성하는 파이썬 파이프라인(별도 문서)

---

## 품질 관점 분석

실제 코드에서 확인한 항목만 적습니다. 가장 심각한 것은 **BAKE 결과물의 인라인 `<script>`가 아이템 데이터로 탈출 가능한 것**, **에디터 전역의 `innerHTML` 조립으로 저장형 XSS가 성립하는 것**, **전체 화면 백색 플래시가 매 문항마다 터지는 광과민성 위험**입니다.

### 보안 (최우선)

- **`</script>` 탈출로 구운 파일에 임의 코드 주입**: [bake](index.html:635)는 `const items = ${itemsData};`로 `JSON.stringify(this.state.items)` 결과를 인라인 `<script>` 안에 직접 붙입니다. HTML 파서는 문자열 리터럴을 모르므로, 아이템 설명에 `</script><script>alert(1)</script>`를 넣으면 스크립트 블록이 그 자리에서 끝나고 **새 스크립트가 실행됩니다.** `JSON.stringify`는 `<`/`/`를 이스케이프하지 않으므로 방어가 되지 않습니다. 구운 파일은 남에게 배포·게시하는 산출물이라 파급이 가장 큽니다. (`<\/script>`로 쓴 [index.html:678](index.html:678)은 바깥 스크립트를 보호할 뿐, 데이터 경로와는 무관합니다.)
- **BAKE의 나머지 보간도 이스케이프 없음**: [index.html:594](index.html:594) `<title>${storeName}`, [index.html:609](index.html:609) `<div class="header-title">${storeName}`, [index.html:610](index.html:610) `href="${shopUrl}"`. `shopUrl`에 `javascript:`를 넣으면 헤더 홈 버튼이 스크립트가 되고, `storeName`의 `"`로 속성 탈출이 됩니다.
- **에디터 그리드 전체가 `innerHTML` 문자열 조립 → 저장형 XSS**: [renderGrid](index.html:530)가 `item.image` / `item.cat` / `item.name` / `item.desc` / `item.price`를 그대로 넣습니다. `src="${item.image}"`는 `" onerror=…`로 속성 탈출까지 가능합니다.
- **퀴즈 플레이어도 동일**: [renderQuizSlide](index.html:494)의 `media.innerHTML = \`<img src="${item.image}">\``, 그리고 힌트를 넣는 [index.html:495](index.html:495). 구운 페이지의 [index.html:665](index.html:665)·[index.html:666](index.html:666)도 같은 패턴입니다.
- **카테고리 이름이 인라인 `onclick` 문자열 안으로**: [renderCategories](index.html:535)의 `onclick="app.setFilter('${c}')"` / `app.delCat('${c}')`, 그리고 [setupModal](index.html:541)의 `<option value="${c}">`. 카테고리는 [addCategory](index.html:560)에서 대문자·트림만 거친 자유 입력이므로 작은따옴표가 통과합니다. `O'BRIEN`을 추가하는 순간 해당 탭의 핸들러가 **문법 오류로 죽고**, 의도적으로 구성하면 임의 실행입니다. 아이템 액션 버튼([index.html:530](index.html:530))의 `'${item.id}'`도 같은 구조입니다.
- **`document.querySelector('style').innerHTML`을 그대로 재사용**([index.html:583](index.html:583)): 지금은 `<style>`이 하나뿐이라 동작하지만, 스타일을 추가하는 순간 조용히 첫 블록만 복사합니다. 구운 파일에는 에디터 전용 CSS(사이드바·카드·모달)가 통째로 실려 나갑니다.

### 광과민성 · 접근성 (사람에게 직접 해가 되는 항목)

- **매 문항마다 전체 화면 백색 플래시**: [`.reveal-flash-screen`](index.html:58)이 `position: fixed; inset: 0`이고 [`@keyframes flash`](index.html:53)가 20% 지점에서 `rgba(255,255,255,0.4)`까지 올라갑니다. [revealAnswer](index.html:516)에서 매번 발동하고, `countdown`을 1초로 낮추면 **초당 가까운 빈도의 대면적 백색 명멸**이 됩니다. WCAG 2.3.1(3회/초 이하, 대면적 플래시 금지) 위반 소지가 있고, 광과민성 발작 유발 위험이 실재합니다. `prefers-reduced-motion`은 파일 전체에 한 번도 없습니다.
- **`shake` 애니메이션도 동일**([index.html:43](index.html:43)): 카드 전체가 흔들립니다. 저감 모드에서 꺼야 합니다.
- **카운트다운이 스크린 리더에 전달되지 않음**: [`#quizCountdownDisplay`](index.html:269)에 `aria-live`가 없어 남은 시간을 알 수 없고, 정답 공개([`#quizAnswerZone`](index.html:274))도 알림이 없습니다.
- **읽을 수 없는 대비/크기**: `.config-row label`은 `#080808` 위 `#444`, 8px([index.html:104](index.html:104)); `.cat-tab`은 `#555`([index.html:120](index.html:120)); `.cat-tool-btn`은 `#333`([index.html:122](index.html:122), 대비비 약 1.3:1). Press Start 2P의 7–8px는 사실상 판독 불가입니다.
- **`<span>`이 버튼 역할**: 카테고리 삭제 [`.cat-tool-btn`](index.html:535)은 `<span onclick>`이라 키보드로 도달할 수 없습니다.
- **전역 `user-select: none`**([index.html:27](index.html:27)): `*`에 걸려 있어 정답 텍스트 복사가 막힙니다.
- **폼 라벨 미연결**: 사이드바·모달의 `<label>`에 `for`가 없습니다([index.html:240](index.html:240) 등).
- **모달에 ESC·바깥 클릭·포커스 트랩·`role="dialog"`가 없음**([openEdit](index.html:539), [deleteItem](index.html:406)).
- **메타 태그 부재**: `description`, Open Graph, `theme-color`, 파비콘이 에디터·구운 파일 양쪽에 없습니다.

### 데이터 유실 · 상태 결함

- **설정 변경이 저장되지 않음**: [updateStoreName](index.html:557) / [updateShopUrl](index.html:558) / [updateQuizSettings](index.html:559)는 state만 바꾸고 `saveData()`를 부르지 않습니다. 반면 아이템 편집·삭제·카테고리 추가는 자동 저장됩니다. **가게 이름과 카운트다운 초를 조정하고 새로고침하면 조용히 되돌아갑니다.** 자동 저장이 되는 것과 안 되는 것이 섞여 있어 사용자는 SAVE가 필요한지 알 수 없습니다.
- **아이템을 전부 지울 수 없음**: [init](index.html:386)이 `items.length === 0`이면 `SAMPLE_ITEMS`를 다시 채웁니다. 전부 삭제 → 저장 → 새로고침하면 샘플이 부활합니다. "빈 프로젝트"라는 상태가 표현 불가능합니다.
- **샘플 배열이 얕은 복사**: [index.html:387](index.html:387) `[...SAMPLE_ITEMS]`는 객체 참조를 공유합니다. [pickImg](index.html:572)의 `item.image = compressed`가 모듈 상수 `SAMPLE_ITEMS`를 직접 오염시키고, 이후 [startQuiz](index.html:477)의 폴백 경로에 그 이미지가 남습니다.
- **`quizSettings` 얕은 병합**: [init](index.html:380)의 `{ ...this.state, ...parsed }`는 중첩 객체를 통째로 교체합니다. 예전 스키마로 저장된 `quizSettings`에 `reveal`이 없으면 `undefined`가 되고, [revealAnswer](index.html:520)의 `parseInt(undefined) || 3` 덕에 우연히 살아납니다 — 우연에 기대고 있습니다.
- **카테고리 삭제가 아이템을 고아로 만듦**: [executeDelete](index.html:428)는 `categories`에서만 제거합니다. 그 카테고리를 가진 아이템은 어디에도 재배치되지 않아 ALL 필터에서만 보이고, 삭제된 카테고리가 현재 필터였다면 `state.filter`가 갱신되지 않아 **탭은 사라졌는데 그리드는 계속 필터링된 채** 남습니다(`renderGrid`조차 호출되지 않음).
- **`localStorage.setItem`이 무방비**: [saveData](index.html:396)에 `try/catch`가 없습니다. 800px JPEG로 압축해도 이미지 한 장이 수십 KB이므로 수십 개면 5MB 쿼터를 넘고, `QuotaExceededError`가 [saveEdit](index.html:552)까지 튀어 올라 UI가 중간 상태로 멈춥니다.
- **JSON 내보내기/가져오기가 없음**: localStorage 단독 저장이라 브라우저 데이터를 지우면 복구 경로가 0입니다. 옆에 [`baker/`](baker/README.md)가 `quiz_items.json`(`id`/`title`/`year`/`genre`/`hint`/`description`)으로 이미지를 굽고 있는데, **그 데이터를 이 에디터로 가져오는 경로가 없습니다.** 필드 이름도 어긋납니다(`title`↔`name`, `description`↔`desc`, `year`↔`price`). 두 도구가 같은 폴더에 있으면서 연결되어 있지 않습니다.

### 기능 결함

- **`price`가 연도로 오용됨**: 샘플이 `price: "1986"`([index.html:331](index.html:331))이고 카드가 `₩ ${item.price}`([index.html:530](index.html:530))로 렌더합니다. 화면에 **`₩ 1986`**이 찍힙니다. 메뉴판(shop) 템플릿에서 복사해 온 흔적이며, 퀴즈 도메인에 `PRICE` 필드는 의미가 없습니다(연도는 이미 `meta`에 있음).
- **SIZE 선택이 절반만 동작**: 모달은 `small` / `medium` / `large`를 제공하지만([index.html:300](index.html:300)) CSS에는 [`.card.large`](index.html:196)만 있습니다. `.card.small` / `.card.medium` 규칙이 없어 두 값은 완전히 동일하게 보입니다.
- **구운 헤더의 아이콘이 거대하게 렌더됨**: [index.html:609](index.html:609)–[610](index.html:610)이 `.header-title` / `.header-home` 클래스를 쓰는데 **이 클래스는 CSS에 존재하지 않습니다.** `<svg>`가 크기 지정 없이 들어가 기본 300×150으로 그려집니다(에디터의 18px 규칙은 `.brand-icon-btn svg`에 걸려 있어 적용되지 않음).
- **`#quizStatus`는 죽은 요소**: [index.html:264](index.html:264)에 id가 있지만 파일 어디서도 읽거나 쓰지 않습니다. 영원히 `QUIZ`입니다. `<body id="mainBody">`([index.html:214](index.html:214))도 미사용입니다.
- **구운 페이지에는 숫자 변환이 없음**: 에디터는 `parseInt(...) || 5`로 방어하지만([index.html:497](index.html:497)), 구운 코드는 `let count = config.countdown`([index.html:667](index.html:667))·`config.reveal * 1000`([index.html:655](index.html:655))를 그대로 씁니다. 입력값이 문자열이므로 빈 값이면 카운트다운이 `00`에서 시작해 즉시 정답이 뜨고, 공개 시간이 0초가 됩니다.
- **카운트다운 입력에 하한이 없음**: [`<input type="number">`](index.html:244)에 `min`이 없어 음수를 넣을 수 있습니다.
- **같은 이미지를 다시 고르면 아무 일도 없음**: [pickImg](index.html:562)가 `input.value`를 비우지 않아 동일 파일 재선택 시 `change`가 발생하지 않습니다.
- **손상된 이미지에서 영구 대기**: [compressImage](index.html:462)에 `img.onerror`가 없어 디코딩 실패 시 Promise가 resolve되지 않고, 토스트가 `OPTIMIZING_IMAGE...`에서 멈춘 채 끝납니다.
- **픽셀 아트를 JPEG로 압축**: [index.html:472](index.html:472)의 `toDataURL('image/jpeg', 0.7)`은 **투명도를 검게 만들고**, `image-rendering: pixelated`([index.html:165](index.html:165))로 확대 표시되는 도트 이미지에 블록 노이즈를 남깁니다. 이 앱의 소재(레트로 게임 스크린샷)와 정확히 상충합니다.
- **이미지를 지울 방법이 없음**: 한 번 넣으면 교체만 가능합니다.
- **`revealAnswer`가 `item.name`을 무방비로 대문자화**([index.html:513](index.html:513)): 외부에서 들여온 데이터에 `name`이 없으면 `TypeError`로 루프가 멈춥니다.
- **아이템 id가 `'ID'+Date.now()+substr(...)`**([index.html:551](index.html:551)): `substr`은 deprecated. `crypto.randomUUID()`로 통일 가능.
- **구운 파일 이름이 고정**: [index.html:685](index.html:685) `retro-quiz-standalone.html` — `storeName`을 반영하지 않고, [`URL.revokeObjectURL`](index.html:682)도 호출하지 않아 Blob이 누수됩니다.
- **토스트가 서로를 잡아먹음**: [showToast](index.html:579)가 단일 `setTimeout`이라 연속 호출 시 앞선 타이머가 뒤 토스트를 조기에 숨깁니다.
- **`MENU` 모드의 존재 이유가 불분명**: [setMode](index.html:443)에서 `menu`와 `edit`의 유일한 차이는 카드 액션 버튼 노출 여부([index.html:530](index.html:530))입니다. 별도 산출물도, 별도 BAKE도 없습니다.
- **사운드가 꺼져 있어도 매초 `ctx.resume()` 호출**: [playTick](index.html:348)이 `enabled` 검사 전에 resume을 부릅니다(무해하지만 불필요).

### 재생 · 조작

- **퀴즈 중에도 사이드바가 그대로 보임**: [`#quizPlayer`](index.html:130)는 `.content-area` 안에 `position: absolute; inset: 0`으로만 덮여 있어, 왼쪽 420px 편집 패널이 계속 노출·조작 가능합니다. 화면에 띄워 진행하는 용도라면 전체 화면(Fullscreen API)이 자연스럽습니다.
- **키보드 조작이 전혀 없음**: SKIP/EXIT/SOUND가 마우스 전용입니다. 발표 도구에는 Space(다음)·Esc(나가기)·S(사운드)가 필요합니다.
- **일시정지가 없음**: 정답을 함께 읽을 시간을 벌 수 없습니다.
- **반응형 부재**: `body { overflow: hidden }`([index.html:32](index.html:32)) + 고정 `420px 1fr` 그리드([index.html:93](index.html:93)) + `minmax(420px, 1fr)` 카드([index.html:127](index.html:127)). 태블릿 이하에서 편집 화면이 잘려 접근 불가합니다.

---

## 개선안 (우선순위)

1. **P0 — 구운 산출물의 스크립트 주입 차단**
   `<script>` 안에 데이터를 붙이는 방식을 버리고 `<script type="application/json" id="quiz-data">`에 담아 `JSON.parse(el.textContent)`로 읽는다. 부득이 인라인 유지 시 최소한 `JSON.stringify(...).replace(/</g,'\\u003c').replace(/ | /g, …)`로 직렬화한다. `storeName`·`shopUrl`은 `escapeHtml()`을 거치고, `shopUrl`은 http/https 스킴만 허용(아니면 `#`).

2. **P0 — XSS 차단 (에디터 + 플레이어)**
   `renderGrid` / `renderCategories` / `setupModal` / `renderQuizSlide`의 `innerHTML` 조립을 `createElement` + `textContent`로 교체. 이미지 `src`는 `data:image/` 접두 검증 후 대입. 구운 페이지의 `runLoop`도 동일 처리.

3. **P0 — 카테고리·아이템 id 주입 제거**
   인라인 `onclick` 문자열 보간을 폐기하고 `data-cat` / `data-id` + 컨테이너 이벤트 위임으로 전환. 파일 내 인라인 `on*` 핸들러를 전부 `addEventListener`로 옮기면 CSP도 걸 수 있다. `O'BRIEN` 카테고리가 정상 동작해야 한다.

4. **P0 — 광과민성 대응**
   `@media (prefers-reduced-motion: reduce)`에서 `flash`·`shake`·`count-slam`을 무효화. 저감 모드가 아니어도 플래시 최대 불투명도를 낮추고(0.4 → 0.15 수준) 전체 화면 대신 카드 테두리 글로우로 대체하는 편이 안전하다. 카운트다운 최소값을 `min="2"`로 제한해 초당 명멸을 구조적으로 막는다.

5. **P1 — 데이터 유실 봉쇄**
   설정 변경(`updateStoreName` / `updateShopUrl` / `updateQuizSettings`)도 저장 경로에 연결 — 모든 변경을 단일 `persist()`(300ms 디바운스)로 통합하고 `localStorage.setItem`을 `try/catch`로 감싸 쿼터 초과를 토스트로 알린다. 아이템 0개 상태를 허용하고(샘플 자동 재주입 제거, 대신 "샘플 불러오기" 버튼), 카테고리 삭제 시 아이템을 남은 첫 카테고리로 이동 + `filter` 초기화 + `renderAll()`. `SAMPLE_ITEMS`는 깊은 복사. `quizSettings`는 중첩 병합.

6. **P1 — 눈에 보이는 결함**
   `PRICE` 필드를 제거하거나 `YEAR`로 개명(카드의 `₩ 1986` 제거). `.card.small` / `.card.medium` CSS를 정의하거나 SIZE 옵션을 축소. 구운 헤더에 `.header-title` / `.header-home` 스타일 추가(SVG 18px). 죽은 `#quizStatus`를 카테고리 표시에 바인딩하거나 제거. 구운 코드에 `Number(...)` 변환 + 하한. `pickImg`에서 `input.value = ''`, `compressImage`에 `img.onerror` 처리와 **PNG 유지 옵션**(투명 이미지·소형 도트는 PNG). 이미지 삭제 버튼. `bake`에 `revokeObjectURL` + `storeName` 기반 파일명. `showToast` 타이머 토큰화. id는 `crypto.randomUUID()`.

7. **P1 — 재생 조작**
   Space=다음 / P=일시정지 / Esc=나가기 / S=사운드 키보드 단축키, QUIZ 진입 시 Fullscreen API 요청(실패해도 동작), 카운트다운에 `aria-live="polite"`.

8. **P2 — baker 연동 · 반응형 · 접근성**
   `quiz_items.json`(`title`/`year`/`genre`/`hint`/`description`) ↔ 에디터 스키마(`name`/`meta`/`cat`/`hint`/`desc`) 매핑을 붙인 **IMPORT / EXPORT JSON** 버튼. 950px 이하 단일 컬럼(사이드바 접기), `user-select: none`을 장식 요소로 한정, 라벨 `for` 연결, 카테고리 삭제를 `<button>`으로, 모달에 `role="dialog"`/ESC/포커스 트랩, 대비·폰트 크기 상향(7px→10px 이상, `#333`/`#444`→`#8a8a8a`), `description`/OG/`theme-color`/파비콘.
