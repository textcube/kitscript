# Local Message Desk v0.1 설계

## 구성

- `index.html`: 3단 작업 화면, 연락처·캠페인·템플릿 입력 대화상자
- `styles.css`: 데스크톱 중심 반응형 UI
- `app.js`: IndexedDB 저장소, 검색/필터, 상태 관리, 가져오기/내보내기, URL Scheme 실행

별도 서버와 빌드 과정 없이 정적 파일만으로 실행한다. 브라우저 데이터는 `local-message-desk` IndexedDB의 `contacts`, `campaigns`, `results`, `actions` object store에 저장한다.

## 데이터 관계

`Result`는 `contactId + campaignId`의 작업 상태를 표현한다. `Action`은 채널 실행 이력이며 여러 연락처 ID를 담을 수 있도록 구성했다. 연락처의 그룹은 v0.1에서 문자열 태그 배열로 저장하여 다중 그룹을 지원한다.

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

## 실행

IndexedDB와 Web Share API가 안전하게 동작하도록 정적 웹 서버 사용을 권장한다.

```bash
python -m http.server 8080 --directory link
```

그 후 `http://localhost:8080`을 연다. 실제 문자·전화 실행은 해당 URL Scheme을 지원하는 기기에서 확인한다.
