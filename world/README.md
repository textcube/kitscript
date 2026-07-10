# world — Mosaic World (채팅 없는 네트워크 오픈 월드)

`world/index.html`은 **채팅·닉네임·텍스트가 없는 타일 기반 네트워크 오픈 월드**입니다. 플레이어는 이미지 한 장을 담은 타일 블럭 하나로 존재하고, 이동해서 다른 블럭 옆에 붙으면 핸드쉐이킹을 거쳐 최대 25인 그룹으로 합체합니다. 합체한 블럭들은 하나의 구조처럼 함께 움직이며, 줌아웃하면 여러 사람이 만든 거대한 모자이크가 드러납니다.

- 파일: [`index.html`](index.html) (810줄)
- 외부 의존: Tailwind CDN, lucide CDN, Firebase(Firestore + Anonymous Auth) ESM — 저장소의 다른 게임과 달리 **네트워크 의존이 0이 아닙니다**
- 동기화: `__firebase_config`가 주입되면 Firestore 실시간 동기화, 없으면 **localStorage 기반 단일 사용자 시뮬레이션**으로 폴백([`init`](index.html:237))
- 관전 요소: NPC 블럭이 `NPC_BASE_LIFESPAN`(2분) 주기로 생성·소멸하며 월드가 계속 변합니다. **NPC는 이동하지 않습니다** — 생성/소멸 자체가 이 월드의 자율 운동입니다(의도된 설계)

## 개요 (월드 규칙)

- 플레이어 = 타일 1칸 + 이미지 1장. 이미지는 업로드하거나, 없으면 [`generateGeometricPattern`](index.html:705)이 절차적 기하 패턴을 생성
- `W A S D` / 화살표 / 빈 칸 클릭으로 `MOVE_INTERVAL`(800ms)마다 한 칸 이동([`move`](index.html:471))
- 이동 방향에 블럭이 있으면 충돌 처리. 상대가 **NPC면 즉시 합체**, **유저면 핸드쉐이킹 요청** 생성 → 상대 승인 시 그룹화([`showHandshakeUI`](index.html:615))
- 그룹은 `MAX_GROUP_SIZE`(25)까지. 그룹 상태에서는 모든 멤버가 한 덩어리로 이동하고, 멤버 전원의 이동 목적지가 비어 있어야 이동 성공
- 그룹원이 1명 이하로 줄면 자동 해산([`processSync`](index.html:295)), `Sever Group`으로 수동 이탈 가능
- 합체/이탈/소멸은 텍스트 대신 캔버스 위 플로팅 텍스트로만 알림(`msgQueue` → [`processMessageQueue`](index.html:540))

### 구조 개요

| 영역 | 설명 |
| --- | --- |
| `<header>` | 연결 상태, 좌표 HUD, 외부 링크, 가이드, 이미지 업로드, 줌 컨트롤 |
| `#groupHUD` | 그룹 상태 점/라벨, 인원 카운터(`01/25`), 진행 바, `Sever Group` |
| `#gameCanvas` | 그리드·타일 이미지·그룹 하이라이트·플로팅 텍스트 렌더 |
| `#handshakeContainer` | 수신한 합체 요청 카드(수락/거절, `HANDSHAKE_TIMEOUT` 10초) |
| `#guideModal` / `#detailModal` | 규칙 안내 / 타일 클릭 시 원본 이미지 전체화면 |
| `startSync` | Firestore `onSnapshot` 경로와 localStorage 폴링 경로의 이중 구현 |

## 품질 관점 분석 요약

실제 코드에서 확인된 항목만 정리합니다. 가장 심각한 것은 **핸드쉐이크 카드의 XSS**와 **이미지 캐시 무효화로 인한 렌더링 붕괴**입니다.

### 보안 (최우선)

