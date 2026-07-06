# BuntSpace — Space Explorer Cinematic

Three.js(r128) + Tween.js로 만든 단일 HTML 파일 기반의 3D 쇼케이스 페이지다. [city](../city)/[water](../water)와 같은 아키텍처의 우주 버전 — 셔틀을 따라가는 3인칭 카메라로 z축 일렬 워프 노드 사이를 이동하고, 행성을 더블클릭하면 프로젝트 소개 모달(유튜브/이미지 + 링크)이 뜬다.

* https://github.com/textcube/kitscript/

## 현재 구현 개요

- **월드 데이터**: `WORLD_DATA.nodes` 5개(Warp Entry → Deep Core)가 z축 일렬(15 → -25), `WORLD_DATA.planets` 4개가 x=-8 한쪽에 배치. `navigateTo()`는 인덱스 순차 이동.
- **플레이어**: 우주 셔틀(`createSpaceShuttle`) — 동체/날개/엔진 + 스러스터 PointLight 1개 + idle 부유.
- **행성(`createSpacePlanets`)**: 코어 구체(원격 텍스처, 실패 시 캔버스 폴백) + 대기 셸 + 네온 링 2개 + 공전하는 위성. 자전/공전/부유 애니메이터.
- **환경**: 별 10,800개(2계층 Points) + 성운 스프라이트 3장, `FogExp2(0x02040b, 0.022)`, GridHelper(투명 0.1) + 비가시 클릭 평면.
- **조명**: Ambient + Hemisphere + Directional + PointLight 2개(rim/sunset) + 셔틀 스러스터 PointLight = 동적 포인트 라이트 3개.
- **인터랙션**: `mousedown` + 시간차(350ms) 수동 더블클릭 판정(`lastClickTime`), 리스너가 canvas가 아닌 `window`에 부착됨. 모달은 X 버튼으로만 닫힘. `focusOnPlanet()`/`closeModal()`이 카메라 회전을 **오일러 성분별 트윈**으로 처리.
- **HUD**: flex + `.brand-zone`, RE-SYNC ORBIT 텍스트 버튼. 하단 안내 pill 상시 표시. 로딩은 동기 숨김.

## 개선 완료 — city/water에서 검증된 패턴 이식

[city/README.md](../city/README.md)와 [water/README.md](../water/README.md)에 기록된 검증 완료 패턴을 star에 이식했다. water 이식(A/B) 및 후속 수정(D)과 동일한 범위. 검증은 `star-static`(포트 8794) preview로 진행, 콘솔 클린 유지 확인.

### A. 성능/버그
- ✅ **A1. 카메라 역방향 회전 선제 수정** — `focusOnPlanet()`/`closeModal()`을 water와 동일한 **쿼터니언 slerp**로 교체. `_focusTempObj`(scratch `Object3D`)로 `lookAt()` 후 quaternion을 읽어 `{t:0→1}` 트윈 + `camera.quaternion.slerpQuaternions(startQuat, endQuat, t)`. 카메라 목표 위치는 기존 `worldPos.x + 9` 오프셋을 유지하되 `worldPos.clone().add(new THREE.Vector3(9,0,0))`로 정리. `angleTo(endQuat)`를 매 프레임 샘플링해 단조 감소(2.15rad → 0) 확인 완료 — 반대 방향 스윙 없음.
- ✅ **A2. pixelRatio 상한 2 → 1.5** — `Math.min(window.devicePixelRatio || 1, 1.5)`.
- ✅ **A3. 리스너를 window → canvas로** — `mousedown`(→`pointerdown`)/`mousemove`/`dblclick`을 `renderer.domElement`에 부착.
- ✅ **A4. 애니메이터 `Date.now()` → `animate(time)` 인자 통일** — `n_animators`가 `(time)`을 받고, `animate()`가 `n_animators.forEach(fn => fn(elapsed))`로 호출. 행성/비콘 애니메이터 내부에서 `time` 파라미터 사용.

