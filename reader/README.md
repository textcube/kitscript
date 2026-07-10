# reader — TextCast Reader v2 (영상 배경 타이핑 리더)

`reader/index.html`은 **영상 배경 위에 문서를 한 글자씩 타이핑해 보여주는 읽기 도구**입니다. 문서 저장소(Document Store)와 재생 큐(Play Queue)를 분리하고, 붙여넣기나 긴급 입력창으로 들어온 텍스트를 **긴급 큐(Urgent Queue)로 끼워넣은 뒤 원래 문서의 중단 지점으로 복귀**하는 구조가 핵심입니다. 열자마자 문서가 흘러가고 조작은 툴바 5개 버튼뿐인 **관전형(attract) 재생 모델**이며, 저밀도 조작 자체는 이 저장소의 정체성이라 결함이 아닙니다.

다만 이 앱은 **읽기 위한 도구**입니다. 아래 분석은 "방송 오버레이로서 잘 도는가"가 아니라 **"사람이 이걸로 글을 읽을 수 있는가"**를 기준으로 합니다. 그 기준에서 가장 심각한 문제는 보안이 아니라, **한 번에 두 줄 남짓만 화면에 남고 되돌아갈 방법이 없다**는 점입니다.

- 파일: [`index.html`](index.html) (2132줄), 단일 파일
- 외부 의존: 런타임에 `esm.sh`에서 `@chenglou/pretext@0.0.7`을 **동적 import**([index.html:1439](index.html:1439)). 실패 시 canvas `measureText` 폴백. 그 외 네트워크 호출 없음(YouTube 임베드 제외)
- 저장: localStorage 단독(`textcast_reader_v2_store` / `_settings`, 레거시 `buntstream_settings`)
- 클래스 구성: [`TextCastStorage`](index.html:1149) · [`TextCastEngine`](index.html:1238) · [`TextLayoutEngine`](index.html:1423) · [`TextBlockRenderer`](index.html:1512) · [`TextCastApp`](index.html:1639)
- 재생: [`run`](index.html:1307) → [`nextItem`](index.html:1338)(urgent → resume → playQueue 순) → [`playDocument`](index.html:1360) → [`renderTextBlock`](index.html:1522)(줄 단위 절대배치 + 글자 단위 타이핑) → [`afterDocument`](index.html:1381)가 중단 지점 복귀
- 취소 메커니즘: `engine.session` 정수 토큰. 모든 async 루프가 `runId !== this.session`으로 자기 자신을 종료
- 조작: Play/Pause · Next(문서) · Urgent(클립보드) · Sound · Settings. **키보드 단축키 없음**

---

## 품질 관점 분석

실제 코드에서 확인한 항목만 적습니다.

### 읽기 도구로서의 결함 (이 앱의 핵심 문제)