- **XSS — 원격 데이터가 `innerHTML`로 삽입됨**: [`showHandshakeUI`](index.html:624)가 `<img src="${sender.image}">`로 **다른 클라이언트가 Firestore에 써 넣은 문자열**을 속성값에 그대로 보간합니다. 공격자가 `image` 필드에 `" onerror="…` 를 저장하면 요청을 받은 모든 클라이언트에서 스크립트가 실행됩니다. 필드 검증도 이스케이프도 없습니다.
- **`detailImage.src`에 임의 URL 주입**([index.html:774](index.html:774)): 다른 플레이어의 `image`가 `data:`가 아닌 외부 `https:` URL이면 상세 모달을 여는 순간 임의 원격 서버로 요청이 나갑니다(트래킹/IP 노출).
- **`target="_blank"`에 `rel` 누락**: YouTube/Home 앵커([index.html:57](index.html:57), [index.html:60](index.html:60))에 `rel="noopener noreferrer"`가 없어 리버스 탭내빙 위험.
- **버전 미고정 CDN + SRI 부재**: `cdn.tailwindcss.com`(런타임 컴파일러, 프로덕션 비권장)과 `unpkg.com/lucide@latest`([index.html:7](index.html:7)~8)를 무결성 검증 없이 로드합니다. `@latest`는 업스트림이 바뀌면 페이지가 깨집니다.
- **공개 컬렉션에 대한 신뢰**: 모든 클라이언트가 `players/*` 문서를 직접 `updateDoc`합니다. 남의 문서(`groupId`, `x`, `y`) 쓰기를 막을 클라이언트 측 방어가 없고, Firestore 보안 규칙이 저장소에 존재하지 않습니다.

### 버그 · 정합성

- **이미지 캐시가 매 동기화마다 버려짐(가장 눈에 띄는 버그)**: [`gameLoop`](index.html:589)는 `p._cachedImg`에 `Image`를 붙여 캐싱하지만, [`processSync`](index.html:352)의 `players = pData`가 플레이어 객체를 **통째로 새 객체로 교체**합니다. 오프라인은 100ms(`OFFLINE_SYNC_INTERVAL`)마다, 온라인은 스냅샷마다(하트비트로 3초 이하) 캐시가 사라져 **매번 새 `Image`를 만들고 1024px base64를 다시 디코딩**합니다. 디코딩이 끝나기 전에는 `img.complete === false`라 [검은 사각형](index.html:591)이 그려집니다 — 타일이 깜빡이고 CPU/GC 부하가 큽니다. 캐시는 `id + image` 키의 **별도 맵**으로 분리해야 합니다.
- **`forEach` 순회 중 `splice`**: [`floatingTexts.forEach((ft, i) => … splice(i, 1))`](index.html:599) — 요소를 제거하면 뒤 항목의 인덱스가 당겨져 **한 개씩 건너뜁니다.** 죽은 텍스트가 남거나 살아 있는 텍스트가 사라집니다. 역순 `for` 또는 `filter`로 바꿔야 합니다.
- **온라인 모드에 유령 유저 정리가 없음**: `HEARTBEAT_PURGE_TIME`은 [오프라인 경로](index.html:366)에서만 쓰입니다. Firestore 스냅샷 핸들러([index.html:395](index.html:395))는 **만료된 NPC만 걸러낼 뿐 삭제하지 않고**, 접속을 끊은 유저 문서도 영원히 남습니다. 컬렉션이 무한히 커지고 유령 블럭이 맵을 계속 막습니다. (`deleteDoc`은 import되어 있으나 핸드쉐이크에만 사용)
- **NPC 스폰의 다중 클라이언트 폭주**: [`spawnNPCs`](index.html:448)를 **모든 클라이언트가 각자** 호출합니다. `SPAWN_COOLDOWN`은 로컬 변수라 N명이 동시에 `npcCount < 15`를 보면 최대 `N × 15`개의 NPC를 생성합니다. 서버 측 조정자나 트랜잭션이 없습니다.
- **`onAuthStateChanged` 재진입**: [콜백](index.html:258)이 다시 호출되면 `startSync()`가 재실행되어 `onSnapshot` 리스너와 `setInterval` 하트비트가 **중복 등록**됩니다.
- **프레임레이트 종속**: `POS_LERP`/`CAM_LERP`/`ZOOM_LERP` 보간([index.html:553](index.html:553), [562](index.html:562), [581](index.html:581))과 플로팅 텍스트 수명 `ft.life--`([index.html:608](index.html:608))이 전부 **프레임당 고정 증분**입니다. 144Hz에서는 카메라·줌이 2.4배 빨리 붙고 텍스트가 2.4배 빨리 사라집니다. 반면 `MOVE_INTERVAL`·`MSG_QUEUE_DELAY`는 시간 기반이라 연출 리듬이 주사율에 따라 달라집니다.
- **그룹 이탈 시 무충돌 텔레포트**: [`leaveGroupBtnHUD`](index.html:749)가 `safeX = maxX + 1`로 좌표를 옮기는데 **그 칸이 비어 있는지 검사하지 않습니다.** 다른 블럭 위로 겹쳐 착지할 수 있습니다.
- **오류를 삼키는 빈 `catch`**: [`spawnNPCs`](index.html:468)의 `catch (err) {}`가 권한 오류·쿼터 초과를 전부 무시합니다.
- **`localStorage` 쿼터 미방어**: 1024px JPEG base64(수십~수백 KB) × 최대 40개 블럭이 5MB 한도를 넘기면 `setItem`이 던지는 `QuotaExceededError`가 [`move`](index.html:494) 등에서 잡히지 않고 전파됩니다.
- **자동 해산 경로의 반복 쓰기**: [`processSync`](index.html:301)의 `updateRef()`는 `await` 없이 호출되어, 100ms 폴링 중 조건이 유지되는 동안 같은 쓰기를 여러 번 발행할 수 있습니다.
- **`visualPos` 누수**: NPC가 2분마다 소멸·재생성되는데 [`visualPos`](index.html:370) 항목은 제거되지 않아 세션이 길어질수록 계속 쌓입니다. (`lastAnnouncedGid`/`syncLocks`는 [정리됨](index.html:347))
- **`substr` 사용**: [index.html:245](index.html:245), [index.html:458](index.html:458) — 폐기 예정 API. `slice`로 교체.
- **키 입력 가드 없음**: [`window.onkeydown`](index.html:724)이 모달 표시 여부와 무관하게 이동을 처리하고, 화살표 키의 기본 동작을 막지 않습니다. `window.on*` 직접 대입이라 다른 핸들러를 덮어씁니다.

