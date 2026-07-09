# kitscript

When a homepage becomes a battlefield.

`kitscript`는 정적인 랜딩 페이지를 게임형 인터페이스로 바꾸는 실험 프로젝트입니다.
루트 허브(`index.html`)에서 전투/레벨업을 통해 모듈(미니게임)을 해금하고, 각 모듈은 독립 실행 가능한 HTML 게임을 지향합니다.

## Concept

웹 개발은 오랫동안 점점 더 복잡한 방향으로 발전해 왔다. **framework**, **modular architecture**, 수많은 파일 구조, **build system**, 그리고 **deployment pipeline**은 이제 일반적인 개발 환경이 되었다. 이러한 구조는 대규모 서비스에는 필요하지만 모든 소프트웨어가 그런 수준의 복잡성을 요구하는 것은 아니다. 실제로 많은 경우 사람들에게 필요한 것은 거대한 시스템이 아니라 **simple business logic** 하나를 해결하는 것이다. 예약을 처리하거나 점수를 계산하거나 간단한 이벤트를 처리하는 것처럼 비교적 작은 로직만으로도 충분히 유용한 프로그램이 될 수 있다.

많은 사람들이 개발을 어렵게 느끼는 이유는 프로그래밍 언어 때문이라기보다 문제를 **logic**으로 정리하고 흐름을 설계하는 과정 때문이다. 하지만 흥미로운 점은 실제 현장에서 필요한 **business logic**이 생각보다 거대하지 않은 경우가 많다는 것이다. **prompt sharing**만으로 모든 문제가 해결되지는 않지만, 실제 서비스 흐름을 구성하는 로직 자체는 의외로 단순한 규칙과 상태 변화로 설명되는 경우가 많다. 결국 중요한 것은 거대한 코드베이스가 아니라 문제를 해결하는 **logic structure**다.

여기에 **AI coding tools**의 등장이 또 하나의 변화를 만들고 있다. 사람은 더 이상 모든 코드를 직접 작성할 필요가 없어지고 있으며, 구조와 의도를 설명하면 코드 생성은 상당 부분 자동화될 수 있다. 하지만 AI 역시 거대한 프로젝트보다는 **small and self-contained code**를 훨씬 잘 이해한다. 하나의 파일 안에서 전체 맥락이 보이는 구조는 AI와의 협업에서도 유리하다. 코드를 복사하고 AI에게 질문하고 다시 수정하는 **copy → modify → run** 사이클이 빠르게 반복될 수 있기 때문이다.

대규모 서비스는 모든 상황을 고려해야 하기 때문에 많은 로직을 필요로 한다. **authentication**, **permission**, **infrastructure**, **scalability**, 그리고 다양한 예외 처리까지 포함해야 한다. 그러나 **personalized software**의 경우 상황이 달라진다. 사용자가 누구인지 이미 알고 있고 사용 목적도 명확하기 때문에 많은 로직이 필요 없어질 수 있다. 결국 남는 것은 핵심 기능 몇 가지뿐이며 불필요한 계층이 사라지면서 프로그램은 더 작고 단순해질 수 있다. 이러한 과정은 자연스럽게 **lighter software**와 더 나은 **performance potential**로 이어질 수 있다.

이러한 관점에서 하나의 흥미로운 가능성이 등장한다. **a single web page can become a program**이라는 생각이다. 현대의 브라우저는 이미 강력한 실행 환경이며 **cache**, **offline capability**, 그리고 다양한 **web APIs**를 통해 웹페이지는 단순한 문서를 넘어 실행 가능한 프로그램이 될 수 있다. 만약 프로그램이 하나의 페이지로 압축된다면 **deployment**의 방식도 크게 단순해진다. 복잡한 설치 과정이나 서버 인프라 없이도 파일 하나만 전달하면 실행이 가능해질 수 있다.

이 구조는 특히 네트워크 환경에 대한 의존성을 줄일 수 있다. **portable software** 형태의 페이지는 이메일, 메신저, USB 등 다양한 방식으로 전달될 수 있으며 **offline environment**나 **secure isolated network**에서도 실행될 수 있다. 네트워크가 차단된 환경이나 제한된 보안 환경에서도 사용할 수 있는 프로그램 구조가 되는 것이다. 이런 점에서 작은 웹페이지 프로그램은 다시 한번 **software mobility**를 회복하는 접근이 될 수 있다.

