# writer — Semantic Writer (도메인 문서 기반 예측 작성기)

`writer/index.html`은 **참조 문서 한 뭉치를 통째로 색인해서, 타이핑 중인 단어에 맞는 키워드·구·문장을 칩으로 띄우고 Tab으로 순환·삽입하는 에디터**입니다. 사전이나 LLM이 아니라 사용자가 붙여넣은 "Base Document" 자체가 자동완성 사전이 됩니다. 키워드를 고르면 그 키워드가 breadcrumb에 쌓여 다음 제안이 그 문맥으로 좁혀지는 **드릴다운 구조**가 핵심입니다.

- 파일: [`index.html`](index.html) (687줄), 단일 파일, 외부 의존 0
- 색인: [`processDocument`](index.html:430)가 문장 분리 → 불용어 제거 → 키워드 빈도 + 인접 단어 동시출현(co-occurrence) 맵 구축
- 제안: [`getSuggestions`](index.html:470)가 `keyword` / `phrase` / `sentence` 세 종류의 칩을 점수순으로 최대 40개
- 조작: `Tab`(순환) · `Shift+Tab`(역순환) · `Enter`(확정+드릴다운) · `Space`(확정) · `Esc`(취소) · 클릭

## 개요 (동작 규칙)

- 우측 `#base-doc`에 문서를 붙여넣고 `Apply Document` → [`processDocument`](index.html:430)가 재색인, 좌하단 통계(Keywords / Sentences) 갱신
- 좌측 `#writing-area`에 타이핑하면 커서 직전 단어(`lastWord`)를 기준으로 상단 칩 영역이 실시간 갱신
- 칩 점수: `keyword`는 `빈도 × 매칭배수`, `phrase`는 `동시출현수 × 배수/2`, `sentence`는 항상 `1`
- `keyword` 칩을 확정하면 [`currentNavPath`](index.html:415)에 쌓이고, 이후 제안은 **입력 단어가 아니라 그 키워드**를 기준으로 계산됨 → breadcrumb 클릭으로 특정 깊이로 되돌아감
- `phrase` / `sentence`를 확정하면 경로가 초기화됨
- `wrap-reverse` + `justify-content: flex-end` 조합으로 **점수가 높은 칩이 아래쪽 줄(커서에 가까운 쪽)** 에 오도록 배치

### 구조 개요

| 영역 | 설명 |
| --- | --- |
| `.top-nav` | 브랜드, 외부 링크(Home / YouTube) |
| `#bread-crumbs` | 드릴다운 경로. 인라인 `onclick`으로 [`navigateBack`](index.html:619) 호출 |
| `#suggestion-bar` | 칩 리스트. `keyword` / `phrase` / `sentence` 타입별 색상 |
| `#writing-area` | 작성용 `textarea`. 모든 키 조작의 주체 |
| `#base-doc` | 참조 문서 `textarea` + `Apply Document` |
| `state` | `sentences`, `keywords`(Map), `cooccurrence`(Map of Map), `currentNavPath`, `isCycling`, `lastInsertedLength` |

---

## 품질 관점 분석

실제 코드에서 확인한 항목만 적습니다. 가장 심각한 것은 **XSS**, **개행 파괴**, **`lastInsertedLength` 오산**입니다. 앞의 둘은 사용자의 작성물을 즉시 손상시킵니다.

### 보안 (최우선)

