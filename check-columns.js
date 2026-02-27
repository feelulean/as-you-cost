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

  const tables = [
    'pcm_ec_pjt_mstr',
    'pcm_ec_pl_stmt',
    'pcm_tgt_pjt_mstr',
    'pcm_tgt_cost_reg',
    'pcm_cur_pjt_mstr',
    'pcm_cur_pl_stmt',
    'pcm_cur_achv_eval_dtl'
  ];

  for (const t of tables) {
    const res = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='asyoucost' AND table_name='${t}'
      ORDER BY ordinal_position
    `);
    console.log(`${t}: ${res.rows.map(r => r.column_name).join(', ')}`);
  }

  await client.end();
}
run().catch(err => { console.error(err.message); process.exit(1); });
