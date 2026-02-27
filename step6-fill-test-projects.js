/**
 * Step 5-6: Fill all 3 test projects (EC_TC_S01/R01/M01) with COMPLETE data
 * EC: 18 tables, TC: 14 tables, CC: 9 tables + achv_eval
 *
 * Uses both direct DB (EC tables) and API calls (TC/CC tables)
 */
const http = require('http');
const { Client } = require('pg');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost', port: 9090, path, method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let buf = '';
      res.on('data', d => buf += d);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch(e) { resolve(buf); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const client = new Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432, database: 'postgres',
  user: 'postgres.zxenhxqhfglorxgibmrz',
  password: 'admin1004!@#$',
  ssl: { rejectUnauthorized: false },
  options: '-c search_path=asyoucost,public'
});

const T = 'T001';

// ================================================================
// 3 test project configurations
// ================================================================
const projects = [
  {
    name: 'Case 1: 원가혁신 성공', suffix: 'S01',
    ec: 'EC_TC_S01', tc: 'TC_S01', cc: 'CC_S01',
    pjtNm: '[TEST] Case1 원가혁신 성공',
    bizUnit: 'SEAT', custNm: '현대차', carType: 'GV80', oemNm: 'HMG', prodGrp: '시트',
    costCodes: [
      { cd: 'COST01', desc: 'Seat Frame ASSY', price: 85000, currency: 'KRW', sopYm: '202701', eopYm: '203112' },
      { cd: 'COST02', desc: 'Seat Heater Module', price: 42000, currency: 'KRW', sopYm: '202701', eopYm: '203112' }
    ],
    qty: [15000, 18000, 20000, 18000, 15000],
    ecCosts: { mat: 45000, labor: 8000, mfg: 12000, sga: 5000 },
    tcCosts: { mat: 40000, labor: 7500, mfg: 11000, sga: 4500 },
    ccCosts: { mat: 38000, labor: 7200, mfg: 10500, sga: 4300 },
    bomParts: [
      { no: 'SF-001', nm: 'Seat Frame', div: 'ASSY', qty: 1, parent: 0, lvl: 0, price: 25000 },
      { no: 'SF-002', nm: '사이드프레임L', div: 'PART', qty: 1, parent: 1, lvl: 1, price: 8000 },
      { no: 'SF-003', nm: '사이드프레임R', div: 'PART', qty: 1, parent: 1, lvl: 1, price: 8000 },
      { no: 'SF-004', nm: '시트쿠션패드', div: 'PART', qty: 1, parent: 1, lvl: 1, price: 5000 },
      { no: 'SF-005', nm: '리클라이너', div: 'PART', qty: 2, parent: 1, lvl: 1, price: 4500 }
    ],
    investLine: { nm: '시트조립라인', amt: 30000000, capa: 25000 },
    investOther: [
      { nm: '금형투자', type: 'MOLD', amt: 8000000, life: 5 },
      { nm: '검사장비', type: 'ETC', amt: 3000000, life: 7 }
    ]
  },
  {
    name: 'Case 2: 환율리스크', suffix: 'R01',
    ec: 'EC_TC_R01', tc: 'TC_R01', cc: 'CC_R01',
    pjtNm: '[TEST] Case2 환율리스크',
    bizUnit: 'PT', custNm: 'GM', carType: 'BOLT', oemNm: 'GM', prodGrp: '전동축',
    costCodes: [
      { cd: 'COST01', desc: 'Drive Shaft ASSY', price: 120000, currency: 'KRW', sopYm: '202606', eopYm: '203006' },
      { cd: 'COST02', desc: 'E-Motor ASSY', price: 280000, currency: 'KRW', sopYm: '202606', eopYm: '203006' },
      { cd: 'COST03', desc: 'Reducer ASSY', price: 95000, currency: 'KRW', sopYm: '202606', eopYm: '203006' }
    ],
    qty: [10000, 12000, 15000, 12000, 10000],
    ecCosts: { mat: 200000, labor: 50000, mfg: 100000, sga: 50000 },
    tcCosts: { mat: 190000, labor: 50000, mfg: 95000, sga: 45000 },
    ccCosts: { mat: 230000, labor: 55000, mfg: 110000, sga: 45000 },
    bomParts: [
      { no: 'DS-001', nm: '드라이브샤프트 ASSY', div: 'ASSY', qty: 1, parent: 0, lvl: 0, price: 45000 },
      { no: 'DS-002', nm: '축(Shaft)', div: 'PART', qty: 2, parent: 1, lvl: 1, price: 15000 },
      { no: 'DS-003', nm: '등속조인트', div: 'PART', qty: 2, parent: 1, lvl: 1, price: 12000 },
      { no: 'EM-001', nm: 'E-Motor ASSY', div: 'ASSY', qty: 1, parent: 0, lvl: 0, price: 180000 },
      { no: 'EM-002', nm: 'BLDC모터', div: 'PART', qty: 1, parent: 4, lvl: 1, price: 120000 },
      { no: 'EM-003', nm: '인버터PCB', div: 'PART', qty: 1, parent: 4, lvl: 1, price: 55000 },
      { no: 'RD-001', nm: '감속기 ASSY', div: 'ASSY', qty: 1, parent: 0, lvl: 0, price: 60000 },
      { no: 'RD-002', nm: '유성기어SET', div: 'PART', qty: 1, parent: 7, lvl: 1, price: 35000 },
      { no: 'RD-003', nm: '베어링', div: 'PART', qty: 4, parent: 7, lvl: 1, price: 5000 }
    ],
    investLine: { nm: '전동축조립라인', amt: 50000000, capa: 50000 },
    investOther: [
      { nm: '공장건물', type: 'BUILD', amt: 100000000, life: 30 },
      { nm: '시험장비', type: 'ETC', amt: 15000000, life: 7 },
      { nm: 'R&D장비', type: 'RND', amt: 10000000, life: 5 }
    ]
  },
  {
    name: 'Case 3: 혼합', suffix: 'M01',
    ec: 'EC_TC_M01', tc: 'TC_M01', cc: 'CC_M01',
    pjtNm: '[TEST] Case3 혼합',
    bizUnit: 'AXLE', custNm: '기아', carType: 'EV6', oemNm: 'KIA', prodGrp: '전자액슬',
    costCodes: [
      { cd: 'COST01', desc: 'E-Axle Module', price: 350000, currency: 'KRW', sopYm: '202703', eopYm: '203203' },
      { cd: 'COST02', desc: 'Inverter Unit', price: 180000, currency: 'KRW', sopYm: '202703', eopYm: '203203' }
    ],
    qty: [8000, 10000, 12000, 10000, 8000],
    ecCosts: { mat: 250000, labor: 60000, mfg: 120000, sga: 55000 },
    tcCosts: { mat: 237500, labor: 57000, mfg: 114000, sga: 52250 },
    ccCosts: { mat: 237500, labor: 72000, mfg: 138000, sga: 52250 },
    bomParts: [
      { no: 'EA-001', nm: 'E-Axle Module', div: 'ASSY', qty: 1, parent: 0, lvl: 0, price: 150000 },
      { no: 'EA-002', nm: '모터하우징', div: 'PART', qty: 1, parent: 1, lvl: 1, price: 35000 },
      { no: 'EA-003', nm: '로터+스테이터', div: 'PART', qty: 1, parent: 1, lvl: 1, price: 80000 },
      { no: 'EA-004', nm: '감속기', div: 'PART', qty: 1, parent: 1, lvl: 1, price: 30000 },
      { no: 'IV-001', nm: 'Inverter Unit', div: 'ASSY', qty: 1, parent: 0, lvl: 0, price: 95000 },
      { no: 'IV-002', nm: 'IGBT모듈', div: 'PART', qty: 1, parent: 5, lvl: 1, price: 55000 },
      { no: 'IV-003', nm: '제어기판', div: 'PART', qty: 1, parent: 5, lvl: 1, price: 35000 }
    ],
    investLine: { nm: '전자액슬 라인', amt: 80000000, capa: 40000 },
    investOther: [
      { nm: '금형', type: 'MOLD', amt: 20000000, life: 5 },
      { nm: 'EOL시험기', type: 'ETC', amt: 25000000, life: 7 },
      { nm: 'NVH분석장비', type: 'RND', amt: 12000000, life: 5 }
    ]
  }
];

