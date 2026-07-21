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

## 국제화(i18n)

외부 라이브러리 없이 `app.js` 상단에 사전 객체를 직접 구현했다. 기본 언어는 **영어**이며, `localStorage('lmd-lang')`에 `'en'`/`'ko'`가 저장되어 있으면 그 값을 따른다.

- **`STRINGS`**: `{en:{...}, ko:{...}}` 형태의 UI 문자열 사전(약 160개 키, 브랜드 서브텍스트부터 토스트·확인창·제스처 안내 문구까지 전부 포함). `lang=()=>localStorage.getItem('lmd-lang')||'en'`으로 현재 언어를 읽고, `t(key,vars)`가 `STRINGS[lang()][key]`를 찾아 반환하며 `{{var}}` 형태의 자리표시자를 `vars` 객체 값으로 치환한다(정규식 치환, 간단한 단일 패스). 사전에 없는 키는 영어 사전으로, 그마저 없으면 키 문자열 자체로 안전하게 폴백한다.
- **정적 HTML 텍스트**: `index.html`의 번역 대상 요소에 `data-i18n`(textContent), `data-i18n-html`(innerHTML — `<br>`이 들어가는 안내 문구 등 개발자가 직접 작성한 안전한 문자열에만 사용), `data-i18n-placeholder`, `data-i18n-aria` 속성을 달아두고, `applyI18n()`이 `document.querySelectorAll('[data-i18n*]')`을 순회하며 `t()` 결과로 일괄 교체한다. `applyI18n()`은 페이지 최초 로드 시, 언어 토글 클릭 시, `resetAll()` 이후(언어 설정도 초기화되므로) 호출된다. 문서 루트의 `lang` 속성도 이때 함께 갱신한다.
- **동적 문자열**: 토스트 메시지, 제스처 피드백, 다이얼로그 제목 전환("연락처 추가"/"연락처 수정" 등), "N명 추가, M명 갱신" 같은 카운트 포함 문구, `confirm()`/`prompt()` 문구, vCard/CSV 파싱 에러 메시지는 하드코딩된 한글 리터럴 대신 전부 `t('키', {변수})` 호출로 바꿨다. `render()`/`renderDetail()`이 매 호출마다 `lang()`을 다시 읽으므로, 언어 전환 시 `applyI18n()` 다음에 `render()`를 호출하는 것만으로 목록·상세·필터·드롭다운의 동적 텍스트가 함께 갱신된다.
- **상태값 보존**: `STATUSES` 배열(IndexedDB에 실제로 저장되는 연락처 상태 문자열, 예: `'미처리'`, `'발송완료'`)은 언어와 무관하게 한글 코드를 그대로 유지한다. 화면에는 `STATUS_LABEL={en:{...}, ko:{...}}` 매핑을 거친 라벨만 노출한다. `<option>`에는 `value="${내부값}"`을 명시적으로 지정해(원래는 텍스트가 곧 값이었던 부분을 수정) 표시 라벨이 바뀌어도 `select.value`로 읽는 내부값은 항상 한글 코드로 유지되도록 했다. `filtered()`의 상태 비교(`r.status===state.status`, `'보류'` 부분일치 등)와 `data-bulk`/`data-status` 속성은 전혀 손대지 않았다. 채널(문자/전화/이메일/공유, `Action.channel`에 저장됨)도 같은 패턴으로 `CHANNEL_LABEL`을 두어 이력(`historyList`) 표시에만 적용했다.
- **사용자 데이터 비번역**: 연락처 이름·전화번호·이메일·메모·태그, 캠페인 제목·설명·커스텀 템플릿, TSV 내보내기 헤더(`name\tphone\temail\tags\tmemo`, 가져오기 파서가 실제로 기대하는 컬럼명이라 항상 영문 고정)는 번역 대상에서 제외했다.
- **데모 데이터**: `DEMO_DATA={en:{...}, ko:{...}}`로 언어별 연락처·캠페인·메모 세트를 분리했다(연락처 6명, 상태·액션 이력 포함). 상태값(`DEMO_RESULT_META`)과 채널(`DEMO_ACTIONS`)은 언어에 무관한 내부 코드이므로 별도 상수로 한 번만 정의해 공유한다. 모든 레코드의 `id`(`demo-contact-01` 등)는 언어와 무관하게 고정했으므로, 다른 언어로 데모를 다시 불러오면 `put()`이 같은 키를 덮어써 정상적으로 교체된다.
- **기본 메시지 템플릿**: `DEFAULT_TEMPLATE={en:'Hi {{name}}...', ko:'안녕하세요 {{name}}님...'}`을 두고 `getDefaultTemplate()`이 `localStorage('lmd-default-template')`가 있으면 그 값을, 없으면 현재 언어의 기본값을 반환한다. 캠페인 생성 다이얼로그를 열 때(`openCampaign()`)와 `campaign()`의 `'all'` 폴백 모두 이 함수를 사용한다. 사용자가 템플릿을 직접 저장한 뒤에는 언어를 전환해도 재번역되지 않는다(저장된 문자열을 그대로 사용).
- **언어 토글 위치**: 데스크톱 사이드바 상단과 모바일 상단 브랜드 바에서 공유하는 `.brand` 요소(사이드바는 라이트/다크 테마와 무관하게 항상 짙은 남색 배경이라 별도 테마 분기 없이도 대비가 유지된다) 안에 `#langBtn` 배지 버튼을 상시 배치했다. 이전 세션에서 테마 버튼을 모바일 "더보기" 시트 안에 숨겼다가 발견성이 떨어졌던 문제를 반복하지 않기 위해, 모바일 4버튼 그리드(가져오기·연락처·테마·더보기)에도 끼워 넣지 않고 브랜드 영역의 여유 공간을 활용했다. 클릭 시 `en`↔`ko` 2단계로 토글되며, 모바일(375px)에서 40×40px 터치 타깃을 확보하도록 `mobile.css`에서 크기를 키웠다. `styles.css`에 기본 스타일을, `dark-theme.css`에 다크 테마 전용 보정을 추가했다.

