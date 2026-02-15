-- ============================================================
-- 공통 그룹코드 마스터
-- 테이블명: PCM_COM_GRP_CD
-- ============================================================
SET search_path TO asyoucost;

CREATE TABLE IF NOT EXISTS asyoucost.PCM_COM_GRP_CD (
    TEN_ID          VARCHAR(18)     NOT NULL,
    GRP_CD          VARCHAR(18)     NOT NULL,
    GRP_NM          VARCHAR(200)    NOT NULL,
    USE_YN          CHAR(1)         DEFAULT 'Y',
    SORT_NO         INTEGER         DEFAULT 0,
    RMK             VARCHAR(1000),
    REGR_ID         VARCHAR(50),
    REG_DTTM        TIMESTAMPTZ,
    MODR_ID         VARCHAR(50),
    MOD_DTTM        TIMESTAMPTZ,
    CONSTRAINT PK_PCM_COM_GRP_CD PRIMARY KEY (TEN_ID, GRP_CD)
);

COMMENT ON TABLE  asyoucost.PCM_COM_GRP_CD IS '공통 그룹코드 마스터';
