# invasion — Eternal Invasion (RED vs BLUE 백병전 시뮬레이션)

`invasion/index.html`은 조작 없이 스스로 굴러가는 **관전형(attract) 오토배틀 시뮬레이션**입니다. `RED`/`BLUE` 두 진영이 9개 레인에서 무한히 스폰되어 근접(`MELEE`)·원거리(`RANGED`) 유닛으로 서로를 소멸시키는 **FSM(MOVE/ATTACK/DEAD) 백병전**이 끝없이 이어집니다(`INFINITE_WAR`). 플레이어의 유일한 개입은 상단 바의 `END WAR`(현재 생존 수로 승부 판정), `SOUND`(절차적 신스 BGM 토글), `SYSTEM INFO` 패널, `AGAIN`(리셋)뿐입니다.

- 파일: [`index.html`](index.html) (약 643줄)
- 외부 프레임워크·빌드·이미지 자산 없이 `<style>`/`<script>` 인라인만으로 구성된 순수 정적 HTML 한 장. **네트워크 의존 0** — BGM/효과음은 `AudioContext` 기반 절차적 신스([`AudioEngine`](index.html:181)), 스프라이트는 런타임 [`preRenderSprites`](index.html:429)로 오프스크린 캔버스에 그림
- **허브 관계**: 루트 [`index.html`](../index.html)은 브랜드 서브타이틀이 `ETERNAL INVASION`([../index.html:128](../index.html:128))으로, 이 시뮬레이션이 저장소 전체의 세계관 모티프입니다. 다만 `invasion/`은 **독립 실행 시뮬레이션**이며 루트 `CONFIG.MODULES` 목록에는 등재되어 있지 않습니다(레벨 게이트 밖의 원형 데모 성격).

## 개요 (시뮬레이션 규칙)

- 매 `SPAWN_INTERVAL`(400ms)마다 레인별 정원(`MAX_MINIONS_PER_TEAM/LANE_COUNT` 올림)에 여유가 있으면 두 진영이 각 레인에 유닛 스폰([`spawn`](index.html:603)). 유닛 종류는 70% 근접 / 30% 원거리
- 각 유닛은 같은 레인의 적 중 **가장 HP가 낮은 대상(동률이면 더 가까운 쪽)을 조준**([`Minion.update`](index.html:521)) → 사거리 진입 시 쿨다운마다 공격. 근접은 즉시 타격 + 런지, 원거리는 [`Projectile`](index.html:469) 발사
- 공격 직후 `attackDuration` 동안 `isRooted`(제자리 고정)로 리듬을 만들고, [`applySeparation`](index.html:506)으로 뭉침을 방지
- HP 0이면 `DEAD` → 파티클 이펙트([`createHitEffect`](index.html:423)) 후 다음 프레임 필터링으로 제거. 승부는 오직 `END WAR` 시점의 생존 수로 판정([`endWar`](index.html:356))
- 관전형(attract) 정체성: 입력 없이도 전투가 무한히 자율 진행되고, 사용자는 사운드·정보·종료만 저밀도로 토글

### 구조 개요

| 영역 | 설명 |
| --- | --- |
| `.controls` | SYSTEM INFO / SOUND / END WAR 토글, 타이틀, ENTITIES·FPS 카운터, YT 링크 |
| `#gameCanvas` | 레인 라인·유닛·투사체·파티클·HP바를 매 프레임 렌더 |
| `#uiPanel` | 부팅 로그풍 시스템 정보 패널(슬라이드 인) |
| `#resultOverlay` | END WAR 후 승자/생존 수 + `AGAIN` 재시작 |
| `AudioEngine` | `AudioContext` 절차적 킥/베이스 스케줄러 + 챔프/레이저/히트 효과음 |
| `CONFIG` / `UNIT_TYPES` / `TEAMS` | 스폰·레인·분리력·투사체 상수와 유닛별(HP/사거리/속도/데미지/쿨다운) 튜닝 |

## 품질 관점 분석 요약

실제 코드에서 확인된 항목만 정리합니다. 가장 큰 문제는 **프레임레이트 종속**입니다.

### 성능 · 타이밍 (체감에 직접 영향)

