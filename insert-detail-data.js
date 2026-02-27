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
  console.log('Connected to PostgreSQL (schema: asyoucost)');

  console.log('
=== Step 1: Insert into PCM_CUR_DETAIL ===');
  try {
    const curSQL = `
      INSERT INTO PCM_CUR_DETAIL (TEN_ID, CC_PJT_CD, CC_REV, REV_NM, FACTORY_DIV, FACTORY_NM, CORP_DIV, CORP_NM, COMPOSE_YN, RMK, STS, REGR_ID, REG_DTTM, MODR_ID, MOD_DTTM)
      VALUES 
