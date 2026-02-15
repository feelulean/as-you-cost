# [As-you-Cost 1.x] 아키텍처 및 시스템 표준 가이드

본 문서는 As-You-Cost 1.x 어플리케이션 구축을 위한 소프트웨어 아키텍처 정의서입니다. 웹기반 SCM 및 구매관리 솔루션, 특히 사전원가 예측 관리 시스템을 구현하는 AI(Claude) 및 개발자는 본 아키텍처 스타일과 제약사항을 반드시 준수해야 합니다.

## 1. 핵심 기술 스택 (Tech Stack)
* **UI Framework:** Polymer 1.6 (Google Web Component Framework 기반 커스텀 태그 사용)
* **Server Framework:** Spring Framework 6.2.8 (Spring MVC, Security 지원)
* **DB Framework:** MyBatis 3.4
* **Client UI 지원:** Edge, Safari, Chrome, Firefox, Opera (IE 하위 버전 미지원)

## 2. 소프트웨어 아키텍처 스타일 (5-Layered Architecture)
본 시스템은 다음과 같은 5계층의 Layered 아키텍처를 사용합니다.
1. **UI Layer:** HTML5, CSS3, JavaScript 및 Polymer Framework 기반의 Web Components 사용.
2. **Presentation Layer:** 사용자의 액션 처리 및 서버 사이드 서비스 요청 (Spring MVC의 Controller 역할).
3. **Business Logic Layer:** 요청 메시지에 따른 비즈니스 서비스 제공 (Spring Service 클래스).
4. **Resource Access Layer:** 서비스 정보 유지 및 DBMS 데이터 처리 (Repository 클래스).
5. **Data Layer:** 관계형 데이터베이스 (표준 ANSI SQL 지원).

## 3. 구현 패턴 및 데이터 흐름 (Data Flow)
일반적인 구현 패턴은 `View(HTML) -> Controller -> Service -> Repository -> Mapper(XML)` 구조를 따릅니다.
* **UI (HTML):** `<sc-ajax url="path" body="{{param}}">` 컴포넌트를 사용하여 Controller를 호출합니다.
* **Controller:** `@RequestMapping`을 통해 Ajax 호출을 매핑하고, 의존성 주입된 Service를 호출합니다. 클라이언트 파라미터는 `@RequestBody`로 Map/List 타입으로 받습니다.
* **Service:** 인터페이스(Interface) 없이 Class로 구현하며, 비즈니스 로직을 수행합니다.
* **Repository:** Service에서 MyBatis Mapper를 직접 호출하지 않고, 반드시 Repository Class를 거쳐 데이터 접근 계층의 유연성을 확보합니다.
* **SQL Mapper:** MyBatis XML을 통해 쿼리를 수행하고 `resultType` 형태로 반환합니다.

## 4. 필수 어노테이션 (Annotation) 가이드
* `@Controller`: 웹 요청 처리 컨트롤러 클래스에 선언.
* `@Service`: 비즈니스 로직 처리 서비스 클래스에 선언.
* `@Inject`: 객체 간 의존성 주입(DI)에 사용 (표준 Java Annotation).
* `@RequestMapping`: HTTP 요청 매핑 (클라이언트 `<sc-ajax>`의 url과 연결).
* `@RequestBody` / `@ResponseBody`: 파라미터 및 리턴 데이터(Map, List 등) JSON 변환.
* `@Transactional`: 데이터 변경(Insert/Update/Delete)이 일어나는 Service 메소드에 적용하여 트랜잭션 관리.

## 5. 데이터베이스 접근 파라미터 규칙
MyBatis SQL Mapper 사용 시 시스템 공통 전처리 파라미터를 반드시 활용해야 합니다.
* 전달받은 파라미터 (Repository에서 넘어온 값): `#{p.필드명}` 형태로 사용.
* **글로벌 파라미터 (세션 정보 등): `#{g.파라미터명}` 형태로 사용**.
    * `g.tenant` : 시스템 테넌트 ID
    * `g.username` : 사용자 ID
    * `g.locale` : 현재 설정된 다국어
    * `g.now` : 현재 서버 시간
    * `g.vd_cd` : 로그인 협력사 코드

## 6. 패키지 구조 (Package Structure)
업무 성격에 따라 패키지를 엄격히 분리합니다. 
* 내부 사용자(Buyer) 업무: `smartcost.app.bp.*`
* 외부 사용자(Supplier) 업무: `smartcost.app.sp.*`
* *현재 구축 중인 SCM 및 사전원가 관리 솔루션은 내부 사용자 중심 업무이므로 `bp` 하위에 패키지를 구성할 것.*

## 7. 시스템 제약 및 보안 사항
* 관리정보는 권한에 의해서만 접근 가능해야 하며, 패스워드는 DB 저장 시 반드시 암호화해야 합니다.
* 모든 데이터 전송은 TLS/SSL 프로토콜로 암호화하며, OWASP Top 10(SQL Injection, XSS 등) 방어 대책을 코드로 구현해야 합니다.