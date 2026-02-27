/**
 * 통합 테스트 보충 데이터: TC Guide, TC 달성계획, CC 실적평가
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

// EC 공통 원가
const EC_SALES = 500000;
const EC_MAT = 200000;
const EC_LABOR = 50000;
const EC_MFG = 100000;
const EC_SGA = 50000;
const QTY = 10000;

const cases = [
  {
    tc: 'TC_S01', cc: 'CC_S01',
    tc_mat: 172000, tc_labor: 50000, tc_mfg: 88000, tc_sga: 50000,
    cc_mat: 168000, cc_labor: 50000, cc_mfg: 84000, cc_sga: 50000
  },
  {
    tc: 'TC_R01', cc: 'CC_R01',
    tc_mat: 190000, tc_labor: 50000, tc_mfg: 95000, tc_sga: 45000,
    cc_mat: 230000, cc_labor: 55000, cc_mfg: 110000, cc_sga: 45000
  },
  {
    tc: 'TC_M01', cc: 'CC_M01',
    tc_mat: 190000, tc_labor: 47500, tc_mfg: 95000, tc_sga: 47500,
    cc_mat: 190000, cc_labor: 60000, cc_mfg: 115000, cc_sga: 47500
  }
];

async function run() {
  await client.connect();
  await client.query('SET search_path TO asyoucost, public');
  console.log('Connected.\n');

  // ── 기존 보충 데이터 정리 ──
  for (const c of cases) {
    await client.query(`DELETE FROM PCM_TGT_GUIDE WHERE TEN_ID='${TEN}' AND TGT_PJT_CD='${c.tc}'`);
    await client.query(`DELETE FROM PCM_TGT_ACHV_PLAN WHERE TEN_ID='${TEN}' AND TGT_PJT_CD='${c.tc}'`);
    await client.query(`DELETE FROM PCM_CUR_ACT_EVAL WHERE TEN_ID='${TEN}' AND CC_PJT_CD='${c.cc}'`);
  }
  console.log('Cleanup done.\n');

  for (const c of cases) {
    console.log(`── ${c.tc} / ${c.cc} ──`);

    const items = [
      { seq: 1, cd: 'MAT',   nm: '재료비',   dept: '구매부', ecAmt: EC_MAT,   tgtAmt: c.tc_mat,  ccAmt: c.cc_mat },
      { seq: 2, cd: 'LABOR', nm: '노무비',   dept: '생산부', ecAmt: EC_LABOR,  tgtAmt: c.tc_labor, ccAmt: c.cc_labor },
      { seq: 3, cd: 'MFG',   nm: '제조경비', dept: '생산부', ecAmt: EC_MFG,    tgtAmt: c.tc_mfg,   ccAmt: c.cc_mfg },
      { seq: 4, cd: 'SGA',   nm: '판관비',   dept: '경영지원', ecAmt: EC_SGA,    tgtAmt: c.tc_sga,   ccAmt: c.cc_sga }
    ];

    // ================================================================
    // 1. PCM_TGT_GUIDE (TC 부문별 목표 Guide)
    // ================================================================
    for (const it of items) {
      const saveRate = it.ecAmt !== 0
        ? Math.round((it.ecAmt - it.tgtAmt) / it.ecAmt * 10000) / 100
        : 0;

      await client.query(`
        INSERT INTO PCM_TGT_GUIDE (
          TEN_ID, TGT_PJT_CD, GUIDE_SEQ,
          COST_ITEM_CD, COST_ITEM_NM, DEPT_CD, DEPT_NM,
          EC_COST_TOT_AMT, EC_COST_UNIT_AMT,
          GUIDE_TGT_TOT_AMT, GUIDE_TGT_UNIT_AMT,
          CFT_TGT_TOT_AMT, CFT_TGT_UNIT_AMT,
          SAVE_RATE, PROD_QTY, RMK, STS,
          REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM
        ) VALUES (
          $1, $2, $3,
          $4, $5, $6, $7,
          $8, $9,
          $10, $11,
          $12, $13,
          $14, $15, '통합테스트', 'A',
          'testuser', NOW(), 'testuser', NOW()
        )
      `, [
        TEN, c.tc, it.seq,
        it.cd, it.nm, it.cd, it.dept,
        it.ecAmt * QTY, it.ecAmt,           // EC 총금액, 단위금액
        it.tgtAmt * QTY, it.tgtAmt,         // Guide 목표 총금액, 단위금액
        it.tgtAmt * QTY, it.tgtAmt,         // CFT 확정 = Guide와 동일
        saveRate, QTY
      ]);
    }
    console.log(`  PCM_TGT_GUIDE: 4 rows inserted`);

    // ================================================================
    // 2. PCM_TGT_ACHV_PLAN (TC 달성계획)
    // ================================================================
    for (const it of items) {
      const saveTgtAmt = it.ecAmt - it.tgtAmt;
      // 달성계획 금액 = 절감목표 금액 (계획 = 목표 100%)
      const savePlanAmt = saveTgtAmt;

      await client.query(`
        INSERT INTO PCM_TGT_ACHV_PLAN (
          TEN_ID, TGT_PJT_CD, PLAN_SEQ,
          COST_ITEM_CD, COST_ITEM_NM,
          EC_COST_AMT, TGT_COST_AMT, SAVE_TGT_AMT, SAVE_PLAN_AMT,
          CONFIRM_YN, RMK, STS,
          REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM
        ) VALUES (
          $1, $2, $3,
          $4, $5,
          $6, $7, $8, $9,
          'Y', '통합테스트', 'Y',
          'testuser', NOW(), 'testuser', NOW()
        )
      `, [
        TEN, c.tc, it.seq,
        it.cd, it.nm,
        it.ecAmt, it.tgtAmt, saveTgtAmt, savePlanAmt
      ]);
    }
    console.log(`  PCM_TGT_ACHV_PLAN: 4 rows inserted`);

    // ================================================================
    // 3. PCM_CUR_ACT_EVAL (CC 실적평가)
    //    EC금액 vs 실제금액 기준 평가
    // ================================================================
    for (const it of items) {
      const saveTgtAmt = it.ecAmt - it.tgtAmt;   // 절감 목표
      const saveActAmt = it.ecAmt - it.ccAmt;     // 절감 실적
      const achvRate = saveTgtAmt !== 0
        ? Math.round(saveActAmt / saveTgtAmt * 10000) / 100
        : (saveActAmt >= 0 ? 100 : 0);
      const achvYn = achvRate >= 100 ? 'Y' : 'N';

      await client.query(`
        INSERT INTO PCM_CUR_ACT_EVAL (
          TEN_ID, CC_PJT_CD, CC_REV, TGT_COST_CD, EVAL_SEQ,
          COST_ITEM_NM,
          EC_AMT, TGT_AMT, SAVE_TGT_AMT,
          ACT_AMT, SAVE_ACT_AMT,
          ACHV_RATE, ACHV_YN, RMK, STS,
          REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM
        ) VALUES (
          $1, $2, 1, $3, $4,
          $5,
          $6, $7, $8,
          $9, $10,
          $11, $12, '통합테스트', 'Y',
          'testuser', NOW(), 'testuser', NOW()
        )
      `, [
        TEN, c.cc, it.cd, it.seq,
        it.nm,
        it.ecAmt, it.tgtAmt, saveTgtAmt,
        it.ccAmt, saveActAmt,
        achvRate, achvYn
      ]);
    }
    console.log(`  PCM_CUR_ACT_EVAL: 4 rows inserted`);
  }

  // ── 검증 ──
  console.log('\n══════ 검증 ══════');

  const g = await client.query(`
    SELECT TGT_PJT_CD, COST_ITEM_NM, EC_COST_UNIT_AMT, GUIDE_TGT_UNIT_AMT, CFT_TGT_UNIT_AMT, SAVE_RATE
    FROM PCM_TGT_GUIDE WHERE TEN_ID='${TEN}' AND TGT_PJT_CD IN ('TC_S01','TC_R01','TC_M01')
    ORDER BY TGT_PJT_CD, GUIDE_SEQ`);
  console.log('\n[TC Guide]');
  g.rows.forEach(r => console.log(`  ${r.tgt_pjt_cd} | ${r.cost_item_nm}: EC=${r.ec_cost_unit_amt} → Guide=${r.guide_tgt_unit_amt} CFT=${r.cft_tgt_unit_amt} 절감률=${r.save_rate}%`));

  const ap = await client.query(`
    SELECT TGT_PJT_CD, COST_ITEM_NM, EC_COST_AMT, TGT_COST_AMT, SAVE_TGT_AMT, SAVE_PLAN_AMT
    FROM PCM_TGT_ACHV_PLAN WHERE TEN_ID='${TEN}' AND TGT_PJT_CD IN ('TC_S01','TC_R01','TC_M01')
    ORDER BY TGT_PJT_CD, PLAN_SEQ`);
  console.log('\n[TC Achievement Plan]');
  ap.rows.forEach(r => console.log(`  ${r.tgt_pjt_cd} | ${r.cost_item_nm}: EC=${r.ec_cost_amt} TC=${r.tgt_cost_amt} 절감목표=${r.save_tgt_amt} 절감계획=${r.save_plan_amt}`));

  const ae = await client.query(`
    SELECT CC_PJT_CD, COST_ITEM_NM, EC_AMT, TGT_AMT, ACT_AMT, SAVE_TGT_AMT, SAVE_ACT_AMT, ACHV_RATE, ACHV_YN
    FROM PCM_CUR_ACT_EVAL WHERE TEN_ID='${TEN}' AND CC_PJT_CD IN ('CC_S01','CC_R01','CC_M01')
    ORDER BY CC_PJT_CD, EVAL_SEQ`);
  console.log('\n[CC Actual Evaluation]');
  ae.rows.forEach(r => console.log(`  ${r.cc_pjt_cd} | ${r.cost_item_nm}: EC=${r.ec_amt} TC=${r.tgt_amt} CC=${r.act_amt} | 목표절감=${r.save_tgt_amt} 실적절감=${r.save_act_amt} | 달성률=${r.achv_rate}% ${r.achv_yn}`));

  await client.end();
  console.log('\nDone!');
}

run().catch(err => {
  console.error('ERROR:', err);
  client.end();
  process.exit(1);
});