## v0.4

### 상태 레코드 하이재킹 버그

`resultFor(id)`는 `contactId+campaignId===state.campaign` 레코드가 없으면 표시용으로 `contactId+campaignId==='all'` 레코드를 폴백으로 반환한다(캠페인 전용 상태가 아직 없을 때 전체 스코프 상태를 참고용으로 보여주려는 의도된 동작). 문제는 `setStatus()`와 `deferCurrent()`가 이 반환값을 그대로 스프레드해 저장 레코드를 만들면서 `r.id||uid()`로 id를 골랐다는 점이다. `resultFor()`가 'all' 레코드를 폴백으로 돌려준 경우 `r.id`는 그 'all' 레코드의 실제 id이므로, `{...r,id:r.id,campaignId:state.campaign,...}`를 그대로 `put()`하면 **원래 'all' 레코드 자체의 `campaignId`가 현재 캠페인으로 바뀌어 덮어써진다.** 즉 캠페인 A에서 상태를 한 번 바꾸면 전체 스코프('all')에 남아 있던 기록이 캠페인 A 소속으로 변질되고, 이후 캠페인 B에서 같은 연락처를 처리하면 더는 'all' 폴백을 찾지 못한다 — 데이터가 사실상 소실된다.

수정은 "이 레코드가 실제로 현재 캠페인 소속인가"를 판별해 재사용 여부를 가르는 것이다.

```js
const prev=resultFor(id), reuse=prev.id && prev.campaignId===state.campaign;
const r={...prev, id:reuse?prev.id:uid(), campaignId:state.campaign, ...};
```

`resultFor()`의 첫 번째 `find`가 성공했다면 이미 `prev.campaignId===state.campaign`이므로 `reuse`는 참 — 기존 레코드를 그대로 갱신한다(원래 의도된 동작). 두 번째 `find`(=`'all'` 폴백)를 탄 경우는 `state.campaign!=='all'`일 때만 도달하므로 `prev.campaignId(='all') !== state.campaign`이 되어 `reuse`는 거짓 — `uid()`로 새 레코드를 만들어 현재 캠페인 소속으로 별도 저장한다. 'all' 레코드는 손대지 않고 그대로 남는다. 폴백에서 온 `memo`는 새 레코드의 초깃값으로만 이어받고(사용자가 이미 적어둔 메모를 잃지 않도록), `campaignId`는 항상 `state.campaign`으로 새로 지정한다. `setStatus()`와 `deferCurrent()` 양쪽에 동일한 패턴을 적용했다. `excludeCurrent()`와 일괄 처리(`data-bulk`)는 내부적으로 `setStatus()`를 호출하므로 별도 수정 없이 함께 고쳐졌다.

