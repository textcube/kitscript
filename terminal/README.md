# terminal — Web Shell (가상 리눅스 터미널 + AI)

`terminal/index.html`은 **브라우저 안에서 동작하는 가짜 리눅스 셸**입니다. 인메모리 가상 파일시스템 위에서 약 20개의 명령을 흉내 내고, 명령 히스토리·`cat >` 리다이렉션·Gemini 기반 AI 명령을 제공합니다. 실제 시스템에는 아무것도 하지 않는 **관전/체험용 데모**입니다.

- 파일: [`index.html`](index.html) (644줄), 단일 파일, 외부 의존은 Google Generative Language API 하나(AI 명령에서만)
- 가상 FS: [`fs`](index.html:223) 객체(`type`/`children`/`content`/`date`), 현재 경로는 [`currentPath`](index.html:243) 배열
- 명령 테이블: [`commands`](index.html:341) — `ls -la`, `cd`, `cat -n`, `tail/head -n`, `mkdir -p`, `rm -rf`, `ping -c`, `ps aux`, `ifconfig`, `w`, `last` 등
- 입력: 숨긴 `<input>` + 가짜 블록 커서, [`handleCommand`](index.html:598)가 토큰화·디스패치, ↑/↓ 히스토리
- 리다이렉션: `cat > file` → [`isRedirectionMode`](index.html:247), 여러 줄 입력 후 `Ctrl+D`([`finishRedirection`](index.html:588))
- AI: [`callGemini`](index.html:296) + `✨-ask` / `✨-genfile`([index.html:571](index.html:571))
- 종료 동선: `exit`/`shutdown`/`reboot`가 kitscript.com 게임·툴로 이동(관전형 정체성)

---

## 품질 관점 분석

실제 코드에서 확인한 항목만 적습니다. 가장 심각한 것은 **명령 에코·`ls`·AI 출력이 전부 `innerHTML`로 렌더되어 저장형 XSS가 성립하는 것**, **AI 명령의 이름이 이모지 `✨`라서 사실상 입력이 불가능한 것**, **`cat`/`tail`/`head`/`rm`이 경로를 해석하지 못하는 것**입니다.

### 보안 (최우선)

- **명령 에코가 그대로 `innerHTML`에 들어감 → 즉시 실행되는 XSS**: [handleCommand](index.html:604)는 사용자가 친 명령을 `printHTML(\`… # ${trimmed}\`)`로 출력합니다. [`printHTML`](index.html:269)은 `div.innerHTML = html`이므로, `<img src=x onerror=alert(document.cookie)>`를 입력하면 "command not found" 이전에 **에코 단계에서 스크립트가 실행**됩니다. 셸 UI 특성상 임의 텍스트 입력이 기본 사용 방식이라 노출면이 매우 큽니다.
- **파일명이 `ls`에서 다시 `innerHTML`로 렌더됨 → 저장형 XSS**: [index.html:464](index.html:464)·[index.html:470](index.html:470)이 파일/디렉터리 이름을 `<span>…${name}…</span>` 문자열로 조립합니다. 이름은 `touch`/`mkdir`/`cat >`로 사용자가 정합니다. 예: `touch "<img src=x onerror=…>"` 뒤 `ls` 를 치면 목록을 그릴 때마다 실행됩니다. 값을 저장했다가 나중에 터뜨리는 **stored XSS**입니다.
- **AI 응답을 `innerHTML`로 출력**: [index.html:575](index.html:575)의 `printHTML(\`✨ AI: ${res}\`)`, [index.html:581](index.html:581)의 로딩 라벨(파일명 삽입). 원격 모델 출력과 파일명을 이스케이프 없이 DOM에 넣습니다. → **모든 사용자 유래·모델 유래 텍스트는 `textContent`로 출력**하고, 색/굵기 같은 스타일이 필요한 조각만 안전하게 element로 조립해야 합니다.
- **클라이언트에 API 키를 두는 구조 자체가 위험**: [index.html:218](index.html:218) `const apiKey = ""` + [`callGemini`](index.html:297)가 `?key=${apiKey}`로 직접 호출합니다. 키를 채우는 순간 정적 페이지 소스에 그대로 노출되어 누구나 도용할 수 있습니다. **AI 기능을 쓰려면 서버측 프록시(키는 서버 보관)** 로 가야 하고, 그 전까지는 키 미설정 시 명확히 안내해야 합니다(아래 항목).
- **키 미설정 시 31초 무응답**: [`callGemini`](index.html:300)는 `apiKey`가 비어도 요청을 보내고, 실패를 5회 지수 백오프(1+2+4+8+16초)로 재시도한 뒤에야 에러를 냅니다. 그동안 사용자는 로딩만 봅니다. **키가 없으면 즉시 "AI 미구성" 메시지**로 단락해야 합니다.

