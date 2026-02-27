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

async function run() {
  await client.connect();
  await client.query('SET search_path TO asyoucost, public');
  console.log('=== Connected to PostgreSQL (schema: asyoucost) ===\n');

  const queries = [
    {
      label: '1. PCM_EC_PJT_MSTR (EC Project Master)',
      sql: `SELECT EC_PJT_CD, PJT_NM, STS
             FROM PCM_EC_PJT_MSTR
             WHERE TEN_ID='T001' AND EC_PJT_CD IN ('EC_TC_S01','EC_TC_R01','EC_TC_M01')`
    },
    {
      label: '2. PCM_EC_PL_STMT (EC P&L Statement)',
      sql: `SELECT EC_PJT_CD, VIEW_TYPE, VIEW_KEY, YEAR_VAL, SALES_AMT, MAT_COST, LABOR_COST, MFG_COST, TOTAL_MFG_COST, GROSS_PROFIT, SGA_COST, OPER_INCOME, OPER_MARGIN
             FROM PCM_EC_PL_STMT
             WHERE TEN_ID='T001' AND EC_PJT_CD IN ('EC_TC_S01','EC_TC_R01','EC_TC_M01')
             ORDER BY EC_PJT_CD, VIEW_TYPE, VIEW_KEY`
    },
    {
      label: '3. PCM_TGT_PJT_MSTR (Target Project Master)',
      sql: `SELECT TGT_PJT_CD, PJT_NM, EC_PJT_CD
             FROM PCM_TGT_PJT_MSTR
             WHERE TEN_ID='T001' AND TGT_PJT_CD IN ('TC_S01','TC_R01','TC_M01')`
    },
    {
      label: '4. PCM_TGT_COST_REG (Target Cost Registration)',
      sql: `SELECT TGT_PJT_CD, COST_ITEM_CD, COST_ITEM_NM, EC_COST_AMT, GUIDE_AMT, FINAL_TGT_AMT, SAVE_TGT_AMT
             FROM PCM_TGT_COST_REG
             WHERE TEN_ID='T001' AND TGT_PJT_CD IN ('TC_S01','TC_R01','TC_M01')
             ORDER BY TGT_PJT_CD, COST_ITEM_CD`
    },
    {
      label: '5. PCM_CUR_PJT_MSTR (Current Cost Project Master)',
      sql: `SELECT CC_PJT_CD, CC_REV, EC_PJT_CD, PJT_NM
             FROM PCM_CUR_PJT_MSTR
             WHERE TEN_ID='T001' AND CC_PJT_CD IN ('CC_S01','CC_R01','CC_M01')`
    },
    {
      label: '6. PCM_CUR_PL_STMT (Current Cost P&L Statement)',
      sql: `SELECT CC_PJT_CD, CC_REV, PL_SEQ, COST_ITEM, TOT_AMT, UNIT_AMT, RATE_VAL
             FROM PCM_CUR_PL_STMT
             WHERE TEN_ID='T001' AND CC_PJT_CD IN ('CC_S01','CC_R01','CC_M01')
             ORDER BY CC_PJT_CD, PL_SEQ`
    },
    {
      label: '7. PCM_CUR_ACHV_EVAL_DTL (Achievement Evaluation Detail)',
      sql: `SELECT CC_PJT_CD, CC_REV, COST_ITEM_CD, COST_ITEM_NM, EC_AMT, TGT_AMT, SAVE_TGT_AMT, CUR_AMT, SAVE_ACT_AMT, ACHV_RATE, ACHV_YN
             FROM PCM_CUR_ACHV_EVAL_DTL
             WHERE TEN_ID='T001' AND CC_PJT_CD IN ('CC_S01','CC_R01','CC_M01')
             ORDER BY CC_PJT_CD, COST_ITEM_CD`
    }
  ];

  for (const q of queries) {
    console.log('='.repeat(90));
    console.log(q.label);
    console.log('='.repeat(90));
    try {
      const res = await client.query(q.sql);
      if (res.rows.length === 0) {
        console.log('  >>> NO ROWS RETURNED <<<\n');
      } else {
        const cols = res.fields.map(f => f.name);
        // Calculate column widths
        const widths = cols.map(c => {
          let max = c.length;
          for (const row of res.rows) {
            const v = row[c];
            const s = v === null || v === undefined ? 'NULL' : String(v);
            if (s.length > max) max = s.length;
          }
          return Math.min(max, 20); // cap at 20
        });
        // Header
        console.log('  ' + cols.map((c, i) => c.padEnd(widths[i])).join(' | '));
        console.log('  ' + widths.map(w => '-'.repeat(w)).join('-+-'));
        // Rows
        for (const row of res.rows) {
          const vals = cols.map((c, i) => {
            const v = row[c];
            const s = v === null || v === undefined ? 'NULL' : String(v);
            return s.substring(0, 20).padEnd(widths[i]);
          });
          console.log('  ' + vals.join(' | '));
        }
        console.log(`\n  >>> ${res.rows.length} row(s) returned <<<\n`);
      }
    } catch (err) {
      console.log(`  >>> ERROR: ${err.message} <<<\n`);
    }
  }

  await client.end();
  console.log('=== Verification Complete ===');
}

run().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