`snapshotResults(ids)`도 같은 폴백 경로를 타는 게 문제였다: 실행 취소용 스냅샷을 뜰 때 `resultFor()`를 호출해 캠페인 스코프에 레코드가 없으면 'all' 레코드를 "이전 상태"로 저장해버렸다. 이 상태에서 `restoreResults()`가 되돌리면 (a) 방금 위 수정으로 새로 생긴 캠페인 레코드는 그대로 남고 (b) 엉뚱하게 'all' 레코드의 내용을 캠페인 레코드 자리에 덮어씌우는 이중 오류가 날 수 있었다. 수정 후에는 `state.results.find(r=>r.contactId===id&&r.campaignId===state.campaign)`로 폴백 없이 정확한 스코프만 조회하고, 없으면 `prev:null`로 저장한다. `restoreResults()`의 기존 로직은 이미 `prev===null`일 때 "현재 캠페인 스코프의 레코드를 찾아 삭제"하도록 짜여 있었으므로 수정 없이 그대로 새로 생긴 레코드를 정확히 지운다.

### 발송 후 결과 선택 바 (`#outcomeBar`)

README의 "상태 변경" 절에 있던 `문자 버튼 → 앱 실행 → 복귀 → 다음 선택(발송완료/보류/오류/취소) → 자동 저장 → 다음 연락처` 루프를 구현했다. visibilitychange나 포커스 복귀 감지 같은 방식은 데스크톱에서 `sms:` 스킴이 아예 실행되지 않거나 새 탭/앱이 뜨지 않는 환경(대부분의 데스크톱 브라우저)에서 신뢰할 수 없어 채택하지 않았다. 대신 **채널 버튼 클릭 즉시(=`recordAction()` 실행 직후) 표시하는 인라인 바**로 단순화했다 — 실제로 문자 앱이 열렸는지와 무관하게, "이 연락처에 대해 방금 무언가를 시도했다"는 사실 자체를 기준으로 결과를 묻는다.

- `recordAction(channel,c)`이 액션을 기록한 뒤 `state.outcomeFor=c.id`를 설정하고 `renderDetail()`을 호출한다. `smsBtn`/`shareBtn`/`emailBtn`/`callBtn`의 클릭 핸들러는 모두 `recordAction()`을 거치므로 별도 분기 없이 네 채널 전부에서 동일하게 바가 뜬다.
- `renderDetail()`은 매 호출마다 `$('outcomeBar').hidden=state.outcomeFor!==c.id`로 가시성을 동기화한다. 즉 "지금 표시 중인 연락처가 `outcomeFor`와 같을 때만 보인다"는 단일 조건으로 표시/숨김을 관리하며, 별도의 열기/닫기 상태 플래그를 두지 않았다.
- 이 조건만으로는 "같은 연락처를 선택한 채 캠페인이나 필터만 바뀐" 경우를 잡지 못한다(연락처 id는 그대로이므로). 그래서 캠페인 전환(`[data-campaign]` 클릭, `cycleCampaign()`, 캠페인 생성/편집/삭제, 데모 로드)과 필터 변경(빠른 필터 `[data-status]` 클릭, `#statusFilter`/`#groupFilter`/검색어 변경)이 일어나는 모든 지점에서 `state.outcomeFor=null`을 명시적으로 같이 설정한다. 연락처 자체를 전환하는 경우(`moveContact`, `excludeCurrent`, `deferCurrent`, 목록 행 클릭)는 `state.selected`가 바뀌면서 위 id 비교 조건이 자연히 걸리므로 별도 처리가 필요 없다.
- 바의 구성은 안내 문구(`#outcomeText`, `t('outcomePrompt',{name})`)와 버튼 4개: `data-outcome="발송완료"`/`data-outcome="발송후보류"`/`data-outcome="오류"`(라벨은 각각 기존 `statusSent`/`statusHold`/`statusError` 문자열을 재사용— 이미 짧고 뜻이 맞아 새 키를 만들지 않았다)와 `#outcomeCloseBtn`. 상태 버튼 3개는 `document`의 기존 클릭 위임 리스너에 `data-bulk`와 같은 패턴(`e.target.dataset.outcome`)으로 추가해, 이미 있는 "상태값을 데이터 속성에 담아 버튼 여러 개를 한 리스너로 처리"하는 관례를 그대로 따랐다.
- 상태 버튼 클릭 시: 클릭 시점의 `filtered()` 목록과 그 안에서 현재 연락처의 인덱스를 먼저 캡처해 두고(상태가 바뀌기 전 순서 기준), `snapshotResults()`로 실행 취소용 스냅샷을 뜬 뒤 `setStatus()`로 저장한다. `outcomeFor`를 `null`로 돌려 바를 숨기고, 토스트에 실행 취소 버튼을 붙인다. **발송완료를 선택했을 때만** 캡처해 둔 인덱스 다음(`list.slice(idx+1)`)부터 상태가 `'미처리'`인 첫 연락처를 찾아 `state.selected`를 옮긴다. 못 찾으면(목록 끝까지 미처리가 없으면) 이동하지 않고 `gestureNotice(t('noticeAllPendingDone'))`로만 안내한다. 보류/오류는 자동 이동을 하지 않는다(사용자가 계속 같은 연락처를 붙들고 다른 채널을 시도하는 흐름을 막지 않기 위해). 닫기 버튼은 `state.outcomeFor=null`만 하고 `renderDetail()`을 호출할 뿐 아무 것도 저장하지 않는다.
- 스타일은 `styles.css`에 `--card`/`--line`/`--accent`/`--accent-soft`/`--ink` 테마 변수만으로 작성해 다크 테마 오버라이드가 따로 필요 없다("발송완료" 버튼만 `--accent` 배경의 강조 버튼으로 구분). 모바일 터치 타깃은 상세 패널이 풀스크린 오버레이로 전환되는 기존 `mobile.css`의 `@media(max-width:1050px)` 블록(다른 액션 버튼들과 같은 breakpoint)에 `.outcome-actions button{min-height:42px}`를 추가해 확보했다.