### 성능 · 네트워크 비용

- **문서에 원본 이미지를 통째로 저장**: 업로드 이미지를 [1024×1024 JPEG](index.html:792)로 리사이즈해 base64로 **플레이어 문서 안에** 넣습니다. `players` 컬렉션 전체를 `onSnapshot`으로 구독하므로, **3초마다 도는 `lastSeen` 하트비트**([index.html:412](index.html:412)) 한 번이 모든 클라이언트에게 해당 문서 전체(이미지 포함)를 재전송시킵니다. 접속자가 늘수록 대역폭이 제곱으로 증가하고 Firestore 1MB 문서 한도에도 접근합니다.
- **100ms마다 전체 localStorage 파싱**: 오프라인 경로의 [`syncLocal`](index.html:383)이 초당 10회 수 MB짜리 JSON을 `parse`/`stringify`합니다.
- **업로드 파일 크기·형식 미검증**: [`imageInput.onchange`](index.html:786)가 어떤 크기의 파일이든 `readAsDataURL`로 통째로 읽습니다.
- **`lucide.createIcons()` 반복 호출**: 타일을 클릭할 때마다([index.html:779](index.html:779)) 문서 전체를 다시 스캔합니다.
- **HiDPI 미대응**: [`resizeCanvas`](index.html:276)가 `devicePixelRatio`를 무시해 고해상도 화면에서 그리드·타일·텍스트가 흐릿합니다.

### 접근성

- **캔버스 대체 설명 부재**: `#gameCanvas`에 `aria-label`이 없습니다.
- **모달 시맨틱 부재**: `#guideModal`/`#detailModal`에 `role="dialog"`·`aria-modal`·포커스 트랩·`Escape` 닫기·포커스 복귀가 모두 없습니다.
- **아이콘 전용 버튼**: 줌/전체맵/가이드 버튼이 `title`에만 의존하고 `aria-label`이 없습니다. 업로드 `<label>`은 키보드로 도달할 수 없습니다.
- **핸드쉐이크 알림이 스크린리더에 전달되지 않음**: `#handshakeContainer`에 `aria-live`가 없습니다.
- **`prefers-reduced-motion` 미대응**: 모달 애니메이션·`hud-pulse`·상시 캔버스 보간.
- **`disabled` 버튼의 클래스 문자열 치환**: [`updateHUD`](index.html:692)가 `className.replace("zinc-500", "red-500")` 방식이라 클래스 순서에 취약합니다.

### 메타 · 로딩

