/**
 * Step 3: CC20260006 - Fill PCM_CUR_ACHV_EVAL (Achievement Evaluation)
 * Uses API endpoint: /bp/cost/currentcost/insertAchievementEval.do
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

async function run() {
  await client.connect();
  await client.query('SET search_path TO asyoucost, public');
  console.log('Connected. Filling CC20260006 Achievement Evaluation...\n');

  // ================================================================
  // Step 3-1: Try API insert first
  // ================================================================
  console.log('=== 3-1. CC Achievement Evaluation via API ===');

  // Get CC project info
  const ccMstr = await client.query(`
    SELECT * FROM PCM_CUR_PJT_MSTR WHERE TEN_ID=$1 AND CC_PJT_CD='CC20260006'
  `, [T]);

  // Get EC profit total
  const ecProfit = await client.query(`
    SELECT TOTAL_ESTM_COST FROM PCM_EC_PROFIT WHERE TEN_ID=$1 AND EC_PJT_CD='EC20260006'
  `, [T]);

  // Get TC guide total
  const tgtGuide = await client.query(`
    SELECT SUM(GUIDE_TGT_TOT_AMT) as tgt_total FROM PCM_TGT_GUIDE WHERE TEN_ID=$1 AND TGT_PJT_CD='TC20260006'
  `, [T]);

  // Get CC actual evaluation total
  const actEval = await client.query(`
    SELECT SUM(ACT_AMT) as cur_total, SUM(SAVE_ACT_AMT) as save_act FROM PCM_CUR_ACT_EVAL WHERE TEN_ID=$1 AND CC_PJT_CD='CC20260006'
  `, [T]);

  // Get TC cost reg totals
  const costReg = await client.query(`
    SELECT SUM(EC_COST_AMT) as ec_total, SUM(FINAL_TGT_AMT) as tgt_total, SUM(SAVE_TGT_AMT) as save_tgt
    FROM PCM_TGT_COST_REG WHERE TEN_ID=$1 AND TGT_PJT_CD='TC20260006'
  `, [T]);

  const cc = ccMstr.rows[0];
  const ecTotalCost = parseFloat(ecProfit.rows[0]?.total_estm_cost || costReg.rows[0]?.ec_total || 0);
  const tgtTotalCost = parseFloat(tgtGuide.rows[0]?.tgt_total || costReg.rows[0]?.tgt_total || 0);
  const curTotalCost = parseFloat(actEval.rows[0]?.cur_total || tgtTotalCost * 0.95);
  const saveTgtAmt = parseFloat(costReg.rows[0]?.save_tgt || ecTotalCost - tgtTotalCost);
  const saveActAmt = parseFloat(actEval.rows[0]?.save_act || ecTotalCost - curTotalCost);
  const achvRate = saveTgtAmt > 0 ? Math.round(saveActAmt / saveTgtAmt * 10000) / 100 : 100;
  const achvYn = achvRate >= 100 ? 'Y' : 'N';

  console.log(`  EC Total: ${ecTotalCost}, TGT Total: ${tgtTotalCost}, CUR Total: ${curTotalCost}`);
  console.log(`  Save TGT: ${saveTgtAmt}, Save ACT: ${saveActAmt}, Rate: ${achvRate}%`);

  // Step 1: Use createAchievementEval to auto-generate base data
  console.log('  Trying createAchievementEval...');
  const createResult = await post('/bp/cost/cc/achv/createAchievementEval.do', {});
  console.log('  Create result:', JSON.stringify(createResult).substring(0, 200));

  // Check if CC20260006 was created
  const checkList = await post('/bp/cost/cc/achv/findListAchievementEval.do', {});
  const existing = Array.isArray(checkList) ? checkList.find(r => r.curPjtCd === 'CC20260006') : null;

  if (existing) {
    console.log('  CC20260006 created via API. Updating with actual values...');
    // Update with calculated values via saveList
    const saveResult = await post('/bp/cost/cc/achv/saveListAchievementEval.do', {
      saveList: [{
        _rowStatus: 'U',
        curPjtCd: 'CC20260006',
        curTotalCost: curTotalCost,
        saveTgtAmt: saveTgtAmt,
        saveActAmt: saveActAmt,
        achvRate: achvRate,
        achvYn: achvYn,
        evalDt: '2026-02-25',
        rmk: 'EC20260006 기반 달성도 평가'
      }]
    });
    console.log('  Save result:', JSON.stringify(saveResult).substring(0, 200));
  } else {
    console.log('  createAchievementEval did not create CC20260006. Using direct DB insert...');
    // Fallback: Direct DB insert
    await client.query(`DELETE FROM PCM_CUR_ACHV_EVAL WHERE TEN_ID=$1 AND CUR_PJT_CD='CC20260006'`, [T]);
    await client.query(`
      INSERT INTO PCM_CUR_ACHV_EVAL (
        TEN_ID, CUR_PJT_CD, EC_PJT_CD, TGT_PJT_CD,
        PJT_NM, BIZ_UNIT, CUST_NM, CAR_TYPE,
        EC_TOTAL_COST, TGT_TOTAL_COST, CUR_TOTAL_COST,
        SAVE_TGT_AMT, SAVE_ACT_AMT, ACHV_RATE, ACHV_YN,
        EVAL_DT, RMK, STS,
        REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM
      ) VALUES (
        $1, 'CC20260006', 'EC20260006', 'TC20260006',
        $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12,
        '2026-02-25', 'EC20260006 기반 달성도 평가', 'T',
        'testuser', NOW(), 'testuser', NOW()
      )
    `, [T, cc.pjt_nm, cc.biz_unit, cc.cust_nm, cc.car_type,
        ecTotalCost, tgtTotalCost, curTotalCost,
        saveTgtAmt, saveActAmt, achvRate, achvYn]);
    console.log('  DB insert done');
  }

  // ================================================================
  // Verification
  // ================================================================
  console.log('\n=== Verification ===');

  // Check via API
  const evalList = await post('/bp/cost/cc/achv/findListAchievementEval.do', {});
  console.log(`  Total AchvEval records: ${Array.isArray(evalList) ? evalList.length : 'N/A'}`);
  if (Array.isArray(evalList)) {
    const cc06 = evalList.find(r => r.curPjtCd === 'CC20260006');
    if (cc06) {
      console.log('  CC20260006 found:');
      console.log(`    EC: ${cc06.ecPjtCd}, TGT: ${cc06.tgtPjtCd}`);
      console.log(`    ecTotal=${cc06.ecTotalCost}, tgtTotal=${cc06.tgtTotalCost}, curTotal=${cc06.curTotalCost}`);
      console.log(`    achvRate=${cc06.achvRate}%, achvYn=${cc06.achvYn}`);
    } else {
      console.log('  CC20260006 NOT found in API results');
    }
  }

  // Check via DB
  const dbCheck = await client.query(`SELECT * FROM PCM_CUR_ACHV_EVAL WHERE TEN_ID=$1 AND CUR_PJT_CD='CC20260006'`, [T]);
  console.log(`  DB check: ${dbCheck.rows.length} rows`);

  await client.end();
  console.log('\nStep 3 complete!');
}

run().catch(e => { console.error('ERROR:', e); client.end(); process.exit(1); });
