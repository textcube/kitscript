# kitscript

When a homepage becomes a battlefield.

`kitscript`는 정적인 랜딩 페이지를 게임형 인터페이스로 바꾸는 실험 프로젝트입니다.  
루트 허브에서 전투/레벨업을 통해 모듈(미니게임)을 해금하고, 각 모듈은 독립 실행 가능한 HTML 게임을 지향합니다.

## Live

- Hub: [https://kitscript.com/game/](https://kitscript.com/game/)

## Core Philosophy

- Single-file preferred: 각 게임은 가능하면 `index.html` 한 파일로 복사/실행 가능해야 합니다.
- Bundled allowed when needed: 디자인/연출 품질을 위해 에셋 폴더를 사용하는 모드도 허용합니다.
- Copy-friendly: 공통 프레임워크 의존보다, 파일 단독 이해/수정 가능성을 우선합니다.
- Experimental landing: 방문자가 곧바로 플레이 가능한 인터랙티브 홈페이지를 지향합니다.

## Hub Menu Order

현재 허브의 레벨 해금 순서:

1. WIZARD
2. PUZZLE
3. OCEAN
4. BIRD
5. PIZZA
6. BOMB
7. DRONE
8. HACK
9. COWBOY
10. ZONE
11. PANDEMIC
12. SPACE
13. WAVE
14. PLAYLIST
15. HOUSE
16. BOOK

참고: 일부 메뉴는 라이브 환경에서 심볼릭 링크/외부 경로로 연결됩니다.

## Project Structure

- Root hub: `/index.html`
- Local mini games:
  - `/bird/index.html`
  - `/bomb/index.html`
  - `/cowboy/index.html`
  - `/drone/index.html`
  - `/hack/index.html`
  - `/invasion/index.html`
  - `/ocean/index.html`
  - `/pandemic/index.html`
  - `/pizza/index.html`
  - `/puzzle/index.html`
  - `/space/index.html`
  - `/zone/index.html`

## Run Locally

정적 파일만으로 동작합니다. 아래 중 하나를 사용하세요.

1. 브라우저에서 각 `index.html` 직접 열기
2. 간단한 로컬 서버 실행 후 접속

예시(Python):

```bash
python -m http.server 8080
```

그 뒤 `http://localhost:8080/` 접속

참고: YouTube 배경 영상은 `file://`로 열면 브라우저 정책 때문에 차단(오류 153)될 수 있으므로 로컬 서버 실행을 권장합니다.

## Design/Implementation Notes

- 대부분 Canvas + WebAudio 기반
- 게임 오버 후 자동 재시작 UX(대체로 7초 카운트다운) 사용
- 터치/키보드 입력을 함께 고려한 아케이드 스타일 구성

## Contribution Guideline

- 단일 파일 실행성을 우선하되, 필요 시 에셋 번들 모드를 허용
- 외부 링크는 가능하면 `https` 사용
- 새 게임 추가 시 폴더 단위로 독립 실행 가능하게 구성

## License

별도 라이선스 파일이 없다면 기본적으로 All Rights Reserved로 간주됩니다.  
필요 시 `LICENSE` 파일을 추가해 정책을 명시하세요.