### B. UI/UX (city 6종 + 후속 수정)
- ✅ **B1. HUD CSS Grid** — `#hud`가 `grid-template-areas: "brand actions" / "location actions"`, `.brand-name`/`.hud-actions`/`.location-info`가 `#hud`의 직계 자식(`.brand-zone` 래퍼 제거). `display: contents` 미사용.
- ✅ **B2. 모달 ESC/배경 클릭 닫기** — `onKey()`에서 `Escape`를 `isMoving||isInspecting` 조기 리턴보다 먼저 처리. `#modal`에 `click` 리스너(`onModalBackdropClick`, `e.target === e.currentTarget`)로 배경 클릭 닫기.
- ✅ **B3. 노드 트래커** — `#node-tracker`(우측 5개 점), `buildNodeTracker()`/`updateNodeTrackerActive()`. `navigateTo()` 루프에서 `#current-node` 갱신 직후 `updateNodeTrackerActive()` 호출. 호버 시 라벨 chip 표시(`.node-dot-row:hover .node-dot-label`), 390px 세로 모드에서 라벨 숨김.
- ✅ **B4. 안내 pill 자동 숨김** — `GUIDE_HIDE_DELAY_MS`(9s)/`GUIDE_IDLE_REVIVE_MS`(45s), `scheduleGuideHide()`/`resetGuideIdleTimer()`/`onFirstModalOpen()`. 모든 `.guide-box` transform 상태(`revealed`/기본/`hidden-by-timer`)에 `translateX(-50%)` 유지 — 데스크톱·390×844 모두 diff 0px로 중앙 정렬 확인.
- ✅ **B5. 로딩 페이드아웃 + HUD 스태거 등장** — `bootEngine()` 끝에서 `setTimeout(..., 800)` 후 `#loading`에 `.fade-out` 추가(`transitionend` + 700ms 타임아웃 폴백), `#hud`/`.guide-box`에 `.revealed` 추가.
- ✅ **B6. 행성 호버 피드백** — `createSpacePlanets()`에서 코어 생성 시 `neonRef = {hoverBoost:1}`를 저장하고 링 `material`/`emissiveIntensity`(3.2)를 `neonRef.base`로 캐시. 애니메이터에서 `neonRef.mat.emissiveIntensity = neonRef.base * neonRef.hoverBoost`. `onMouseMove()`가 `isContent` 히트 시 `setHoveredPlanet()`(1.6배 부스트) + `#hover-tip` 표시(제목 + "더블클릭으로 보기"), coarse pointer에서는 스킵.
- ✅ **B7. RE-SYNC ORBIT 버튼 아이콘화** — 42×42 원형 `.hud-button`, `stroke="currentColor"` 인라인 SVG(궤도/재동기화 글리프), `aria-label`/`title`/`data-tooltip`="궤도 재동기화", `(hover: hover) and (pointer: fine)`에서만 `::after` 툴팁. 데스크톱·390px 모두 42×42 원형 유지 확인(별도 media query 패딩 오버라이드 없음).
- ✅ **B8. 모바일 세트** — `getViewportSize`/`getResponsiveFOVBoost`/`getResponsiveCamOffset`(water 이식, 기준 FOV 55, 오프셋 보정값은 star의 `CAM_OFFSET(7.5,5,12)`에 맞게 축소 조정). 두 손가락 핀치 줌(`onTouchStartPinch`/`onTouchMovePinch`/`onTouchEndPinch`), `#zoom-controls` +/−(`body.coarse-pointer` 게이팅, step 8, 120ms 반복, `stopPropagation`), 터치 안내 문구("🚀 탭해서 워프" / "🌌 두 번 탭해서 보기" / "🤏 핀치 줌"). 줌 버튼(`bottom: 6.75rem` 데스크톱 기준, 390px에서 `10.5rem`)과 안내 pill/트래커 겹침을 390×844 + `coarse-pointer` 강제 상태에서 계측 — 겹침 없음(줌 버튼 하단과 안내 pill 상단 사이 약 50px 여유).
- ✅ **B9. 더블클릭 판정 정식화** — `lastClickTime` 수동 판정 제거, `renderer.domElement`에 `pointerdown`(노드/바닥 이동)과 `dblclick`(행성 포커스, `onDoubleClick`)을 분리 부착.

