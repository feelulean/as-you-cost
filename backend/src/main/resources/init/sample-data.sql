-- ============================================================
-- As-You-Cost 샘플 데이터 (E2E 테스트용)
-- SEAT 사업부: 3개 프로젝트 / PT 사업부: 3개 프로젝트
-- ============================================================
SET search_path TO asyoucost, public;

-- ── 기존 테스트 데이터 정리 ──
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
-- 완료: 총 6개 EC 프로젝트 × 7개 테이블 = 샘플 데이터 적재 완료
-- 달성도 평가(PCM_CUR_ACHV_EVAL)는 UI 화면에서 '생성' 버튼으로 테스트
-- ============================================================
