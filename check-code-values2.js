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

async function q(label, sql) {
  console.log('\n' + '='.repeat(100));
  console.log('  ' + label);
  console.log('='.repeat(100));
  try {
    const res = await client.query(sql);
    if (!res.rows.length) { console.log('  (no rows)'); return; }
    const cols = res.fields.map(f => f.name);
    const w = cols.map(c => c.length);
    res.rows.forEach(r => cols.forEach((c,i) => { const v=(r[c]==null?'NULL':String(r[c])); if(v.length>w[i])w[i]=v.length; }));
    w.forEach((_,i) => { if(w[i]>50) w[i]=50; });
    console.log('  ' + cols.map((c,i) => c.padEnd(w[i])).join(' | '));
    console.log('  ' + w.map(x => '-'.repeat(x)).join('-+-'));
    res.rows.forEach(r => console.log('  ' + cols.map((c,i) => (r[c]==null?'NULL':String(r[c])).substring(0,50).padEnd(w[i])).join(' | ')));
    console.log('  (' + res.rows.length + ' rows)');
  } catch(e) { console.log('  ERROR: ' + e.message); }
}

async function main() {
  await client.connect();
  console.log('Connected to database.\n');

  const ec = "('EC20260006','EC_TC_S01','EC_TC_R01','EC_TC_M01')";
  const cc = "('CC20260006','CC_S01','CC_R01','CC_M01')";
  const tc = "('TC20260006','TC_S01','TC_R01','TC_M01')";

  // ========== QUERY 1: Code Groups with Detail Codes ==========
  await q('QUERY 1: Code Groups T005-T020, T038-T045 with Detail Codes',
    "SELECT g.grp_cd, g.grp_nm, d.dtl_cd, d.cd_nm, d.sort_no FROM asyoucost.pcm_com_grp_cd g LEFT JOIN asyoucost.pcm_com_dtl_cd d ON g.ten_id = d.ten_id AND g.grp_cd = d.grp_cd WHERE g.ten_id='T001' AND g.grp_cd IN ('T005','T006','T007','T008','T009','T010','T011','T012','T013','T014','T015','T016','T017','T018','T019','T020','T038','T039','T040','T041','T042','T043','T044','T045') ORDER BY g.grp_cd, d.sort_no");

  // ========== QUERY 2: H/M/L or grade values ==========
  await q('QUERY 2: Code Groups containing H/M/L or grade values',
    "SELECT g.grp_cd, g.grp_nm, d.dtl_cd, d.cd_nm FROM asyoucost.pcm_com_grp_cd g JOIN asyoucost.pcm_com_dtl_cd d ON g.ten_id = d.ten_id AND g.grp_cd = d.grp_cd WHERE g.ten_id='T001' AND (d.dtl_cd IN ('H','M','L') OR d.cd_nm LIKE '%\uc0c1%' OR d.cd_nm LIKE '%\uc911%' OR d.cd_nm LIKE '%\ud558%') ORDER BY g.grp_cd, d.sort_no");

  // ========== QUERY 3: EC tables ==========
  await q('Q3a: EC Sensitivity (sens_ver, sens_nm, end_yn)',
    "SELECT ec_pjt_cd, sens_ver, sens_nm, end_yn FROM asyoucost.pcm_ec_sensitivity WHERE ten_id='T001' AND ec_pjt_cd IN " + ec);

  await q('Q3b: EC Sensitivity Var (var_type, var_nm, cost_cd)',
    "SELECT ec_pjt_cd, sens_ver, var_type, var_nm, cost_cd FROM asyoucost.pcm_ec_sensitivity_var WHERE ten_id='T001' AND ec_pjt_cd IN " + ec);

  await q('Q3c: EC Manager (dept_type, role_type)',
    "SELECT ec_pjt_cd, seq_no, dept_type, role_type, user_nm FROM asyoucost.pcm_ec_manager WHERE ten_id='T001' AND ec_pjt_cd IN " + ec);

  await q('Q3d: EC Schedule (task_cd, task_nm)',
    "SELECT ec_pjt_cd, task_cd, task_nm, start_dt, end_dt FROM asyoucost.pcm_ec_schedule WHERE ten_id='T001' AND ec_pjt_cd IN " + ec);

  await q('Q3e: EC MFG Cost (cost_cd)',
    "SELECT ec_pjt_cd, cost_cd FROM asyoucost.pcm_ec_mfg_cost WHERE ten_id='T001' AND ec_pjt_cd IN " + ec);

  await q('Q3f: EC SGA Cost (cost_cd)',
    "SELECT ec_pjt_cd, cost_cd FROM asyoucost.pcm_ec_sga_cost WHERE ten_id='T001' AND ec_pjt_cd IN " + ec);

  await q('Q3g: EC Manpower (mp_type, process_type)',
    "SELECT ec_pjt_cd, mp_seq, mp_type, mp_nm, process_type FROM asyoucost.pcm_ec_manpower WHERE ten_id='T001' AND ec_pjt_cd IN " + ec);

  await q('Q3h: EC BOM (new_part_yn)',
    "SELECT ec_pjt_cd, item_cd, item_nm, new_part_yn, lvl FROM asyoucost.pcm_ec_bom WHERE ten_id='T001' AND ec_pjt_cd IN " + ec);

  await q('Q3i: EC Fund Plan (source_type)',
    "SELECT ec_pjt_cd, fund_seq, source_type, currency FROM asyoucost.pcm_ec_fund_plan WHERE ten_id='T001' AND ec_pjt_cd IN " + ec);

  await q('Q3j: EC PL Statement (view_type, view_key)',
    "SELECT ec_pjt_cd, view_type, view_key, year_val FROM asyoucost.pcm_ec_pl_stmt WHERE ten_id='T001' AND ec_pjt_cd IN " + ec + " ORDER BY ec_pjt_cd, view_type, view_key, year_val LIMIT 50");

  // ========== QUERY 4: CC (Current Cost) tables ==========
  await q('Q4a: CC Schedule (task_nm, proc_sts)',
    "SELECT cc_pjt_cd, cc_rev, sched_seq, task_nm, proc_sts FROM asyoucost.pcm_cur_schedule WHERE ten_id='T001' AND cc_pjt_cd IN " + cc);

  await q('Q4b: CC Manager (dept_div, role_cd)',
    "SELECT cc_pjt_cd, cc_rev, mgr_seq, dept_div, role_cd, mgr_nm FROM asyoucost.pcm_cur_manager WHERE ten_id='T001' AND cc_pjt_cd IN " + cc);

  await q('Q4c: CC BOM (part_div)',
    "SELECT cc_pjt_cd, cc_rev, cost_cd, bom_seq, part_no, part_nm, part_div FROM asyoucost.pcm_cur_bom WHERE ten_id='T001' AND cc_pjt_cd IN " + cc + " LIMIT 30");

  await q('Q4d: CC ActEval (tgt_cost_cd, achv_yn)',
    "SELECT cc_pjt_cd, cc_rev, tgt_cost_cd, eval_seq, cost_item_nm, achv_yn FROM asyoucost.pcm_cur_act_eval WHERE ten_id='T001' AND cc_pjt_cd IN " + cc);

  // ========== QUERY 5: TC (Target Cost) tables ==========
  await q('Q5a: TC Manager (dept_div, role_cd)',
    "SELECT tgt_pjt_cd, mgr_seq, dept_div, role_cd, mgr_nm, position FROM asyoucost.pcm_tgt_manager WHERE ten_id='T001' AND tgt_pjt_cd IN " + tc);

  await q('Q5b: TC Spec (car_type, prod_grp)',
    "SELECT tgt_pjt_cd, spec_seq, ec_pjt_cd, tgt_cost_cd, prod_grp, car_type, oem_nm FROM asyoucost.pcm_tgt_spec WHERE ten_id='T001' AND tgt_pjt_cd IN " + tc);

  await q('Q5c: TC Price (currency, tgt_cost_cd)',
    "SELECT tgt_pjt_cd, price_seq, tgt_cost_cd, currency, est_sell_price, sop_ym, eop_ym FROM asyoucost.pcm_tgt_price WHERE ten_id='T001' AND tgt_pjt_cd IN " + tc);

  await q('Q5d: TC AchvPlan (cost_item_cd)',
    "SELECT tgt_pjt_cd, plan_seq, cost_item_cd, cost_item_nm, confirm_yn FROM asyoucost.pcm_tgt_achv_plan WHERE ten_id='T001' AND tgt_pjt_cd IN " + tc);

  await q('Q5e: TC DevSchedule (sched_type, eval_round)',
    "SELECT tgt_pjt_cd, sched_seq, sched_type, sched_nm, eval_round, proc_yn FROM asyoucost.pcm_tgt_dev_schedule WHERE ten_id='T001' AND tgt_pjt_cd IN " + tc);

  await q('Q5f: TC SetupSchedule (dept_nm, proc_yn)',
    "SELECT tgt_pjt_cd, setup_seq, dept_nm, proc_yn, email_sent FROM asyoucost.pcm_tgt_setup_schedule WHERE ten_id='T001' AND tgt_pjt_cd IN " + tc);

  await client.end();
  console.log('\n\nDone.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
