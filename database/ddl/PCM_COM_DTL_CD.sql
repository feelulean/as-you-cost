-- ============================================================
-- 공통 상세코드
-- 테이블명: PCM_COM_DTL_CD
-- ============================================================
SET search_path TO asyoucost;

CREATE TABLE IF NOT EXISTS asyoucost.PCM_COM_DTL_CD (
    TEN_ID          VARCHAR(18)     NOT NULL,
    GRP_CD          VARCHAR(18)     NOT NULL,
    DTL_CD          VARCHAR(50)     NOT NULL,
    CD_NM           VARCHAR(200)    NOT NULL,
    SORT_NO         INTEGER         DEFAULT 0,
    USE_YN          CHAR(1)         DEFAULT 'Y',
    ATTR1           VARCHAR(200),
    ATTR2           VARCHAR(200),
    ATTR3           VARCHAR(200),
    ATTR4           VARCHAR(200),
    RMK             VARCHAR(1000),
    REGR_ID         VARCHAR(50),
    REG_DTTM        TIMESTAMPTZ,
    MODR_ID         VARCHAR(50),
    MOD_DTTM        TIMESTAMPTZ,
    CONSTRAINT PK_PCM_COM_DTL_CD PRIMARY KEY (TEN_ID, GRP_CD, DTL_CD)
);

CREATE INDEX IF NOT EXISTS IDX_PCM_COM_DTL_01
    ON asyoucost.PCM_COM_DTL_CD (TEN_ID, GRP_CD, SORT_NO);

COMMENT ON TABLE  asyoucost.PCM_COM_DTL_CD IS '공통 상세코드';
