-- ============================================================
-- 견적원가 수익성 분석 테이블
-- 테이블명: PCM_EC_PROFIT
-- 스키마: asyoucost
-- 모듈접두: PCM (Pre-Cost Management)
-- DBMS: Supabase Cloud PostgreSQL
-- ============================================================
-- 견적기준가(표준원가) 요약 + WACC 수익성 Factor 저장
-- 프로젝트당 1건의 수익성 분석 데이터를 관리한다.
-- ============================================================

SET search_path TO asyoucost;

CREATE TABLE asyoucost.PCM_EC_PROFIT (
    -- ■ PK / 테넌트 ─────────────────────────────────
    TEN_ID          VARCHAR(18)     NOT NULL,       -- 테넌트 아이디
    EC_PJT_CD       VARCHAR(18)     NOT NULL,       -- 견적원가 프로젝트 코드

    -- ■ 견적기준가 (표준원가) 요약 ──────────────────
    MAT_COST        BIGINT          DEFAULT 0,      -- 재료비 (BOM 연계)
    LABOR_COST      BIGINT          DEFAULT 0,      -- 노무비
    MFG_COST        BIGINT          DEFAULT 0,      -- 제조경비/감가상각비
    SGA_COST        BIGINT          DEFAULT 0,      -- 판관비
    TOTAL_ESTM_COST BIGINT          DEFAULT 0,      -- 총 견적원가 (합계)

    -- ■ 수익성 분석 Factor (WACC) ───────────────────
    KD_RATE         NUMERIC(8,4)    DEFAULT 0,      -- 타인자본비용 Kd (%)
    TAX_RATE        NUMERIC(8,4)    DEFAULT 0,      -- 법인세율 t (%)
    DEBT_AMT        BIGINT          DEFAULT 0,      -- 부채 B
    EQUITY_AMT      BIGINT          DEFAULT 0,      -- 자기자본 S
    RF_RATE         NUMERIC(8,4)    DEFAULT 0,      -- 무위험이자율 Rf (%)
    ERM_RATE        NUMERIC(8,4)    DEFAULT 0,      -- 시장기대수익률 E(Rm) (%)
    BETA_VAL        NUMERIC(8,4)    DEFAULT 0,      -- 베타 Beta
    KE_RATE         NUMERIC(8,4)    DEFAULT 0,      -- 자기자본비용 Ke (%) [CAPM 산출]
    WACC_RATE       NUMERIC(8,4)    DEFAULT 0,      -- WACC (%) [최종 산출]

    -- ■ 공통 컬럼 (순서 고정) ──────────────────────
    RMK             VARCHAR(1000),                  -- 비고
    STS             CHAR(1)         DEFAULT 'T',    -- 상태 (T:작성중 / A:확정)
    REGR_ID         VARCHAR(50),                    -- 등록자 아이디
    REG_DTTM        TIMESTAMPTZ,                    -- 등록 일시
    MODR_ID         VARCHAR(50),                    -- 수정자 아이디
    MOD_DTTM        TIMESTAMPTZ,                    -- 수정 일시

    -- ■ PK 제약조건 ────────────────────────────────
    CONSTRAINT PK_PCM_EC_PROFIT PRIMARY KEY (TEN_ID, EC_PJT_CD)
);

-- ============================================================
-- 테이블 / 컬럼 코멘트
-- ============================================================

COMMENT ON TABLE  asyoucost.PCM_EC_PROFIT                    IS '견적원가 수익성 분석';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.TEN_ID             IS '테넌트 아이디';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.EC_PJT_CD          IS '견적원가 프로젝트 코드';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.MAT_COST           IS '재료비 (BOM 연계)';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.LABOR_COST         IS '노무비';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.MFG_COST           IS '제조경비/감가상각비';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.SGA_COST           IS '판관비';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.TOTAL_ESTM_COST    IS '총 견적원가 (합계)';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.KD_RATE            IS '타인자본비용 Kd (%)';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.TAX_RATE           IS '법인세율 t (%)';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.DEBT_AMT           IS '부채 B';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.EQUITY_AMT         IS '자기자본 S';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.RF_RATE            IS '무위험이자율 Rf (%)';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.ERM_RATE           IS '시장기대수익률 E(Rm) (%)';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.BETA_VAL           IS '베타 Beta';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.KE_RATE            IS '자기자본비용 Ke (%) - CAPM 산출';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.WACC_RATE          IS 'WACC (%) - 최종 산출';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.RMK                IS '비고';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.STS                IS '상태 (T:작성중/A:확정)';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.REGR_ID            IS '등록자 아이디';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.REG_DTTM           IS '등록 일시';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.MODR_ID            IS '수정자 아이디';
COMMENT ON COLUMN asyoucost.PCM_EC_PROFIT.MOD_DTTM           IS '수정 일시';