async function cleanupProject(p) {
  // Delete in reverse dependency order
  const ecDels = [
    'PCM_EC_PROFIT', 'PCM_EC_NPV', 'PCM_EC_FUND_PLAN',
    'PCM_EC_SENSITIVITY_VAR', 'PCM_EC_SENSITIVITY',
    'PCM_EC_PL_STMT', 'PCM_EC_BOM',
    'PCM_EC_SGA_COST', 'PCM_EC_MFG_COST', 'PCM_EC_MANPOWER',
    'PCM_EC_OTHER_INVEST', 'PCM_EC_LINE_INVEST',
    'PCM_EC_SCHEDULE', 'PCM_EC_MANAGER',
    'PCM_EC_QTY_DISC', 'PCM_EC_COST_CODE', 'PCM_EC_DETAIL',
    'PCM_EC_PJT_MSTR'
  ];
  for (const tbl of ecDels) {
    await client.query(`DELETE FROM ${tbl} WHERE TEN_ID=$1 AND EC_PJT_CD=$2`, [T, p.ec]);
  }

  const tcDels = [
    'PCM_TGT_ACHV_STATUS', 'PCM_TGT_RECALC', 'PCM_TGT_ACHV_PLAN_DTL',
    'PCM_TGT_ACHV_PLAN', 'PCM_TGT_COST_REG', 'PCM_TGT_GUIDE',
    'PCM_TGT_SETUP_SCHEDULE', 'PCM_TGT_DEV_SCHEDULE',
    'PCM_TGT_QTY_DISC', 'PCM_TGT_PRICE', 'PCM_TGT_SPEC',
    'PCM_TGT_MANAGER', 'PCM_TGT_PJT_MSTR'
  ];
  for (const tbl of tcDels) {
    await client.query(`DELETE FROM ${tbl} WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [T, p.tc]);
  }

  const ccDels = [
    'PCM_CUR_ACT_EVAL', 'PCM_CUR_PART_PRICE', 'PCM_CUR_BOM',
    'PCM_CUR_SCHEDULE', 'PCM_CUR_MANAGER', 'PCM_CUR_QTY_DISC',
    'PCM_CUR_COST_CODE', 'PCM_CUR_DETAIL'
  ];
  for (const tbl of ccDels) {
    await client.query(`DELETE FROM ${tbl} WHERE TEN_ID=$1 AND CC_PJT_CD=$2`, [T, p.cc]);
  }
  await client.query(`DELETE FROM PCM_CUR_ACHV_EVAL WHERE TEN_ID=$1 AND CUR_PJT_CD=$2`, [T, p.cc]);
  await client.query(`DELETE FROM PCM_CUR_ACHV_EVAL_DTL WHERE TEN_ID=$1 AND CC_PJT_CD=$2`, [T, p.cc]);
  await client.query(`DELETE FROM PCM_CUR_PJT_MSTR WHERE TEN_ID=$1 AND CC_PJT_CD=$2`, [T, p.cc]);
}

async function insertEcData(p) {
  // 1. EC PJT Master
  await client.query(`
    INSERT INTO PCM_EC_PJT_MSTR (TEN_ID, EC_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP, PROD_QTY, SOP_DT, BASE_CURRENCY, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '2027-01', 'KRW', '통합테스트', 'P', 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.ec, p.pjtNm + ' - EC', p.bizUnit, p.custNm, p.carType, p.oemNm, p.prodGrp, p.qty.reduce((a,b)=>a+b,0)]);

  // 2. EC Detail
  await client.query(`
    INSERT INTO PCM_EC_DETAIL (TEN_ID, EC_PJT_CD, EC_VER, RECV_DT, SUBMIT_DT, PRICE_COMP, ORDER_TYPE, FACTORY_TYPE, FACTORY_CD, CORP_TYPE, CORP_CD, ORDER_PROB, ORDER_REASON, COMPETITOR, DEV_POSS, RMK, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, 1, '2026-01-15', '2026-02-15', 'COMP', 'NEW', 'F2', 'FAC01', 'HQ', 'CRP01', 'HIGH', '기존 거래선', '경쟁사A/B', 'HIGH', '테스트 프로젝트', 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.ec]);

  // 3. EC Cost Code
  for (let i = 0; i < p.costCodes.length; i++) {
    const cc = p.costCodes[i];
    await client.query(`
      INSERT INTO PCM_EC_COST_CODE (TEN_ID, EC_PJT_CD, COST_CD, PROD_GRP, COST_GRP, COST_GRP_DESC, EST_CURRENCY, EST_PRICE, MKT_CURRENCY, MKT_PRICE, SOP_YM, EOP_YM, SORT_NO, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'USD', $9, $10, $11, $12, 'testuser', NOW(), 'testuser', NOW())
    `, [T, p.ec, cc.cd, p.prodGrp, p.prodGrp, cc.desc, cc.currency, cc.price, cc.price/1350, cc.sopYm, cc.eopYm, i+1]);
  }

  // 4. EC Qty Disc (per cost code x 5 years)
  for (const cc of p.costCodes) {
    for (let y = 0; y < 5; y++) {
      await client.query(`
        INSERT INTO PCM_EC_QTY_DISC (TEN_ID, EC_PJT_CD, COST_CD, YEAR_VAL, SALES_QTY, DISC_RATE, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
        VALUES ($1, $2, $3, $4, $5, $6, 'testuser', NOW(), 'testuser', NOW())
      `, [T, p.ec, cc.cd, String(y+1), p.qty[y], y === 0 ? 0 : y * 1.5]);
    }
  }

  // 5. EC Manager (3)
  const managers = [
    { seq: 1, dept: 'ENG', userId: 'user01', nm: '김설계', role: 'PM', email: 'kim@test.com' },
    { seq: 2, dept: 'PUR', userId: 'user02', nm: '이구매', role: 'MEMBER', email: 'lee@test.com' },
    { seq: 3, dept: 'PRD', userId: 'user03', nm: '박생산', role: 'MEMBER', email: 'park@test.com' }
  ];
  for (const m of managers) {
    await client.query(`
      INSERT INTO PCM_EC_MANAGER (TEN_ID, EC_PJT_CD, SEQ_NO, DEPT_TYPE, USER_ID, USER_NM, ROLE_TYPE, EMAIL, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'testuser', NOW(), 'testuser', NOW())
    `, [T, p.ec, m.seq, m.dept, m.userId, m.nm, m.role, m.email]);
  }

  // 6. EC Schedule (3)
  const schedules = [
    { task: 'T001', nm: '설계검토', start: '2026-03-01', end: '2026-05-31', actEnd: '2026-05-28', delay: 0, sort: 1 },
    { task: 'T002', nm: 'RFQ발행', start: '2026-06-01', end: '2026-07-31', actEnd: '2026-08-05', delay: 5, sort: 2 },
    { task: 'T003', nm: '시작품 제작', start: '2026-08-01', end: '2026-10-31', actEnd: '2026-10-30', delay: 0, sort: 3 }
  ];
  for (const s of schedules) {
    await client.query(`
      INSERT INTO PCM_EC_SCHEDULE (TEN_ID, EC_PJT_CD, TASK_CD, TASK_NM, START_DT, END_DT, ACTUAL_END_DT, DELAY_DAYS, SORT_NO, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'testuser', NOW(), 'testuser', NOW())
    `, [T, p.ec, s.task, s.nm, s.start, s.end, s.actEnd, s.delay, s.sort]);
  }

  // 7. EC Line Invest
  await client.query(`
    INSERT INTO PCM_EC_LINE_INVEST (TEN_ID, EC_PJT_CD, LINE_SEQ, LINE_TYPE, LINE_CD, LINE_NM, PROCESS_TYPE, ACQ_AMT, ACQ_CURRENCY, DEPR_START_YM, CAPA_QTY, AVAIL_RATE, USE_RATE, USEFUL_LIFE, RMK, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, 1, 'ASSY', 'L001', $3, 'ASSY', $4, 'KRW', '202701', $5, 90, 85, 10, '조립라인', 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.ec, p.investLine.nm, p.investLine.amt, p.investLine.capa]);

  // 8. EC Other Invest
  for (let i = 0; i < p.investOther.length; i++) {
    const inv = p.investOther[i];
    await client.query(`
      INSERT INTO PCM_EC_OTHER_INVEST (TEN_ID, EC_PJT_CD, INVEST_SEQ, INVEST_NM, INVEST_TYPE, CURRENCY, ACQ_AMT, DEPR_TYPE, USEFUL_LIFE, ACQ_YEAR, DEPR_START_YM, AVAIL_RATE, USE_RATE, RMK, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, $3, $4, $5, 'KRW', $6, 'SL', $7, 2026, '202701', 90, 85, $4, 'testuser', NOW(), 'testuser', NOW())
    `, [T, p.ec, i+1, inv.nm, inv.type, inv.amt, inv.life]);
  }

  // 9. EC Manpower (3 types, Y1-Y7)
  const mpTypes = [
    { type: 'DIRECT', nm: '직접인원', process: 'ASSY', salary: 45000000, y: [8, 10, 12, 12, 10, 8, 6] },
    { type: 'INDIRECT', nm: '간접인원', process: 'SUPPORT', salary: 50000000, y: [4, 5, 6, 6, 5, 4, 3] },
    { type: 'SGA', nm: '판관인원', process: 'ADMIN', salary: 55000000, y: [2, 2, 3, 3, 2, 2, 1] }
  ];
  for (let i = 0; i < mpTypes.length; i++) {
    const mp = mpTypes[i];
    await client.query(`
      INSERT INTO PCM_EC_MANPOWER (TEN_ID, EC_PJT_CD, MP_SEQ, MP_TYPE, MP_NM, PROCESS_TYPE, CURRENCY, AVG_SALARY, Y1_CNT, Y2_CNT, Y3_CNT, Y4_CNT, Y5_CNT, Y6_CNT, Y7_CNT, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, $3, $4, $5, $6, 'KRW', $7, $8, $9, $10, $11, $12, $13, $14, 'testuser', NOW(), 'testuser', NOW())
    `, [T, p.ec, i+1, mp.type, mp.nm, mp.process, mp.salary, ...mp.y]);
  }

  // 10. EC MFG Cost (per cost code)
  for (const cc of p.costCodes) {
    await client.query(`
      INSERT INTO PCM_EC_MFG_COST (TEN_ID, EC_PJT_CD, COST_CD, WAGE_RAISE_RATE, PRICE_RAISE_RATE, PROD_DIRECT_RATE, LABOR_COST_RATE, OTHER_MFG_RATE, MOLD_COST, OUTSRC_COST, OUTSRC_RATE, DIRECT_LABOR, INDIRECT_LABOR, PROD_DIRECT_EXP, LABOR_RELATED_EXP, OTHER_MFG_EXP, DEPR_BUILDING, DEPR_LINE, DEPR_OTHER, RND_COST, OTHER_EXP, TOTAL_MFG_COST, CALC_STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, $3, 3.5, 2.0, 12, 8, 5, 15000, 8000, 7.6, 3500, 1800, 6200, 4000, 2500, 1200, 3500, 800, 2000, 1500, 50000, 'Y', 'testuser', NOW(), 'testuser', NOW())
    `, [T, p.ec, cc.cd]);
  }

  // 11. EC SGA Cost (per cost code)
  for (const cc of p.costCodes) {
    await client.query(`
      INSERT INTO PCM_EC_SGA_COST (TEN_ID, EC_PJT_CD, COST_CD, SALES_LABOR_RATE, TRANSPORT_RATE, EXPORT_RATE, WARRANTY_RATE, ADVERTISING_RATE, RESEARCH_RATE, ASSET_RATE, PERSONNEL_RATE, OTHER_RATE, TOTAL_SGA_COST, CALC_STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, $3, 2.5, 1.2, 0.8, 1.5, 0.5, 1.0, 0.3, 1.5, 0.7, 10000, 'Y', 'testuser', NOW(), 'testuser', NOW())
    `, [T, p.ec, cc.cd]);
  }

  // 12. EC BOM
  for (let i = 0; i < p.bomParts.length; i++) {
    const b = p.bomParts[i];
    await client.query(`
      INSERT INTO PCM_EC_BOM (TEN_ID, EC_PJT_CD, ITEM_CD, UP_ITEM_CD, LVL, ITEM_NM, SPEC, QTY, UNIT_PRICE, MAT_COST, NEW_PART_YN, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, '', 'T', 'testuser', NOW(), 'testuser', NOW())
    `, [T, p.ec, b.no, b.parent === 0 ? '' : p.bomParts[b.parent-1].no, b.lvl, b.nm, b.nm + ' SPEC', b.qty, b.price, b.qty * b.price, b.lvl === 1 ? 'Y' : 'N']);
  }

  // 13. EC PL Stmt (5 years)
  const totalQty5 = p.qty.reduce((a,b)=>a+b,0);
  const totalSales = p.costCodes[0].price;
  const { mat, labor, mfg, sga } = p.ecCosts;
  for (let y = 0; y < 5; y++) {
    const yqty = p.qty[y];
    await client.query(`
      INSERT INTO PCM_EC_PL_STMT (TEN_ID, EC_PJT_CD, VIEW_TYPE, VIEW_KEY, YEAR_VAL, SALES_AMT, MAT_COST, LABOR_COST, MFG_COST, TOTAL_MFG_COST, GROSS_PROFIT, SGA_COST, OPER_INCOME, OPER_MARGIN, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, 'PJT', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'testuser', NOW(), 'testuser', NOW())
    `, [T, p.ec, String(y+1),
        totalSales * yqty, mat * yqty, labor * yqty, mfg * yqty,
        (mat + labor + mfg) * yqty,
        (totalSales - mat - labor - mfg) * yqty,
        sga * yqty,
        (totalSales - mat - labor - mfg - sga) * yqty,
        ((totalSales - mat - labor - mfg - sga) / totalSales * 100)]);
  }

  // 14. EC Sensitivity
  await client.query(`
    INSERT INTO PCM_EC_SENSITIVITY (TEN_ID, EC_PJT_CD, SENS_VER, SENS_NM, END_YN, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, 1, '기본 민감도 분석', 'N', 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.ec]);

  // 15. EC Sensitivity Var
  await client.query(`
    INSERT INTO PCM_EC_SENSITIVITY_VAR (TEN_ID, EC_PJT_CD, SENS_VER, VAR_TYPE, VAR_NM, BEFORE_VAL, AFTER_VAL, YEAR_VAL, COST_CD, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, 1, 'PRICE', '판매단가 변동', $3, $4, '1', 'COST01', 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.ec, String(p.costCodes[0].price), String(p.costCodes[0].price * 0.95)]);

  // 16. EC Fund Plan
  const totalInvest = p.investLine.amt + p.investOther.reduce((a,b) => a + b.amt, 0);
  await client.query(`
    INSERT INTO PCM_EC_FUND_PLAN (TEN_ID, EC_PJT_CD, FUND_SEQ, SOURCE_TYPE, INTEREST_RATE, CURRENCY, Y1_AMT, Y2_AMT, Y3_AMT, Y4_AMT, Y5_AMT, Y6_AMT, Y7_AMT, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, 1, 'EQUITY', 0, 'KRW', $3, $4, $5, $6, $7, $8, $9, 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.ec, totalInvest*0.4, totalInvest*0.25, totalInvest*0.15, totalInvest*0.1, totalInvest*0.05, totalInvest*0.03, totalInvest*0.02]);

  // 17. EC NPV
  await client.query(`
    INSERT INTO PCM_EC_NPV (TEN_ID, EC_PJT_CD, ANALYSIS_VER, ANALYSIS_TYPE, WACC_RATE, NPV_VAL, IRR_VAL, PAYBACK_PERIOD, PI_VAL, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, 1, 'STD', 8.5, $3, $4, $5, $6, 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.ec, totalInvest * 0.8, 14.2, 4.5, 1.28]);

  // 18. EC Profit
  await client.query(`
    INSERT INTO PCM_EC_PROFIT (TEN_ID, EC_PJT_CD, MAT_COST, LABOR_COST, MFG_COST, SGA_COST, TOTAL_ESTM_COST, KD_RATE, TAX_RATE, DEBT_AMT, EQUITY_AMT, RF_RATE, ERM_RATE, BETA_VAL, KE_RATE, WACC_RATE, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 4.5, 22, $8, $9, 3.5, 6.0, 1.1, 10.1, 5.62, '수익성 분석', 'T', 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.ec, mat, labor, mfg, sga, mat+labor+mfg+sga, totalInvest*0.4, totalInvest*0.6]);
}

async function insertTcData(p) {
  // 1. TC PJT Master
  await client.query(`
    INSERT INTO PCM_TGT_PJT_MSTR (TEN_ID, TGT_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP, EC_PJT_CD, BASE_CURRENCY, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'KRW', 'A', 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.tc, p.pjtNm + ' - TC', p.bizUnit, p.custNm, p.carType, p.oemNm, p.prodGrp, p.ec]);

  // 2. TC Manager (via API)
  await post('/bp/cost/tc/detail/saveListManager.do', {
    tgtPjtCd: p.tc,
    saveList: [
      { _rowStatus: 'C', mgrSeq: 1, deptDiv: 'PT', mgrNm: '김설계', position: '과장', deptNm: 'PT설계팀', roleCd: 'LEADER', email: 'kim@test.com', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', mgrSeq: 2, deptDiv: 'PT', mgrNm: '이구매', position: '대리', deptNm: 'PT구매팀', roleCd: 'MEMBER', email: 'lee@test.com', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', mgrSeq: 3, deptDiv: 'PT', mgrNm: '박생산', position: '차장', deptNm: 'PT생산팀', roleCd: 'MEMBER', email: 'park@test.com', rmk: '', sts: 'Y' }
    ]
  });

  // 3. TC Spec
  const specList = p.costCodes.map((cc, i) => ({
    _rowStatus: 'C', specSeq: i+1, ecCostCd: cc.cd, tgtCostCd: cc.cd,
    prodGrpNm: p.prodGrp, carType: p.carType, oemNm: p.oemNm,
    specDesc: cc.desc, selYn: 'Y', rmk: '', sts: 'Y'
  }));
  await post('/bp/cost/tc/detail/saveListSpec.do', { tgtPjtCd: p.tc, saveList: specList });

  // 4. TC Price
  const priceList = p.costCodes.map((cc, i) => ({
    _rowStatus: 'C', priceSeq: i+1, specDesc: cc.desc, tgtCostCd: cc.cd,
    currency: cc.currency, estSellPrice: cc.price, sopYm: cc.sopYm, eopYm: cc.eopYm,
    rmk: '', sts: 'Y'
  }));
  await post('/bp/cost/tc/detail/saveListPrice.do', { tgtPjtCd: p.tc, saveList: priceList });

  // 5. TC QtyDisc
  const qtyList = [];
  let seq = 1;
  for (const cc of p.costCodes) {
    for (let y = 0; y < 5; y++) {
      qtyList.push({
        _rowStatus: 'C', qtyDiscSeq: seq++, specDesc: cc.desc, tgtCostCd: cc.cd,
        yearVal: String(y+1), qty: p.qty[y], discRate: y === 0 ? 0 : y * 1.5,
        rmk: '', sts: 'Y'
      });
    }
  }
  await post('/bp/cost/tc/detail/saveListQtyDisc.do', { tgtPjtCd: p.tc, saveList: qtyList });

  // 6. TC DevSchedule
  await post('/bp/cost/tc/detail/saveListDevSchedule.do', {
    tgtPjtCd: p.tc,
    saveList: [
      { _rowStatus: 'C', schedSeq: 1, schedType: 'DEV', schedNm: '설계검토', planStartDt: '2026-03-01', planEndDt: '2026-05-31', actEndDt: '', evalRound: '1', evalPeriod: '2026-Q1', delayDays: 0, procYn: 'N', sortOrder: 1, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', schedSeq: 2, schedType: 'DEV', schedNm: '시작품 제작', planStartDt: '2026-06-01', planEndDt: '2026-08-31', actEndDt: '', evalRound: '2', evalPeriod: '2026-Q2', delayDays: 0, procYn: 'N', sortOrder: 2, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', schedSeq: 3, schedType: 'DEV', schedNm: '시험평가', planStartDt: '2026-09-01', planEndDt: '2026-11-30', actEndDt: '', evalRound: '3', evalPeriod: '2026-Q3', delayDays: 0, procYn: 'N', sortOrder: 3, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', schedSeq: 4, schedType: 'DEV', schedNm: '양산이행', planStartDt: '2026-12-01', planEndDt: '2027-01-31', actEndDt: '', evalRound: '4', evalPeriod: '2026-Q4', delayDays: 0, procYn: 'N', sortOrder: 4, rmk: '', sts: 'Y' }
    ]
  });

  // 7. TC SetupSchedule
  await post('/bp/cost/tc/detail/saveListSetupSchedule.do', {
    tgtPjtCd: p.tc,
    saveList: [
      { _rowStatus: 'C', setupSchedSeq: 1, deptNm: 'PT설계팀', startDt: '2026-12-01', endDt: '2027-01-15', actEndDt: '', procYn: 'N', delayDays: 0, emailSent: 'N', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', setupSchedSeq: 2, deptNm: 'PT생산팀', startDt: '2027-01-16', endDt: '2027-02-28', actEndDt: '', procYn: 'N', delayDays: 0, emailSent: 'N', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', setupSchedSeq: 3, deptNm: 'PT품질팀', startDt: '2027-03-01', endDt: '2027-03-31', actEndDt: '', procYn: 'N', delayDays: 0, emailSent: 'N', rmk: '', sts: 'Y' }
    ]
  });

  // 8. TC Guide (direct DB - API format may differ)
  const costItems = [
    { cd: 'MAT', nm: '재료비', ecAmt: p.ecCosts.mat, tgtAmt: p.tcCosts.mat },
    { cd: 'LABOR', nm: '노무비', ecAmt: p.ecCosts.labor, tgtAmt: p.tcCosts.labor },
    { cd: 'MFG', nm: '제조경비', ecAmt: p.ecCosts.mfg, tgtAmt: p.tcCosts.mfg },
    { cd: 'SGA', nm: '판관비', ecAmt: p.ecCosts.sga, tgtAmt: p.tcCosts.sga }
  ];
  const prodQty = p.qty[0]; // year 1 qty
  for (let i = 0; i < costItems.length; i++) {
    const ci = costItems[i];
    const saveRate = ((ci.ecAmt - ci.tgtAmt) / ci.ecAmt * 100);
    await client.query(`
      INSERT INTO PCM_TGT_GUIDE (TEN_ID, TGT_PJT_CD, GUIDE_SEQ, COST_ITEM_CD, COST_ITEM_NM, DEPT_CD, DEPT_NM, EC_COST_TOT_AMT, EC_COST_UNIT_AMT, GUIDE_TGT_TOT_AMT, GUIDE_TGT_UNIT_AMT, CFT_TGT_TOT_AMT, CFT_TGT_UNIT_AMT, SAVE_RATE, PROD_QTY, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, $3, $4, $5, $4, $5, $6, $7, $8, $9, $8, $9, $10, $11, '', 'Y', 'testuser', NOW(), 'testuser', NOW())
    `, [T, p.tc, i+1, ci.cd, ci.nm, ci.ecAmt * prodQty, ci.ecAmt, ci.tgtAmt * prodQty, ci.tgtAmt, saveRate, prodQty]);
  }

  // 9. TC CostReg
  const costRegList = costItems.map((ci, i) => ({
    _rowStatus: 'C', costSeq: i+1, costItemCd: ci.cd, costItemNm: ci.nm,
    deptCd: ci.cd, deptNm: ci.nm,
    ecCostAmt: ci.ecAmt, guideAmt: ci.tgtAmt, finalTgtAmt: ci.tgtAmt,
    diffAmt: 0, adjReason: '', saveTgtAmt: ci.ecAmt - ci.tgtAmt,
    confirmYn: 'Y', viewMode: 'SUM', rmk: '', sts: 'Y'
  }));
  await post('/bp/cost/tc/detail/saveListCostReg.do', { tgtPjtCd: p.tc, saveList: costRegList });

  // 10. TC AchvPlan
  const achvPlanList = costItems.map((ci, i) => ({
    _rowStatus: 'C', planSeq: i+1, costItemCd: ci.cd, costItemNm: ci.nm,
    ecCostAmt: ci.ecAmt, tgtCostAmt: ci.tgtAmt,
    saveTgtAmt: ci.ecAmt - ci.tgtAmt, savePlanAmt: ci.ecAmt - ci.tgtAmt,
    confirmYn: 'Y', rmk: '', sts: 'Y'
  }));
  await post('/bp/cost/tc/detail/saveListAchvPlan.do', { tgtPjtCd: p.tc, saveList: achvPlanList });

  // 11. TC AchvPlanDtl
  const dtlList = [];
  for (let i = 0; i < costItems.length; i++) {
    const ci = costItems[i];
    const saveTgt = ci.ecAmt - ci.tgtAmt;
    dtlList.push(
      { _rowStatus: 'C', planSeq: i+1, dtlSeq: 1, level1: ci.nm + ' 절감 1', level2: '상세활동 A', level3: '', saveAmt: saveTgt * 0.6, fileNm: '', filePath: '', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', planSeq: i+1, dtlSeq: 2, level1: ci.nm + ' 절감 2', level2: '상세활동 B', level3: '', saveAmt: saveTgt * 0.4, fileNm: '', filePath: '', rmk: '', sts: 'Y' }
    );
  }
  await post('/bp/cost/tc/detail/saveListAchvPlanDtl.do', { tgtPjtCd: p.tc, saveList: dtlList });

  // 12. TC Recalc
  await post('/bp/cost/tc/detail/saveListRecalc.do', {
    tgtPjtCd: p.tc,
    saveList: [
      { _rowStatus: 'C', recalcSeq: 1, ccGrpCd: p.cc, ccRound: 1, tgtProfitRate: 20.0, finalTgtProfitRate: 18.5, rmk: '1차 재산정', sts: 'Y' }
    ]
  });

  // 13. TC AchvStatus
  const ecTotal = costItems.reduce((s, ci) => s + ci.ecAmt, 0);
  const tgtTotal = costItems.reduce((s, ci) => s + ci.tgtAmt, 0);
  const curTotal = Object.values(p.ccCosts).reduce((a,b) => a+b, 0);
  const saveTgt = ecTotal - tgtTotal;
  const saveAct = ecTotal - curTotal;
  const achvRate = saveTgt > 0 ? Math.round(saveAct / saveTgt * 10000) / 100 : 100;
  await client.query(`
    INSERT INTO PCM_TGT_ACHV_STATUS (TEN_ID, TGT_PJT_CD, PJT_NM, BIZ_UNIT, PROD_GRP, OEM_NM, CAR_TYPE, EC_TOTAL_AMT, TGT_TOTAL_AMT, CUR_TOTAL_AMT, SAVE_TGT_AMT, SAVE_ACT_AMT, ACHV_RATE, ACHV_YN, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Y', 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.tc, p.pjtNm + ' - TC', p.bizUnit, p.prodGrp, p.oemNm, p.carType, ecTotal, tgtTotal, curTotal, saveTgt, saveAct, achvRate, achvRate >= 100 ? 'Y' : 'N']);
}

async function insertCcData(p) {
  // 1. CC PJT Master
  await client.query(`
    INSERT INTO PCM_CUR_PJT_MSTR (TEN_ID, CC_PJT_CD, CC_REV, EC_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP, BASE_CURRENCY, PROG_STS, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, 1, $3, $4, $5, $6, $7, $8, $9, 'KRW', 'A', '통합테스트', 'T', 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.cc, p.ec, p.pjtNm + ' - CC', p.bizUnit, p.custNm, p.carType, p.oemNm, p.prodGrp]);

  // 2. CC Detail (via API)
  await post('/bp/cost/cc/detail/saveCcDetail.do', {
    ccPjtCd: p.cc, ccRev: 1, _rowStatus: 'C',
    revNm: '1차 현상원가', factoryDiv: 'F2', factoryCd: 'FAC01', factoryNm: '화성공장',
    corpDiv: 'HQ', corpCd: 'CRP01', corpNm: '본사',
    attachFile: '', composeYn: 'N', rmk: '테스트 현상원가', sts: 'T'
  });

  // 3. CC CostCode (uses costCodeSeq, not costSeq)
  const ccCostList = p.costCodes.map((cc, i) => ({
    _rowStatus: 'C', costCodeSeq: i+1, costCd: cc.cd, calcTarget: 'Y',
    prodDesc: cc.desc, currency: cc.currency, estSellPrice: cc.price,
    sopYm: cc.sopYm, eopYm: cc.eopYm, rmk: '', sts: 'Y'
  }));
  await post('/bp/cost/cc/detail/saveListCostCode.do', { ccPjtCd: p.cc, ccRev: 1, saveList: ccCostList });

  // 4. CC QtyDisc (pivoted format: yr1Qty~yr5Qty per costCd)
  const ccQtyList = p.costCodes.map(cc => {
    const row = { costCd: cc.cd };
    for (let y = 0; y < 5; y++) {
      row[`yr${y+1}Qty`] = p.qty[y];
      row[`yr${y+1}DiscRate`] = y === 0 ? 0 : y * 1.5;
    }
    return row;
  });
  await post('/bp/cost/cc/detail/saveListQtyDisc.do', { ccPjtCd: p.cc, ccRev: 1, saveList: ccQtyList });

  // 5. CC Manager
  await post('/bp/cost/cc/detail/saveListManager.do', {
    ccPjtCd: p.cc, ccRev: 1,
    saveList: [
      { _rowStatus: 'C', managerSeq: 1, deptDiv: 'PT', mgrId: 'user01', mgrNm: '김설계', roleCd: 'LEADER', email: 'kim@test.com', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', managerSeq: 2, deptDiv: 'PT', mgrId: 'user02', mgrNm: '이구매', roleCd: 'MEMBER', email: 'lee@test.com', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', managerSeq: 3, deptDiv: 'PT', mgrId: 'user03', mgrNm: '박생산', roleCd: 'MEMBER', email: 'park@test.com', rmk: '', sts: 'Y' }
    ]
  });

  // 6. CC Schedule
  await post('/bp/cost/cc/detail/saveListSchedule.do', {
    ccPjtCd: p.cc, ccRev: 1,
    saveList: [
      { _rowStatus: 'C', scheduleSeq: 1, taskNm: '설계검토', stdPeriod: 90, startDt: '2026-03-01', endDt: '2026-05-31', actEndDt: '2026-05-28', procSts: 'C', delayDays: 0, sortOrder: 1, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', scheduleSeq: 2, taskNm: '시작품 제작', stdPeriod: 90, startDt: '2026-06-01', endDt: '2026-08-31', actEndDt: '2026-09-05', procSts: 'C', delayDays: 5, sortOrder: 2, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', scheduleSeq: 3, taskNm: '시험평가', stdPeriod: 90, startDt: '2026-09-01', endDt: '2026-11-30', actEndDt: '', procSts: 'P', delayDays: 0, sortOrder: 3, rmk: '', sts: 'Y' }
    ]
  });

  // 7. CC BOM
  const ccBomList = p.bomParts.map((b, i) => ({
    _rowStatus: 'C', costCd: p.costCodes[0].cd, bomSeq: i+1,
    partNo: b.no, partNm: b.nm, partDiv: b.div,
    qty: b.qty, recvUnitYn: b.lvl === 0 ? 'Y' : 'N',
    parentSeq: b.parent, bomLevel: b.lvl, rmk: '', sts: 'Y'
  }));
  await post('/bp/cost/cc/detail/saveListBom.do', { ccPjtCd: p.cc, ccRev: 1, saveList: ccBomList });

  // 8. CC PartPrice (for leaf parts only)
  const leafParts = p.bomParts.filter(b => b.div === 'PART');
  const ppList = leafParts.map((b, i) => ({
    _rowStatus: 'C', costCd: p.costCodes[0].cd, partPriceSeq: i+1,
    partNo: b.no, partNm: b.nm, partDiv: 'PART',
    pimsCurrency: 'KRW', pimsPrice: b.price * 1.1,
    designCurrency: 'KRW', designCostPrice: b.price * 1.05,
    purchaseCurrency: 'KRW', purchaseEstPrice: b.price * 1.02,
    confirmCurrency: 'KRW', confirmedPrice: b.price,
    lossRate: 1.5, rmk: '', sts: 'Y'
  }));
  await post('/bp/cost/cc/detail/saveListPartPrice.do', { ccPjtCd: p.cc, ccRev: 1, saveList: ppList });

  // 9. CC ActEval
  const costItems = [
    { cd: 'MAT', nm: '재료비', ecAmt: p.ecCosts.mat, tgtAmt: p.tcCosts.mat, actAmt: p.ccCosts.mat },
    { cd: 'LABOR', nm: '노무비', ecAmt: p.ecCosts.labor, tgtAmt: p.tcCosts.labor, actAmt: p.ccCosts.labor },
    { cd: 'MFG', nm: '제조경비', ecAmt: p.ecCosts.mfg, tgtAmt: p.tcCosts.mfg, actAmt: p.ccCosts.mfg },
    { cd: 'SGA', nm: '판관비', ecAmt: p.ecCosts.sga, tgtAmt: p.tcCosts.sga, actAmt: p.ccCosts.sga }
  ];
  const actEvalList = costItems.map((ci, i) => {
    const saveTgt = ci.ecAmt - ci.tgtAmt;
    const saveAct = ci.ecAmt - ci.actAmt;
    const rate = saveTgt > 0 ? Math.round(saveAct / saveTgt * 10000) / 100 : (saveAct >= 0 ? 100 : 0);
    return {
      _rowStatus: 'C', evalSeq: i+1, tgtCostCd: ci.cd, costItemNm: ci.nm,
      ecAmt: ci.ecAmt, tgtAmt: ci.tgtAmt, saveTgtAmt: saveTgt,
      actAmt: ci.actAmt, saveActAmt: saveAct, achvRate: rate, achvYn: rate >= 100 ? 'Y' : 'N',
      rmk: '', sts: 'Y'
    };
  });
  await post('/bp/cost/cc/detail/saveListActEval.do', { ccPjtCd: p.cc, ccRev: 1, saveList: actEvalList });

  // 10. CC AchvEval (direct DB)
  const ecTotal = costItems.reduce((s, ci) => s + ci.ecAmt, 0);
  const tgtTotal = costItems.reduce((s, ci) => s + ci.tgtAmt, 0);
  const curTotal = costItems.reduce((s, ci) => s + ci.actAmt, 0);
  const saveTgt = ecTotal - tgtTotal;
  const saveAct = ecTotal - curTotal;
  const achvRate = saveTgt > 0 ? Math.round(saveAct / saveTgt * 10000) / 100 : 100;

  await client.query(`
    INSERT INTO PCM_CUR_ACHV_EVAL (TEN_ID, CUR_PJT_CD, EC_PJT_CD, TGT_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, EC_TOTAL_COST, TGT_TOTAL_COST, CUR_TOTAL_COST, SAVE_TGT_AMT, SAVE_ACT_AMT, ACHV_RATE, ACHV_YN, EVAL_DT, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, '2026-02-25', '통합테스트', 'T', 'testuser', NOW(), 'testuser', NOW())
  `, [T, p.cc, p.ec, p.tc, p.pjtNm, p.bizUnit, p.custNm, p.carType, ecTotal, tgtTotal, curTotal, saveTgt, saveAct, achvRate, achvRate >= 100 ? 'Y' : 'N']);

  // Also insert ACHV_EVAL_DTL
  for (let i = 0; i < costItems.length; i++) {
    const ci = costItems[i];
    const saveTgtI = ci.ecAmt - ci.tgtAmt;
    const saveActI = ci.ecAmt - ci.actAmt;
    const rate = saveTgtI > 0 ? Math.round(saveActI / saveTgtI * 10000) / 100 : (saveActI >= 0 ? 100 : 0);
    await client.query(`
      INSERT INTO PCM_CUR_ACHV_EVAL_DTL (TEN_ID, CC_PJT_CD, CC_REV, EVAL_SEQ, EVAL_TYPE, DEPT_NM, COST_ITEM_CD, COST_ITEM_NM, EC_AMT, TGT_AMT, SAVE_TGT_AMT, CUR_AMT, SAVE_ACT_AMT, ACHV_RATE, ACHV_YN, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, 1, $3, 'DEPT', '생산부', $4, $5, $6, $7, $8, $9, $10, $11, $12, '', 'Y', 'testuser', NOW(), 'testuser', NOW())
    `, [T, p.cc, i+1, ci.cd, ci.nm, ci.ecAmt, ci.tgtAmt, saveTgtI, ci.actAmt, saveActI, rate, rate >= 100 ? 'Y' : 'N']);
  }
}

async function run() {
  await client.connect();
  await client.query('SET search_path TO asyoucost, public');
  console.log('Connected. Starting test project data fill...\n');

  for (const p of projects) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${p.name} (${p.ec} / ${p.tc} / ${p.cc})`);
    console.log(`${'═'.repeat(60)}`);

    // Cleanup
    console.log('  Cleaning up existing data...');
    await cleanupProject(p);
    console.log('  Cleanup done.');

    // EC (18 tables)
    console.log('\n  --- EC Data (18 tables) ---');
    await insertEcData(p);
    console.log('  EC data inserted.');

    // TC (14 tables)
    console.log('\n  --- TC Data (14 tables) ---');
    await insertTcData(p);
    console.log('  TC data inserted.');

    // CC (9 tables + achv)
    console.log('\n  --- CC Data (9+ tables) ---');
    await insertCcData(p);
    console.log('  CC data inserted.');

    // Quick verification
    console.log('\n  --- Quick Verification ---');
    const ecCnt = await client.query(`SELECT COUNT(*) as cnt FROM PCM_EC_PJT_MSTR WHERE TEN_ID=$1 AND EC_PJT_CD=$2`, [T, p.ec]);
    const tcCnt = await client.query(`SELECT COUNT(*) as cnt FROM PCM_TGT_PJT_MSTR WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [T, p.tc]);
    const ccCnt = await client.query(`SELECT COUNT(*) as cnt FROM PCM_CUR_PJT_MSTR WHERE TEN_ID=$1 AND CC_PJT_CD=$2`, [T, p.cc]);
    const achvCnt = await client.query(`SELECT COUNT(*) as cnt FROM PCM_CUR_ACHV_EVAL WHERE TEN_ID=$1 AND CUR_PJT_CD=$2`, [T, p.cc]);
    console.log(`  EC Master: ${ecCnt.rows[0].cnt}, TC Master: ${tcCnt.rows[0].cnt}, CC Master: ${ccCnt.rows[0].cnt}, AchvEval: ${achvCnt.rows[0].cnt}`);
  }

  // Final summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  FINAL SUMMARY - ALL TEST PROJECTS');
  console.log(`${'═'.repeat(60)}`);

  for (const p of projects) {
    console.log(`\n  [${p.suffix}] ${p.pjtNm}`);
    const tables = [
      ['EC_MSTR', `SELECT COUNT(*) as cnt FROM PCM_EC_PJT_MSTR WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_DETAIL', `SELECT COUNT(*) as cnt FROM PCM_EC_DETAIL WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_COST_CODE', `SELECT COUNT(*) as cnt FROM PCM_EC_COST_CODE WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_QTY_DISC', `SELECT COUNT(*) as cnt FROM PCM_EC_QTY_DISC WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_MANAGER', `SELECT COUNT(*) as cnt FROM PCM_EC_MANAGER WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_SCHEDULE', `SELECT COUNT(*) as cnt FROM PCM_EC_SCHEDULE WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_BOM', `SELECT COUNT(*) as cnt FROM PCM_EC_BOM WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_LINE_INVEST', `SELECT COUNT(*) as cnt FROM PCM_EC_LINE_INVEST WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_OTHER_INVEST', `SELECT COUNT(*) as cnt FROM PCM_EC_OTHER_INVEST WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_MANPOWER', `SELECT COUNT(*) as cnt FROM PCM_EC_MANPOWER WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_MFG_COST', `SELECT COUNT(*) as cnt FROM PCM_EC_MFG_COST WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_SGA_COST', `SELECT COUNT(*) as cnt FROM PCM_EC_SGA_COST WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_PL_STMT', `SELECT COUNT(*) as cnt FROM PCM_EC_PL_STMT WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_SENSITIVITY', `SELECT COUNT(*) as cnt FROM PCM_EC_SENSITIVITY WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_SENSITIVITY_VAR', `SELECT COUNT(*) as cnt FROM PCM_EC_SENSITIVITY_VAR WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_FUND_PLAN', `SELECT COUNT(*) as cnt FROM PCM_EC_FUND_PLAN WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_NPV', `SELECT COUNT(*) as cnt FROM PCM_EC_NPV WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['EC_PROFIT', `SELECT COUNT(*) as cnt FROM PCM_EC_PROFIT WHERE TEN_ID='${T}' AND EC_PJT_CD='${p.ec}'`],
      ['TC_MSTR', `SELECT COUNT(*) as cnt FROM PCM_TGT_PJT_MSTR WHERE TEN_ID='${T}' AND TGT_PJT_CD='${p.tc}'`],
      ['TC_MANAGER', `SELECT COUNT(*) as cnt FROM PCM_TGT_MANAGER WHERE TEN_ID='${T}' AND TGT_PJT_CD='${p.tc}'`],
      ['TC_SPEC', `SELECT COUNT(*) as cnt FROM PCM_TGT_SPEC WHERE TEN_ID='${T}' AND TGT_PJT_CD='${p.tc}'`],
      ['TC_QTY_DISC', `SELECT COUNT(*) as cnt FROM PCM_TGT_QTY_DISC WHERE TEN_ID='${T}' AND TGT_PJT_CD='${p.tc}'`],
      ['TC_GUIDE', `SELECT COUNT(*) as cnt FROM PCM_TGT_GUIDE WHERE TEN_ID='${T}' AND TGT_PJT_CD='${p.tc}'`],
      ['TC_COST_REG', `SELECT COUNT(*) as cnt FROM PCM_TGT_COST_REG WHERE TEN_ID='${T}' AND TGT_PJT_CD='${p.tc}'`],
      ['TC_ACHV_PLAN', `SELECT COUNT(*) as cnt FROM PCM_TGT_ACHV_PLAN WHERE TEN_ID='${T}' AND TGT_PJT_CD='${p.tc}'`],
      ['TC_ACHV_PLAN_DTL', `SELECT COUNT(*) as cnt FROM PCM_TGT_ACHV_PLAN_DTL WHERE TEN_ID='${T}' AND TGT_PJT_CD='${p.tc}'`],
      ['TC_RECALC', `SELECT COUNT(*) as cnt FROM PCM_TGT_RECALC WHERE TEN_ID='${T}' AND TGT_PJT_CD='${p.tc}'`],
      ['TC_ACHV_STATUS', `SELECT COUNT(*) as cnt FROM PCM_TGT_ACHV_STATUS WHERE TEN_ID='${T}' AND TGT_PJT_CD='${p.tc}'`],
      ['CC_MSTR', `SELECT COUNT(*) as cnt FROM PCM_CUR_PJT_MSTR WHERE TEN_ID='${T}' AND CC_PJT_CD='${p.cc}'`],
      ['CC_DETAIL', `SELECT COUNT(*) as cnt FROM PCM_CUR_DETAIL WHERE TEN_ID='${T}' AND CC_PJT_CD='${p.cc}'`],
      ['CC_COST_CODE', `SELECT COUNT(*) as cnt FROM PCM_CUR_COST_CODE WHERE TEN_ID='${T}' AND CC_PJT_CD='${p.cc}'`],
      ['CC_QTY_DISC', `SELECT COUNT(*) as cnt FROM PCM_CUR_QTY_DISC WHERE TEN_ID='${T}' AND CC_PJT_CD='${p.cc}'`],
      ['CC_MANAGER', `SELECT COUNT(*) as cnt FROM PCM_CUR_MANAGER WHERE TEN_ID='${T}' AND CC_PJT_CD='${p.cc}'`],
      ['CC_SCHEDULE', `SELECT COUNT(*) as cnt FROM PCM_CUR_SCHEDULE WHERE TEN_ID='${T}' AND CC_PJT_CD='${p.cc}'`],
      ['CC_BOM', `SELECT COUNT(*) as cnt FROM PCM_CUR_BOM WHERE TEN_ID='${T}' AND CC_PJT_CD='${p.cc}'`],
      ['CC_PART_PRICE', `SELECT COUNT(*) as cnt FROM PCM_CUR_PART_PRICE WHERE TEN_ID='${T}' AND CC_PJT_CD='${p.cc}'`],
      ['CC_ACT_EVAL', `SELECT COUNT(*) as cnt FROM PCM_CUR_ACT_EVAL WHERE TEN_ID='${T}' AND CC_PJT_CD='${p.cc}'`],
      ['CC_ACHV_EVAL', `SELECT COUNT(*) as cnt FROM PCM_CUR_ACHV_EVAL WHERE TEN_ID='${T}' AND CUR_PJT_CD='${p.cc}'`],
      ['CC_ACHV_EVAL_DTL', `SELECT COUNT(*) as cnt FROM PCM_CUR_ACHV_EVAL_DTL WHERE TEN_ID='${T}' AND CC_PJT_CD='${p.cc}'`],
    ];

    const results = [];
    for (const [name, sql] of tables) {
      try {
        const res = await client.query(sql);
        const cnt = parseInt(res.rows[0].cnt);
        results.push(`${name}=${cnt}`);
      } catch(e) {
        results.push(`${name}=ERR`);
      }
    }
    // Print in groups
    const ecR = results.filter(r => r.startsWith('EC_'));
    const tcR = results.filter(r => r.startsWith('TC_'));
    const ccR = results.filter(r => r.startsWith('CC_'));
    console.log(`    EC: ${ecR.join(', ')}`);
    console.log(`    TC: ${tcR.join(', ')}`);
    console.log(`    CC: ${ccR.join(', ')}`);
  }

  await client.end();
  console.log('\nStep 6 complete!');
}

run().catch(e => { console.error('ERROR:', e); client.end(); process.exit(1); });
