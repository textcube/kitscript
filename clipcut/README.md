# clipcut — ClipCut Pro (8-BIT 레트로 영상 편집기)

`clipcut/index.html`은 브라우저 안에서만 동작하는 **클라이언트 사이드 영상 편집 툴**입니다. 사용자가 로컬 영상을 불러와 **트림(In/Out)**, **재생 속도**, **텍스트/이미지 오버레이**, **배경 음악(BGM) 믹스**를 얹은 뒤 `BAKE` 버튼으로 `MediaRecorder`를 통해 `.webm` 파일로 **인코딩·저장**합니다. UI 전체가 NES 시대의 8-BIT 게임 콘솔을 흉내 낸 **레트로(CRT 스캔라인 + 네온 그린 + 픽셀 폰트) 디자인**으로 되어 있습니다.

- 파일: [`index.html`](index.html) (약 762줄), 내부 버전 문자열 `ClipCut Pro v2.12.5 - 8-BIT RETRO EDITION`
- 외부 프레임워크·빌드 없이 `<style>`/`<script>` 인라인만으로 구성된 순수 정적 HTML 한 장. 외부 의존은 Google Fonts뿐이며, 서버·업로드 없이 `URL.createObjectURL` + `FileReader`로 로컬 파일만 다룸(프라이버시 우수)
- **허브 미등록**: 루트 [`index.html`](../index.html)의 `CONFIG.MODULES`에 `CLIPCUT` 항목이 없습니다(레벨 24 `BOOK`까지만 존재). 이 툴은 게임이 아니라 유틸리티이므로 허브 등재 여부는 설계 판단 사항으로 남겨둡니다.

## 개요 (기능 흐름)

| 단계 | 조작 | 관련 코드 |
| --- | --- | --- |
| 1. 소스 로드 | `IMPORT_VIDEO`로 영상 로드 → 캔버스 크기를 원본 해상도로 설정, 트림을 0~duration으로 초기화 | [`handleVideoUpload`](index.html:541) |
| 2. 오버레이 | `+ NEW` 텍스트 / `+ LOAD` 스프라이트 이미지 추가, 캔버스에서 드래그·리사이즈 | [`addTextOverlay`](index.html:573) · [`handleImageUpload`](index.html:561) · [`setupLayerInteractions`](index.html:604) |
| 3. 사운드 | `LOAD_BGM`으로 배경음 로드, BGM/영상 볼륨 슬라이더 | [`handleAudioUpload`](index.html:571) |
| 4. 트림/속도 | 타임라인 핸들 드래그 또는 IN_PT/OUT_PT 숫자 입력, `SPEED_RATE`(0.5x/1x/2x) | [`handleGlobalMouseMove`](index.html:492) · [`updateTrimFromInputs`](index.html:529) |
| 5. 미리보기 | 재생/정지, 프레임 이동(±0.1s), 음소거, 매 프레임 캔버스 합성 | [`renderLoop`](index.html:669) · [`drawFrame`](index.html:680) |
| 6. 출력 | `BAKE` → Web Audio 믹스 + `captureStream` + `MediaRecorder`로 `.webm` 저장 | [`startExport`](index.html:717) |

### 구조 개요

| 영역 | 설명 |
| --- | --- |
| `header` | 브랜드(CLIP-CUT.EXE) + YouTube/KitScript 외부 링크 |
| `.sidebar`(좌) | TEXT_LAYER / SPRITE_ASSET / SOUND_MIX / MAP_SOURCE 입력 패널 |
| `.viewport` | `#preview-canvas` 합성 프리뷰 + `#empty-state`(SMPTE 컬러바 "NO SIGNAL") + 하단 타임라인/재생 컨트롤 |
| `.right-bar`(우) | TRIM_CONFIG(IN/OUT) / SPEED_RATE / `BAKE` 버튼 |
| `#export-overlay` | ENCODING 진행률 바 + `TERMINATE` 취소 버튼 |
| `state` / `UI` / `ICONS` | 전역 편집 상태, DOM 캐시, 인라인 SVG 아이콘 조각 |

## 품질 관점 분석 요약

실제 코드에서 확인된 항목만 정리합니다. 가장 큰 문제는 **내보내기(Export)의 오디오/비디오 동기와 Web Audio 라우팅**입니다.

### 정확성 · 기능 결함 (가장 중요)

