/**
 * Compare working data (EC20260006) vs test data to find structural differences
 */
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
  console.log('Connected.\n');

  const TEN = 'T001';

  // ══════════════════════════════════════════════════════════
  // 1. 견적원가 프로젝트 비교 (EC 프로젝트 마스터)
  // ══════════════════════════════════════════════════════════
  console.log('════════ PCM_EC_PJT (견적원가 프로젝트) ════════');
  const ecPjts = await client.query(`
    SELECT * FROM PCM_EC_PJT
    WHERE TEN_ID=$1 AND PJT_CD IN ('EC20260006', 'EC_TC_S01')
    ORDER BY PJT_CD
  `, [TEN]);
  ecPjts.rows.forEach(r => {
    console.log(`\n  [${r.pjt_cd}]`);
    Object.keys(r).forEach(k => console.log(`    ${k}: ${r[k]}`));
  });

  // ══════════════════════════════════════════════════════════
  // 2. 견적원가 상세 (EC Detail)
  // ══════════════════════════════════════════════════════════
  console.log('\n\n════════ PCM_EC_DETAIL (견적원가 상세) ════════');
  const ecDetails = await client.query(`
    SELECT * FROM PCM_EC_DETAIL
    WHERE TEN_ID=$1 AND EC_PJT_CD IN ('EC20260006', 'EC_TC_S01')
    ORDER BY EC_PJT_CD, DETAIL_SEQ
  `, [TEN]);
  ecDetails.rows.forEach(r => {
    console.log(`\n  [${r.ec_pjt_cd} / seq=${r.detail_seq}]`);
    Object.keys(r).forEach(k => console.log(`    ${k}: ${r[k]}`));
  });

  // ══════════════════════════════════════════════════════════
  // 3. BOM 비교
  // ══════════════════════════════════════════════════════════
  console.log('\n\n════════ PCM_EC_BOM (BOM) ════════');
  const ecBoms = await client.query(`
    SELECT EC_PJT_CD, BOM_SEQ, PART_NO, PART_NM, PART_DIV, QTY, COST_CD
    FROM PCM_EC_BOM
    WHERE TEN_ID=$1 AND EC_PJT_CD IN ('EC20260006', 'EC_TC_S01')
    ORDER BY EC_PJT_CD, BOM_SEQ
    LIMIT 10
  `, [TEN]);
  console.log('  Count:', ecBoms.rows.length);
  ecBoms.rows.forEach(r => console.log(`  [${r.ec_pjt_cd}] seq=${r.bom_seq} ${r.part_no} ${r.part_nm} div=${r.part_div} qty=${r.qty} costCd=${r.cost_cd}`));

  // ══════════════════════════════════════════════════════════
  // 4. 원가코드 비교
  // ══════════════════════════════════════════════════════════
  console.log('\n\n════════ PCM_EC_COST_CODE (원가코드) ════════');
  const costCodes = await client.query(`
    SELECT * FROM PCM_EC_COST_CODE
    WHERE TEN_ID=$1 AND EC_PJT_CD IN ('EC20260006', 'EC_TC_S01')
    ORDER BY EC_PJT_CD, COST_CODE_SEQ
  `, [TEN]);
  costCodes.rows.forEach(r => {
    console.log(`\n  [${r.ec_pjt_cd} / costCd=${r.cost_cd}]`);
    Object.keys(r).forEach(k => console.log(`    ${k}: ${r[k]}`));
  });

  // ══════════════════════════════════════════════════════════
  // 5. P&L 비교
  // ══════════════════════════════════════════════════════════
  console.log('\n\n════════ PCM_EC_PL_STMT (P&L) ════════');
  const plStmt = await client.query(`
    SELECT EC_PJT_CD, SORT_NO, ITEM_CD, ITEM_NM, TOTAL_AMT
    FROM PCM_EC_PL_STMT
    WHERE TEN_ID=$1 AND EC_PJT_CD IN ('EC20260006', 'EC_TC_S01')
    ORDER BY EC_PJT_CD, SORT_NO
  `, [TEN]);
  plStmt.rows.forEach(r => console.log(`  [${r.ec_pjt_cd}] ${r.sort_no} ${r.item_cd} ${r.item_nm}: ${r.total_amt}`));

  // ══════════════════════════════════════════════════════════
  // 6. 목표원가 프로젝트 비교
  // ══════════════════════════════════════════════════════════
  console.log('\n\n════════ PCM_TGT_PJT (목표원가 프로젝트) ════════');
  const tgtPjts = await client.query(`
    SELECT * FROM PCM_TGT_PJT
    WHERE TEN_ID=$1
    ORDER BY PJT_CD
  `, [TEN]);
  tgtPjts.rows.forEach(r => {
    console.log(`  [${r.pjt_cd}] nm=${r.pjt_nm} ecPjt=${r.ec_pjt_cd} sts=${r.sts}`);
  });

  // ══════════════════════════════════════════════════════════
  // 7. 현상원가 프로젝트 비교
  // ══════════════════════════════════════════════════════════
  console.log('\n\n════════ PCM_CUR_PJT (현상원가 프로젝트) ════════');
  const curPjts = await client.query(`
    SELECT * FROM PCM_CUR_PJT
    WHERE TEN_ID=$1
    ORDER BY PJT_CD
  `, [TEN]);
  curPjts.rows.forEach(r => {
    console.log(`  [${r.pjt_cd}] rev=${r.cc_rev} nm=${r.pjt_nm} ecPjt=${r.ec_pjt_cd} sts=${r.sts}`);
  });

  // ══════════════════════════════════════════════════════════
  // 8. 테스트 데이터의 각 상세 테이블 row 수 확인
  // ══════════════════════════════════════════════════════════
  console.log('\n\n════════ 테스트 데이터 상세 테이블 현황 ════════');

  const tables = [
    { name: 'PCM_EC_PJT', where: "PJT_CD LIKE 'EC_TC%' OR PJT_CD='EC20260006'" },
    { name: 'PCM_EC_DETAIL', where: "EC_PJT_CD LIKE 'EC_TC%' OR EC_PJT_CD='EC20260006'" },
    { name: 'PCM_EC_COST_CODE', where: "EC_PJT_CD LIKE 'EC_TC%' OR EC_PJT_CD='EC20260006'" },
    { name: 'PCM_EC_BOM', where: "EC_PJT_CD LIKE 'EC_TC%' OR EC_PJT_CD='EC20260006'" },
    { name: 'PCM_EC_PL_STMT', where: "EC_PJT_CD LIKE 'EC_TC%' OR EC_PJT_CD='EC20260006'" },
    { name: 'PCM_TGT_PJT', where: "PJT_CD LIKE 'TC_%' OR PJT_CD LIKE 'TC2026%'" },
    { name: 'PCM_TGT_MANAGER', where: "TGT_PJT_CD LIKE 'TC_%'" },
    { name: 'PCM_TGT_SPEC', where: "TGT_PJT_CD LIKE 'TC_%'" },
    { name: 'PCM_TGT_PRICE', where: "TGT_PJT_CD LIKE 'TC_%'" },
    { name: 'PCM_TGT_QTY_DISC', where: "TGT_PJT_CD LIKE 'TC_%'" },
    { name: 'PCM_TGT_DEV_SCHEDULE', where: "TGT_PJT_CD LIKE 'TC_%'" },
    { name: 'PCM_TGT_SETUP_SCHEDULE', where: "TGT_PJT_CD LIKE 'TC_%'" },
    { name: 'PCM_CUR_PJT', where: "PJT_CD LIKE 'CC_%' OR PJT_CD LIKE 'CC2026%'" },
    { name: 'PCM_CUR_DETAIL', where: "CC_PJT_CD LIKE 'CC_%'" },
    { name: 'PCM_CUR_COST_CODE', where: "CC_PJT_CD LIKE 'CC_%' OR CC_PJT_CD LIKE 'CC2026%'" },
    { name: 'PCM_CUR_QTY_DISC', where: "CC_PJT_CD LIKE 'CC_%'" },
    { name: 'PCM_CUR_MANAGER', where: "CC_PJT_CD LIKE 'CC_%'" },
    { name: 'PCM_CUR_SCHEDULE', where: "CC_PJT_CD LIKE 'CC_%'" },
    { name: 'PCM_CUR_BOM', where: "CC_PJT_CD LIKE 'CC_%' OR CC_PJT_CD LIKE 'CC2026%'" },
    { name: 'PCM_CUR_PART_PRICE', where: "CC_PJT_CD LIKE 'CC_%'" },
  ];

  for (const t of tables) {
    try {
      const r = await client.query(`SELECT COUNT(*) as cnt FROM ${t.name} WHERE TEN_ID='${TEN}' AND (${t.where})`);
      console.log(`  ${t.name}: ${r.rows[0].cnt} rows`);
    } catch (e) {
      console.log(`  ${t.name}: ERROR - ${e.message}`);
    }
  }

  // ══════════════════════════════════════════════════════════
  // 9. 사용자 직접 입력 데이터 상세 (EC20260006)
  // ══════════════════════════════════════════════════════════
  console.log('\n\n════════ EC20260006 상세 데이터 (사용자 직접 입력) ════════');

  const userTables = [
    'PCM_EC_DETAIL',
    'PCM_EC_COST_CODE',
    'PCM_EC_BOM',
    'PCM_EC_PL_STMT'
  ];

  for (const tbl of userTables) {
    const col = tbl === 'PCM_EC_PL_STMT' ? 'EC_PJT_CD' : 'EC_PJT_CD';
    try {
      const r = await client.query(`SELECT COUNT(*) as cnt FROM ${tbl} WHERE TEN_ID='${TEN}' AND ${col}='EC20260006'`);
      console.log(`  ${tbl}: ${r.rows[0].cnt} rows`);
    } catch (e) {
      console.log(`  ${tbl}: ERROR - ${e.message}`);
    }
  }

  // Check CC tables for user data
  console.log('\n  CC 관련 (CC20260006):');
  const ccUserTables = [
    { name: 'PCM_CUR_COST_CODE', col: 'CC_PJT_CD' },
    { name: 'PCM_CUR_BOM', col: 'CC_PJT_CD' },
    { name: 'PCM_CUR_PART_PRICE', col: 'CC_PJT_CD' },
    { name: 'PCM_CUR_MANAGER', col: 'CC_PJT_CD' },
    { name: 'PCM_CUR_QTY_DISC', col: 'CC_PJT_CD' },
  ];
  for (const t of ccUserTables) {
    try {
      const r = await client.query(`SELECT COUNT(*) as cnt FROM ${t.name} WHERE TEN_ID='${TEN}' AND ${t.col}='CC20260006'`);
      console.log(`  ${t.name}: ${r.rows[0].cnt} rows`);
    } catch (e) {
      console.log(`  ${t.name}: ERROR - ${e.message}`);
    }
  }

  await client.end();
  console.log('\nDone!');
}

run().catch(err => {
  console.error('ERROR:', err);
  client.end();
  process.exit(1);
});
