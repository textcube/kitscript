# Model2Sprite

`model/index.html` 하나로 동작하는 정적 HTML 페이지. 3D 모델(GLB/GLTF/FBX)을 브라우저에서 불러와 애니메이션을 재생하고, 프레임을 PNG로 연속 캡처해 ZIP으로 묶거나 WebM 영상으로 녹화해 다운로드하는 도구다. "BUNTGAMES" 브랜딩의 사이버펑크 HUD 스타일 UI를 갖춘 3D 뷰어 겸 애니메이션 프레임 덤프 유틸리티다.

> 참고: 버튼 라벨은 "GEN_SPRITE_PACK(스프라이트 팩 생성)"이지만, 실제 코드는 여러 프레임을 격자로 합친 **스프라이트시트 이미지 한 장을 만들지 않는다**. `frame_0000.png`, `frame_0001.png` … 형식의 개별 PNG 프레임들을 JSZip으로 압축한 ZIP 파일을 내려받는 방식이다. 아래 문서는 실제 동작 기준으로 작성했다.

## 주요 기능

### 시연 모드 (Demo / Attract Mode)
- 페이지 첫 로드 시 자동 시작. 데모 모델을 차례대로 로드해 모델당 약 14초씩 보여주고, 마지막 모델 후 첫 모델로 무한 순환
- 시연 중 카메라 자동 궤도 회전(`OrbitControls.autoRotate`), 애니메이션 자동 재생, 클립이 여러 개면 5초 간격으로 순환 재생
- 캔버스 상단에 `DEMO_MODE // INTERACT_TO_START` 배너와 현재 데모 모델 이름(`ASSET: ...`) 표시
- **중단 조건**: `pointerdown` / `wheel` / `keydown` / `touchstart` 중 하나가 감지되면 즉시 시연 종료 — 자동 회전·전환 타이머·이벤트 리스너를 모두 정리하고, 현재 표시 중인 모델은 그대로 유지한 채 일반 작업 모드로 전환 (단순 마우스 이동으로는 끊기지 않음)
- 탭이 백그라운드로 가면(`visibilitychange`) 모델/클립 전환 타이머 일시정지, 복귀 시 재개
- 모델 전환 시 기존 `disposeModel()` 정리 로직을 그대로 사용해 메모리 누수 없음. 시연 모델 로드 도중 사용자가 개입하면 토큰 가드(`demoLoadToken`)가 늦게 도착한 로드 결과를 무시하고 폐기
- 데모 모델이 모두 로드 실패하면(전체 순회 실패) 시연을 자동 중단하고 에러 로그 표시

#### 데모 모델 추가 방법
1. 모델 파일(`.glb`/`.gltf`/`.fbx`)을 `model/demo/` 폴더에 넣는다.
2. `model/demo/manifest.json`의 `models` 배열에 파일명을 나열한다 (나열 순서대로 재생):
   ```json
   {
     "models": ["robot.glb", "dragon.fbx"]
   }
   ```
3. `manifest.json`이 없거나 fetch에 실패하거나 `models`가 비어 있으면, 폴백으로 threejs.org의 `RobotExpressive.glb` 샘플 하나로 시연이 계속 동작한다.

### 모델 로딩
- 로컬 파일 업로드: `<input type="file" accept=".glb,.gltf,.fbx">` — `FileReader.readAsArrayBuffer()`로 읽어 `THREE.GLTFLoader.parse()` 또는 `THREE.FBXLoader.parse()`로 파싱
- 미지원 확장자는 에러 로그와 함께 거부, 100MB 초과 파일은 경고 로그를 남기고 진행
- 파싱/읽기 실패 시 터미널 로그에 에러 표시 (GLTF `onError` 콜백, `FileReader.onerror` 처리)
- 샘플 모델 원클릭 로드: `https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb`를 원격 스트리밍
- 로드 성공 시 모델 바운딩 박스를 계산해 카메라를 자동 프레이밍
- 모델 교체 시 이전 모델의 geometry/material/texture를 `dispose()`하여 GPU 메모리 해제
- `gltf.animations` / `fbx.animations`로 애니메이션 클립 목록을 사이드바에 렌더링, 클릭으로 클립 전환

### 3D 뷰어 / 씬 구성
- 렌더링: Three.js `WebGLRenderer` (`alpha: true`, `antialias: true`, `preserveDrawingBuffer: true`)
- 카메라: `PerspectiveCamera(fov 45, near 0.1, far 1000)` + `OrbitControls`(damping 적용)
- 조명: `AmbientLight`(기본 0.4) + `DirectionalLight`(기본 1.2), 슬라이더로 실시간 조절(각각 0~4, 0~10 범위)
- `GridHelper` 표시/숨김 토글
- 배경 모드 3종: 알파 투명 / 크로마키 그린(`#00FF00`) / 커스텀 HEX 색상
- 카메라 프리셋 버튼: Front / Side / Top / Back (모델 바운딩 박스 기준 자동 거리 계산)
- 재생 컨트롤: 재생/정지, 타임라인 스크러버(`AnimationMixer.setTime`), 재생 속도 슬라이더(0.1x~2.0x)
- 모바일(md 미만): 좌우 사이드바가 오버레이 방식으로 접히며 화면 상단의 토글 버튼으로 여닫음 (데스크톱 레이아웃은 기존과 동일)

