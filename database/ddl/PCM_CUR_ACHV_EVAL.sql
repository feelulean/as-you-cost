-- ============================================================
-- 현상원가 달성도 평가 테이블
-- 테이블명: PCM_CUR_ACHV_EVAL
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

CREATE TABLE asyoucost.PCM_CUR_ACHV_EVAL (
    -- ■ PK / 테넌트 ─────────────────────────────────
    TEN_ID          VARCHAR(18)     NOT NULL,       -- 테넌트 아이디
    CUR_PJT_CD      VARCHAR(18)     NOT NULL,       -- 현상원가 프로젝트 코드 (예: CC20260001)

    -- ■ 연계 프로젝트 ────────────────────────────────
    EC_PJT_CD       VARCHAR(18),                    -- 견적원가 프로젝트 코드
    TGT_PJT_CD      VARCHAR(18),                    -- 목표원가 프로젝트 코드

    -- ■ 프로젝트 기본 정보 ───────────────────────────
    PJT_NM          VARCHAR(200),                   -- 프로젝트명
    BIZ_UNIT        VARCHAR(18),                    -- 사업부 (PT / SEAT)
    CUST_NM         VARCHAR(100),                   -- 고객사명
    CAR_TYPE        VARCHAR(100),                   -- 차종

    -- ■ 원가 비교 금액 ──────────────────────────────
    EC_TOTAL_COST   NUMERIC(18,2)   DEFAULT 0,      -- 견적원가 총원가 (EC Profit)
    TGT_TOTAL_COST  NUMERIC(18,2)   DEFAULT 0,      -- 목표원가 총원가 (TC Guide 합계)
    CUR_TOTAL_COST  NUMERIC(18,2)   DEFAULT 0,      -- 현상원가 총원가 (실적)

    -- ■ 달성도 산출 ─────────────────────────────────
    SAVE_TGT_AMT    NUMERIC(18,2)   DEFAULT 0,      -- 절감목표 = EC - TGT
    SAVE_ACT_AMT    NUMERIC(18,2)   DEFAULT 0,      -- 절감액   = EC - CUR
    ACHV_RATE       NUMERIC(8,2)    DEFAULT 0,       -- 달성도(%) = 절감액/절감목표×100
    ACHV_YN         CHAR(1)         DEFAULT 'N',     -- 달성여부 (Y/N)
    EVAL_DT         VARCHAR(10),                     -- 평가일 (YYYY-MM-DD)

    -- ■ 공통 컬럼 (순서 고정) ──────────────────────
    RMK             VARCHAR(1000),                  -- 비고
    STS             CHAR(1)         DEFAULT 'T',    -- 상태 (T:작성중 / C:완료)
    REGR_ID         VARCHAR(50),                    -- 등록자 아이디
    REG_DTTM        TIMESTAMPTZ,                    -- 등록 일시
    MODR_ID         VARCHAR(50),                    -- 수정자 아이디
    MOD_DTTM        TIMESTAMPTZ,                    -- 수정 일시

    -- ■ PK 제약조건 ────────────────────────────────
    CONSTRAINT PK_PCM_CUR_ACHV_EVAL PRIMARY KEY (TEN_ID, CUR_PJT_CD)
);

-- ============================================================
-- 인덱스
-- ============================================================

-- 사업부 + 달성여부 복합 인덱스 (목록 조회 성능)
CREATE INDEX IDX_PCM_CUR_ACHV_01
    ON asyoucost.PCM_CUR_ACHV_EVAL (TEN_ID, BIZ_UNIT, ACHV_YN);

-- 견적원가 프로젝트 연계 조회용 인덱스
CREATE INDEX IDX_PCM_CUR_ACHV_02
    ON asyoucost.PCM_CUR_ACHV_EVAL (TEN_ID, EC_PJT_CD);

-- ============================================================
-- 테이블 / 컬럼 코멘트
-- ============================================================

COMMENT ON TABLE  asyoucost.PCM_CUR_ACHV_EVAL                IS '현상원가 달성도 평가';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.TEN_ID         IS '테넌트 아이디';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.CUR_PJT_CD     IS '현상원가 프로젝트 코드';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.EC_PJT_CD      IS '견적원가 프로젝트 코드';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.TGT_PJT_CD     IS '목표원가 프로젝트 코드';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.PJT_NM         IS '프로젝트명';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.BIZ_UNIT       IS '사업부 (PT/SEAT)';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.CUST_NM        IS '고객사명';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.CAR_TYPE       IS '차종';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.EC_TOTAL_COST  IS '견적원가 총원가';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.TGT_TOTAL_COST IS '목표원가 총원가';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.CUR_TOTAL_COST IS '현상원가 총원가 (실적)';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.SAVE_TGT_AMT   IS '절감목표 (견적-목표)';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.SAVE_ACT_AMT   IS '절감액 (견적-현상)';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.ACHV_RATE      IS '달성도(%)';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.ACHV_YN        IS '달성여부 (Y/N)';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.EVAL_DT        IS '평가일 (YYYY-MM-DD)';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.RMK            IS '비고';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.STS            IS '상태 (T:작성중/C:완료)';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.REGR_ID        IS '등록자 아이디';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.REG_DTTM       IS '등록 일시';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.MODR_ID        IS '수정자 아이디';
COMMENT ON COLUMN asyoucost.PCM_CUR_ACHV_EVAL.MOD_DTTM       IS '수정 일시';
