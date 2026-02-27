/**
 * Final comparison: Working (EC20260006) vs Test (EC_TC_S01) data
 * Identify exactly what's missing/wrong in test data
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

async function run() {
  // Direct DB check for test data
  const client = new Client({
    host: 'aws-1-ap-northeast-1.pooler.supabase.com',
    port: 5432, database: 'postgres',
    user: 'postgres.zxenhxqhfglorxgibmrz',
    password: 'admin1004!@#$',
    ssl: { rejectUnauthorized: false },
    options: '-c search_path=asyoucost,public'
  });
  await client.connect();
  await client.query('SET search_path TO asyoucost, public');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  COMPLETE COMPARISON: Working vs Test Data');
  console.log('═══════════════════════════════════════════════════════\n');

  // ===== EC Level =====
  console.log('===== EC LEVEL =====');

  // Check all 3 test EC projects
  const testEcPjts = ['EC_TC_S01', 'EC_TC_R01', 'EC_TC_M01'];
  const workingEc = 'EC20260006';

  for (const ecPjt of [workingEc, ...testEcPjts]) {
    console.log(`\n--- ${ecPjt} ---`);

    // EC_PJT_MSTR
    const mstr = await client.query('SELECT * FROM pcm_ec_pjt_mstr WHERE ten_id=$1 AND ec_pjt_cd=$2', ['T001', ecPjt]);
    console.log(`  pjt_mstr: ${mstr.rows.length} rows`);

    // EC_DETAIL
    const detail = await client.query('SELECT * FROM pcm_ec_detail WHERE ten_id=$1 AND ec_pjt_cd=$2', ['T001', ecPjt]);
    console.log(`  ec_detail: ${detail.rows.length} rows`);
    if (detail.rows.length > 0) {
      const d = detail.rows[0];
      console.log(`    ec_ver=${d.ec_ver}, order_type=${d.order_type}, factory_type=${d.factory_type}`);
    }

    // EC_COST_CODE
    const cc = await client.query('SELECT * FROM pcm_ec_cost_code WHERE ten_id=$1 AND ec_pjt_cd=$2', ['T001', ecPjt]);
    console.log(`  ec_cost_code: ${cc.rows.length} rows`);
    cc.rows.forEach(r => console.log(`    cost_cd=${r.cost_cd}, est_price=${r.est_price}, sort_no=${r.sort_no}`));

    // EC_BOM
    const bom = await client.query('SELECT COUNT(*) as cnt FROM pcm_ec_bom WHERE ten_id=$1 AND ec_pjt_cd=$2', ['T001', ecPjt]);
    console.log(`  ec_bom: ${bom.rows[0].cnt} rows`);

    // EC_PL_STMT
    const pl = await client.query('SELECT COUNT(*) as cnt FROM pcm_ec_pl_stmt WHERE ten_id=$1 AND ec_pjt_cd=$2', ['T001', ecPjt]);
    console.log(`  ec_pl_stmt: ${pl.rows[0].cnt} rows`);

    // EC_PROFIT
    const prf = await client.query('SELECT COUNT(*) as cnt FROM pcm_ec_profit WHERE ten_id=$1 AND ec_pjt_cd=$2', ['T001', ecPjt]);
    console.log(`  ec_profit: ${prf.rows[0].cnt} rows`);
  }

  // ===== TC Level =====
  console.log('\n\n===== TC LEVEL =====');
  const testTcPjts = ['TC_S01', 'TC_R01', 'TC_M01'];
  const workingTc = 'TC20260006';

  const tcTables = [
    { name: 'pcm_tgt_pjt_mstr', col: 'tgt_pjt_cd' },
    { name: 'pcm_tgt_manager', col: 'tgt_pjt_cd' },
    { name: 'pcm_tgt_spec', col: 'tgt_pjt_cd' },
    { name: 'pcm_tgt_price', col: 'tgt_pjt_cd' },
    { name: 'pcm_tgt_qty_disc', col: 'tgt_pjt_cd' },
    { name: 'pcm_tgt_dev_schedule', col: 'tgt_pjt_cd' },
    { name: 'pcm_tgt_setup_schedule', col: 'tgt_pjt_cd' },
    { name: 'pcm_tgt_guide', col: 'tgt_pjt_cd' },
    { name: 'pcm_tgt_cost_reg', col: 'tgt_pjt_cd' },
    { name: 'pcm_tgt_achv_plan', col: 'tgt_pjt_cd' },
  ];

  // Header
  const pjts = [workingTc, ...testTcPjts];
  console.log('\nTable'.padEnd(30) + pjts.map(p => p.padStart(12)).join(''));
  console.log('-'.repeat(30 + 12 * pjts.length));

  for (const t of tcTables) {
    let line = t.name.padEnd(30);
    for (const pjt of pjts) {
      try {
        const r = await client.query(`SELECT COUNT(*) as cnt FROM ${t.name} WHERE ten_id='T001' AND ${t.col}=$1`, [pjt]);
        line += String(r.rows[0].cnt).padStart(12);
      } catch (e) {
        line += 'ERR'.padStart(12);
      }
    }
    console.log(line);
  }

  // ===== CC Level =====
  console.log('\n\n===== CC LEVEL =====');
  const testCcPjts = ['CC_S01', 'CC_R01', 'CC_M01'];
  const workingCc = 'CC20260006';

  const ccTables = [
    { name: 'pcm_cur_pjt_mstr', col: 'cc_pjt_cd' },
    { name: 'pcm_cur_detail', col: 'cc_pjt_cd' },
    { name: 'pcm_cur_cost_code', col: 'cc_pjt_cd' },
    { name: 'pcm_cur_qty_disc', col: 'cc_pjt_cd' },
    { name: 'pcm_cur_manager', col: 'cc_pjt_cd' },
    { name: 'pcm_cur_schedule', col: 'cc_pjt_cd' },
    { name: 'pcm_cur_bom', col: 'cc_pjt_cd' },
    { name: 'pcm_cur_part_price', col: 'cc_pjt_cd' },
    { name: 'pcm_cur_act_eval', col: 'cc_pjt_cd' },
  ];

  const ccPjts = [workingCc, ...testCcPjts];
  console.log('\nTable'.padEnd(30) + ccPjts.map(p => p.padStart(12)).join(''));
  console.log('-'.repeat(30 + 12 * ccPjts.length));

  for (const t of ccTables) {
    let line = t.name.padEnd(30);
    for (const pjt of ccPjts) {
      try {
        const r = await client.query(`SELECT COUNT(*) as cnt FROM ${t.name} WHERE ten_id='T001' AND ${t.col}=$1`, [pjt]);
        line += String(r.rows[0].cnt).padStart(12);
      } catch (e) {
        line += 'ERR'.padStart(12);
      }
    }
    console.log(line);
  }

  // ===== KEY STRUCTURAL DIFFERENCES =====
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  KEY STRUCTURAL DIFFERENCES (Test vs Working)');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check EC detail column differences
  console.log('--- EC Detail structure check ---');
  const edW = await client.query("SELECT * FROM pcm_ec_detail WHERE ten_id='T001' AND ec_pjt_cd='EC20260006'");
  const edT = await client.query("SELECT * FROM pcm_ec_detail WHERE ten_id='T001' AND ec_pjt_cd='EC_TC_S01'");
  if (edW.rows.length > 0 && edT.rows.length > 0) {
    const wRow = edW.rows[0];
    const tRow = edT.rows[0];
    Object.keys(wRow).forEach(k => {
      const wv = wRow[k], tv = tRow[k];
      const wNull = wv === null || wv === undefined;
      const tNull = tv === null || tv === undefined;
      if (wNull !== tNull) {
        console.log(`  ${k}: Working=${wv}, Test=${tv} ${tNull ? '<-- NULL in test!' : ''}`);
      }
    });
  }

  // Check CC cost code differences
  console.log('\n--- CC CostCode structure check ---');
  const ccW = await client.query("SELECT * FROM pcm_cur_cost_code WHERE ten_id='T001' AND cc_pjt_cd='CC20260006' ORDER BY cost_seq LIMIT 1");
  const ccT = await client.query("SELECT * FROM pcm_cur_cost_code WHERE ten_id='T001' AND cc_pjt_cd='CC_S01' ORDER BY cost_seq LIMIT 1");
  if (ccW.rows.length > 0 && ccT.rows.length > 0) {
    console.log('Working CC CostCode:', JSON.stringify(ccW.rows[0]));
    console.log('Test CC CostCode:', JSON.stringify(ccT.rows[0]));
  }

  // Check TC Manager differences
  console.log('\n--- TC Manager structure check ---');
  const tmW = await client.query("SELECT * FROM pcm_tgt_manager WHERE ten_id='T001' AND tgt_pjt_cd='TC20260006' ORDER BY mgr_seq LIMIT 1");
  const tmT = await client.query("SELECT * FROM pcm_tgt_manager WHERE ten_id='T001' AND tgt_pjt_cd='TC_S01' ORDER BY mgr_seq LIMIT 1");
  if (tmW.rows.length > 0 && tmT.rows.length > 0) {
    console.log('Working TC Manager:', JSON.stringify(tmW.rows[0]));
    console.log('Test TC Manager:', JSON.stringify(tmT.rows[0]));
  }

  await client.end();
  console.log('\nDone!');
}

run().catch(e => { console.error(e); process.exit(1); });