- **한 번에 두 줄 남짓만 보입니다**: [trimLineWindow](index.html:1581)가 `age <= 2`인 줄만 남기므로 DOM에 있는 것은 **현재 줄(opacity 1) + 직전 줄(0.42) + 그 앞 줄(0.12)** 셋뿐입니다([index.html:1584](index.html:1584), [index.html:243](index.html:243)–[251](index.html:251)). 여섯 줄짜리 문단을 타이핑하면 마지막 줄이 나올 때쯤 **첫 세 줄은 이미 DOM에서 제거되어 있습니다.** 한 문단을 통째로 눈에 담을 수 없고, 앞 문장을 참조하면서 뒤 문장을 읽는 일이 구조적으로 불가능합니다. 방송 오버레이라면 합리적인 창(window) 크기지만, 읽기 도구에서는 치명적입니다.
- **되감기가 없습니다**: 버튼은 Play/Pause와 **Next(문서 단위)**뿐입니다([index.html:901](index.html:901)–[905](index.html:905)). 이전 블록·이전 줄로 돌아가는 경로가 코드 어디에도 없습니다. 한 줄을 놓치면 그 내용은 영원히 사라집니다. `state.currentBlockIndex`가 이미 있으므로 `prevBlock()`은 몇 줄이면 됩니다.
- **본문을 선택·복사할 수 없고 Ctrl+F도 안 됩니다**: [`.text-stage { pointer-events: none }`](index.html:176) 때문에 드래그가 불가능하고, 위의 3줄 창 때문에 **읽은 텍스트는 애초에 DOM에 없습니다.** 읽기 도구에서 인용을 뜨거나 단어를 찾는 일이 둘 다 막혀 있습니다.
- **읽던 위치가 저장되지 않습니다**: [markPlayed](index.html:1396)는 `playCount`와 `lastPlayedAt`을 저장하지만 `currentBlockIndex`는 저장하지 않습니다. 새로고침하면 언제나 큐 처음부터입니다. 긴 문서를 읽는 도구인데 북마크가 없습니다.
- **읽는 속도를 읽으면서 바꿀 수 없습니다**: 타이핑 속도와 블록 대기는 설정 모달 → Style 탭 → 숫자 입력 → "Save Playback Rules"를 거쳐야 합니다. 그리고 모달이 열려 있으면 [handleGlobalKeydown](index.html:1768)이 즉시 반환하므로 단축키도 없습니다. "지금 조금만 천천히"라는 가장 흔한 요구에 네 번의 클릭이 듭니다.
- **블록을 즉시 끝까지 보여주는 방법이 없습니다**: [getTypingDelay](index.html:1593)는 문장부호마다 `+420ms`, [getLineHoldDelay](index.html:1601)는 줄마다 `delay × 0.32~0.58`을 더합니다. 이미 아는 문장을 건너뛰려면 문서 전체를 Next로 넘기는 수밖에 없습니다. 클릭이나 Space로 현재 블록을 즉시 완성하는 경로가 필요합니다.
- **문서 경계가 보이지 않습니다**: [run](index.html:1332)–[1334](index.html:1334)은 한 문서가 끝나면 곧바로 다음 문서의 첫 줄을 타이핑합니다. 제목도, 구분자도, 잠깐의 정지도 없습니다. 하단 `Now Playing`의 제목만 조용히 바뀝니다.
- **"다 읽었다"는 상태가 없습니다**: [ensureBroadcastQueue](index.html:1269)가 큐 소진 시 [buildQueueFromStore](index.html:1261)로 재생성하므로 마지막 문서가 끝나면 말없이 첫 문서로 돌아갑니다. 무한 순환 자체는 관전형 설계지만, **읽기 도구에는 완독 신호가 있어야** 합니다.
- **진행률이 사실상 숨겨져 있습니다**: `Block 3 / 27`은 하단 바([index.html:294](index.html:294), `opacity: 0.36`)의 `0.6rem`(≈9.6px) 대문자 라벨 아래에 있습니다. 진행 막대는 없습니다.

### 조작 · 입력

- **아무 문자 키나 누르면 긴급 입력창이 열립니다**: [handleGlobalKeydown](index.html:1774)은 `event.key.length === 1`인 **모든 문자 키**를 `preventDefault()`하고 그 글자로 긴급 입력창을 엽니다. 안내는 어디에도 없습니다. 읽는 중 일시정지하려고 **Space를 누르면 공백으로 시작하는 긴급 메시지 작성창**이 뜹니다. 화살표·PageDown은 `key.length !== 1`이라 무시되고, `overflow: hidden`이라 스크롤도 없습니다. 즉 **키보드로 할 수 있는 일이 실질적으로 없습니다.**
- **한글로는 그 입력창조차 열리지 않습니다**: IME 조합 중 `event.key`는 `'Process'`(길이 7)라 [index.html:1774](index.html:1774)에서 반환됩니다. 로마자를 눌러야만 열립니다. 한국어 문서를 읽으라고 만든 도구에서.
- **확인 없이 클립보드가 화면에 뿌려집니다**: [index.html:1697](index.html:1697)의 전역 `paste` 리스너는 입력 요소 바깥의 Ctrl+V를 미리보기 없이 긴급 큐로 보냅니다. `!` 버튼([handleClipboardUrgent](index.html:1751))도 `navigator.clipboard.readText()`를 읽어 바로 송출합니다. 화면 공유 중이라면 되돌릴 수 없습니다.
- **모달을 ESC로 닫을 수 없습니다**: [handleGlobalKeydown](index.html:1768)이 모달이 열려 있으면 Escape 처리([index.html:1770](index.html:1770)) **이전에** 반환합니다. 바깥 클릭도, 포커스 트랩도, 포커스 복원도 없습니다.

### 접근성

