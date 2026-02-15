-- ============================================================
-- 기준정보 관리 샘플 데이터
-- ============================================================
SET search_path TO asyoucost;

-- ■ 그룹코드
INSERT INTO PCM_COM_GRP_CD (TEN_ID, GRP_CD, GRP_NM, USE_YN, SORT_NO, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM) VALUES
 ('T001','Rf','무위험이자율','Y',1,'system',NOW(),'system',NOW())
,('T001','Rm','시장수익률기대값','Y',2,'system',NOW(),'system',NOW())
,('T001','T001','등급','Y',3,'system',NOW(),'system',NOW())
,('T001','T002','수주유형','Y',4,'system',NOW(),'system',NOW())
,('T001','T003','견적진행상태','Y',5,'system',NOW(),'system',NOW())
,('T001','T004','사업부','Y',6,'system',NOW(),'system',NOW())
,('T001','T005','담당자롤','Y',7,'system',NOW(),'system',NOW())
,('T001','T006','공정','Y',8,'system',NOW(),'system',NOW())
,('T001','T007','인력구분','Y',9,'system',NOW(),'system',NOW())
,('T001','T008','투자항목','Y',10,'system',NOW(),'system',NOW())
,('T001','T009','생산법인','Y',11,'system',NOW(),'system',NOW())
,('T001','T010','배부방식','Y',12,'system',NOW(),'system',NOW())
,('T001','T011','금액/비율','Y',13,'system',NOW(),'system',NOW())
,('T001','CUST','고객사','Y',14,'system',NOW(),'system',NOW())
,('T001','T015','공장구분','Y',15,'system',NOW(),'system',NOW())
,('T001','T016','수주탈락사유','Y',16,'system',NOW(),'system',NOW())
,('T001','T017','손익항목특성','Y',17,'system',NOW(),'system',NOW())
,('T001','T018','인상률','Y',18,'system',NOW(),'system',NOW())
,('T001','T019','계정항목','Y',19,'system',NOW(),'system',NOW())
,('T001','T020','원가코드그룹','Y',20,'system',NOW(),'system',NOW())
,('T001','T021','부문','Y',21,'system',NOW(),'system',NOW())
,('T001','T022','ROLE','Y',22,'system',NOW(),'system',NOW())
,('T001','T023','지분구성','Y',23,'system',NOW(),'system',NOW())
,('T001','T024','달성도평가차수','Y',24,'system',NOW(),'system',NOW())
,('T001','T025','투자비진행상태','Y',25,'system',NOW(),'system',NOW())
,('T001','T026','금액구분1','Y',26,'system',NOW(),'system',NOW())
,('T001','T027','금액구분2','Y',27,'system',NOW(),'system',NOW())
,('T001','T028','감가상각구분','Y',28,'system',NOW(),'system',NOW())
,('T001','T029','재료비진행상태','Y',29,'system',NOW(),'system',NOW())
,('T001','T030','아이템구분','Y',30,'system',NOW(),'system',NOW())
,('T001','T031','자금조달구분','Y',31,'system',NOW(),'system',NOW())
,('T001','T032','차종','Y',32,'system',NOW(),'system',NOW())
,('T001','T033','제품군','Y',33,'system',NOW(),'system',NOW())
ON CONFLICT DO NOTHING;

-- ■ 상세코드 (주요 그룹만 샘플)
INSERT INTO PCM_COM_DTL_CD (TEN_ID, GRP_CD, DTL_CD, CD_NM, SORT_NO, USE_YN, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM) VALUES
-- 사업부 T004
 ('T001','T004','PT','PT (구동계)','1','Y','system',NOW(),'system',NOW())