- **Export A/V 동기 붕괴**: [`startExport`](index.html:717)는 오디오를 실시간 `play()`로 흘려보내면서([index.html:728](index.html:728)·[index.html:747](index.html:747)) 동시에 프레임은 `currentTime = avt`로 **탐색(seek) 기반**으로 10ms 간격 렌더합니다([index.html:749](index.html:749)~756). 실시간 오디오와 seek 기반 프레임 진행이 서로 다른 시간축으로 달려서, 인코딩 결과물의 영상 길이·오디오 싱크가 트림 구간과 어긋납니다. 게다가 `video.play()`가 켜진 상태에서 매 루프마다 `currentTime`을 수동으로 되감아 재생 위치가 충돌합니다.
- **Web Audio 라우팅이 프리뷰 사운드를 죽임**: `createMediaElementSource(state.video)`([index.html:725](index.html:725))로 영상 오디오를 가로채 `MediaStreamDestination`(녹화 스트림)에만 연결하고 `audioCtx.destination`(스피커)에는 **끝내 연결하지 않습니다**. `MediaElementSource`는 요소당 1회만 생성 가능하므로, **한 번 내보내기를 하고 나면 이후 미리보기 재생에서 영상 소리가 나오지 않습니다.** BGM(`mSource`)도 동일.
- **SPEED_RATE가 내보내기에서 무시됨**: [`speedSelect`](index.html:468)는 프리뷰 `playbackRate`에만 반영되고, Export 루프는 `ft = 1/fps` 실시간 프레임으로 trim 구간을 그대로 훑어([index.html:736](index.html:736)·749) 0.5x/2x 설정이 결과물에 전혀 반영되지 않습니다.
- **선언했지만 로드되지 않은 폰트**: `state.fonts`에 `"Black Han Sans"`가 있지만([index.html:420](index.html:420)) `<head>`의 폰트 [`<link>`](index.html:8)는 `Press Start 2P`/`DotGothic16`/`JetBrains Mono`만 불러옵니다. 해당 폰트를 고르면 조용히 폴백됩니다.
- **`MediaRecorder` 지원 미검증**: `video/webm;codecs=vp9`를 [고정](index.html:740)으로 요청하며 `isTypeSupported` 폴백이 없습니다. Safari 등 미지원 브라우저에서 예외로 내보내기가 통째로 실패합니다.
- **객체 URL 미해제(메모리 누수)**: `videoURL`/`audioURL`([index.html:543](index.html:543)·571)과 export 결과 Blob URL([index.html:744](index.html:744))에 대해 `URL.revokeObjectURL`을 호출하지 않아, 소스를 여러 번 교체하면 누수가 누적됩니다.

### 성능

- **리사이즈 중 매 mousemove마다 사이드바 DOM 재생성**: 오버레이 리사이즈 시 [`renderLayers()`](index.html:519)를 mousemove마다 호출해 좌측 레이어 카드 목록 `innerHTML`을 통째로 다시 만듭니다. 캔버스 갱신은 이미 `renderLoop`가 담당하므로 이 호출은 불필요하며, 입력 포커스도 잃습니다.
- **매 프레임 DOM 문자열 쓰기**: [`renderLoop`](index.html:669)가 playhead `left`와 `time-display` 텍스트를 값 변화와 무관하게 매 프레임 기록합니다(경미).

### 보안 · 견고성

- **`target="_blank"`에 `rel` 누락**: YouTube/KitScript [외부 링크](index.html:274) 2개에 `rel="noopener noreferrer"`가 없어 리버스 탭내빙 위험.
- **오버레이 텍스트 innerHTML 주입**: [`renderLayers`](index.html:578)가 사용자 입력 `txt.content`를 `value="${...}"`로 `innerHTML`에 그대로 삽입합니다. `"`나 `<` 문자를 넣고 레이어를 추가/삭제해 재렌더하면 속성이 깨지거나 마크업이 주입됩니다(로컬 단일 사용자 툴이라 위험도는 낮으나 값 파손은 실사용에서 발생).

### 접근성

- **전역 포커스 표시 제거**: `* { outline: none }`([index.html:28](index.html:28))으로 키보드 포커스 링이 사라져 키보드 탐색이 사실상 불가.
- **`prefers-reduced-motion` 미대응**: `.blink`(1초 점멸)와 CRT 스캔라인 오버레이가 상시 동작.
- **레이블 연결 부재**: 슬라이더/컬러 입력에 텍스트 레이블은 있으나 `for`/`id` 연결이 없고, `#preview-canvas`에 대체 설명(`aria-label`)이 없습니다. 음소거 토글에 `aria-pressed` 미반영.

### 메타 · 로딩

- **메타/OG/파비콘 전무**: `<meta name="description">`, Open Graph/Twitter Card, favicon 부재.
- **폰트 로딩 최적화 여지**: `<link rel="stylesheet">`만 있고 `preconnect`(`fonts.googleapis.com`, `fonts.gstatic.com`)가 없습니다.

## 개선 사항 (Improvements)

우선순위 순. **실제 코드에서 확인된 문제만** 다룹니다.

### A. 내보내기 정확성 (결과물 품질에 직접 영향)

