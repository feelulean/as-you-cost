/**
 * Fix remaining structural differences in test data
 * 1. EC Detail: NULL columns (order_type, recv_dt, etc.)
 * 2. CC CostCode: sop_ym/eop_ym format (YYYYMM not YYYY-MM)
 */
const { Client } = require('pg');

async function run() {
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

  // FIX 1: EC Detail - fill NULL columns for test projects
  console.log('=== FIX 1: EC Detail NULL columns ===');
  const testEcs = ['EC_TC_S01', 'EC_TC_R01', 'EC_TC_M01'];
  for (const ec of testEcs) {
    const r = await client.query(`
      UPDATE pcm_ec_detail SET
        recv_dt = COALESCE(recv_dt, '2026-01-10'),
        submit_dt = COALESCE(submit_dt, '2026-02-15'),
        price_comp = COALESCE(price_comp, 'H'),
        order_type = COALESCE(order_type, 'NEW'),
        order_prob = COALESCE(order_prob, 'M'),
        order_reason = COALESCE(order_reason, 'Test Order'),
        competitor = COALESCE(competitor, 'Competitor'),
        dev_poss = COALESCE(dev_poss, 'L')
      WHERE ten_id = 'T001' AND ec_pjt_cd = $1
    `, [ec]);
    console.log(`  ${ec}: ${r.rowCount} rows updated`);
  }

  // FIX 2: CC CostCode sop_ym/eop_ym format fix (YYYY-MM -> YYYYMM)
  console.log('\n=== FIX 2: CC CostCode sop_ym/eop_ym format ===');
  const testCcs = ['CC_S01', 'CC_R01', 'CC_M01'];
  for (const cc of testCcs) {
    // Check current values
    const rows = await client.query(
      `SELECT cost_seq, sop_ym, eop_ym FROM pcm_cur_cost_code WHERE ten_id='T001' AND cc_pjt_cd=$1`, [cc]
    );
    for (const row of rows.rows) {
      let changed = false;
      let newSop = row.sop_ym;
      let newEop = row.eop_ym;

      // Fix YYYY-MM to YYYYMM format
      if (newSop && newSop.includes('-')) {
        newSop = newSop.replace(/-/g, '');
        changed = true;
      }
      if (newEop && newEop.includes('-')) {
        newEop = newEop.replace(/-/g, '');
        changed = true;
      }

      if (changed) {
        await client.query(
          `UPDATE pcm_cur_cost_code SET sop_ym=$1, eop_ym=$2 WHERE ten_id='T001' AND cc_pjt_cd=$3 AND cc_rev=1 AND cost_seq=$4`,
          [newSop, newEop, cc, row.cost_seq]
        );
        console.log(`  ${cc} seq=${row.cost_seq}: ${row.sop_ym}->${newSop}, ${row.eop_ym}->${newEop}`);
      } else {
        console.log(`  ${cc} seq=${row.cost_seq}: OK (${row.sop_ym}/${row.eop_ym})`);
      }
    }
  }

  // FIX 3: Check EC CostCode sop_ym/eop_ym format too
  console.log('\n=== FIX 3: EC CostCode sop_ym/eop_ym format ===');
  for (const ec of testEcs) {
    const rows = await client.query(
      `SELECT cost_cd, sop_ym, eop_ym FROM pcm_ec_cost_code WHERE ten_id='T001' AND ec_pjt_cd=$1`, [ec]
    );
    for (const row of rows.rows) {
      let changed = false;
      let newSop = row.sop_ym;
      let newEop = row.eop_ym;

      if (newSop && newSop.includes('-')) {
        newSop = newSop.replace(/-/g, '');
        changed = true;
      }
      if (newEop && newEop.includes('-')) {
        newEop = newEop.replace(/-/g, '');
        changed = true;
      }

      if (changed) {
        await client.query(
          `UPDATE pcm_ec_cost_code SET sop_ym=$1, eop_ym=$2 WHERE ten_id='T001' AND ec_pjt_cd=$3 AND cost_cd=$4`,
          [newSop, newEop, ec, row.cost_cd]
        );
        console.log(`  ${ec} ${row.cost_cd}: ${row.sop_ym}->${newSop}, ${row.eop_ym}->${newEop}`);
      } else {
        console.log(`  ${ec} ${row.cost_cd}: OK (${row.sop_ym}/${row.eop_ym})`);
      }
    }
  }

  // VERIFICATION
  console.log('\n═══════════════════════════════════');
  console.log('  VERIFICATION');
  console.log('═══════════════════════════════════\n');

  // EC Detail check
  console.log('--- EC Detail order_type ---');
  for (const ec of testEcs) {
    const r = await client.query(
      `SELECT order_type, recv_dt, factory_type FROM pcm_ec_detail WHERE ten_id='T001' AND ec_pjt_cd=$1`, [ec]
    );
    if (r.rows.length > 0) {
      const d = r.rows[0];
      console.log(`  ${ec}: order_type=${d.order_type}, recv_dt=${d.recv_dt}, factory_type=${d.factory_type}`);
    }
  }

  // CC CostCode check
  console.log('\n--- CC CostCode sop_ym/eop_ym ---');
  for (const cc of testCcs) {
    const r = await client.query(
      `SELECT cost_cd, sop_ym, eop_ym FROM pcm_cur_cost_code WHERE ten_id='T001' AND cc_pjt_cd=$1`, [cc]
    );
    r.rows.forEach(row => {
      console.log(`  ${cc} ${row.cost_cd}: sop=${row.sop_ym}, eop=${row.eop_ym}`);
    });
  }

  await client.end();
  console.log('\nDone!');
}

run().catch(e => { console.error(e); process.exit(1); });
