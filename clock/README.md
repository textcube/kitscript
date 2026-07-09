# clock — Eternal Invasion: Clock Edition (시계 디펜스)

`clock/index.html`은 화면 중앙의 **아날로그 시계**가 자동 포탑이 되어 사방에서 중심으로 몰려드는 UFO를 요격하는 **오토배틀러/타워디펜스** 미니게임입니다. 플레이어는 "CORE ENERGY(마나)"를 모아 **ENGAGE** 버튼으로 특수기를 발동하며, 이때 발동되는 능력은 **초침이 가리키는 현재 시간 슬롯**(5초 = 1슬롯)에 배정된 능력으로 결정됩니다.

- 파일: [`index.html`](index.html) (약 791줄)
- 허브 등록: 루트 `index.html`의 `CONFIG.MODULES` 레벨 2 `CLOCK` ✅ (로컬 폴더 존재)
- 외부 프레임워크·빌드 없이 `<style>`/`<script>` 인라인만으로 구성된 순수 정적 HTML 한 장. 외부 의존은 Google Fonts(Orbitron)와 배경 YouTube iframe뿐

## 개요 (게임 규칙)

- 12개 시간 슬롯 각각에 매 판 시작 시 4종 능력(`LASER`/`SHIELD`/`BURST`/`SLOW`) 중 하나가 **랜덤 배정**([`randomizeSlots`](index.html:325))
- 중앙 시계는 사거리(`clockRadius * 1.25`) 안에서 **가장 가까운 UFO를 자동 조준·자동 사격**([`update`](index.html:560))
- 플레이어가 `ENGAGE`(50 MP)를 누르면 현재 초침 슬롯의 능력이 발동. 마나가 70 이상이면 낮은 확률로 **자동 특수기**도 발동([`update`](index.html:574))
- UFO가 중심에 닿으면 체력 감소, 0이 되면 게임오버 → 7초 카운트다운 후 자동 리셋([`endGame`](index.html:765)/[`resetGame`](index.html:782))
- 관전형(attract) 정체성: 아무 조작 없이도 자동 사격만으로 게임이 굴러가고, 특수기 발동만 저밀도로 개입하는 구조

### 구조 개요

| 영역 | 설명 |
| --- | --- |
| `#video-background` | `youtube.com/embed`로 배경 영상(`kFnxuOnbHU0`) 음소거 자동재생 (루트/tool과 달리 `youtube-nocookie` 미사용) |
| `#gameCanvas` | 시계·UFO·탄환·파티클·능력 이펙트를 매 프레임 렌더하는 캔버스 |
| `.overlay > .top-ui` | 타이틀, THREAT LEVEL 표시, WEBSITE/YOUTUBE 링크, AUDIO 토글 |
| `.overlay > .bottom-ui` | CORE ENERGY 마나바 + 원형 `ENGAGE` 버튼(비용 50 MP) |
| `#game-over` | CRITICAL FAILURE 오버레이 + 7초 재부팅 카운트다운 |
| `ABILITY_TYPES` / `CONFIG` | 4종 능력 정의와 마나/스폰/전투/난이도 튜닝 상수 |

## 품질 관점 분석 요약

- **프레임레이트 종속(가장 큰 문제)**: 업데이트 루프가 [`requestAnimationFrame`](index.html:762) 틱 단위로 delta time 없이 진행됩니다. UFO/탄환 이동, `rotation += 0.04`, 능력 타이머 `ab.timer--`, `BURST` 반경 `+= 24`, `secondHandVisible--`, 마나 재생 `regen/60`, 그리고 **스폰 확률 `Math.random() < rate`가 매 프레임 판정**됩니다. 결과적으로 120/144Hz 화면에서는 게임 속도와 스폰량이 60Hz 대비 약 2~2.4배로 폭증합니다. (최근 커밋들의 "framerate scaling" 수정과 동일 계열 문제)
- **HiDPI(레티나) 미대응**: [`resize()`](index.html:487)가 백킹 스토어를 CSS 픽셀로만 설정해 고해상도 디스플레이에서 시계 원/사거리 원/파티클/텍스트가 흐릿하게 렌더됩니다
- **매 프레임 DOM 쓰기**: [`spawnUFO()`](index.html:538)가 THREAT LEVEL 텍스트/색을 매 프레임 갱신하고, [`update()`](index.html:545)가 마나바 `width`와 `fireBtn.disabled`를 매 프레임 기록 → 값이 안 바뀌어도 레이아웃/스타일 재계산
- **캔버스 비용**: `ctx.shadowBlur`를 [UFO 렌더](index.html:412)·[HUD 원](index.html:672)에서 사용. UFO가 많아지면 glow 비용 증가(캔버스에서 가장 비싼 연산 중 하나)
- **작은 버그**: `SHIELD`/`SLOW` 능력이 [`Sound.play('shield')`](index.html:510)를 호출하지만 [`Sound.play`](index.html:337)에는 `'shield'` 케이스가 없어 **무음**(죽은 호출). 배경 영상이 `youtube.com`(비-nocookie)라 저장소 나머지와 프라이버시 정책 불일치
- **보안**: WEBSITE/YOUTUBE [외부 링크](index.html:257) 2개에 `rel="noopener noreferrer"` 누락 → 리버스 탭내빙 위험
- **접근성**: 전역 `* { user-select: none }`, 캔버스에 `aria-label` 부재, `prefers-reduced-motion` 미대응(글리치 애니메이션 + 캔버스 모션 + 배경 영상). 뷰포트 확대/축소는 허용됨(양호)
- **SEO/메타**: `<meta name="description">`, Open Graph/Twitter Card, favicon 전부 부재. 폰트를 `<style>` 내 [`@import`](index.html:16)로 로드해 렌더 블로킹 + `preconnect` 없음

