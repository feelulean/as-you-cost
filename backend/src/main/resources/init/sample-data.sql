-- ============================================================
-- As-You-Cost 샘플 데이터 (E2E 테스트용)
-- SEAT 사업부: 3개 프로젝트 / PT 사업부: 3개 프로젝트
-- ============================================================
SET search_path TO asyoucost, public;

-- ── 기존 테스트 데이터 정리 ──

-- CC 상세 테이블 (자식 → 부모 순서)
DELETE FROM PCM_CUR_ACT_MATERIAL    WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_ACT_EVAL        WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_ACHV_EVAL_DTL   WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_DIFF_ANALYSIS   WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_PL_STMT         WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_SGA_COST        WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_MFG_COST        WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_MANPOWER        WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_OTHER_INVEST    WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_LINE_CT         WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_LINE_INVEST_DTL WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_LINE_INVEST     WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_PART_PRICE      WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_BOM_MAP         WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_BOM             WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_MANAGER         WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_SCHEDULE        WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_QTY_DISC        WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_COST_CODE       WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_DETAIL          WHERE TEN_ID = 'T001';

-- TC 상세 테이블 (자식 → 부모 순서)
DELETE FROM PCM_TGT_ACHV_STATUS     WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_RECALC          WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_ACHV_PLAN_DTL   WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_ACHV_PLAN       WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_COST_REG        WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_SETUP_SCHEDULE  WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_DEV_SCHEDULE    WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_QTY_DISC        WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_PRICE           WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_SPEC            WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_MANAGER         WHERE TEN_ID = 'T001';

-- 기존 마스터 테이블
DELETE FROM PCM_CUR_ACHV_EVAL WHERE TEN_ID = 'T001';
DELETE FROM PCM_CUR_PJT_MSTR  WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_GUIDE     WHERE TEN_ID = 'T001';
DELETE FROM PCM_TGT_PJT_MSTR  WHERE TEN_ID = 'T001';
DELETE FROM PCM_EC_PROFIT      WHERE TEN_ID = 'T001';
DELETE FROM PCM_EC_BOM         WHERE TEN_ID = 'T001';
DELETE FROM PCM_EC_PJT_MSTR   WHERE TEN_ID = 'T001';

-- ============================================================
-- 1. 견적원가(EC) 프로젝트 마스터 — 6건
-- ============================================================

