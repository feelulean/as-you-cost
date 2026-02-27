const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.zxenhxqhfglorxgibmrz',
  password: 'admin1004!@#$',
  ssl: { rejectUnauthorized: false }
});

async function q(sql) {
  return (await client.query(sql)).rows;
}

async function run() {
  await client.connect();
  await client.query('SET search_path TO asyoucost, public');
  console.log('Connected to database.\n');

  // ── 1. Code master tables ──
  console.log('='.repeat(80));
  console.log('1. CODE MASTER VALUES (T038, T039, T040, T005, T006, T007)');
  console.log('='.repeat(80));
  const codeMaster = await q(
    "SELECT grp_cd, dtl_cd, cd_nm, sort_no FROM pcm_com_dtl_cd WHERE ten_id='T001' AND grp_cd IN ('T038','T039','T040','T005','T006','T007') ORDER BY grp_cd, sort_no"
  );
  let currentGrp = '';
  for (const r of codeMaster) {
    if (r.grp_cd !== currentGrp) {
      currentGrp = r.grp_cd;
      console.log('\n  [' + r.grp_cd + ']');
      console.log('  ' + 'dtl_cd'.padEnd(12) + ' ' + 'cd_nm'.padEnd(30) + ' sort_no');
      console.log('  ' + '-'.repeat(12) + ' ' + '-'.repeat(30) + ' ' + '-'.repeat(10));
    }
    console.log('  ' + (r.dtl_cd || '').padEnd(12) + ' ' + (r.cd_nm || '').padEnd(30) + ' ' + r.sort_no);
  }

  // ── 2. EC20260006 reference data ──
  console.log('\n' + '='.repeat(80));
  console.log('2. REFERENCE PROJECT: EC20260006');
  console.log('='.repeat(80));

  console.log('\n  [pcm_ec_detail] - order_prob, dev_poss, price_comp');
  console.table(await q("SELECT ec_pjt_cd, order_prob, dev_poss, price_comp FROM pcm_ec_detail WHERE ten_id='T001' AND ec_pjt_cd='EC20260006'"));

  console.log('\n  [pcm_ec_line_invest] - line_type');
  console.table(await q("SELECT ec_pjt_cd, line_seq, line_type, line_nm FROM pcm_ec_line_invest WHERE ten_id='T001' AND ec_pjt_cd='EC20260006' ORDER BY line_seq"));

  console.log('\n  [pcm_ec_other_invest] - invest_type, depr_type');
  console.table(await q("SELECT ec_pjt_cd, invest_seq, invest_nm, invest_type, depr_type FROM pcm_ec_other_invest WHERE ten_id='T001' AND ec_pjt_cd='EC20260006' ORDER BY invest_seq"));

  console.log('\n  [pcm_ec_npv] - analysis_type');
  console.table(await q("SELECT ec_pjt_cd, analysis_ver, analysis_type FROM pcm_ec_npv WHERE ten_id='T001' AND ec_pjt_cd='EC20260006'"));

  console.log('\n  [pcm_ec_sensitivity] - sens_nm');
  console.table(await q("SELECT ec_pjt_cd, sens_ver, sens_nm, end_yn FROM pcm_ec_sensitivity WHERE ten_id='T001' AND ec_pjt_cd='EC20260006'"));

  // ── 3. Test project data ──
  console.log('\n' + '='.repeat(80));
  console.log('3. TEST PROJECTS: EC_TC_S01, EC_TC_R01, EC_TC_M01');
  console.log('='.repeat(80));

  console.log('\n  [pcm_ec_detail] - order_prob, dev_poss, price_comp');
  console.table(await q("SELECT ec_pjt_cd, order_prob, dev_poss, price_comp FROM pcm_ec_detail WHERE ten_id='T001' AND ec_pjt_cd IN ('EC_TC_S01','EC_TC_R01','EC_TC_M01') ORDER BY ec_pjt_cd"));

  console.log('\n  [pcm_ec_line_invest] - line_type');
  console.table(await q("SELECT ec_pjt_cd, line_seq, line_type, line_nm FROM pcm_ec_line_invest WHERE ten_id='T001' AND ec_pjt_cd IN ('EC_TC_S01','EC_TC_R01','EC_TC_M01') ORDER BY ec_pjt_cd, line_seq"));

  console.log('\n  [pcm_ec_other_invest] - invest_type, depr_type');
  console.table(await q("SELECT ec_pjt_cd, invest_seq, invest_nm, invest_type, depr_type FROM pcm_ec_other_invest WHERE ten_id='T001' AND ec_pjt_cd IN ('EC_TC_S01','EC_TC_R01','EC_TC_M01') ORDER BY ec_pjt_cd, invest_seq"));

  console.log('\n  [pcm_ec_npv] - analysis_type');
  console.table(await q("SELECT ec_pjt_cd, analysis_ver, analysis_type FROM pcm_ec_npv WHERE ten_id='T001' AND ec_pjt_cd IN ('EC_TC_S01','EC_TC_R01','EC_TC_M01') ORDER BY ec_pjt_cd"));

  console.log('\n  [pcm_ec_sensitivity] - sens_nm');
  console.table(await q("SELECT ec_pjt_cd, sens_ver, sens_nm, end_yn FROM pcm_ec_sensitivity WHERE ten_id='T001' AND ec_pjt_cd IN ('EC_TC_S01','EC_TC_R01','EC_TC_M01') ORDER BY ec_pjt_cd"));

  // ── 4. TC tables check ──
  console.log('\n' + '='.repeat(80));
  console.log('4. TC TABLES CHECK');
  console.log('='.repeat(80));

  console.log('\n  [pcm_tgt_cost_reg] - view_mode');
  console.table(await q("SELECT tgt_pjt_cd, cost_seq, cost_item_cd, view_mode FROM pcm_tgt_cost_reg WHERE ten_id='T001' AND tgt_pjt_cd IN ('TC20260006','TC_S01','TC_R01','TC_M01') ORDER BY tgt_pjt_cd, cost_seq"));

  console.log('\n  [pcm_tgt_guide] - cost_item_cd, dept_cd');
  console.table(await q("SELECT tgt_pjt_cd, guide_seq, cost_item_cd, dept_cd FROM pcm_tgt_guide WHERE ten_id='T001' AND tgt_pjt_cd IN ('TC20260006','TC_S01','TC_R01','TC_M01') ORDER BY tgt_pjt_cd, guide_seq"));

  // ── 5. CC tables check ──
  console.log('\n' + '='.repeat(80));
  console.log('5. CC TABLES CHECK');
  console.log('='.repeat(80));

  console.log('\n  [pcm_cur_detail] - cc_pjt_cd, cc_rev');
  console.table(await q("SELECT cc_pjt_cd, cc_rev, rev_nm, sts FROM pcm_cur_detail WHERE ten_id='T001' AND cc_pjt_cd IN ('CC20260006','CC_S01','CC_R01','CC_M01') ORDER BY cc_pjt_cd"));

  // ── 6. All code groups ──
  console.log('\n' + '='.repeat(80));
  console.log('6. ALL CODE GROUPS');
  console.log('='.repeat(80));

  const codeGrps = await q("SELECT grp_cd, grp_nm FROM pcm_com_grp_cd WHERE ten_id='T001' ORDER BY grp_cd");
  console.log('');
  for (const r of codeGrps) {
    console.log('  ' + (r.grp_cd || '').padEnd(10) + ' ' + (r.grp_nm || ''));
  }

  await client.end();
  console.log('\nDone.');
}

run().catch(err => { console.error(err); process.exit(1); });
