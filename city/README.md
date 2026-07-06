# BuntGames Alley Explorer

Three.js(r128) + Tween.js로 만든 단일 HTML 파일 기반의 3D 쇼케이스 페이지다. 플레이어 로봇을 따라가는 3인칭 카메라로 좁은 골목(alley)을 걸어 다니며, 벽면의 쇼윈도우를 더블클릭하면 프로젝트 소개 모달(유튜브 영상 또는 이미지 + 링크)이 뜨는 구조다.

* https://github.com/textcube/kitscript/

## 현재 구현 개요

- **HUD 레이아웃(`#hud`)**: 브랜드명/위치 정보/RESET VIEW 버튼을 CSS Grid(`grid-template-areas: "brand actions" / "location actions"`)로 배치한다. 모든 뷰포트 크기에서 이 그리드 하나를 쓰고, 좁은 세로 화면에서만 `grid-template-areas`를 `"brand actions" / "location location"`으로 바꿔 위치 정보 줄이 버튼 아래까지 전체 폭을 쓰도록 미디어쿼리로 재정의한다.
  - **버그(수정 완료 · 아이폰 크롬 텍스트 깨짐)**: 이전 버전은 데스크톱에서 `#hud`를 flex로, 좁은 세로 화면에서만 `.brand-zone`(브랜드명+위치 정보를 감싼 wrapper) 을 `display: contents`로 바꿔 그 자식들이 부모 그리드의 named area로 건너뛰게 하는 방식이었다. `display: contents`가 자식의 grid-area 배치와 얽힐 때 가용 폭(available inline size) 계산이 깨지는 WebKit 버그가 있는데, iOS Safari와 iOS Chrome은 같은 WebKit 엔진이라도 빌드가 달라(Apple 정책상 iOS의 모든 브라우저는 WebKit 기반이지만 Chrome은 자체 빌드를 쓴다) 이 버그가 Chrome 쪽에서만 드러났다 — 텍스트가 감싸지는 실제 폭이 한두 글자 폭으로 줄어들어, 평범한 단어 줄바꿈인데도 "CIN/EMA/TIC/DIS..."처럼 한 글자~두세 글자 단위로 잘려 보였다. `display: contents`에 의존하지 않도록 `.brand-zone` wrapper 자체를 HTML에서 없애고 `.brand-name`/`.location-info`/`.hud-actions`를 전부 `#hud`의 직계 자식으로 두어, 데스크톱·모바일 모두 하나의 그리드로 처리하도록 구조를 바꿨다. `preview_resize`로 375×667, 390×844(아이폰 크기) 뷰포트를 재현해 한 줄로 정상 표시되는 것까지 확인했다(다만 로컬 미리보기는 Chromium이라 iOS WebKit 자체를 재현하진 못한다 — 근본 원인인 `display: contents` 의존성을 제거한 것으로 대응).
