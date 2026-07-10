# shop — Retro Menu Factory (레트로 메뉴판 저작 도구)

`shop/index.html`은 **가게 메뉴판을 만들어 단일 HTML 파일로 굽는(BAKE) 저작 도구**입니다. 왼쪽 사이드바에서 가게 이름·QR 대상 URL·카테고리를 관리하고, 가운데 그리드에서 메뉴 카드를 편집한 뒤, `BAKE` 버튼으로 배포 가능한 정적 메뉴 페이지를 다운로드합니다. 저장소의 다른 모듈이 대체로 "관전형 데모"인 것과 달리 **이건 사용자가 데이터를 만들어 내보내는 생산 도구**이고, 그래서 데이터 유실·결과물 오염이 곧바로 실사용 피해가 됩니다.

- 파일: [`index.html`](index.html) (922줄), 단일 파일
- 외부 의존: Google Fonts(Press Start 2P), jsDelivr(둥근모), Firebase v11.6.1 ESM, `api.qrserver.com`(QR 이미지)
- 상태: [`RetroMenuApp.state`](index.html:449) — `storeName` / `shopUrl` / `items[]` / `categories[]` / `filter` / `editingId` / `renamingCat`
- 저장: Firestore(`artifacts/{appId}/users/{uid}/settings/menuData`, [saveToCloud](index.html:533)) 또는 설정이 없으면 localStorage 데모 모드([setupLocalDemo](index.html:499))
- 렌더: [`renderAll`](index.html:620) → `renderUIOnly` / `renderCategories` / `renderPresets` / `renderGrid` 전체 재생성(문자열 → `innerHTML`)
- 출력: [`bakeHTML`](index.html:830)이 카테고리별 섹션 + 카드 그리드를 가진 독립 HTML을 만들어 Blob으로 다운로드

---

## 품질 관점 분석

실제 코드에서 확인한 항목만 적습니다. 가장 심각한 것은 **메뉴 이름·설명·카테고리가 이스케이프 없이 `innerHTML`에 들어가 에디터와 구운 결과물 양쪽에서 XSS가 성립하는 것**, **카테고리 이름에 작은따옴표 하나만 있어도 인라인 `onclick`이 깨져 앱을 못 쓰게 되는 것**, **데모 모드에서 편집이 자동 저장되지 않아 새로고침으로 전부 사라지는 것**입니다.

### 보안 (최우선)

- **메뉴 데이터 전량이 `innerHTML`로 렌더 → 저장형 XSS**: [renderGrid](index.html:702)가 `item.badge` / `item.image` / `item.category` / `item.name` / `item.desc` / `item.price`를 전부 템플릿 문자열로 조립해 `grid.innerHTML`에 넣습니다. 설명란에 `<img src=x onerror=alert(1)>`를 저장하면 카드가 그려질 때마다 실행됩니다. `item.image`는 `src="${item.image}"` 자리라 `" onerror=…`로 속성 탈출도 됩니다.
- **BAKE 결과물에도 그대로 전파 → 배포되는 정적 파일이 오염됨**: [bakeHTML](index.html:840)의 카드 조립, [index.html:853](index.html:853)의 `${cat}`, [index.html:861](index.html:861)의 `<title>${storeName}</title>`, [index.html:908](index.html:908)의 `href="${shopUrl}"`가 모두 이스케이프되지 않습니다. `shopUrl`에 `javascript:`를 넣으면 `[ORDER_NOW]` 버튼이 스크립트가 됩니다. **손님이 보게 될 파일**이라는 점에서 에디터 내부 XSS보다 파급이 큽니다.
- **카테고리 이름이 인라인 핸들러 문자열 안으로 들어감 → 코드 주입 + 즉시 고장**: [renderCategories](index.html:645)는 `onclick="app.setFilter('${cat}')"`, `app.startRename('${cat}')`, `app.delCategory('${cat}')`를 문자열로 만듭니다. 카테고리 이름은 [addCategory](index.html:569)에서 대문자 변환만 거친 자유 입력이므로 작은따옴표가 통과합니다. `O'BRIEN`을 추가하면 그 순간부터 해당 탭의 클릭 핸들러가 **문법 오류**로 죽고, `X');app.newProject();//`류는 임의 실행입니다. 인라인 편집 `<input … value="${cat}">`([index.html:644](index.html:644))는 큰따옴표로도 탈출됩니다.
- **`bakeHTML`의 앵커 id도 미검증**: [index.html:839](index.html:839) `cat.replace(/\s+/g,'_')`는 공백만 바꿉니다. `#`·`"`가 든 이름은 `id="…"` 속성과 `href="#…"`를 동시에 망가뜨립니다.
- **QR 생성이 제3자 서비스로 상점 URL을 유출**: [index.html:694](index.html:694)·[index.html:834](index.html:834)가 `api.qrserver.com`에 `shopUrl`을 쿼리로 보냅니다. 구운 파일은 **오프라인 매장 디스플레이에서 QR이 빈칸**이 되고(외부 요청 실패), 서드파티 다운 시 전 매장의 QR이 동시에 죽습니다. 로컬 QR 생성(인라인 SVG)으로 바꿔야 합니다.