,('T001','T004','SEAT','SEAT (시트)','2','Y','system',NOW(),'system',NOW())
-- 등급 T001
,('T001','T001','A','A등급','1','Y','system',NOW(),'system',NOW())
,('T001','T001','B','B등급','2','Y','system',NOW(),'system',NOW())
,('T001','T001','C','C등급','3','Y','system',NOW(),'system',NOW())
-- 수주유형 T002
,('T001','T002','NEW','신규수주','1','Y','system',NOW(),'system',NOW())
,('T001','T002','CHANGE','설변수주','2','Y','system',NOW(),'system',NOW())
-- 견적진행상태 T003
,('T001','T003','T','작성중','1','Y','system',NOW(),'system',NOW())
,('T001','T003','P','진행중','2','Y','system',NOW(),'system',NOW())
,('T001','T003','A','확정','3','Y','system',NOW(),'system',NOW())
,('T001','T003','R','탈락','4','Y','system',NOW(),'system',NOW())
,('T001','T003','C','완료','5','Y','system',NOW(),'system',NOW())
-- 제품군 T033
,('T001','T033','TM','TM','1','Y','system',NOW(),'system',NOW())
,('T001','T033','AXLE','AXLE','2','Y','system',NOW(),'system',NOW())
,('T001','T033','SEAT','SEAT','3','Y','system',NOW(),'system',NOW())
-- 고객사 CUST
,('T001','CUST','HMC','현대자동차','1','Y','5.0',NULL,NULL,NULL,'system',NOW(),'system',NOW())
,('T001','CUST','KIA','기아자동차','2','Y','4.5',NULL,NULL,NULL,'system',NOW(),'system',NOW())
-- 공장구분 T015
,('T001','T015','P01','화성공장','1','Y','CORP01','현대다이모스(주)',NULL,NULL,'system',NOW(),'system',NOW())
,('T001','T015','P02','광주공장','2','Y','CORP01','현대다이모스(주)',NULL,NULL,'system',NOW(),'system',NOW())
-- 손익항목특성 T017
,('T001','T017','V','값','1','Y','system',NOW(),'system',NOW())
,('T001','T017','S','집계','2','Y','system',NOW(),'system',NOW())
-- 무위험이자율 Rf
,('T001','Rf','RF01','3.5%','1','Y','system',NOW(),'system',NOW())
-- 시장수익률기대값 Rm
,('T001','Rm','RM01','8.0%','1','Y','system',NOW(),'system',NOW())
-- 생산법인 T009
,('T001','T009','KR','한국법인','1','Y','system',NOW(),'system',NOW())
,('T001','T009','CN','중국법인','2','Y','system',NOW(),'system',NOW())
,('T001','T009','US','미국법인','3','Y','system',NOW(),'system',NOW())
ON CONFLICT DO NOTHING;

-- ■ 손익 항목 샘플 (트리)
INSERT INTO PCM_PL_ITEM (TEN_ID, ITEM_CD, ITEM_NM, UP_ITEM_CD, ITEM_TYPE, LVL, SORT_NO, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM) VALUES
 ('T001','PL000','손익합계',NULL,'S',1,1,'system',NOW(),'system',NOW())
,('T001','PL100','매출액','PL000','S',2,1,'system',NOW(),'system',NOW())
,('T001','PL110','제품매출','PL100','V',3,1,'system',NOW(),'system',NOW())
,('T001','PL200','매출원가','PL000','S',2,2,'system',NOW(),'system',NOW())
,('T001','PL210','재료비','PL200','V',3,1,'system',NOW(),'system',NOW())
,('T001','PL220','노무비','PL200','V',3,2,'system',NOW(),'system',NOW())
,('T001','PL230','제조경비','PL200','V',3,3,'system',NOW(),'system',NOW())
,('T001','PL300','매출총이익','PL000','S',2,3,'system',NOW(),'system',NOW())
,('T001','PL400','판관비','PL000','S',2,4,'system',NOW(),'system',NOW())
,('T001','PL500','영업이익','PL000','S',2,5,'system',NOW(),'system',NOW())
ON CONFLICT DO NOTHING;
