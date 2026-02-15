-- ============================================================
-- 목표원가 부문별 Guide 테이블
-- 테이블명: PCM_TGT_GUIDE
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

CREATE TABLE asyoucost.PCM_TGT_GUIDE (
    -- ■ PK / 테넌트 ─────────────────────────────────
    TEN_ID              VARCHAR(18)     NOT NULL,       -- 테넌트 아이디
    TGT_PJT_CD          VARCHAR(18)     NOT NULL,       -- 목표원가 프로젝트 코드
    GUIDE_SEQ            INTEGER         NOT NULL,       -- Guide 순번

    -- ■ 원가항목 정보 ──────────────────────────────
    COST_ITEM_CD        VARCHAR(18),                    -- 원가항목 코드 (MAT:재료비, LAB:노무비, DEP:감가상각비, MFG:제조경비, SGA:판관비, OTH:기타)
    COST_ITEM_NM        VARCHAR(100),                   -- 원가항목명
    DEPT_CD             VARCHAR(18),                    -- 주관부서 코드
    DEPT_NM             VARCHAR(100),                   -- 주관부서명

    -- ■ 견적/현상원가 ─────────────────────────────
    EC_COST_TOT_AMT     BIGINT,                         -- 견적/현상원가 총금액
    EC_COST_UNIT_AMT    BIGINT,                         -- 견적/현상원가 단위당금액

    -- ■ 목표 Guide 금액 ──────────────────────────
    GUIDE_TGT_TOT_AMT   BIGINT,                         -- 목표 Guide 총금액 (시스템 산출)
    GUIDE_TGT_UNIT_AMT  BIGINT,                         -- 목표 Guide 단위당금액

    -- ■ CFT 확정 금액 ────────────────────────────
    CFT_TGT_TOT_AMT     BIGINT,                         -- CFT 확정 총금액 (사용자 입력)
    CFT_TGT_UNIT_AMT    BIGINT,                         -- CFT 확정 단위당금액

    -- ■ 절감 정보 ────────────────────────────────
    SAVE_RATE           NUMERIC(5,2),                   -- 절감률 (%)
    PROD_QTY            BIGINT,                         -- 생산수량 (단가 환산용)

    -- ■ 공통 컬럼 (순서 고정) ──────────────────────
    RMK                 VARCHAR(1000),                  -- 비고
    STS                 CHAR(1)         DEFAULT 'T',    -- 상태 (T:산출 / A:CFT확정 / C:완료)
    REGR_ID             VARCHAR(50),                    -- 등록자 아이디
    REG_DTTM            TIMESTAMPTZ,                    -- 등록 일시
    MODR_ID             VARCHAR(50),                    -- 수정자 아이디
    MOD_DTTM            TIMESTAMPTZ,                    -- 수정 일시

    -- ■ PK 제약조건 ────────────────────────────────
    CONSTRAINT PK_PCM_TGT_GUIDE PRIMARY KEY (TEN_ID, TGT_PJT_CD, GUIDE_SEQ)
);

-- ============================================================
-- FK 제약조건 (프로젝트 마스터 참조)
-- ============================================================
ALTER TABLE asyoucost.PCM_TGT_GUIDE
    ADD CONSTRAINT FK_PCM_TGT_GUIDE_PJT
    FOREIGN KEY (TEN_ID, TGT_PJT_CD)
    REFERENCES asyoucost.PCM_TGT_PJT_MSTR (TEN_ID, TGT_PJT_CD);

-- ============================================================
-- 인덱스
-- ============================================================

-- 프로젝트 코드 + 원가항목 검색용
CREATE INDEX IDX_PCM_TGT_GUIDE_01
    ON asyoucost.PCM_TGT_GUIDE (TEN_ID, TGT_PJT_CD, COST_ITEM_CD);

-- ============================================================
-- 테이블 / 컬럼 코멘트
-- ============================================================

COMMENT ON TABLE  asyoucost.PCM_TGT_GUIDE                      IS '목표원가 부문별 Guide';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.TEN_ID               IS '테넌트 아이디';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.TGT_PJT_CD           IS '목표원가 프로젝트 코드';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.GUIDE_SEQ             IS 'Guide 순번';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.COST_ITEM_CD         IS '원가항목 코드';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.COST_ITEM_NM         IS '원가항목명';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.DEPT_CD              IS '주관부서 코드';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.DEPT_NM              IS '주관부서명';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.EC_COST_TOT_AMT      IS '견적/현상원가 총금액';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.EC_COST_UNIT_AMT     IS '견적/현상원가 단위당금액';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.GUIDE_TGT_TOT_AMT    IS '목표 Guide 총금액';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.GUIDE_TGT_UNIT_AMT   IS '목표 Guide 단위당금액';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.CFT_TGT_TOT_AMT      IS 'CFT 확정 총금액';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.CFT_TGT_UNIT_AMT     IS 'CFT 확정 단위당금액';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.SAVE_RATE            IS '절감률 (%)';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.PROD_QTY             IS '생산수량';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.RMK                  IS '비고';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.STS                   IS '상태 (T:산출/A:CFT확정/C:완료)';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.REGR_ID              IS '등록자 아이디';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.REG_DTTM             IS '등록 일시';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.MODR_ID              IS '수정자 아이디';
COMMENT ON COLUMN asyoucost.PCM_TGT_GUIDE.MOD_DTTM             IS '수정 일시';