### 기능 결함

- **AI 명령을 사실상 칠 수 없음**: 명령 이름이 [`'✨-ask'`](index.html:571)·[`'✨-genfile'`](index.html:577)입니다. 터미널에서 이모지 `✨`를 직접 입력하는 것은 거의 불가능하므로, [help](index.html:346)에 광고된 기능이 도달 불가능합니다. **`ai`/`ask`·`gen` 같은 ASCII 별칭**을 부여하거나 아예 이름을 바꿔야 합니다.
- **`cat`/`tail`/`head`/`rm`이 경로를 해석하지 못함**: [cat](index.html:533)은 `getDir(currentPath).children[params[0]]`만 봅니다. `cat /etc/passwd`, `cat scripts/../server_info.log`, `cat ./file` 모두 실패합니다(슬래시가 든 이름을 그대로 자식 키로 찾음). [tail](index.html:552)·[head](index.html:566)·[rm](index.html:519)도 동일합니다. `ls`/`cd`가 쓰는 [`resolvePath`](index.html:313)를 **파일 대상 명령에도 재사용**해서 "부모 경로 해석 + 마지막 세그먼트 조회"로 통일해야 합니다.
- **텍스트를 드래그로 복사할 수 없음**: 창 전체에 [`onclick="focusInput()"`](index.html:194)이 걸려 있어, 출력 위를 클릭·드래그하면 매번 입력으로 포커스가 튕겨 **선택이 풀립니다.** 실제 터미널의 기본 동작(로그 복사)이 막힙니다. 선택이 있을 때는 포커스를 옮기지 말고(`window.getSelection().isCollapsed` 확인), 클릭을 빈 영역으로 한정해야 합니다.
- **가짜 커서가 실제 캐럿을 따라가지 않음**: [`caret-color: transparent`](index.html:150) + 항상 입력 끝에 붙는 블록 [`.cursor`](index.html:210). ←/→로 커서를 옮기거나 중간을 편집하면 진짜 위치는 보이지 않고 블록만 끝에 남습니다. Home/End·중간 삽입이 시각적으로 깨집니다. 최소한 실제 캐럿을 살리거나, 커서를 캐럿 위치에 맞춰 렌더해야 합니다.
- **`cat >>`(append)가 조용히 무시됨**: [index.html:605](index.html:605)이 `startsWith('cat >')` 후 `split('>')`로 파일명을 얻습니다. `cat >> log`는 `parts[1]`이 빈 문자열이라 리다이렉션에 진입하지 못하고 "command not found"류로 빠집니다. 리다이렉션 파싱을 정규식으로 정리하고 append(`>>`)를 지원해야 합니다.
- **`ls <파일>`이 디렉터리 아님으로 처리**: [ls](index.html:447)는 대상이 파일이면 에러를 냅니다. 실제 `ls file`은 그 파일 이름을 출력합니다. 소소하지만 데모 완성도 항목입니다.
- **`formatCwd` 접두 매칭이 취약**: [index.html:290](index.html:290)의 `pathStr.startsWith('/root')`는 `/rootkit` 같은 이름에서도 참이 됩니다(현재 FS엔 없지만 `mkdir /rootkit` 후 재현 가능). 세그먼트 단위 비교로 바꿔야 합니다.
- **히스토리 중복·경계**: 같은 명령을 연속 입력해도 매번 [history](index.html:602)에 쌓이고, 리다이렉션 중 친 줄은 히스토리에서 빠집니다(의도일 수 있음). 연속 중복 제거 정도는 실제 셸과 맞추면 좋습니다.

### 입력 · 상호작용

