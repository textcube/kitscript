# kitscript

When a homepage becomes a battlefield.

`kitscript`는 정적인 랜딩 페이지를 게임형 인터페이스로 바꾸는 실험 프로젝트입니다.  
루트 허브에서 전투/레벨업을 통해 모듈(미니게임)을 해금하고, 각 모듈은 독립 실행 가능한 HTML 게임을 지향합니다.

## Concept

웹 개발은 오랫동안 점점 더 복잡한 방향으로 발전해 왔다. **framework**, **modular architecture**, 수많은 파일 구조, **build system**, 그리고 **deployment pipeline**은 이제 일반적인 개발 환경이 되었다. 이러한 구조는 대규모 서비스에는 필요하지만 모든 소프트웨어가 그런 수준의 복잡성을 요구하는 것은 아니다. 실제로 많은 경우 사람들에게 필요한 것은 거대한 시스템이 아니라 **simple business logic** 하나를 해결하는 것이다. 예약을 처리하거나 점수를 계산하거나 간단한 이벤트를 처리하는 것처럼 비교적 작은 로직만으로도 충분히 유용한 프로그램이 될 수 있다.

많은 사람들이 개발을 어렵게 느끼는 이유는 프로그래밍 언어 때문이라기보다 문제를 **logic**으로 정리하고 흐름을 설계하는 과정 때문이다. 하지만 흥미로운 점은 실제 현장에서 필요한 **business logic**이 생각보다 거대하지 않은 경우가 많다는 것이다. **prompt sharing**만으로 모든 문제가 해결되지는 않지만, 실제 서비스 흐름을 구성하는 로직 자체는 의외로 단순한 규칙과 상태 변화로 설명되는 경우가 많다. 결국 중요한 것은 거대한 코드베이스가 아니라 문제를 해결하는 **logic structure**다.

여기에 **AI coding tools**의 등장이 또 하나의 변화를 만들고 있다. 사람은 더 이상 모든 코드를 직접 작성할 필요가 없어지고 있으며, 구조와 의도를 설명하면 코드 생성은 상당 부분 자동화될 수 있다. 하지만 AI 역시 거대한 프로젝트보다는 **small and self-contained code**를 훨씬 잘 이해한다. 하나의 파일 안에서 전체 맥락이 보이는 구조는 AI와의 협업에서도 유리하다. 코드를 복사하고 AI에게 질문하고 다시 수정하는 **copy → modify → run** 사이클이 빠르게 반복될 수 있기 때문이다.

대규모 서비스는 모든 상황을 고려해야 하기 때문에 많은 로직을 필요로 한다. **authentication**, **permission**, **infrastructure**, **scalability**, 그리고 다양한 예외 처리까지 포함해야 한다. 그러나 **personalized software**의 경우 상황이 달라진다. 사용자가 누구인지 이미 알고 있고 사용 목적도 명확하기 때문에 많은 로직이 필요 없어질 수 있다. 결국 남는 것은 핵심 기능 몇 가지뿐이며 불필요한 계층이 사라지면서 프로그램은 더 작고 단순해질 수 있다. 이러한 과정은 자연스럽게 **lighter software**와 더 나은 **performance potential**로 이어질 수 있다.

이러한 관점에서 하나의 흥미로운 가능성이 등장한다. **a single web page can become a program**이라는 생각이다. 현대의 브라우저는 이미 강력한 실행 환경이며 **cache**, **offline capability**, 그리고 다양한 **web APIs**를 통해 웹페이지는 단순한 문서를 넘어 실행 가능한 프로그램이 될 수 있다. 만약 프로그램이 하나의 페이지로 압축된다면 **deployment**의 방식도 크게 단순해진다. 복잡한 설치 과정이나 서버 인프라 없이도 파일 하나만 전달하면 실행이 가능해질 수 있다.

이 구조는 특히 네트워크 환경에 대한 의존성을 줄일 수 있다. **portable software** 형태의 페이지는 이메일, 메신저, USB 등 다양한 방식으로 전달될 수 있으며 **offline environment**나 **secure isolated network**에서도 실행될 수 있다. 네트워크가 차단된 환경이나 제한된 보안 환경에서도 사용할 수 있는 프로그램 구조가 되는 것이다. 이런 점에서 작은 웹페이지 프로그램은 다시 한번 **software mobility**를 회복하는 접근이 될 수 있다.

이러한 작은 프로그램들은 복사해서 수정하고 바로 실행할 수 있는 특징을 가진다. **copy**, **modify**, **run**이라는 단순한 흐름은 실험과 확산 속도를 크게 높인다. 또한 이러한 코드 조각들은 마치 영화 *The Matrix*에서 네오가 다운로드받던 프로그램처럼 필요할 때 바로 실행되는 **capability module**이 될 수도 있다. 작은 기능 단위의 프로그램이 필요할 때 실행되는 형태의 소프트웨어 생태계다.

물론 아직 해결되지 않은 문제들도 많다. **data persistence**, **security**, **update mechanism**, **collaboration**, 그리고 장기적인 **maintenance** 같은 영역은 여전히 중요한 과제로 남아 있다. 특히 대규모 서비스의 **build**, **deployment**, **operation**까지 고려하면 아직 갈 길이 먼 것도 사실이다. 하지만 개인 실험, 작은 도구, 인터랙티브 콘텐츠, 프로토타입과 같은 영역에서는 이미 충분히 실용적인 접근이 될 수 있다.

모든 소프트웨어가 거대한 시스템일 필요는 없다. 많은 경우 **simple logic solving**만으로도 충분한 가치를 만들 수 있다. 기술의 미래가 반드시 더 복잡해지는 방향으로만 발전하는 것은 아닐지도 모른다. 동시에 더 작고 더 단순하며 더 개인화된 **lightweight software**의 흐름도 나타날 수 있다. 아직 해결되지 않은 문제들도 있고 발전 속도가 느린 영역도 있지만 그 가능성은 이미 열려 있다. 그리고 그 가능성은 어쩌면 아주 작은 곳에서 시작될지도 모른다. **one page**에서.

## Live

- Hub: [https://kitscript.com/game/](https://kitscript.com/game/)

## Core Philosophy

- Single-file preferred: 각 게임은 가능하면 `index.html` 한 파일로 복사/실행 가능해야 합니다.
- Bundled allowed when needed: 디자인/연출 품질을 위해 에셋 폴더를 사용하는 모드도 허용합니다.
- Copy-friendly: 공통 프레임워크 의존보다, 파일 단독 이해/수정 가능성을 우선합니다.
- Experimental landing: 방문자가 곧바로 플레이 가능한 인터랙티브 홈페이지를 지향합니다.

## Hub Menu Order

현재 허브의 레벨 해금 순서:

1. ONE
2. CLOCK
3. PILOT
4. PUZZLE
5. OCEAN
6. BIRD
7. PIZZA
8. BOMB
9. DRONE
10. HACK
11. COWBOY
12. ZONE
13. PANDEMIC
14. SPACE
15. WAVE
16. PLAYLIST
17. HOUSE
18. BOOK

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