- **메타/OG/파비콘 전무**: `<meta name="description">`, Open Graph/Twitter Card, favicon 부재.
- **`lang="ko"`인데 UI 문자열 대부분이 영어**: 가이드 본문만 한국어입니다(일관성 문제, 기능 문제는 아님).

## 개선 사항 (Improvements)

우선순위 순. **실제 코드에서 확인된 문제만** 다룹니다.

### A. 보안

1. **핸드쉐이크 카드 XSS 차단** — `innerHTML` 템플릿을 없애고 `document.createElement` + `textContent`/`img.src` 대입으로 재작성하세요. 추가로 원격 `image` 필드는 `data:image/(png|jpeg|webp);base64,` 접두사를 검증하는 헬퍼(`isSafeImageSrc`)를 통과한 값만 사용하고, 실패 시 플레이스홀더를 그립니다.
2. **`detailImage`/캔버스 렌더에도 동일 검증 적용** — `isSafeImageSrc`를 통과하지 못한 `image`는 원격 요청이 나가지 않도록 로드 자체를 건너뜁니다.
3. **외부 링크 `rel`** — 두 앵커에 `rel="noopener noreferrer"` 추가.
4. **CDN 버전 고정** — `lucide@latest` → 특정 버전 핀. (Tailwind CDN 교체는 대규모 리팩터이므로 이번 범위 밖, 주석으로 한계만 명시)

### B. 버그 · 정합성

5. **이미지 캐시 분리** — `players` 객체에 `_cachedImg`를 붙이지 말고, 모듈 스코프의 `imageCache = new Map()`에 `id`(또는 `id + image` 해시) 키로 `Image`를 보관하세요. `image` 문자열이 바뀔 때만 새 `Image`를 만들고, 플레이어가 사라지면 항목을 제거합니다. 이것만으로 타일 깜빡임과 매 프레임 디코딩이 사라집니다.
6. **`floatingTexts` 제거 로직 수정** — 역순 `for` 루프 또는 `floatingTexts = floatingTexts.filter(...)`로 바꿔 건너뜀을 없애세요.
7. **온라인 유령/만료 문서 정리** — 스냅샷에서 만료 NPC와 `lastSeen`이 `HEARTBEAT_PURGE_TIME`을 넘긴 유저를 **화면에서 제외**하고, 정리 책임을 한 클라이언트에만 부여(예: 현재 문서 ID 정렬 최상위 유저)해 `deleteDoc`으로 회수하세요. 실패는 조용히 무시하되 삼키지 말고 `console.warn`.
8. **NPC 스폰 중복 억제** — 동일한 "정리 담당" 규칙을 스폰에도 적용하거나, 스폰 전에 `runTransaction`/`setDoc(..., { merge: false })` + 존재 검사로 경합을 줄이세요. 최소한 오프라인이 아닌 경우 담당 클라이언트 1명만 스폰합니다.
9. **`startSync` 중복 초기화 방지** — `onAuthStateChanged` 콜백에 `syncStarted` 가드를 두세요.
10. **프레임레이트 독립화** — `dtFactor = min(dt / (1000/60), 3)`을 계산해 `POS_LERP`/`CAM_LERP`/`ZOOM_LERP` 보간 계수와 `ft.life` 감소에 곱하세요. `MOVE_INTERVAL`·`MSG_QUEUE_DELAY`·`HANDSHAKE_TIMEOUT`은 이미 시간 기반이므로 **상수 값은 그대로 둡니다.**
11. **그룹 이탈 좌표 충돌 검사** — `safeX` 후보를 `maxX + 1`부터 오른쪽으로 스캔해 비어 있는 첫 칸을 고르세요(상한 두고 실패 시 현재 위치 유지).
12. **빈 `catch` 제거** — `spawnNPCs`와 `localStorage.setItem` 경로를 `console.warn`으로 보고하고, 쿼터 초과 시 사용자에게 알린 뒤(예: 헤더 상태 배지) 쓰기를 건너뜁니다.
13. **`visualPos` 정리** — 이미 `lastAnnouncedGid`/`syncLocks`를 지우는 [루프](index.html:340)에서 `visualPos`와 이미지 캐시 항목도 함께 삭제하세요.
14. **`substr` → `slice`**, `window.onkeydown` → `addEventListener('keydown')`. 모달이 열려 있으면 이동을 무시하고, 화살표 키에 `preventDefault()`.

### C. 성능 · 네트워크 비용

