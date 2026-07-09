# Motion Factory

Motion Factory는 이미지와 텍스트 레이어에 간단한 모션을 적용하고 **PNG / GIF / WebM**으로 내보낼 수 있는 단일 HTML 기반 모션 편집기입니다. 별도 빌드 없이 `motion/index.html`을 브라우저에서 열어 사용할 수 있습니다.

## 주요 기능

| 영역 | 내용 |
|---|---|
| 레이어 | 이미지 다중 업로드, 텍스트 레이어 추가, 레이어 순서 변경, 삭제, 썸네일 목록 |
| 편집 | 캔버스 드래그 이동, Scale / Rotation / Opacity 조절 |
| 애니메이션 | Slide / Zoom / Float / Bounce / Wobble / Spin, easing, delay, duration, loop, amplitude 설정 |
| 크로마키 | 이미지 레이어의 green / blue screen 배경 제거, threshold / softness 조절 |
| 타임라인 | 재생 / 일시정지, 현재 시간 이동, 전체 길이와 FPS 설정 |
| 해상도 | 16:9 HD, 16:9 FHD, 1:1 Square, 9:16 Mobile 프리셋 |
| 내보내기 | 현재 프레임 PNG, gif.js 기반 GIF, MediaRecorder 기반 WebM |
| 저장 | Firebase 환경 변수가 있으면 Firestore, 없으면 IndexedDB 로컬 저장 |
| 시작 데모 | 저장된 작업이 없으면 `motion/images/`의 배경 1개와 캐릭터 6개로 자동 시연 장면 실행 |
| 리셋 | Reset 버튼으로 현재 작업과 저장본을 비우고 자동 시연 장면 재시작 |

## 실행 방법

`motion/index.html`을 브라우저에서 엽니다.

CDN 스크립트로 Lucide, gif.js, Firebase SDK를 불러오므로 인터넷 연결이 필요합니다. Firebase 설정이 주입되지 않은 일반 정적 실행 환경에서는 자동으로 `LOCAL (INDEXED)` 모드가 사용됩니다.

## 자동 시연 모드

페이지 시작 시점에 복구할 저장 작업이 없고 레이어가 비어 있으면 다음 자산으로 1:1 공연장 샘플 장면을 만듭니다.

- `images/performance-hall.png`
- `images/harpist.png`
- `images/pianist.png`
- `images/soprano.png`
- `images/cellist.png`
- `images/flutist.png`
- `images/trumpeter.png`

데모는 저장되지 않습니다. 사용자가 파일 업로드, 텍스트 추가, 캔버스 조작, 타임라인 조작, 속성 변경, 레이어 이동/삭제, 해상도/길이 변경을 시작하면 자동 재생이 중단되고 현재 레이어를 그대로 편집할 수 있습니다.

## 구조 개요

- `ProStorage`: IndexedDB 저장소 래퍼입니다.
- `Easing`: 애니메이션 보간 함수 모음입니다.
- `app.layers`: 레이어 상태의 단일 소스입니다.
- `app.draw()`: 현재 시간 기준으로 모든 레이어 변환과 애니메이션을 계산해 캔버스에 렌더링합니다.
- `updateLayerUI()`, `updateTimelineUI()`, `updatePropertiesUI()`: 상태를 각 패널 UI에 반영합니다.
- `startDemoMode()`: 빈 작업 공간에서 샘플 레이어를 만들고 자동 재생을 시작합니다.
- `resetWorkspace()`: 저장본과 현재 레이어를 비운 뒤 데모 장면을 다시 시작합니다.

## 검토된 개선 사항

이번 정리에서 적용한 항목:

1. 초기 `setResolution()`이 빈 작업을 저장하지 않도록 silent 옵션을 추가했습니다.
2. 저장된 작업이 없을 때만 자동 시연 모드를 시작하도록 했습니다.
3. 사용자 입력 시작 시 데모 재생을 중단하도록 주요 입력 지점을 연결했습니다.
4. Reset 버튼과 IndexedDB 삭제 메서드를 추가했습니다.
5. 레이어 목록의 깨진 툴팁 문구와 인라인 핸들러를 정리하고, 레이어명은 `textContent`로 렌더링하도록 개선했습니다.

추가로 고려할 만한 항목:

1. WebM 내보내기는 실시간 `setTimeout` 기반이라 긴 렌더링에서 길이 오차가 날 수 있습니다. `captureStream(0)`과 `requestFrame()` 기반 프레임 캡처로 바꾸면 더 정확합니다.
2. GIF/WebM 렌더링 중 진행률 표시가 있으면 긴 작업의 체감 품질이 좋아집니다.
3. 크로마키는 매 프레임 픽셀 루프를 수행합니다. threshold/softness가 바뀔 때만 오프스크린 결과를 캐시하면 성능을 줄일 수 있습니다.
4. 텍스트 속성 편집 UI, 키보드 단축키, 레이어 표시/숨김 토글, Undo/Redo를 추가하면 편집성이 좋아집니다.
5. CDN 버전을 고정하거나 로컬 번들 옵션을 두면 장기 안정성이 좋아집니다.

## 라이선스 / 참고

- 아이콘: [Lucide](https://lucide.dev/)
- GIF 인코딩: [gif.js](https://jnordberg.github.io/gif.js/)
