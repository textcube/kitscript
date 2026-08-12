# 야간 화덕피자 스토리 페이지

- 건물 기준: `pizza-building.png` (`building02.png`)
- 제빵사: `photos/undeath/undeath16.png` 정면 턴어라운드에서 추출한 `source-chef.png`
- 언데드: `undeath01` 해골, `undeath02` 프랑켄, `undeath05` 드라큘라, `undeath09` 가면 캐릭터의 정면 원화를 투명 스프라이트로 추출
- 구현 방식: 일러스트를 보존하는 2.5D Three.js 공간 + 절차형 조명/입자/패럴랙스
- 단일 이미지의 후면 구조는 만들지 않고, 카메라 이동 범위를 제한해 원본에 없는 면을 노출하지 않음
- 캐릭터는 클릭 가능한 독립 스프라이트이며 장면 내 깊이 순서를 가짐

## 의도

완전한 저폴리 재조형보다 원본 이미지의 개성과 디테일을 유지하는 것이 우선이다. 배경을 깊이판으로 사용하고 캐릭터, 연기, 불빛, 달, 안개, 엠버를 서로 다른 Z 레이어에 배치해 입체감을 만든다.

## 캐릭터 소스 기록

- 원본 폴더: `MovieBaker/buntgames/photos/undeath`
- 방식: 각 턴어라운드의 정면 도안을 크롭하고 배경을 제거해 원화의 얼굴·의상·선 굵기를 그대로 보존
- 결과 파일: `source-chef.png`, `source-skeleton.png`, `source-franken.png`, `source-vampire.png`, `source-mask.png`
