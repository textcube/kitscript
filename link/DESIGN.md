# Local Message Desk v0.2 설계

## 구성

- `index.html`: 3단 작업 화면, 연락처·캠페인·템플릿 입력 대화상자
- `styles.css`: 데스크톱 중심 반응형 UI(라이트 기본)
- `mobile.css`: 모바일 상세 패널·제스처 UI
- `dark-theme.css`: `:root[data-theme=dark]` 스코프의 다크 테마 오버라이드
- `icon-ui.css`: 아이콘 버튼 스타일(테마 변수 기반)
- `app.js`: IndexedDB 저장소, 검색/필터, 상태 관리, 가져오기/내보내기, URL Scheme 실행

별도 서버와 빌드 과정 없이 정적 파일만으로 실행한다. 브라우저 데이터는 `local-message-desk` IndexedDB의 `contacts`, `campaigns`, `results`, `actions` object store에 저장한다.

## 데이터 관계

`Result`는 `contactId + campaignId`의 작업 상태를 표현한다. `Action`은 채널 실행 이력이며 여러 연락처 ID를 담을 수 있도록 구성했다. 연락처의 그룹은 문자열 태그 배열로 저장하여 다중 그룹을 지원한다. v0.2의 `Campaign.targetTags`는 태그 배열로, 비어 있지 않으면 해당 태그를 가진 연락처만 그 캠페인의 목록·통계에 포함된다.

## 테마

문서 루트의 `data-theme` 속성(light/dark)으로 테마를 적용한다. 다크 규칙은 전부 `[data-theme=dark]` 스코프 아래에 있다. 사용자 선택(시스템/라이트/다크)은 `localStorage('lmd-theme')`에 저장하며, 시스템 모드에서는 `prefers-color-scheme` 변화를 실시간 반영한다. `<head>`의 인라인 스크립트가 첫 페인트 전에 테마와 `theme-color` 메타를 설정해 깜빡임을 막는다.

## v0.1 구현 범위

- CSV, TSV, JSON 연락처 가져오기
- 아이폰·안드로이드 vCard(`.vcf`, v2.1/v3.0/v4.0) 가져오기
- 검색/필터된 연락처 TSV 클립보드 복사와 자동 형식 판별 붙여넣기
- JSON 전체 백업 및 복원
- IndexedDB 자동 저장과 재실행 시 복원
- 이름, 전화번호, 메모 검색
- 상태·그룹·빠른 필터
- 개별 및 일괄 상태 변경
- 캠페인과 메시지 템플릿 변수 치환
- 문자, 전화, 이메일 URL Scheme
- Web Share API와 클립보드 대체 동작
- 채널 실행 작업 이력

## v0.2 추가 범위

- 시스템/라이트/다크 3단계 테마 토글(`lmd-theme` 저장, `theme-color` 메타 갱신)
- 연락처 삭제(관련 `results` 삭제, `actions.contactIds` 정리)
- 캠페인 편집·삭제(같은 대화상자 재사용, 삭제 시 해당 캠페인의 `results`/`actions` 제거)
- 가져오기 중복 병합: 전화번호(숫자만 비교)나 이메일(소문자 비교)이 일치하면 기존 연락처에 빈 필드만 채우고 태그는 합집합, 토스트에 "N명 추가, M명 갱신" 표시
- 캠페인 타깃 그룹(`targetTags`): 목록(`filtered`)과 통계(`render`) 모두 대상 연락처만 계산
- 실행 취소: 제외/미루기/일괄 상태 변경 전 result 스냅샷을 저장해 토스트의 [실행 취소]로 복원
- 전체 데이터 초기화: confirm + "삭제" 입력 확인 후 4개 store clear와 `lmd-` localStorage 키 제거
- 데스크톱 키보드 단축키: ↑/↓ 이전·다음 연락처 선택, Enter 문자 실행
- 버그 수정: vCard 단일 값 키 중복 크래시, 일괄 "보류"가 존재하지 않는 상태로 저장되던 문제(발송전보류로 변경), iOS `sms:` 구분자(`&`) 분기, 제외 처리 시 기존 메모 보존, 전화·이메일 없는 연락처의 액션 버튼 비활성화, 캠페인·필터 전환 시 체크 선택 초기화

## 모바일 캠페인 접근(760px 이하)

`mobile.css`의 `@media(max-width:760px){.sidebar nav,.storage-note{display:none}}`로 사이드바 nav 전체가 숨겨져 모바일에서 캠페인 전환·생성·빠른 필터에 닿을 방법이 없던 문제를 보완했다.