- **`aria-live="polite"` 영역을 글자 단위로 변경**: [`<main class="text-stage" aria-live="polite">`](index.html:909) 안에서 [renderTextBlock](index.html:1537)이 `current.textContent += char`를 **글자마다** 실행합니다. 기본 42ms면 초당 20회 이상 라이브 리전이 갱신됩니다. 스크린 리더는 매 글자마다 줄을 다시 읽거나(누적 낭독) 큐가 밀려 아무것도 읽지 못합니다. 라이브 리전은 **완성된 블록을 한 번** 알리는 별도 요소여야 하고, 타이핑 무대는 `aria-live="off"`여야 합니다. 읽기 도구에서 이건 기능 자체의 부정입니다.
- **`prefers-reduced-motion`이 파일 전체에 한 번도 없음**: 매 줄이 `0.62s` transform으로 밀려 올라가고([index.html:240](index.html:240)), 캐럿이 `blink 0.8s infinite`([index.html:276](index.html:276))로 깜빡입니다. 전면 플래시 같은 광과민성 패턴은 없지만(캐럿 1.25Hz·소면적), 지속적인 세로 이동은 전정 장애 사용자에게 문제입니다.
- **`role="tablist"`만 있고 `role="tab"`이 없음**: [index.html:944](index.html:944)에 `tablist`가 선언되어 있으나 [`.settings-tab`](index.html:945) 버튼에 `role="tab"`·`aria-selected`·`aria-controls`가, 패널에 `role="tabpanel"`이 없습니다. 반쯤 선언된 ARIA는 없는 것보다 나쁩니다. 게다가 **데스크톱에서는 탭이 탭이 아닙니다** — [setSettingsTab](index.html:1729)이 넓은 화면에서는 세 패널을 모두 표시한 채 스크롤만 시킵니다.
- **모달에 `role="dialog"`·`aria-modal`이 없음**: [`#settingsModal`](index.html:935)은 `aria-label`뿐입니다.
- **버튼 접근명이 글리프**: [`playPauseBtn`](index.html:901)의 이름은 `Ⅱ`(U+2161 로마 숫자 2)와 시각적으로 숨긴 `<label>PLAY</label>`의 조합입니다. `aria-label`을 주고 글리프에 `aria-hidden="true"`를 다는 것이 정답입니다. `aria-pressed`도 없습니다.
- **토스트가 알림되지 않음**: [`#msgBox`](index.html:933)에 `role="status"`가 없어 "문서 저장됨" 같은 메시지가 스크린 리더에 전달되지 않습니다.
- **툴바가 기본 `opacity: 0.24`**([index.html:122](index.html:122)): hover로만 드러납니다. `:focus-within`은 있지만 터치 기기에는 hover가 없어 **모바일에서 컨트롤이 거의 보이지 않습니다.** 하단 바([index.html:294](index.html:294))에는 `:focus-within`조차 없습니다.
- **대비**: `--muted`는 `rgba(255,255,255,0.62)`, 배경은 `rgba(5,8,10,0.42)` — 그 아래는 **사용자가 고른 영상**이라 대비가 보장되지 않습니다.
- **빈 라벨**: [index.html:970](index.html:970)의 `<label>&nbsp;</label>`는 정렬용 스페이서이면서 접근성 트리에 남습니다.
- **언어 표기 불일치**: `<html lang="en">`인데 [formatDate](index.html:1089)는 `ko-KR`, [addUrgentFromText](index.html:1830)는 `en-US` 로케일입니다.
- **메타 태그 부재**: `description`, Open Graph, `theme-color`, 파비콘이 모두 없습니다.

### 텍스트 레이아웃

