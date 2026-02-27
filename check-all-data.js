const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.zxenhxqhfglorxgibmrz',
  password: 'admin1004!@#$',
  ssl: { rejectUnauthorized: false },
});

const SCHEMA = 'asyoucost';

const tableGroups = {
  'EC (EC20260006)': {
    idValue: 'EC20260006',
    idCol: 'ec_pjt_cd',
    tables: [
      'pcm_ec_pjt_mstr', 'pcm_ec_detail', 'pcm_ec_cost_code', 'pcm_ec_qty_disc',
      'pcm_ec_manager', 'pcm_ec_schedule', 'pcm_ec_line_invest', 'pcm_ec_other_invest',
      'pcm_ec_manpower', 'pcm_ec_mfg_cost', 'pcm_ec_sga_cost', 'pcm_ec_bom',
      'pcm_ec_pl_stmt', 'pcm_ec_sensitivity', 'pcm_ec_sensitivity_var',
      'pcm_ec_fund_plan', 'pcm_ec_npv', 'pcm_ec_profit',
    ],
  },
  'TC (TC20260006)': {
    idValue: 'TC20260006',
    idCol: 'tgt_pjt_cd',
    tables: [
      'pcm_tgt_pjt_mstr', 'pcm_tgt_manager', 'pcm_tgt_spec', 'pcm_tgt_price',
      'pcm_tgt_qty_disc', 'pcm_tgt_dev_schedule', 'pcm_tgt_setup_schedule',
      'pcm_tgt_guide', 'pcm_tgt_cost_reg', 'pcm_tgt_achv_plan',
      'pcm_tgt_achv_plan_dtl', 'pcm_tgt_recalc', 'pcm_tgt_achv_status', 'pcm_tgt_profit',
    ],
  },
  'CC (CC20260006)': {
    idValue: 'CC20260006',
    idCol: 'cc_pjt_cd',
    tables: [
      'pcm_cur_pjt_mstr', 'pcm_cur_detail', 'pcm_cur_cost_code', 'pcm_cur_qty_disc',
      'pcm_cur_manager', 'pcm_cur_schedule', 'pcm_cur_bom', 'pcm_cur_part_price',
      'pcm_cur_act_eval',
    ],
  },
  'Achievement (CC20260006)': {
    idValue: 'CC20260006',
    idCol: 'cc_pjt_cd',
    tables: ['pcm_cur_achv_eval'],
  },
};

async function checkTable(client, tableName, idCol, idValue) {
  try {
    const colRes = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position`,
      [SCHEMA, tableName]
    );
    const columns = colRes.rows.map(r => r.column_name);
    if (columns.length === 0) return { exists: false, error: 'TABLE NOT FOUND' };

    let actualIdCol = idCol;
    if (!columns.includes(idCol)) {
      // Try common alternatives
      const candidates = ['ec_pjt_cd', 'tgt_pjt_cd', 'cc_pjt_cd'];
      actualIdCol = candidates.find(c => columns.includes(c));
      if (!actualIdCol) return { exists: true, count: -1, error: `ID column '${idCol}' not found. Columns: ${columns.join(', ')}` };
    }

    const countRes = await client.query(
      `SELECT COUNT(*) as cnt FROM ${SCHEMA}.${tableName} WHERE ${actualIdCol} = $1`, [idValue]
    );
    const count = parseInt(countRes.rows[0].cnt);
    if (count === 0) return { exists: true, count: 0, columns, idCol: actualIdCol, sample: null };

    const sampleRes = await client.query(
      `SELECT * FROM ${SCHEMA}.${tableName} WHERE ${actualIdCol} = $1 LIMIT 1`, [idValue]
    );
    return { exists: true, count, columns, idCol: actualIdCol, sample: sampleRes.rows[0] };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

function fv(val) {
  if (val === null) return 'NULL';
  if (val === undefined) return 'undefined';
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'object') return JSON.stringify(val);
  if (typeof val === 'string' && val.length > 100) return val.substring(0, 100) + '...';
  return String(val);
}

async function main() {
  const client = await pool.connect();
  try {
    console.log('='.repeat(120));
    console.log('  DATABASE CHECK: EC20260006 / TC20260006 / CC20260006 - ALL TABLES');
    console.log('='.repeat(120));

    let summaryData = [];
    let summaryEmpty = [];

    for (const [groupName, groupDef] of Object.entries(tableGroups)) {
      console.log('\n' + '#'.repeat(120));
      console.log(`  GROUP: ${groupName}`);
      console.log('#'.repeat(120));

      for (const table of groupDef.tables) {
        const result = await checkTable(client, table, groupDef.idCol, groupDef.idValue);
        console.log(`\n--- TABLE: ${SCHEMA}.${table}  |  Search: ${groupDef.idCol} = '${groupDef.idValue}' ---`);

        if (!result.exists) {
          console.log(`  STATUS: ERROR - ${result.error}`);
          summaryEmpty.push({ group: groupName, table, status: 'ERROR: ' + result.error });
          continue;
        }
        if (result.count < 0) {
          console.log(`  STATUS: ERROR - ${result.error}`);
          summaryEmpty.push({ group: groupName, table, status: result.error });
          continue;
        }
        if (result.count === 0) {
          console.log(`  STATUS: EMPTY (0 rows)`);
          summaryEmpty.push({ group: groupName, table, status: 'EMPTY' });
          continue;
        }

        console.log(`  STATUS: HAS DATA  |  Rows: ${result.count}  |  ID col: ${result.idCol}`);
        summaryData.push({ group: groupName, table, count: result.count });

        console.log(`  SAMPLE (1 of ${result.count}):`);
        for (const key of Object.keys(result.sample)) {
          console.log(`    ${key.padEnd(30)} = ${fv(result.sample[key])}`);
        }
      }
    }

    // SUMMARY
    console.log('\n\n' + '='.repeat(120));
    console.log('  SUMMARY');
    console.log('='.repeat(120));

    console.log('\n  [TABLES WITH DATA]');
    if (summaryData.length === 0) console.log('    (none)');
    else for (const i of summaryData)
      console.log(`    ${i.group.padEnd(28)} | ${i.table.padEnd(35)} | ${i.count} rows`);

    console.log('\n  [TABLES EMPTY OR ERROR]');
    if (summaryEmpty.length === 0) console.log('    (none)');
    else for (const i of summaryEmpty)
      console.log(`    ${i.group.padEnd(28)} | ${i.table.padEnd(35)} | ${i.status}`);

    console.log('\n  TOTALS:');
    console.log(`    Tables with data : ${summaryData.length}`);
    console.log(`    Tables empty     : ${summaryEmpty.filter(e => e.status === 'EMPTY').length}`);
    console.log(`    Tables error     : ${summaryEmpty.filter(e => e.status !== 'EMPTY').length}`);
    console.log(`    Total checked    : ${summaryData.length + summaryEmpty.length}`);
    console.log('='.repeat(120));

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
