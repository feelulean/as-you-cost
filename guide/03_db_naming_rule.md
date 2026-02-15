# [As-you-Cost] 데이터베이스(DB) 명명 규칙 및 설계 가이드

[cite_start]본 문서는 As-you-Cost 어플리케이션의 데이터베이스 테이블 및 컬럼 설계 시 반드시 준수해야 하는 표준 가이드입니다[cite: 546]. Claude 및 개발자는 아래의 명명 규칙과 도메인 표준을 엄격히 따라야 합니다.

## 1. 테이블 명명 규칙 (Table Naming Rule)
* [cite_start]**길이 제한:** 오라클(Oracle) 기준으로 최대 30 Byte 길이를 초과하지 않도록 제한합니다[cite: 556, 564].
* [cite_start]**용어 표준화:** 임의의 단어가 아닌 시스템 표준 용어사전에 등록된 기준 용어의 조합으로 테이블명을 구성해야 합니다[cite: 552, 563].
* [cite_start]**모듈 구분:** 각 모듈별 테이블은 식별을 위해 모듈명 접두어(Pre-fix)를 지정하여 구분합니다 (예: 발주 품목 `PO_ITEM`)[cite: 565].

## 2. 컬럼 명명 규칙 (Column Naming Rule)
논리 ERD와 물리 ERD의 작성 기준을 명확히 분리합니다.
* [cite_start]**논리명 (Logical):** 국문 명사형 용어를 사용하며, 단어와 단어 사이의 구분자는 **"공백(Space)"**을 사용합니다 (예: `테넌트 아이디`)[cite: 572, 573, 578, 582, 583].
* [cite_start]**물리명 (Physical):** 영문 용어를 사용하며, 단어와 단어 사이의 구분자는 **"언더바(_)"**를 사용합니다 (예: `TEN_ID`)[cite: 572, 575, 579, 583].

## 3. 공통 컬럼 적용 기준 (Standard Columns)
[cite_start]모든 테이블에는 시스템에서 공통으로 관리되는 다음 컬럼들을 **반드시 명시된 순서대로** 포함해야 합니다[cite: 612, 613].

1. [cite_start]`TEN_ID` (테넌트 아이디): 테이블의 가장 앞자리에 위치하며 PK(Primary Key)로 지정합니다[cite: 613, 622, 623].
2. *(...해당 테이블의 핵심 비즈니스 데이터 컬럼들...)*
3. [cite_start]`RMK` (비고): VARCHAR2(1000)[cite: 613, 626, 629].
4. [cite_start]`STS` (상태): CHAR(1)[cite: 613, 630, 633].
5. [cite_start]`REGR_ID` (등록자 아이디): VARCHAR2(50)[cite: 613, 634, 637].
6. [cite_start]`REG_DTTM` (등록 일시): TIMESTAMP(0) WITH LOCAL TIME ZONE[cite: 613, 638, 641].
7. [cite_start]`MODR_ID` (수정자 아이디): VARCHAR2(50)[cite: 613, 642, 645].
8. [cite_start]`MOD_DTTM` (수정 일시): TIMESTAMP(0) WITH LOCAL TIME ZONE[cite: 613, 646, 649].
[cite_start]*(주의: 3~8번 공통 컬럼은 반드시 테이블의 맨 뒷부분에 위치해야 합니다[cite: 613].)*

## 4. 컬럼 도메인 (Column Domain) 규칙
* [cite_start]**상태 및 여부:** 길이가 1인 코드성 데이터는 `CHAR(1)`을 사용합니다[cite: 606].
* [cite_start]**코드:** 자릿수에 상관없이 문자열 `VARCHAR2(18)`을 기본으로 사용합니다[cite: 605].
* [cite_start]**일시(Datetime):** 등록/수정 등 날짜와 시간을 함께 관리할 때는 Datetime의 `Timestamp` 형을 사용합니다[cite: 598]. [cite_start]일자만 관리할 때는 `VARCHAR2(8)`을 사용합니다[cite: 599, 608].