15. **하트비트와 이미지 분리 (핵심)** — `lastSeen`을 이미지가 든 플레이어 문서에 쓰지 마세요. 최소 침습 방안: 플레이어 문서에는 **썸네일(128px)** 만 저장하고, 원본 1024px은 `players/{uid}/assets/full` 같은 별도 문서에 두어 상세 모달을 열 때만 `getDoc`으로 가져옵니다. 이렇게 하면 3초 하트비트가 유발하는 스냅샷 페이로드가 수백 KB에서 수 KB로 떨어집니다.
16. **오프라인 폴링 완화** — `OFFLINE_SYNC_INTERVAL`을 100ms에서 상향(예: 250~500ms)하고, `storage` 이벤트를 주 경로로 삼으세요. 렌더는 이미 `requestAnimationFrame`에서 보간되므로 체감 차이가 없습니다.
17. **업로드 가드** — 파일 크기 상한(예: 10MB)과 `type.startsWith('image/')` 검증, 실패 시 사용자 피드백.
18. **`lucide.createIcons()` 스코프 축소** — 새로 삽입한 노드에만 적용(`createIcons({ nameAttr, root })` 또는 삽입 컨테이너 한정).
19. **HiDPI 대응** — `resizeCanvas`에서 `devicePixelRatio`(상한 2)로 백킹 스토어를 확대하고 `ctx.setTransform`으로 스케일. **월드 좌표계는 논리 픽셀 기준을 유지**합니다.

### D. 접근성

20. **캔버스 `aria-label`** — 예: "타일 기반 모자이크 월드 화면".
21. **모달 시맨틱** — 두 모달에 `role="dialog"`, `aria-modal="true"`, `aria-labelledby`를 부여하고 `Escape` 닫기, 열 때 첫 포커스 이동, 닫을 때 트리거로 포커스 복귀를 구현하세요.
22. **아이콘 버튼 `aria-label`**, 업로드 `<label>`에 `tabindex="0"` + 키보드 활성화, `#handshakeContainer`에 `aria-live="polite"`.
23. **`prefers-reduced-motion` 대응** — `@media (prefers-reduced-motion: reduce)`로 `modal-animate`/`hud-pulse`/CSS 트랜지션을 정지하세요(캔버스 월드 자체는 본질이므로 유지).
24. **HUD 클래스 토글 정리** — `className.replace` 문자열 치환을 `classList.toggle`로 교체.

### E. 메타 · 로딩

25. **메타/OG/파비콘 추가** — `description`, `og:*`, `twitter:card`, favicon(인라인 SVG data-URI 권장, 신규 파일 불필요).

## 개선 작업 계획 (Sonnet 5 실행 범위)

`world/index.html`만 수정하며 **단일 파일 / 인라인 / 무빌드 철학과 "채팅·닉네임·텍스트 없음" 정체성을 유지**합니다. 월드 규칙(타일 이동, 800ms 쿨다운, 25인 그룹, 핸드쉐이킹, NPC 2분 수명, 정적 NPC)은 **변경하지 않습니다**. 순서:

1. **A. 보안** (1~4): 핸드쉐이크 XSS, `image` 소스 검증, `rel`, CDN 핀
2. **B. 버그** (5~14): 이미지 캐시 분리, `splice` 수정, 유령 문서 정리, 스폰 경합, `startSync` 가드, 프레임레이트 독립화, 이탈 좌표, 오류 로깅, `visualPos` 정리, 잡정리
3. **C. 성능** (15~19): 썸네일/원본 분리, 폴링 완화, 업로드 가드, 아이콘 스코프, HiDPI
4. **D. 접근성** (20~24)
5. **E. 메타** (25)

### 비범위 (Out of scope)

- **NPC에 이동 AI 부여** — 정적 NPC + 생성/소멸 순환은 이 월드의 의도된 리듬입니다. 관전 재미를 위해 NPC 유랑을 넣고 싶다면 별도 실험으로 분리하세요(그룹 형성 규칙 전반에 영향).
- 그룹 내부 블럭 재배치/스왑, 핸드쉐이킹 프로토콜 재설계(PLAYER↔GROUP, GROUP↔GROUP 경합 규칙), 재접속 시 그룹 상태 복원 — 원문에서 "향후 확장"으로 남긴 항목
- Firestore 보안 규칙 파일 작성/배포(저장소 밖 인프라 작업). 다만 **클라이언트가 남의 문서를 자유롭게 쓰는 구조라는 사실은 알려진 한계**로 기록해 둡니다.
- Tailwind CDN → 빌드 파이프라인 전환, 프레임워크 도입
- 게임 밸런스(이동 쿨다운, 그룹 정원, NPC 수명·개체 수) 조정

