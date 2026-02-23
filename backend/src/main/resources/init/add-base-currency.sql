-- ============================================================
-- BASE_CURRENCY 칼럼 추가 마이그레이션
-- 3개 프로젝트 마스터 테이블에 기준통화 칼럼 추가
-- ============================================================

-- ■ 견적원가 프로젝트 마스터
ALTER TABLE asyoucost.PCM_EC_PJT_MSTR
  ADD COLUMN IF NOT EXISTS BASE_CURRENCY VARCHAR(10) DEFAULT 'KRW';

COMMENT ON COLUMN asyoucost.PCM_EC_PJT_MSTR.BASE_CURRENCY IS '기준통화 (KRW/USD/EUR/JPY/CNY)';

-- ■ 현상원가 프로젝트 마스터
ALTER TABLE asyoucost.PCM_CUR_PJT_MSTR
  ADD COLUMN IF NOT EXISTS BASE_CURRENCY VARCHAR(10) DEFAULT 'KRW';

COMMENT ON COLUMN asyoucost.PCM_CUR_PJT_MSTR.BASE_CURRENCY IS '기준통화 (KRW/USD/EUR/JPY/CNY)';

-- ■ 목표원가 프로젝트 마스터
ALTER TABLE asyoucost.PCM_TGT_PJT_MSTR
  ADD COLUMN IF NOT EXISTS BASE_CURRENCY VARCHAR(10) DEFAULT 'KRW';

COMMENT ON COLUMN asyoucost.PCM_TGT_PJT_MSTR.BASE_CURRENCY IS '기준통화 (KRW/USD/EUR/JPY/CNY)'