- **모바일 폰트 축소가 죽어 있음**: [index.html:852](index.html:852)의 `.block { font-size: clamp(26px, 8vw, var(--font-size)); }`는 `.block`에만 걸립니다. 그런데 실제 본문은 [`.broadcast-line`](index.html:233)이고, `.block`은 [showIdle](index.html:1549)의 "No enabled documents." 한 줄에서만 쓰입니다. **모바일에서 42px 그대로 나옵니다.**
- **`splitIntoBlocks`의 한국어 분할이 과잉이고, 구형 Safari에서 페이지가 죽습니다**: [index.html:1105](index.html:1105)의 `(?<=다[.!?]?)\s+`는 **문장부호 없이 `다`로 끝나는 모든 어절 뒤에서 자릅니다.** "그리고 **다** 함께" → 여기서 블록이 갈립니다. 또한 lookbehind는 Safari 16.4 미만에서 지원되지 않고 **정규식 리터럴이므로 파싱 단계에서 SyntaxError**가 나 스크립트 전체가 실행되지 않습니다(검은 화면). 폴백인 `paragraph.slice(i, i + 180)`([index.html:1111](index.html:1111))은 서로게이트 쌍을 반으로 잘라 이모지를 깨뜨립니다.
- **레이아웃 엔진이 재생 시작 뒤에 로드됨**: 생성자가 [`this.engine.run(this.renderer)`](index.html:1662)를 먼저 부르고 다음 줄에서 [`this.layoutEngine.init()`](index.html:1663)을 **await 없이** 호출합니다. 처음 몇 블록은 canvas 폴백으로 줄바꿈되고, pretext가 로드되는 순간부터 규칙이 바뀝니다. 같은 문서가 볼 때마다 다르게 접힙니다.
- **측정 폭과 실제 CSS 폭이 어긋날 수 있음**: [layoutLines](index.html:1447)가 canvas로 자른 줄을 각각 `position: absolute`인 `<div>`로 배치합니다. 측정이 조금이라도 좁게 나오면 CSS(`word-break: keep-all; overflow-wrap: anywhere`)가 **한 줄을 두 줄로 다시 접고**, 절대배치이므로 위 줄과 겹칩니다. 캐럿(`::after`의 `_` + `margin-left: 10px`)은 측정에 전혀 반영되지 않습니다.
- **존재하지 않는 폰트를 제공**: [`fontFamilyInput`](index.html:1032)이 `Pretendard`(Modern)와 `Nanum Myeongjo`(Classic)를 내놓지만 `@font-face`도 `<link>`도 없습니다. 둘 다 시스템 폴백으로 떨어져 Modern은 사실상 Segoe UI, Classic은 Georgia입니다. **읽기 도구에서 본문 서체가 없는 셈입니다.**
- **레이아웃 캐시가 무한히 자람**: [`TextLayoutEngine.cache`](index.html:1427)는 (텍스트 × 폭 × 폰트) 키로 계속 커집니다. 캐시 키에 무관한 `accentColor`가 섞여 있어([index.html:1450](index.html:1450)) 강조색을 바꿀 때마다 전체가 무효화됩니다.

### 설정 · 데이터