### 구현 이력
- **A1 검증**: `camera.quaternion.angleTo(endQuat)`을 311프레임 샘플링해 첫 값 2.1496rad → 마지막 0으로 단조 감소함을 확인(역방향 스윙 없음).
- **B8 오프셋 조정**: water의 `getResponsiveCamOffset()` 보정 벡터(2.4/1.2/8.0)는 water의 `CAM_OFFSET(18,12,25)` 기준이라 star의 훨씬 작은 `CAM_OFFSET(7.5,5,12)`에 그대로 쓰면 과도하게 커진다 — 비율에 맞춰 (1.5/1.0/4.5)로 축소해 이식.
- **성능**: PointLight 3개(rim/sunset/thruster) 유지, 삼각형 수 약 75,880(초기 씬 기준, `scene.traverse` 집계).

### 참고: 이식 시 겪은 함정
- 상수는 반드시 최상단(`CAM_OFFSET` 옆)에 배치 완료 — star는 스크립트 말미에서 `bootEngine()`을 즉시 호출하므로 TDZ 리스크가 실재했다(city에서 두 번 로딩 멈춤 사고와 동일 클래스). 가이드/줌/노드트래커 관련 신규 상수 전부 `CAM_OFFSET` 인접 블록에 선언.
- 줌 버튼 위치는 water 값을 그대로 쓰지 않고 이 페이지의 안내 pill 높이에 맞춰 재계측(`bottom: 6.75rem`/`10.5rem`)했다.
- 가이드 문구가 HTML에 있어 water A4식 이중 정의 문제는 없었다.

### C1-C7 검증 (그래픽 비주얼 개선)
- **성능**: PointLight 3개 그대로 유지(신규 라이트 없음). 삼각형 수 약 75,880 → 76,536(신규 엔진 트레일 콘/광기둥 원통/항법등 구체 지오메트리 반영, 증가폭 1% 미만).
- **C2 검증**: `navigateTo()`로 순차 이동해 `n4`(Deep Core, 마지막 노드) 도착 후 스크린샷 확인 — 현재 노드 광기둥이 다른 노드보다 뚜렷하게 밝고 두꺼워 보임. 훅 방식은 `navigateTo()` 이벤트가 아니라 애니메이터가 매 프레임 `currentNodeId`를 비교하는 방식으로 구현(전환 도중에도 항상 정확).
- **C1 검증**: `isMoving` 토글 시 트레일 `scale.z`/`opacity`가 목표값(2.5/0.7 ↔ 0.5/0.25)으로 0.06/frame lerp되는 것을 콘솔에서 직접 샘플링해 확인. `navigateTo()`의 노드 간 hop이 850ms로 짧아 `isMoving` 창이 좁으므로, eval 폴링 타이밍에 따라 이미 idle로 복귀한 상태를 잡을 수 있음(버그 아님 — 관찰 타이밍 이슈).
- **C7 검증**: `updateCometTraffic()`을 강제로 5회 연속 스폰→즉시 만료(`crossMs` 단축) 시켜 `renderer.info.memory.geometries/textures`를 사이클마다 측정 — 60/12로 안정, `activeComets` 배열도 매번 0으로 복귀(`disposeObject3D` 누수 없음 확인). 기본 스폰 간격(60-120s)·횡단 시간(30-45s)에서는 거리 400-800 원경이라 기본 카메라 앵글에서는 화면에 거의 보이지 않음(의도대로 "느리게 지나가는" 배경 요소).
- **회귀 없음 확인**: 행성 더블클릭→모달 열림/닫힘(Escape), 노드 트래커 클릭 이동, 콘솔 로그 전 과정 클린 유지.

## C. 그래픽 비주얼 개선