### 출력 해상도 지정
- 우측 Actions 섹션의 `OUTPUT_RESOLUTION` 셀렉트에서 선택: `VIEWPORT_NATIVE`(현재 캔버스 크기, 기본값) / 256 / 512 / 1024 / 2048 (정사각형)
- 고정 해상도 선택 시 내보내기 동안 렌더러 크기·pixelRatio(1)·카메라 종횡비를 고정하고, 완료/실패와 관계없이 `finally`에서 원래 뷰포트로 복원
- PNG ZIP과 WebM 영상 내보내기 모두에 적용

### PNG 프레임 내보내기 ("GEN_SPRITE_PACK")
- 고정 30fps로 클립 길이(`duration`)만큼 프레임 수 계산 (`Math.ceil(duration * 30)`)
- 프레임마다 `mixer.setTime()` → `renderer.render()` → `canvas.toDataURL('image/png')`
- 그리드는 캡처 중 자동으로 숨김 처리 후 복원
- 모든 프레임을 `frame_0000.png` 형식으로 JSZip에 담아 ZIP으로 다운로드
- 다운로드 파일명: `{모델명}_{클립명}_{타임스탬프}.zip` (파일명 부적합 문자는 `_`로 치환)
- 진행률 오버레이(퍼센트 표시) 제공

### WebM 영상 내보내기 ("GEN_VP9_VIDEO")
- `MediaRecorder.isTypeSupported()`로 코덱 사전 확인: `vp9` → `vp8` → 기본 `video/webm` 순으로 폴백, 전부 미지원이면 에러 로그 후 중단 (Safari 등 대응)
- `canvas.captureStream(30)` + `MediaRecorder`로 실시간 녹화 (레코더 생성은 try/catch로 보호)
- 녹화 중 프레임마다 `mixer.setTime()` → `renderer.render()`를 `setTimeout(1000/30)` 간격으로 반복
- 다운로드 파일명: `{모델명}_{클립명}_{타임스탬프}.webm`

### UI
- 좌측 사이드바: 파일 업로드, 샘플 로드, 애니메이션 클립 목록, 실시간 터미널 로그(`addLog()` — INFO/SUCCESS/WARN/ERROR 색상 구분)
- 우측 사이드바: 조명/재생/배경/그리드 설정, 출력 해상도 선택, PNG·WebM 내보내기 버튼
- 중앙: 캔버스 뷰포트, 상단 HUD, 하단 타임라인 및 카메라 뷰 프리셋, 내보내기 진행 오버레이

## 사용 방법

0. **시연 모드**: 페이지를 열면 데모 모델이 자동으로 순환 재생된다. 클릭/휠/키 입력/터치 중 아무거나 하면 시연이 멈추고 현재 모델을 그대로 이어서 작업할 수 있다.
1. **모델 로드**: 좌측 `LOAD_LOCAL_MESH`로 `.glb`/`.gltf`/`.fbx` 파일을 업로드하거나 `LOAD_SHOWREEL_ASSET`으로 샘플 로봇 모델을 불러온다. (모바일에서는 좌상단 패널 버튼으로 사이드바를 연다.)
2. **애니메이션 선택**: `Motion_Index` 목록에서 원하는 클립을 클릭해 활성화한다.
3. **씬 설정**: 우측 패널에서 조명 강도, 재생 속도, 배경 모드(투명/그린/커스텀), 그리드 표시 여부를 조정한다. 카메라는 마우스 드래그(Orbit)나 Front/Side/Top/Back 버튼으로 맞춘다.
4. **출력 해상도 선택**: `OUTPUT_RESOLUTION`에서 원하는 정사각 해상도를 고르거나 `VIEWPORT_NATIVE`로 현재 캔버스 크기를 그대로 쓴다.
5. **내보내기**:
   - `GEN_SPRITE_PACK` 클릭 → 현재 선택된 클립을 30fps로 프레임별 PNG 캡처 → ZIP으로 자동 다운로드
   - `GEN_VP9_VIDEO` 클릭 → 동일 클립을 30fps로 실시간 녹화 → WebM 파일로 자동 다운로드
   - 두 버튼 모두 모델이 로드되어 있어야 활성화되며, 내보내기 중에는 중복 실행이 차단된다.

## 기술 구성