---

## 배경 — 채팅 없는 네트워크 오픈 월드 게임 개발 실험

* https://www.patreon.com/posts/152825867
* https://kitscript.com/game/world/
* https://github.com/textcube/kitscript/
* https://www.youtube.com/watch?v=slBr2XDtiKM

요즘 대부분의 온라인 서비스는 점점 더 많은 기능을 추가하는 방향으로 발전하고 있다. 채팅, 친구 목록, 아이템, 경제 시스템, 레벨, 퀘스트 같은 요소들이 자연스럽게 따라붙는다. 하지만 문득 이런 생각이 들었다. 정말로 그렇게 많은 기능이 필요할까.

그래서 아주 단순한 실험을 해보기로 했다. 채팅도 없고 텍스트도 없는 네트워크 월드를 만들면 어떤 느낌일까.

플레이어는 하나의 타일 블럭으로 존재한다. 그 블럭에는 이미지 하나만 들어간다. 말 대신 이미지를 올리고, 이동하고, 다른 플레이어 옆에 붙어 구조를 만든다. 누군가와 가까이 붙으면 합체 절차가 만들어지고 승인이 되면 하나의 그룹이 된다. 그렇게 모인 블럭들은 붙어서 하나의 구조처럼 움직이게 된다.

이 구조는 의외로 재미있는 장면을 만든다. 가까이서 보면 단순한 이미지 타일 몇 개지만, 멀리서 보면 여러 사람이 모여 하나의 형태를 만들기도 한다. 어떤 경우에는 단순한 패턴처럼 보이고, 어떤 경우에는 하나의 그림처럼 보이기도 한다.

이 게임에는 채팅이 없다. 닉네임도 없다. 텍스트 메시지도 없다. 대신 플레이어들은 이미지와 움직임으로 존재를 표현한다. 누군가는 고양이 사진을 올리고, 누군가는 풍경을 올리고, 누군가는 로고를 올린다. 서로 말하지 않지만, 옆에 붙고 함께 이동하면서 자연스럽게 구조가 만들어진다.

세계는 타일 기반 오픈 월드다. 확대하면 개별 블럭을 볼 수 있고, 축소하면 전체 구조를 볼 수 있다. 멀리서 보면 여러 플레이어가 만든 구조가 하나의 거대한 모자이크처럼 보이기도 한다.

기술적으로는 가능한 한 단순하게 만들었다. Canvas 기반 렌더링, 실시간 네트워크 동기화, 그리고 최소한의 UI만 남겼다. 복잡한 시스템을 얹기 시작하면 끝이 없기 때문이다. 이번 실험의 목적은 완성된 게임을 만드는 것이 아니라 얼마나 단순한 구조로도 네트워크 월드가 성립할 수 있는지 확인하는 것이었다.

기본 규칙은 매우 단순하다. 플레이어는 하나의 타일 블럭이고 그 블럭에는 이미지 하나를 올릴 수 있다. 플레이어는 타일 위를 이동할 수 있고, 다른 플레이어나 그룹의 블럭 옆에 붙으면 핸드쉐이킹 절차가 생성된다. 상대가 승인하면 같은 그룹이 된다. 그룹이 되면 블럭들은 붙어서 하나의 구조처럼 이동하게 된다.

월드에는 NPC 블럭도 존재한다. NPC는 일정 시간 동안만 존재하며 현재는 수명을 2분으로 설정해 두었다. NPC 역시 플레이어와 동일한 방식으로 합체할 수 있기 때문에 플레이어가 부족한 상황에서도 구조를 만들어 보는 실험이 가능하다. 시간이 지나면 NPC는 자연스럽게 사라지고, 그래서 월드에는 계속 새로운 블럭이 등장했다가 사라지게 된다.

월드는 확대와 축소가 가능하다. 가까이서 보면 개별 블럭이 보이고, 멀리서 보면 여러 블럭이 모여 만든 전체 구조를 볼 수 있다. 이때 멀리서 보는 장면이 오히려 더 흥미로운 경우가 많다. 작은 블럭들이 모여 하나의 거대한 모자이크처럼 보이기 때문이다.

