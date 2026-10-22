# PICK ME — Retro Stage Select

KITSCRIPT의 게임과 도구 43개를 탐색하고 가중치 룰렛으로 선택하는 페이지입니다.

## 링크와 검색

- 메뉴는 `index.html`에 실제 `<a href>`로 포함됩니다. JavaScript 없이도 링크와 썸네일이 표시됩니다.
- JavaScript는 기존 셔플, STOP / RE-ROLL, 당첨 강조와 자동 이동을 추가합니다.
- 키보드로 카드에 접근하고 Enter로 선택할 수 있습니다. Ctrl/Cmd 클릭, Shift 클릭, 가운데 클릭은 기본 링크 동작을 사용합니다.
- 제목, 설명, canonical URL을 제공합니다.
- `?theme=city`, `space`, `tool`, `default`로 추첨 범위를 좁힙니다. 알 수 없는 테마는 전체 목록을 사용합니다.
- 마지막 선택은 localStorage에 저장해 연속 추첨을 피합니다. 저장소가 차단되어도 동작합니다.

## 메뉴 수정

`routes.json`에서 URL, 라벨, 테마, 가중치, 썸네일 경로, 활성 여부를 수정한 뒤 저장된 HTML을 갱신합니다.

```sh
node scripts/build-pickme.mjs
node scripts/build-pickme.mjs --check
```

배포 시 런타임 데이터 요청이나 빌드 도구는 필요하지 않습니다. `index.html`과 `images/`를 함께 배포합니다.

## 이미지

- `images/representatives/`: 메뉴별 1080×1080 대표 이미지
- `images/thumbnails/`: 화면에서 사용하는 256×256 WebP 썸네일
- `images/prompts.json`: 이미지별 생성 프롬프트와 제작 정보

대표 이미지는 내장 imagegen으로 생성하며, 대표 이미지와 썸네일은 같은 원본에서 고품질 축소합니다.

## 검증

`scripts/test-pickme.mjs`는 Playwright와 Microsoft Edge가 있는 환경에서 실행합니다.

```sh
node scripts/test-pickme.mjs
```

JavaScript 비활성 링크, 키보드 선택, STOP, 테마 필터, 저장소 차단, 모바일/데스크톱 가로 넘침을 확인합니다.