- **탭 자동완성 없음**: 실제 셸의 핵심 편의 기능이 빠져 있습니다. 최소한 명령 이름·현재 디렉터리 항목에 대한 `Tab` 완성이 있으면 체험감이 크게 오릅니다.
- **리다이렉션 모드에 시각 표시가 없음**: `cat > file` 진입 후 프롬프트가 사라지기만 하고([index.html:594](index.html:594)) `>` 연속 프롬프트가 없어, 지금이 입력 축적 모드인지 알기 어렵습니다.
- **모바일 키보드**: 세로 화면에서 소프트 키보드가 올라오면 85vh 창 하단이 가려질 수 있습니다. 입력 라인이 항상 보이도록 스크롤을 보장해야 합니다.

### 접근성 · 메타

- **입력에 접근 가능한 이름이 없음**: [`<input id="command-input">`](index.html:209)에 `aria-label`이 없습니다. 터미널 영역에 `role`/라이브 리전(`aria-live="polite"`)이 없어 스크린 리더가 새 출력을 읽지 못합니다.
- **가짜 창 버튼이 스크린 리더에 노출**: [`.dot`](index.html:197) 세 개는 장식이므로 `aria-hidden`이 필요합니다.
- **메타 태그 부재**: `description`, Open Graph, `theme-color`, 파비콘이 모두 없습니다. 저장소의 다른 모듈은 이미 갖추고 있습니다.
- **폰트 미로드**: [`--font-main`](index.html:17)이 `Fira Code`/`Source Code Pro`를 지정하지만 로드하지 않아 항상 시스템 monospace로 폴백합니다. 의도한 룩이 나오지 않습니다.
- **`prefers-reduced-motion` 무시**: 커서 blink·스피너가 항상 돕니다. 저감 옵션이 필요합니다.
- **인라인 `onclick`**: [index.html:194](index.html:194) 1곳으로 엄격한 CSP 적용이 불가능합니다. `addEventListener`로 옮기면 위 XSS 방어와 함께 CSP를 걸 수 있습니다.

---

## 개선안 (우선순위)

1. **P0 — XSS 차단**: 명령 에코·`ls` 항목·AI 출력·파일명 로딩 라벨을 전부 `textContent`/DOM API로 조립. `printHTML`의 무분별한 사용을 제거하고, 스타일이 필요한 조각은 `createElement`+`className`으로. 이후 `<meta http-equiv="Content-Security-Policy">`로 인라인 스크립트/핸들러 차단.
2. **P0 — AI 명령 도달성/키 처리**: `✨-ask`/`✨-genfile`에 `ask`/`gen`(또는 `ai …`) ASCII 별칭 추가, `help` 갱신. `apiKey`가 비면 요청 없이 "AI가 구성되지 않았습니다(서버 프록시 필요)" 즉시 출력. 실제 사용 시 **서버측 프록시** 권장을 주석/문서에 명시.
3. **P0 — 경로 해석 통일**: `cat`/`tail`/`head`/`rm`이 `resolvePath`로 부모를 구해 마지막 세그먼트를 조회하도록 리팩터. `cat /etc/passwd`, `../` , `./` , `~/…` 지원.
4. **P1 — 터미널 사용성**: 텍스트 선택 시 포커스 강탈 금지(선택 존재하면 `focusInput` 스킵), 가짜 커서를 실제 캐럿과 일치시키거나 네이티브 캐럿 노출, `cat >>` append 지원 + 리다이렉션 중 `>` 프롬프트 표시.
5. **P1 — 완성도**: `formatCwd` 세그먼트 비교, `ls <파일>` 처리, 히스토리 연속 중복 제거, `Tab` 자동완성(명령 + 현재 디렉터리 항목).
6. **P2 — 접근성/메타**: `<input>` `aria-label`, 터미널 `aria-live`, 장식 요소 `aria-hidden`, `description`/OG/`theme-color`/파비콘, monospace 폰트 로드 또는 스택 정리, `prefers-reduced-motion`, 인라인 핸들러 제거.

단일 파일 · 외부 의존 최소라는 저장소 원칙은 유지합니다. 빌드 도구나 프레임워크는 도입하지 않으며, AI 키를 정적 페이지에 하드코딩하지 않습니다.