- **XSS — 참조 문서가 `innerHTML`로 삽입됨**: [`renderSuggestions`](index.html:542)의 `el.innerHTML = \`<span class="chip-type">${s.type}</span> ${s.text}\`` 에서 `s.text`는 `sentence` 타입일 때 **Base Document의 원문 그대로**입니다. 문서에 `<img src=x onerror=alert(1)>` 한 줄이 있으면 해당 단어를 타이핑하는 순간 칩이 렌더되며 실행됩니다. 이 앱의 핵심 사용 흐름이 "외부 문서를 붙여넣는 것"이므로, 공유된 문서·클립보드 경유로 현실적인 경로입니다. `textContent` + `createElement`로 조립해야 합니다.
- **breadcrumb의 속성 인젝션**: [`renderSuggestions`](index.html:536)이 `<span onclick="navigateBack(${i})">${p}</span>` 를 문자열로 만듭니다. `p`는 키워드인데 [`cleanWords`](index.html:463)의 제거 문자 집합에 `<`, `>`, `"`, `'` 가 **없습니다**. 즉 `<img` 같은 토큰이 키워드로 살아남아 breadcrumb에 그대로 들어갑니다. 인라인 핸들러 자체도 CSP를 불가능하게 만듭니다 — `addEventListener`로 바꿔야 합니다.
- **`target="_blank"`에 `rel` 누락**: [index.html:316](index.html:316), [index.html:319](index.html:319)에 `rel="noopener noreferrer"`가 없어 리버스 탭내빙 위험.

### 버그 · 데이터 손상

- **Tab 한 번에 문서의 모든 개행·들여쓰기가 사라짐 (가장 치명적)**: [`replaceWithSuggestion`](index.html:600)이 `baseContent.trim().split(/\s+/)` 로 **커서 앞 전체 텍스트를 토큰화한 뒤 `words.join(' ')` 로 재조립**합니다. `\s+`는 개행을 포함하므로, 여러 문단을 쓴 뒤 Tab을 누르면 지금까지 쓴 글 전체가 **공백 하나로 이어진 한 줄**이 됩니다. 앞뒤 여백도 `trim()`으로 날아갑니다. 커서 앞 마지막 단어의 범위만 [`setRangeText`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/setRangeText)로 교체해야 합니다.
- **`lastInsertedLength`가 접두사 보존을 가정함**: [index.html:611](index.html:611)의 `insertedText = newBefore.slice(baseContent.length)` 는 "`newBefore`는 `baseContent`로 시작한다"를 전제합니다. 하지만 단어 치환 경로(`words[last] = text`)에서는 성립하지 않습니다. 예) `systems` 를 타이핑 → `ai systems` 제안 선택 시 `baseContent="systems"`(7), `newBefore="ai systems"`(10) → `insertedText="ems"` 로 **길이 4**가 기록됩니다. 다음 Tab에서 `content.slice(0, start - 4)` 가 `"ai sys"` 를 base로 잡아 **텍스트가 조각납니다.** `in-word matching`을 광고하는 앱인데 정확히 그 경우에 깨집니다.
- **`Esc`가 원본을 복구하지 못함**: [index.html:664](index.html:664)의 되돌리기는 `baseContent + content.slice(start)` 인데, `baseContent`에는 이미 사용자가 타이핑했던 부분 단어가 **제안으로 치환된 뒤**라 남아 있지 않습니다. "취소"인데 입력이 사라집니다. 순환 시작 시점의 `(value, selectionStart)` 스냅샷을 저장해 그대로 복원해야 합니다.
- **정확 일치 가점(×20)이 도달 불가능한 죽은 코드**: [index.html:495](index.html:495)에서 `match.startsWith(targetWord)` 를 먼저 검사하는데, `match === targetWord` 인 경우도 `startsWith`가 참이므로 항상 ×10에서 끝납니다. `else if (match === targetWord)` 분기는 실행되지 않습니다. **순서를 뒤집어야** 정확 일치가 최상위로 올라옵니다.
- **문장 칩에서 마침표가 사라짐**: [index.html:434](index.html:434)의 `text.split(/[.!?]\s+/)` 는 구분자를 버립니다. 마지막 문장만 `.`를 유지하고 나머지는 전부 종결부호 없이 저장·삽입됩니다. 또 `Dr.`, `U.S.` 같은 약어와 `AI-native` 뒤의 개행 없는 마침표에서 오분할합니다. 캡처 그룹 분할 또는 `Intl.Segmenter('sentence')` 로 교체.
- **네이티브 실행취소(Undo) 파괴**: `writingArea.value = …` 직접 대입은 브라우저의 undo 스택을 비웁니다. Tab 자동완성 후 `Ctrl+Z`가 동작하지 않습니다. `setRangeText` 또는 `document.execCommand('insertText')` 사용 시 undo가 보존됩니다.
- **한글 IME 조합 중 오작동**: [`input` 핸들러](index.html:626)와 `keydown`이 `e.isComposing` / `compositionstart`/`end`를 전혀 확인하지 않습니다. 조합 중인 자모가 `lastWord`로 들어가 무의미한 제안이 뜨고, 조합 중 Tab이 조합 문자를 확정 없이 치환합니다. 이 저장소의 주 사용자층을 고려하면 실사용 차단 요인입니다.
- **`Tab` 키보드 트랩**: [index.html:637](index.html:637)이 제안 유무와 무관하게 항상 `preventDefault()` 합니다. 키보드만 쓰는 사용자는 `#writing-area`를 빠져나갈 수 없습니다. `activeSuggestions.length === 0` 이면 기본 동작을 허용해야 합니다.
- **빈 문서 적용 시 상태 불일치**: [`processDocument`](index.html:432)가 `if (!text.trim()) return;` 로 조기 반환해, 문서를 비우고 `Apply` 해도 **이전 키워드·통계가 그대로 남습니다.** 초기화 후 반환해야 합니다.
- **`Space` 확정이 드릴다운 경로를 삭제함**: [index.html:652](index.html:652)에서 `isCycling = false` 로 만든 직후 `input` 이벤트가 발생하면 [index.html:630](index.html:630)이 `currentNavPath = []` 를 실행합니다. 문서 하단 안내에는 이 동작이 설명돼 있지 않습니다(의도라면 안내에 명시 필요).
- **`entry.related` 죽은 코드**: [index.html:442](index.html:442)에서 채워지지만 어디서도 읽지 않습니다. `cooccurrence`와 중복.
- **`entry.sentences` 중복 삽입**: 한 문장에 같은 단어가 두 번 나오면 인덱스가 두 번 들어갑니다(뒤의 `seen` 집합이 가려주지만 불필요한 작업 유발).

