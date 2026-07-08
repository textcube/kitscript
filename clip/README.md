# Clipboard Pro (Local Clipboard Manager PRO)

브라우저에서 동작하는 로컬 클립보드 매니저. 텍스트/이미지 클립보드 항목을 IndexedDB에 저장하고, 카드형 히스토리 UI에서 편집·복사·QR 공유를 지원하는 단일 HTML 파일(`index.html`) 앱이다.

## 주요 기능

- **클립보드 스캔**: `navigator.clipboard.read()`로 시스템 클립보드의 텍스트/이미지를 가져오기 (SCAN CLIPBOARD 버튼)
- **붙여넣기 캡처**: 페이지에 Ctrl+V 하면 자동으로 히스토리에 추가
- **인라인 편집**: 텍스트 카드를 textarea로 직접 수정, 변경 시 SAVE 버튼 표시 후 수동 저장
- **복사**: 텍스트는 Clipboard API(+`execCommand` 폴백), 이미지는 `ClipboardItem`(실패 시 파일 다운로드 폴백)
- **QR 공유**: 1,000자 이하 텍스트를 QR 코드로 변환해 휴대폰으로 전송 (iPhone Live-Text 안내 포함)
- **검색/필터**: 텍스트 검색 + 타입 필터(All/Text/Image)
- **핀 고정**: 자주 쓰는 항목을 상단 고정, 저장 한도 정리 대상에서 제외
- **로컬 저장**: IndexedDB(`ClipboardDB` v4, `history` 스토어)에 저장, 한도는 설정에서 50/100/200/500 선택
- **내보내기/가져오기**: 히스토리를 JSON으로 export/import (이미지 dataURL 포함)
- **기타**: 전체 삭제 확인 모달, 인페이지 라이트박스 이미지 확대, 상대 시간 표시, 스택형 토스트 알림, Escape 모달 닫기

## 디자인

BizCard Pro(`bizcard/index.html`)와 동일한 프리미엄 다크 테마를 공유한다:

- 딥 네이비(`#0b0f1a` → `#05070d`) 배경 + 보라/골드 radial-gradient 워시 (고정 배경)
- 글래스모피즘 패널: 반투명 화이트 배경 + backdrop-blur, 1px 화이트 보더, 16px radius
- 포인트 컬러: 골드 `#e8c674`(섹션 타이틀, QR Share, 핀 글로우) / 보라 `#8b5cf6`(주요 버튼, 카드 호버 글로우)
- 로고: 골드→화이트→보라 gradient text, Inter 폰트(Google Fonts)
- QR 코드 영역은 스캔 가능성을 위해 흰 배경 유지

## 기술 스택

| 항목 | 내용 |
|---|---|
| UI | Tailwind CSS (CDN 스크립트) |
| QR 생성 | qrcode-generator 1.4.4 (CDN) |
| 저장소 | IndexedDB (실패 시 메모리 전용 모드 폴백), 설정값은 localStorage |
| 백엔드 | 없음 (완전 로컬 동작) |

## 구조

- 모든 로직이 `index.html` 내 단일 `<script type="module">`에 존재: `AppState`(상태), `storageManager`(IndexedDB), `historyManager`(CRUD), `clipboard`(읽기/처리), `ui`(렌더링·모달·토스트)
- 렌더링은 카드 단위 DOM 추가/제거/갱신 방식 (`ui.cardEls` Map 기반) — 편집 중인 다른 카드의 포커스·미저장 내용이 유지됨
- 이벤트는 `document` 단일 클릭 리스너 + `data-action`/`data-id` 속성 기반 이벤트 위임

## 개선안 (2026-07-08 적용 완료)

아래는 최초 분석 시점의 개선안이며, 각 항목 끝에 적용 여부가 표시되어 있다.

### 1. 불필요한 의존성 제거 (우선순위: 높음)

- **Firebase 제거**: import 후 익명 로그인만 하고 데이터 동기화에 전혀 사용하지 않음. 설정(`__firebase_config`)도 없어 항상 local-only 모드로 동작 → 모듈 3개 로드 비용만 발생. 완전 제거 권장. — ✅ 적용됨
- **jsQR 제거**: QR *스캔* 기능이 없으므로 로드할 이유가 없음. — ✅ 적용됨
- **Tailwind CDN**: 프로덕션 비권장(콘솔 경고 발생). 이 저장소의 다른 페이지와 일관성을 위해 유지하되, 장기적으로 빌드된 CSS 또는 인라인 스타일 전환 고려. — ✅ 적용됨 (결정대로 CDN 유지, 변경 없음)

### 2. 렌더링 및 상태 관리 (우선순위: 높음)

