/**
 * 전체 탭 데이터 보충: TC/CC 모든 상세 테이블에 테스트 데이터 생성
 * CC_S01 (ccRev=1), TC_S01 프로젝트 기준
 */
const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.zxenhxqhfglorxgibmrz',
  password: 'admin1004!@#$',
  ssl: { rejectUnauthorized: false },
  options: '-c search_path=asyoucost,public'
});

const TEN = 'T001';
const TC = 'TC_S01';
const CC = 'CC_S01';
const CC_REV = 1;
const COST_CD = 'COST01';
const USR = 'testuser';

async function run() {
  await client.connect();
  await client.query('SET search_path TO asyoucost, public');
  console.log('Connected.\n');

  // ══════════════════════════════════════════════════
  // 1. TC DETAIL TABLES (tc-detail 화면 탭)
  // ══════════════════════════════════════════════════

  // ── 1.1 PCM_TGT_MANAGER ──
  await client.query(`DELETE FROM PCM_TGT_MANAGER WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [TEN, TC]);
  const managers = [
    { seq: 1, deptDiv: 'DEV',   nm: '김개발', pos: '과장', dept: '개발팀',   role: 'LEADER', email: 'dev@test.com' },
    { seq: 2, deptDiv: 'PURCH', nm: '이구매', pos: '대리', dept: '구매팀',   role: 'MEMBER', email: 'pur@test.com' },
    { seq: 3, deptDiv: 'PROD',  nm: '박생산', pos: '차장', dept: '생산기술팀', role: 'MEMBER', email: 'prod@test.com' }
  ];
  for (const m of managers) {
    await client.query(`INSERT INTO PCM_TGT_MANAGER (TEN_ID, TGT_PJT_CD, MGR_SEQ, DEPT_DIV, MGR_NM, POSITION, DEPT_NM, ROLE_CD, EMAIL, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'테스트','Y',$10,NOW(),$10,NOW())`,
      [TEN, TC, m.seq, m.deptDiv, m.nm, m.pos, m.dept, m.role, m.email, USR]);
  }
  console.log('PCM_TGT_MANAGER: 3 rows');

  // ── 1.2 PCM_TGT_SPEC ──
  await client.query(`DELETE FROM PCM_TGT_SPEC WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [TEN, TC]);
  const specs = [
    { seq: 1, ecCd: 'EC_TC_S01', tgtCd: 'COST01', grp: '시트', car: 'TEST-CAR', oem: 'TEST-OEM', desc: '운전석 시트 ASSY', sel: 'Y' },
    { seq: 2, ecCd: 'EC_TC_S01', tgtCd: 'COST02', grp: '시트', car: 'TEST-CAR', oem: 'TEST-OEM', desc: '조수석 시트 ASSY', sel: 'N' }
  ];
  for (const s of specs) {
    await client.query(`INSERT INTO PCM_TGT_SPEC (TEN_ID, TGT_PJT_CD, SPEC_SEQ, EC_PJT_CD, TGT_COST_CD, PROD_GRP, CAR_TYPE, OEM_NM, SPEC_DESC, SEL_YN, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'테스트','Y',$11,NOW(),$11,NOW())`,
      [TEN, TC, s.seq, s.ecCd, s.tgtCd, s.grp, s.car, s.oem, s.desc, s.sel, USR]);
  }
  console.log('PCM_TGT_SPEC: 2 rows');

  // ── 1.3 PCM_TGT_PRICE ──
  await client.query(`DELETE FROM PCM_TGT_PRICE WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [TEN, TC]);
  const prices = [
    { seq: 1, desc: '운전석 시트', cd: 'COST01', cur: 'KRW', price: 500000, sop: '2026-06', eop: '2030-06' },
    { seq: 2, desc: '조수석 시트', cd: 'COST02', cur: 'KRW', price: 450000, sop: '2026-06', eop: '2030-06' }
  ];
  for (const p of prices) {
    await client.query(`INSERT INTO PCM_TGT_PRICE (TEN_ID, TGT_PJT_CD, PRICE_SEQ, SPEC_DESC, TGT_COST_CD, CURRENCY, EST_SELL_PRICE, SOP_YM, EOP_YM, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'테스트','Y',$10,NOW(),$10,NOW())`,
      [TEN, TC, p.seq, p.desc, p.cd, p.cur, p.price, p.sop, p.eop, USR]);
  }
  console.log('PCM_TGT_PRICE: 2 rows');

  // ── 1.4 PCM_TGT_QTY_DISC ──
  await client.query(`DELETE FROM PCM_TGT_QTY_DISC WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [TEN, TC]);
  for (let yr = 1; yr <= 5; yr++) {
    await client.query(`INSERT INTO PCM_TGT_QTY_DISC (TEN_ID, TGT_PJT_CD, QTY_SEQ, SPEC_DESC, TGT_COST_CD, YEAR_VAL, QTY, DISC_RATE, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,'운전석 시트','COST01',$4,$5,$6,'테스트','Y',$7,NOW(),$7,NOW())`,
      [TEN, TC, yr, yr, 10000 + yr * 500, yr > 1 ? yr * 0.5 : 0, USR]);
  }
  console.log('PCM_TGT_QTY_DISC: 5 rows');

  // ── 1.5 PCM_TGT_DEV_SCHEDULE ──
  await client.query(`DELETE FROM PCM_TGT_DEV_SCHEDULE WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [TEN, TC]);
  const devScheds = [
    { seq: 1, type: 'DEV', nm: '설계 검토',   start: '2026-01-01', end: '2026-03-31', round: '1', period: 'Q1', proc: 'Y', sort: 1 },
    { seq: 2, type: 'DEV', nm: '시작품 제작', start: '2026-04-01', end: '2026-06-30', round: '1', period: 'Q2', proc: 'N', sort: 2 },
    { seq: 3, type: 'EVAL', nm: '1차 평가',  start: '2026-07-01', end: '2026-08-31', round: '1', period: 'Q3', proc: 'N', sort: 3 }
  ];
  for (const d of devScheds) {
    await client.query(`INSERT INTO PCM_TGT_DEV_SCHEDULE (TEN_ID, TGT_PJT_CD, SCHED_SEQ, SCHED_TYPE, SCHED_NM, PLAN_START_DT, PLAN_END_DT, ACT_END_DT, EVAL_ROUND, EVAL_PERIOD, DELAY_DAYS, PROC_YN, SORT_ORDER, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NULL,$8,$9,0,$10,$11,'테스트','Y',$12,NOW(),$12,NOW())`,
      [TEN, TC, d.seq, d.type, d.nm, d.start, d.end, d.round, d.period, d.proc, d.sort, USR]);
  }
  console.log('PCM_TGT_DEV_SCHEDULE: 3 rows');

  // ── 1.6 PCM_TGT_SETUP_SCHEDULE ──
  await client.query(`DELETE FROM PCM_TGT_SETUP_SCHEDULE WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [TEN, TC]);
  const setupScheds = [
    { seq: 1, dept: '구매팀',   start: '2026-01-15', end: '2026-02-28', proc: 'Y' },
    { seq: 2, dept: '생산기술팀', start: '2026-02-01', end: '2026-03-15', proc: 'N' },
    { seq: 3, dept: '품질관리팀', start: '2026-02-15', end: '2026-03-31', proc: 'N' }
  ];
  for (const s of setupScheds) {
    await client.query(`INSERT INTO PCM_TGT_SETUP_SCHEDULE (TEN_ID, TGT_PJT_CD, SETUP_SEQ, DEPT_NM, START_DT, END_DT, ACT_END_DT, PROC_YN, DELAY_DAYS, EMAIL_SENT, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,NULL,$7,0,'N','테스트','Y',$8,NOW(),$8,NOW())`,
      [TEN, TC, s.seq, s.dept, s.start, s.end, s.proc, USR]);
  }
  console.log('PCM_TGT_SETUP_SCHEDULE: 3 rows');

  // ══════════════════════════════════════════════════
  // 2. CC DETAIL TABLES (cc-info-register 화면 탭)
  // ══════════════════════════════════════════════════

  // ── 2.1 PCM_CUR_DETAIL ──
  await client.query(`DELETE FROM PCM_CUR_DETAIL WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  await client.query(`INSERT INTO PCM_CUR_DETAIL (TEN_ID, CC_PJT_CD, CC_REV, REV_NM, FACTORY_DIV, FACTORY_CD, FACTORY_NM, CORP_DIV, CORP_CD, CORP_NM, ATTACH_FILE, COMPOSE_YN, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1,$2,$3,'1차 현상원가','DOMESTIC','F001','본사공장','MFG','C001','테스트법인',NULL,'Y','테스트','Y',$4,NOW(),$4,NOW())`,
    [TEN, CC, CC_REV, USR]);
  console.log('PCM_CUR_DETAIL: 1 row');

  // ── 2.2 PCM_CUR_QTY_DISC ──
  await client.query(`DELETE FROM PCM_CUR_QTY_DISC WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  for (let yr = 1; yr <= 5; yr++) {
    await client.query(`INSERT INTO PCM_CUR_QTY_DISC (TEN_ID, CC_PJT_CD, CC_REV, QTY_SEQ, COST_CD, YEAR_VAL, SELL_QTY, DISC_RATE, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'테스트','Y',$9,NOW(),$9,NOW())`,
      [TEN, CC, CC_REV, yr, COST_CD, yr, 10000 + yr * 500, yr > 1 ? yr * 0.5 : 0, USR]);
  }
  console.log('PCM_CUR_QTY_DISC: 5 rows');

  // ── 2.3 PCM_CUR_MANAGER ──
  await client.query(`DELETE FROM PCM_CUR_MANAGER WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  const ccManagers = [
    { seq: 1, div: 'DEV',   id: 'USR001', nm: '김현상', role: 'LEADER', email: 'kim@test.com' },
    { seq: 2, div: 'PURCH', id: 'USR002', nm: '이분석', role: 'MEMBER', email: 'lee@test.com' }
  ];
  for (const m of ccManagers) {
    await client.query(`INSERT INTO PCM_CUR_MANAGER (TEN_ID, CC_PJT_CD, CC_REV, MGR_SEQ, DEPT_DIV, MGR_ID, MGR_NM, ROLE_CD, EMAIL, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'테스트','Y',$10,NOW(),$10,NOW())`,
      [TEN, CC, CC_REV, m.seq, m.div, m.id, m.nm, m.role, m.email, USR]);
  }
  console.log('PCM_CUR_MANAGER: 2 rows');

  // ── 2.4 PCM_CUR_SCHEDULE ──
  await client.query(`DELETE FROM PCM_CUR_SCHEDULE WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  const ccScheds = [
    { seq: 1, nm: '원가분석 착수',   std: 30, start: '2026-01-01', end: '2026-01-31', proc: 'Y', sort: 1 },
    { seq: 2, nm: 'BOM 등록',        std: 20, start: '2026-02-01', end: '2026-02-20', proc: 'Y', sort: 2 },
    { seq: 3, nm: '단가 등록',        std: 15, start: '2026-02-21', end: '2026-03-07', proc: 'N', sort: 3 },
    { seq: 4, nm: '원가 산출/검증',   std: 10, start: '2026-03-08', end: '2026-03-17', proc: 'N', sort: 4 }
  ];
  for (const s of ccScheds) {
    await client.query(`INSERT INTO PCM_CUR_SCHEDULE (TEN_ID, CC_PJT_CD, CC_REV, SCHED_SEQ, TASK_NM, STD_PERIOD, START_DT, END_DT, ACT_END_DT, PROC_STS, DELAY_DAYS, SORT_ORDER, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NULL,$9,0,$10,'테스트','Y',$11,NOW(),$11,NOW())`,
      [TEN, CC, CC_REV, s.seq, s.nm, s.std, s.start, s.end, s.proc, s.sort, USR]);
  }
  console.log('PCM_CUR_SCHEDULE: 4 rows');

  // ══════════════════════════════════════════════════
  // 3. CC MATERIAL COST (cc-material-cost 화면 탭)
  // ══════════════════════════════════════════════════

  // ── 3.1 PCM_CUR_BOM ──
  await client.query(`DELETE FROM PCM_CUR_BOM WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  const boms = [
    { seq: 1, no: 'P001', nm: '시트프레임',  div: 'PURCH', qty: 1, recv: 'Y', parent: 0, lv: 0 },
    { seq: 2, no: 'P002', nm: '시트쿠션',    div: 'PURCH', qty: 1, recv: 'Y', parent: 0, lv: 0 },
    { seq: 3, no: 'P003', nm: '헤드레스트',  div: 'PURCH', qty: 1, recv: 'N', parent: 0, lv: 0 },
    { seq: 4, no: 'P004', nm: '레일 ASSY',   div: 'MFG',   qty: 2, recv: 'Y', parent: 1, lv: 1 }
  ];
  for (const b of boms) {
    await client.query(`INSERT INTO PCM_CUR_BOM (TEN_ID, CC_PJT_CD, CC_REV, COST_CD, BOM_SEQ, PART_NO, PART_NM, PART_DIV, QTY, RECV_UNIT_YN, PARENT_SEQ, BOM_LEVEL, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'테스트','Y',$13,NOW(),$13,NOW())`,
      [TEN, CC, CC_REV, COST_CD, b.seq, b.no, b.nm, b.div, b.qty, b.recv, b.parent, b.lv, USR]);
  }
  console.log('PCM_CUR_BOM: 4 rows');

  // ── 3.2 PCM_CUR_PART_PRICE ──
  await client.query(`DELETE FROM PCM_CUR_PART_PRICE WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  const partPrices = [
    { seq: 1, no: 'P001', nm: '시트프레임', div: 'PURCH', pims: 45000, design: 43000, purch: 42000, confirm: 42500, loss: 2.0 },
    { seq: 2, no: 'P002', nm: '시트쿠션',   div: 'PURCH', pims: 32000, design: 30000, purch: 29500, confirm: 30000, loss: 1.5 },
    { seq: 3, no: 'P003', nm: '헤드레스트', div: 'PURCH', pims: 18000, design: 17000, purch: 16500, confirm: 17000, loss: 1.0 }
  ];
  for (const p of partPrices) {
    await client.query(`INSERT INTO PCM_CUR_PART_PRICE (TEN_ID, CC_PJT_CD, CC_REV, COST_CD, PRICE_SEQ, PART_NO, PART_NM, PART_DIV, PIMS_CURRENCY, PIMS_PRICE, DESIGN_CURRENCY, DESIGN_PRICE, PURCHASE_CURRENCY, PURCHASE_PRICE, CONFIRM_CURRENCY, CONFIRM_PRICE, LOSS_RATE, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'KRW',$9,'KRW',$10,'KRW',$11,'KRW',$12,$13,'테스트','Y',$14,NOW(),$14,NOW())`,
      [TEN, CC, CC_REV, COST_CD, p.seq, p.no, p.nm, p.div, p.pims, p.design, p.purch, p.confirm, p.loss, USR]);
  }
  console.log('PCM_CUR_PART_PRICE: 3 rows');

  // ══════════════════════════════════════════════════
  // 4. CC INVEST MGT (cc-invest-mgt 화면 탭)
  // ══════════════════════════════════════════════════

  // ── 4.1 PCM_CUR_LINE_INVEST ──
  await client.query(`DELETE FROM PCM_CUR_LINE_INVEST WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  await client.query(`INSERT INTO PCM_CUR_LINE_INVEST (TEN_ID, CC_PJT_CD, CC_REV, LINE_SEQ, LINE_DIV, LINE_CD, LINE_NM, INVEST_NM, PROCESS_CD, ACQ_AMT, ACQ_CURRENCY, DEPR_START_YM, CAPA_EA, AVAIL_RATE, USE_RATE, BASE_YEAR, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1,$2,$3,1,'NEW','L001','신규라인A','조립설비','ASM',500000000,'KRW','2026-06',50000,85.0,90.0,2026,'테스트','Y',$4,NOW(),$4,NOW())`,
    [TEN, CC, CC_REV, USR]);
  console.log('PCM_CUR_LINE_INVEST: 1 row');

  // ── 4.2 PCM_CUR_OTHER_INVEST ──
  await client.query(`DELETE FROM PCM_CUR_OTHER_INVEST WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  await client.query(`INSERT INTO PCM_CUR_OTHER_INVEST (TEN_ID, CC_PJT_CD, CC_REV, INVEST_SEQ, INVEST_NM, INVEST_DIV, CURRENCY, ACQ_AMT, DEPR_DIV, USEFUL_LIFE, ACQ_YEAR, DEPR_START_YM, AVAIL_RATE, USE_RATE, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1,$2,$3,1,'금형 투자','MOLD','KRW',80000000,'SL',5,2026,'2026-06',100.0,100.0,'테스트','Y',$4,NOW(),$4,NOW())`,
    [TEN, CC, CC_REV, USR]);
  console.log('PCM_CUR_OTHER_INVEST: 1 row');

  // ── 4.3 PCM_CUR_MANPOWER ──
  await client.query(`DELETE FROM PCM_CUR_MANPOWER WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  const manpowers = [
    { seq: 1, div: 'DIRECT',   nm: '조립작업자',   proc: 'ASM', salary: 4500000, yr: 1, cnt: 5, line: 1 },
    { seq: 2, div: 'INDIRECT', nm: '검사원',       proc: 'QC',  salary: 4000000, yr: 1, cnt: 2, line: 1 },
    { seq: 3, div: 'DIRECT',   nm: '용접작업자',   proc: 'WLD', salary: 4800000, yr: 1, cnt: 3, line: 1 }
  ];
  for (const mp of manpowers) {
    await client.query(`INSERT INTO PCM_CUR_MANPOWER (TEN_ID, CC_PJT_CD, CC_REV, MP_SEQ, MP_DIV, MP_NM, PROCESS_CD, CURRENCY, AVG_SALARY, YEAR_VAL, HEAD_COUNT, LINE_SEQ, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'KRW',$8,$9,$10,$11,'테스트','Y',$12,NOW(),$12,NOW())`,
      [TEN, CC, CC_REV, mp.seq, mp.div, mp.nm, mp.proc, mp.salary, mp.yr, mp.cnt, mp.line, USR]);
  }
  console.log('PCM_CUR_MANPOWER: 3 rows');

  // ══════════════════════════════════════════════════
  // 5. CC MFG COST (cc-mfg-cost 화면)
  // ══════════════════════════════════════════════════
  await client.query(`DELETE FROM PCM_CUR_MFG_COST WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  await client.query(`INSERT INTO PCM_CUR_MFG_COST (TEN_ID, CC_PJT_CD, CC_REV, COST_CD,
    WAGE_INCR_RATE, PRICE_INCR_RATE, DIRECT_EXP_RATE, LABOR_EXP_RATE, OTHER_MFG_RATE,
    MOLD_UNIT_COST, OUTSRC_UNIT_COST, OUTSRC_RATE, CALC_DONE_YN,
    DIRECT_LABOR_AMT, INDIRECT_LABOR_AMT, DIRECT_EXP_AMT, LABOR_EXP_AMT, OTHER_MFG_AMT,
    DEPR_BLDG_AMT, DEPR_LINE_AMT, DEPR_OTHER_AMT, OUTSRC_AMT, MOLD_AMT, RND_AMT, OTHER_EXP_AMT,
    TOTAL_MFG_AMT, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1,$2,$3,$4,
      3.0, 2.5, 15.0, 8.0, 5.0,
      500, 3000, 10.0, 'Y',
      30000, 20000, 12000, 6400, 4000,
      2000, 5000, 1000, 8000, 3000, 2000, 1600,
      95000, '테스트', 'Y', $5, NOW(), $5, NOW())`,
    [TEN, CC, CC_REV, COST_CD, USR]);
  console.log('PCM_CUR_MFG_COST: 1 row');

  // ══════════════════════════════════════════════════
  // 6. CC SGA COST (cc-sga-cost 화면)
  // ══════════════════════════════════════════════════
  await client.query(`DELETE FROM PCM_CUR_SGA_COST WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  await client.query(`INSERT INTO PCM_CUR_SGA_COST (TEN_ID, CC_PJT_CD, CC_REV, COST_CD,
    SALE_LABOR_RATE, TRANSPORT_RATE, EXPORT_RATE, QA_RATE, AD_RATE,
    RESEARCH_RATE, ASSET_RATE, HR_RATE, OTHER_RATE, CALC_DONE_YN,
    SALE_LABOR_AMT, TRANSPORT_AMT, EXPORT_AMT, QA_AMT, AD_AMT,
    RESEARCH_AMT, ASSET_AMT, HR_AMT, OTHER_AMT, TOTAL_SGA_AMT,
    RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1,$2,$3,$4,
      2.5, 1.5, 1.0, 1.5, 0.5,
      2.0, 0.5, 1.0, 0.5, 'Y',
      12500, 7500, 5000, 7500, 2500,
      10000, 2500, 5000, 2500, 55000,
      '테스트', 'Y', $5, NOW(), $5, NOW())`,
    [TEN, CC, CC_REV, COST_CD, USR]);
  console.log('PCM_CUR_SGA_COST: 1 row');

  // ══════════════════════════════════════════════════
  // 7. CC DIFF ANALYSIS (cc-diff-analysis 화면)
  // ══════════════════════════════════════════════════
  await client.query(`DELETE FROM PCM_CUR_DIFF_ANALYSIS WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  const diffs = [
    { seq: 1, type: 'STEP', cd: 'MAT',   nm: '재료비',   ec: 200000, cc: 168000 },
    { seq: 2, type: 'STEP', cd: 'LABOR', nm: '노무비',   ec: 50000,  cc: 50000 },
    { seq: 3, type: 'STEP', cd: 'MFG',   nm: '제조경비', ec: 100000, cc: 84000 },
    { seq: 4, type: 'STEP', cd: 'SGA',   nm: '판관비',   ec: 50000,  cc: 50000 }
  ];
  let cumEc = 0, cumCc = 0;
  for (const d of diffs) {
    const diffAmt = d.ec - d.cc;
    const diffRate = d.ec !== 0 ? Math.round(diffAmt / d.ec * 10000) / 100 : 0;
    cumEc += d.ec;
    cumCc += d.cc;
    await client.query(`INSERT INTO PCM_CUR_DIFF_ANALYSIS (TEN_ID, CC_PJT_CD, CC_REV, DIFF_SEQ, DIFF_TYPE, COST_ITEM_CD, COST_ITEM_NM, EC_AMT, CC_AMT, DIFF_AMT, DIFF_RATE, CUM_EC_AMT, CUM_CC_AMT, CUM_DIFF_AMT, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'테스트','Y',$15,NOW(),$15,NOW())`,
      [TEN, CC, CC_REV, d.seq, d.type, d.cd, d.nm, d.ec, d.cc, diffAmt, diffRate, cumEc, cumCc, cumEc - cumCc, USR]);
  }
  console.log('PCM_CUR_DIFF_ANALYSIS: 4 rows');

  // ══════════════════════════════════════════════════
  // 8. CC ACT MATERIAL (cc-actual-eval 화면)
  // ══════════════════════════════════════════════════
  await client.query(`DELETE FROM PCM_CUR_ACT_MATERIAL WHERE TEN_ID=$1 AND CC_PJT_CD=$2 AND CC_REV=$3`, [TEN, CC, CC_REV]);
  const actMats = [
    { seq: 1, no: 'P001', nm: '시트프레임', pimsPrice: 45000, evalPrice: 42500, estCost: 42500 },
    { seq: 2, no: 'P002', nm: '시트쿠션',   pimsPrice: 32000, evalPrice: 30000, estCost: 30000 },
    { seq: 3, no: 'P003', nm: '헤드레스트', pimsPrice: 18000, evalPrice: 17000, estCost: 17000 }
  ];
  for (const m of actMats) {
    await client.query(`INSERT INTO PCM_CUR_ACT_MATERIAL (TEN_ID, CC_PJT_CD, CC_REV, TGT_COST_CD, MAT_SEQ, PART_NO, PART_NM, PIMS_CURRENCY, PIMS_PRICE, EVAL_CURRENCY, EVAL_EXCH_RATE, EVAL_PRICE, EST_MAT_COST, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'KRW',$8,'KRW',1.0,$9,$10,'테스트','Y',$11,NOW(),$11,NOW())`,
      [TEN, CC, CC_REV, COST_CD, m.seq, m.no, m.nm, m.pimsPrice, m.evalPrice, m.estCost, USR]);
  }
  console.log('PCM_CUR_ACT_MATERIAL: 3 rows');

  // ══════════════════════════════════════════════════
  // 검증
  // ══════════════════════════════════════════════════
  console.log('\n══════ 검증 ══════');
  const tables = [
    ['PCM_TGT_MANAGER',        `TEN_ID='${TEN}' AND TGT_PJT_CD='${TC}'`],
    ['PCM_TGT_SPEC',           `TEN_ID='${TEN}' AND TGT_PJT_CD='${TC}'`],
    ['PCM_TGT_PRICE',          `TEN_ID='${TEN}' AND TGT_PJT_CD='${TC}'`],
    ['PCM_TGT_QTY_DISC',       `TEN_ID='${TEN}' AND TGT_PJT_CD='${TC}'`],
    ['PCM_TGT_DEV_SCHEDULE',   `TEN_ID='${TEN}' AND TGT_PJT_CD='${TC}'`],
    ['PCM_TGT_SETUP_SCHEDULE', `TEN_ID='${TEN}' AND TGT_PJT_CD='${TC}'`],
    ['PCM_CUR_DETAIL',         `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_QTY_DISC',       `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_MANAGER',        `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_SCHEDULE',       `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_BOM',            `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_PART_PRICE',     `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_LINE_INVEST',    `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_OTHER_INVEST',   `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_MANPOWER',       `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_MFG_COST',       `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_SGA_COST',       `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_DIFF_ANALYSIS',  `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`],
    ['PCM_CUR_ACT_MATERIAL',   `TEN_ID='${TEN}' AND CC_PJT_CD='${CC}' AND CC_REV=${CC_REV}`]
  ];
  for (const [tbl, where] of tables) {
    const r = await client.query(`SELECT COUNT(*) as cnt FROM ${tbl} WHERE ${where}`);
    console.log(`  ${tbl}: ${r.rows[0].cnt} rows`);
  }

  await client.end();
  console.log('\nDone!');
}

run().catch(err => {
  console.error('ERROR:', err);
  client.end();
  process.exit(1);
});