- **`0`을 입력할 수 없음 — UI가 거짓말을 함**: [`dimmingInput`](index.html:1048)과 [`delayInput`](index.html:1028)은 `min="0"`인데, [saveRules](index.html:1927)는 `Number(...) || 40` / `Number(...) || 1500`, [loadSettings](index.html:1210)도 `Number(saved?.dimming || … || 40)`입니다. **`0`은 falsy라 기본값으로 되돌아갑니다.** "완전히 어둡게"도 "블록 간 대기 없음"도 표현 불가능한데 폼은 허용한다고 표시합니다. `speed`·`fontSize`도 같은 패턴입니다.
- **입력 상한이 강제되지 않음**: [saveRules](index.html:1920)–[1932](index.html:1932)에 클램프가 없습니다. `<input max>`는 폼 제출이 없으면 아무것도 막지 못하므로, `dimming`에 `500`을 넣으면 `--dimming: 5` → `brightness(5)`로 배경이 하얗게 타고, `fontSize`에 `500`을 넣으면 한 글자도 안 보입니다.
- **"Reset Local Storage"가 기본값으로 돌아가지 않음**: [clear()](index.html:1222)는 자기 키 둘만 지우고 `buntstream_settings`는 남깁니다. 직후 [loadDocuments](index.html:1166)가 `legacy?.script`를 시드 문서로, [loadSettings](index.html:1203)가 `legacy?.ytId` 등을 설정으로 되살립니다. **리셋 후 나타나는 것은 초기 상태가 아니라 레거시 상태입니다.**
- **YouTube ID를 바꿔도 배경이 안 바뀔 수 있음**: [index.html:2091](index.html:2091)의 `if (!String(this.ytPlayer.src || '').includes(id)) this.ytPlayer.src = newSrc;` — 새 ID가 **현재 URL의 부분 문자열이면 갱신을 건너뜁니다.** 기본 URL에 `kFnxuOnbHU0`가 들어 있으므로 `k`, `U0`, `1`, `embed` 같은 값을 넣으면 조용히 무시됩니다. 검증도 없어 전체 URL을 붙여넣으면 `…/embed/https://youtu.be/…`가 만들어집니다.
- **"Add to Queue"가 광고와 다르게 동작**: [queueDocument](index.html:1273)는 `priority`를 받지만 **`playQueue`는 정렬되지 않습니다**([nextItem](index.html:1353)이 `playQueue[this.queueIndex++]`로 순서대로 꺼냄). 우선순위 `10`([index.html:1884](index.html:1884))은 완전히 죽은 값이고 선택 문서는 큐 **맨 뒤**로 갑니다. 게다가 큐가 소진되면 [buildQueueFromStore](index.html:1261)가 `playQueue`를 통째로 재생성하므로 **아직 안 나온 수동 큐 항목이 조용히 사라집니다.**
- **복귀할 때마다 재생 횟수가 증가**: [afterDocument](index.html:1390)가 만든 `resumeItem`이 [run](index.html:1329)을 다시 타면서 [markPlayed](index.html:1396)를 또 부릅니다. 긴급 메시지 10개를 끼워넣으면 원본 문서의 `playCount`가 11이 됩니다.
- **긴급 방송 중 하단 패널이 "Standby"라고 표시됨**: [renderPlaybackState](index.html:2026)는 `this.documents.find(…)`로만 문서를 찾는데, 긴급 문서는 `transientUrgent`라 [`engine.runtimeDocuments`](index.html:1281)에 있습니다. 긴급 메시지가 화면 가득 타이핑되는 동안 Now Playing은 `Standby`, Block은 `0 / 0`입니다. `engine.findDoc(state.currentDocId)`를 쓰면 됩니다.
- **`runtimeDocuments`가 무한히 자람**: [addUrgentDocument](index.html:1281)가 `Map`에 넣기만 하고 지우지 않습니다.
- **저장 실패 폴백이 무의미**: [saveDocuments](index.html:1185)의 재시도는 `blocks`만 재계산하고 원본 `text`를 그대로 둡니다. 용량의 대부분이 `text`이므로 `QuotaExceededError`가 났다면 두 번째 시도도 거의 확실히 실패합니다.
- **JSON 내보내기/가져오기가 없음**: localStorage 단독 저장이라 브라우저 데이터를 지우면 문서가 전부 사라집니다. 읽으려고 넣어둔 글이 백업 경로 없이 존재합니다.

### 보안 · 신뢰 경계

- **`esm.sh`에서 임의 코드를 매 로드마다 실행**: [index.html:1439](index.html:1439)의 `await import('https://esm.sh/@chenglou/pretext@0.0.7')`는 SRI를 걸 수 없는 동적 import입니다. CDN이 오염되면 이 페이지 오리진에서 임의 JS가 돕니다. 그 오리진에는 kitscript의 다른 앱 localStorage가 전부 들어 있습니다. 폴백([`fallbackLayoutLines`](index.html:1476))이 이미 있으므로, 벤더링하거나 기능을 포기해도 앱은 동작합니다.
- **`escapeHtml`이 절반만 적용됨**: [renderDocumentList](index.html:2007)는 `doc.title`만 [escapeHtml](index.html:2117)을 거치고 **`doc.category`는 그대로 `innerHTML`에 들어갑니다**([index.html:2010](index.html:2010)). 에디터 `<select>`로는 값이 제한되지만, [loadDocuments](index.html:1159)는 저장된 문서를 `{...doc}`로 스프레드할 뿐 `category`를 검증하지 않습니다([createDocument](index.html:1139)의 `CATEGORIES.includes()` 검증이 로드 경로에는 없음). 같은 오리진의 다른 페이지가 이 키를 쓰거나 localStorage를 손대면 설정 모달을 열 때 실행됩니다.
- **`postMessage` 대상 오리진이 `'*'`**: [index.html:2049](index.html:2049). iframe이 다른 오리진으로 이동한 뒤에도 명령이 그쪽으로 배달됩니다. `'https://www.youtube.com'`으로 고정하면 끝나는 문제입니다.
- **iframe에 `sandbox`·`referrerpolicy` 없음, `youtube-nocookie.com` 미사용**([index.html:889](index.html:889)): 계속 띄워두는 것이 목적인 페이지가 3자 쿠키를 계속 심습니다.

### 죽은 코드 · 얽힌 설정