### 데이터 유실 (실사용에서 가장 아픈 부분)

- **데모 모드는 자동 저장이 전혀 없음**: 모든 변경 지점이 `if (!this.isDemoMode) this.saveToCloud();` 패턴입니다([togglePreset](index.html:688), [saveEdit](index.html:776), [deleteItem](index.html:783), [changeImage](index.html:795), [addCategory](index.html:574), [delCategory](index.html:614)). 즉 **Firebase 미설정 사용자(= 이 저장소를 그냥 연 사람 전원)는 SAVE를 직접 누르지 않는 한 새로고침 한 번에 전부 잃습니다.** 클라우드 모드만 자동 저장되는 이 비대칭은 명백한 결함입니다.
- **이미지가 base64로 통째 저장 → 저장 자체가 실패**: [changeImage](index.html:797)는 `readAsDataURL`로 원본을 그대로 state에 넣습니다. 스마트폰 사진 한 장이면 Firestore 문서 한도 1MB를 넘겨 [saveToCloud](index.html:554)가 통째로 실패하고(`SAVE_FAIL: CHECK_CONFIG` 토스트 한 줄), 데모 모드에선 localStorage 5MB 쿼터에서 `setItem`이 **예외를 던지는데 잡히지 않습니다**([index.html:535](index.html:535)) — 토스트조차 안 뜨고 조용히 실패합니다. 업로드 시 캔버스로 리사이즈/압축(예: 긴 변 1024px, JPEG 0.8)해야 합니다.
- **`delCategory`가 아이템을 유령 상태로 만듦**: [index.html:611](index.html:611)은 마지막 카테고리를 지우면 아이템 카테고리를 `'NONE'`으로 바꿉니다. `'NONE'`은 목록에 없으므로 필터에서 못 고르고, **[bakeHTML](index.html:836)은 `categories`만 순회하므로 그 아이템들은 구운 결과물에서 통째로 사라집니다.** 데이터는 남아 있는데 결과물엔 없는, 가장 발견하기 어려운 종류의 유실입니다.
- **`onSnapshot`이 로컬 편집을 덮어씀**: [syncCloud](index.html:522)는 원격 스냅샷이 올 때마다 `state.items`를 통째로 교체하고 `renderAll()`합니다. 다른 탭에서 저장하면 이쪽에서 편집 중이던 미저장 내용이 사라지고, 모달·포커스도 리셋됩니다. 게다가 [onAuthStateChanged](index.html:484) 콜백 안에서 `syncCloud()`를 호출하므로 **토큰 갱신 때마다 리스너가 중복 등록**됩니다.
- **삭제에 확인이 없음**: [deleteItem](index.html:780)은 클릭 한 번에 즉시 삭제 + 실행취소 없음. 카테고리 삭제는 `confirm()`을 띄우면서([index.html:608](index.html:608)) 아이템은 안 띄우는 것도 일관성이 없습니다.
- **JSON 내보내기/가져오기가 없음**: 익명 인증 + localStorage뿐이라 브라우저 데이터를 지우면 복구 경로가 0입니다. 저작 도구라면 프로젝트 파일 export/import는 필수입니다.