- `#campaignRail`: topbar 제목 블록 바로 아래에 추가한 가로 스크롤 칩 스트립. "전체 연락처" + 각 캠페인(제목·대상 연락처 수 배지) + 맨 끝 "＋" 칩(`#railAddCampaign`, 캠페인 생성 다이얼로그 오픈)으로 구성되며 `render()`가 사이드바 `campaignNav`와 같은 데이터로 매 렌더마다 다시 그린다. 칩은 기존 `[data-campaign]` 클릭 위임을 그대로 타므로 캠페인 전환 로직은 사이드바와 공유하고, 전환 시 활성 칩을 `scrollIntoView({inline:'center'})`로 보이게 한다.
- `#filterRail`: 캠페인 레일 아래 두 번째 가로 스크롤 줄. "전체" + 상태별(미처리/발송완료/보류/오류/완료) 칩이며 카운트는 `render()`가 사이드바 카운트와 동일하게 계산한 값을 재사용한다. `[data-status]` 클릭 위임에 `#filterRail` 내부인지 판별하는 분기를 추가해, 레일 안에서만 활성 칩 재탭 시 필터가 해제되도록 했다(사이드바 버튼의 기존 동작은 그대로 유지).
- 제목 블록(`.topbar>div:first-child`) 좌우 스와이프로 `[all, ...campaigns]` 순서를 순환하는 `cycleCampaign()`을 추가했다. `detail-pane`의 기존 스와이프(터치 70px 임계값, 축 우세 비교, `{passive:true}`, 버튼에서 시작 시 무시)를 그대로 미러링했고 `matchMedia('(max-width:760px)')`로 모바일에서만 동작한다.
- `#gestureFeedback`을 `detail-pane` 내부에서 `.app` 밖(문서 최상위)으로 옮겼다. `detail-pane`이 `transform:translateY(...)`로 열고 닫히는데, `position:fixed` 자손은 `transform`이 있는 조상을 새 containing block으로 삼기 때문에 그 안에 있으면 패널이 닫혀 있을 때 화면 밖으로 함께 밀려나 버린다. 최상위로 옮겨 목록 화면(패널이 닫힌 상태)에서도 제목 스와이프 피드백이 정상적으로 뜨게 했다. `gestureNotice()`는 `id`로 조회하므로 기존 상세 패널 스와이프 동작에는 영향이 없다.
- 캠페인 선택이 가능해지면서 도달하는 `editCampaignBtn`/`deleteCampaignBtn`(`.icon-button`, 데스크톱 기준 30px)을 `@media(max-width:760px)`에서 `.title-row .icon-button{width:40px;height:40px}`로 확대해 터치 타깃 40px을 확보했다. 데스크톱 크기는 그대로다.
- 신규 요소는 전부 `--card`/`--line`/`--muted`/`--accent`/`--accent-soft` 같은 테마 변수로만 스타일링해 다크 테마(`[data-theme=dark]`)가 별도 오버라이드 없이 자동 적용된다.
- 데스크톱(1050px 이상, 특히 사이드바가 살아있는 ≥761px)에는 영향이 없다: `#campaignRail`·`#filterRail`은 `mobile.css` 기본 규칙에서 `display:none`이며 `@media(max-width:760px)` 안에서만 보이도록 스코프를 좁혔다.

## 모바일 첫 화면 밀도 개선(760px 이하)

375×812 기준으로 상단 크롬(브랜드 바·액션 버튼·통계)이 첫 화면을 전부 차지해 연락처 목록이 하나도 보이지 않던 문제(첫 행 top≈830px)를 개선했다. 첫 연락처 행이 top≈524px에 오도록 압축했으며, 캠페인/필터 레일(`#mobileRails`)과 툴바(검색·필터)는 그대로 유지했다.