이러한 작은 프로그램들은 복사해서 수정하고 바로 실행할 수 있는 특징을 가진다. **copy**, **modify**, **run**이라는 단순한 흐름은 실험과 확산 속도를 크게 높인다. 또한 이러한 코드 조각들은 마치 영화 *The Matrix*에서 네오가 다운로드받던 프로그램처럼 필요할 때 바로 실행되는 **capability module**이 될 수도 있다. 작은 기능 단위의 프로그램이 필요할 때 실행되는 형태의 소프트웨어 생태계다.

물론 아직 해결되지 않은 문제들도 많다. **data persistence**, **security**, **update mechanism**, **collaboration**, 그리고 장기적인 **maintenance** 같은 영역은 여전히 중요한 과제로 남아 있다. 특히 대규모 서비스의 **build**, **deployment**, **operation**까지 고려하면 아직 갈 길이 먼 것도 사실이다. 하지만 개인 실험, 작은 도구, 인터랙티브 콘텐츠, 프로토타입과 같은 영역에서는 이미 충분히 실용적인 접근이 될 수 있다.

모든 소프트웨어가 거대한 시스템일 필요는 없다. 많은 경우 **simple logic solving**만으로도 충분한 가치를 만들 수 있다. 기술의 미래가 반드시 더 복잡해지는 방향으로만 발전하는 것은 아닐지도 모른다. 동시에 더 작고 더 단순하며 더 개인화된 **lightweight software**의 흐름도 나타날 수 있다. 아직 해결되지 않은 문제들도 있고 발전 속도가 느린 영역도 있지만 그 가능성은 이미 열려 있다. 그리고 그 가능성은 어쩌면 아주 작은 곳에서 시작될지도 모른다. **one page**에서.

## Live