-- SEAT-1: 현대 아이오닉7 운전석 시트 ASSY
INSERT INTO PCM_EC_PJT_MSTR (TEN_ID, EC_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP, PROD_QTY, SOP_DT, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
VALUES ('T001','EC20260001','현대 아이오닉7 운전석 시트 ASSY','SEAT','현대모비스','아이오닉7 (NE)','현대자동차','시트',120000,'2026-09','IONIQ7 신규 개발','P','testuser',NOW(),'testuser',NOW());

-- SEAT-2: 기아 EV9 2열시트 ASSY
INSERT INTO PCM_EC_PJT_MSTR (TEN_ID, EC_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP, PROD_QTY, SOP_DT, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
VALUES ('T001','EC20260002','기아 EV9 2열시트 ASSY','SEAT','기아오토','EV9 (MV)','기아자동차','시트',80000,'2026-06','EV9 후석 개발','P','testuser',NOW(),'testuser',NOW());

-- SEAT-3: 제네시스 GV90 파워시트 모듈
INSERT INTO PCM_EC_PJT_MSTR (TEN_ID, EC_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP, PROD_QTY, SOP_DT, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
VALUES ('T001','EC20260003','제네시스 GV90 파워시트 모듈','SEAT','현대모비스','GV90','제네시스','시트',45000,'2027-03','GV90 럭셔리 파워시트','T','testuser',NOW(),'testuser',NOW());

-- PT-1: 현대 투싼 NX5 등속조인트 ASSY
INSERT INTO PCM_EC_PJT_MSTR (TEN_ID, EC_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP, PROD_QTY, SOP_DT, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
VALUES ('T001','EC20260004','현대 투싼 NX5 등속조인트 ASSY','PT','현대위아','투싼 NX5','현대자동차','드라이브샤프트',200000,'2026-08','NX5 F/L 대응','P','testuser',NOW(),'testuser',NOW());

-- PT-2: 기아 쏘렌토 MQ5 드라이브샤프트 ASSY
INSERT INTO PCM_EC_PJT_MSTR (TEN_ID, EC_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP, PROD_QTY, SOP_DT, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
VALUES ('T001','EC20260005','기아 쏘렌토 MQ5 드라이브샤프트 ASSY','PT','기아오토','쏘렌토 MQ5','기아자동차','드라이브샤프트',150000,'2026-11','MQ5 C/Over 개발','P','testuser',NOW(),'testuser',NOW());

-- PT-3: 제네시스 GV80 전동축 ASSY
INSERT INTO PCM_EC_PJT_MSTR (TEN_ID, EC_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP, PROD_QTY, SOP_DT, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
VALUES ('T001','EC20260006','제네시스 GV80 전동축 ASSY','PT','현대위아','GV80','제네시스','전동축',60000,'2027-01','GV80 HEV 전동축','T','testuser',NOW(),'testuser',NOW());


-- ============================================================
-- 2. 견적 BOM — 프로젝트별 계층형 부품 데이터
-- ============================================================

-- ─── EC20260001: 운전석 시트 ASSY (15개 부품) ───
INSERT INTO PCM_EC_BOM (TEN_ID,EC_PJT_CD,ITEM_CD,UP_ITEM_CD,LVL,ITEM_NM,SPEC,QTY,UNIT_PRICE,MAT_COST,NEW_PART_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','EC20260001','SEAT-A01','',0,'운전석 시트 ASSY','IONIQ7 D/SEAT',1,0,0,'N','최상위 ASSY','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-F','SEAT-A01',1,'시트프레임 ASSY','STEEL 1.2t',1,0,0,'N','프레임 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-F01','SEAT-A01-F',2,'사이드프레임(L)','SPFC590 1.2t',1,45000,45000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-F02','SEAT-A01-F',2,'사이드프레임(R)','SPFC590 1.2t',1,45000,45000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-F03','SEAT-A01-F',2,'백프레임','SPFC440 1.0t',1,38000,38000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-F04','SEAT-A01-F',2,'쿠션프레임','SPFC440 0.8t',1,32000,32000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-C','SEAT-A01',1,'시트쿠션 ASSY','PU FOAM+COVER',1,0,0,'N','쿠션 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-C01','SEAT-A01-C',2,'쿠션패드','PU FOAM HR45',1,28000,28000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-C02','SEAT-A01-C',2,'쿠션커버(가죽)','NAPPA LEATHER',1,65000,65000,'Y','프리미엄 가죽','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-C03','SEAT-A01-C',2,'히팅패드','CARBON FIBER',1,35000,35000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-H','SEAT-A01',1,'헤드레스트 ASSY','PU+LEATHER',1,42000,42000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-R','SEAT-A01',1,'시트레일 ASSY','POWER RAIL',1,0,0,'N','레일 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-R01','SEAT-A01-R',2,'어퍼레일','SAPH440 1.6t',2,18000,36000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-R02','SEAT-A01-R',2,'로워레일','SAPH440 2.0t',2,15000,30000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260001','SEAT-A01-M','SEAT-A01',1,'파워모터','DC MOTOR 12V',4,25000,100000,'N','4-WAY','T','testuser',NOW(),'testuser',NOW());

-- ─── EC20260002: EV9 2열시트 ASSY (13개 부품) ───
INSERT INTO PCM_EC_BOM (TEN_ID,EC_PJT_CD,ITEM_CD,UP_ITEM_CD,LVL,ITEM_NM,SPEC,QTY,UNIT_PRICE,MAT_COST,NEW_PART_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','EC20260002','SEAT-B01','',0,'2열시트 ASSY','EV9 2ND ROW',1,0,0,'N','최상위 ASSY','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-F','SEAT-B01',1,'벤치프레임 ASSY','STEEL 60/40',1,0,0,'N','프레임 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-F01','SEAT-B01-F',2,'좌측프레임','SPFC440 1.2t',1,38000,38000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-F02','SEAT-B01-F',2,'우측프레임','SPFC440 1.2t',1,38000,38000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-F03','SEAT-B01-F',2,'센터힌지','SUS304',1,22000,22000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-F04','SEAT-B01-F',2,'리클라이너','RECLINER MODULE',2,28000,56000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-C','SEAT-B01',1,'시트쿠션 ASSY','PU FOAM+FABRIC',1,0,0,'N','쿠션 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-C01','SEAT-B01-C',2,'쿠션패드(3인)','PU FOAM HR40',1,42000,42000,'N','3인용','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-C02','SEAT-B01-C',2,'쿠션커버(패브릭)','POLY FABRIC',1,48000,48000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-B','SEAT-B01',1,'백레스트 ASSY','BACK REST',1,0,0,'N','등받이 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-B01','SEAT-B01-B',2,'백패드','PU FOAM HR35',1,35000,35000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-B02','SEAT-B01-B',2,'백커버(패브릭)','POLY FABRIC',1,45000,45000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260002','SEAT-B01-H','SEAT-B01',1,'헤드레스트','PU+FABRIC',3,28000,84000,'N','3EA','T','testuser',NOW(),'testuser',NOW());

-- ─── EC20260003: GV90 파워시트 모듈 (12개 부품) ───
INSERT INTO PCM_EC_BOM (TEN_ID,EC_PJT_CD,ITEM_CD,UP_ITEM_CD,LVL,ITEM_NM,SPEC,QTY,UNIT_PRICE,MAT_COST,NEW_PART_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','EC20260003','SEAT-C01','',0,'파워시트 모듈','GV90 POWER SEAT',1,0,0,'Y','신규 개발','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260003','SEAT-C01-E','SEAT-C01',1,'시트ECU','MCU 32bit ARM',1,85000,85000,'Y','신규 ECU','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260003','SEAT-C01-M','SEAT-C01',1,'모터모듈 ASSY','DC MOTOR SET',1,0,0,'N','모터 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260003','SEAT-C01-M01','SEAT-C01-M',2,'전후모터','DC 12V 10W',1,32000,32000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260003','SEAT-C01-M02','SEAT-C01-M',2,'리클라인모터','DC 12V 15W',1,32000,32000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260003','SEAT-C01-M03','SEAT-C01-M',2,'높낮이모터','DC 12V 10W',1,32000,32000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260003','SEAT-C01-M04','SEAT-C01-M',2,'틸트모터','DC 12V 8W',1,28000,28000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260003','SEAT-C01-M05','SEAT-C01-M',2,'럼바서포트모터','DC 12V 5W',1,25000,25000,'Y','신규부품','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260003','SEAT-C01-S','SEAT-C01',1,'위치센서 ASSY','SENSOR SET',1,0,0,'N','센서 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260003','SEAT-C01-S01','SEAT-C01-S',2,'홀센서','HALL EFFECT',5,8000,40000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260003','SEAT-C01-S02','SEAT-C01-S',2,'포텐셔미터','10K LINEAR',2,12000,24000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260003','SEAT-C01-W','SEAT-C01',1,'와이어하네스','14P CONNECTOR',1,45000,45000,'N','','T','testuser',NOW(),'testuser',NOW());

-- ─── EC20260004: 투싼 NX5 등속조인트 ASSY (12개 부품) ───
INSERT INTO PCM_EC_BOM (TEN_ID,EC_PJT_CD,ITEM_CD,UP_ITEM_CD,LVL,ITEM_NM,SPEC,QTY,UNIT_PRICE,MAT_COST,NEW_PART_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','EC20260004','PT-A01','',0,'등속조인트 ASSY','NX5 CVJ',1,0,0,'N','최상위 ASSY','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260004','PT-A01-O','PT-A01',1,'아우터레이스 ASSY','SCM420H',1,0,0,'N','아우터 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260004','PT-A01-O01','PT-A01-O',2,'아우터레이스(단조)','SCM420H FORGED',1,28000,28000,'N','열간단조','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260004','PT-A01-O02','PT-A01-O',2,'아우터레이스(가공)','CNC MACHINING',1,15000,15000,'N','CNC가공','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260004','PT-A01-I','PT-A01',1,'인너레이스','SCM420H',1,22000,22000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260004','PT-A01-K','PT-A01',1,'케이지','SCM415',1,18000,18000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260004','PT-A01-B','PT-A01',1,'볼','SUJ2 φ18',6,3500,21000,'N','6EA/SET','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260004','PT-A01-G','PT-A01',1,'그리스','CV GREASE 80g',1,5000,5000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260004','PT-A01-BT','PT-A01',1,'부트 ASSY','TPE BOOT',1,0,0,'N','부트 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260004','PT-A01-BT01','PT-A01-BT',2,'부트(고무)','TPE φ85',1,12000,12000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260004','PT-A01-BT02','PT-A01-BT',2,'부트밴드(대)','SUS304 φ85',1,3000,3000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260004','PT-A01-BT03','PT-A01-BT',2,'부트밴드(소)','SUS304 φ30',1,2500,2500,'N','','T','testuser',NOW(),'testuser',NOW());

-- ─── EC20260005: 쏘렌토 MQ5 드라이브샤프트 ASSY (10개 부품) ───
INSERT INTO PCM_EC_BOM (TEN_ID,EC_PJT_CD,ITEM_CD,UP_ITEM_CD,LVL,ITEM_NM,SPEC,QTY,UNIT_PRICE,MAT_COST,NEW_PART_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','EC20260005','PT-B01','',0,'드라이브샤프트 ASSY','MQ5 D/SHAFT',1,0,0,'N','최상위 ASSY','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260005','PT-B01-S','PT-B01',1,'샤프트바','STKM13A φ28',1,35000,35000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260005','PT-B01-F','PT-B01',1,'고정조인트 ASSY','BJ TYPE',1,0,0,'N','고정측 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260005','PT-B01-F01','PT-B01-F',2,'BJ 아우터레이스','SCM420H',1,32000,32000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260005','PT-B01-F02','PT-B01-F',2,'BJ 인너레이스','SCM420H',1,24000,24000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260005','PT-B01-F03','PT-B01-F',2,'BJ 케이지+볼','SCM415+SUJ2',1,25000,25000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260005','PT-B01-P','PT-B01',1,'슬라이딩조인트 ASSY','TJ TYPE',1,0,0,'N','슬라이딩측 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260005','PT-B01-P01','PT-B01-P',2,'TJ 아우터레이스','SCM420H',1,35000,35000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260005','PT-B01-P02','PT-B01-P',2,'TJ 트리포드','SCM420H',1,28000,28000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260005','PT-B01-BT','PT-B01',1,'부트SET','TPE BOOT×2',2,15000,30000,'N','IN/OUT','T','testuser',NOW(),'testuser',NOW());

-- ─── EC20260006: GV80 전동축 ASSY (13개 부품) ───
INSERT INTO PCM_EC_BOM (TEN_ID,EC_PJT_CD,ITEM_CD,UP_ITEM_CD,LVL,ITEM_NM,SPEC,QTY,UNIT_PRICE,MAT_COST,NEW_PART_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','EC20260006','PT-C01','',0,'전동축 ASSY','GV80 E-AXLE',1,0,0,'Y','신규 개발','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-M','PT-C01',1,'전동모터 ASSY','BLDC 50kW',1,0,0,'Y','모터 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-M01','PT-C01-M',2,'BLDC모터','50kW 400V',1,185000,185000,'Y','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-M02','PT-C01-M',2,'모터하우징','ADC12 다이캐스팅',1,45000,45000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-M03','PT-C01-M',2,'로터+스테이터','전기강판 35A300',1,120000,120000,'Y','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-G','PT-C01',1,'감속기어 ASSY','PLANETARY',1,0,0,'N','기어 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-G01','PT-C01-G',2,'유성기어SET','SCM420H',1,95000,95000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-G02','PT-C01-G',2,'기어하우징','ADC12',1,38000,38000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-G03','PT-C01-G',2,'베어링','6206ZZ',4,12000,48000,'N','','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-D','PT-C01',1,'드라이브샤프트','STKM13A',2,42000,84000,'N','L/R','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-E','PT-C01',1,'제어모듈 ASSY','MCU+INVERTER',1,0,0,'Y','전장 서브모듈','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-E01','PT-C01-E',2,'인버터PCB','SiC MOSFET',1,125000,125000,'Y','SiC 적용','T','testuser',NOW(),'testuser',NOW()),
('T001','EC20260006','PT-C01-E02','PT-C01-E',2,'커넥터하네스','HV 고압커넥터',1,35000,35000,'N','','T','testuser',NOW(),'testuser',NOW());


-- ============================================================
-- 3. 견적원가 수익성 분석 (EC Profit) — 6건
--    WACC = [D×Kd×(1-T) + E×Ke] / (D+E)
--    Ke   = Rf + β × ERM
-- ============================================================

-- EC20260001: 시트 ASSY (matCost=496000)
INSERT INTO PCM_EC_PROFIT (TEN_ID,EC_PJT_CD,MAT_COST,LABOR_COST,MFG_COST,SGA_COST,TOTAL_ESTM_COST,KD_RATE,TAX_RATE,DEBT_AMT,EQUITY_AMT,RF_RATE,ERM_RATE,BETA_VAL,KE_RATE,WACC_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM)
VALUES ('T001','EC20260001',496000,125000,185000,94000,900000,4.50,22.00,5000000000,8000000000,3.50,6.00,1.15,10.40,7.75,'IONIQ7 시트 수익성','T','testuser',NOW(),'testuser',NOW());

-- EC20260002: 2열시트 (matCost=408000)
INSERT INTO PCM_EC_PROFIT (TEN_ID,EC_PJT_CD,MAT_COST,LABOR_COST,MFG_COST,SGA_COST,TOTAL_ESTM_COST,KD_RATE,TAX_RATE,DEBT_AMT,EQUITY_AMT,RF_RATE,ERM_RATE,BETA_VAL,KE_RATE,WACC_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM)
VALUES ('T001','EC20260002',408000,105000,155000,82000,750000,4.50,22.00,5000000000,8000000000,3.50,6.00,1.15,10.40,7.75,'EV9 2열시트 수익성','T','testuser',NOW(),'testuser',NOW());

-- EC20260003: 파워시트 모듈 (matCost=343000)
INSERT INTO PCM_EC_PROFIT (TEN_ID,EC_PJT_CD,MAT_COST,LABOR_COST,MFG_COST,SGA_COST,TOTAL_ESTM_COST,KD_RATE,TAX_RATE,DEBT_AMT,EQUITY_AMT,RF_RATE,ERM_RATE,BETA_VAL,KE_RATE,WACC_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM)
VALUES ('T001','EC20260003',343000,98000,135000,64000,640000,4.20,22.00,4000000000,7000000000,3.50,5.80,1.20,10.46,7.69,'GV90 파워시트 수익성','T','testuser',NOW(),'testuser',NOW());

-- EC20260004: 등속조인트 (matCost=126500)
INSERT INTO PCM_EC_PROFIT (TEN_ID,EC_PJT_CD,MAT_COST,LABOR_COST,MFG_COST,SGA_COST,TOTAL_ESTM_COST,KD_RATE,TAX_RATE,DEBT_AMT,EQUITY_AMT,RF_RATE,ERM_RATE,BETA_VAL,KE_RATE,WACC_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM)
VALUES ('T001','EC20260004',126500,35000,48000,22500,232000,4.00,22.00,3000000000,6000000000,3.50,5.50,1.10,9.55,7.11,'NX5 CVJ 수익성','T','testuser',NOW(),'testuser',NOW());

-- EC20260005: 드라이브샤프트 (matCost=209000)
INSERT INTO PCM_EC_PROFIT (TEN_ID,EC_PJT_CD,MAT_COST,LABOR_COST,MFG_COST,SGA_COST,TOTAL_ESTM_COST,KD_RATE,TAX_RATE,DEBT_AMT,EQUITY_AMT,RF_RATE,ERM_RATE,BETA_VAL,KE_RATE,WACC_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM)
VALUES ('T001','EC20260005',209000,42000,58000,26000,335000,4.00,22.00,3000000000,6000000000,3.50,5.50,1.10,9.55,7.11,'MQ5 D/S 수익성','T','testuser',NOW(),'testuser',NOW());

-- EC20260006: 전동축 (matCost=775000)
INSERT INTO PCM_EC_PROFIT (TEN_ID,EC_PJT_CD,MAT_COST,LABOR_COST,MFG_COST,SGA_COST,TOTAL_ESTM_COST,KD_RATE,TAX_RATE,DEBT_AMT,EQUITY_AMT,RF_RATE,ERM_RATE,BETA_VAL,KE_RATE,WACC_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM)
VALUES ('T001','EC20260006',775000,145000,195000,85000,1200000,4.80,22.00,6000000000,9000000000,3.50,6.20,1.25,11.25,8.26,'GV80 전동축 수익성','T','testuser',NOW(),'testuser',NOW());


-- ============================================================
-- 4. 목표원가(TC) 프로젝트 마스터 — 6건
-- ============================================================

INSERT INTO PCM_TGT_PJT_MSTR (TEN_ID,TGT_PJT_CD,PJT_NM,BIZ_UNIT,CUST_NM,CAR_TYPE,OEM_NM,PROD_GRP,EC_PJT_CD,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001','아이오닉7 시트 목표원가','SEAT','현대모비스','아이오닉7 (NE)','현대자동차','시트','EC20260001','EC20260001 기반 목표원가','A','testuser',NOW(),'testuser',NOW()),
('T001','TC20260002','EV9 2열시트 목표원가','SEAT','기아오토','EV9 (MV)','기아자동차','시트','EC20260002','EC20260002 기반 목표원가','P','testuser',NOW(),'testuser',NOW()),
('T001','TC20260003','GV90 파워시트 목표원가','SEAT','현대모비스','GV90','제네시스','시트','EC20260003','EC20260003 기반 목표원가','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004','투싼 NX5 CVJ 목표원가','PT','현대위아','투싼 NX5','현대자동차','드라이브샤프트','EC20260004','EC20260004 기반 목표원가','A','testuser',NOW(),'testuser',NOW()),
('T001','TC20260005','쏘렌토 MQ5 D/S 목표원가','PT','기아오토','쏘렌토 MQ5','기아자동차','드라이브샤프트','EC20260005','EC20260005 기반 목표원가','P','testuser',NOW(),'testuser',NOW()),
('T001','TC20260006','GV80 전동축 목표원가','PT','현대위아','GV80','제네시스','전동축','EC20260006','EC20260006 기반 목표원가','T','testuser',NOW(),'testuser',NOW());


-- ============================================================
-- 5. 목표원가 부문별 Guide — 프로젝트당 4개 원가항목
-- ============================================================

-- TC20260001: 아이오닉7 시트 (EC total=900000)
INSERT INTO PCM_TGT_GUIDE (TEN_ID,TGT_PJT_CD,GUIDE_SEQ,COST_ITEM_CD,COST_ITEM_NM,DEPT_CD,DEPT_NM,EC_COST_TOT_AMT,EC_COST_UNIT_AMT,GUIDE_TGT_TOT_AMT,GUIDE_TGT_UNIT_AMT,CFT_TGT_TOT_AMT,CFT_TGT_UNIT_AMT,SAVE_RATE,PROD_QTY,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001',1,'MAT','재료비','SEAT-D01','시트설계팀',496000,4.13,460000,3.83,462000,3.85,6.85,120000,'','A','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',2,'LABOR','인건비','SEAT-D02','시트생산팀',125000,1.04,118000,0.98,119000,0.99,4.80,120000,'','A','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',3,'MFG','제조경비','SEAT-D03','시트품질팀',185000,1.54,170000,1.42,172000,1.43,7.03,120000,'','A','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',4,'SGA','판관비','SEAT-D04','영업관리팀',94000,0.78,87000,0.73,88000,0.73,6.38,120000,'','A','testuser',NOW(),'testuser',NOW());

-- TC20260002: EV9 2열시트 (EC total=750000)
INSERT INTO PCM_TGT_GUIDE (TEN_ID,TGT_PJT_CD,GUIDE_SEQ,COST_ITEM_CD,COST_ITEM_NM,DEPT_CD,DEPT_NM,EC_COST_TOT_AMT,EC_COST_UNIT_AMT,GUIDE_TGT_TOT_AMT,GUIDE_TGT_UNIT_AMT,CFT_TGT_TOT_AMT,CFT_TGT_UNIT_AMT,SAVE_RATE,PROD_QTY,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260002',1,'MAT','재료비','SEAT-D01','시트설계팀',408000,5.10,380000,4.75,382000,4.78,6.37,80000,'','P','testuser',NOW(),'testuser',NOW()),
('T001','TC20260002',2,'LABOR','인건비','SEAT-D02','시트생산팀',105000,1.31,98000,1.23,99000,1.24,5.71,80000,'','P','testuser',NOW(),'testuser',NOW()),
('T001','TC20260002',3,'MFG','제조경비','SEAT-D03','시트품질팀',155000,1.94,143000,1.79,145000,1.81,6.45,80000,'','P','testuser',NOW(),'testuser',NOW()),
('T001','TC20260002',4,'SGA','판관비','SEAT-D04','영업관리팀',82000,1.03,75000,0.94,76000,0.95,7.32,80000,'','P','testuser',NOW(),'testuser',NOW());

-- TC20260003: GV90 파워시트 (EC total=640000)
INSERT INTO PCM_TGT_GUIDE (TEN_ID,TGT_PJT_CD,GUIDE_SEQ,COST_ITEM_CD,COST_ITEM_NM,DEPT_CD,DEPT_NM,EC_COST_TOT_AMT,EC_COST_UNIT_AMT,GUIDE_TGT_TOT_AMT,GUIDE_TGT_UNIT_AMT,CFT_TGT_TOT_AMT,CFT_TGT_UNIT_AMT,SAVE_RATE,PROD_QTY,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260003',1,'MAT','재료비','SEAT-D01','시트설계팀',343000,7.62,320000,7.11,0,0,6.71,45000,'','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260003',2,'LABOR','인건비','SEAT-D02','시트생산팀',98000,2.18,92000,2.04,0,0,6.12,45000,'','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260003',3,'MFG','제조경비','SEAT-D03','시트품질팀',135000,3.00,125000,2.78,0,0,7.41,45000,'','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260003',4,'SGA','판관비','SEAT-D04','영업관리팀',64000,1.42,58000,1.29,0,0,9.38,45000,'','T','testuser',NOW(),'testuser',NOW());

-- TC20260004: 투싼 NX5 CVJ (EC total=232000)
INSERT INTO PCM_TGT_GUIDE (TEN_ID,TGT_PJT_CD,GUIDE_SEQ,COST_ITEM_CD,COST_ITEM_NM,DEPT_CD,DEPT_NM,EC_COST_TOT_AMT,EC_COST_UNIT_AMT,GUIDE_TGT_TOT_AMT,GUIDE_TGT_UNIT_AMT,CFT_TGT_TOT_AMT,CFT_TGT_UNIT_AMT,SAVE_RATE,PROD_QTY,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004',1,'MAT','재료비','PT-D01','PT설계팀',126500,0.63,118000,0.59,119000,0.60,5.93,200000,'','A','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',2,'LABOR','인건비','PT-D02','PT생산팀',35000,0.18,33000,0.17,33000,0.17,5.71,200000,'','A','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',3,'MFG','제조경비','PT-D03','PT품질팀',48000,0.24,45000,0.23,45000,0.23,6.25,200000,'','A','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',4,'SGA','판관비','PT-D04','영업관리팀',22500,0.11,20000,0.10,21000,0.11,6.67,200000,'','A','testuser',NOW(),'testuser',NOW());

-- TC20260005: 쏘렌토 MQ5 D/S (EC total=335000)
INSERT INTO PCM_TGT_GUIDE (TEN_ID,TGT_PJT_CD,GUIDE_SEQ,COST_ITEM_CD,COST_ITEM_NM,DEPT_CD,DEPT_NM,EC_COST_TOT_AMT,EC_COST_UNIT_AMT,GUIDE_TGT_TOT_AMT,GUIDE_TGT_UNIT_AMT,CFT_TGT_TOT_AMT,CFT_TGT_UNIT_AMT,SAVE_RATE,PROD_QTY,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260005',1,'MAT','재료비','PT-D01','PT설계팀',209000,1.39,195000,1.30,0,0,6.70,150000,'','P','testuser',NOW(),'testuser',NOW()),
('T001','TC20260005',2,'LABOR','인건비','PT-D02','PT생산팀',42000,0.28,39000,0.26,0,0,7.14,150000,'','P','testuser',NOW(),'testuser',NOW()),
('T001','TC20260005',3,'MFG','제조경비','PT-D03','PT품질팀',58000,0.39,54000,0.36,0,0,6.90,150000,'','P','testuser',NOW(),'testuser',NOW()),
('T001','TC20260005',4,'SGA','판관비','PT-D04','영업관리팀',26000,0.17,24000,0.16,0,0,7.69,150000,'','P','testuser',NOW(),'testuser',NOW());

-- TC20260006: GV80 전동축 (EC total=1200000)
INSERT INTO PCM_TGT_GUIDE (TEN_ID,TGT_PJT_CD,GUIDE_SEQ,COST_ITEM_CD,COST_ITEM_NM,DEPT_CD,DEPT_NM,EC_COST_TOT_AMT,EC_COST_UNIT_AMT,GUIDE_TGT_TOT_AMT,GUIDE_TGT_UNIT_AMT,CFT_TGT_TOT_AMT,CFT_TGT_UNIT_AMT,SAVE_RATE,PROD_QTY,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260006',1,'MAT','재료비','PT-D01','PT설계팀',775000,12.92,720000,12.00,0,0,7.10,60000,'','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260006',2,'LABOR','인건비','PT-D02','PT생산팀',145000,2.42,135000,2.25,0,0,6.90,60000,'','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260006',3,'MFG','제조경비','PT-D03','PT품질팀',195000,3.25,180000,3.00,0,0,7.69,60000,'','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260006',4,'SGA','판관비','PT-D04','영업관리팀',85000,1.42,78000,1.30,0,0,8.24,60000,'','T','testuser',NOW(),'testuser',NOW());


-- ============================================================
-- 6. 현상원가(CC) 프로젝트 마스터 — 6건
-- ============================================================

INSERT INTO PCM_CUR_PJT_MSTR (TEN_ID,CC_PJT_CD,CC_REV,EC_PJT_CD,PJT_NM,BIZ_UNIT,CUST_NM,CAR_TYPE,OEM_NM,PROD_GRP,PROG_STS,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,'EC20260001','아이오닉7 시트 현상원가','SEAT','현대모비스','아이오닉7 (NE)','현대자동차','시트','P','1차 현상원가 산출','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260002',1,'EC20260002','EV9 2열시트 현상원가','SEAT','기아오토','EV9 (MV)','기아자동차','시트','D','1차 현상원가 Draft','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260003',1,'EC20260003','GV90 파워시트 현상원가','SEAT','현대모비스','GV90','제네시스','시트','D','1차 현상원가 Draft','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'EC20260004','투싼 NX5 CVJ 현상원가','PT','현대위아','투싼 NX5','현대자동차','드라이브샤프트','P','1차 현상원가 산출','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260005',1,'EC20260005','쏘렌토 MQ5 D/S 현상원가','PT','기아오토','쏘렌토 MQ5','기아자동차','드라이브샤프트','D','1차 현상원가 Draft','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260006',1,'EC20260006','GV80 전동축 현상원가','PT','현대위아','GV80','제네시스','전동축','D','1차 현상원가 Draft','T','testuser',NOW(),'testuser',NOW());

-- ============================================================
-- 7. 목표원가(TC) 상세 테이블 — TC20260001, TC20260004
-- ============================================================

-- ─── 7-1. PCM_TGT_MANAGER: 담당자 (3행 × 2 프로젝트) ───
INSERT INTO PCM_TGT_MANAGER (TEN_ID,TGT_PJT_CD,MGR_SEQ,DEPT_DIV,MGR_NM,POSITION,DEPT_NM,ROLE_CD,EMAIL,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001',1,'SEAT','김정호','책임매니저','시트사업부','PM','jh.kim@seat.co.kr','프로젝트 총괄','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',2,'SEAT','이수진','수석연구원','시트설계팀','DESIGN','sj.lee@seat.co.kr','설계담당','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',3,'SEAT','박민수','과장','구매팀','PURCHASE','ms.park@seat.co.kr','구매담당','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_TGT_MANAGER (TEN_ID,TGT_PJT_CD,MGR_SEQ,DEPT_DIV,MGR_NM,POSITION,DEPT_NM,ROLE_CD,EMAIL,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004',1,'PT','최용석','책임매니저','PT사업부','PM','ys.choi@pt.co.kr','프로젝트 총괄','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',2,'PT','한지영','수석연구원','PT설계팀','DESIGN','jy.han@pt.co.kr','설계담당','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',3,'PT','오승현','과장','구매팀','PURCHASE','sh.oh@pt.co.kr','구매담당','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 7-2. PCM_TGT_SPEC: 대표사양 (3행 × 2 프로젝트) ───
INSERT INTO PCM_TGT_SPEC (TEN_ID,TGT_PJT_CD,SPEC_SEQ,EC_PJT_CD,TGT_COST_CD,PROD_GRP,CAR_TYPE,OEM_NM,SPEC_DESC,SEL_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001',1,'EC20260001','TCC-SEAT-01','시트','아이오닉7 (NE)','현대자동차','4-WAY 파워시트 + 통풍/히팅','Y','대표사양','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',2,'EC20260001','TCC-SEAT-02','시트','아이오닉7 (NE)','현대자동차','매뉴얼 시트 + 히팅','N','저가형','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',3,'EC20260001','TCC-SEAT-03','시트','아이오닉7 (NE)','현대자동차','8-WAY 파워시트 + 마사지','N','고급형','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_TGT_SPEC (TEN_ID,TGT_PJT_CD,SPEC_SEQ,EC_PJT_CD,TGT_COST_CD,PROD_GRP,CAR_TYPE,OEM_NM,SPEC_DESC,SEL_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004',1,'EC20260004','TCC-PT-01','드라이브샤프트','투싼 NX5','현대자동차','BJ+TJ CVJ 표준형','Y','대표사양','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',2,'EC20260004','TCC-PT-02','드라이브샤프트','투싼 NX5','현대자동차','BJ+GI CVJ 4WD형','N','4WD용','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',3,'EC20260004','TCC-PT-03','드라이브샤프트','투싼 NX5','현대자동차','BJ+TJ CVJ HEV형','N','하이브리드용','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 7-3. PCM_TGT_PRICE: 판가정보 (2행 × 2 프로젝트) ───
INSERT INTO PCM_TGT_PRICE (TEN_ID,TGT_PJT_CD,PRICE_SEQ,SPEC_DESC,TGT_COST_CD,CURRENCY,EST_SELL_PRICE,SOP_YM,EOP_YM,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001',1,'4-WAY 파워시트 + 통풍/히팅','TCC-SEAT-01','KRW',1050000.00,'2026-09','2031-08','SOP년도 판가','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',2,'4-WAY 파워시트 + 통풍/히팅','TCC-SEAT-01','KRW',1020000.00,'2028-01','2031-08','2차년도 판가 (CR반영)','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_TGT_PRICE (TEN_ID,TGT_PJT_CD,PRICE_SEQ,SPEC_DESC,TGT_COST_CD,CURRENCY,EST_SELL_PRICE,SOP_YM,EOP_YM,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004',1,'BJ+TJ CVJ 표준형','TCC-PT-01','KRW',285000.00,'2026-08','2031-07','SOP년도 판가','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',2,'BJ+TJ CVJ 표준형','TCC-PT-01','KRW',278000.00,'2028-01','2031-07','2차년도 판가 (CR반영)','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 7-4. PCM_TGT_QTY_DISC: 수량/할인율 (2행 × 2 프로젝트) ───
INSERT INTO PCM_TGT_QTY_DISC (TEN_ID,TGT_PJT_CD,QTY_SEQ,SPEC_DESC,TGT_COST_CD,YEAR_VAL,QTY,DISC_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001',1,'4-WAY 파워시트','TCC-SEAT-01','2026',120000.00,0.0000,'SOP년도','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',2,'4-WAY 파워시트','TCC-SEAT-01','2027',135000.00,1.5000,'2차년도 CR 1.5%','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_TGT_QTY_DISC (TEN_ID,TGT_PJT_CD,QTY_SEQ,SPEC_DESC,TGT_COST_CD,YEAR_VAL,QTY,DISC_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004',1,'BJ+TJ CVJ','TCC-PT-01','2026',200000.00,0.0000,'SOP년도','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',2,'BJ+TJ CVJ','TCC-PT-01','2027',220000.00,2.0000,'2차년도 CR 2.0%','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 7-5. PCM_TGT_DEV_SCHEDULE: 개발/평가일정 (3행 × 2 프로젝트) ───
INSERT INTO PCM_TGT_DEV_SCHEDULE (TEN_ID,TGT_PJT_CD,SCHED_SEQ,SCHED_TYPE,SCHED_NM,PLAN_START_DT,PLAN_END_DT,ACT_END_DT,EVAL_ROUND,EVAL_PERIOD,DELAY_DAYS,PROC_YN,SORT_ORDER,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001',1,'DEV','설계검증(DV)','2025-10-01','2026-01-31',NULL,'1차','2025.10~2026.01',0,'N',1,'DV 시험','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',2,'DEV','공정검증(PV)','2026-02-01','2026-05-31',NULL,'2차','2026.02~2026.05',0,'N',2,'PV 시험','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',3,'EVAL','양산적합성 평가','2026-06-01','2026-08-31',NULL,'3차','2026.06~2026.08',0,'N',3,'양산 승인','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_TGT_DEV_SCHEDULE (TEN_ID,TGT_PJT_CD,SCHED_SEQ,SCHED_TYPE,SCHED_NM,PLAN_START_DT,PLAN_END_DT,ACT_END_DT,EVAL_ROUND,EVAL_PERIOD,DELAY_DAYS,PROC_YN,SORT_ORDER,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004',1,'DEV','설계검증(DV)','2025-09-01','2025-12-31',NULL,'1차','2025.09~2025.12',0,'N',1,'DV 시험','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',2,'DEV','공정검증(PV)','2026-01-01','2026-04-30',NULL,'2차','2026.01~2026.04',0,'N',2,'PV 시험','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',3,'EVAL','양산적합성 평가','2026-05-01','2026-07-31',NULL,'3차','2026.05~2026.07',0,'N',3,'양산 승인','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 7-6. PCM_TGT_SETUP_SCHEDULE: 목표수립일정 (3행 × 2 프로젝트) ───
INSERT INTO PCM_TGT_SETUP_SCHEDULE (TEN_ID,TGT_PJT_CD,SETUP_SEQ,DEPT_NM,START_DT,END_DT,ACT_END_DT,PROC_YN,DELAY_DAYS,EMAIL_SENT,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001',1,'시트설계팀','2025-08-01','2025-08-31','2025-08-28','Y',0,'Y','설계부문 목표 수립 완료','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',2,'시트생산팀','2025-09-01','2025-09-30','2025-09-25','Y',0,'Y','생산부문 목표 수립 완료','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',3,'구매팀','2025-09-15','2025-10-15',NULL,'N',0,'Y','구매부문 목표 수립 진행중','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_TGT_SETUP_SCHEDULE (TEN_ID,TGT_PJT_CD,SETUP_SEQ,DEPT_NM,START_DT,END_DT,ACT_END_DT,PROC_YN,DELAY_DAYS,EMAIL_SENT,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004',1,'PT설계팀','2025-07-01','2025-07-31','2025-07-30','Y',0,'Y','설계부문 목표 수립 완료','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',2,'PT생산팀','2025-08-01','2025-08-31','2025-08-29','Y',0,'Y','생산부문 목표 수립 완료','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',3,'구매팀','2025-08-15','2025-09-15','2025-09-10','Y',0,'Y','구매부문 목표 수립 완료','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 7-7. PCM_TGT_COST_REG: 원가등록 (4행 × 2 프로젝트) ───
-- TC20260001: EC total=900,000 → 목표원가 841,000 (절감 6.6%)
INSERT INTO PCM_TGT_COST_REG (TEN_ID,TGT_PJT_CD,COST_SEQ,COST_ITEM_CD,COST_ITEM_NM,DEPT_CD,DEPT_NM,EC_COST_AMT,GUIDE_AMT,FINAL_TGT_AMT,DIFF_AMT,ADJ_REASON,SAVE_TGT_AMT,CONFIRM_YN,VIEW_MODE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001',1,'MAT','재료비','SEAT-D01','시트설계팀',496000.00,460000.00,462000.00,2000.00,'원자재 가격 상승 반영',34000.00,'Y','SUM','','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',2,'LABOR','노무비','SEAT-D02','시트생산팀',125000.00,118000.00,119000.00,1000.00,'생산성 향상 반영',6000.00,'Y','SUM','','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',3,'MFG','제조경비','SEAT-D03','시트품질팀',185000.00,170000.00,172000.00,2000.00,'설비투자 감가반영',13000.00,'Y','SUM','','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',4,'SGA','판관비','SEAT-D04','영업관리팀',94000.00,87000.00,88000.00,1000.00,'물류비 절감',6000.00,'Y','SUM','','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- TC20260004: EC total=232,000 → 목표원가 218,000 (절감 6.0%)
INSERT INTO PCM_TGT_COST_REG (TEN_ID,TGT_PJT_CD,COST_SEQ,COST_ITEM_CD,COST_ITEM_NM,DEPT_CD,DEPT_NM,EC_COST_AMT,GUIDE_AMT,FINAL_TGT_AMT,DIFF_AMT,ADJ_REASON,SAVE_TGT_AMT,CONFIRM_YN,VIEW_MODE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004',1,'MAT','재료비','PT-D01','PT설계팀',126500.00,118000.00,119000.00,1000.00,'소재 단가 변동',7500.00,'Y','SUM','','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',2,'LABOR','노무비','PT-D02','PT생산팀',35000.00,33000.00,33000.00,0.00,'',2000.00,'Y','SUM','','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',3,'MFG','제조경비','PT-D03','PT품질팀',48000.00,45000.00,45000.00,0.00,'',3000.00,'Y','SUM','','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',4,'SGA','판관비','PT-D04','영업관리팀',22500.00,20000.00,21000.00,1000.00,'포장비 조정',1500.00,'Y','SUM','','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 7-8. PCM_TGT_ACHV_PLAN: 목표달성 계획 (4행 × 2 프로젝트) ───
INSERT INTO PCM_TGT_ACHV_PLAN (TEN_ID,TGT_PJT_CD,PLAN_SEQ,COST_ITEM_CD,COST_ITEM_NM,EC_COST_AMT,TGT_COST_AMT,SAVE_TGT_AMT,SAVE_PLAN_AMT,CONFIRM_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001',1,'MAT','재료비',496000.00,462000.00,34000.00,36000.00,'Y','VA/VE 설계변경 예정','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',2,'LABOR','노무비',125000.00,119000.00,6000.00,6500.00,'Y','자동화율 향상','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',3,'MFG','제조경비',185000.00,172000.00,13000.00,14000.00,'Y','공정 최적화','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',4,'SGA','판관비',94000.00,88000.00,6000.00,6000.00,'Y','물류비 절감','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_TGT_ACHV_PLAN (TEN_ID,TGT_PJT_CD,PLAN_SEQ,COST_ITEM_CD,COST_ITEM_NM,EC_COST_AMT,TGT_COST_AMT,SAVE_TGT_AMT,SAVE_PLAN_AMT,CONFIRM_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004',1,'MAT','재료비',126500.00,119000.00,7500.00,8000.00,'Y','소재 변경 검토','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',2,'LABOR','노무비',35000.00,33000.00,2000.00,2200.00,'Y','단조공정 자동화','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',3,'MFG','제조경비',48000.00,45000.00,3000.00,3500.00,'Y','열처리 에너지 절감','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',4,'SGA','판관비',22500.00,21000.00,1500.00,1500.00,'Y','포장 표준화','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 7-9. PCM_TGT_ACHV_PLAN_DTL: 목표달성 계획 상세 (2행 × 2 프로젝트) ───
INSERT INTO PCM_TGT_ACHV_PLAN_DTL (TEN_ID,TGT_PJT_CD,PLAN_SEQ,DTL_SEQ,LEVEL1,LEVEL2,LEVEL3,SAVE_AMT,FILE_NM,FILE_PATH,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001',1,1,'재료비','소재변경','나파가죽 → 인조가죽 변경',18000.00,'seat_va_proposal.xlsx','/uploads/tc/2026/','VA 제안서 첨부','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',1,2,'재료비','구매절감','프레임 소재 CR 협상',16000.00,'frame_nego.xlsx','/uploads/tc/2026/','구매 협상 결과','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_TGT_ACHV_PLAN_DTL (TEN_ID,TGT_PJT_CD,PLAN_SEQ,DTL_SEQ,LEVEL1,LEVEL2,LEVEL3,SAVE_AMT,FILE_NM,FILE_PATH,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004',1,1,'재료비','소재변경','SCM420H → SCM415 등급변경',5000.00,'cvj_material_change.xlsx','/uploads/tc/2026/','소재 등급 변경 검토','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',1,2,'재료비','공법변경','열간단조 → 온간단조 전환',3000.00,'forging_process.xlsx','/uploads/tc/2026/','단조 공법 변경','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 7-10. PCM_TGT_RECALC: 목표원가 재산출 (2행 × 2 프로젝트) ───
INSERT INTO PCM_TGT_RECALC (TEN_ID,TGT_PJT_CD,RECALC_SEQ,CC_GRP_CD,CC_ROUND,TGT_PROFIT_RATE,FINAL_TGT_PROFIT_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001',1,'CC20260001','1차',8.50,9.20,'1차 현상원가 기반 재산출','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260001',2,'CC20260001','2차',9.20,9.80,'2차 현상원가 기반 재산출','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_TGT_RECALC (TEN_ID,TGT_PJT_CD,RECALC_SEQ,CC_GRP_CD,CC_ROUND,TGT_PROFIT_RATE,FINAL_TGT_PROFIT_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004',1,'CC20260004','1차',7.80,8.50,'1차 현상원가 기반 재산출','T','testuser',NOW(),'testuser',NOW()),
('T001','TC20260004',2,'CC20260004','2차',8.50,9.10,'2차 현상원가 기반 재산출','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 7-11. PCM_TGT_ACHV_STATUS: 목표달성 현황 (4행 × 2 프로젝트) ───
INSERT INTO PCM_TGT_ACHV_STATUS (TEN_ID,TGT_PJT_CD,PJT_NM,BIZ_UNIT,PROD_GRP,OEM_NM,CAR_TYPE,EC_TOTAL_AMT,TGT_TOTAL_AMT,CUR_TOTAL_AMT,SAVE_TGT_AMT,SAVE_ACT_AMT,ACHV_RATE,ACHV_YN,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260001','아이오닉7 시트 목표원가','SEAT','시트','현대자동차','아이오닉7 (NE)',900000.00,841000.00,855000.00,59000.00,45000.00,76.27,'N','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_TGT_ACHV_STATUS (TEN_ID,TGT_PJT_CD,PJT_NM,BIZ_UNIT,PROD_GRP,OEM_NM,CAR_TYPE,EC_TOTAL_AMT,TGT_TOTAL_AMT,CUR_TOTAL_AMT,SAVE_TGT_AMT,SAVE_ACT_AMT,ACHV_RATE,ACHV_YN,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','TC20260004','투싼 NX5 CVJ 목표원가','PT','드라이브샤프트','현대자동차','투싼 NX5',232000.00,218000.00,220500.00,14000.00,11500.00,82.14,'N','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;


-- ============================================================
-- 8. 현상원가(CC) 상세 테이블 — CC20260001, CC20260004
-- ============================================================

-- ─── 8-1. PCM_CUR_DETAIL: 현상원가 상세정보 (1행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_DETAIL (TEN_ID,CC_PJT_CD,CC_REV,REV_NM,FACTORY_DIV,FACTORY_CD,FACTORY_NM,CORP_DIV,CORP_CD,CORP_NM,ATTACH_FILE,COMPOSE_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,'1차 현상원가','D','FACT-ST01','아산시트공장','D','CORP-01','(주)현대트랜시스',NULL,'N','아이오닉7 시트 1차 현상원가','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'1차 현상원가','D','FACT-PT01','서산PT공장','D','CORP-02','(주)현대위아',NULL,'N','투싼 NX5 CVJ 1차 현상원가','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-2. PCM_CUR_COST_CODE: 원가코드/판가 (2행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_COST_CODE (TEN_ID,CC_PJT_CD,CC_REV,COST_SEQ,COST_CD,CALC_TARGET,PROD_DESC,CURRENCY,EST_SELL_PRICE,SOP_YM,EOP_YM,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,1,'CC-SEAT-01','Y','아이오닉7 4-WAY 파워시트','KRW',1050000.00,'2026-09','2031-08','주력사양','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,2,'CC-SEAT-02','N','아이오닉7 매뉴얼시트','KRW',720000.00,'2026-09','2031-08','저가형','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_COST_CODE (TEN_ID,CC_PJT_CD,CC_REV,COST_SEQ,COST_CD,CALC_TARGET,PROD_DESC,CURRENCY,EST_SELL_PRICE,SOP_YM,EOP_YM,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,1,'CC-PT-01','Y','투싼 NX5 BJ+TJ CVJ','KRW',285000.00,'2026-08','2031-07','표준형','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,2,'CC-PT-02','N','투싼 NX5 BJ+GI CVJ 4WD','KRW',320000.00,'2026-08','2031-07','4WD형','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-3. PCM_CUR_QTY_DISC: 수량/할인율 (2행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_QTY_DISC (TEN_ID,CC_PJT_CD,CC_REV,QTY_SEQ,COST_CD,YEAR_VAL,SELL_QTY,DISC_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,1,'CC-SEAT-01','2026',120000.00,0.0000,'SOP년도','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,2,'CC-SEAT-01','2027',135000.00,1.5000,'2차년도 CR','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_QTY_DISC (TEN_ID,CC_PJT_CD,CC_REV,QTY_SEQ,COST_CD,YEAR_VAL,SELL_QTY,DISC_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,1,'CC-PT-01','2026',200000.00,0.0000,'SOP년도','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,2,'CC-PT-01','2027',220000.00,2.0000,'2차년도 CR','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-4. PCM_CUR_MANAGER: 담당자 (3행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_MANAGER (TEN_ID,CC_PJT_CD,CC_REV,MGR_SEQ,DEPT_DIV,MGR_ID,MGR_NM,ROLE_CD,EMAIL,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,1,'SEAT','U001','김정호','PM','jh.kim@seat.co.kr','프로젝트 총괄','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,2,'SEAT','U002','이수진','DESIGN','sj.lee@seat.co.kr','원가분석 담당','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,3,'SEAT','U003','박민수','PURCHASE','ms.park@seat.co.kr','구매원가 담당','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_MANAGER (TEN_ID,CC_PJT_CD,CC_REV,MGR_SEQ,DEPT_DIV,MGR_ID,MGR_NM,ROLE_CD,EMAIL,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,1,'PT','U004','최용석','PM','ys.choi@pt.co.kr','프로젝트 총괄','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,2,'PT','U005','한지영','DESIGN','jy.han@pt.co.kr','원가분석 담당','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,3,'PT','U006','오승현','PURCHASE','sh.oh@pt.co.kr','구매원가 담당','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-5. PCM_CUR_SCHEDULE: 일정 (3행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_SCHEDULE (TEN_ID,CC_PJT_CD,CC_REV,SCHED_SEQ,TASK_NM,STD_PERIOD,START_DT,END_DT,ACT_END_DT,PROC_STS,DELAY_DAYS,SORT_ORDER,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,1,'BOM 구성 및 부품단가 입력',14,'2025-11-01','2025-11-14','2025-11-13','C',0,1,'완료','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,2,'제조원가 산출',10,'2025-11-15','2025-11-25',NULL,'P',0,2,'진행중','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,3,'손익분석 및 검증',7,'2025-11-26','2025-12-03',NULL,'W',0,3,'대기','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_SCHEDULE (TEN_ID,CC_PJT_CD,CC_REV,SCHED_SEQ,TASK_NM,STD_PERIOD,START_DT,END_DT,ACT_END_DT,PROC_STS,DELAY_DAYS,SORT_ORDER,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,1,'BOM 구성 및 부품단가 입력',14,'2025-10-01','2025-10-14','2025-10-12','C',0,1,'완료','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,2,'제조원가 산출',10,'2025-10-15','2025-10-25','2025-10-24','C',0,2,'완료','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,3,'손익분석 및 검증',7,'2025-10-26','2025-11-02',NULL,'P',0,3,'진행중','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-6. PCM_CUR_BOM: BOM (5행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_BOM (TEN_ID,CC_PJT_CD,CC_REV,COST_CD,BOM_SEQ,PART_NO,PART_NM,PART_DIV,QTY,RECV_UNIT_YN,PARENT_SEQ,BOM_LEVEL,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,'CC-SEAT-01',1,'SEAT-A01','운전석 시트 ASSY','M',1.0000,'N',0,0,'최상위','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'CC-SEAT-01',2,'SEAT-A01-F','시트프레임 ASSY','M',1.0000,'N',1,1,'프레임 서브','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'CC-SEAT-01',3,'SEAT-A01-C','시트쿠션 ASSY','M',1.0000,'N',1,1,'쿠션 서브','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'CC-SEAT-01',4,'SEAT-A01-H','헤드레스트 ASSY','B',1.0000,'Y',1,1,'구매품','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'CC-SEAT-01',5,'SEAT-A01-R','시트레일 ASSY','M',1.0000,'N',1,1,'레일 서브','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_BOM (TEN_ID,CC_PJT_CD,CC_REV,COST_CD,BOM_SEQ,PART_NO,PART_NM,PART_DIV,QTY,RECV_UNIT_YN,PARENT_SEQ,BOM_LEVEL,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,'CC-PT-01',1,'PT-A01','등속조인트 ASSY','M',1.0000,'N',0,0,'최상위','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'CC-PT-01',2,'PT-A01-O','아우터레이스 ASSY','M',1.0000,'N',1,1,'아우터 서브','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'CC-PT-01',3,'PT-A01-I','인너레이스','M',1.0000,'N',1,1,'자가가공','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'CC-PT-01',4,'PT-A01-K','케이지','B',1.0000,'Y',1,1,'구매품','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'CC-PT-01',5,'PT-A01-BT','부트 ASSY','B',1.0000,'Y',1,1,'구매품','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-7. PCM_CUR_BOM_MAP: BOM 맵핑 (3행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_BOM_MAP (TEN_ID,CC_PJT_CD,CC_REV,COST_CD,MAP_SEQ,CUR_BOM_SEQ,PREV_BOM_SEQ,PREV_COST_CD,PREV_REV,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,'CC-SEAT-01',1,1,NULL,NULL,NULL,'신규 BOM','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'CC-SEAT-01',2,2,NULL,NULL,NULL,'신규 BOM','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'CC-SEAT-01',3,3,NULL,NULL,NULL,'신규 BOM','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_BOM_MAP (TEN_ID,CC_PJT_CD,CC_REV,COST_CD,MAP_SEQ,CUR_BOM_SEQ,PREV_BOM_SEQ,PREV_COST_CD,PREV_REV,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,'CC-PT-01',1,1,NULL,NULL,NULL,'신규 BOM','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'CC-PT-01',2,2,NULL,NULL,NULL,'신규 BOM','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'CC-PT-01',3,3,NULL,NULL,NULL,'신규 BOM','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-8. PCM_CUR_PART_PRICE: 부품단가 (4행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_PART_PRICE (TEN_ID,CC_PJT_CD,CC_REV,COST_CD,PRICE_SEQ,PART_NO,PART_NM,PART_DIV,PIMS_CURRENCY,PIMS_PRICE,DESIGN_CURRENCY,DESIGN_PRICE,PURCHASE_CURRENCY,PURCHASE_PRICE,CONFIRM_CURRENCY,CONFIRM_PRICE,LOSS_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,'CC-SEAT-01',1,'SEAT-A01-F01','사이드프레임(L)','M','KRW',46000.0000,'KRW',45000.0000,'KRW',44500.0000,'KRW',44500.0000,2.0000,'','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'CC-SEAT-01',2,'SEAT-A01-F02','사이드프레임(R)','M','KRW',46000.0000,'KRW',45000.0000,'KRW',44500.0000,'KRW',44500.0000,2.0000,'','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'CC-SEAT-01',3,'SEAT-A01-C01','쿠션패드','M','KRW',29000.0000,'KRW',28000.0000,'KRW',27500.0000,'KRW',27500.0000,3.0000,'','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'CC-SEAT-01',4,'SEAT-A01-H','헤드레스트 ASSY','B','KRW',43000.0000,'KRW',42000.0000,'KRW',41000.0000,'KRW',41000.0000,0.5000,'구매품','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_PART_PRICE (TEN_ID,CC_PJT_CD,CC_REV,COST_CD,PRICE_SEQ,PART_NO,PART_NM,PART_DIV,PIMS_CURRENCY,PIMS_PRICE,DESIGN_CURRENCY,DESIGN_PRICE,PURCHASE_CURRENCY,PURCHASE_PRICE,CONFIRM_CURRENCY,CONFIRM_PRICE,LOSS_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,'CC-PT-01',1,'PT-A01-O01','아우터레이스(단조)','M','KRW',29000.0000,'KRW',28000.0000,'KRW',27500.0000,'KRW',27500.0000,1.5000,'열간단조','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'CC-PT-01',2,'PT-A01-I','인너레이스','M','KRW',23000.0000,'KRW',22000.0000,'KRW',21500.0000,'KRW',21500.0000,1.5000,'','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'CC-PT-01',3,'PT-A01-K','케이지','B','KRW',19000.0000,'KRW',18000.0000,'KRW',17500.0000,'KRW',17500.0000,0.5000,'구매품','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'CC-PT-01',4,'PT-A01-B','볼(6EA)','B','KRW',22000.0000,'KRW',21000.0000,'KRW',20500.0000,'KRW',20500.0000,0.3000,'6EA/SET','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-9. PCM_CUR_LINE_INVEST: 라인투자비 (2행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_LINE_INVEST (TEN_ID,CC_PJT_CD,CC_REV,LINE_SEQ,LINE_DIV,LINE_CD,LINE_NM,INVEST_NM,PROCESS_CD,ACQ_AMT,ACQ_CURRENCY,DEPR_START_YM,CAPA_EA,AVAIL_RATE,USE_RATE,BASE_YEAR,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,1,'NEW','LINE-ST01','시트조립라인 #1','시트프레임 용접+조립 라인','P-WELD',2500000000.00,'KRW','2026-06',150000.00,90.00,80.00,'2026','신규 라인투자','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,2,'EXIST','LINE-ST02','시트커버 봉제라인','쿠션커버 봉제 기존라인','P-SEW',800000000.00,'KRW','2024-01',200000.00,85.00,60.00,'2024','기존 라인 활용','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_LINE_INVEST (TEN_ID,CC_PJT_CD,CC_REV,LINE_SEQ,LINE_DIV,LINE_CD,LINE_NM,INVEST_NM,PROCESS_CD,ACQ_AMT,ACQ_CURRENCY,DEPR_START_YM,CAPA_EA,AVAIL_RATE,USE_RATE,BASE_YEAR,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,1,'NEW','LINE-PT01','CVJ 단조+가공라인','등속조인트 단조/선삭/열처리','P-FORG',3200000000.00,'KRW','2026-05',250000.00,92.00,80.00,'2026','신규 라인투자','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,2,'EXIST','LINE-PT02','CVJ 조립+검사라인','등속조인트 조립/그리스/부트','P-ASSY',1200000000.00,'KRW','2023-01',300000.00,88.00,67.00,'2023','기존 라인 활용','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-10. PCM_CUR_LINE_INVEST_DTL: 라인투자비 상세 (3행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_LINE_INVEST_DTL (TEN_ID,CC_PJT_CD,CC_REV,LINE_SEQ,DTL_SEQ,ITEM_DESC,CURRENCY,AMT,ACQ_YEAR,DEPR_START_YM,CAPA_EA,USEFUL_LIFE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,1,1,'6축 다관절 용접로봇','KRW',850000000.00,'2026','2026-06',150000.00,10,'FANUC R-2000iC','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,1,2,'시트조립 컨베이어','KRW',1200000000.00,'2026','2026-06',150000.00,15,'자동 조립라인','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,1,3,'용접지그 SET','KRW',450000000.00,'2026','2026-06',150000.00,8,'전용지그','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_LINE_INVEST_DTL (TEN_ID,CC_PJT_CD,CC_REV,LINE_SEQ,DTL_SEQ,ITEM_DESC,CURRENCY,AMT,ACQ_YEAR,DEPR_START_YM,CAPA_EA,USEFUL_LIFE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,1,1,'온간단조 프레스 2500T','KRW',1800000000.00,'2026','2026-05',250000.00,15,'KOMATSU 프레스','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,1,2,'CNC 선삭기 (2대)','KRW',900000000.00,'2026','2026-05',250000.00,10,'MAZAK QT-250','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,1,3,'침탄열처리로','KRW',500000000.00,'2026','2026-05',250000.00,12,'연속로','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-11. PCM_CUR_LINE_CT: 라인 C/T 배정 (2행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_LINE_CT (TEN_ID,CC_PJT_CD,CC_REV,LINE_SEQ,COST_CD,USE_YN,EST_CT,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,1,'CC-SEAT-01','Y',45.5000,'프레임 용접+조립 45.5초','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,2,'CC-SEAT-01','Y',32.0000,'봉제라인 32.0초','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_LINE_CT (TEN_ID,CC_PJT_CD,CC_REV,LINE_SEQ,COST_CD,USE_YN,EST_CT,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,1,'CC-PT-01','Y',28.0000,'단조+가공 28.0초','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,2,'CC-PT-01','Y',22.0000,'조립+검사 22.0초','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-12. PCM_CUR_OTHER_INVEST: 기타투자비 (2행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_OTHER_INVEST (TEN_ID,CC_PJT_CD,CC_REV,INVEST_SEQ,INVEST_NM,INVEST_DIV,CURRENCY,ACQ_AMT,DEPR_DIV,USEFUL_LIFE,ACQ_YEAR,DEPR_START_YM,AVAIL_RATE,USE_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,1,'시트 검사지그','JIGS','KRW',120000000.00,'SL',5,'2026','2026-06',100.00,80.00,'완성품 검사지그','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,2,'금형 (쿠션패드)','MOLD','KRW',350000000.00,'SL',3,'2026','2026-06',100.00,100.00,'PU 발포금형','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_OTHER_INVEST (TEN_ID,CC_PJT_CD,CC_REV,INVEST_SEQ,INVEST_NM,INVEST_DIV,CURRENCY,ACQ_AMT,DEPR_DIV,USEFUL_LIFE,ACQ_YEAR,DEPR_START_YM,AVAIL_RATE,USE_RATE,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,1,'CVJ 검사장비','EQUIP','KRW',85000000.00,'SL',5,'2026','2026-05',100.00,80.00,'NVH 검사기','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,2,'단조금형 SET','MOLD','KRW',280000000.00,'SL',3,'2026','2026-05',100.00,100.00,'열간단조금형','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-13. PCM_CUR_MANPOWER: 인원계획 (3행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_MANPOWER (TEN_ID,CC_PJT_CD,CC_REV,MP_SEQ,MP_DIV,MP_NM,PROCESS_CD,CURRENCY,AVG_SALARY,YEAR_VAL,HEAD_COUNT,LINE_SEQ,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,1,'DIRECT','시트조립 직접인원','P-WELD','KRW',48000000.00,'2026',12.00,1,'용접+조립','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,2,'DIRECT','봉제라인 직접인원','P-SEW','KRW',42000000.00,'2026',8.00,2,'봉제작업','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,3,'INDIRECT','간접인원(관리)','P-MGMT','KRW',55000000.00,'2026',3.00,0,'생산관리/품질','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_MANPOWER (TEN_ID,CC_PJT_CD,CC_REV,MP_SEQ,MP_DIV,MP_NM,PROCESS_CD,CURRENCY,AVG_SALARY,YEAR_VAL,HEAD_COUNT,LINE_SEQ,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,1,'DIRECT','단조+가공 직접인원','P-FORG','KRW',50000000.00,'2026',10.00,1,'단조/선삭/열처리','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,2,'DIRECT','조립+검사 직접인원','P-ASSY','KRW',45000000.00,'2026',6.00,2,'조립/그리스/부트','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,3,'INDIRECT','간접인원(관리)','P-MGMT','KRW',52000000.00,'2026',2.00,0,'생산관리/품질','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-14. PCM_CUR_MFG_COST: 제조경비 (1행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_MFG_COST (TEN_ID,CC_PJT_CD,CC_REV,COST_CD,WAGE_INCR_RATE,PRICE_INCR_RATE,DIRECT_EXP_RATE,LABOR_EXP_RATE,OTHER_MFG_RATE,MOLD_UNIT_COST,OUTSRC_UNIT_COST,OUTSRC_RATE,CALC_DONE_YN,DIRECT_LABOR_AMT,INDIRECT_LABOR_AMT,DIRECT_EXP_AMT,LABOR_EXP_AMT,OTHER_MFG_AMT,DEPR_BLDG_AMT,DEPR_LINE_AMT,DEPR_OTHER_AMT,OUTSRC_AMT,MOLD_AMT,RND_AMT,OTHER_EXP_AMT,TOTAL_MFG_AMT,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,'CC-SEAT-01',3.5000,2.0000,15.0000,8.0000,5.0000,2917.00,0.00,0.0000,'Y',38500.00,9500.00,5775.00,3080.00,1925.00,2500.00,16667.00,3917.00,0.00,2917.00,5000.00,3000.00,92781.00,'시트 제조경비','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_MFG_COST (TEN_ID,CC_PJT_CD,CC_REV,COST_CD,WAGE_INCR_RATE,PRICE_INCR_RATE,DIRECT_EXP_RATE,LABOR_EXP_RATE,OTHER_MFG_RATE,MOLD_UNIT_COST,OUTSRC_UNIT_COST,OUTSRC_RATE,CALC_DONE_YN,DIRECT_LABOR_AMT,INDIRECT_LABOR_AMT,DIRECT_EXP_AMT,LABOR_EXP_AMT,OTHER_MFG_AMT,DEPR_BLDG_AMT,DEPR_LINE_AMT,DEPR_OTHER_AMT,OUTSRC_AMT,MOLD_AMT,RND_AMT,OTHER_EXP_AMT,TOTAL_MFG_AMT,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,'CC-PT-01',3.0000,1.5000,12.0000,7.0000,4.0000,1400.00,0.00,0.0000,'Y',18500.00,5200.00,2220.00,1295.00,740.00,1800.00,12800.00,1700.00,0.00,1400.00,3000.00,1500.00,50155.00,'CVJ 제조경비','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-15. PCM_CUR_SGA_COST: 판매관리비 (1행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_SGA_COST (TEN_ID,CC_PJT_CD,CC_REV,COST_CD,SALE_LABOR_RATE,TRANSPORT_RATE,EXPORT_RATE,QA_RATE,AD_RATE,RESEARCH_RATE,ASSET_RATE,HR_RATE,OTHER_RATE,CALC_DONE_YN,SALE_LABOR_AMT,TRANSPORT_AMT,EXPORT_AMT,QA_AMT,AD_AMT,RESEARCH_AMT,ASSET_AMT,HR_AMT,OTHER_AMT,TOTAL_SGA_AMT,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,'CC-SEAT-01',2.5000,1.8000,0.0000,1.2000,0.5000,1.5000,0.8000,0.5000,0.7000,'Y',26250.00,18900.00,0.00,12600.00,5250.00,15750.00,8400.00,5250.00,7350.00,99750.00,'시트 판관비','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_SGA_COST (TEN_ID,CC_PJT_CD,CC_REV,COST_CD,SALE_LABOR_RATE,TRANSPORT_RATE,EXPORT_RATE,QA_RATE,AD_RATE,RESEARCH_RATE,ASSET_RATE,HR_RATE,OTHER_RATE,CALC_DONE_YN,SALE_LABOR_AMT,TRANSPORT_AMT,EXPORT_AMT,QA_AMT,AD_AMT,RESEARCH_AMT,ASSET_AMT,HR_AMT,OTHER_AMT,TOTAL_SGA_AMT,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,'CC-PT-01',2.0000,2.2000,0.0000,1.0000,0.3000,1.2000,0.6000,0.4000,0.5000,'Y',5700.00,6270.00,0.00,2850.00,855.00,3420.00,1710.00,1140.00,1425.00,23370.00,'CVJ 판관비','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-16. PCM_CUR_PL_STMT: 손익계산서 (1행 × 2 프로젝트) ───
-- CC20260001: 매출 1,050,000 / 원가 합계 855,000 → 매출이익 195,000 (18.6%)
INSERT INTO PCM_CUR_PL_STMT (TEN_ID,CC_PJT_CD,CC_REV,VIEW_TYPE,VIEW_KEY,PL_SEQ,COST_ITEM,YEAR_VAL,TOT_AMT,UNIT_AMT,RATE_VAL,CALC_DONE_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,'PJT','',1,'매출액','2026',126000000000.00,1050000.00,100.0000,'Y','120,000EA x 1,050,000','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'PJT','',2,'재료비','2026',55680000000.00,464000.00,44.1900,'Y','','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'PJT','',3,'노무비','2026',14280000000.00,119000.00,11.3300,'Y','','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'PJT','',4,'제조경비','2026',11133720000.00,92781.00,8.8400,'Y','','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'PJT','',5,'판관비','2026',11970000000.00,99750.00,9.5000,'Y','','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'PJT','',6,'영업이익','2026',32936280000.00,274469.00,26.1400,'Y','','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- CC20260004: 매출 285,000 / 원가 합계 220,500 → 매출이익 64,500 (22.6%)
INSERT INTO PCM_CUR_PL_STMT (TEN_ID,CC_PJT_CD,CC_REV,VIEW_TYPE,VIEW_KEY,PL_SEQ,COST_ITEM,YEAR_VAL,TOT_AMT,UNIT_AMT,RATE_VAL,CALC_DONE_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,'PJT','',1,'매출액','2026',57000000000.00,285000.00,100.0000,'Y','200,000EA x 285,000','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'PJT','',2,'재료비','2026',29400000000.00,147000.00,51.5800,'Y','','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'PJT','',3,'노무비','2026',6600000000.00,33000.00,11.5800,'Y','','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'PJT','',4,'제조경비','2026',10031000000.00,50155.00,17.5900,'Y','','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'PJT','',5,'판관비','2026',4674000000.00,23370.00,8.2000,'Y','','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'PJT','',6,'영업이익','2026',6295000000.00,31475.00,11.0400,'Y','','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-17. PCM_CUR_DIFF_ANALYSIS: 차이분석 (2행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_DIFF_ANALYSIS (TEN_ID,CC_PJT_CD,CC_REV,DIFF_SEQ,DIFF_TYPE,COST_ITEM_CD,COST_ITEM_NM,EC_AMT,CC_AMT,DIFF_AMT,DIFF_RATE,CUM_EC_AMT,CUM_CC_AMT,CUM_DIFF_AMT,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,1,'STEP','MAT','재료비',496000.00,464000.00,-32000.00,-6.4500,496000.00,464000.00,-32000.00,'소재 CR 반영','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,2,'STEP','MFG','제조경비',185000.00,92781.00,-92219.00,-49.8500,681000.00,556781.00,-124219.00,'제조원가 최적화','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_DIFF_ANALYSIS (TEN_ID,CC_PJT_CD,CC_REV,DIFF_SEQ,DIFF_TYPE,COST_ITEM_CD,COST_ITEM_NM,EC_AMT,CC_AMT,DIFF_AMT,DIFF_RATE,CUM_EC_AMT,CUM_CC_AMT,CUM_DIFF_AMT,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,1,'STEP','MAT','재료비',126500.00,147000.00,20500.00,16.2100,126500.00,147000.00,20500.00,'소재비 상승','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,2,'STEP','MFG','제조경비',48000.00,50155.00,2155.00,4.4900,174500.00,197155.00,22655.00,'설비투자 증가','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-18. PCM_CUR_ACHV_EVAL_DTL: 달성도 평가 상세 (4행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_ACHV_EVAL_DTL (TEN_ID,CC_PJT_CD,CC_REV,EVAL_SEQ,EVAL_TYPE,DEPT_NM,COST_ITEM_CD,COST_ITEM_NM,EC_AMT,TGT_AMT,SAVE_TGT_AMT,CUR_AMT,SAVE_ACT_AMT,ACHV_RATE,ACHV_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,1,'DEPT','시트설계팀','MAT','재료비',496000.00,462000.00,34000.00,464000.00,32000.00,94.12,'N','소재 CR 미달','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,2,'DEPT','시트생산팀','LABOR','노무비',125000.00,119000.00,6000.00,119000.00,6000.00,100.00,'Y','달성','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,3,'DEPT','시트품질팀','MFG','제조경비',185000.00,172000.00,13000.00,92781.00,92219.00,100.00,'Y','초과달성','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,4,'DEPT','영업관리팀','SGA','판관비',94000.00,88000.00,6000.00,99750.00,-5750.00,0.00,'N','판관비 초과','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_ACHV_EVAL_DTL (TEN_ID,CC_PJT_CD,CC_REV,EVAL_SEQ,EVAL_TYPE,DEPT_NM,COST_ITEM_CD,COST_ITEM_NM,EC_AMT,TGT_AMT,SAVE_TGT_AMT,CUR_AMT,SAVE_ACT_AMT,ACHV_RATE,ACHV_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,1,'DEPT','PT설계팀','MAT','재료비',126500.00,119000.00,7500.00,147000.00,-20500.00,0.00,'N','소재비 상승','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,2,'DEPT','PT생산팀','LABOR','노무비',35000.00,33000.00,2000.00,33000.00,2000.00,100.00,'Y','달성','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,3,'DEPT','PT품질팀','MFG','제조경비',48000.00,45000.00,3000.00,50155.00,-2155.00,0.00,'N','설비투자비 증가','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,4,'DEPT','영업관리팀','SGA','판관비',22500.00,21000.00,1500.00,23370.00,-870.00,0.00,'N','판관비 소폭 초과','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-19. PCM_CUR_ACT_EVAL: 실적 달성도 평가 (2행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_ACT_EVAL (TEN_ID,CC_PJT_CD,CC_REV,TGT_COST_CD,EVAL_SEQ,COST_ITEM_NM,EC_AMT,TGT_AMT,SAVE_TGT_AMT,ACT_AMT,SAVE_ACT_AMT,ACHV_RATE,ACHV_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,'TCC-SEAT-01',1,'재료비',496000.00,462000.00,34000.00,458000.00,38000.00,111.76,'Y','실적 초과달성','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'TCC-SEAT-01',2,'노무비',125000.00,119000.00,6000.00,118500.00,6500.00,108.33,'Y','실적 달성','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_ACT_EVAL (TEN_ID,CC_PJT_CD,CC_REV,TGT_COST_CD,EVAL_SEQ,COST_ITEM_NM,EC_AMT,TGT_AMT,SAVE_TGT_AMT,ACT_AMT,SAVE_ACT_AMT,ACHV_RATE,ACHV_YN,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,'TCC-PT-01',1,'재료비',126500.00,119000.00,7500.00,120000.00,6500.00,86.67,'N','소재비 목표 미달','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'TCC-PT-01',2,'노무비',35000.00,33000.00,2000.00,32800.00,2200.00,110.00,'Y','노무비 절감 달성','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

-- ─── 8-20. PCM_CUR_ACT_MATERIAL: 실적 재료비 추정 (4행 × 2 프로젝트) ───
INSERT INTO PCM_CUR_ACT_MATERIAL (TEN_ID,CC_PJT_CD,CC_REV,TGT_COST_CD,MAT_SEQ,PART_NO,PART_NM,PIMS_CURRENCY,PIMS_PRICE,EVAL_CURRENCY,EVAL_EXCH_RATE,EVAL_PRICE,EST_MAT_COST,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260001',1,'TCC-SEAT-01',1,'SEAT-A01-F01','사이드프레임(L)','KRW',46000.0000,'KRW',1.000000,44000.0000,44000.00,'CR협상 반영','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'TCC-SEAT-01',2,'SEAT-A01-F02','사이드프레임(R)','KRW',46000.0000,'KRW',1.000000,44000.0000,44000.00,'CR협상 반영','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'TCC-SEAT-01',3,'SEAT-A01-C02','쿠션커버(가죽)','KRW',65000.0000,'KRW',1.000000,62000.0000,62000.00,'VA 적용','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260001',1,'TCC-SEAT-01',4,'SEAT-A01-H','헤드레스트 ASSY','KRW',43000.0000,'KRW',1.000000,41500.0000,41500.00,'구매단가 조정','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;

INSERT INTO PCM_CUR_ACT_MATERIAL (TEN_ID,CC_PJT_CD,CC_REV,TGT_COST_CD,MAT_SEQ,PART_NO,PART_NM,PIMS_CURRENCY,PIMS_PRICE,EVAL_CURRENCY,EVAL_EXCH_RATE,EVAL_PRICE,EST_MAT_COST,RMK,STS,REGR_ID,REG_DTTM,MODR_ID,MOD_DTTM) VALUES
('T001','CC20260004',1,'TCC-PT-01',1,'PT-A01-O01','아우터레이스(단조)','KRW',29000.0000,'KRW',1.000000,27800.0000,27800.00,'단조소재 CR','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'TCC-PT-01',2,'PT-A01-I','인너레이스','KRW',23000.0000,'KRW',1.000000,22200.0000,22200.00,'','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'TCC-PT-01',3,'PT-A01-K','케이지','KRW',19000.0000,'KRW',1.000000,18000.0000,18000.00,'구매단가 조정','T','testuser',NOW(),'testuser',NOW()),
('T001','CC20260004',1,'TCC-PT-01',4,'PT-A01-B','볼(6EA)','KRW',22000.0000,'KRW',1.000000,21000.0000,21000.00,'','T','testuser',NOW(),'testuser',NOW())
ON CONFLICT DO NOTHING;


-- ============================================================
-- 완료: 6개 EC + 6개 TC(Guide 포함) + 6개 CC 마스터
--       + TC20260001/TC20260004 상세 11개 테이블
--       + CC20260001/CC20260004 상세 20개 테이블 = E2E 샘플 적재 완료
-- ============================================================
