/**
 * YHJY As-You-Cost 통합 테스트 데이터 생성 스크립트
 * 3개 테스트 케이스: TC_SUCCESS, TC_RISK, TC_MIXED
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
const NOW = 'NOW()';

async function run() {
  await client.connect();
  await client.query('SET search_path TO asyoucost, public');
  console.log('Connected to PostgreSQL (schema: asyoucost)');

  // ── 기존 테스트 데이터 정리 ──
  const testPjts = {
    ec: ["'EC_TC_S01'", "'EC_TC_R01'", "'EC_TC_M01'"],
    tc: ["'TC_S01'", "'TC_R01'", "'TC_M01'"],
    cc: ["'CC_S01'", "'CC_R01'", "'CC_M01'"]
  };

  console.log('Cleaning up existing test data...');
  // CC 자식 → 부모
  for (const cc of testPjts.cc) {
    await client.query(`DELETE FROM PCM_CUR_ACHV_EVAL_DTL WHERE TEN_ID='${TEN}' AND CC_PJT_CD=${cc}`);
    await client.query(`DELETE FROM PCM_CUR_DIFF_ANALYSIS WHERE TEN_ID='${TEN}' AND CC_PJT_CD=${cc}`);
    await client.query(`DELETE FROM PCM_CUR_PL_STMT WHERE TEN_ID='${TEN}' AND CC_PJT_CD=${cc}`);
    await client.query(`DELETE FROM PCM_CUR_SGA_COST WHERE TEN_ID='${TEN}' AND CC_PJT_CD=${cc}`);
    await client.query(`DELETE FROM PCM_CUR_MFG_COST WHERE TEN_ID='${TEN}' AND CC_PJT_CD=${cc}`);
    await client.query(`DELETE FROM PCM_CUR_QTY_DISC WHERE TEN_ID='${TEN}' AND CC_PJT_CD=${cc}`);
    await client.query(`DELETE FROM PCM_CUR_COST_CODE WHERE TEN_ID='${TEN}' AND CC_PJT_CD=${cc}`);
    await client.query(`DELETE FROM PCM_CUR_DETAIL WHERE TEN_ID='${TEN}' AND CC_PJT_CD=${cc}`);
  }
  for (const tc of testPjts.tc) {
    await client.query(`DELETE FROM PCM_TGT_COST_REG WHERE TEN_ID='${TEN}' AND TGT_PJT_CD=${tc}`);
  }
  // CC 마스터
  for (const cc of testPjts.cc) {
    await client.query(`DELETE FROM PCM_CUR_ACHV_EVAL WHERE TEN_ID='${TEN}' AND CUR_PJT_CD=${cc}`);
    await client.query(`DELETE FROM PCM_CUR_PJT_MSTR WHERE TEN_ID='${TEN}' AND CC_PJT_CD=${cc}`);
  }
  // TC 마스터
  for (const tc of testPjts.tc) {
    await client.query(`DELETE FROM PCM_TGT_PJT_MSTR WHERE TEN_ID='${TEN}' AND TGT_PJT_CD=${tc}`);
  }
  // EC 마스터
  for (const ec of testPjts.ec) {
    await client.query(`DELETE FROM PCM_EC_PL_STMT WHERE TEN_ID='${TEN}' AND EC_PJT_CD=${ec}`);
    await client.query(`DELETE FROM PCM_EC_PJT_MSTR WHERE TEN_ID='${TEN}' AND EC_PJT_CD=${ec}`);
  }

  console.log('Cleanup done. Inserting test data...');

  // ================================================================
  // EC 공통 원가 구조 (3개 케이스 동일한 EC 기준 원가)
  // 매출액: 500,000 / 재료비: 200,000 / 노무비: 50,000
  // 제조경비: 100,000 / 판관비: 50,000 / 영업이익: 100,000
  // ================================================================

  const cases = [
    {
      name: 'Case 1: 원가 혁신 성공',
      ec: 'EC_TC_S01', tc: 'TC_S01', cc: 'CC_S01',
      ecNm: '[TEST] Case1 원가혁신 성공 - EC',
      tcNm: '[TEST] Case1 원가혁신 성공 - TC',
      ccNm: '[TEST] Case1 원가혁신 성공 - CC',
      // TC 목표: 전체 10% 절감 (재료비 -7%p, 제조경비 -3%p)
      tc_mat: 172000, tc_labor: 50000, tc_mfg: 88000, tc_sga: 50000,
      // CC 실제: 전체 12% 절감 (재료비 -8%p, 제조경비 -4%p)
      cc_mat: 168000, cc_labor: 50000, cc_mfg: 84000, cc_sga: 50000
    },
    {
      name: 'Case 2: 환율 리스크',
      ec: 'EC_TC_R01', tc: 'TC_R01', cc: 'CC_R01',
      ecNm: '[TEST] Case2 환율리스크 - EC',
      tcNm: '[TEST] Case2 환율리스크 - TC',
      ccNm: '[TEST] Case2 환율리스크 - CC',
      // TC 목표: 전체 5% 절감
      tc_mat: 190000, tc_labor: 50000, tc_mfg: 95000, tc_sga: 45000,
      // CC 실제: 환율 15% 급등 → 원가 10% 상승
      cc_mat: 230000, cc_labor: 55000, cc_mfg: 110000, cc_sga: 45000
    },
    {
      name: 'Case 3: 재료비 선방 vs 노무비/경비 폭증',
      ec: 'EC_TC_M01', tc: 'TC_M01', cc: 'CC_M01',
      ecNm: '[TEST] Case3 혼합 - EC',
      tcNm: '[TEST] Case3 혼합 - TC',
      ccNm: '[TEST] Case3 혼합 - CC',
      // TC 목표: 항목별 균형 5% 절감
      tc_mat: 190000, tc_labor: 47500, tc_mfg: 95000, tc_sga: 47500,
      // CC 실제: 재료비 -5% 달성, 노무비 +20%, 제조경비 +15%
      cc_mat: 190000, cc_labor: 60000, cc_mfg: 115000, cc_sga: 47500
    }
  ];

  // EC 공통 원가
  const EC_SALES = 500000;
  const EC_MAT = 200000;
  const EC_LABOR = 50000;
  const EC_MFG = 100000;
  const EC_SGA = 50000;
  const EC_PROFIT = EC_SALES - EC_MAT - EC_LABOR - EC_MFG - EC_SGA; // 100,000
  const QTY = 10000; // 연간 수량

  for (const c of cases) {
    console.log(`\n── ${c.name} ──`);

    // ============================================================
    // 1. EC 프로젝트 마스터
    // ============================================================
    await client.query(`
      INSERT INTO PCM_EC_PJT_MSTR (TEN_ID, EC_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP, PROD_QTY, SOP_DT, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, $3, 'SEAT', '테스트고객', 'TEST-CAR', 'TEST-OEM', '시트', $4, '2026-06', '통합테스트', 'P', 'testuser', NOW(), 'testuser', NOW())
    `, [TEN, c.ec, c.ecNm, QTY * 5]);
    console.log(`  EC project created: ${c.ec}`);

    // ============================================================
    // 2. EC P&L Statement (VIEW_TYPE='PJT', 5개년)
    // ============================================================
    for (let yr = 1; yr <= 5; yr++) {
      const yearVal = String(yr);
      await client.query(`
        INSERT INTO PCM_EC_PL_STMT (TEN_ID, EC_PJT_CD, VIEW_TYPE, VIEW_KEY, YEAR_VAL,
          SALES_AMT, MAT_COST, LABOR_COST, MFG_COST, TOTAL_MFG_COST, GROSS_PROFIT, SGA_COST, OPER_INCOME, OPER_MARGIN,
          REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
        VALUES ($1, $2, 'PJT', $2, $3,
          $4, $5, $6, $7, $8, $9, $10, $11, $12,
          'testuser', NOW(), 'testuser', NOW())
      `, [TEN, c.ec, yearVal,
          EC_SALES * QTY, EC_MAT * QTY, EC_LABOR * QTY, EC_MFG * QTY,
          (EC_MAT + EC_LABOR + EC_MFG) * QTY,
          (EC_SALES - EC_MAT - EC_LABOR - EC_MFG) * QTY,
          EC_SGA * QTY, EC_PROFIT * QTY,
          EC_PROFIT / EC_SALES * 100
      ]);
    }
    console.log(`  EC P&L created (5 years)`);

    // ============================================================
    // 3. TC 프로젝트 마스터
    // ============================================================
    await client.query(`
      INSERT INTO PCM_TGT_PJT_MSTR (TEN_ID, TGT_PJT_CD, PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP, EC_PJT_CD, BASE_CURRENCY, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, $3, 'SEAT', '테스트고객', 'TEST-CAR', 'TEST-OEM', '시트', $4, 'KRW', 'A', 'testuser', NOW(), 'testuser', NOW())
    `, [TEN, c.tc, c.tcNm, c.ec]);
    console.log(`  TC project created: ${c.tc} → EC: ${c.ec}`);

    // ============================================================
    // 4. TC 원가등록 (PCM_TGT_COST_REG) — 핵심 테이블
    //    EC_COST_AMT = EC 단가, FINAL_TGT_AMT = TC 목표 단가
    //    SAVE_TGT_AMT = EC_COST_AMT - FINAL_TGT_AMT
    // ============================================================
    const tcItems = [
      { seq: 1, cd: 'MAT',   nm: '재료비',   ecAmt: EC_MAT,   tgtAmt: c.tc_mat },
      { seq: 2, cd: 'LABOR', nm: '노무비',   ecAmt: EC_LABOR,  tgtAmt: c.tc_labor },
      { seq: 3, cd: 'MFG',   nm: '제조경비', ecAmt: EC_MFG,    tgtAmt: c.tc_mfg },
      { seq: 4, cd: 'SGA',   nm: '판관비',   ecAmt: EC_SGA,    tgtAmt: c.tc_sga }
    ];

    for (const item of tcItems) {
      await client.query(`
        INSERT INTO PCM_TGT_COST_REG (TEN_ID, TGT_PJT_CD, COST_SEQ, COST_ITEM_CD, COST_ITEM_NM, DEPT_CD, DEPT_NM,
          EC_COST_AMT, GUIDE_AMT, FINAL_TGT_AMT, DIFF_AMT, SAVE_TGT_AMT,
          ADJ_REASON, CONFIRM_YN, VIEW_MODE, STS,
          REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
        VALUES ($1, $2, $3, $4, $5, $4, $5,
          $6, $7, $7, $8, $9,
          '통합테스트', 'Y', 'SUM', 'Y',
          'testuser', NOW(), 'testuser', NOW())
      `, [TEN, c.tc, item.seq, item.cd, item.nm,
          item.ecAmt, item.tgtAmt, item.ecAmt - item.tgtAmt, item.ecAmt - item.tgtAmt]);
    }
    console.log(`  TC cost registration created (4 items)`);

    // ============================================================
    // 5. CC 프로젝트 마스터
    // ============================================================
    await client.query(`
      INSERT INTO PCM_CUR_PJT_MSTR (TEN_ID, CC_PJT_CD, CC_REV, EC_PJT_CD,
        PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE, OEM_NM, PROD_GRP,
        PROG_STS, RMK, STS,
        REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, 1, $3,
        $4, 'SEAT', '테스트고객', 'TEST-CAR', 'TEST-OEM', '시트',
        'A', '통합테스트', 'T',
        'testuser', NOW(), 'testuser', NOW())
    `, [TEN, c.cc, c.ec, c.ccNm]);
    console.log(`  CC project created: ${c.cc} (rev=1) → EC: ${c.ec}, TC: ${c.tc}`);

    // ============================================================
    // 6. CC 원가코드 (단일 코드 'COST01')
    // ============================================================
    await client.query(`
      INSERT INTO PCM_CUR_COST_CODE (TEN_ID, CC_PJT_CD, CC_REV, COST_SEQ, COST_CD,
        CALC_TARGET, PROD_DESC, CURRENCY, EST_SELL_PRICE, SOP_YM, EOP_YM, STS,
        REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES ($1, $2, 1, 1, 'COST01',
        'Y', '테스트 제품', 'KRW', $3, '2026-06', '2030-06', 'Y',
        'testuser', NOW(), 'testuser', NOW())
    `, [TEN, c.cc, EC_SALES]);
    console.log(`  CC cost code created`);

    // ============================================================
    // 7. CC 수량/할인율 (5개년)
    // ============================================================
    for (let yr = 1; yr <= 5; yr++) {
      await client.query(`
        INSERT INTO PCM_CUR_QTY_DISC (TEN_ID, CC_PJT_CD, CC_REV, QTY_SEQ, COST_CD, YEAR_VAL, SELL_QTY, DISC_RATE, STS,
          REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
        VALUES ($1, $2, 1, $3, 'COST01', $4, $5, 0, 'Y',
          'testuser', NOW(), 'testuser', NOW())
      `, [TEN, c.cc, yr, String(2026 + yr - 1), QTY]);
    }
    console.log(`  CC qty/disc created (5 years)`);

    // ============================================================
    // 8. CC P&L Statement (핵심 — 현상원가 손익계산서)
    //    VIEW_TYPE='PJT', VIEW_KEY=CC_PJT_CD, 5개년
    // ============================================================
    const ccSales = EC_SALES; // 매출단가는 동일
    const ccProfit = ccSales - c.cc_mat - c.cc_labor - c.cc_mfg - c.cc_sga;

    for (let yr = 1; yr <= 5; yr++) {
      const yearVal = String(2026 + yr - 1);
      const plItems = [
        { seq: 1, item: '매출액',   tot: ccSales * QTY,   unit: ccSales },
        { seq: 2, item: '재료비',   tot: c.cc_mat * QTY,  unit: c.cc_mat },
        { seq: 3, item: '노무비',   tot: c.cc_labor * QTY, unit: c.cc_labor },
        { seq: 4, item: '제조경비', tot: c.cc_mfg * QTY,  unit: c.cc_mfg },
        { seq: 5, item: '판관비',   tot: c.cc_sga * QTY,  unit: c.cc_sga },
        { seq: 6, item: '영업이익', tot: ccProfit * QTY,   unit: ccProfit }
      ];

      for (const pl of plItems) {
        await client.query(`
          INSERT INTO PCM_CUR_PL_STMT (TEN_ID, CC_PJT_CD, CC_REV, VIEW_TYPE, VIEW_KEY,
            PL_SEQ, COST_ITEM, YEAR_VAL, TOT_AMT, UNIT_AMT, RATE_VAL,
            CALC_DONE_YN, STS,
            REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
          VALUES ($1, $2, 1, 'PJT', $2,
            $3, $4, $5, $6, $7, 0,
            'Y', 'Y',
            'testuser', NOW(), 'testuser', NOW())
        `, [TEN, c.cc, pl.seq, pl.item, yearVal, pl.tot, pl.unit]);
      }
    }
    console.log(`  CC P&L created (5 years × 6 items = 30 rows)`);

    // ============================================================
    // 9. CC 달성도 평가 상세 데이터 직접 생성
    //    (generateAchvEvalDtl은 단건 CRUD이므로 직접 INSERT)
    // ============================================================
    const evalItems = [
      { cd: 'MAT',   nm: '재료비',   ecAmt: EC_MAT,   tgtAmt: c.tc_mat,  curAmt: c.cc_mat },
      { cd: 'LABOR', nm: '노무비',   ecAmt: EC_LABOR,  tgtAmt: c.tc_labor, curAmt: c.cc_labor },
      { cd: 'MFG',   nm: '제조경비', ecAmt: EC_MFG,    tgtAmt: c.tc_mfg,   curAmt: c.cc_mfg },
      { cd: 'SGA',   nm: '판관비',   ecAmt: EC_SGA,    tgtAmt: c.tc_sga,   curAmt: c.cc_sga }
    ];

    let evalSeq = 0;
    for (const ev of evalItems) {
      evalSeq++;
      const saveTgt = ev.ecAmt - ev.tgtAmt;  // 절감목표
      const saveAct = ev.ecAmt - ev.curAmt;   // 절감실적 (EC기준)
      // 달성률 = 절감실적/절감목표*100 (절감목표가 0이면 0)
      const achvRate = saveTgt !== 0 ? Math.round(saveAct / saveTgt * 10000) / 100 : 0;
      const achvYn = achvRate >= 100 ? 'Y' : 'N';

      await client.query(`
        INSERT INTO PCM_CUR_ACHV_EVAL_DTL (TEN_ID, CC_PJT_CD, CC_REV, EVAL_SEQ, EVAL_TYPE,
          DEPT_NM, COST_ITEM_CD, COST_ITEM_NM, EC_AMT, TGT_AMT,
          SAVE_TGT_AMT, CUR_AMT, SAVE_ACT_AMT, ACHV_RATE, ACHV_YN,
          RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
        VALUES ($1, $2, 1, $3, 'DEPT',
          '생산부', $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          '', 'Y', 'testuser', NOW(), 'testuser', NOW())
      `, [TEN, c.cc, evalSeq, ev.cd, ev.nm, ev.ecAmt, ev.tgtAmt,
          saveTgt, ev.curAmt, saveAct, achvRate, achvYn]);
    }
    console.log(`  Achievement eval detail created (4 items)`);
  }

  // ============================================================
  // 검증: 생성된 데이터 확인
  // ============================================================
  console.log('\n══════════════════════════════════════');
  console.log('  데이터 생성 완료 — 검증 쿼리 실행');
  console.log('══════════════════════════════════════');

  // EC 프로젝트 확인
  const ecRes = await client.query(`SELECT EC_PJT_CD, PJT_NM FROM PCM_EC_PJT_MSTR WHERE TEN_ID='${TEN}' AND EC_PJT_CD IN ('EC_TC_S01','EC_TC_R01','EC_TC_M01') ORDER BY EC_PJT_CD`);
  console.log('\n[EC Projects]');
  ecRes.rows.forEach(r => console.log(`  ${r.ec_pjt_cd}: ${r.pjt_nm}`));

  // TC 프로젝트 확인
  const tcRes = await client.query(`SELECT TGT_PJT_CD, PJT_NM, EC_PJT_CD FROM PCM_TGT_PJT_MSTR WHERE TEN_ID='${TEN}' AND TGT_PJT_CD IN ('TC_S01','TC_R01','TC_M01') ORDER BY TGT_PJT_CD`);
  console.log('\n[TC Projects]');
  tcRes.rows.forEach(r => console.log(`  ${r.tgt_pjt_cd}: ${r.pjt_nm} (EC→${r.ec_pjt_cd})`));

  // CC 프로젝트 확인
  const ccRes = await client.query(`SELECT CC_PJT_CD, PJT_NM, EC_PJT_CD, TGT_PJT_CD FROM PCM_CUR_PJT_MSTR WHERE TEN_ID='${TEN}' AND CC_PJT_CD IN ('CC_S01','CC_R01','CC_M01') ORDER BY CC_PJT_CD`);
  console.log('\n[CC Projects]');
  ccRes.rows.forEach(r => console.log(`  ${r.cc_pjt_cd}: ${r.pjt_nm} (EC→${r.ec_pjt_cd}, TC→${r.tgt_pjt_cd})`));

  // TC Cost Reg 확인
  const tcRegRes = await client.query(`
    SELECT TGT_PJT_CD, COST_ITEM_NM, EC_COST_AMT, FINAL_TGT_AMT, SAVE_TGT_AMT
    FROM PCM_TGT_COST_REG WHERE TEN_ID='${TEN}' AND TGT_PJT_CD IN ('TC_S01','TC_R01','TC_M01')
    ORDER BY TGT_PJT_CD, COST_SEQ`);
  console.log('\n[TC Cost Registration]');
  tcRegRes.rows.forEach(r => console.log(`  ${r.tgt_pjt_cd} | ${r.cost_item_nm}: EC=${r.ec_cost_amt} → TC=${r.final_tgt_amt} (절감=${r.save_tgt_amt})`));

  // CC PL Summary 확인
  const ccPlRes = await client.query(`
    SELECT CC_PJT_CD, COST_ITEM, SUM(UNIT_AMT) as unit_amt
    FROM PCM_CUR_PL_STMT WHERE TEN_ID='${TEN}' AND CC_PJT_CD IN ('CC_S01','CC_R01','CC_M01')
    GROUP BY CC_PJT_CD, COST_ITEM, PL_SEQ ORDER BY CC_PJT_CD, PL_SEQ`);
  console.log('\n[CC P&L Summary (단가)]');
  ccPlRes.rows.forEach(r => console.log(`  ${r.cc_pjt_cd} | ${r.cost_item}: ${r.unit_amt}`));

  // 달성도 평가 확인
  const evalRes = await client.query(`
    SELECT CC_PJT_CD, COST_ITEM_NM, EC_AMT, TGT_AMT, SAVE_TGT_AMT, CUR_AMT, SAVE_ACT_AMT, ACHV_RATE, ACHV_YN
    FROM PCM_CUR_ACHV_EVAL_DTL WHERE TEN_ID='${TEN}' AND CC_PJT_CD IN ('CC_S01','CC_R01','CC_M01')
    ORDER BY CC_PJT_CD, EVAL_SEQ`);
  console.log('\n[Achievement Evaluation Detail]');
  evalRes.rows.forEach(r => console.log(`  ${r.cc_pjt_cd} | ${r.cost_item_nm}: EC=${r.ec_amt} TC=${r.tgt_amt} CC=${r.cur_amt} | 절감목표=${r.save_tgt_amt} 절감실적=${r.save_act_amt} | 달성률=${r.achv_rate}% ${r.achv_yn}`));

  await client.end();
  console.log('\n✅ All test data created successfully!');
}

run().catch(err => {
  console.error('ERROR:', err);
  client.end();
  process.exit(1);
});