현재 버전은 MVP 수준이기 때문에 일부 기능은 아직 구현되지 않았다. 예를 들어 그룹 내부에서 블럭의 위치를 바꾸는 기능은 아직 없다. 지금은 그룹이 형성되면 블럭들이 붙은 상태로 이동만 가능하다. 하지만 만약 그룹 내부에서 블럭을 재배치하거나 스왑할 수 있게 된다면 여러 플레이어가 협력해서 특정 모양이나 패턴을 만드는 재미가 생길 수 있을 것이다. 이 부분은 앞으로의 확장 아이디어로 남겨 두었다.

또 앞으로 다듬어야 할 부분 중 하나는 핸드쉐이킹 프로토콜이다. 지금은 플레이어가 다른 플레이어나 그룹의 블럭 옆에 붙으면 합체 절차가 생성되는 구조지만 실제로는 다양한 상황이 발생할 수 있다. 예를 들어 PLAYER <-> PLAYER, PLAYER <-> GROUP, GROUP <-> GROUP 같은 다양한 조우 상황이 있다. 여러 플레이어가 동시에 합체를 시도하거나 두 그룹이 동시에 접촉하는 상황에서는 누가 승인 권한을 가지는지, 어떤 그룹 구조가 유지되는지 같은 규칙을 더 정교하게 다듬어야 한다.

또 하나 고려해야 할 것은 재접속 상황이다. 플레이어가 그룹에 속한 상태에서 접속이 종료되고 다시 접속할 경우, 그 사이에 그룹 구조가 바뀌었을 가능성이 있다. 그룹이 이동했거나 다른 플레이어가 합류했거나 일부 멤버가 분리되었을 수도 있다. 이런 상황에서는 플레이어가 접속 종료 이전과는 다른 장면을 마주하게 될 수도 있다. 그래서 앞으로는 이러한 상황을 고려한 그룹 상태 동기화와 재접속 처리 방식도 보완할 필요가 있다.

데이터 동기화는 현재 Firestore 기반으로 구현되어 있다. 플레이어 위치와 그룹 상태 같은 기본 정보는 Firestore를 통해 동기화되기 때문에 여러 사용자가 동시에 접속하면 같은 월드를 공유하게 된다.

다만 항상 서버 환경이 준비되어 있는 것은 아니기 때문에 서버가 없는 상황도 함께 고려했다. Firestore 연결이 없는 경우에는 데이터를 로컬 저장소(Local Storage)에 저장하고 단일 사용자 기준으로 월드를 시뮬레이션 방식으로 동작하도록 만들었다.

이 방식의 장점은 서버가 없어도 구조를 실험할 수 있다는 점이다. 네트워크 연결 없이도 게임 로직을 테스트할 수 있고, 개발 단계에서 빠르게 기능을 확인할 수 있다. 필요하면 Firestore를 활성화해 멀티유저 환경으로 동작시키고, 그렇지 않으면 로컬 시뮬레이션 모드로 사용할 수 있다.

이번 프로젝트에는 제한된 시간을 할당해 두었다. 개발을 하다 보면 기능을 계속 추가하고 싶어지지만 어느 순간에는 멈춰야 한다. 이번 프로젝트도 이미 할당한 시간을 넘겼고 더 기능을 추가하면 끝이 없을 것 같다는 생각이 들었다.

그래서 여기서 멈추기로 했다. 완벽하지는 않지만 MVP로는 충분하다는 판단이다.

이 실험의 목적은 완성된 게임을 만드는 것이 아니라 단순한 규칙만으로 어떤 상호작용이 만들어지는지 확인하는 것이었다.

가끔은 복잡한 시스템보다 단순한 규칙 하나가 더 흥미로운 결과를 만든다. Mosaic World는 그런 가능성을 확인해보기 위한 작은 실험이다.

그리고 이제는 이 실험을 기록으로 남기고 다음 아이디어로 넘어갈 시간이다.

어쩌면 이 구조는 다른 누군가에게 또 다른 형태의 오픈 월드 실험으로 이어질 수도 있을 것이다.

이제 여러분이 여러분만의 방식으로
여러분만의 오픈 월드를 만들어볼 차례다.