## 개선 사항 (Improvements)

실제 `index.html` 코드에서 확인된 문제만, 우선순위 순으로 다룹니다.

### A. 성능 · 타이밍 (게임 체감에 직접 영향)

1. **프레임레이트 독립화(delta time)** — 상한을 둔 delta(예: 3프레임 상한)를 계산해 이동·회전·능력 타이머·`BURST` 반경·`secondHandVisible`·마나 재생을 `dt*60` 기준으로 스케일하세요. **스폰은 확률 판정을 시간 기반으로 전환**(예: 프레임 확률을 `rate * dtFactor`로 보정하거나 누적 시간 기반 스폰)해 어떤 주사율에서도 60fps 튜닝과 동일한 난이도·속도로 보이게 합니다. *목적은 렌더 타이밍 정규화이며 `CONFIG`의 밸런스 수치(스폰율/속도/비용/재생) 자체는 60fps 기준값으로 보존합니다.*
2. **HiDPI 대응** — `resize()`에서 `devicePixelRatio`(상한 ~2)로 백킹 스토어를 확대하고 `ctx.setTransform`으로 스케일하되, 모든 게임 좌표 연산은 논리(CSS) 픽셀 기준을 유지하세요.
3. **매 프레임 DOM 쓰기 제거** — THREAT LEVEL은 텍스트가 바뀔 때만, 마나바 `width`와 `fireBtn.disabled`는 값이 바뀔 때만 갱신하도록 마지막 값을 캐싱해 비교 후 기록하세요.
4. **`shadowBlur` 가드** — 화면상 UFO 수가 임계치를 넘으면 UFO glow를 자동으로 끄거나 약화해 렌더 비용 급증을 막으세요. **평상시 비주얼 톤은 최대한 유지**합니다.

### B. 버그 · 정합성

5. **죽은 사운드 호출** — `SHIELD`/`SLOW`가 `Sound.play('shield')`를 부르지만 해당 케이스가 없습니다. `Sound.play`에 `shield`(및 원하면 `slow`) 사운드를 추가하거나, 아니면 존재하는 타입으로 교체해 의도를 명확히 하세요.
6. **배경 영상 프라이버시 일관성** — 저장소 나머지(루트/tool)와 맞춰 `youtube.com/embed`를 `youtube-nocookie.com/embed`로 변경을 검토하세요(동작 동일, 추적 쿠키 감소).

### C. 보안

7. **`target="_blank"`에 `rel="noopener noreferrer"`** — WEBSITE/YOUTUBE 앵커 2개에 추가하세요.

### D. 접근성

8. **`prefers-reduced-motion` 대응** — `@media (prefers-reduced-motion: reduce)`로 `.glitch-text` 애니메이션을 정지/약화하세요. (캔버스 게임 모션 자체는 게임 본질이므로 최소한 CSS 글리치와 전환만 대상)
9. **캔버스 대체 설명** — `#gameCanvas`에 `aria-label`(예: "시계 디펜스 게임 화면, 조작은 하단 ENGAGE 버튼")을 부여하고, AUDIO 토글에 `aria-pressed`를 반영하세요.
10. **`user-select` 범위 축소** — 전역 `none` 대신 필요한 UI에만 적용해 텍스트 선택을 과도하게 막지 마세요.

### E. 메타 · 로딩

11. **메타/OG/파비콘 추가** — `<head>`에 `description`, `og:*`, `twitter:card`, favicon(인라인 SVG data-URI 권장, 신규 파일 불필요)을 추가하세요.
12. **폰트 로딩 개선** — `<style>` 내 `@import` 대신 `<head>`에 `<link rel="preconnect">`(`fonts.googleapis.com`, `fonts.gstatic.com` `crossorigin`) + `<link rel="stylesheet">`로 폰트를 로드해 렌더 블로킹을 줄이세요.

## 개선 작업 계획 (Sonnet 5 실행 범위)

`clock/index.html`만 수정하며 **단일 파일/인라인 철학을 유지**합니다. 게임 규칙·밸런스·능력 종류·시계 UI 레이아웃·관전형 정체성은 **변경하지 않습니다**. 순서:

1. **A. 성능·타이밍** (1~4): delta time 정규화(밸런스 수치 보존), HiDPI, 매 프레임 DOM 쓰기 제거, `shadowBlur` 가드
2. **B. 버그** (5~6): 죽은 사운드 케이스 처리, 배경 영상 `youtube-nocookie` 전환
3. **C. 보안** (7): 외부 링크 `rel`
4. **D. 접근성** (8~10): `prefers-reduced-motion`, 캔버스 `aria-label`/`aria-pressed`, `user-select` 범위 축소
5. **E. 메타·로딩** (11~12): description/OG/favicon, 폰트 `@import`→`link`+`preconnect`

### 비범위 (Out of scope)

- 게임 밸런스 수치 조정, 신규 능력/기능, 시계 UI·레이아웃 재설계
- 관전형 자동 사격 구조, 클록 기반 능력 선택(초→슬롯) 게임성 자체
- 프레임워크·빌드 도입(인라인 단일 파일 유지), 배경 영상 자동재생 정책 자체
