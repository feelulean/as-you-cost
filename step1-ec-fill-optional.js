/**
 * Step 1: EC20260006 - Fill all NULL optional columns
 * Direct DB UPDATE/INSERT to ensure every column has meaningful data
 */
const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432, database: 'postgres',
  user: 'postgres.zxenhxqhfglorxgibmrz',
  password: 'admin1004!@#$',
  ssl: { rejectUnauthorized: false },
  options: '-c search_path=asyoucost,public'
});

const T = 'T001';
const EC = 'EC20260006';

async function run() {
  await client.connect();
  await client.query('SET search_path TO asyoucost, public');
  console.log('Connected. Starting EC20260006 optional column fill...\n');

  // ================================================================
  // 1-1. EC Detail - fill NULL optional columns
  // ================================================================
  console.log('=== 1-1. EC Detail - UPDATE NULL columns ===');
  await client.query(`
    UPDATE PCM_EC_DETAIL SET
      FACTORY_CD = COALESCE(FACTORY_CD, 'FAC01'),
      CORP_TYPE = COALESCE(CORP_TYPE, 'HQ'),
      CORP_CD = COALESCE(CORP_CD, 'CRP01'),
      ORDER_PROB = COALESCE(ORDER_PROB, 'HIGH'),
      ORDER_REASON = COALESCE(ORDER_REASON, '기존 거래선 연장 수주'),
      COMPETITOR = COALESCE(COMPETITOR, '한국전동/DY오토'),
      DEV_POSS = COALESCE(DEV_POSS, 'HIGH'),
      RMK = COALESCE(RMK, 'EV 전동축 견적 - GV80 플랫폼'),
      MODR_ID = 'testuser', MOD_DTTM = NOW()
    WHERE TEN_ID = $1 AND EC_PJT_CD = $2
  `, [T, EC]);
  console.log('  EC Detail updated');

  // ================================================================
  // 1-2. EC Cost Code - fill optional columns
  // ================================================================
  console.log('\n=== 1-2. EC Cost Code - UPDATE NULL columns ===');
  const costCodes = [
    { cd: 'COST01', prodGrp: 'TM', costGrp: 'DRIVE', costGrpDesc: '구동축 계열', estCurr: 'KRW', mktCurr: 'USD', mktPrice: 78.5 },
    { cd: 'COST02', prodGrp: 'AXLE', costGrp: 'EAXLE', costGrpDesc: '전자액슬 계열', estCurr: 'KRW', mktCurr: 'USD', mktPrice: 80.2 },
    { cd: 'COST03', prodGrp: 'SEAT', costGrp: 'SEAT', costGrpDesc: '시트모듈 계열', estCurr: 'KRW', mktCurr: 'USD', mktPrice: 64.1 }
  ];
  for (const cc of costCodes) {
    await client.query(`
      UPDATE PCM_EC_COST_CODE SET
        PROD_GRP = COALESCE(PROD_GRP, $3),
        COST_GRP = COALESCE(COST_GRP, $4),
        COST_GRP_DESC = COALESCE(COST_GRP_DESC, $5),
        EST_CURRENCY = COALESCE(EST_CURRENCY, $6),
        MKT_CURRENCY = COALESCE(MKT_CURRENCY, $7),
        MKT_PRICE = COALESCE(MKT_PRICE, $8),
        MODR_ID = 'testuser', MOD_DTTM = NOW()
      WHERE TEN_ID = $1 AND EC_PJT_CD = $2 AND COST_CD = $9
    `, [T, EC, cc.prodGrp, cc.costGrp, cc.costGrpDesc, cc.estCurr, cc.mktCurr, cc.mktPrice, cc.cd]);
  }
  console.log('  3 cost codes updated');

  // ================================================================
  // 1-3. EC Manager - ensure 3 managers with all fields filled
  // ================================================================
  console.log('\n=== 1-3. EC Manager - UPSERT managers ===');
  const existMgr = await client.query(`SELECT SEQ_NO FROM PCM_EC_MANAGER WHERE TEN_ID=$1 AND EC_PJT_CD=$2 ORDER BY SEQ_NO`, [T, EC]);
  console.log(`  Current managers: ${existMgr.rows.length} (seq: ${existMgr.rows.map(r => r.seq_no).join(',')})`);

  const managers = [
    { seq: 1, dept: 'PT', userId: 'user01', userNm: '김설계', role: 'LEADER', email: 'kim@test.com' },
    { seq: 2, dept: 'PT', userId: 'user02', userNm: '이구매', role: 'MEMBER', email: 'lee@test.com' },
    { seq: 3, dept: 'PT', userId: 'user03', userNm: '박품질', role: 'MEMBER', email: 'park@test.com' }
  ];
  const existingSeqs = new Set(existMgr.rows.map(r => r.seq_no));
  for (const m of managers) {
    if (existingSeqs.has(m.seq)) {
      await client.query(`
        UPDATE PCM_EC_MANAGER SET
          DEPT_TYPE = COALESCE(DEPT_TYPE, $3), USER_ID = COALESCE(USER_ID, $4),
          USER_NM = COALESCE(USER_NM, $5), ROLE_TYPE = COALESCE(ROLE_TYPE, $6),
          EMAIL = COALESCE(EMAIL, $7), MODR_ID = 'testuser', MOD_DTTM = NOW()
        WHERE TEN_ID = $1 AND EC_PJT_CD = $2 AND SEQ_NO = $8
      `, [T, EC, m.dept, m.userId, m.userNm, m.role, m.email, m.seq]);
      console.log(`  Updated manager #${m.seq}: ${m.userNm}`);
    } else {
      await client.query(`
        INSERT INTO PCM_EC_MANAGER (TEN_ID, EC_PJT_CD, SEQ_NO, DEPT_TYPE, USER_ID, USER_NM, ROLE_TYPE, EMAIL, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'testuser', NOW(), 'testuser', NOW())
      `, [T, EC, m.seq, m.dept, m.userId, m.userNm, m.role, m.email]);
      console.log(`  Inserted manager #${m.seq}: ${m.userNm}`);
    }
  }

  // ================================================================
  // 1-4. EC Schedule - fill actual_end_dt / delay_days
  // ================================================================
  console.log('\n=== 1-4. EC Schedule - UPDATE actual dates ===');
  await client.query(`
    UPDATE PCM_EC_SCHEDULE SET
      ACTUAL_END_DT = COALESCE(ACTUAL_END_DT, END_DT),
      DELAY_DAYS = COALESCE(DELAY_DAYS, 0),
      MODR_ID = 'testuser', MOD_DTTM = NOW()
    WHERE TEN_ID = $1 AND EC_PJT_CD = $2
  `, [T, EC]);
  // Make the second schedule slightly delayed
  await client.query(`
    UPDATE PCM_EC_SCHEDULE SET
      ACTUAL_END_DT = TO_CHAR(TO_DATE(END_DT, 'YYYY-MM-DD') + INTERVAL '3 days', 'YYYY-MM-DD'),
      DELAY_DAYS = 3
    WHERE TEN_ID = $1 AND EC_PJT_CD = $2 AND SORT_NO = 2
  `, [T, EC]);
  console.log('  Schedule dates updated');

  // ================================================================
  // 1-5. EC Line Invest - fill optional columns
  // ================================================================
  console.log('\n=== 1-5. EC Line Invest - UPDATE optional columns ===');
  await client.query(`
    UPDATE PCM_EC_LINE_INVEST SET
      PROCESS_TYPE = COALESCE(PROCESS_TYPE, 'ASSY'),
      ACQ_CURRENCY = COALESCE(ACQ_CURRENCY, 'KRW'),
      DEPR_START_YM = COALESCE(DEPR_START_YM, '202701'),
      CAPA_QTY = COALESCE(CAPA_QTY, 50000),
      AVAIL_RATE = COALESCE(AVAIL_RATE, 90),
      USE_RATE = COALESCE(USE_RATE, 85),
      USEFUL_LIFE = COALESCE(USEFUL_LIFE, 10),
      RMK = COALESCE(RMK, '전동축 조립라인 투자'),
      MODR_ID = 'testuser', MOD_DTTM = NOW()
    WHERE TEN_ID = $1 AND EC_PJT_CD = $2
  `, [T, EC]);
  console.log('  Line invest updated');

  // ================================================================
  // 1-6. EC Other Invest - fill optional columns
  // ================================================================
  console.log('\n=== 1-6. EC Other Invest - UPDATE optional columns ===');
  const otherInvests = [
    { seq: 1, invNm: '공장건물 증축', invType: 'BUILD', currency: 'KRW', deprType: 'SL', usefulLife: 30, acqYear: 2026, deprStartYm: '202607', availRate: 95, useRate: 90, rmk: '조립동 증축' },
    { seq: 2, invNm: '부지 매입', invType: 'LAND', currency: 'KRW', deprType: 'NONE', usefulLife: 0, acqYear: 2026, deprStartYm: '', availRate: 100, useRate: 100, rmk: '생산부지' },
    { seq: 3, invNm: '시험장비', invType: 'ETC', currency: 'KRW', deprType: 'SL', usefulLife: 7, acqYear: 2026, deprStartYm: '202609', availRate: 85, useRate: 80, rmk: 'EOL/내구시험기' },
    { seq: 4, invNm: 'R&D 장비', invType: 'RND', currency: 'KRW', deprType: 'SL', usefulLife: 5, acqYear: 2026, deprStartYm: '202604', availRate: 90, useRate: 85, rmk: 'NVH분석 장비' }
  ];
  for (const inv of otherInvests) {
    await client.query(`
      UPDATE PCM_EC_OTHER_INVEST SET
        INVEST_NM = COALESCE(INVEST_NM, $3),
        INVEST_TYPE = COALESCE(INVEST_TYPE, $4),
        CURRENCY = COALESCE(CURRENCY, $5),
        DEPR_TYPE = COALESCE(DEPR_TYPE, $6),
        USEFUL_LIFE = COALESCE(USEFUL_LIFE, $7),
        ACQ_YEAR = COALESCE(ACQ_YEAR, $8),
        DEPR_START_YM = COALESCE(DEPR_START_YM, $9),
        AVAIL_RATE = COALESCE(AVAIL_RATE, $10),
        USE_RATE = COALESCE(USE_RATE, $11),
        RMK = COALESCE(RMK, $12),
        MODR_ID = 'testuser', MOD_DTTM = NOW()
      WHERE TEN_ID = $1 AND EC_PJT_CD = $2 AND INVEST_SEQ = $13
    `, [T, EC, inv.invNm, inv.invType, inv.currency, inv.deprType, inv.usefulLife, inv.acqYear, inv.deprStartYm, inv.availRate, inv.useRate, inv.rmk, inv.seq]);
  }
  console.log('  4 other investments updated');

  // ================================================================
  // 1-7. EC Manpower - fill Y1~Y7_CNT
  // ================================================================
  console.log('\n=== 1-7. EC Manpower - UPDATE year counts ===');
  const mpData = [
    { seq: 1, type: 'DIRECT', nm: '직접인원', process: 'ASSY', currency: 'KRW', salary: 45000000, y: [10, 12, 15, 15, 12, 10, 8] },
    { seq: 2, type: 'INDIRECT', nm: '간접인원', process: 'SUPPORT', currency: 'KRW', salary: 50000000, y: [5, 6, 7, 7, 6, 5, 4] },
    { seq: 3, type: 'SGA', nm: '판관인원', process: 'ADMIN', currency: 'KRW', salary: 55000000, y: [3, 3, 4, 4, 3, 3, 2] }
  ];
  for (const mp of mpData) {
    await client.query(`
      UPDATE PCM_EC_MANPOWER SET
        MP_TYPE = COALESCE(MP_TYPE, $3),
        MP_NM = COALESCE(MP_NM, $4),
        PROCESS_TYPE = COALESCE(PROCESS_TYPE, $5),
        CURRENCY = COALESCE(CURRENCY, $6),
        AVG_SALARY = COALESCE(AVG_SALARY, $7),
        Y1_CNT = COALESCE(Y1_CNT, $8),
        Y2_CNT = COALESCE(Y2_CNT, $9),
        Y3_CNT = COALESCE(Y3_CNT, $10),
        Y4_CNT = COALESCE(Y4_CNT, $11),
        Y5_CNT = COALESCE(Y5_CNT, $12),
        Y6_CNT = COALESCE(Y6_CNT, $13),
        Y7_CNT = COALESCE(Y7_CNT, $14),
        MODR_ID = 'testuser', MOD_DTTM = NOW()
      WHERE TEN_ID = $1 AND EC_PJT_CD = $2 AND MP_SEQ = $15
    `, [T, EC, mp.type, mp.nm, mp.process, mp.currency, mp.salary,
        mp.y[0], mp.y[1], mp.y[2], mp.y[3], mp.y[4], mp.y[5], mp.y[6], mp.seq]);
  }
  console.log('  3 manpower rows updated with Y1~Y7');

  // ================================================================
  // 1-8. EC MFG Cost - fill all rate/amount columns
  // ================================================================
  console.log('\n=== 1-8. EC MFG Cost - UPDATE all columns ===');
  const mfgData = [
    { cd: 'COST01', wageRate: 3.5, priceRate: 2.0, prodRate: 12.5, laborRate: 8.0, otherRate: 5.0,
      moldCost: 15000, outsrcCost: 8000, outsrcRate: 7.6, directLabor: 3500, indirectLabor: 1800,
      prodExp: 6200, laborExp: 4000, otherMfgExp: 2500, deprBuild: 1200, deprLine: 3500, deprOther: 800,
      rndCost: 2000, otherExp: 1500 },
    { cd: 'COST02', wageRate: 3.5, priceRate: 2.0, prodRate: 11.0, laborRate: 7.5, otherRate: 4.5,
      moldCost: 18000, outsrcCost: 12000, outsrcRate: 11.2, directLabor: 4200, indirectLabor: 2100,
      prodExp: 5800, laborExp: 3800, otherMfgExp: 2300, deprBuild: 1400, deprLine: 4000, deprOther: 950,
      rndCost: 2500, otherExp: 1800 },
    { cd: 'COST03', wageRate: 3.5, priceRate: 2.0, prodRate: 10.5, laborRate: 7.0, otherRate: 4.0,
      moldCost: 12000, outsrcCost: 6000, outsrcRate: 7.0, directLabor: 2800, indirectLabor: 1400,
      prodExp: 4500, laborExp: 3000, otherMfgExp: 1800, deprBuild: 900, deprLine: 2800, deprOther: 600,
      rndCost: 1500, otherExp: 1200 }
  ];
  for (const m of mfgData) {
    const totalMfg = m.directLabor + m.indirectLabor + m.prodExp + m.laborExp + m.otherMfgExp +
                     m.deprBuild + m.deprLine + m.deprOther + m.rndCost + m.otherExp + m.moldCost + m.outsrcCost;
    await client.query(`
      UPDATE PCM_EC_MFG_COST SET
        WAGE_RAISE_RATE = COALESCE(WAGE_RAISE_RATE, $3),
        PRICE_RAISE_RATE = COALESCE(PRICE_RAISE_RATE, $4),
        PROD_DIRECT_RATE = COALESCE(PROD_DIRECT_RATE, $5),
        LABOR_COST_RATE = COALESCE(LABOR_COST_RATE, $6),
        OTHER_MFG_RATE = COALESCE(OTHER_MFG_RATE, $7),
        MOLD_COST = COALESCE(MOLD_COST, $8),
        OUTSRC_COST = COALESCE(OUTSRC_COST, $9),
        OUTSRC_RATE = COALESCE(OUTSRC_RATE, $10),
        DIRECT_LABOR = COALESCE(DIRECT_LABOR, $11),
        INDIRECT_LABOR = COALESCE(INDIRECT_LABOR, $12),
        PROD_DIRECT_EXP = COALESCE(PROD_DIRECT_EXP, $13),
        LABOR_RELATED_EXP = COALESCE(LABOR_RELATED_EXP, $14),
        OTHER_MFG_EXP = COALESCE(OTHER_MFG_EXP, $15),
        DEPR_BUILDING = COALESCE(DEPR_BUILDING, $16),
        DEPR_LINE = COALESCE(DEPR_LINE, $17),
        DEPR_OTHER = COALESCE(DEPR_OTHER, $18),
        RND_COST = COALESCE(RND_COST, $19),
        OTHER_EXP = COALESCE(OTHER_EXP, $20),
        TOTAL_MFG_COST = COALESCE(TOTAL_MFG_COST, $21),
        MODR_ID = 'testuser', MOD_DTTM = NOW()
      WHERE TEN_ID = $1 AND EC_PJT_CD = $2 AND COST_CD = $22
    `, [T, EC, m.wageRate, m.priceRate, m.prodRate, m.laborRate, m.otherRate,
        m.moldCost, m.outsrcCost, m.outsrcRate, m.directLabor, m.indirectLabor,
        m.prodExp, m.laborExp, m.otherMfgExp, m.deprBuild, m.deprLine, m.deprOther,
        m.rndCost, m.otherExp, totalMfg, m.cd]);
  }
  console.log('  3 MFG cost rows updated');

  // ================================================================
  // 1-9. EC SGA Cost - fill all rate columns
  // ================================================================
  console.log('\n=== 1-9. EC SGA Cost - UPDATE all columns ===');
  const sgaData = [
    { cd: 'COST01', salesLabor: 2.5, transport: 1.2, export: 0.8, warranty: 1.5, advert: 0.5, research: 1.0, asset: 0.3, personnel: 1.5, other: 0.7 },
    { cd: 'COST02', salesLabor: 2.8, transport: 1.4, export: 0.9, warranty: 1.8, advert: 0.6, research: 1.2, asset: 0.4, personnel: 1.6, other: 0.8 },
    { cd: 'COST03', salesLabor: 2.2, transport: 1.0, export: 0.6, warranty: 1.2, advert: 0.4, research: 0.8, asset: 0.2, personnel: 1.3, other: 0.5 }
  ];
  for (const s of sgaData) {
    const totalSga = s.salesLabor + s.transport + s.export + s.warranty + s.advert + s.research + s.asset + s.personnel + s.other;
    await client.query(`
      UPDATE PCM_EC_SGA_COST SET
        SALES_LABOR_RATE = COALESCE(SALES_LABOR_RATE, $3),
        TRANSPORT_RATE = COALESCE(TRANSPORT_RATE, $4),
        EXPORT_RATE = COALESCE(EXPORT_RATE, $5),
        WARRANTY_RATE = COALESCE(WARRANTY_RATE, $6),
        ADVERTISING_RATE = COALESCE(ADVERTISING_RATE, $7),
        RESEARCH_RATE = COALESCE(RESEARCH_RATE, $8),
        ASSET_RATE = COALESCE(ASSET_RATE, $9),
        PERSONNEL_RATE = COALESCE(PERSONNEL_RATE, $10),
        OTHER_RATE = COALESCE(OTHER_RATE, $11),
        TOTAL_SGA_COST = COALESCE(TOTAL_SGA_COST, $12),
        MODR_ID = 'testuser', MOD_DTTM = NOW()
      WHERE TEN_ID = $1 AND EC_PJT_CD = $2 AND COST_CD = $13
    `, [T, EC, s.salesLabor, s.transport, s.export, s.warranty, s.advert, s.research, s.asset, s.personnel, s.other, totalSga, s.cd]);
  }
  console.log('  3 SGA cost rows updated');

  // ================================================================
  // 1-10. EC BOM - fill new_part_yn and rmk
  // ================================================================
  console.log('\n=== 1-10. EC BOM - UPDATE optional columns ===');
  await client.query(`
    UPDATE PCM_EC_BOM SET
      NEW_PART_YN = COALESCE(NEW_PART_YN, 'N'),
      RMK = COALESCE(RMK, ''),
      MODR_ID = 'testuser', MOD_DTTM = NOW()
    WHERE TEN_ID = $1 AND EC_PJT_CD = $2
  `, [T, EC]);
  // Mark a few parts as new
  await client.query(`
    UPDATE PCM_EC_BOM SET NEW_PART_YN = 'Y'
    WHERE TEN_ID = $1 AND EC_PJT_CD = $2 AND LVL = 1
  `, [T, EC]);
  console.log('  BOM optional columns updated');

  // ================================================================
  // 1-11. EC Sensitivity / Sensitivity Var - fill optional columns
  // ================================================================
  console.log('\n=== 1-11. EC Sensitivity - UPDATE optional columns ===');
  await client.query(`
    UPDATE PCM_EC_SENSITIVITY SET
      SENS_NM = COALESCE(SENS_NM, '기본 민감도 분석'),
      END_YN = COALESCE(END_YN, 'N'),
      MODR_ID = 'testuser', MOD_DTTM = NOW()
    WHERE TEN_ID = $1 AND EC_PJT_CD = $2
  `, [T, EC]);
  await client.query(`
    UPDATE PCM_EC_SENSITIVITY_VAR SET
      VAR_NM = COALESCE(VAR_NM, '판매단가 변동'),
      BEFORE_VAL = COALESCE(BEFORE_VAL, '105000'),
      AFTER_VAL = COALESCE(AFTER_VAL, '100000'),
      YEAR_VAL = COALESCE(YEAR_VAL, '1'),
      COST_CD = COALESCE(COST_CD, 'COST01'),
      MODR_ID = 'testuser', MOD_DTTM = NOW()
    WHERE TEN_ID = $1 AND EC_PJT_CD = $2
  `, [T, EC]);
  console.log('  Sensitivity data updated');

  // ================================================================
  // 1-12. EC Fund Plan - fill Y1~Y7_AMT
  // ================================================================
  console.log('\n=== 1-12. EC Fund Plan - UPDATE year amounts ===');
  await client.query(`
    UPDATE PCM_EC_FUND_PLAN SET
      SOURCE_TYPE = COALESCE(SOURCE_TYPE, 'EQUITY'),
      INTEREST_RATE = COALESCE(INTEREST_RATE, 0),
      CURRENCY = COALESCE(CURRENCY, 'KRW'),
      Y1_AMT = COALESCE(Y1_AMT, 2000000000),
      Y2_AMT = COALESCE(Y2_AMT, 1500000000),
      Y3_AMT = COALESCE(Y3_AMT, 1000000000),
      Y4_AMT = COALESCE(Y4_AMT, 500000000),
      Y5_AMT = COALESCE(Y5_AMT, 500000000),
      Y6_AMT = COALESCE(Y6_AMT, 300000000),
      Y7_AMT = COALESCE(Y7_AMT, 200000000),
      MODR_ID = 'testuser', MOD_DTTM = NOW()
    WHERE TEN_ID = $1 AND EC_PJT_CD = $2
  `, [T, EC]);
  console.log('  Fund plan Y1~Y7 updated');

  // ================================================================
  // 1-13. EC NPV - fill all analysis values
  // ================================================================
  console.log('\n=== 1-13. EC NPV - UPDATE analysis values ===');
  await client.query(`
    UPDATE PCM_EC_NPV SET
      ANALYSIS_TYPE = COALESCE(ANALYSIS_TYPE, 'STD'),
      WACC_RATE = COALESCE(WACC_RATE, 8.5),
      NPV_VAL = COALESCE(NPV_VAL, 1500000000),
      IRR_VAL = COALESCE(IRR_VAL, 15.3),
      PAYBACK_PERIOD = COALESCE(PAYBACK_PERIOD, 4.2),
      PI_VAL = COALESCE(PI_VAL, 1.35),
      MODR_ID = 'testuser', MOD_DTTM = NOW()
    WHERE TEN_ID = $1 AND EC_PJT_CD = $2
  `, [T, EC]);
  console.log('  NPV analysis updated');

  // ================================================================
  // 1-14. EC Profit - fill all financial indicator columns
  // ================================================================
  console.log('\n=== 1-14. EC Profit - UPDATE financial indicators ===');
  await client.query(`
    UPDATE PCM_EC_PROFIT SET
      MAT_COST = COALESCE(MAT_COST, 420),
      LABOR_COST = COALESCE(LABOR_COST, 37.5),
      MFG_COST = COALESCE(MFG_COST, 18.17),
      SGA_COST = COALESCE(SGA_COST, 6.125),
      TOTAL_ESTM_COST = COALESCE(TOTAL_ESTM_COST, 481.795),
      KD_RATE = COALESCE(KD_RATE, 4.5),
      TAX_RATE = COALESCE(TAX_RATE, 22),
      DEBT_AMT = COALESCE(DEBT_AMT, 3000000000),
      EQUITY_AMT = COALESCE(EQUITY_AMT, 5000000000),
      RF_RATE = COALESCE(RF_RATE, 3.5),
      ERM_RATE = COALESCE(ERM_RATE, 6.0),
      BETA_VAL = COALESCE(BETA_VAL, 1.1),
      KE_RATE = COALESCE(KE_RATE, 10.1),
      WACC_RATE = COALESCE(WACC_RATE, 5.62),
      RMK = COALESCE(RMK, 'EV 전동축 수익성 분석'),
      MODR_ID = 'testuser', MOD_DTTM = NOW()
    WHERE TEN_ID = $1 AND EC_PJT_CD = $2
  `, [T, EC]);
  console.log('  Profit indicators updated');

  // ================================================================
  // Verification
  // ================================================================
  console.log('\n========================================');
  console.log('  EC20260006 UPDATE VERIFICATION');
  console.log('========================================');

  const tables = [
    ['EC_DETAIL', `SELECT * FROM PCM_EC_DETAIL WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}'`],
    ['EC_COST_CODE', `SELECT COST_CD, PROD_GRP, COST_GRP, EST_CURRENCY, MKT_CURRENCY, MKT_PRICE FROM PCM_EC_COST_CODE WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}'`],
    ['EC_MANAGER', `SELECT SEQ_NO, USER_NM, ROLE_TYPE, EMAIL FROM PCM_EC_MANAGER WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}' ORDER BY SEQ_NO`],
    ['EC_SCHEDULE', `SELECT TASK_NM, ACTUAL_END_DT, DELAY_DAYS FROM PCM_EC_SCHEDULE WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}' ORDER BY SORT_NO`],
    ['EC_LINE_INVEST', `SELECT PROCESS_TYPE, ACQ_CURRENCY, CAPA_QTY, AVAIL_RATE, USE_RATE, USEFUL_LIFE FROM PCM_EC_LINE_INVEST WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}'`],
    ['EC_OTHER_INVEST', `SELECT INVEST_SEQ, INVEST_NM, INVEST_TYPE, USEFUL_LIFE, AVAIL_RATE FROM PCM_EC_OTHER_INVEST WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}' ORDER BY INVEST_SEQ`],
    ['EC_MANPOWER', `SELECT MP_SEQ, MP_NM, Y1_CNT, Y3_CNT, Y5_CNT, Y7_CNT FROM PCM_EC_MANPOWER WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}' ORDER BY MP_SEQ`],
    ['EC_MFG_COST', `SELECT COST_CD, WAGE_RAISE_RATE, TOTAL_MFG_COST FROM PCM_EC_MFG_COST WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}' ORDER BY COST_CD`],
    ['EC_SGA_COST', `SELECT COST_CD, SALES_LABOR_RATE, TOTAL_SGA_COST FROM PCM_EC_SGA_COST WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}' ORDER BY COST_CD`],
    ['EC_BOM', `SELECT ITEM_CD, NEW_PART_YN FROM PCM_EC_BOM WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}' ORDER BY ITEM_CD LIMIT 5`],
    ['EC_SENSITIVITY', `SELECT SENS_NM, END_YN FROM PCM_EC_SENSITIVITY WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}'`],
    ['EC_FUND_PLAN', `SELECT Y1_AMT, Y3_AMT, Y5_AMT, Y7_AMT FROM PCM_EC_FUND_PLAN WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}'`],
    ['EC_NPV', `SELECT WACC_RATE, NPV_VAL, IRR_VAL, PAYBACK_PERIOD, PI_VAL FROM PCM_EC_NPV WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}'`],
    ['EC_PROFIT', `SELECT MAT_COST, LABOR_COST, TOTAL_ESTM_COST, WACC_RATE, BETA_VAL FROM PCM_EC_PROFIT WHERE TEN_ID='${T}' AND EC_PJT_CD='${EC}'`],
  ];

  for (const [name, sql] of tables) {
    const res = await client.query(sql);
    const nullCols = [];
    if (res.rows.length > 0) {
      for (const [k, v] of Object.entries(res.rows[0])) {
        if (v === null) nullCols.push(k);
      }
    }
    console.log(`  ${name}: ${res.rows.length} rows${nullCols.length > 0 ? ' | STILL NULL: ' + nullCols.join(', ') : ' | ALL FILLED'}`);
  }

  await client.end();
  console.log('\nStep 1 complete!');
}

run().catch(e => { console.error('ERROR:', e); client.end(); process.exit(1); });