- **프레임레이트 종속(가장 큰 문제)**: [`update`](index.html:613)가 `dt`를 계산하지만 **이동 로직은 `dt`로 스케일하지 않습니다.** [`Minion.update`](index.html:546)의 `this.x += this.facingDir * this.stats.speed`, 추격 이동, [`applySeparation`](index.html:516) 밀어내기, [`Projectile`](index.html:484) 속도, [`Particle.update`](index.html:416)의 `this.life -= 0.05`·속도, `lungeOffset *= 0.85`, 애니메이션이 전부 **프레임당 고정 증분**입니다. 반면 **스폰은 `spawnTimer += dt`로 시간 기반**([index.html:616](index.html:616))이고 공격 쿨다운도 `currentTime` 타임스탬프 기반입니다. 결과적으로 144Hz 화면에서는 유닛이 60Hz 대비 약 2.4배 빠르게 이동하는데 스폰·공격 간격은 그대로라, **주사율에 따라 "이동 대 전투/스폰"의 밸런스 자체가 달라집니다.**
- **`dt` 상한 부재**: 첫 프레임(`lastTime=0`)과 백그라운드 탭 복귀 시 `dt`가 수천 ms로 튀어 `spawnTimer`가 즉시 임계값을 넘고 FPS 표시가 왜곡됩니다.
- **HiDPI(레티나) 미대응**: [`resize`](index.html:459)가 백킹 스토어를 CSS 픽셀로만 설정하고 `image-rendering: pixelated`([index.html:24](index.html:24))가 걸려 있어, 고해상도 디스플레이에서 원거리 유닛(픽셀 스프라이트)을 제외한 원·라인·HP바·파티클이 흐릿하게 렌더됩니다.
- **매 프레임 캔버스 필터**: 피격 시 `ctx.filter = 'brightness(5) contrast(2)'`([index.html:587](index.html:587))는 캔버스에서 비싼 연산으로, 다수 유닛이 동시에 깜빡이면 부하가 급증합니다.
- **매 프레임 DOM 쓰기**: ENTITIES/FPS 카운터를 값 변화와 무관하게 매 프레임 `innerText`로 기록([index.html:624](index.html:624)~625).

### 버그 · 정합성

- **선언했지만 로드되지 않은 폰트**: `body`가 `font-family: 'Pretendard'`([index.html:13](index.html:13))를 지정하지만 어디에서도 로드하지 않아 조용히 시스템 sans-serif로 폴백됩니다.
- **사운드 패널 텍스트 1회성 치환**: SOUND 토글이 `uiPanel.innerHTML.replace('STANDBY ...', 'TENSION_LOOP_ACTIVE')`([index.html:385](index.html:385))로 문자열을 바꾸는데, 껐다 켜면 이미 치환된 상태라 무반응입니다(경미한 표시 불일치).
- **죽은 코드**: `AudioEngine.isMuted`([index.html:186](index.html:186)) 필드가 선언만 되고 사용되지 않습니다(`toggleMute`는 `ctx.suspend/resume`로 동작).
- **리사이즈 시 유닛 재배치 없음**: [`resize`](index.html:459)가 레인 Y만 재계산하고 기존 유닛의 y/laneY는 갱신하지 않아, 창을 크게 줄이면 유닛이 새 레인 위치와 어긋난 채 스냅됩니다(치명적이지 않음).

### 보안

- **`target="_blank"`에 `rel` 누락**: YT [외부 링크](index.html:159)에 `rel="noopener noreferrer"`가 없어 리버스 탭내빙 위험.

### 접근성

- **`prefers-reduced-motion` 미대응**: 상시 캔버스 모션 + 절차적 오디오 + 패널 슬라이드 전환.
- **캔버스 대체 설명 부재**: `#gameCanvas`에 `aria-label`이 없고, 토글 버튼들(SOUND/INFO)에 `aria-pressed`가 반영되지 않습니다.
- **결과 오버레이 포커스 관리 없음**: `#resultOverlay`가 뜰 때 `AGAIN` 버튼으로 포커스를 옮기지 않습니다.

### 메타 · 로딩

- **메타/OG/파비콘 전무**: `<meta name="description">`, Open Graph/Twitter Card, favicon 부재.

## 개선 사항 (Improvements)

우선순위 순. **실제 코드에서 확인된 문제만** 다룹니다.

### A. 성능 · 타이밍 (체감에 직접 영향)

