-- ============================================================
-- As-You-Cost 스키마 초기화
-- Supabase Cloud PostgreSQL 전용
-- ============================================================
-- JJun-Solutions(public 스키마)와 완전 격리를 위해
-- asyoucost 전용 스키마를 생성하고 권한을 부여한다.
-- ============================================================
-- ★ Supabase SQL Editor에서 최초 1회 실행 ★
-- ============================================================

-- 1. 스키마 생성
CREATE SCHEMA IF NOT EXISTS asyoucost;

-- 2. 스키마 소유권 → postgres (Supabase 기본 사용자)
ALTER SCHEMA asyoucost OWNER TO postgres;

-- 3. 권한 부여
GRANT ALL ON SCHEMA asyoucost TO postgres;
GRANT USAGE ON SCHEMA asyoucost TO anon, authenticated, service_role;

-- 4. 기본 권한 설정 (향후 생성 테이블에도 자동 적용)
ALTER DEFAULT PRIVILEGES IN SCHEMA asyoucost
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA asyoucost
    GRANT USAGE, SELECT ON SEQUENCES TO postgres;

-- 5. search_path 확인
-- JDBC URL에 currentSchema=asyoucost 파라미터로 자동 설정됨
-- 수동 확인: SHOW search_path;
