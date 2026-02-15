-- ============================================================
-- 견적BOM 테이블
-- 테이블명: PCM_EC_BOM
-- 스키마: asyoucost
-- 모듈접두: PCM (Pre-Cost Management)
-- DBMS: Supabase Cloud PostgreSQL
-- ============================================================
-- BOM 계층 구조:
--   UP_ITEM_CD(상위품번)와 ITEM_CD(품번)의 부모-자식 관계
--   LVL(레벨)로 깊이 표현 (0=최상위, 1=1차 하위, 2=2차 하위...)
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

CREATE TABLE asyoucost.PCM_EC_BOM (
    -- ■ PK / 테넌트 ─────────────────────────────────
    TEN_ID          VARCHAR(18)     NOT NULL,       -- 테넌트 아이디
    EC_PJT_CD       VARCHAR(18)     NOT NULL,       -- 견적원가 프로젝트 코드
    ITEM_CD         VARCHAR(50)     NOT NULL,       -- 품번 (Part Number)

    -- ■ BOM 계층 구조 ─────────────────────────────
    UP_ITEM_CD      VARCHAR(50),                    -- 상위품번 (NULL이면 최상위)
    LVL             INTEGER         DEFAULT 0,      -- 레벨 (0=최상위)

    -- ■ 부품 정보 ──────────────────────────────────
    ITEM_NM         VARCHAR(200)    NOT NULL,       -- 품목명
    SPEC            VARCHAR(200),                   -- 규격
    QTY             NUMERIC(12,2)   DEFAULT 0,      -- 수량
    UNIT_PRICE      BIGINT          DEFAULT 0,      -- 단가 (원)
    MAT_COST        BIGINT          DEFAULT 0,      -- 재료비 (수량 × 단가)
    NEW_PART_YN     CHAR(1)         DEFAULT 'N',    -- 신규부품 여부 (Y/N)

    -- ■ 공통 컬럼 (순서 고정) ──────────────────────
    RMK             VARCHAR(1000),                  -- 비고
    STS             CHAR(1)         DEFAULT 'T',    -- 상태 (T:작성중 / A:확정)
    REGR_ID         VARCHAR(50),                    -- 등록자 아이디
    REG_DTTM        TIMESTAMPTZ,                    -- 등록 일시
    MODR_ID         VARCHAR(50),                    -- 수정자 아이디
    MOD_DTTM        TIMESTAMPTZ,                    -- 수정 일시

    -- ■ PK 제약조건 ────────────────────────────────
    CONSTRAINT PK_PCM_EC_BOM PRIMARY KEY (TEN_ID, EC_PJT_CD, ITEM_CD)
);

-- ============================================================
-- 인덱스
-- ============================================================

-- 상위품번 기반 자식 조회용
CREATE INDEX IDX_PCM_EC_BOM_01
    ON asyoucost.PCM_EC_BOM (TEN_ID, EC_PJT_CD, UP_ITEM_CD);

-- 레벨 기반 조회용
CREATE INDEX IDX_PCM_EC_BOM_02
    ON asyoucost.PCM_EC_BOM (TEN_ID, EC_PJT_CD, LVL);

-- ============================================================
-- 테이블 / 컬럼 코멘트
-- ============================================================

COMMENT ON TABLE  asyoucost.PCM_EC_BOM                  IS '견적BOM';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.TEN_ID           IS '테넌트 아이디';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.EC_PJT_CD        IS '견적원가 프로젝트 코드';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.ITEM_CD          IS '품번 (Part Number)';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.UP_ITEM_CD       IS '상위품번 (NULL이면 최상위)';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.LVL              IS '레벨 (0=최상위)';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.ITEM_NM          IS '품목명';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.SPEC             IS '규격';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.QTY              IS '수량';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.UNIT_PRICE       IS '단가 (원)';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.MAT_COST         IS '재료비 (수량 x 단가)';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.NEW_PART_YN      IS '신규부품 여부 (Y/N)';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.RMK              IS '비고';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.STS              IS '상태 (T:작성중/A:확정)';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.REGR_ID          IS '등록자 아이디';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.REG_DTTM         IS '등록 일시';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.MODR_ID          IS '수정자 아이디';
COMMENT ON COLUMN asyoucost.PCM_EC_BOM.MOD_DTTM         IS '수정 일시';