- **전체 재렌더 문제**: 항목 추가/삭제/저장 시 `container.innerHTML` 전체 재구성 → 편집 중이던 다른 textarea의 포커스·커서·스크롤 위치가 소실됨. 항목 단위 DOM 추가/제거로 변경 필요. — ✅ 적용됨 (`ui.placeCard`/`ui.removeCardFromDOM`/`ui.cardEls` 기반 단위 갱신)
- **저장 시 재렌더로 편집 내용 초기화 위험**: `historyManager.update()`가 `ui.render()`를 호출해 다른 카드의 미저장 편집 내용이 날아감. — ✅ 적용됨 (`update()`는 전체 렌더를 호출하지 않고 해당 카드의 Save 버튼만 갱신)
- **인라인 onclick 제거**: 이벤트 위임(container에 단일 리스너)으로 교체하면 전역 `window.*` 함수와 id 문자열 결합을 없앨 수 있음. — ✅ 적용됨 (`document`에 단일 클릭 리스너 + `data-action`/`data-id`, `window.*` 전역 함수 전부 제거)

### 3. 기능 개선 (우선순위: 중간)

- **검색/필터**: 히스토리가 쌓이면 찾기 어려움. 텍스트 검색 + 타입(텍스트/이미지) 필터 추가. — ✅ 적용됨
- **핀(고정) 기능**: 자주 쓰는 항목을 상단 고정, maxItems 정리 대상에서 제외. — ✅ 적용됨 (IndexedDB `pinned` 필드, 기존 항목은 로드시 `false`로 정규화)
- **설정 실질화**: Settings 모달이 현재 표시 전용. `maxItems`(저장 한도) 변경, 다크 모드 토글(AppState.settings.theme이 선언만 되어 있음)을 실제 동작하게 구현. — `maxItems` 변경(50/100/200/500, localStorage 저장)은 ✅ 적용됨. 다크 모드 토글은 이후 BizCard Pro 스타일 다크 테마를 기본 적용하면서 불필요해짐 (앱 전체가 다크 전용).
- **내보내기/가져오기**: 히스토리를 JSON으로 export/import (이미지 포함). — ✅ 적용됨 (사이드바 Quick Tools, dataURL 포함)
- **중복 감지 개선**: 현재 최상단 1개와만 비교 → 전체 히스토리에서 동일 콘텐츠 감지 시 기존 항목을 최상단으로 끌어올리기. — ✅ 적용됨 (전체 히스토리 대상 비교로 확장)
- **상대 시간 표시**: 시각만 표시(`HH:MM`) → 날짜 구분이 없어 어제 항목과 혼동. "3분 전", "어제" 형태 또는 날짜 포함. — ✅ 적용됨 (`title` 속성에 전체 일시 표시, 30초마다 자동 갱신)

### 4. UX / 접근성 (우선순위: 중간)

- `user-scalable=no` 제거: 확대 차단은 접근성 저해 (WCAG 위반). — ✅ 적용됨 (`maximum-scale`도 함께 제거)
- 아이콘 전용 버튼(삭제 ✕, 설정 등)에 `aria-label` 추가. — ✅ 적용됨
- 토스트에 `role="status"` / `aria-live="polite"` 적용, 연속 발생 시 겹침 방지(스택 또는 교체). — ✅ 적용됨 (토스트 컨테이너를 flex-col로 스택)
- `Escape` 키로 모달 닫기, 복사 버튼에 복사 완료 시각 피드백. — ✅ 적용됨 (Escape 닫기 + Copy 버튼이 일시적으로 "Copied!"로 변경)
- 이미지 확대: `window.open` + `document.write`(deprecated) 대신 인페이지 라이트박스 모달로 교체. — ✅ 적용됨

### 5. 코드 품질 / 안정성 (우선순위: 낮음)

- IndexedDB `onerror` 처리 없음: open/트랜잭션 실패 시 무한 대기 가능 → 에러 시 토스트 표시 및 메모리 모드 폴백. — ✅ 적용됨 (`storageManager`가 open/put/delete/clear/getAll 전부 방어 처리, 실패 시 `memoryOnly` 모드로 폴백)
- QR 생성 실패 처리: 1,000자 이내여도 문자 구성에 따라 용량 초과 가능 → try/catch로 사용자 안내. — ✅ 적용됨
- 이미지 dataURL을 인라인 `onclick` 속성 인자로 통째로 전달 → DOM 크기 2배 낭비. id 기반 조회로 변경. — ✅ 적용됨 (`data-action="zoom" data-id="…"` 후 id로 조회)
- 다국어 혼재: UI 영어 / 대상 사용자 한국어 가능성 → 문구 정리(선택). — 해당 없음: 이번 작업 지시상 UI 문구는 영어로 유지하도록 명시되어 있어 변경하지 않음.

## 파일 구성

```
clip/
├── index.html   # 앱 전체 (단일 파일)
└── README.md    # 이 문서
```