### 성능

- **키 입력마다 전체 재계산 + 전체 DOM 재생성**: [`getSuggestions`](index.html:491)는 매칭된 키워드마다 그 키워드가 등장한 **모든 문장**과 **모든 동시출현 구**를 push합니다. `s` 한 글자를 치면 `s`를 포함한 수백 개 키워드가 매칭되어 수천 개 객체를 만들고 정렬한 뒤 40개만 씁니다. 디바운스도, 조기 컷오프도 없습니다.
- `renderSuggestions`가 `innerHTML = ''` 후 매번 40개 `div`를 새로 만듭니다. `DocumentFragment` 또는 칩 재사용 필요.
- 인덱스 역전(키워드 → 문장 목록)은 이미 있으므로, `matches`를 먼저 점수순으로 자른 뒤(상위 N개) 문장을 붙이면 대부분의 비용이 사라집니다.

### 접근성

- 칩이 `role`/`tabindex` 없는 `div`입니다. 스크린리더에 목록으로 노출되지 않고, 마우스 없이는 Tab 순환 외 접근 경로가 없습니다. `#suggestion-bar`에 `role="listbox"`, 칩에 `role="option"` + `aria-selected`, `#writing-area`에 `aria-autocomplete="list"` + `aria-activedescendant`, 제안 개수 변화를 알릴 `aria-live="polite"` 영역이 필요합니다.
- `.chip.sentence`는 `text-overflow: ellipsis`로 잘리는데 `title` 속성이 없어 전체 문장을 확인할 방법이 없습니다.
- `scrollIntoView({behavior:'smooth'})`([index.html:552](index.html:552))와 `fadeIn` 애니메이션에 `prefers-reduced-motion` 대응이 없습니다.
- `.empty-suggestions`가 `color: var(--border)` (`#334155`) — 배경 `#1e293b` 대비 약 1.4:1로 **WCAG AA 미달**.
- breadcrumb `<span>`이 클릭 가능하지만 `button`이 아니라 키보드 포커스·엔터가 안 됩니다.

### 레이아웃 · 메타