| 라이브러리 | 버전/출처 | 용도 |
|---|---|---|
| Tailwind CSS | `cdn.tailwindcss.com` (Play CDN — 프로토타입용, 프로덕션은 빌드 CSS 권장 주석 명시) | 전체 스타일링 |
| Three.js | r128, `cdnjs.cloudflare.com` | 3D 렌더링 엔진 |
| GLTFLoader / FBXLoader / fflate / OrbitControls | `three@0.128.0` examples, jsDelivr | 모델 로더, 압축 해제, 카메라 컨트롤 |
| JSZip | 3.10.1, `cdnjs.cloudflare.com` | PNG 프레임 ZIP 압축 |
| Lucide Icons | 0.294.0 (버전 고정), `unpkg.com` | 아이콘 |
| Google Fonts (JetBrains Mono) | `fonts.googleapis.com` | 본문 폰트 |

핵심 브라우저 API: `FileReader`, `HTMLCanvasElement.toDataURL()`, `HTMLCanvasElement.captureStream()`, `MediaRecorder`(+`isTypeSupported`), `URL.createObjectURL()`/`revokeObjectURL()`.

모든 로직이 `model/index.html` 하나의 `<script>` 블록에 있으며 빌드 단계 없이 정적으로 동작한다. 유일한 부가 리소스는 시연 모드용 `model/demo/manifest.json`(선택 사항 — 없어도 폴백으로 동작)이다.

## 개선 이력 (Improvements — 적용됨)

코드 분석에서 발견된 11개 문제를 모두 `model/index.html`에 반영했다.

| # | 문제 | 적용된 수정 | 상태 |
|---|---|---|---|
| 1 | 미지원 확장자 업로드 시 로딩 스피너가 영원히 회전 | 파일 선택 직후 확장자 검사 → `UNSUPPORTED_FORMAT` 에러 로그 후 조기 반환, input 값 초기화 | 적용됨 |
| 2 | 로더 파싱 실패가 조용히 무시됨 | `GLTFLoader.parse()`에 `onError` 콜백 추가, `FileReader.onerror` 처리, 에러 메시지를 로그에 포함, 스피너 해제 보장 | 적용됨 |
| 3 | 모델 교체 시 GPU 리소스 미해제 | `disposeModel()` 추가 — `traverse()`로 geometry/material(배열 포함)/texture `dispose()`, 교체 직전 호출 + `mixer.stopAllAction()` | 적용됨 |
| 4 | Object URL 미해제 | `downloadBlob()` 공통 함수로 다운로드 후 `setTimeout`으로 `URL.revokeObjectURL()` 호출 (PNG ZIP·WebM 공용) | 적용됨 |
| 5 | MediaRecorder가 미지원 브라우저에서 예외로 중단 | `pickVideoMimeType()`으로 `vp9 → vp8 → video/webm` 폴백 탐색, 전부 미지원 시 에러 로그 후 중단, 레코더 생성 try/catch | 적용됨 |
| 6 | 내보내기 해상도가 창 크기·DPR에 좌우 | `OUTPUT_RESOLUTION` 셀렉트(256/512/1024/2048/네이티브) 추가, `applyExportResolution()`/`restoreViewport()`로 고정·복원, try/finally로 실패 시에도 복원 보장 | 적용됨 |
| 7 | 다운로드 파일명 고정값 | `buildExportName()` — `{모델명}_{클립명}_{YYYYMMDDHHMMSS}` 조합, `sanitizeName()`으로 부적합 문자 `_` 치환 | 적용됨 |
| 8 | 파일명·클립명 `innerHTML` 삽입 (XSS) | `addLog()`를 `textContent` 기반 DOM 생성으로 교체(색상/구조 유지), 클립명은 `querySelector` 후 `textContent`로 주입 | 적용됨 |
| 9 | 모바일에서 레이아웃 붕괴 | 사이드바를 `fixed md:static` + translate 오버레이로 전환, md 미만 전용 토글 버튼 2개 추가, `max-w-[85vw]` 제한. 데스크톱(md+)은 기존 레이아웃 그대로 | 적용됨 |
| 10 | 대용량 파일 무경고 처리 | 100MB 초과 시 `LARGE_FILE_WARNING` 경고 로그(노란색 WARN 타입 신설) 후 진행 — 차단하지 않음 | 적용됨 |
| 11 | CDN 버전 미고정 | Lucide `@latest` → `0.294.0` 고정. Tailwind Play CDN은 유지하되 프로덕션 권장사항 주석 추가 | 적용됨 |

### 남은 개선 여지 (미적용)
- **대용량 파일 파싱의 Web Worker 분리**: 경고 로그(#10)로 완화했으나, 파싱 자체는 여전히 메인 스레드에서 실행된다. Three.js 로더를 Worker로 옮기는 작업은 단일 파일 구조에서 변경 범위가 커서 보류.
- **Tailwind Play CDN 교체**: 빌드 파이프라인이 없는 단일 파일 철학을 유지하기 위해 주석 안내로 대체.
