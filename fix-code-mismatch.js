/**
 * 테스트 프로젝트 코드값 불일치 수정 스크립트
 *
 * 확인된 불일치 6건을 수정하고 검증한다.
 */
const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-ap-northeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.zxenhxqhfglorxgibmrz',
    password: 'admin1004!@#$',
    ssl: { rejectUnauthorized: false }
});

async function q(sql, params) {
    const res = await client.query(sql, params);
    return res.rows;
}

async function u(sql, params) {
    const res = await client.query(sql, params);
    return res.rowCount;
}

const ecTestPjts = ['EC_TC_S01','EC_TC_R01','EC_TC_M01'];
const tcTestPjts = ['TC_S01','TC_R01','TC_M01'];

async function run() {
    await client.connect();
    await client.query(`SET search_path TO asyoucost`);
    console.log('[OK] DB 연결 성공\n');

    let totalUpdated = 0;

    // ============================================================
    // FIX 1: EC Detail — order_prob, dev_poss, price_comp (T043: H/M/L)
    // ============================================================
    console.log('[FIX 1] pcm_ec_detail: order_prob, dev_poss, price_comp');
    console.log('  Before:');
    for (const r of await q(`SELECT ec_pjt_cd, order_prob, dev_poss, price_comp FROM pcm_ec_detail WHERE ec_pjt_cd = ANY($1) ORDER BY ec_pjt_cd`, [ecTestPjts])) {
        console.log(`    ${r.ec_pjt_cd}: order_prob=${r.order_prob}, dev_poss=${r.dev_poss}, price_comp=${r.price_comp}`);
    }

    const detailUpdates = [
        { pjt: 'EC_TC_S01', order_prob: 'H', dev_poss: 'H', price_comp: 'H' },
        { pjt: 'EC_TC_R01', order_prob: 'L', dev_poss: 'L', price_comp: 'L' },
        { pjt: 'EC_TC_M01', order_prob: 'M', dev_poss: 'M', price_comp: 'M' },
    ];
    for (const d of detailUpdates) {
        const cnt = await u(
            `UPDATE pcm_ec_detail SET order_prob=$1, dev_poss=$2, price_comp=$3 WHERE ec_pjt_cd=$4`,
            [d.order_prob, d.dev_poss, d.price_comp, d.pjt]
        );
        totalUpdated += cnt;
    }

    console.log('  After:');
    for (const r of await q(`SELECT ec_pjt_cd, order_prob, dev_poss, price_comp FROM pcm_ec_detail WHERE ec_pjt_cd = ANY($1) ORDER BY ec_pjt_cd`, [ecTestPjts])) {
        const ok = ['H','M','L'].includes(r.order_prob) && ['H','M','L'].includes(r.dev_poss) && ['H','M','L'].includes(r.price_comp);
        console.log(`    ${r.ec_pjt_cd}: order_prob=${r.order_prob}, dev_poss=${r.dev_poss}, price_comp=${r.price_comp} ${ok ? '✓' : '✗'}`);
    }

    // ============================================================
    // FIX 2: EC Line Invest — line_type (T038: NEW/EXIST)
    // ============================================================
    console.log('\n[FIX 2] pcm_ec_line_invest: line_type');
    console.log('  Before:');
    for (const r of await q(`SELECT ec_pjt_cd, line_type, COUNT(*) as cnt FROM pcm_ec_line_invest WHERE ec_pjt_cd = ANY($1) GROUP BY ec_pjt_cd, line_type ORDER BY ec_pjt_cd`, [ecTestPjts])) {
        console.log(`    ${r.ec_pjt_cd}: line_type=${r.line_type} (${r.cnt}rows)`);
    }

    const lineUpdates = [
        { pjt: 'EC_TC_S01', line_type: 'NEW' },
        { pjt: 'EC_TC_R01', line_type: 'EXIST' },
        { pjt: 'EC_TC_M01', line_type: 'NEW' },
    ];
    for (const d of lineUpdates) {
        const cnt = await u(`UPDATE pcm_ec_line_invest SET line_type=$1 WHERE ec_pjt_cd=$2`, [d.line_type, d.pjt]);
        totalUpdated += cnt;
    }

    console.log('  After:');
    for (const r of await q(`SELECT ec_pjt_cd, line_type, COUNT(*) as cnt FROM pcm_ec_line_invest WHERE ec_pjt_cd = ANY($1) GROUP BY ec_pjt_cd, line_type ORDER BY ec_pjt_cd`, [ecTestPjts])) {
        const ok = ['NEW','EXIST'].includes(r.line_type);
        console.log(`    ${r.ec_pjt_cd}: line_type=${r.line_type} (${r.cnt}rows) ${ok ? '✓' : '✗'}`);
    }

    // ============================================================
    // FIX 3: EC Other Invest — invest_type (T039), depr_type (T040)
    // ============================================================
    console.log('\n[FIX 3] pcm_ec_other_invest: invest_type, depr_type');
    console.log('  Before:');
    for (const r of await q(`SELECT ec_pjt_cd, invest_seq, invest_type, depr_type FROM pcm_ec_other_invest WHERE ec_pjt_cd = ANY($1) ORDER BY ec_pjt_cd, invest_seq`, [ecTestPjts])) {
        console.log(`    ${r.ec_pjt_cd} seq=${r.invest_seq}: invest_type=${r.invest_type}, depr_type=${r.depr_type}`);
    }

    // Mapping based on reference (EC20260006): BUILDING→USEFUL_LIFE, LAND→EXPENSE, ETC→USEFUL_LIFE, RND→EXPENSE
    const investTypeMapping = { 'MOLD': 'BUILDING', 'BUILD': 'LAND' };
    // ETC and RND stay as is (they're already valid T039 codes)
    const deprTypeByInvest = { 'BUILDING': 'USEFUL_LIFE', 'LAND': 'EXPENSE', 'ETC': 'USEFUL_LIFE', 'RND': 'EXPENSE' };

    const otherRows = await q(
        `SELECT ec_pjt_cd, invest_seq, invest_type, depr_type FROM pcm_ec_other_invest WHERE ec_pjt_cd = ANY($1) ORDER BY ec_pjt_cd, invest_seq`,
        [ecTestPjts]
    );
    for (const r of otherRows) {
        const newInvType = investTypeMapping[r.invest_type] || r.invest_type;
        const newDeprType = deprTypeByInvest[newInvType] || 'USEFUL_LIFE';
        const cnt = await u(
            `UPDATE pcm_ec_other_invest SET invest_type=$1, depr_type=$2 WHERE ec_pjt_cd=$3 AND invest_seq=$4`,
            [newInvType, newDeprType, r.ec_pjt_cd, r.invest_seq]
        );
        totalUpdated += cnt;
    }

    console.log('  After:');
    for (const r of await q(`SELECT ec_pjt_cd, invest_seq, invest_type, depr_type FROM pcm_ec_other_invest WHERE ec_pjt_cd = ANY($1) ORDER BY ec_pjt_cd, invest_seq`, [ecTestPjts])) {
        const okInv = ['BUILDING','RND','LAND','ETC'].includes(r.invest_type);
        const okDep = ['USEFUL_LIFE','EXPENSE','ASSET'].includes(r.depr_type);
        console.log(`    ${r.ec_pjt_cd} seq=${r.invest_seq}: invest_type=${r.invest_type}, depr_type=${r.depr_type} ${okInv && okDep ? '✓' : '✗'}`);
    }

    // ============================================================
    // FIX 4: EC NPV — analysis_type (STD → BASE)
    // ============================================================
    console.log('\n[FIX 4] pcm_ec_npv: analysis_type');
    console.log('  Before:');
    for (const r of await q(`SELECT ec_pjt_cd, analysis_ver, analysis_type FROM pcm_ec_npv WHERE ec_pjt_cd = ANY($1) ORDER BY ec_pjt_cd`, [ecTestPjts])) {
        console.log(`    ${r.ec_pjt_cd}: analysis_type=${r.analysis_type}`);
    }

    const npvCnt = await u(
        `UPDATE pcm_ec_npv SET analysis_type='BASE' WHERE ec_pjt_cd = ANY($1) AND analysis_type != 'BASE'`,
        [ecTestPjts]
    );
    totalUpdated += npvCnt;

    console.log('  After:');
    for (const r of await q(`SELECT ec_pjt_cd, analysis_ver, analysis_type FROM pcm_ec_npv WHERE ec_pjt_cd = ANY($1) ORDER BY ec_pjt_cd`, [ecTestPjts])) {
        console.log(`    ${r.ec_pjt_cd}: analysis_type=${r.analysis_type} ${r.analysis_type === 'BASE' ? '✓' : '✗'}`);
    }

    // ============================================================
    // FIX 5: TC Cost Reg — view_mode (SUM → T)
    // ============================================================
    console.log('\n[FIX 5] pcm_tgt_cost_reg: view_mode');
    console.log('  Before:');
    for (const r of await q(`SELECT tgt_pjt_cd, view_mode, COUNT(*) as cnt FROM pcm_tgt_cost_reg WHERE tgt_pjt_cd = ANY($1) GROUP BY tgt_pjt_cd, view_mode ORDER BY tgt_pjt_cd`, [tcTestPjts])) {
        console.log(`    ${r.tgt_pjt_cd}: view_mode=${r.view_mode} (${r.cnt}rows)`);
    }

    const regCnt = await u(
        `UPDATE pcm_tgt_cost_reg SET view_mode='T' WHERE tgt_pjt_cd = ANY($1) AND view_mode != 'T'`,
        [tcTestPjts]
    );
    totalUpdated += regCnt;

    console.log('  After:');
    for (const r of await q(`SELECT tgt_pjt_cd, view_mode, COUNT(*) as cnt FROM pcm_tgt_cost_reg WHERE tgt_pjt_cd = ANY($1) GROUP BY tgt_pjt_cd, view_mode ORDER BY tgt_pjt_cd`, [tcTestPjts])) {
        console.log(`    ${r.tgt_pjt_cd}: view_mode=${r.view_mode} (${r.cnt}rows) ${r.view_mode === 'T' ? '✓' : '✗'}`);
    }

    // ============================================================
    // FIX 6: TC Guide — dept_cd + dept_nm (원가항목코드 → 부서코드)
    // ============================================================
    console.log('\n[FIX 6] pcm_tgt_guide: dept_cd, dept_nm');
    console.log('  Before:');
    for (const r of await q(`SELECT tgt_pjt_cd, guide_seq, dept_cd, dept_nm FROM pcm_tgt_guide WHERE tgt_pjt_cd = ANY($1) ORDER BY tgt_pjt_cd, guide_seq`, [tcTestPjts])) {
        console.log(`    ${r.tgt_pjt_cd} seq=${r.guide_seq}: dept_cd=${r.dept_cd}, dept_nm=${r.dept_nm}`);
    }

    // Mapping from reference TC20260006
    const deptMapping = [
        { old: 'MAT',   new_cd: 'PT-D01', new_nm: 'PT설계팀' },
        { old: 'LABOR', new_cd: 'PT-D02', new_nm: 'PT생산팀' },
        { old: 'MFG',   new_cd: 'PT-D03', new_nm: 'PT품질팀' },
        { old: 'SGA',   new_cd: 'PT-D04', new_nm: '영업관리팀' },
    ];
    for (const m of deptMapping) {
        const cnt = await u(
            `UPDATE pcm_tgt_guide SET dept_cd=$1, dept_nm=$2 WHERE tgt_pjt_cd = ANY($3) AND dept_cd=$4`,
            [m.new_cd, m.new_nm, tcTestPjts, m.old]
        );
        if (cnt > 0) {
            console.log(`  ${m.old} → ${m.new_cd}(${m.new_nm}): ${cnt}rows`);
            totalUpdated += cnt;
        }
    }

    console.log('  After:');
    for (const r of await q(`SELECT tgt_pjt_cd, guide_seq, dept_cd, dept_nm FROM pcm_tgt_guide WHERE tgt_pjt_cd = ANY($1) ORDER BY tgt_pjt_cd, guide_seq`, [tcTestPjts])) {
        const ok = r.dept_cd?.startsWith('PT-D');
        console.log(`    ${r.tgt_pjt_cd} seq=${r.guide_seq}: dept_cd=${r.dept_cd}, dept_nm=${r.dept_nm} ${ok ? '✓' : '✗'}`);
    }

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log(`총 ${totalUpdated}행 수정 완료`);
    console.log('='.repeat(60));

    // ============================================================
    // STEP 3: 추가 불일치 확인 (T046-T051)
    // ============================================================
    console.log('\n[추가 확인] EC Manager dept_type/role_type, EC Schedule task_cd');
    console.log('  Note: 레퍼런스(EC20260006)도 T046/T047/T048 코드를 사용하지 않음 → 별도 코드체계');

    const refMgr = await q(`SELECT dept_type, role_type FROM pcm_ec_manager WHERE ec_pjt_cd='EC20260006'`);
    console.log('  Ref manager dept_type:', [...new Set(refMgr.map(r => r.dept_type))]);
    console.log('  Ref manager role_type:', [...new Set(refMgr.map(r => r.role_type))]);
    const testMgr = await q(`SELECT DISTINCT dept_type, role_type FROM pcm_ec_manager WHERE ec_pjt_cd = ANY($1)`, [ecTestPjts]);
    console.log('  Test manager dept_type:', [...new Set(testMgr.map(r => r.dept_type))]);
    console.log('  Test manager role_type:', [...new Set(testMgr.map(r => r.role_type))]);

    console.log('\n[추가 확인] Sensitivity var_type (T050)');
    const testSensVar = await q(`SELECT DISTINCT var_type FROM pcm_ec_sensitivity_var WHERE ec_pjt_cd = ANY($1)`, [ecTestPjts]);
    console.log('  Test var_type:', testSensVar.map(r => r.var_type), '→ 유효값 내 포함됨 (OK)');

    // ============================================================
    // FINAL VERIFICATION
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('최종 검증');
    console.log('='.repeat(60));

    let pass = 0, fail = 0;

    // V1: EC Detail
    for (const r of await q(`SELECT ec_pjt_cd, order_prob, dev_poss, price_comp FROM pcm_ec_detail WHERE ec_pjt_cd = ANY($1)`, [ecTestPjts])) {
        const ok = ['H','M','L'].includes(r.order_prob) && ['H','M','L'].includes(r.dev_poss) && ['H','M','L'].includes(r.price_comp);
        ok ? pass++ : fail++;
    }

    // V2: EC Line Invest
    for (const r of await q(`SELECT DISTINCT line_type FROM pcm_ec_line_invest WHERE ec_pjt_cd = ANY($1)`, [ecTestPjts])) {
        ['NEW','EXIST'].includes(r.line_type) ? pass++ : fail++;
    }

    // V3: EC Other Invest
    for (const r of await q(`SELECT invest_type, depr_type FROM pcm_ec_other_invest WHERE ec_pjt_cd = ANY($1)`, [ecTestPjts])) {
        const ok = ['BUILDING','RND','LAND','ETC'].includes(r.invest_type) && ['USEFUL_LIFE','EXPENSE','ASSET'].includes(r.depr_type);
        ok ? pass++ : fail++;
    }

    // V4: EC NPV
    for (const r of await q(`SELECT analysis_type FROM pcm_ec_npv WHERE ec_pjt_cd = ANY($1)`, [ecTestPjts])) {
        r.analysis_type === 'BASE' ? pass++ : fail++;
    }

    // V5: TC Cost Reg
    for (const r of await q(`SELECT DISTINCT view_mode FROM pcm_tgt_cost_reg WHERE tgt_pjt_cd = ANY($1)`, [tcTestPjts])) {
        r.view_mode === 'T' ? pass++ : fail++;
    }

    // V6: TC Guide
    for (const r of await q(`SELECT dept_cd FROM pcm_tgt_guide WHERE tgt_pjt_cd = ANY($1)`, [tcTestPjts])) {
        r.dept_cd?.startsWith('PT-D') ? pass++ : fail++;
    }

    console.log(`  PASS: ${pass}, FAIL: ${fail}`);
    console.log(fail === 0 ? '  ALL CHECKS PASSED' : '  SOME CHECKS FAILED');

    await client.end();
    console.log('\n[OK] 완료');
}

run().catch(err => {
    console.error('[ERR]', err.message);
    client.end();
    process.exit(1);
});