- **액션 버튼 "더보기" 바텀시트**: 상단 8버튼 그리드 대신 `가져오기`·`＋연락처`·`◐테마`·`⋯더보기` 4개만 한 줄로 노출한다(`icon-ui.css`의 `@media(max-width:760px){.top-actions{grid-template-columns:repeat(4,1fr)}}`로 4열 고정). 나머지 5개(`demoBtn`/`pasteContactsBtn`/`copyContactsBtn`/`exportBtn`/`resetBtn`)는 DOM에서 지우지 않고 `#moreActionsPanel > #moreActionsSheet` 컨테이너 안으로 마크업만 재배치했다 — id·onclick 핸들러는 그대로이므로 `app.js`의 기존 바인딩을 재사용한다. 처음에는 `themeBtn`도 시트 안에 두었으나, 시트를 열어야만 테마 토글에 닿을 수 있어 발견성이 크게 떨어지는 문제(사용자 피드백으로 발견)가 있어 `themeBtn`을 시트 밖으로 꺼내 상시 노출 4번째 버튼으로 옮겼다(`mobile.css`에서 `order:3`, `moreActionsBtn`은 `order:4`로 조정).
  - 데스크톱·태블릿(>760px)에서 이 재배치가 보이지 않도록, `styles.css`에 무조건 적용되는 최소 예외 규칙을 추가했다: `#moreActionsPanel,#moreActionsSheet{display:contents}`로 래퍼를 시각적으로 무산시켜 자식 버튼이 다시 `.top-actions`의 직계 flex/grid 아이템이 되게 하고, `#moreActionsBackdrop`/`.more-sheet-grabber`/`#moreActionsCancel`/`#moreActionsBtn`은 `display:none`으로 숨긴 뒤, 8개 버튼 전부에 원래 DOM 순서와 동일한 `order`(1~8, `moreActionsBtn`은 9)를 부여해 시각적 순서·줄바꿈까지 이전과 동일하게 복원한다. 이 규칙은 어떤 뷰포트에서도 데스크톱 표시를 바꾸지 않는(= 눈에 보이는 차이가 없는) 순수 구조적 보정이라 판단해 `@media(max-width:760px)` 밖에 두었고, 1280px·900px에서 8버튼의 좌표·줄바꿈이 변경 전과 동일함을 확인했다.
  - 실제 바텀시트 모양(하단 고정, 배경 딤, 둥근 상단 모서리, 2열 그리드, "취소" 버튼)은 전부 `mobile.css`의 `@media(max-width:760px)` 안에서만 정의된다: `#moreActionsBtn`을 보이게 하고 `importBtn`(order 1)·`addContactBtn`(order 2) 옆에 배치, `#moreActionsPanel.open` 상태에서만 `#moreActionsBackdrop`/`#moreActionsSheet`가 `position:fixed`로 나타난다. `#moreActionsCancel`은 그리드 마지막 줄에 오도록 `order:20`을 별도 지정했다(그렇지 않으면 desktop 복원용 `order` 미지정 요소가 `order:0`이 되어 그리드 맨 앞에 뜨는 버그가 있었다).
  - `app.js`는 `moreActionsBtn`/`moreActionsBackdrop`/`moreActionsCancel`에 새 리스너만 추가했다(기존 버튼의 `onclick`은 건드리지 않음): 시트를 열고 닫는 토글, 배경·취소 클릭 시 닫기, 시트 내부 아무 버튼이나 클릭하면(버블링으로 원래 핸들러가 먼저 실행된 뒤) 닫기, `Escape` 키 닫기, 데스크톱으로 리사이즈되면 자동으로 닫기.
- **슬림 통계 바**: `.stats`의 id(`statTotal`/`statSent`/`statPending`/`statProgress`)와 `render()` 로직은 손대지 않고, `mobile.css`의 `@media(max-width:760px)`에서 `.stats`를 4칸 한 줄(`grid-template-columns:repeat(4,1fr)`)로, `article`을 세로 중앙 정렬의 얇은 셀(패딩 6px, `strong` 15px)로 축소하고 단위(`small`)는 숨겼다. 데스크톱 2×2/1행 카드는 그대로다.
- **브랜드 바 축소**: `@media(max-width:760px)`에서 `.sidebar` 패딩과 `.brand-mark` 크기·`.brand` 간격을 줄이고 `.brand small`(부제)을 숨겨 로고 바 높이를 줄였다. 사이드바 데스크톱 스타일은 불변.

측정: 개선 전 375×812에서 첫 연락처 행 top≈830px(뷰포트 밖) → 개선 후 top≈524px. 브랜드 바 63→34px, 액션 그리드 191→59px, 통계 142→43px(레일 96px·툴바 109px은 유지).

## 실행

IndexedDB와 Web Share API가 안전하게 동작하도록 정적 웹 서버 사용을 권장한다.

```bash
python -m http.server 8080 --directory link
```

그 후 `http://localhost:8080`을 연다. 실제 문자·전화 실행은 해당 URL Scheme을 지원하는 기기에서 확인한다.