1. **프레임레이트 독립화(delta time)** — `dtFactor = dt / (1000/60)`를 계산해(상한 예: 3프레임) **이동 속도·추격·분리 밀어내기·투사체 속도·파티클 속도와 수명(`life -= 0.05 * dtFactor`)·`lungeOffset` 감쇠·애니메이션 위상**을 `dtFactor`로 스케일하세요. **스폰(`spawnTimer += dt`)과 쿨다운(`currentTime` 기반)은 이미 시간 기반이므로 그대로 두고**, `CONFIG`의 밸런스 수치(속도/데미지/쿨다운/스폰 간격)는 60fps 기준값으로 **보존**합니다. 목적은 렌더 타이밍 정규화입니다.
2. **`dt` 상한 클램프** — `dt`를 예: `Math.min(dt, 50)`로 제한해 첫 프레임/백그라운드 복귀 시 스폰·이동·FPS 표시가 튀지 않게 하세요.
3. **HiDPI 대응** — `resize`에서 `devicePixelRatio`(상한 ~2)로 백킹 스토어를 확대하고 `ctx.setTransform`으로 스케일하되, 모든 시뮬레이션 좌표는 논리(CSS) 픽셀 기준을 유지하세요. (픽셀 스프라이트의 의도적 도트 룩과 충돌하지 않도록 스프라이트 스케일만 확인)
4. **피격 필터 대체** — `ctx.filter` 대신 흰색 오버레이 도형/`globalCompositeOperation` 또는 팀색 밝기 보정으로 hitFlash를 표현해 다수 동시 피격 시 비용을 낮추세요(비주얼 톤 유지).
5. **매 프레임 DOM 쓰기 최소화** — ENTITIES/FPS는 값이 바뀔 때만(또는 FPS는 ~4프레임/초 주기로) 갱신하도록 마지막 값을 캐싱하세요.

### B. 버그 · 정합성

6. **미로드 폰트 처리** — `'Pretendard'`를 실제 로드하거나(권장: 시스템 폰트 스택으로 교체해 네트워크 의존 0 유지) 선언에서 제거해 조용한 폴백을 없애세요.
7. **사운드 패널 텍스트 상태화** — 문자열 `replace` 대신 대상 라인을 별도 요소/`textContent`로 관리해 ON/OFF 토글마다 정확히 반영하세요.
8. **죽은 코드 정리** — 사용되지 않는 `AudioEngine.isMuted`를 제거하거나 실제 뮤트 상태로 활용하세요.
9. **리사이즈 시 유닛 레인 재동기화** — `resize`에서 기존 유닛의 `laneY`를 새 레인 배열로 갱신(그리고 x를 캔버스 폭에 맞춰 클램프)하세요.

### C. 보안

10. **외부 링크 `rel`** — YT 앵커에 `rel="noopener noreferrer"` 추가.

### D. 접근성

11. **`prefers-reduced-motion` 대응** — `@media (prefers-reduced-motion: reduce)`로 패널/버튼 전환 애니메이션을 정지/약화하세요(캔버스 시뮬레이션 모션 자체는 본질이므로 CSS 전환만 대상).
12. **ARIA 보강** — `#gameCanvas`에 `aria-label`(예: "RED vs BLUE 자동 전투 시뮬레이션 화면"), SOUND/INFO 토글에 `aria-pressed`, 결과 오버레이 표시 시 `AGAIN`으로 포커스 이동을 추가하세요.

### E. 메타 · 로딩

13. **메타/OG/파비콘 추가** — `<head>`에 `description`, `og:*`, `twitter:card`, favicon(인라인 SVG data-URI 권장, 신규 파일 불필요)을 추가하세요.

## 개선 작업 계획 (Sonnet 5 실행 범위)

`invasion/index.html`만 수정하며 **단일 파일 / 인라인 / 무빌드 / 네트워크 의존 0 철학과 관전형(attract) 정체성을 유지**합니다. 게임 규칙·밸런스·유닛 종류·레인 구조·RED vs BLUE 세계관은 **변경하지 않습니다**. 순서:

1. **A. 성능·타이밍** (1~5): delta time 정규화(밸런스 수치 보존), `dt` 클램프, HiDPI, 피격 필터 대체, 매 프레임 DOM 쓰기 최소화
2. **B. 버그** (6~9): 미로드 폰트, 사운드 패널 텍스트 상태화, 죽은 코드, 리사이즈 재동기화
3. **C. 보안** (10): 외부 링크 `rel`
4. **D. 접근성** (11~12): `prefers-reduced-motion`, `aria-*`/포커스 이동
5. **E. 메타** (13): description/OG/favicon

### 비범위 (Out of scope)

- 게임 밸런스 수치 조정, 신규 유닛/능력/레인 재설계
- 관전형 자율 전투 구조, 최저 HP 타게팅 로직, 절차적 오디오 엔진 자체
- 프레임워크·빌드·외부 자산/네트워크 도입(인라인 단일 파일·의존 0 유지)
- 루트 허브 `CONFIG.MODULES` 등재 여부(원형 데모 성격상 별도 판단)