- Hub: [https://kitscript.com/game/](https://kitscript.com/game/)

## Core Philosophy

- Single-file preferred: 각 게임은 가능하면 `index.html` 한 파일로 복사/실행 가능해야 합니다.
- Bundled allowed when needed: 디자인/연출 품질을 위해 에셋 폴더를 사용하는 모드도 허용합니다.
- Copy-friendly: 공통 프레임워크 의존보다, 파일 단독 이해/수정 가능성을 우선합니다.
- Experimental landing: 방문자가 곧바로 플레이 가능한 인터랙티브 홈페이지를 지향합니다.

## 랜딩 페이지(`index.html`) 분석

루트 `index.html`(약 635줄)은 `BUNT GAMES | 8-BIT Eternal Invasion`이라는 하나의 **자동 전투(auto-battler) 미니게임**이면서 동시에 나머지 모든 미니게임 모듈로 향하는 **허브/런처** 역할을 겸합니다. 외부 프레임워크나 빌드 과정 없이 `<style>`/`<script>` 인라인 코드만으로 구성된 순수 정적 HTML 한 장입니다.

### 구조 개요

| 영역 | 설명 |
| --- | --- |
| `#video-background` | YouTube IFrame API로 배경 영상(`kFnxuOnbHU0`)을 음소거 자동재생. API 로드 실패/임베드 에러(153/101/150) 시 `youtube-nocookie.com` iframe으로 자동 폴백 |
| `#gameCanvas` | `<canvas>` 기반 픽셀아트 오토배틀러. 플레이어·요정(터렛) 4기가 자동으로 적(좀비/미라/드라큘라/호박/스켈레톤)을 조준·사격 |
| `#brand-header` | 로고, 중앙 HP/MP 게이지·점수 HUD, YouTube/GitHub 외부 링크 |
| `#left-modules` / `#right-modules` | 레벨업으로 해금되는 24개 모듈(미니게임) 바로가기 버튼을 JS로 동적 렌더링 |
| `#bottom-controls` | 처치 10회당 충전되는 "SALVO CHARGE" 게이지, 3충전 시 활성화되는 광역기 버튼(`GENESIS BURST`), 사운드 토글 |
| `#toast-container` | 레벨업/충전/에러 등 이벤트 토스트 알림 |

### 스타일링/스크립트 방식

- CSS는 `<head>` 내 `<style>` 블록에 전부 인라인, CSS 커스텀 프로퍼티(`--primary-gold`, `--magic-blue` 등)로 팔레트 관리
- `max-width: 850px` 미디어쿼리 1개로 모바일 대응(헤더 세로 배치, 모듈 버튼 폭 100%)
- JS도 `<body>` 하단 `<script>` 블록에 전부 인라인 (외부 의존은 Google Fonts, YouTube IFrame API뿐)
- 게임 루프는 `requestAnimationFrame` 기반, 적 스폰/추적/충돌/파티클/발사체를 매 프레임 갱신

### 연결된 하위 프로젝트 (모듈 해금 목록)

`CONFIG.MODULES` 배열에 정의된 24개 모듈이 레벨 순서대로 좌/우에 번갈아 배치되며, `https://kitscript.com/game/<label>` (소문자) 절대경로로 링크됩니다.

| 순서 | 레벨 | 라벨 | 로컬 폴더 존재 |
| --- | --- | --- | --- |
| 1 | 1 | ONE | ✅ `/one` |
| 2 | 2 | CLOCK | ✅ `/clock` |
| 3 | 3 | UNITY | ❌ 없음 |
| 4 | 4 | TANK | ✅ `/tank` |
| 5 | 5 | CABLE | ✅ `/cable` |
| 6 | 6 | QUIZ | ✅ `/quiz` |
| 7 | 7 | ROGUE | ✅ `/rogue` |
| 8 | 8 | WORLD | ✅ `/world` |
| 9 | 9 | PILOT | ✅ `/pilot` |
| 10 | 10 | PUZZLE | ✅ `/puzzle` |
| 11 | 11 | OCEAN | ✅ `/ocean` |
| 12 | 12 | BIRD | ✅ `/bird` |
| 13 | 13 | PIZZA | ✅ `/pizza` |
| 14 | 14 | BOMB | ✅ `/bomb` |
| 15 | 15 | DRONE | ✅ `/drone` |
| 16 | 16 | HACK | ✅ `/hack` |
| 17 | 17 | COWBOY | ✅ `/cowboy` |
| 18 | 18 | ZONE | ✅ `/zone` |
| 19 | 19 | PANDEMIC | ✅ `/pandemic` |
| 20 | 20 | SPACE | ✅ `/space` |
| 21 | 21 | WAVE | ❌ 없음 |
| 22 | 22 | PLAYLIST | ❌ 없음 |
| 23 | 23 | HOUSE | ❌ 없음 |
| 24 | 24 | BOOK | ❌ 없음 |

> 레벨 7 이하 모듈은 항상 해금 상태로 노출되며, 레벨 8 이상 모듈만 `LOCK LV.N`으로 잠깁니다. `UNITY`, `WAVE`, `PLAYLIST`, `HOUSE`, `BOOK`은 이 저장소에는 해당 폴더가 없어 라이브 사이트(`kitscript.com`)에만 존재하거나 아직 미구현 상태로 추정됩니다.

또한 저장소에는 `MODULES` 배열에 아예 등록되지 않아 허브에서 링크되지 않는 폴더도 다수 존재합니다: `album`, `avatar`, `bizcard`, `city`, `clinic`, `clip`, `clipcut`, `home`, `invasion`, `metaball`, `model`, `motion`, `oxpizza`, `pickme`, `reader`, `shop`, `solomade`, `sopraknight`, `spell`, `star`, `terminal`, `textcast`, `tool`, `water`, `word`, `writer` 등. 완성도에 따라 허브 노출 여부를 검토할 필요가 있습니다.

### 품질 관점 분석 요약

- **접근성**: `viewport`에 `user-scalable=no`/`maximum-scale=1.0`으로 확대/축소 차단, 6~9px의 매우 작은 폰트 다수, 캔버스 게임 콘텐츠에 대체 텍스트 없음, HP/MP 게이지에 `role="progressbar"` 등 ARIA 부재, `prefers-reduced-motion` 미대응
- **SEO/메타태그**: `<meta name="description">`, Open Graph/Twitter Card, `<link rel="canonical">`, favicon 전부 부재. `<title>`이 허브 전체가 아닌 첫 미니게임("8-BIT Eternal Invasion") 기준으로만 작성됨
- **반응형/모바일**: 미디어쿼리 1개로 대응하나 확대/축소 차단은 오히려 접근성·모바일 UX를 저해. 폰트 크기가 모바일에서 더 축소되어(6px) 가독성 저하
- **성능**: 인라인 CSS/JS라 별도 캐싱 불가(철학상 트레이드오프), 배경 유튜브 영상 자동재생으로 모바일 데이터/배터리 소모, 탭이 백그라운드로 가도 `requestAnimationFrame` 루프가 계속 실행되어 불필요한 연산 지속
- **코드 구조**: 단일 파일 철학에는 부합하나, `<header>`/`<main>` 같은 시맨틱 랜드마크 태그 대신 `<div>` 사용, JS 코드 내 한글 주석 일부가 인코딩 깨짐(mojibake) 상태로 저장되어 있음 (예: 439번째 줄 `?쒕꽕?쒖뒪 踰꾩뒪??諛쒖궗 濡쒖쭅 蹂듦뎄`)
- **UX**: 잠긴 모듈 버튼이 `href="#"`로 남아 있어 클릭 시 페이지 최상단으로 스크롤/포커스 이동 가능, 외부 링크(`target="_blank"`)에 `rel="noopener noreferrer"` 누락으로 리버스 탭내빙 위험

## 개선 사항 (Improvements)

`index.html` 분석에서 확인된 구체적 개선 제안입니다. 각 항목은 실제 코드에서 확인된 문제만 다룹니다.

1. **메타 설명/OG 태그 누락** — `<head>`에 `<meta name="description">`, `og:title`, `og:description`, `og:image`, `twitter:card` 등이 전혀 없습니다. 검색엔진 노출 및 SNS/메신저 공유 시 미리보기가 제대로 표시되지 않으므로 추가가 필요합니다.
2. **favicon 부재** — `<link rel="icon" ...>`가 없어 브라우저 탭에 기본 아이콘만 표시됩니다. 픽셀아트 컨셉에 맞는 파비콘(`.ico`/`.png`)을 추가하세요.
3. **확대/축소 차단 (접근성 위반)** — `<meta name="viewport" content="... maximum-scale=1.0, user-scalable=no">`는 저시력 사용자의 핀치 줌을 막아 WCAG 1.4.4(Resize Text) 기준에 위배됩니다. `user-scalable=no`와 `maximum-scale=1.0`을 제거하거나 최소 `maximum-scale=5` 수준으로 완화하세요.
4. **지나치게 작은 폰트 크기** — `.brand-sub`(6px), `.bar-label`(6px), `.link-btn`(6px), 모바일 미디어쿼리의 `.module-btn`(6px) 등 6~9px 폰트가 다수 존재합니다. 픽셀 폰트 특성을 고려해도 최소 10~11px 이상으로 올려 가독성을 확보하세요.
5. **외부 링크에 `rel="noopener noreferrer"` 누락** — `brand-links`의 YouTube/GitHub 링크와 `mountFallbackVideoIframe`이 생성하는 iframe 등 `target="_blank"`를 쓰는 요소에 `rel="noopener noreferrer"`가 없어 리버스 탭내빙(reverse tabnabbing) 위험이 있습니다. 모든 `target="_blank"` 앵커에 추가하세요.
6. **잠긴 모듈 버튼의 `href="#"` 처리 미흡** — `renderModules()`에서 잠긴 모듈은 `btn.href = '#'`로만 설정되고 클릭 이벤트를 막지 않아, 클릭 시 페이지 스크롤 점프가 발생할 수 있습니다. `<a>` 대신 `<button disabled aria-disabled="true">`를 쓰거나 `e.preventDefault()`와 `tabindex="-1"`을 추가하세요.
7. **ARIA/시맨틱 마크업 부재** — HP/MP 게이지(`.bar-fill`)에 `role="progressbar"`, `aria-valuenow/min/max`가 없고, 브랜드 헤더는 `<header>` 대신 `<div id="brand-header">`, 전체 UI는 `<main>` 랜드마크 없이 `<div id="ui-layer">`로만 감싸여 있습니다. 스크린리더 사용자를 위해 시맨틱 태그와 ARIA 속성을 보강하세요.
8. **`prefers-reduced-motion` 미대응** — `@keyframes blink`, `fadeInUp`과 캔버스 파티클/애니메이션이 사용자의 "모션 줄이기" 설정과 무관하게 항상 실행됩니다. `@media (prefers-reduced-motion: reduce)`로 애니메이션 강도를 낮추는 처리를 추가하세요.
9. **탭 비활성 시에도 게임 루프 계속 실행** — `gameLoop`이 `requestAnimationFrame`만으로 반복되며 `document.visibilitychange`를 확인하지 않아, 배경 탭 상태에서도 스폰/이동/충돌 연산이 계속 소모됩니다. 탭이 숨겨지면 `state.active`를 일시 정지하도록 개선하세요.
10. **JS 주석 인코딩 깨짐(mojibake)** — 439번째 줄과 606번째 줄 부근의 한글 주석이 `?쒕꽕?쒖뒪 踰꾩뒪??諛쒖궗 濡쒖쭅 蹂듦뎄`처럼 깨진 상태로 저장되어 있습니다. UTF-8로 다시 저장해 정상 한글 주석으로 복구하세요.
11. **`<title>`이 허브 전체를 대표하지 못함** — 현재 `<title>`은 "BUNT GAMES | 8-BIT Eternal Invasion"으로, 이 페이지가 24개 모듈을 포괄하는 허브임에도 첫 미니게임 이름만 노출합니다. "BUNT GAMES | Retro Arcade Hub" 등 허브 성격을 드러내는 제목으로 조정을 검토하세요.
12. **`CONFIG.MODULES`와 실제 폴더 간 불일치** — `UNITY`, `WAVE`, `PLAYLIST`, `HOUSE`, `BOOK` 라벨은 이 저장소에 대응하는 폴더가 없고, 반대로 `album`, `clinic`, `city`, `star`, `terminal` 등 다수 폴더는 `MODULES`에 전혀 등록되지 않아 허브에서 접근할 수 없습니다. 로컬 개발/테스트 시 혼란을 줄이려면 목록을 동기화하거나 주석으로 상태(완료/예정/비공개)를 표시하세요.
13. **Google Fonts 로딩에 `preconnect` 미사용** — `<link href="https://fonts.googleapis.com/...">`만 있고 `rel="preconnect"`가 없어 폰트 로딩이 지연될 수 있습니다. `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`을 추가하면 초기 렌더링이 개선됩니다.
14. **캔버스 게임 콘텐츠의 대체 텍스트 부재** — `#gameCanvas`는 시각적으로만 정보를 전달하며 `aria-label`이나 대체 설명이 없습니다. 스크린리더 사용자를 위한 최소한의 설명(예: 배경 장식 요소이며 상호작용은 하단 버튼으로 가능하다는 안내)을 `aria-hidden`/`aria-label` 조합으로 보강하는 것을 고려하세요.

## 성능·비주얼 개선 계획 (Performance & Visual, 2026-07-10)

이번 패스는 **성능과 비주얼 이슈만** 다룹니다. 접근성/SEO/시맨틱/보안(위 "개선 사항" 1~8, 11~14번)은 이번 범위 밖이며 손대지 않습니다. 게임 규칙·밸런스·기능은 변경하지 않습니다. 아래 항목은 실제 `index.html` 코드에서 확인된 성능·렌더링 문제만 다룹니다.

### P1 — 성능 (Performance)

1. **적 분리 로직이 O(n²)** — `update()`의 적 분리(`ENEMY_SEPARATION`) 루프(약 337~348번 줄)가 매 프레임 모든 적 쌍에 대해 `Math.hypot`를 계산합니다. 스폰 간격이 시간·레벨에 따라 `SPAWN_INTERVAL_MIN`(200ms)까지 줄어들어 화면의 적 수가 늘어나면 프레임당 연산이 제곱으로 폭증해 프레임 드랍이 발생합니다. 공간 분할(그리드/버킷 해시)로 인접 적만 검사하거나, 분리 검사 대상 수를 제한해 근사하세요. **분리 동작(밀어내는 결과)은 시각적으로 동일하게 유지**하고 계산량만 줄여야 합니다.
2. **백그라운드 탭에서도 게임 루프 전체 실행** — `gameLoop`이 `requestAnimationFrame`만으로 반복되고 `state.active`는 게임오버 때만 false가 됩니다. 탭이 숨겨져도 스폰·이동·충돌·파티클 연산이 계속되어 CPU/배터리를 낭비합니다. `document.visibilitychange`로 탭이 숨겨지면 업데이트를 일시정지하고, 복귀 시 `lastSpawnTime`/타이머 기준시각을 보정해 복귀 직후 폭발적 스폰이 없도록 하세요. (배경 유튜브 영상 정책과 무관하게 캔버스 시뮬레이션만 제어)
3. **`updateHUD()` 과다 호출 + DOM 재조회** — `updateHUD()`가 적 충돌 루프 내부(약 353번 줄)에서 충돌 중인 적마다·매 프레임 호출되고, 매 호출마다 `document.getElementById`를 6회 수행합니다(HP/EXP/score/level/tickets/aoe 버튼). DOM 레이아웃 스래싱의 원인입니다. HUD 요소 참조를 최초 1회 캐싱하고, HUD 갱신은 프레임당 최대 1회(또는 값이 바뀔 때만)로 합치세요.
4. **DOM 요소 반복 조회 전반** — `updateHUD`, `showToast`, `renderModules`, `gameOver`, `toggleSound` 등에서 `getElementById`를 반복 호출합니다. 자주 접근하는 정적 요소 참조를 모듈 상단에서 한 번만 캐싱하세요.
5. **프레임마다 `ctx.shadowBlur` 남용** — 적(skeleton/mummy/pumpkin)·영웅·요정 렌더가 매 프레임 다수의 `ctx.shadowBlur` glow를 그립니다. `shadowBlur`는 캔버스에서 가장 비싼 연산 중 하나라, 적이 많아지면 렌더 비용이 급증합니다. glow를 영웅·요정 등 소수 대상으로 제한하거나 적의 glow는 생략/약화하고, 화면상 적 개수가 임계치를 넘으면 glow를 자동으로 끄는 식으로 가드하세요. **평상시 비주얼 톤은 최대한 유지**합니다.

### P2 — 비주얼 (Visual)

6. **HiDPI(레티나) 미대응** — `resize()`가 백킹 스토어를 CSS 픽셀(`window.innerWidth/Height`)로만 설정해, 고해상도 디스플레이에서 범위 표시 원(1px arc), 파티클, 발사체가 흐릿하게 렌더됩니다. `devicePixelRatio`(상한 ~2)로 백킹 스토어를 확대하고 `ctx.setTransform`으로 스케일하되, 모든 게임 좌표 연산은 논리(CSS) 픽셀 기준으로 유지하세요. 픽셀아트는 `image-rendering: pixelated`가 이미 있어 선명함이 유지됩니다.
7. **프레임레이트 종속 애니메이션(고주사율에서 2.4배 빠름)** — `playerPos.anim += 0.04`, 적 이동(`e.x += vx`), 발사체·파티클 이동, 쿨다운(`shootCd`, `f.cd`) 등이 모두 `requestAnimationFrame` 틱 단위로 진행됩니다. 120/144Hz 화면에서는 애니메이션과 이동이 60fps 대비 2~2.4배 빠르게 재생되어 부자연스럽습니다. 클램프한 delta(예: 3프레임 상한)를 계산해 이동·애니메이션·쿨다운을 `dt*60` 기준으로 스케일, 어떤 주사율에서도 60fps 튜닝과 동일한 속도로 보이게 하세요. *주의: 이 변경은 렌더 타이밍 정규화가 목적이며 적 속도·스폰 규칙 등 게임 밸런스 수치 자체는 바꾸지 않습니다(현재 60fps 기준 동작을 기준값으로 보존).*
8. **소스 한글 주석 인코딩 깨짐(mojibake)** — 약 437·606번 줄 등의 한글 주석이 `?쒕꽕?쒖뒪 踰꾩뒪??`처럼 깨져 저장돼 있습니다. 정상 UTF-8 한글(또는 영문)으로 복구하세요. 런타임 영향은 없으나 파일 가독성을 해칩니다. (위 개선 사항 10번과 동일)

### 비범위 (Out of scope, 이번 패스에서 손대지 않음)

- 접근성(줌 차단 해제, 폰트 크기, ARIA, `prefers-reduced-motion`), SEO/OG/파비콘, 시맨틱 태그, 외부 링크 `rel`, 잠긴 모듈 `href="#"`, `CONFIG.MODULES`↔폴더 동기화 등은 별도 패스에서 처리합니다.
- 게임 규칙·밸런스·신규 기능·레이아웃 재설계.
- 단일 파일/인라인 철학은 유지(프레임워크·빌드 도입 금지).

## Hub Menu Order

`index.html`의 `CONFIG.MODULES` 기준 실제 해금 순서(레벨 1~24):

1. ONE
2. CLOCK
3. UNITY *(로컬 폴더 없음)*
4. TANK
5. CABLE
6. QUIZ
7. ROGUE
8. WORLD
9. PILOT
10. PUZZLE
11. OCEAN
12. BIRD
13. PIZZA
14. BOMB
15. DRONE
16. HACK
17. COWBOY
18. ZONE
19. PANDEMIC
20. SPACE
21. WAVE *(로컬 폴더 없음)*
22. PLAYLIST *(로컬 폴더 없음)*
23. HOUSE *(로컬 폴더 없음)*
24. BOOK *(로컬 폴더 없음)*

참고: 모듈 버튼은 상대경로가 아닌 `https://kitscript.com/game/<label>` 절대경로로 연결되므로, 로컬에서 허브를 열어도 클릭 시 라이브 사이트로 이동합니다.

## Project Structure

- Root hub: `/index.html`
- Local mini games (허브에 등록된 폴더): `/bird`, `/bomb`, `/cable`, `/clock`, `/cowboy`, `/drone`, `/hack`, `/ocean`, `/one`, `/pandemic`, `/pilot`, `/pizza`, `/puzzle`, `/quiz`, `/rogue`, `/space`, `/tank`, `/world`, `/zone`
- Local projects not yet linked from the hub: `/album`, `/avatar`, `/bizcard`, `/city`, `/clinic`, `/clip`, `/clipcut`, `/home`, `/invasion`, `/metaball`, `/model`, `/motion`, `/oxpizza`, `/pickme`, `/reader`, `/shop`, `/solomade`, `/sopraknight`, `/spell`, `/star`, `/terminal`, `/textcast`, `/tool`, `/water`, `/word`, `/writer`

## Run Locally

정적 파일만으로 동작합니다. 아래 중 하나를 사용하세요.

1. 브라우저에서 각 `index.html` 직접 열기
2. 간단한 로컬 서버 실행 후 접속

예시(Python):

```bash
python -m http.server 8080
```

그 뒤 `http://localhost:8080/` 접속

참고: YouTube 배경 영상은 `file://`로 열면 브라우저 정책 때문에 차단(오류 153)될 수 있으므로 로컬 서버 실행을 권장합니다.

## Design/Implementation Notes

- 대부분 Canvas + WebAudio 기반
- 게임 오버 후 자동 재시작 UX(대체로 7초 카운트다운) 사용
- 터치/키보드 입력을 함께 고려한 아케이드 스타일 구성
- 루트 허브(`index.html`)는 CSS/JS 전부 인라인, 외부 의존은 Google Fonts와 YouTube IFrame API뿐

## Contribution Guideline

- 단일 파일 실행성을 우선하되, 필요 시 에셋 번들 모드를 허용
- 외부 링크는 가능하면 `https` 사용
- 새 게임 추가 시 폴더 단위로 독립 실행 가능하게 구성

## License

별도 라이선스 파일이 없다면 기본적으로 All Rights Reserved로 간주됩니다.
필요 시 `LICENSE` 파일을 추가해 정책을 명시하세요.
