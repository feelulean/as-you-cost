-- YHJY As-You-Cost — 달성도 평가 테이블 DDL
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================

SET search_path TO asyoucost;

CREATE TABLE IF NOT EXISTS asyoucost.PCM_CUR_ACHV_EVAL (
    TEN_ID          VARCHAR(18)     NOT NULL,
    CUR_PJT_CD      VARCHAR(18)     NOT NULL,
    EC_PJT_CD       VARCHAR(18),
    TGT_PJT_CD      VARCHAR(18),
    PJT_NM          VARCHAR(200),
    BIZ_UNIT        VARCHAR(18),
    CUST_NM         VARCHAR(100),
    CAR_TYPE        VARCHAR(100),
    EC_TOTAL_COST   NUMERIC(18,2)   DEFAULT 0,
    TGT_TOTAL_COST  NUMERIC(18,2)   DEFAULT 0,
    CUR_TOTAL_COST  NUMERIC(18,2)   DEFAULT 0,
    SAVE_TGT_AMT    NUMERIC(18,2)   DEFAULT 0,
    SAVE_ACT_AMT    NUMERIC(18,2)   DEFAULT 0,
    ACHV_RATE       NUMERIC(8,2)    DEFAULT 0,
    ACHV_YN         CHAR(1)         DEFAULT 'N',
    EVAL_DT         VARCHAR(10),
    RMK             VARCHAR(1000),
    STS             CHAR(1)         DEFAULT 'T',
    REGR_ID         VARCHAR(50),
    REG_DTTM        TIMESTAMPTZ,
    MODR_ID         VARCHAR(50),
    MOD_DTTM        TIMESTAMPTZ,
    CONSTRAINT PK_PCM_CUR_ACHV_EVAL PRIMARY KEY (TEN_ID, CUR_PJT_CD)
);