1. **Export A/V 동기 재설계** — 오디오 실시간 재생과 프레임 seek 렌더의 시간축을 하나로 통일하세요. 가장 견고한 방향은 **오프라인 seek 방식 유지 + 오디오를 `MediaRecorder` 실시간 스트림 대신 `OfflineAudioContext`나 시간축 정합이 보장되는 방식으로 합성**하거나, 반대로 **실시간 재생 캡처(`video.play()`로 자연 재생하며 `requestVideoFrameCallback`으로 프레임 캡처)**로 통일하는 것입니다. 최소 수정으로는 실시간 재생 캡처로 일원화해 seek 루프를 제거하는 편이 싱크가 안정적입니다.
2. **Web Audio 라우팅 복구** — `MediaElementSource`는 요소당 1회 생성이므로 앱 시작(또는 최초 로드) 시 한 번만 생성해 `state`에 보관하고, **평상시에는 `audioCtx.destination`에 연결**해 프리뷰 소리가 나게 하며, 내보내기 시에만 `dest`로 추가 연결(또는 게인 라우팅 전환)하세요. 내보내기 종료 후 스피커 라우팅을 반드시 복구합니다.
3. **SPEED_RATE를 내보내기에 반영** — export 루프의 프레임 시간 진행 또는 프레임 수를 `state.speed`로 스케일해 0.5x/2x가 결과물에 실제로 반영되게 하세요(오디오 배속 처리 포함 여부는 UX 결정).
4. **`MediaRecorder` 코덱 폴백** — `MediaRecorder.isTypeSupported`로 `vp9 → vp8 → webm 기본` 순으로 선택하고, 전부 미지원이면 사용자에게 토스트로 안내하세요.

### B. 버그 · 정합성

5. **미로드 폰트 처리** — `state.fonts`의 `"Black Han Sans"`를 실제로 `<link>`에 추가하거나, 목록에서 제거해 선택 시 조용한 폴백을 없애세요.
6. **객체 URL 해제** — 새 영상/오디오를 로드하기 전 이전 `videoURL`/`audioURL`을 `URL.revokeObjectURL`로 해제하고, export 다운로드 Blob URL도 `a.click()` 후 해제하세요.
7. **오버레이 텍스트 이스케이프** — `renderLayers`에서 `value` 삽입 시 HTML 이스케이프(또는 `textContent`/`setAttribute` 기반 DOM 생성)로 바꿔 `"`·`<` 파손/주입을 막으세요.

### C. 성능

8. **리사이즈 중 `renderLayers` 제거** — 오버레이 리사이즈 mousemove에서 `renderLayers()` 호출을 빼세요(캔버스는 `renderLoop`가 이미 갱신). 사이드바 숫자 표시가 필요하면 해당 입력값만 부분 갱신하세요.
9. **매 프레임 DOM 쓰기 최소화** — playhead 위치·시간 텍스트를 마지막 값과 비교해 변할 때만 기록(경미, 여력 있을 때).

### D. 보안

10. **외부 링크 `rel`** — YouTube/KitScript 앵커 2개에 `rel="noopener noreferrer"` 추가.

### E. 접근성

11. **포커스 표시 복구** — 전역 `outline: none`을 제거하거나 `:focus-visible`에 레트로 톤의 포커스 스타일(예: 네온 그린 아웃라인)을 부여하세요.
12. **`prefers-reduced-motion` 대응** — `@media (prefers-reduced-motion: reduce)`로 `.blink` 점멸과 스캔라인 오버레이를 정지/약화하세요.
13. **레이블·대체 설명** — 슬라이더/컬러 입력에 `id`/`for` 연결, `#preview-canvas`에 `aria-label`, 음소거 버튼에 `aria-pressed` 반영.

### F. 메타 · 로딩

14. **메타/OG/파비콘 추가** — `<head>`에 `description`, `og:*`, `twitter:card`, favicon(인라인 SVG data-URI 권장, 신규 파일 불필요) 추가.
15. **폰트 `preconnect`** — `fonts.googleapis.com` / `fonts.gstatic.com`(`crossorigin`)에 `preconnect` 추가.

## 개선 작업 계획 (Sonnet 5 실행 범위)

`clipcut/index.html`만 수정하며 **단일 파일 / 인라인 / 무빌드 철학과 8-BIT 레트로 디자인 정체성을 유지**합니다. UI 레이아웃·색·폰트 톤·"NO SIGNAL" 컬러바 연출은 **변경하지 않습니다**. 순서:

1. **A. 내보내기 정확성** (1~4): A/V 동기 일원화, Web Audio 라우팅 복구(프리뷰 소리 유지), SPEED 반영, 코덱 폴백
2. **B. 버그** (5~7): 미로드 폰트, 객체 URL 해제, 텍스트 이스케이프
3. **C. 성능** (8~9): 리사이즈 중 `renderLayers` 제거, 매 프레임 DOM 쓰기 최소화
4. **D. 보안** (10): 외부 링크 `rel`
5. **E. 접근성** (11~13): 포커스 표시, `prefers-reduced-motion`, 레이블/`aria-*`
6. **F. 메타·로딩** (14~15): description/OG/favicon, 폰트 `preconnect`

### 비범위 (Out of scope)

- 레트로 UI 레이아웃·색·폰트 톤·CRT 연출 재설계
- 신규 편집 기능(전환 효과, 다중 트랙, 필터, 키프레임 등) 추가
- 프레임워크·빌드 도입(인라인 단일 파일 유지), 서버/업로드 도입
- 루트 허브 `CONFIG.MODULES` 등재 여부(유틸리티 성격상 별도 판단)