- **월드 데이터**: `WORLD_DATA.nodes`가 z축 한 줄(12 → 4 → -4 → -12 → -20)로 늘어선 5개 지점을 정의하고, 각 노드는 `neighbors`로 서로 연결된 그래프다. `findPath()`가 BFS로 현재 위치→목표 노드 경로를 구하고, `navigateTo()`가 그 경로를 따라 `TWEEN`으로 순차 이동시킨다. 즉 실제로는 "자유 보행"이 아니라 **일직선 레일 위의 정거장 이동**에 가깝다(교차로 없음 — [남은 개선 여지](#남은-개선-여지) 4-1 참고).
- **쇼윈도우(`arcadeSlots`)**: x=-5.5 왼쪽 벽에 4개의 매장이 배치된다. 각 매장은 벽(Box) + 텍스처를 입힌 평면(윈도우) + 투명 클릭존 + 네온 프레임(얇은 Box 4개)로 구성되며, `applyWindowTexture()`가 원격 이미지를 로드하다 실패하면 캔버스로 그린 폴백 텍스처(`createFallbackTexture`)로 대체한다. 네온 프레임은 매장별로 위상이 다른 이중 사인파(`neonSigns` 배열, `animate()`)로 밝기가 흔들려 실제 네온사인처럼 flicker한다. 매장 줄 앞뒤에는 창문 없는 필러 벽(`createLeftWallFillers()`, z=12/-28)을 이어 붙여 오른쪽 건물 줄과 비슷한 길이(약 -32~16)로 늘렸다 — 골목 끝 너머로 지평선이 드러나지 않도록.
- **타이틀 네온사인(`createSignTexture()`)**: 창문 위쪽 빈 벽 공간(world y≈6.9~8.2)에 매장 `content.title`을 그대로 쓴 네온 간판을 얹었다. 캔버스에 폭에 맞춰 폰트 크기를 자동으로 줄여가며(`measureText` 루프) 그린 뒤 흐림 1겹 + 또렷한 흰 코어 1겹으로 겹쳐 글자가 뭉개지지 않게 했고, 매장마다 다른 색(`SIGN_COLORS` 4색 순환)을 쓰며 기존 `neonSigns` flicker 루프에 편승해(각자 다른 `seed`) 네온 프레임과는 별도 위상으로 깜빡인다.
  - **버그(수정 완료 · TDZ)**: 처음엔 `SIGN_COLORS` 배열을 `createArcadeAlley()` 정의부 *뒤쪽*에 선언했는데, 스크립트 최상단의 `init();` 호출이 그보다 먼저 실행되면서 `const`의 TDZ(temporal dead zone) 때문에 `ReferenceError`가 났다. 이 예외가 `init()`을 중간에 멈춰 세워 로딩 스피너가 영원히 사라지지 않았다 — `SIGN_COLORS`를 `CAM_OFFSET` 등 다른 최상단 상수 옆, `init()` 호출보다 앞으로 옮겨 해결했다.
  - **버그(수정 완료 · 가독성)**: 글로우 블러 반경을 `18px` 고정값으로 뒀더니, 제목이 길어서 폭에 맞춰 폰트가 작게 줄어드는 매장("Action Framework v2", "Private Membership")은 글자 획보다 블러가 훨씬 커져 사실상 뭉개진 덩어리로 보였다. 블러를 폰트 크기에 비례하게 바꿔 해결했다.
  - **가독성 2차 보강**: 그래도 잘 안 보인다는 피드백에 따라 네 가지를 함께 손봤다 — ① 캔버스 해상도를 1024×200 → 2048×384로 올리고, ② `texture.anisotropy`를 최대치로 설정해 아래에서 비스듬히(grazing angle) 올려다볼 때 뭉개지던 것을 크게 개선(간판은 항상 눈높이보다 위, 사선으로 보이므로 이방성 필터링 효과가 크다), ③ 흐림 글로우 + 컬러 튜브 스트로크 + 흰 코어 3겹으로 그려 대비를 높였고, ④ 간판 전용 flicker를 분리(`isText`)해 프레임 테두리처럼 드물게 0.2배로 확 꺼지던 글리치 드롭을 없애고 base 밝기 위아래 6%만 숨쉬듯 흔들리게 해서 **어떤 순간에도 글자가 사라지지 않도록** 했다(base 밝기도 3 → 4.5로 상향).
  - **가독성 3차 · 간판/테두리 색 충돌 제거**: 첫 매장 간판이 청록색(`0x00f2ff`)이었는데 쇼윈도우 네온 테두리도 전부 같은 청록이라, 간판이 테두리에 파묻혀 안 보였다(분홍 "DEV MASTER CLASS"만 대비되어 읽혔다). `SIGN_COLORS`에서 청록과 청록에 가까운 민트 그린을 빼고 magenta/amber/orange/violet(`0xff2ecb, 0xffc61a, 0xff6a2b, 0xb45cff`) 4색으로 바꿔, 모든 간판이 청록 테두리 및 서로에 대해 확실히 대비되도록 했다.
- **오른쪽 건물(`WORLD_DATA.buildings` → `createOppositeBuildings()`)**: x=8 쪽에 불 켜진 창문 파사드(`createFacadeTexture`, 랜덤 점등 22%)와 닫힌 셔터(`createShutterTexture`) 두 종류의 비상호작용 건물 5동을 배치해 골목의 반대편을 채운다. 각 건물 `width`를 z축 스팬(8)과 정확히 맞춰 서로 맞닿게 배치했기 때문에(왼쪽 매장 줄과 동일한 방식) 건물 사이로 배경이 비치는 좌우 여백이 없다. 매장과 통합된 스키마는 아니고 별도 배열이다.
- **거리 소품(`createStreetProps()`)**: 인도를 따라 `InstancedMesh` 기반 볼라드(cyan 캡, 인도 위 `groundY` 기준)와 야자수 스타일 가로수를 각각 드로우콜 1회로 배치한다. 가로수는 **가로등과 같은 도로변 x열(≈1.75)에, 인접한 두 가로등의 중간 z지점(z=8,0,-8,-16)**에 놓여 lamp/palm/lamp/palm으로 번갈아 서고(그래서 도로면 위 `treeBaseY=0` 기준), 잎(fronds 6장 + 크라운 콘)이 **가로등 상단 높이(`LAMP_TOP`≈5.2)**에 오도록 트렁크 높이를 맞췄다 — 잎이 간판 띠(world y≈6.9+)보다 확실히 아래에 있어 간판을 가리지 않는다. 트렁크는 반경 0.06~0.1로 얇고 어둡게(`0x241a10`) 만들어, 카메라와 같은 도로변에 서는데도 앞쪽에서 시야를 크게 막지 않고 가로등 폴과 비슷한 시각적 무게로 보이게 했다.
- **벽면 타일 재질(`createWallPanelTexture()`)**: 매장 벽과 오른쪽 건물 벽 모두 32px 단위 타일 그리드 + 타일별 밝기/틴트 변화 + 그라우트(줄눈) 선 + 세로 얼룩으로 구성된 캔버스 텍스처를 입혀, 실제 외장 타일 클래딩처럼 보이게 했다. 확대해서 봤을 때 창문 사이/지붕 근처의 빈 평면이 그대로 드러나던 문제도 함께 해결된다.
- **차량 트래픽(`updateTraffic()`, `createCar()`)**: 배경 보행자 대신 저폴리 차량이 9~18초 간격으로 무작위 방향으로 도로 오른쪽(x=3.2/3.6 두 차선)에 등장해 헤드라이트/테일라이트를 켠 채 지나가고, 화면 범위를 벗어나면 제거된다. `animate()`의 `time` 기반 `dt`로 프레임과 무관하게 일정한 속도로 움직이며, 이동 거리에 비례해 바퀴가 회전한다. 차체는 범퍼·유리창(전/후/측면)·사이드미러·휠캡을 갖추고 색상이 매 스폰마다 랜덤(6종 팔레트)으로 바뀐다. 차선은 가로등 폴(최대 x≈1.95)과 오른쪽 건물 전면(x≈4.98) 사이 간격에 맞춰 잡아 가로등을 관통하던 문제를 없앴다.
- **플레이어**: 실린더/구/박스 조합으로 만든 로봇 아바타(`createPlayer`) 하나만 존재하고, 이동 중이 아닐 때는 카메라가 `CAM_OFFSET`만큼 떨어진 위치를 `lerp`로 뒤쫓는다. 배경 보행자 NPC는 (차량으로 대체하기로 해서) 계획에서 제외했다.
- **가로등(`createStreetlights`)**: 5개 노드 옆에 각각 하나씩, 폴 + 네온 스파인 + 전구 + 따뜻한 색 PointLight + 바닥 조명 웅덩이(반투명 Circle 2장)로 구성되어 있어 거리 분위기의 핵심을 담당한다. (예전엔 가로등마다 은은한 청록 fill PointLight도 하나씩 있었으나, 아래 성능 항목대로 제거했다 — 청록 색감은 발광 메시로 유지된다.)
- **렌더링/성능(`init()`)**: 여러 차례 "시간이 지날수록/처음부터 느려진다"는 피드백을 받아 프래그먼트 셰이더 부하를 집중적으로 줄였다.
  - `logarithmicDepthBuffer`를 껐다. 이 옵션은 큰 평면들의 z-파이팅을 막으려고 켜뒀던 것인데, 픽셀마다 `gl_FragDepth`를 직접 써서 GPU의 early-Z 최적화를 무력화하는 대표적 비용원이다. 씬이 작아 near 평면을 0.1 → 0.5로 올리는 것만으로 일반 깊이 버퍼 정밀도가 충분해 z-파이팅 없이 끌 수 있었다.
  - 활성 PointLight를 10개 → 5개로 반감했다(가로등당 2개 중 청록 fill 제거). `MeshStandardMaterial`은 픽셀마다 모든 광원을 순회하므로, 큰 도로/인도/벽 평면 위에서 광원 절반은 곧 조명 계산 절반이다.
  - `setPixelRatio` 상한을 2 → 1.5로 낮췄다. 고DPI 화면에서 2배 버퍼는 프래그먼트가 4배라, 프래그먼트 바운드인 이 씬에서 가장 큰 성능 레버다(1배 화면에서는 위 두 변경이 주효).
  - 차량은 스폰마다 지오메트리/머티리얼을 새로 만들므로 `disposeObject3D()`로 제거 시 반드시 해제한다(이전 세션에서 고친 누수). 위 변경들과 합쳐, 오래 켜둬도 프레임이 안정적으로 유지된다.
- **도로/인도(`init()`)**: 차도(아스팔트 + 점선 차선, `createRoadTexture`)와 인도(보도블록 줄눈, `createSidewalkTexture`)가 연석(curb Box)을 사이에 두고 분리되어 있다. 예전에 있던 `GridHelper`는 제거했다. 인도 높이(`SIDEWALK_HEIGHT`)는 처음 0.08유닛이었는데 실제 씬 스케일에서는 거의 안 보이는 차이라 "재질(텍스처)만 다른 같은 평면"처럼 보였다 — 0.22유닛으로 올리고 밝은 색 연석 상단 엣지 라인을 추가해 실제 단차가 있는 도로/인도로 눈에 띄게 구분되도록 했다. 이 인도 위에 서는 볼라드·가로수·그림자도 전부 `groundY` 오프셋을 받아 새 인도 높이 위에 정확히 얹히도록 `createStreetProps()` 시그니처를 함께 바꿨다.
- **하늘/원경**: `scene.background`가 순수 검정 대신 지평선→천정 그라디언트 `CanvasTexture`(`createSkyTexture`)이고, `FogExp2` 색을 그 하단 색과 맞춰뒀다. 골목 양 끝과 오른쪽 건물 뒤에는 `createSkylineBackdrop()`이 만든 원경 빌딩 실루엣 평면(점등 창 포함)이 있어 스카이라인이 비어 보이지 않는다.
- **대기감/분위기 디테일**: `createDustParticles()`가 걸어다니는 통로 부피 전체(x -4..6, y 0.3..6, z -30..18)에 `Points` 150개를 뿌려 `animate()`에서 매 프레임 위치 버퍼를 직접 갱신하며 느리게 떠다니게 한다. `createNeonFloorReflections()`는 매장 4곳 앞 바닥에 시안/간판색 반사 스트립을 얹어 젖은 노면처럼 보이게 하고, 간판과 같은 위상으로 깜빡인다. `createStreetlightHalos()`는 가로등 5개의 전구 위치에 가산 블렌딩 스프라이트로 저비용 블룸 효과를 낸다. `createVerticalSigns()`는 오른쪽 건물 3곳에 세로 네온 간판(HOTEL/24H/GAME)을 붙였다. 이 다섯 기능 전부 신규 `PointLight`/`SpotLight`를 추가하지 않고 `MeshBasicMaterial`/가산 블렌딩 스프라이트/`Points`만으로 구현해 조명 예산(가로등 5개 + 차량 헤드라이트)을 그대로 지켰다.
- **인터랙션**: 싱글클릭(도로/노드)=이동, 더블클릭(윈도우)=포커스+모달, 휠=FOV 줌, W/S·방향키=이전/다음 노드 이동. 이전에 있던 죽은 함수 `onPointerDown`(도달 불가능한 코드 포함)은 제거했다.
- **UI/UX 보강 (6종)**
  - **모달 닫기 UX**: 기존 `&times;` 버튼 외에 Escape 키(`onKeyDown` 최상단에서 `isMoving/isInspecting` 가드보다 먼저 처리 — 모달 오픈 상태 자체가 `isInspecting`이라 기존 가드를 그대로 두면 Escape가 막혔다)와 배경(backdrop) 클릭(`onModalBackdropClick`, `e.target === e.currentTarget`로 `.modal-content` 내부 클릭과 구분)으로도 `closeModal()`을 호출해 카메라 복귀 트윈이 항상 실행되도록 했다.
  - **가이드 박스 자동 숨김/재등장**: `.guide-box`가 부팅 9초 후(`GUIDE_HIDE_DELAY_MS`) 또는 첫 모달이 열리는 순간(`onFirstModalOpen`) 중 더 이른 시점에 `hidden-by-timer` 클래스로 페이드아웃된다. `pointerdown`/`keydown`/`wheel` 입력이 45초(`GUIDE_IDLE_REVIVE_MS`) 동안 없으면(`isInspecting`이 아닐 때) 다시 페이드인하고 숨김 타이머를 재시작한다.
  - **노드 트래커(미니맵 라이트)**: 화면 우측 고정 위치에 `WORLD_DATA.nodes` 5개에 대응하는 점 5개(`#node-tracker`, `buildNodeTracker()`)를 세로로 배치했다. 현재 노드의 점은 확대+청록 글로우(`active` 클래스, `navigateTo()`의 이동 루프에서 `updateNodeTrackerActive()` 호출로 갱신), 나머지는 어두운 회색이다. 점 클릭 시 `navigateTo(nodeId)` 호출. 데스크톱에서는 hover 시 좌측에 글래스 칩 라벨(노드 label)이 뜨고, 폭 520px 이하 세로 화면에서는 라벨을 숨기고 점만 남긴다. RESET VIEW 버튼·가이드 박스와 겹치지 않도록 배치했다.
  - **로딩 페이드아웃 + 첫 진입 페이드업**: `#loading`을 `display:none` 즉시 전환 대신 `opacity` 0.6초 트랜지션(`fade-out` 클래스) 후 `transitionend`(또는 700ms 폴백 `setTimeout`)에서 `display:none` 처리한다. 동시에 `#hud`/`.guide-box`가 초기 opacity 0 → `revealed` 클래스로 0.5초 페이드업되며, 가이드 박스는 약간(0.12초) 지연시켜 순차적으로 나타난다.
  - **쇼윈도우 3D 호버 피드백**: `onMouseMove`의 기존 레이캐스트에서 `userData.isContent`인 히트가 있으면 해당 매장 네온 프레임의 `hoverBoost`(1 → 1.6배, `setHoveredFrameSign()`)를 올려 `animate()`의 `neonSigns` flicker 루프가 자체 계산 위에 곱해서 밝기를 키운다(플리커 루프의 매 프레임 대입과 직접 충돌하지 않도록 참조 객체로 분리). 동시에 커서 근처에 글래스 칩 스타일 툴팁(`#hover-tip`, 매장 제목 + "더블클릭으로 보기")을 띄우고, hover가 아니면(`isContent` 미히트) 즉시 되돌린다. `createArcadeAlley()`에서 `shopWindow`/`clickZone` userData에 `frameSign`/`tooltipTitle`을 미리 연결해둔다. 터치 디바이스(`pointer: coarse`)에서는 툴팁을 띄우지 않는다.
  - **터치 인지형 가이드 텍스트 + 핀치 줌**: `window.matchMedia('(pointer: coarse)')`로 터치 기기를 감지하면(`applyTouchAwareGuideText()`) 가이드 문구를 "🚶 탭해서 이동" / "✨ 두 번 탭해서 보기" / "🤏 핀치 줌"으로 교체한다. 기존에는 핀치 줌이 구현되어 있지 않아 문구가 거짓이 될 뻔했으므로, 휠 핸들러(`onWheel`)의 `deltaY → targetFOV` 매핑과 동일한 방식으로 두 손가락 `touchstart`/`touchmove`/`touchend`(`onTouchStartPinch`/`onTouchMovePinch`/`onTouchEndPinch`, `getTouchDistance()`)를 최소 구현해 실제로 핀치 줌이 동작하도록 했다.
  - **버그(수정 완료 · 가이드 박스 중앙 정렬 깨짐)**: `.guide-box`는 `left: 50%` + `transform: translateX(-50%)`로 가운데 정렬하는데, 이후 추가한 첫 진입 페이드업(`.guide-box`↔`.revealed`)과 자동 숨김(`.hidden-by-timer`) 애니메이션이 각각 `transform: translateY(...)`만 넣어버렸다 — `transform`은 값 전체를 통째로 대체하는 단일 속성이라 "translateY만 추가"한 게 아니라 기존 `translateX(-50%)`를 그대로 지워버린 것이었다. 그 결과 가이드 박스가 화면 오른쪽으로 쏠려 보였다(폭의 절반만큼 어긋남). 세 상태(기본/`.revealed`/`.hidden-by-timer`) 모두 `transform: translateX(-50%) translateY(...)`로 두 변환을 한 값에 함께 넣도록 고쳤다. `#hud`는 애초에 `translateX`를 쓰지 않아(그리드 레이아웃으로 폭을 이미 채움) 같은 문제가 없다는 것도 확인했다. `preview_inspect`/`preview_eval`로 데스크톱과 390×844 세로 화면 양쪽에서 세 상태 모두 뷰포트 가로 중앙과의 오차가 0px임을 확인했다.
  - **모바일 확대/축소 버튼**: 휠 줌과 핀치 줌은 있었지만 발견성이 낮아, 화면 우하단(`#zoom-controls`, `right: 0.9rem`, 세로 화면 전용 미디어쿼리로 `bottom` 값을 노드 트래커·가이드 박스와 겹치지 않게 조정)에 `+`/`−` 원형 버튼 한 쌍을 추가했다. 탭 1회에 `targetFOV`를 8만큼 즉시 이동시키고(`stepTargetFOV()`), `pointerdown`을 누르고 있으면 120ms 간격(`ZOOM_BUTTON_REPEAT_MS`)으로 반복 이동하다가 `pointerup`/`pointerleave`/`pointercancel`(그리고 창 `blur`)에서 반드시 인터벌을 정리한다(`stopZoomButtonRepeat()`). `applyTouchAwareGuideText()`가 이미 쓰던 `isCoarsePointer()` 판정을 그대로 재사용해 `body.coarse-pointer` 클래스를 토글하고, CSS가 `body.coarse-pointer #zoom-controls { display: flex }`로 데스크톱(휠 사용 가능)에서는 숨긴다. 버튼의 `pointerdown` 핸들러에서 `e.stopPropagation()`으로 캔버스/윈도우의 내비게이션·핀치 리스너에 흘러들지 않게 막았다.
  - **RESET VIEW 버튼 아이콘화**: 텍스트 버튼 "RESET VIEW"를 42px 원형 글래스 아이콘 버튼(`.hud-button`)으로 바꿔 HUD를 정리했다. 아이콘은 이모지(🔄 등) 대신 `stroke="currentColor"`인 인라인 SVG(회전 화살표)로 그렸다 — 이모지 글리프는 폰트에 색이 고정되어 있어 CSS `color`를 무시하기 때문에 hover 시 `#aaa → #fff`로 바뀌어도 실제로는 그대로처럼 보인다는 문제가 [rogue](../rogue) 프로젝트(🏠/📺/🔇 아이콘)에서 이미 확인된 바 있어, 같은 이유로 처음부터 SVG를 택했다. 데스크톱(`hover: hover` and `pointer: fine`)에서는 버튼에 `data-tooltip="시점 초기화"`를 달고 CSS `::after`로 `#hover-tip`과 같은 글래스 칩 스타일 툴팁을 버튼 아래쪽에 띄우며, 모바일/터치에서는 툴팁 없이 아이콘 버튼만 남는다(터치 타겟 42px, ≥40px 요건 충족). `aria-label`/`title` 모두 "시점 초기화"로 달아 접근성을 보강했고 `onclick="resetPosition()"` 동작은 그대로다. 버튼이 텍스트 폭에 따라 늘어나던 기존 padding 기반 반응형 규칙(≤700px, ≤520px 세로, ≤520px 가로 미디어쿼리의 `.hud-button` padding/font-size 오버라이드)은 고정 크기 원형 버튼에 그대로 적용하면 타원으로 찌그러지므로 전부 제거했다.
    - **버그(수정 완료 · TDZ로 인해 로딩이 영원히 멈춤)**: 버튼 스텝 크기 상수(`ZOOM_BUTTON_STEP`/`ZOOM_BUTTON_REPEAT_MS`)를 처음엔 관련 함수들 바로 위, 즉 파일 하단(`applyTouchAwareGuideText()` 다음)에 `const`로 선언했다. 그런데 이 상수를 참조하는 `initZoomButtons()`는 `init()` 내부에서 호출되고, `init()`은 스크립트 맨 위쪽의 `init(); animate();` 호출로 파일 하단의 저 `const` 선언부에 실행이 도달하기 한참 전에 이미 실행된다 — 즉 `initZoomButtons()`가 먼저 실행되면서 아직 초기화되지 않은(TDZ) `const`를 읽어 `ReferenceError`가 났다. 이 예외가 `init()`을 멈춰 세워 로딩 스피너가 영원히 사라지지 않고 HUD/가이드 박스도 전혀 뜨지 않았다(2번째 SIGN_COLORS TDZ 버그와 근본 원인이 동일 — [13번 항목](#현재-구현-개요) 참고). `MIN_FOV`/`MAX_FOV` 등 다른 최상단 상수 옆, `init()` 호출보다 앞으로 상수 선언을 옮겨 해결했다.

## 개선 로드맵 — "네온 복도"에서 "가상 도시의 거리"로

Phase 1(거리의 골격)은 완료했다. 아래는 완료 표시와 함께 남은 항목이다. 각 페이즈는 독립적으로 완결되며, 앞 페이즈가 뒤 페이즈의 토대가 된다.

### Phase 1 — 거리의 골격 ✅ 완료

- ✅ **1-3. 하늘 그라디언트 + 원경 빌딩 실루엣** — `createSkyTexture()` + `FogExp2(0x1a0f30, 0.045)`에 더해 `createSkylineBackdrop()`으로 골목 양 끝(z≈±62~82)과 오른쪽 건물 뒤(x=50, 폭 120)에 각 2~4장의 대형 실루엣 평면을 배치했다. 각 평면은 `createSkylineSilhouetteTexture()`가 그린 어두운 건물 블록 + 듬성듬성한 점등 창(대부분 따뜻한 노랑, 일부 시안/마젠타 포인트) 텍스처를 쓴다. `MeshBasicMaterial`에 `fog: false`(FogExp2 0.045 밀도에서는 fog:true로 두면 평면이 거의 안 보이는 평평한 보라색으로 씻겨나가 버렸다 — 그래서 의도적으로 끔), `side: THREE.DoubleSide`(카메라가 항상 두 방향 배경막 사이에 있어 기본 앞면만으로는 한쪽에서 뒷면이 컬링됐다), `depthWrite: false`로 구성했다. `interactiveObjects`에는 넣지 않아 도로/윈도우 레이캐스트에 영향 없음.
- ✅ **1-2. 도로 단면** — 차도/인도/연석 분리, `GridHelper` 제거, 점선 차선 텍스처까지 구현.
- ✅ **1-1. 스키마 확장 + 오른쪽 벽** — `WORLD_DATA.buildings` 배열과 `createOppositeBuildings()`로 구현했다. 단, 원래 제안했던 "매장(shop)까지 포함한 단일 `buildings` 스키마 통합"은 하지 않았다 — 기존 `arcadeSlots`/`createArcadeAlley()`는 그대로 두고 오른쪽 전용 배열을 추가하는 저위험 경로를 택했다. 매장을 좌우로 자유 배치하려면 이 통합이 여전히 필요하다.
  - **버그(수정 완료 · 배경막 뒷면 컬링)**: 처음엔 `rotation.y`로 z<0 평면만 180도 돌려 "카메라를 향하게" 하려 했는데, `PlaneGeometry` 기본 법선(+z)과 카메라가 항상 두 배경막 사이(z 원점 부근)에서 바깥을 바라보는 구조상 회전 방향을 아무리 골라도 한쪽 평면은 뒷면이 컬링되어 안 보였다. `side: THREE.DoubleSide`로 바꿔 방향 계산 자체를 없앴다.

### Phase 2 — 밀도 (거리를 채우는 반복 소품과 파사드 디테일)

- ✅ **2-1. `InstancedMesh` 소품** — 볼라드 + 가로수 구현 (`createStreetProps()`). 쓰레기통·실외기·배관·표지판 등은 아직 없다.
- ✅ **2-2. 파사드 정보량 (세로 간판 포함)** — 오른쪽 건물에 프로시저럴 창문 텍스처(`createFacadeTexture`, 랜덤 점등)에 더해, 매장 벽/오른쪽 건물 벽 전체에 패널 줄눈+얼룩 텍스처(`createWallPanelTexture`)를 입혀 창문 사이·지붕 근처의 빈 평면을 보강했다. 여기에 `createVerticalSigns()`로 오른쪽 건물 3곳(x≈4.88, z=9/-7/-15)에 한국식 세로 간판을 추가했다 — `createVerticalSignTexture()`가 글자 하나당 한 행씩 세로로 그린 캔버스 텍스처(HOTEL/24H/GAME, 각각 마젠타/연두/황색)를 `MeshBasicMaterial`에 입히고 뒤에 어두운 백킹 박스를 붙였다.
  - **버그(수정 완료 · 백킹 박스가 간판을 가림)**: 처음엔 간판을 x=4.97, 백킹 박스를 x=4.94에 둬서 "박스가 간판보다 살짝 뒤"라고 생각했는데, 실제로는 도로/카메라가 항상 건물보다 작은 x값에 있어 x가 작을수록 카메라에 더 가깝다 — 그래서 박스(4.94)가 간판(4.97)보다 카메라에 더 가까워 간판을 완전히 가렸다. 간판을 4.88(도로 쪽, 카메라에 더 가까움), 박스를 4.96(벽 쪽, 더 멂)으로 뒤바꿔 해결했다.
- ✅ **2-3. 젖은 노면 / 네온 바닥 반사** — 실제 `Reflector`/환경맵 대신 저비용 안으로: `createNeonFloorReflections()`가 매장 4곳 앞 바닥에 시안색 반사 스트립(프레임과 동일 색, opacity 0.13)과 그 위에 타이틀 간판과 같은 색의 작은 스트립을 얹었다(`MeshBasicMaterial` + `AdditiveBlending`, `depthWrite:false`, y=0.02~0.03로 기존 가로등 웅덩이와 z-fighting 방지). 색깔 스트립은 `neonSigns`를 건드리지 않고 별도 배열 `neonFloorReflections`에 담아, 해당 간판과 동일한 시드(`slotIndex*2.3+4`)로 `animate()`에서 opacity를 함께 흔들어 간판과 반사가 같은 위상으로 깜빡인다.
- ⬜ **2-4. 조명 예산 관리** — 가로등 5개(PointLight 10개) + 차량 헤드라이트(활성 차량당 PointLight 1개, 동시 존재 대수가 적어 예산 내). 앞으로 라이트를 추가할 때 지킬 규칙으로 유효.

### Phase 3 — 생기 (정지 화면을 살아있는 거리로)

- ✅ **3-1. 네온 flicker** — 위상이 다른 이중 사인파 + 드문 글리치 드롭으로 구현 (`animate()`의 `neonSigns` 루프).
- ✅ **3-2. 배경 움직임 (보행자 → 차량으로 변경)** — 배경 보행자 NPC 대신 저폴리 차량(`createCar()`)이 `updateTraffic()`을 통해 9~18초 간격으로 도로 오른쪽 차선에 무작위 등장해 지나간다. 헤드라이트/테일라이트 + PointLight 하나, 유리창·범퍼·사이드미러·휠캡·회전하는 바퀴를 갖췄고 화면 밖으로 나가면 정리된다. 차선 위치는 가로등 폴과 겹치지 않도록 조정했다(처음 버전은 차가 가로등을 그대로 관통하는 버그가 있었다).
  - **치명적 버그(수정 완료)**: 스폰 시 `car.userData = { direction, speed }`로 객체를 통째로 덮어써서 `createCar()`가 넣어둔 `wheels` 배열이 사라졌고, 다음 프레임 `car.userData.wheels.forEach(...)`가 예외를 던져 `updateTraffic()` 밖으로 전파 → `animate()`의 `renderer.render()`까지 스킵되며 **화면 전체가 그대로 멈췄다**(클릭해도 화면이 안 바뀌고 차도 안 보이는 것처럼 보였던 원인). `car.userData.direction = direction; car.userData.speed = ...;`처럼 필드만 덧붙이는 방식으로 고쳤다.
  - **메모리 누수(수정 완료)**: `createCar()`는 스폰마다 지오메트리 ~20개 + 머티리얼 ~8개 + `PointLight` 1개를 새로 만드는데, `updateTraffic()`이 차를 치울 때 `scene.remove(car)`만 호출하고 `.dispose()`는 부르지 않았다. 9~18초마다 차가 끝없이 스폰/디스폰되므로 GPU/JS 메모리가 페이지를 켜둔 시간에 비례해 계속 쌓였고, 이게 "시간이 지날수록 느려지는" 증상의 원인이었다. `disposeObject3D(root)`를 추가해 제거되는 차의 모든 자식 메시를 순회하며 geometry·material·(emissive)map을 `dispose()`하도록 고쳤다 — `renderer.info.memory.geometries`로 스폰/디스폰 20회를 반복해도 지오메트리 개수가 그대로 유지되는 것까지 확인했다.
- ✅ **3-3. 대기 입자** — `createDustParticles()`가 `THREE.Points` 하나(150개, 걸어다니는 통로 x -4..6 / y 0.3..6 / z -30..18 범위)를 만들고, `animate()`에서 매 프레임 `position` 버퍼를 직접 mutate한다(느린 sine 좌우 흔들림 + 아주 느린 상승 드리프트, y가 6을 넘으면 바닥으로 wrap). 기준 좌표(`dustBasePositions`)와 개별 위상(`dustSeeds`)만 최초 1회 생성해두고 매 프레임 새 배열을 만들지 않는다. `PointsMaterial`은 `sizeAttenuation:true`, `AdditiveBlending`, `depthWrite:false`, opacity 0.35의 미색(0xfff2df)이다.
- ⬜ **3-4. 앰비언트 사운드.** [rogue](../rogue) 프로젝트에서 검증한 Web Audio API 합성 패턴(브라운 노이즈 저역 필터 + 60Hz 사인파 험)을 재사용. 자동재생 정책 때문에 첫 클릭 시 `AudioContext`를 resume해야 하며, HUD에 음소거 토글이 필요하다.
- ✅ **(로드맵 외 보너스) 가로등 헤일로 스프라이트** — `createStreetlightHalos()`가 가로등 5개의 전구 위치에 방사형 그라디언트 `CanvasTexture`(따뜻한 색 중심 → 투명) 1장을 공유하는 `THREE.Sprite`를 하나씩 얹었다(`AdditiveBlending`, `depthWrite:false`, scale 1.6~2.2). 포스트프로세싱 없이 저비용으로 전구 블룸을 흉내낸다 — 새 `PointLight`/`SpotLight`는 추가하지 않았다(가로등 5개 + 차량 헤드라이트 예산 그대로 유지).

### Phase 4 — 이동과 카메라의 자유도 (미착수)

- ⬜ **4-1. 교차로.** 노드에 x축 분기를 추가한다(예: n2에서 x=-14 방향 골목). `handleRoadClick`이 현재 z축 부호 비교만 하므로, "클릭 지점에서 가장 가까운 이웃 노드"를 고르는 방식으로 일반화해야 한다.
- ⬜ **4-2. 카메라 궤도 회전.** 마우스/터치 드래그로 `CAM_OFFSET`을 플레이어 중심 구면 좌표로 ±35° 회전, 놓으면 기본 각도로 복귀. 드래그와 클릭 구분은 pointerdown→pointerup 이동 거리 임계값(~5px)으로.
- ⬜ **4-3. 노드 사이 시선 유도.** 이동 중 lookAt 목표를 다음 노드 방향으로 살짝 선행시켜 걷는 방향으로 시선이 따라가게 한다.

### 코드 정리

- ✅ `onPointerDown` 죽은 함수 삭제.
- ⬜ `renderer.outputEncoding = THREE.sRGBEncoding`을 쓰면서 `MeshStandardMaterial` 색들이 눈대중 보정되어 있다. Phase 2/3에서 색을 더 만질 때 한 번에 정리.
- ⬜ 매장 텍스처 원본이 Unsplash 핫링크다(`city/assets/`에 로컬 사본을 두는 편이 안전).

### 다음 추천 순서

| 순서 | 항목 | 상태 |
|---|---|---|
| 1 | 1-1 남은 갭: 매장까지 포함한 `buildings` 스키마 통합 | 미착수 — 매장을 좌우 자유배치하려면 필요 |
| 2 | 3-4 앰비언트 사운드 | 미착수 — rogue 패턴 재사용 가능, 차량 지나가는 소리와도 잘 어울림 |
| 3 | 4-1/4-2 교차로 + 카메라 궤도 회전 | 미착수 — 가장 구조적인 변경 |
| 4 | 2-4 조명 예산 정책 문서화 | 진행 중 — 새 기능 추가 때마다 규칙만 지키면 됨(PointLight/SpotLight 신규 추가 금지) |

## 실행 방법

빌드 없이 `index.html`을 브라우저에서 열면 바로 실행된다. 로컬 미리보기 시 정적 서버(예: `python -m http.server`, 이 저장소는 `.claude/launch.json`에 `city-static`(포트 8792)로 등록되어 있다)로 열어야 `THREE.TextureLoader`의 원격 이미지 로드가 정상 동작한다.
