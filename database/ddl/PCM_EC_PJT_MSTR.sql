-- ============================================================
-- 견적원가 프로젝트 마스터 테이블
-- 테이블명: PCM_EC_PJT_MSTR
-- 스키마: asyoucost
-- 모듈접두: PCM (Pre-Cost Management)
-- DBMS: Supabase Cloud PostgreSQL
-- ============================================================
-- 공통 컬럼 적용 기준 (03_db_naming_rule.md 준수)
--   1) TEN_ID      : 테이블 맨 앞, PK
--   2) 비즈니스 컬럼들
--   3) RMK         : 비고
--   4) STS         : 상태
--   5) REGR_ID     : 등록자 아이디
--   6) REG_DTTM    : 등록 일시
--   7) MODR_ID     : 수정자 아이디
--   8) MOD_DTTM    : 수정 일시
-- ============================================================

-- 스키마 지정
SET search_path TO asyoucost;

CREATE TABLE asyoucost.PCM_EC_PJT_MSTR (
    -- ■ PK / 테넌트 ─────────────────────────────────
    TEN_ID          VARCHAR(18)     NOT NULL,       -- 테넌트 아이디
    EC_PJT_CD       VARCHAR(18)     NOT NULL,       -- 견적원가 프로젝트 코드 (예: EC20260001)

    -- ■ 비즈니스 컬럼 ──────────────────────────────
    PJT_NM          VARCHAR(200)    NOT NULL,       -- 프로젝트명
    BIZ_UNIT        VARCHAR(18),                    -- 사업부 (PT / SEAT)
    CUST_NM         VARCHAR(100),                   -- 고객사명
    CAR_TYPE        VARCHAR(100),                   -- 차종
    OEM_NM          VARCHAR(100),                   -- OEM명
    PROD_GRP        VARCHAR(18),                    -- 제품군 코드 (TM / AXLE / SEAT)
    PROD_QTY        BIGINT,                         -- 생산수량
    SOP_DT          VARCHAR(10),                    -- SOP 일자 (YYYY-MM-DD)

    -- ■ 공통 컬럼 (순서 고정) ──────────────────────
    RMK             VARCHAR(1000),                  -- 비고
    STS             CHAR(1)         DEFAULT 'T',    -- 상태 (T:작성중 / P:진행중 / A:확정 / R:탈락 / C:완료)
    REGR_ID         VARCHAR(50),                    -- 등록자 아이디
    REG_DTTM        TIMESTAMPTZ,                    -- 등록 일시
    MODR_ID         VARCHAR(50),                    -- 수정자 아이디
    MOD_DTTM        TIMESTAMPTZ,                    -- 수정 일시

    -- ■ PK 제약조건 ────────────────────────────────
    CONSTRAINT PK_PCM_EC_PJT_MSTR PRIMARY KEY (TEN_ID, EC_PJT_CD)
);

-- ============================================================
-- 인덱스
-- ============================================================

-- 사업부 + 상태 복합 인덱스 (목록 조회 성능)
CREATE INDEX IDX_PCM_EC_PJT_01
    ON asyoucost.PCM_EC_PJT_MSTR (TEN_ID, BIZ_UNIT, STS);

-- 고객사명 LIKE 검색용 인덱스
CREATE INDEX IDX_PCM_EC_PJT_02
    ON asyoucost.PCM_EC_PJT_MSTR (TEN_ID, CUST_NM);

-- ============================================================
-- 테이블 / 컬럼 코멘트
-- ============================================================

COMMENT ON TABLE  asyoucost.PCM_EC_PJT_MSTR                IS '견적원가 프로젝트 마스터';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.TEN_ID         IS '테넌트 아이디';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.EC_PJT_CD      IS '견적원가 프로젝트 코드';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.PJT_NM         IS '프로젝트명';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.BIZ_UNIT       IS '사업부 (PT/SEAT)';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.CUST_NM        IS '고객사명';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.CAR_TYPE       IS '차종';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.OEM_NM         IS 'OEM명';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.PROD_GRP       IS '제품군 코드';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.PROD_QTY       IS '생산수량';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.SOP_DT         IS 'SOP 일자';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.RMK            IS '비고';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.STS            IS '상태 (T:작성중/P:진행중/A:확정/R:탈락/C:완료)';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.REGR_ID        IS '등록자 아이디';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.REG_DTTM       IS '등록 일시';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.MODR_ID        IS '수정자 아이디';
COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.MOD_DTTM       IS '수정 일시';