- **모바일 미대응**: `.main-workspace`가 항상 `flex-direction: row` 라 좁은 화면에서 에디터와 참조 문서가 나란히 찌그러집니다. `100vh`도 iOS 주소창에서 잘립니다 → `100dvh` + `@media (max-width: 768px)` 세로 스택.
- `.chip.sentence { max-width: 500px }` 하드코딩 — 뷰포트 기준(`min(60ch, 100%)`)으로.
- `<head>`에 `description`, `theme-color`, Open Graph, favicon이 없습니다. 저장소의 다른 페이지와 동일한 메타 세트를 맞춰야 합니다.
- `window.onload = processDocument` 는 다른 핸들러를 덮어씁니다. `DOMContentLoaded` + `addEventListener`.
- 입력 중인 글과 Base Document가 새로고침 시 전부 사라집니다. `localStorage` 저장이 있으면 실사용 가치가 크게 오릅니다.

---

## 개선안 (우선순위)

### P0 — 즉시 (보안 · 데이터 손상)

1. **XSS 제거**: 칩 렌더를 `createElement` + `textContent` 로 전환. breadcrumb의 인라인 `onclick` → `<button>` + `addEventListener`.
2. **개행 보존**: `replaceWithSuggestion`을 "커서 앞 마지막 단어의 `[start, end)` 범위만 `setRangeText`로 교체"하는 방식으로 재작성. `trim()`/`join(' ')` 로 전체 텍스트를 재조립하지 않는다.
3. **순환 상태를 스냅샷으로**: `lastInsertedLength` 대신 순환 시작 시 `{ value, selectionStart, tokenStart, tokenEnd }` 를 저장하고, 매 Tab마다 그 스냅샷에서 다시 치환. `Esc`는 스냅샷 복원. 길이 산술을 없애면 위 두 버그와 `Esc` 버그가 함께 사라진다.
4. **`rel="noopener noreferrer"`** 추가.

### P1 — 정확성

5. 매칭 배수 분기 순서를 `=== targetWord`(20) → `startsWith`(10) → `includes`(2) 로 수정.
6. 문장 분리 시 종결부호 보존. 문장 칩 삽입 시 마침표를 함께 넣는다.
7. IME 대응: `compositionstart`/`compositionend` 플래그를 두고, 조합 중에는 제안 갱신과 Tab 치환을 보류.
8. 제안이 없을 때 `Tab` 기본 동작 허용(키보드 트랩 해소).
9. 빈 Base Document 적용 시 `sentences`/`keywords`/`cooccurrence`/통계를 0으로 초기화.
10. `entry.related` 제거, `entry.sentences`를 `Set`으로.

### P2 — 성능 · 접근성 · 반응형

11. `input` → 60~80ms 디바운스. 매칭 키워드를 점수순 상위 N개로 먼저 자른 뒤 문장/구를 확장. 렌더는 `DocumentFragment`.
12. `role="listbox"` / `role="option"` / `aria-activedescendant` / `aria-live` 부여. 문장 칩에 `title`.
13. `.empty-suggestions` 색을 `--text-secondary`로. `prefers-reduced-motion` 분기 추가.
14. `100dvh` + 768px 이하 세로 스택. `.chip.sentence` 폭을 `min(60ch, 100%)`.
15. `<head>` 메타(description / theme-color / OG / favicon) 정비, `window.onload` → `DOMContentLoaded`.
16. `#writing-area`와 `#base-doc` 내용을 `localStorage`에 디바운스 저장·복원. 작성 글자 수/단어 수를 통계 패널에 추가.

### 논의 필요 (동작 변경)

- `Space` 확정 시 드릴다운 경로가 초기화되는 현재 동작을 유지할지, `Space`도 경로를 보존할지. 유지한다면 하단 안내 문구에 명시.
- `sentence` 칩 점수가 상수 `1`이라 사실상 항상 뒤로 밀립니다. 문장 길이·키워드 밀도 기반 점수로 바꾸면 "문장 단위로 골라 쓰는" 원래 컨셉이 살아납니다.
