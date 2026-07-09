# tool — KitScript Clock Hub

`tool/index.html`은 KitScript의 여러 툴(모듈)을 **시계 인터페이스**로 스케줄링/런칭하는 단일 파일 허브입니다.
외부 프레임워크·빌드 없이 `<style>`/`<script>` 인라인만으로 구성된 순수 정적 HTML 한 장이며, 외부 의존은 Google Fonts와 배경 YouTube iframe뿐입니다.

- Live: [https://kitscript.com/game/tool/](https://kitscript.com/game/tool/) *(경로 추정)*
- 파일: [`index.html`](index.html) (약 933줄)

## 개요

방문자는 좌측 **Tool Library**의 카드를 중앙 **아날로그 시계**의 12개 시간 슬롯(1:00~12:00)에 드래그해 "예약"하고, 예약된 시각 5분 전(T-5m)과 정각(T-0)에 알림을 받습니다. 우측 **System Console**은 선택한 슬롯/툴의 상세와 실행/해제 버튼을 표시합니다.

### 구조 개요

| 영역 | 설명 |
| --- | --- |
| `.video-background` | `youtube-nocookie.com` iframe으로 배경 영상(`kFnxuOnbHU0`)을 음소거 자동재생. `?youtube=<11자 ID>` 쿼리로 교체 가능 |
| `.global-hud` | Home / Game Hub / YouTube / GitHub 외부 링크 + 배경 사운드 토글 버튼 |
| `.side-panel.left` (`#tool-library`) | `TOOLS` 배열(9개)을 카드로 렌더. 카드는 `draggable`, 🚀 버튼으로 즉시 실행 |
| `.clock-center-wrapper` | 아날로그 시계(시/분/초침) + 반지름 220px 원주에 배치된 12개 `.time-slot` |
| `.side-panel.right` (`#details-content`) | 슬롯/툴 상세, 스케줄 정보, EXECUTE/CLEAR 버튼 |
| `#notif-area` | T-5m/T-0 및 이벤트 토스트 알림 |

### 데이터/상태

- `TOOLS`: 9개 툴 정의(`id/icon/name/desc/url`). URL은 `https://kitscript.com/game/<slug>/` 절대경로
- `slotAssignments`: `localStorage['ks_slot_assignments']`에 `{ hour: { toolId } }`로 영속
- `ks_background_sound`: 사운드 on/off 상태 영속
- 시계 갱신은 `requestAnimationFrame` 재귀 루프(`startTime`), 알림 체크는 `setInterval(…, 10000)`

## 품질 관점 분석 요약

- **접근성(가장 큰 약점)**: 슬롯 배정 수단이 **드래그앤드롭 단독**이라 키보드/스크린리더 사용자는 스케줄을 만들 수 없습니다. 클릭 요소가 `<div>`(`.launch-icon-btn`, `.time-slot`, 알림 닫기 `✕`)로 되어 있어 포커스/키보드 조작 불가, `role`/`tabindex`/`aria-*` 부재. 전역 `* { user-select: none }`로 텍스트 선택 차단. `prefers-reduced-motion` 미대응
- **보안**: 모든 `target="_blank"` 링크(HUD 4개)에 `rel="noopener noreferrer"` 누락 → 리버스 탭내빙 위험. `launchTool`의 `window.open(url, '_blank')`도 `noopener` 미지정으로 `window.opener` 참조 노출
- **견고성**: `localStorage`에 남은 **오래된/삭제된 toolId**를 `getToolById(...).icon`처럼 널 가드 없이 역참조 → 예외 발생 시 시계 슬롯 렌더 전체가 깨질 수 있음(버전 업으로 `TOOLS` 목록이 바뀌면 현실적으로 발생)
- **성능**: 초당 1회면 충분한 `updateVisualAlerters`가 rAF 루프에서 **매 프레임(~60fps)** 실행되며 프레임마다 `querySelectorAll('.time-slot')` 재조회 + 12개 슬롯 인라인 스타일 기록 → 불필요한 DOM 스래싱
- **기능 정확성**: 사운드 토글이 YouTube IFrame API 핸드셰이크(`onReady`)·`origin` 파라미터 없이 raw `postMessage`만 보내 무음으로 실패할 수 있음. `qr-generator` 툴 URL이 `bizcard`와 중복
- **SEO/메타**: `<meta name="description">`, Open Graph/Twitter Card, `<link rel="canonical">`, favicon 전부 부재. `<title>`은 "KitScript Clock Hub"로 적절
- **시맨틱**: `<aside>`/`<main>`/`<nav>` 랜드마크는 잘 사용. 다만 상호작용 `<div>`들을 `<button>`으로 바꾸면 접근성/시맨틱이 함께 개선됨

## 개선 사항 (Improvements)

실제 `index.html` 코드에서 확인된 문제만 다룹니다. 우선순위 순.

### A. 견고성 · 정확성 (기능에 직접 영향)

1. **삭제된 `toolId` 역참조 시 크래시** — [`createSlots()`](index.html:746), [`checkNotifications()`](index.html:811), [`assignToolToSlot()`](index.html:769), [`showDetails()`](index.html:879)에서 `getToolById(id)`가 `undefined`를 반환할 수 있는데 곧바로 `.icon`/`.name`을 참조합니다. `localStorage`에 과거 버전의 toolId가 남아 있으면 예외로 시계 렌더가 통째로 실패합니다. `getToolById` 결과를 널 가드하고, 매칭되지 않는 슬롯 배정은 렌더 시 건너뛰거나 자동 정리하세요.
2. **`qr-generator` URL 중복** — [`TOOLS`](index.html:616)의 `qr-generator`가 `bizcard-tool`과 동일한 `https://kitscript.com/game/bizcard/`를 가리킵니다. QR 전용 대상이 없으면(로컬에 `qr` 폴더 없음) 의도된 것인지 확인하고, 아니라면 올바른 URL로 교정하거나 항목을 정리하세요.
3. **배경 사운드 토글이 조용히 실패 가능** — [`postYoutubeCommand()`](index.html:665)는 IFrame API 로드/`onReady` 핸드셰이크와 `origin` 파라미터 없이 command 메시지를 보냅니다. YouTube 임베드가 이를 무시해 토글이 동작하지 않을 수 있습니다. iframe `src`에 `&origin=<location.origin>`을 추가하고, `onYouTubeIframeAPIReady`/플레이어 ready 이후에만 command를 보내도록 하세요(라이브러리 미로드 시 no-op로 안전하게).

### B. 접근성 (키보드 · 스크린리더)

4. **드래그앤드롭 단독 배정 → 키보드 대안 부재** — 슬롯에 툴을 넣는 유일한 방법이 마우스 드래그입니다. 최소한의 키보드 경로(예: 툴 카드에서 "슬롯 선택" 후 슬롯 클릭/Enter로 배정, 또는 상세 패널에서 시간 선택 배정)를 추가하세요.
5. **상호작용 `<div>`를 `<button>`으로** — [`.launch-icon-btn`](index.html:718), [`.time-slot`](index.html:741), 알림 닫기 [`✕`](index.html:827)이 클릭 핸들러를 단 `<div>`/`<span>`입니다. `<button type="button">`으로 바꾸거나 `role="button"` + `tabindex="0"` + Enter/Space 처리, 시계 슬롯에는 `aria-label`(예: "3시 슬롯, Quiz Factory 예약됨")을 부여하세요.
6. **전역 `user-select: none` 완화** — [`* { user-select:none }`](index.html:23)이 툴 이름/설명 등 텍스트 선택까지 막습니다. 드래그 핸들 등 꼭 필요한 요소로 범위를 좁히세요.
7. **`prefers-reduced-motion` 대응** — `@keyframes pulse`([`.near-active`](index.html:397))와 각종 `transition`이 항상 실행됩니다. `@media (prefers-reduced-motion: reduce)`로 애니메이션을 낮추세요.

### C. 보안

8. **`target="_blank"`에 `rel="noopener noreferrer"` 추가** — [HUD 링크 4개](index.html:549)(Home/Game Hub/YouTube/GitHub) 모두 `rel`이 없습니다. 각 앵커에 추가하세요.
9. **`window.open`에 `noopener`** — [`launchTool()`](index.html:841)의 `window.open(tool.url, '_blank')`를 `window.open(tool.url, '_blank', 'noopener')`로 바꿔 `window.opener` 노출을 차단하세요.

### D. 성능

10. **시계 루프의 매 프레임 DOM 작업 제거** — [`startTime()`](index.html:782)가 rAF마다 [`updateVisualAlerters()`](index.html:794)를 호출하고, 그 안에서 `querySelectorAll('.time-slot')` 재조회 + 12개 슬롯 인라인 스타일 기록을 합니다. 시각 알림은 분(minute) 단위로만 바뀌므로: (a) 슬롯 참조를 1회 캐싱하고, (b) 알림/보더 갱신은 분이 바뀔 때(또는 초 단위)만 수행하세요. 초침의 부드러운 갱신은 유지하되 DOM 쓰기는 값이 바뀔 때만.

### E. 메타 · 발견성

11. **메타/OG/파비콘 추가** — `<head>`에 `<meta name="description">`, `og:*`, `twitter:card`, favicon이 없습니다. 공유 미리보기와 탭 아이콘을 위해 추가하세요(루트 `index.html`과 동일 톤).
12. **Google Fonts `preconnect`** — [폰트 링크](index.html:7)에 `rel="preconnect"`(`fonts.gstatic.com`, `crossorigin`)를 추가하면 초기 렌더가 개선됩니다.

## 개선 작업 계획 (Sonnet 5 실행 범위)

아래 순서로 **단일 파일/인라인 철학을 유지**하며 `tool/index.html`만 수정합니다. 게임/툴 목록의 성격, 시계 UI 레이아웃, 12시간제 슬롯 설계는 **변경하지 않습니다**(설계 의도 존중).

1. **A. 견고성·정확성** (1~3): 널 가드, QR URL 정리/확인, 사운드 토글 `origin`+ready 핸드셰이크
2. **C. 보안** (8~9): `rel="noopener noreferrer"`, `window.open` `noopener`
3. **D. 성능** (10): 시계 루프 DOM 작업 최소화(슬롯 참조 캐싱 + 분 단위 갱신)
4. **B. 접근성** (5~7): 상호작용 `<div>`→`<button>`/`role`, `user-select` 범위 축소, `prefers-reduced-motion`. **4번(키보드 배정 경로)은 UX 설계가 필요하므로 이번 패스에서는 (5)의 슬롯 포커스/Enter 배정까지만 우선 처리**
5. **E. 메타** (11~12): description/OG/favicon/preconnect

### 비범위 (Out of scope)

- 시계 12시간제 AM/PM 구분, 드래그앤드롭의 전면적 UX 재설계, 신규 기능
- 프레임워크·빌드 도입(인라인 단일 파일 유지)
- 배경 YouTube 자동재생 정책 자체(모바일 데이터/배터리)는 루트와 동일한 트레이드오프로 유지