### 기능 결함

- **가게 이름이 헤더에 반영되지 않음**: [`<div class="title" id="mainTitleDisplay">`](index.html:327)를 읽거나 쓰는 코드가 어디에도 없습니다(파일 전체에서 이 id는 한 번만 등장). [updateStoreName](index.html:557)은 `renderUIOnly()`를 부르는데 이 함수는 [입력창 두 개의 value만 되돌려 씁니다](index.html:628). 상단 타이틀은 영원히 `RETRO MENU FACTORY`입니다.
- **같은 이미지를 다시 고르면 아무 일도 안 일어남**: [changeImage](index.html:788)가 `input.value`를 비우지 않아, 동일 파일 재선택 시 `change` 이벤트가 발생하지 않습니다. (이미지를 지웠다가 되돌리는 흔한 동작이 막힙니다.)
- **URL 한 글자마다 QR을 전부 새로 요청**: [updateShopUrl](index.html:562)이 `oninput`마다 [renderGrid](index.html:691)를 호출하고, 카드 N개가 **모두 동일한 QR**을 각자 `<img>`로 요청합니다. `https://kitscript.com` 40자를 타이핑하면 요청이 `40 × N`번 나가고 카드가 매번 깜빡입니다. 디바운스 + QR 1회 생성 후 공유가 필요합니다.
- **모든 카드의 QR이 똑같음**: 카드마다 `shopUrl` 동일 QR을 박습니다([index.html:711](index.html:711)). 카드별 정보가 0이므로 지면 낭비이거나, 아니면 **아이템별 딥링크**여야 의미가 생깁니다.
- **프리셋이 이름으로 아이템을 식별**: [isItemInWorkspace](index.html:672)·[togglePreset](index.html:675)이 `i.name === name` 비교입니다. 사용자가 직접 만든 `Margherita`가 있으면 프리셋이 체크된 것처럼 보이고, 그 체크를 풀면 **사용자 아이템이 지워집니다.** 프리셋 출처를 별도 필드(`presetId`)로 들고 있어야 합니다.
- **아이템 id 생성이 두 갈래**: [togglePreset](index.html:682)은 `Date.now()+random`, [saveEdit](index.html:759)은 `'ID_' + Date.now()`뿐이라 빠른 연속 생성 시 충돌 가능합니다. `crypto.randomUUID()`로 통일하면 됩니다.
- **빈 카테고리 상태에서 모달이 깨짐**: 카테고리를 전부 지운 뒤 `[+]`를 누르면 [index.html:733](index.html:733)의 `this.state.categories[0]`이 `undefined`, select는 빈 목록이라 저장된 아이템의 `category`가 `""`가 됩니다.
- **`catInput`에서 Enter가 동작하지 않음**: [index.html:359](index.html:359)에 keydown 핸들러가 없어 반드시 ADD를 클릭해야 합니다. 연속 입력 흐름이 끊깁니다.
- **가격이 자유 문자열**: `₩ ${item.price}`([index.html:713](index.html:713))라 비워두면 `₩ ` 만 남고, 정렬·통화 포맷·숫자 검증이 전혀 없습니다.
- **`SOLD OUT` 배지가 시각적으로 무의미**: 배지 배경이 가격과 같은 `--neon-green`이고([index.html:274](index.html:274)) 품절 카드가 정상 카드와 완전히 동일하게 보입니다. 흐리게 처리 + 색 구분이 필요합니다.
- **Blob URL 누수**: [bakeHTML](index.html:914)이 `createObjectURL` 후 `revokeObjectURL`을 부르지 않습니다. BAKE를 반복할수록 (이미지 base64를 포함한) 큰 Blob이 메모리에 남습니다.
- **다운로드 파일명이 깨질 수 있음**: [index.html:916](index.html:916) `storeName.toLowerCase().replace(/\s+/g,'-')` — 한글·`/`·`:`가 그대로 들어가 OS에 따라 저장이 실패합니다.
- **토스트가 서로를 잡아먹음**: [showToast](index.html:824)가 단일 `setTimeout`이라 연속 호출 시 앞선 타이머가 뒤 토스트를 조기에 숨깁니다.
- **클라우드 초기화 중 상태 표시가 멈춤**: 인증이 지연되면 [`SYSTEM_v5.9_BOOTING...`](index.html:335)에서 갱신되지 않고, 실패 시에도 에러 문구가 없습니다.