### 사이드바 active 상태

"전체 연락처" 정적 버튼(`id="allContactsNav"`)과 사이드바 빠른 필터 5개 버튼(`.sidebar [data-status]`)에 있던 하드코딩 `active` 클래스를 지우고, `render()`에서 `state.campaign`/`state.status` 값을 기준으로 매번 `classList.toggle('active', 조건)`을 다시 계산한다. 모바일 레일(`#campaignRail`/`#filterRail`)은 원래부터 매 렌더마다 `innerHTML`을 완전히 새로 그리며 active 여부를 문자열에 포함시켜 왔으므로 이번 수정과 무관하게 계속 정상 동작한다.

### 자잘한 수정

- `#statusFilter`에 결합 상태값 `'보류'`(내부적으로 `발송전보류`+`발송후보류`를 부분일치로 묶어 필터링하는 값, `filtered()`의 기존 로직은 그대로 둠) 옵션을 `발송전보류` 옵션 바로 앞에 추가해, 빠른 필터로 "보류"를 선택했을 때도 드롭다운이 실제 필터 상태를 반영하도록 했다.
- 빈 상태 분기: `render()`에서 `state.contacts.length===0`(연락처 자체가 없음)과 `list.length===0`(필터링 결과만 0건)을 구분해 `#emptyTitle`/`#emptyDesc`의 텍스트를 각각 다르게 넣고, 후자의 경우 `#emptyImportBtn`을 숨긴다. 두 문구 모두 `data-i18n` 속성은 유지하되(초기 로드·언어 전환 시 기본값), `render()`가 매번 상황에 맞는 텍스트로 덮어써 언어 전환 후에도 올바른 문구가 유지된다.
- `#selectAll` 체크박스를 매 렌더마다 `list.length>0 && list.every(c=>state.checked.has(c.id))`로 재계산해, 일괄 처리·필터 변경으로 `state.checked`가 비워진 뒤에도 체크 표시가 남아있던 문제를 없앴다.
- `filtered()`의 텍스트 검색 대상 배열에 `c.email`을 추가했다(기존: name, phone, memo).

## 실행

IndexedDB와 Web Share API가 안전하게 동작하도록 정적 웹 서버 사용을 권장한다.

```bash
python -m http.server 8080 --directory link
```

그 후 `http://localhost:8080`을 연다. 실제 문자·전화 실행은 해당 URL Scheme을 지원하는 기기에서 확인한다.