현재 씬의 갭: 셔틀 엔진에 추진 연출이 없어 정지 모형처럼 보이고, 워프 노드가 바닥 링뿐이라 "워프 게이트" 존재감이 없으며, 행성 뒤 글로우가 없어 배경과 분리감이 부족하고, 별이 완전히 정적이며, 하늘에 은하수 같은 깊이 축이 없다. city(스카이라인/헤일로)와 water(글리터/헤일로/배경 생기)에서 검증된 저비용 기법을 우주 테마로 번안한다. 검증은 `star-static`(포트 8794) preview로 진행, 콘솔 클린 유지 확인.

- ✅ **C1. 셔틀 엔진 트레일** — `createSpaceShuttle()` 내 공유 `ConeGeometry`(tip이 +z, 후방) + 가산 `MeshBasicMaterial`(depthWrite false)를 엔진 2개 뒤에 배치. `n_animators`에서 `isMoving` 기준으로 `scale.z`(0.5↔2.5)와 `opacity`(0.25↔0.7)를 매 프레임 0.06 lerp. 신규 라이트 없음(기존 `thrusterLight` PointLight 재사용).
- ✅ **C2. 워프 노드 광기둥** — `createPillarGradientTexture()`(세로 알파 그라디언트, 바닥 쪽 불투명 → 위로 투명) + `createWarpNodes()`에서 노드당 열린 원통(`radius 1.3, height 6`, 가산, depthWrite false) 배치. 애니메이터가 매 프레임 `n.id === currentNodeId` 비교로 현재 노드만 밝게(`base 0.55/amp 0.12` vs `base 0.28/amp 0.06`), 노드별 4.5~6s 주기 sine breathing(빠른 펄스 없음).
- ✅ **C3. 행성 백글로우 헤일로** — `createHaloTexture()`(공유 방사형 그라디언트, water `createBuoyHaloTexture` 이식) + `createSpacePlanets()`에서 행성마다 가산 `THREE.Sprite` 1장(행성 색상 틴트, `scale 9.5`, opacity 0.35, 그룹 중심에서 약간 뒤 `z:-1.5`).
- ✅ **C4. 별 반짝임(제자리)** — `createStars()`의 nearField 1,800개를 3그룹(~600개씩, `NEAR_FIELD_GROUPS`)으로 분리, 그룹별 위치는 그대로 두고 `PointsMaterial.opacity`만 `0.55 + 0.35*sin(time*0.0004 + phase)`로 그룹마다 다른 위상 breathing. deepField(9,000개)는 변경 없이 완전 정적 유지.
- ✅ **C5. 은하수 밴드** — `createMilkyWayBandTexture()`(세로 그라디언트 + `destination-in` 마스크로 양끝 페더링 + 별 점 420개 + 먼지 블롭 14개) + `createMilkyWayBand()`가 원경(z ≈ -1500~-1650, `fog:false`, `depthWrite:false`) 대형 스프라이트 2장을 `material.rotation`으로 비스듬히 배치(opacity 0.32/0.45). `createStars()` 끝에서 호출.
- ✅ **C6. 셔틀 항법등** — `createSpaceShuttle()`에서 날개 끝(x ≈ ±1.97)에 작은 `SphereGeometry` + `MeshBasicMaterial`(빨강 `0xff3344`/초록 `0x33ff66`). 애니메이터가 2.5초 주기 sine으로 좌우 정확히 반대 위상(`+Math.PI`) 교차 블링크, opacity 바닥 0.2(사각파 아님, 완전히 꺼지지 않음).
- ✅ **C7. (스트레치) 혜성 통과** — `disposeObject3D()`를 water에서 그대로 이식(star에 없었음). `createComet()`이 코어 구체 + 가산 꼬리 스프라이트(`createCometTailTexture()`, `material.rotation`으로 진행 반대 방향)를 생성, 거리 400-800에서 사선 경로로 배치. `updateCometTraffic(time)`이 60-120초 간격 스폰(`nextCometSpawn`), 30-45초에 걸쳐 매우 느리게 횡단(`crossMs`), 도착 시 `scene.remove` + `disposeObject3D`로 완전 해제. `n_animators`에 등록.

## 실행 방법

빌드 없이 `index.html`을 브라우저에서 열면 바로 실행된다. 로컬 미리보기는 `.claude/launch.json`의 `star-static`(포트 8794) 설정 사용.