### 레이아웃 · 접근성

- **에디터에 반응형이 전혀 없음**: `body { overflow: hidden }`([index.html:37](index.html:37)) + 고정 `350px 1fr` 그리드([index.html:116](index.html:116)) + `minmax(420px, 1fr)` 카드([index.html:207](index.html:207)). 구운 페이지는 950px 브레이크포인트가 있는데([index.html:901](index.html:901)) **정작 편집 화면은 태블릿 이하에서 내용이 잘려 접근 불가**입니다.
- **전역 `user-select: none`**([index.html:27](index.html:27)): `*`에 걸려 있어 카드 텍스트 복사가 막히고, 브라우저에 따라 입력창 텍스트 선택까지 방해합니다. 최소한 `input, textarea, .card-desc`는 예외로 둬야 합니다.
- **읽을 수 없는 대비/크기**: `.config-zone label`은 `#080808` 위 `#444`, 7px([index.html:153](index.html:153)); `.cat-tab`은 `#444`([index.html:174](index.html:174)). 대비비 약 2:1로 WCAG AA(4.5:1) 미달이며 Press Start 2P의 7–8px는 사실상 판독 불가입니다.
- **폼 라벨이 연결되어 있지 않음**: 모달·사이드바의 `<label>`에 `for`가 없어([index.html:299](index.html:299) 등) 스크린 리더가 입력과 라벨을 짝짓지 못합니다. 카테고리 도구 버튼은 `<span onclick>`([index.html:647](index.html:647))이라 키보드로 도달할 수 없습니다(`<button type="button">` + `aria-label` 필요).
- **모달에 ESC·바깥 클릭·포커스 트랩이 없음**: [openEdit](index.html:749)/[closeModal](index.html:752)이 `style.display`만 토글하고 `aria-modal`/`role="dialog"`도 없습니다. 열려 있는 동안 뒤쪽 그리드에 탭이 계속 들어갑니다.
- **`confirm()`/`alert()` 사용**: [index.html:608](index.html:608)·[index.html:803](index.html:803). 이미 자체 모달이 있는데 OS 다이얼로그가 튀어나와 CRT 톤을 깹니다.
- **인라인 `onclick`이 20곳 이상**: 엄격한 CSP를 걸 수 없고, 위의 카테고리 이름 주입이 성립하는 근본 원인입니다. `addEventListener` + `data-id`/`data-cat` 위임으로 옮겨야 합니다.
- **메타 태그 부재**: `description`, Open Graph, `theme-color`, 파비콘이 없습니다. 구운 결과물에도 없어서 SNS 공유 시 미리보기가 비어 있습니다. 메뉴 페이지라면 JSON-LD(`Restaurant`/`Menu`) 구조화 데이터가 검색 노출에 직접 도움이 됩니다.
- **구운 페이지의 이미지에 `alt`가 없음**([index.html:843](index.html:843)), 이미지 없는 카드는 빈 검은 상자로 남습니다(에디터엔 `ASSET_VIEW` 플레이스홀더가 있는데 결과물엔 없음).
- **`substr()` 사용**([index.html:682](index.html:682)): deprecated. `slice()`로 교체.

