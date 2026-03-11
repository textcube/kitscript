# Quiz Image Baker

`quiz/baker`는 퀴즈용 게임 이미지를 대량 생성하기 위한 배치 도구입니다.
`quiz_items.json` 기반으로 프롬프트 생성 + 이미지 생성 + 검수용 프리뷰 생성 + 스탠드얼론 퀴즈 페이지 빌드에 집중합니다.

## 1) 설치

```bash
cd quiz/baker
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 2) 환경변수 설정

Windows PowerShell:

```powershell
$env:OPENAI_API_KEY="YOUR_API_KEY"
```

## 3) 입력 파일 형식 (`quiz_items.json`)

기본적으로 프로젝트 루트의 `quiz_items.json`을 읽습니다.

```json
[
  {
    "id": "galaga",
    "title": "Galaga",
    "year": 1981,
    "genre": "space shooter",
    "hint": "벌떼처럼 몰려오는 적을 상대하는 고전 우주 슈팅",
    "description": "Player controls a small spaceship at the bottom of the screen, shooting waves of alien enemies that attack in formation and dive toward the player.",
    "visual_keywords": ["pixel spaceship", "alien swarm formation"]
  }
]
```

`description`은 프롬프트 품질 향상에 핵심으로 사용됩니다.

## 4) API 기반 이미지 생성

```bash
python generate_images.py
```

선택 옵션:

```bash
python generate_images.py --input ..\..\quiz_items.json --output .\outputs --model gpt-image-1 --size 1024x1024 --retries 3
```

## 5) API 없이 브라우저(크롬 확장) 보조 생성

### 5-1. 작업 목록(JSON) 생성

```bash
python browser_job_export.py
```

샘플로 5개 작업만 생성해 테스트하려면:

```bash
python browser_job_export.py --limit 5
```

생성물:

- `outputs/browser_jobs.json`
- `outputs/<slug>/meta.json` (pending_browser 상태)

### 5-2. 크롬 확장 로드

1. Chrome에서 `chrome://extensions` 진입
2. `개발자 모드` ON
3. `압축해제된 확장 프로그램 로드` 클릭
4. `quiz/baker/chrome_extension` 폴더 선택

### 5-3. ChatGPT 웹에서 사용

1. [https://chatgpt.com](https://chatgpt.com) 로그인
2. 확장 팝업 열기
3. `browser_jobs.json` 파일 선택
4. `Fill + Send`로 프롬프트 전송
5. 이미지 생성에 10~30초 걸릴 수 있으므로, **채팅에 이미지가 보인 뒤에** `Download Images` 클릭 (그 전에 누르면 받을 이미지가 없음)
6. **이미지는 브라우저 기본 '다운로드' 폴더의 `quiz/baker/outputs/<slug>/` 에 저장됩니다.** 프로젝트의 `outputs/` 로 가져오려면:

```bash
python copy_downloaded_images.py
```

선택: `--downloads-dir "C:\Users\...\Downloads"` 로 다운로드 폴더 지정, `--move` 로 복사 대신 이동.

### 5-4. Auto 모드 (자동 연속 처리)

JSON 로드 후 **대기 시간(초)** 를 지정하고 **Start Auto**를 누르면, **현재 항목부터** 끝까지 자동으로 반복합니다.

1. Fill + Send → **대기** → 최근 메시지에 "이미지 생성됨"이 보일 때까지 **대기 시간을 반복**(최대 10회) → Download Images → 다음 job으로 이동 → 반복
2. **진행 표시**: 팝업에 "현재 3/5 · 대기 2회 (50초)"처럼 **지금까지의 대기 횟수와 누적 대기 시간**이 표시되어 무한 대기 여부를 확인할 수 있습니다. 확장 아이콘 배지(예: `3/5`)로도 진행을 볼 수 있습니다.
3. **다음으로 (건너뛰기)**: 이미지가 안 나오거나 다음 항목으로 넘기고 싶을 때 버튼을 누르면 현재 job은 다운로드 없이 건너뛰고 다음 job으로 진행합니다.
4. 중지하려면 팝업을 다시 열고 **Stop Auto** 클릭
5. **Auto 실행 중에는 ChatGPT 탭을 새로고침하거나 다른 페이지로 이동하지 마세요.** 탭이 바뀌면 "탭 연결 끊김" 오류가 나며, 같은 대화 화면을 유지한 채로 다시 Start Auto 하면 됩니다.

이미지 생성에 10~30초 걸리므로 **기본 대기 시간 30초**를 권장합니다. ChatGPT에서 "이미지를 너무 빠르게 생성하고 있습니다" 같은 **속도 제한 경고**가 뜨면 Auto는 자동으로 중단되며, 4분 정도 기다린 뒤 다시 Start Auto 하면 됩니다.

다운로드 파일명은 job의 `filename`을 사용합니다. 확장 프로그램은 ChatGPT 응답 이미지를 여러 DOM 선택자로 찾고, `blob:` URL은 data URL로 변환해 다운로드가 안정적으로 동작하도록 합니다.

## 6) 출력 구조

```text
outputs/
  browser_jobs.json
  failed.json
  run_summary.json
  galaga/
    galaga_action_01.png
    galaga_mood_02.png
    galaga_focus_03.png
    galaga_hint_04.png
    meta.json
```

## 7) preview 생성 방법

```bash
python preview_generator.py
```

생성물:

```text
outputs/preview/index.html
```

## 8) Standalone Quiz Page Builder

`quiz/index.html`의 `bake('quiz')` 스타일/사운드 로직을 재사용해서, 단일 HTML 퀴즈 플레이어를 생성합니다.

```bash
python standalone_quiz_builder.py --write-report
```

기본 출력:

```text
standalone/retro-quiz-standalone.html
```

주요 옵션:

```bash
python standalone_quiz_builder.py \
  --items ..\..\quiz_items.json \
  --outputs .\outputs \
  --store-name "MY QUIZ SHOW" \
  --shop-url "https://kitscript.com/game/quiz/" \
  --countdown 6 \
  --reveal 4 \
  --output-file .\standalone\my-quiz.html
```

선택 이미지 고정(`slug -> filename`)이 필요하면 `selected_images.json`을 만들고 사용하세요.
- 샘플: `selected_images.sample.json`

```json
{
  "galaga": "galaga_hint_04.png"
}
```

## 9) failed.json 재처리 방법

기본 동작이 `이미 존재하는 이미지 건너뛰기`이므로 같은 명령을 다시 실행하면 실패분만 재시도됩니다.

```bash
python generate_images.py
```

## 10) 커스터마이징 포인트

- 프롬프트 템플릿: `prompt_builder.py`
- 변형 개수/전략: `build_prompt_variants()`
- API 생성 파라미터: `generate_images.py`
- 브라우저 작업 목록: `browser_job_export.py`
- 프리뷰 HTML: `preview_generator.py`
- 스탠드얼론 빌더: `standalone_quiz_builder.py`

## 11) 프롬프트 변형 전략

기본 4개 변형:

1. `action` (게임플레이 액션)
2. `mood` (분위기 중심)
3. `focus` (오브젝트/캐릭터 중심)
4. `hint` (정답 직접 노출 금지 간접 힌트)

모든 프롬프트는 `no text / no logo / no watermark` 제한을 포함합니다. 브라우저용 job에는 "디테일 질문 없이 바로 이미지만 생성"하라는 강제 문구(`IMMEDIATE_IMAGE_INSTRUCTION`)가 붙습니다.
