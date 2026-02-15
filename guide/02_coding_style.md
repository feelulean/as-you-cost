# [As-you-Cost] 코딩 스타일 및 개발 표준 가이드

[cite_start]본 문서는 As-you-Cost 어플리케이션 구축을 위한 코드 작성 표준입니다[cite: 54, 235]. [cite_start]시스템을 구현하는 AI(Claude) 및 개발자는 YHJY의 표준 가이드라인을 반드시 준수하여 코드의 일관성과 유지보수성을 극대화해야 합니다[cite: 87, 238].

## 1. 기본 소스 포맷 (Source Format)
* [cite_start]**들여쓰기(Indentation):** 탭(Tab) 기호 대신 **스페이스 4칸(+4 Space)**을 사용합니다[cite: 339, 359].
* [cite_start]**명령문:** 한 라인에는 하나의 명령문만 기술하며, 가독성을 위해 라인 길이는 150자 이내로 제한합니다[cite: 366, 376].
* [cite_start]**블록(중괄호):** `if`, `for`, `try` 등 제어문 바로 뒤에 열린 중괄호 `{`를 같은 라인에 작성하고, 닫는 중괄호 `}`는 새로운 라인에 작성합니다[cite: 329, 334]. [cite_start]다중 명령문 블록에서 내용이 없는 빈 블록은 허용하지 않습니다[cite: 338].
* [cite_start]**인코딩:** 모든 소스 파일은 UTF-8로 저장합니다[cite: 301].

## 2. 명명 규칙 (Naming Rule)
[cite_start]기본적으로 Camel 표기법을 사용하며, 특수기호 사용이나 의미가 불명확한 약어 사용을 엄격히 금지합니다[cite: 94, 96, 437].
* [cite_start]**패키지명:** 모두 소문자로 작성합니다 (예: `smartsuite.app.bp.pro.pr`)[cite: 102, 114].
* [cite_start]**클래스명:** `UpperCamelCase`를 적용합니다[cite: 434].
* [cite_start]**메소드명 및 변수명:** `lowerCamelCase`를 적용합니다[cite: 178, 435].
    * [cite_start]메소드는 '동사 + 명사' 구조로 작성합니다[cite: 169].
    * [cite_start]예시: 단건 조회 `findUser`, 목록 조회 `findListUser`, 저장/수정 `saveUser`, 삭제 `deleteUser`[cite: 172].
* [cite_start]**상수명:** 모두 대문자로 작성하며 단어 사이는 언더바(`_`)로 구분합니다 (예: `ERROR_MESSAGE`)[cite: 185, 187].

## 3. 자바(Java) 컴포넌트 명명 표준
* [cite_start]**Controller:** `업무명 + Controller` (예: `CostController.java`) [cite: 127]
* [cite_start]**Service:** 인터페이스(Interface)를 따로 두지 않고 `업무명 + Service` 로 직관적으로 명명 (예: `CostService.java`) [cite: 125, 127]
* [cite_start]**Repository:** `업무명 + Repository` (예: `CostRepository.java`) [cite: 127]
* [cite_start]**Mapper XML:** Repository를 생략한 소문자 파일명 사용, 단어 구분은 하이픈(`-`) (예: `cost.xml`) [cite: 129, 132]

## 4. 화면(UI) ID 명명 규칙
[cite_start]화면은 유형별로 Pre-fix를 붙여 역할을 명확히 구분합니다[cite: 136].
* [cite_start]메인 모듈: `em-` (YHJY-module) [cite: 138]
* [cite_start]개별 프로세스 화면: `es-` (YHJY-submodule) [cite: 139]
* [cite_start]팝업 화면: `ep-` (YHJY-popup) [cite: 140]
* [cite_start]커스텀 컴포넌트: `cc-` (custom-component) [cite: 141]

## 5. 주석 (Comment) 가이드
* [cite_start]YHJY에서 제공하는 `JAutodoc` 템플릿 형식을 기준으로 클래스와 메소드 주석을 작성합니다[cite: 195, 468].
* [cite_start]메소드명으로 기능이 완벽히 유추되는 경우는 생략 가능하나, 파라미터 설명이나 타 시스템 연계 로직 등 개발자가 알아야 할 중요 정보는 반드시 상세히 기록합니다[cite: 192, 193, 194].