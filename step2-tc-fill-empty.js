/**
 * Step 2: TC20260006 - Fill empty tables (achv_plan_dtl, recalc, achv_status)
 * Uses API endpoints for achv_plan_dtl and recalc, direct DB for achv_status
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
const TC = 'TC20260006';

async function run() {
  await client.connect();
  await client.query('SET search_path TO asyoucost, public');
  console.log('Connected. Filling TC20260006 empty tables...\n');

  // ================================================================
  // 2-1. PCM_TGT_ACHV_PLAN_DTL - Achievement Plan Details
  // ================================================================
  console.log('=== 2-1. TC Achievement Plan Details ===');

  // First get existing achv_plan data to reference plan_seq
  const achvPlans = await post('/bp/cost/tc/detail/findListAchvPlan.do', { tgtPjtCd: TC });
  console.log(`  Existing AchvPlan: ${achvPlans.length} rows`);

  if (achvPlans.length > 0) {
    const dtlList = [];
    // Create 2~3 detail items per achv_plan
    for (const plan of achvPlans) {
      const planSeq = plan.planSeq;
      const costItem = plan.costItemCd;

      if (costItem === 'MAT') {
        dtlList.push(
          { _rowStatus: 'C', planSeq, dtlSeq: 1, level1: '원자재 단가 협상', level2: '주요 원자재 3사 경쟁입찰', level3: 'SCM 강철/알루미늄', saveAmt: plan.saveTgtAmt * 0.4, fileNm: '', filePath: '', rmk: '1차 협상 완료', sts: 'Y' },
          { _rowStatus: 'C', planSeq, dtlSeq: 2, level1: '대체소재 적용', level2: '알루미늄→CFRP 전환', level3: '경량화 5% 달성', saveAmt: plan.saveTgtAmt * 0.35, fileNm: '', filePath: '', rmk: '시험 검증 중', sts: 'Y' },
          { _rowStatus: 'C', planSeq, dtlSeq: 3, level1: '물류비 절감', level2: '직납 체계 전환', level3: '', saveAmt: plan.saveTgtAmt * 0.25, fileNm: '', filePath: '', rmk: '', sts: 'Y' }
        );
      } else if (costItem === 'LABOR') {
        dtlList.push(
          { _rowStatus: 'C', planSeq, dtlSeq: 1, level1: '자동화 투자', level2: '조립공정 로봇화', level3: '', saveAmt: plan.saveTgtAmt * 0.6, fileNm: '', filePath: '', rmk: '2027 Q1 도입', sts: 'Y' },
          { _rowStatus: 'C', planSeq, dtlSeq: 2, level1: '공정 개선', level2: 'Lean 생산 도입', level3: '', saveAmt: plan.saveTgtAmt * 0.4, fileNm: '', filePath: '', rmk: '', sts: 'Y' }
        );
      } else if (costItem === 'MFG') {
        dtlList.push(
          { _rowStatus: 'C', planSeq, dtlSeq: 1, level1: '에너지 절감', level2: '태양광 설비 도입', level3: '', saveAmt: plan.saveTgtAmt * 0.5, fileNm: '', filePath: '', rmk: '설비 발주 완료', sts: 'Y' },
          { _rowStatus: 'C', planSeq, dtlSeq: 2, level1: '금형 수명 연장', level2: '코팅처리 개선', level3: '', saveAmt: plan.saveTgtAmt * 0.5, fileNm: '', filePath: '', rmk: '', sts: 'Y' }
        );
      } else if (costItem === 'SGA') {
        dtlList.push(
          { _rowStatus: 'C', planSeq, dtlSeq: 1, level1: '물류 효율화', level2: '공동 배송 체계', level3: '', saveAmt: plan.saveTgtAmt * 0.5, fileNm: '', filePath: '', rmk: '', sts: 'Y' },
          { _rowStatus: 'C', planSeq, dtlSeq: 2, level1: 'AS비용 절감', level2: '품질 선행관리 강화', level3: '', saveAmt: plan.saveTgtAmt * 0.5, fileNm: '', filePath: '', rmk: '', sts: 'Y' }
        );
      }
    }

    console.log(`  Inserting ${dtlList.length} detail items...`);
    const r1 = await post('/bp/cost/tc/detail/saveListAchvPlanDtl.do', {
      tgtPjtCd: TC,
      saveList: dtlList
    });
    console.log('  Result:', typeof r1 === 'object' ? JSON.stringify(r1).substring(0, 100) : r1);
  }

  // Verify
  const dtlVerify = await post('/bp/cost/tc/detail/findListAchvPlanDtl.do', { tgtPjtCd: TC });
  console.log(`  AchvPlanDtl verify: ${Array.isArray(dtlVerify) ? dtlVerify.length : 'not array'} rows`);
  if (Array.isArray(dtlVerify)) {
    dtlVerify.forEach(r => console.log(`    planSeq=${r.planSeq} dtlSeq=${r.dtlSeq} L1=${r.level1} amt=${r.saveAmt}`));
  }

  // ================================================================
  // 2-2. PCM_TGT_RECALC - Recalculation data
  // ================================================================
  console.log('\n=== 2-2. TC Recalculation ===');
  const recalcList = [
    { _rowStatus: 'C', recalcSeq: 1, ccGrpCd: 'CC20260006', ccRound: 1, tgtProfitRate: 20.0, finalTgtProfitRate: 18.5, rmk: '1차 재산정 - CC Rev1 기반', sts: 'Y' },
    { _rowStatus: 'C', recalcSeq: 2, ccGrpCd: 'CC20260006', ccRound: 2, tgtProfitRate: 18.5, finalTgtProfitRate: 17.8, rmk: '2차 재산정 - 원자재가 반영', sts: 'Y' }
  ];
  const r2 = await post('/bp/cost/tc/detail/saveListRecalc.do', {
    tgtPjtCd: TC,
    saveList: recalcList
  });
  console.log('  Result:', typeof r2 === 'object' ? JSON.stringify(r2).substring(0, 100) : r2);

  // Verify
  const recalcVerify = await post('/bp/cost/tc/detail/findListRecalc.do', { tgtPjtCd: TC });
  console.log(`  Recalc verify: ${Array.isArray(recalcVerify) ? recalcVerify.length : 'not array'} rows`);
  if (Array.isArray(recalcVerify)) {
    recalcVerify.forEach(r => console.log(`    seq=${r.recalcSeq} cc=${r.ccGrpCd} round=${r.ccRound} rate=${r.tgtProfitRate}->${r.finalTgtProfitRate}`));
  }

  // ================================================================
  // 2-3. PCM_TGT_ACHV_STATUS - Achievement Status Summary
  // Direct DB INSERT (generateTcAchvStatus endpoint might not have saveList)
  // ================================================================
  console.log('\n=== 2-3. TC Achievement Status ===');

  // Get TC project info for the status record
  const tcMstr = await client.query(`SELECT * FROM PCM_TGT_PJT_MSTR WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [T, TC]);
  const costRegs = await client.query(`SELECT * FROM PCM_TGT_COST_REG WHERE TEN_ID=$1 AND TGT_PJT_CD=$2 ORDER BY COST_SEQ`, [T, TC]);
  const actEvals = await client.query(`SELECT * FROM PCM_CUR_ACT_EVAL WHERE TEN_ID=$1 AND CC_PJT_CD='CC20260006' ORDER BY EVAL_SEQ`, [T]);

  if (tcMstr.rows.length > 0) {
    const tc = tcMstr.rows[0];
    let ecTotal = 0, tgtTotal = 0, curTotal = 0, saveTgtTotal = 0, saveActTotal = 0;

    for (const cr of costRegs.rows) {
      ecTotal += parseFloat(cr.ec_cost_amt || 0);
      tgtTotal += parseFloat(cr.final_tgt_amt || 0);
      saveTgtTotal += parseFloat(cr.save_tgt_amt || 0);
    }

    for (const ae of actEvals.rows) {
      curTotal += parseFloat(ae.act_amt || 0);
      saveActTotal += parseFloat(ae.save_act_amt || 0);
    }

    if (curTotal === 0) curTotal = tgtTotal * 0.95; // estimate if no actEval data
    if (saveActTotal === 0) saveActTotal = ecTotal - curTotal;

    const achvRate = saveTgtTotal > 0 ? Math.round(saveActTotal / saveTgtTotal * 10000) / 100 : 100;
    const achvYn = achvRate >= 100 ? 'Y' : 'N';

    // Delete existing first
    await client.query(`DELETE FROM PCM_TGT_ACHV_STATUS WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [T, TC]);

    await client.query(`
      INSERT INTO PCM_TGT_ACHV_STATUS (
        TEN_ID, TGT_PJT_CD, PJT_NM, BIZ_UNIT, PROD_GRP,
        OEM_NM, CAR_TYPE, EC_TOTAL_AMT, TGT_TOTAL_AMT, CUR_TOTAL_AMT,
        SAVE_TGT_AMT, SAVE_ACT_AMT, ACHV_RATE, ACHV_YN, STS,
        REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, 'Y',
        'testuser', NOW(), 'testuser', NOW()
      )
    `, [T, TC, tc.pjt_nm, tc.biz_unit, tc.prod_grp,
        tc.oem_nm, tc.car_type, ecTotal, tgtTotal, curTotal,
        saveTgtTotal, saveActTotal, achvRate, achvYn]);

    console.log(`  AchvStatus inserted: ecTotal=${ecTotal}, tgtTotal=${tgtTotal}, curTotal=${curTotal}`);
    console.log(`  saveTgt=${saveTgtTotal}, saveAct=${saveActTotal}, achvRate=${achvRate}%, achvYn=${achvYn}`);
  }

  // Verify via API
  const statusVerify = await post('/bp/cost/tc/detail/findListAchvStatus.do', { tgtPjtCd: TC });
  console.log(`  AchvStatus verify:`, JSON.stringify(statusVerify).substring(0, 200));

  // ================================================================
  // Final Summary
  // ================================================================
  console.log('\n========================================');
  console.log('  TC20260006 EMPTY TABLE FILL RESULTS');
  console.log('========================================');

  const dtlCount = await client.query(`SELECT COUNT(*) as cnt FROM PCM_TGT_ACHV_PLAN_DTL WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [T, TC]);
  const recalcCount = await client.query(`SELECT COUNT(*) as cnt FROM PCM_TGT_RECALC WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [T, TC]);
  const statusCount = await client.query(`SELECT COUNT(*) as cnt FROM PCM_TGT_ACHV_STATUS WHERE TEN_ID=$1 AND TGT_PJT_CD=$2`, [T, TC]);

  console.log(`  PCM_TGT_ACHV_PLAN_DTL: ${dtlCount.rows[0].cnt} rows (was 0)`);
  console.log(`  PCM_TGT_RECALC: ${recalcCount.rows[0].cnt} rows (was 0)`);
  console.log(`  PCM_TGT_ACHV_STATUS: ${statusCount.rows[0].cnt} rows (was 0)`);

  await client.end();
  console.log('\nStep 2 complete!');
}

run().catch(e => { console.error('ERROR:', e); client.end(); process.exit(1); });