- **`darkOverlay`를 끄면 `dimming` 슬라이더가 조용히 무력화됨**: [index.html:89](index.html:89)–[91](index.html:91)의 `body.no-dark-overlay .video-background iframe { filter: none; }`이 `brightness(var(--dimming))`를 통째로 지웁니다. 두 컨트롤이 독립적으로 보이지만 하나가 다른 하나를 죽입니다.
- **`--overlay-opacity`는 죽은 변수**: [applySettingsToPage](index.html:2084)가 값을 넣지만, 같은 조건에서 [index.html:85](index.html:85)의 `display: none`이 먼저 적용됩니다.
- **`category`는 순수 장식**: `CATEGORIES` 6종 중 어느 것도 재생 동작에 영향을 주지 않습니다. 목록 필터링에만 쓰이고, 저장된 문서의 `category: 'urgent'`는 긴급 처리를 받지 못합니다(긴급 판정은 `transientUrgent` 플래그로만).
- **`.block` 클래스는 idle 메시지 전용**, `scroll-margin-top`([index.html:434](index.html:434))은 `scrollTo`를 쓰므로 미사용, [setSettingsTab](index.html:1736)의 마지막 `return;`과 빈 분기도 잔재입니다.
- **`showMessage`가 문자열 매칭으로 제어 흐름을 만듦**: [index.html:2109](index.html:2109)의 `if (text === '[Broadcast Resumed]')`. 토스트 문구를 고치면 배지가 사라집니다.
- **[showIdle](index.html:1547)이 500ms마다 `innerHTML`을 재설정**: 활성 문서가 없으면 [run](index.html:1317)이 계속 호출합니다.
- **`session` 증가가 세 군데에 흩어져 있음**: [run](index.html:1308) 진입, [addUrgentDocument](index.html:1287), [playDocument](index.html:1369)의 인터럽트 분기. 긴급 메시지 하나에 두세 번 증가하고, 취소된 루프를 누가 다시 시작하는지가 호출부([addUrgentFromText](index.html:1837) 등)에 암묵적으로 흩어져 있습니다. 동작하지만 추론이 어렵습니다.
- **문자당 오실레이터 2개 생성**: [playTypeSound](index.html:1622)–[1631](index.html:1631). `speed = 5ms`면 초당 약 200쌍입니다.
- **"Toggle typing sound" 버튼이 배경 영상 음소거까지 바꿈**: [toggleSound](index.html:2046)–[2049](index.html:2049)가 `renderer.isMuted` 하나로 타이핑 효과음과 YouTube 음소거를 함께 제어합니다. 서로 다른 두 가지입니다.

---

## 개선안 (우선순위)

1. **P0 — 읽을 수 있게 만들기: 창(window)과 되감기**
   `age <= 2` 상한을 화면 높이에 맞춰 넓히거나(최소 한 블록 전체), 아예 **블록 단위 표시**로 바꾼다 — 블록의 모든 줄을 남겨두고 타이핑만 순차 진행한 뒤, 다음 블록에서 통째로 밀어 올린다. 그리고 `prevBlock()` / `nextBlock()`을 추가한다(`state.currentBlockIndex`가 이미 있으므로 엔진 변경은 최소). `←`/`→`로 블록 이동, `Space`로 현재 블록 즉시 완성, `P`로 일시정지.

2. **P0 — 문자 키 전역 가로채기 제거**
   [handleGlobalKeydown](index.html:1774)의 `key.length === 1 → preventDefault → 긴급창`을 버린다. 긴급 입력창은 `/`나 `!` 버튼처럼 **명시적인 키 하나**로만 연다. 그러면 Space·화살표·숫자가 읽기 조작에 돌아오고, IME 문제(한글로는 열리지도 않던)가 사라진다. 남는 키에 위 1번의 단축키를 배치한다.

3. **P0 — 스크린 리더 마비 해소**
   [`<main class="text-stage">`](index.html:909)에서 `aria-live`를 제거(`aria-live="off"`)하고, 시각적으로 숨긴 `<div role="status" aria-live="polite">`를 따로 두어 **블록 하나가 완성될 때 한 번** 전문을 넣는다. `#msgBox`에는 `role="status"`. 읽기 도구가 스크린 리더에서 못 읽히면 안 된다.

4. **P0 — 확인 없는 클립보드 송출 차단**
   전역 `paste`([index.html:1697](index.html:1697))는 **긴급 입력창을 채우기만** 하고, 실제 송출은 사용자가 Enter나 `!` 버튼을 누를 때만. `handleClipboardUrgent`도 미리보기 후 확인.