---

## 개선안 (우선순위)

1. **P0 — XSS 차단 (에디터 + BAKE 양쪽)**
   에디터: `renderGrid`/`renderCategories`/`renderPresets`/`updateModalSelect`의 문자열 조립을 `createElement` + `textContent`로 교체. 이미지 `src`는 `data:image/` 접두 검증 후 `img.src = …`로 대입.
   BAKE: 모든 보간 지점에 `escapeHtml()`(`& < > " '`) 적용, `shopUrl`은 `http(s):`만 허용(아니면 `#`), 앵커 `id`는 `[^a-zA-Z0-9_-]` 제거 후 슬러그화. 그 다음 `<meta http-equiv="Content-Security-Policy">`를 걸 수 있도록 인라인 핸들러를 전부 제거.

2. **P0 — 카테고리 이름 주입/파손 제거**
   인라인 `onclick`에 카테고리 이름을 넣는 방식을 버리고 `data-cat` + 컨테이너 이벤트 위임으로 전환. 카테고리 이름은 입력 단계에서 길이·문자 검증(따옴표/꺾쇠 거부 또는 이스케이프).

3. **P0 — 데이터 유실 봉쇄**
   (a) 데모 모드에도 자동 저장 적용 — `if (!this.isDemoMode) this.saveToCloud()` 20여 곳을 `this.persist()` 하나로 통합(디바운스 300ms, localStorage 예외 `try/catch` + 실패 토스트).
   (b) 업로드 이미지를 캔버스로 리사이즈/압축(긴 변 1024px, JPEG 0.8)해 1MB 문서 한도·5MB 쿼터 안으로.
   (c) `delCategory`의 `'NONE'` 폴백 제거 — 삭제 시 "아이템 N개를 어디로 옮길지" 선택하게 하고, `bakeHTML`은 미분류 아이템도 반드시 출력.
   (d) `deleteItem`에 확인/실행취소, 프로젝트 JSON export/import 추가.

4. **P1 — 눈에 보이는 결함**
   `mainTitleDisplay`를 `storeName`에 바인딩(현재 완전 미사용), `changeImage`에서 `input.value = ''`, `updateShopUrl` 디바운스 + QR 1회 생성 후 재사용(가능하면 인라인 SVG로 로컬 생성해 오프라인 QR 보장), `bakeHTML`에 `revokeObjectURL` + 파일명 슬러그화, `showToast` 타이머 토큰화, 프리셋 식별을 `presetId`로, id는 `crypto.randomUUID()`.

5. **P1 — 편집 흐름**
   `onSnapshot`이 로컬 미저장 편집을 덮어쓰지 않도록 병합 규칙(로컬 dirty면 스킵 + 배너) 도입, `onAuthStateChanged` 중복 리스너 방지(unsubscribe 보관), `catInput` Enter 지원, 빈 카테고리 상태 가드, `confirm()`/`alert()`를 자체 모달로.

6. **P2 — 반응형 · 접근성 · 결과물 품질**
   에디터에 950px 이하 단일 컬럼 레이아웃(사이드바 접기), `user-select: none`을 장식 요소로 한정, 라벨 `for` 연결 + 카테고리 도구를 `<button>`으로, 모달에 `role="dialog"`/ESC/포커스 트랩, 대비·폰트 크기 상향(7px→10px 이상, `#444`→`#8a8a8a`).
   구운 페이지: `alt` 텍스트, 이미지 없는 카드 플레이스홀더, `description`/OG/`theme-color`/파비콘, JSON-LD `Menu` 구조화 데이터, `SOLD OUT` 카드 시각적 구분.