5. **P1 — 읽기 상태 보존**
   `currentDocId` + `currentBlockIndex`를 설정에 저장하고 로드 시 복원한다(이어 읽기). 문서 끝에 도달하면 `[문서 완료]` 배지를 띄우고 잠깐 멈춘 뒤 다음 문서 제목을 보여준다. 큐를 한 바퀴 돌면 **순환 대신 완독 상태**로 들어가는 옵션을 준다. 하단에 얇은 진행 막대(블록 기준).

6. **P1 — 본문에 접근할 수 있게**
   `pointer-events: none`을 `.text-stage` 전체가 아니라 툴바 회피가 필요한 부분에만 건다. 현재 블록 전문을 (숨긴 채로라도) DOM에 유지해 선택·복사·`Ctrl+F`가 되게 한다. `Pretendard` / `Nanum Myeongjo`를 실제로 로드하거나 드롭다운에서 제거한다 — 읽기 도구의 본문 서체는 장식이 아니다.

7. **P1 — 숫자 입력의 거짓말 제거 + 리셋 정상화**
   `Number(x) || 기본값` 패턴을 `clamp(Number.isFinite(n) ? n : 기본값, min, max)` 헬퍼로 교체([saveRules](index.html:1920), [loadSettings](index.html:1201)). `0`이 통과하고 `500`이 막혀야 한다. [clear()](index.html:1222)에서 `legacyKey`도 제거하고, 레거시 마이그레이션은 **최초 1회 후 삭제**하는 일회성으로 바꾼다. `ytId`는 `^[A-Za-z0-9_-]{11}$` 검증 + URL 붙여넣기 시 `v=` 추출, 갱신 조건을 `includes(id)`가 아니라 `현재 id !== 새 id`로.

8. **P1 — 외부 CDN 실행 제거 + 레이아웃 결정성**
   `@chenglou/pretext`를 `reader/vendor/pretext.js`로 벤더링하고 상대경로로 import한다. [`layoutEngine.init()`](index.html:1663)을 `await`한 **뒤에** `engine.run()`을 시작해 첫 블록과 이후 블록의 줄바꿈이 달라지지 않게 한다. 그다음 `default-src 'self'; frame-src https://www.youtube-nocookie.com` CSP를 건다. 캐시 키에서 `accentColor`를 빼고 LRU 상한을 건다.

9. **P2 — 텍스트 처리 정확도**
   `splitIntoBlocks`의 `(?<=다[.!?]?)\s+` 규칙을 삭제한다(문장부호만으로 분할). lookbehind를 완전히 걷어내면 구형 Safari의 SyntaxError 절벽도 사라진다. 하드 분할은 `Intl.Segmenter`(grapheme)로 자른다 — [init](index.html:1433)에서 이미 존재 여부를 확인하고 있다. `layoutLines`의 측정 폭에서 캐럿 폭을 빼고, `.broadcast-line`에 `white-space: pre`를 주어 CSS 재접힘을 원천 차단한다. 모바일 폰트 클램프를 `.block`이 아니라 `--font-size` 자체에 건다([index.html:852](index.html:852)).

10. **P2 — 접근성 마감 · 큐 의미 · 데이터 이동성**
    `prefers-reduced-motion: reduce`에서 줄 transition과 캐럿 blink를 정지. 툴바 기본 `opacity`를 0.24 → 0.6, 터치 기기에서는 항상 표시. 모달에 `role="dialog"` / `aria-modal="true"` / ESC / 바깥 클릭 / 포커스 트랩 / 포커스 복원. 탭에 `role="tab"` + `aria-selected` + `aria-controls`(또는 데스크톱에서 탭 UI를 버리고 스크롤 섹션 헤더로). 아이콘 버튼에 `aria-label` + 글리프 `aria-hidden`, 토글에 `aria-pressed`. `renderDocumentList`의 `innerHTML` 조립을 `createElement` + `textContent`로 전면 교체하고 `loadDocuments`에서 `category`를 정규화. `queueDocument`는 `playQueue.splice(queueIndex, 0, item)`로 "다음에 재생"을 실제로 구현하고, `buildQueueFromStore` 재생성 시 미소진 수동 항목을 보존한다. `resumeItem`에는 `markPlayed`를 건너뛰는 플래그. `postMessage` 대상 오리진 고정. 그리고 **문서 JSON 내보내기/가져오기** — localStorage 단독 저장의 유일한 탈출구다.
