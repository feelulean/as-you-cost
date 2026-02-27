/**
 * Fix test data: Add missing EC Cost Code, BOM, Profit,
 * and missing TC/CC detail data for R01/M01
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

const TEN = 'T001';

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

  const now = new Date().toISOString();

  // ====================================================================
  // FIX 1: EC Cost Code for all 3 test EC projects
  // ====================================================================
  console.log('=== FIX 1: EC Cost Code ===');
  const ecPjts = ['EC_TC_S01', 'EC_TC_R01', 'EC_TC_M01'];
  for (const ecPjt of ecPjts) {
    // Clean existing
    await client.query('DELETE FROM pcm_ec_cost_code WHERE ten_id=$1 AND ec_pjt_cd=$2', [TEN, ecPjt]);

    // Insert 2 cost codes (matching test data's structure)
    const costCodes = [
      { cd: 'COST01', grp: 'GRP01', grpDesc: 'Test Product A', price: 500000, mktPrice: 520000, sop: '202607', eop: '203006', sort: 1 },
      { cd: 'COST02', grp: 'GRP02', grpDesc: 'Test Product B', price: 300000, mktPrice: 310000, sop: '202701', eop: '203106', sort: 2 }
    ];
    for (const cc of costCodes) {
      await client.query(`
        INSERT INTO pcm_ec_cost_code (
          ten_id, ec_pjt_cd, cost_cd, prod_grp, cost_grp, cost_grp_desc,
          est_currency, est_price, mkt_currency, mkt_price,
          sop_ym, eop_ym, sort_no, rmk,
          regr_id, reg_dttm, modr_id, mod_dttm
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [TEN, ecPjt, cc.cd, 'SEAT', cc.grp, cc.grpDesc,
          'KRW', cc.price, 'KRW', cc.mktPrice,
          cc.sop, cc.eop, cc.sort, null,
          'testuser', now, 'testuser', now]);
    }
    console.log(`  ${ecPjt}: 2 cost codes inserted`);
  }

  // ====================================================================
  // FIX 2: EC BOM for all 3 test EC projects
  // ====================================================================
  console.log('\n=== FIX 2: EC BOM ===');
  for (const ecPjt of ecPjts) {
    await client.query('DELETE FROM pcm_ec_bom WHERE ten_id=$1 AND ec_pjt_cd=$2', [TEN, ecPjt]);

    const boms = [
      { itemCd: 'P-001', upItem: null, lvl: 0, nm: 'ASSY A', spec: 'Main Assembly', qty: 1, unitPrice: 0, matCost: 350000, newPart: 'N' },
      { itemCd: 'P-001-01', upItem: 'P-001', lvl: 1, nm: 'Sub Part 1', spec: 'Material A', qty: 2, unitPrice: 80000, matCost: 160000, newPart: 'N' },
      { itemCd: 'P-001-02', upItem: 'P-001', lvl: 1, nm: 'Sub Part 2', spec: 'Material B', qty: 1, unitPrice: 120000, matCost: 120000, newPart: 'Y' },
      { itemCd: 'P-001-03', upItem: 'P-001', lvl: 1, nm: 'Sub Part 3', spec: 'Material C', qty: 1, unitPrice: 70000, matCost: 70000, newPart: 'N' },
      { itemCd: 'P-002', upItem: null, lvl: 0, nm: 'ASSY B', spec: 'Sub Assembly', qty: 1, unitPrice: 0, matCost: 180000, newPart: 'N' },
      { itemCd: 'P-002-01', upItem: 'P-002', lvl: 1, nm: 'Sub Part 4', spec: 'Electronic', qty: 1, unitPrice: 95000, matCost: 95000, newPart: 'Y' },
      { itemCd: 'P-002-02', upItem: 'P-002', lvl: 1, nm: 'Sub Part 5', spec: 'Connector', qty: 2, unitPrice: 42500, matCost: 85000, newPart: 'N' }
    ];
    for (const b of boms) {
      await client.query(`
        INSERT INTO pcm_ec_bom (
          ten_id, ec_pjt_cd, item_cd, up_item_cd, lvl, item_nm, spec,
          qty, unit_price, mat_cost, new_part_yn, rmk, sts,
          regr_id, reg_dttm, modr_id, mod_dttm
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [TEN, ecPjt, b.itemCd, b.upItem, b.lvl, b.nm, b.spec,
          b.qty, b.unitPrice, b.matCost, b.newPart, null, 'T',
          'testuser', now, 'testuser', now]);
    }
    console.log(`  ${ecPjt}: 7 BOM items inserted`);
  }

  // ====================================================================
  // FIX 3: EC Profit for all 3 test EC projects
  // ====================================================================
  console.log('\n=== FIX 3: EC Profit ===');
  // Check EC_PROFIT table structure first
  const profitCols = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='asyoucost' AND table_name='pcm_ec_profit' ORDER BY ordinal_position"
  );
  console.log('  pcm_ec_profit columns:', profitCols.rows.map(r => r.column_name).join(', '));

  // Insert profit data based on column structure
  for (const ecPjt of ecPjts) {
    await client.query('DELETE FROM pcm_ec_profit WHERE ten_id=$1 AND ec_pjt_cd=$2', [TEN, ecPjt]);

    try {
      await client.query(`
        INSERT INTO pcm_ec_profit (
          ten_id, ec_pjt_cd, total_estm_cost, tax_rate, erm_rate,
          equity_amt, debt_amt, ke_rate, kd_rate, rf_rate,
          labor_rate, mfg_overhead_rate, sga_rate,
          rmk, regr_id, reg_dttm, modr_id, mod_dttm
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [TEN, ecPjt, 400000, 22, 6.2,
          5000000000, 3000000000, 7.5, 4.5, 3.5,
          9, 18, 5,
          'Test profit', 'testuser', now, 'testuser', now]);
      console.log(`  ${ecPjt}: profit inserted`);
    } catch (e) {
      console.log(`  ${ecPjt}: ERROR - ${e.message.split('\n')[0]}`);
      // Try simpler insert
      try {
        // Get actual column names and try minimal insert
        const cols = profitCols.rows.map(r => r.column_name);
        const minCols = ['ten_id', 'ec_pjt_cd'];
        const minVals = [TEN, ecPjt];
        // Add common columns that might exist
        for (const col of ['total_estm_cost', 'tax_rate', 'rmk', 'regr_id', 'reg_dttm', 'modr_id', 'mod_dttm']) {
          if (cols.includes(col)) {
            minCols.push(col);
            if (col === 'total_estm_cost') minVals.push(400000);
            else if (col === 'tax_rate') minVals.push(22);
            else if (col === 'rmk') minVals.push('Test');
            else if (col.includes('_id')) minVals.push('testuser');
            else if (col.includes('_dttm')) minVals.push(now);
          }
        }
        const placeholders = minVals.map((_, i) => `$${i + 1}`).join(', ');
        await client.query(`INSERT INTO pcm_ec_profit (${minCols.join(', ')}) VALUES (${placeholders})`, minVals);
        console.log(`  ${ecPjt}: profit inserted (minimal)`);
      } catch (e2) {
        console.log(`  ${ecPjt}: RETRY ERROR - ${e2.message.split('\n')[0]}`);
      }
    }
  }

  // ====================================================================
  // FIX 4: TC Detail data for TC_R01, TC_M01
  // ====================================================================
  console.log('\n=== FIX 4: TC Detail (R01, M01) via API ===');
  for (const tcPjt of ['TC_R01', 'TC_M01']) {
    // Manager
    const rm = await post('/bp/cost/tc/detail/saveListManager.do', {
      tgtPjtCd: tcPjt,
      saveList: [
        { _rowStatus: 'C', mgrSeq: 1, deptDiv: 'DEV', mgrNm: '김개발', position: '과장', deptNm: '개발팀', roleCd: 'LEADER', email: 'dev@test.com', rmk: '', sts: 'Y' },
        { _rowStatus: 'C', mgrSeq: 2, deptDiv: 'QA', mgrNm: '이품질', position: '대리', deptNm: '품질팀', roleCd: 'MEMBER', email: 'qa@test.com', rmk: '', sts: 'Y' }
      ]
    });
    console.log(`  ${tcPjt} Manager: ${rm.status}`);

    // Spec
    const rs = await post('/bp/cost/tc/detail/saveListSpec.do', {
      tgtPjtCd: tcPjt,
      saveList: [
        { _rowStatus: 'C', specSeq: 1, ecCostCd: 'COST01', tgtCostCd: 'COST01', prodGrpNm: 'SEAT', carType: 'TEST', oemNm: 'TEST', specDesc: 'Test Product A', selYn: 'Y', rmk: '', sts: 'Y' },
        { _rowStatus: 'C', specSeq: 2, ecCostCd: 'COST02', tgtCostCd: 'COST02', prodGrpNm: 'SEAT', carType: 'TEST', oemNm: 'TEST', specDesc: 'Test Product B', selYn: 'Y', rmk: '', sts: 'Y' }
      ]
    });
    console.log(`  ${tcPjt} Spec: ${rs.status}`);

    // Price
    const rp = await post('/bp/cost/tc/detail/saveListPrice.do', {
      tgtPjtCd: tcPjt,
      saveList: [
        { _rowStatus: 'C', priceSeq: 1, specDesc: 'Test Product A', tgtCostCd: 'COST01', currency: 'KRW', estSellPrice: 500000, sopYm: '202607', eopYm: '203006', rmk: '', sts: 'Y' },
        { _rowStatus: 'C', priceSeq: 2, specDesc: 'Test Product B', tgtCostCd: 'COST02', currency: 'KRW', estSellPrice: 300000, sopYm: '202701', eopYm: '203106', rmk: '', sts: 'Y' }
      ]
    });
    console.log(`  ${tcPjt} Price: ${rp.status}`);

    // QtyDisc (5 years)
    const qtyList = [];
    let seq = 1;
    for (const cd of ['COST01', 'COST02']) {
      const desc = cd === 'COST01' ? 'Test Product A' : 'Test Product B';
      for (let y = 1; y <= 5; y++) {
        qtyList.push({
          _rowStatus: 'C', qtyDiscSeq: seq++, specDesc: desc, tgtCostCd: cd,
          yearVal: String(y), qty: 10000, discRate: y === 1 ? 0 : (y - 1) * 1.0,
          rmk: '', sts: 'Y'
        });
      }
    }
    const rq = await post('/bp/cost/tc/detail/saveListQtyDisc.do', { tgtPjtCd: tcPjt, saveList: qtyList });
    console.log(`  ${tcPjt} QtyDisc: ${rq.status} (${rq.count})`);

    // DevSchedule
    const rd = await post('/bp/cost/tc/detail/saveListDevSchedule.do', {
      tgtPjtCd: tcPjt,
      saveList: [
        { _rowStatus: 'C', schedSeq: 1, schedType: 'DEV', schedNm: 'Design Review', planStartDt: '2026-03-01', planEndDt: '2026-05-31', actEndDt: '', evalRound: '1', evalPeriod: '2026-Q1', delayDays: 0, procYn: 'N', sortOrder: 1, rmk: '', sts: 'Y' },
        { _rowStatus: 'C', schedSeq: 2, schedType: 'DEV', schedNm: 'Prototype', planStartDt: '2026-06-01', planEndDt: '2026-08-31', actEndDt: '', evalRound: '2', evalPeriod: '2026-Q2', delayDays: 0, procYn: 'N', sortOrder: 2, rmk: '', sts: 'Y' },
        { _rowStatus: 'C', schedSeq: 3, schedType: 'DEV', schedNm: 'Validation', planStartDt: '2026-09-01', planEndDt: '2026-11-30', actEndDt: '', evalRound: '3', evalPeriod: '2026-Q3', delayDays: 0, procYn: 'N', sortOrder: 3, rmk: '', sts: 'Y' }
      ]
    });
    console.log(`  ${tcPjt} DevSchedule: ${rd.status}`);

    // SetupSchedule
    const rss = await post('/bp/cost/tc/detail/saveListSetupSchedule.do', {
      tgtPjtCd: tcPjt,
      saveList: [
        { _rowStatus: 'C', setupSchedSeq: 1, deptNm: '개발팀', startDt: '2026-12-01', endDt: '2027-01-31', actEndDt: '', procYn: 'N', delayDays: 0, emailSent: 'N', rmk: '', sts: 'Y' },
        { _rowStatus: 'C', setupSchedSeq: 2, deptNm: '생산팀', startDt: '2027-02-01', endDt: '2027-03-31', actEndDt: '', procYn: 'N', delayDays: 0, emailSent: 'N', rmk: '', sts: 'Y' }
      ]
    });
    console.log(`  ${tcPjt} SetupSchedule: ${rss.status}`);
  }

  // ====================================================================
  // FIX 5: CC Detail data for CC_R01, CC_M01
  // ====================================================================
  console.log('\n=== FIX 5: CC Detail (R01, M01) via API ===');
  for (const ccPjt of ['CC_R01', 'CC_M01']) {
    // Manager
    const rm = await post('/bp/cost/cc/detail/saveListManager.do', {
      ccPjtCd: ccPjt, ccRev: 1,
      saveList: [
        { _rowStatus: 'C', managerSeq: 1, deptDiv: 'DEV', mgrId: 'user01', mgrNm: '김개발', roleCd: 'LEADER', email: 'dev@test.com', rmk: '', sts: 'Y' },
        { _rowStatus: 'C', managerSeq: 2, deptDiv: 'QA', mgrId: 'user02', mgrNm: '이품질', roleCd: 'MEMBER', email: 'qa@test.com', rmk: '', sts: 'Y' }
      ]
    });
    console.log(`  ${ccPjt} Manager: ${rm.status}`);

    // Schedule
    const rs = await post('/bp/cost/cc/detail/saveListSchedule.do', {
      ccPjtCd: ccPjt, ccRev: 1,
      saveList: [
        { _rowStatus: 'C', scheduleSeq: 1, taskNm: 'Design Review', stdPeriod: 90, startDt: '2026-03-01', endDt: '2026-05-31', actEndDt: '2026-05-28', procSts: 'C', delayDays: 0, sortOrder: 1, rmk: '', sts: 'Y' },
        { _rowStatus: 'C', scheduleSeq: 2, taskNm: 'Prototype', stdPeriod: 90, startDt: '2026-06-01', endDt: '2026-08-31', actEndDt: '', procSts: 'P', delayDays: 0, sortOrder: 2, rmk: '', sts: 'Y' }
      ]
    });
    console.log(`  ${ccPjt} Schedule: ${rs.status}`);

    // BOM
    const rb = await post('/bp/cost/cc/detail/saveListBom.do', {
      ccPjtCd: ccPjt, ccRev: 1,
      saveList: [
        { _rowStatus: 'C', costCd: 'COST01', bomSeq: 1, partNo: 'P-001', partNm: 'ASSY A', partDiv: 'ASSY', qty: 1, recvUnitYn: 'Y', parentSeq: 0, bomLevel: 0, rmk: '', sts: 'Y' },
        { _rowStatus: 'C', costCd: 'COST01', bomSeq: 2, partNo: 'P-001-01', partNm: 'Sub Part 1', partDiv: 'PART', qty: 2, recvUnitYn: 'N', parentSeq: 1, bomLevel: 1, rmk: '', sts: 'Y' },
        { _rowStatus: 'C', costCd: 'COST01', bomSeq: 3, partNo: 'P-001-02', partNm: 'Sub Part 2', partDiv: 'PART', qty: 1, recvUnitYn: 'N', parentSeq: 1, bomLevel: 1, rmk: '', sts: 'Y' },
        { _rowStatus: 'C', costCd: 'COST01', bomSeq: 4, partNo: 'P-001-03', partNm: 'Sub Part 3', partDiv: 'PART', qty: 1, recvUnitYn: 'N', parentSeq: 1, bomLevel: 1, rmk: '', sts: 'Y' }
      ]
    });
    console.log(`  ${ccPjt} BOM: ${rb.status} (${rb.count})`);

    // PartPrice
    const rpp = await post('/bp/cost/cc/detail/saveListPartPrice.do', {
      ccPjtCd: ccPjt, ccRev: 1,
      saveList: [
        { _rowStatus: 'C', costCd: 'COST01', partPriceSeq: 1, partNo: 'P-001-01', partNm: 'Sub Part 1', partDiv: 'PART',
          pimsCurrency: 'KRW', pimsPrice: 80000, designCurrency: 'KRW', designCostPrice: 78000,
          purchaseCurrency: 'KRW', purchaseEstPrice: 76000, confirmCurrency: 'KRW', confirmedPrice: 75000, lossRate: 2, rmk: '', sts: 'Y' },
        { _rowStatus: 'C', costCd: 'COST01', partPriceSeq: 2, partNo: 'P-001-02', partNm: 'Sub Part 2', partDiv: 'PART',
          pimsCurrency: 'KRW', pimsPrice: 120000, designCurrency: 'KRW', designCostPrice: 115000,
          purchaseCurrency: 'KRW', purchaseEstPrice: 112000, confirmCurrency: 'KRW', confirmedPrice: 110000, lossRate: 1.5, rmk: '', sts: 'Y' },
        { _rowStatus: 'C', costCd: 'COST01', partPriceSeq: 3, partNo: 'P-001-03', partNm: 'Sub Part 3', partDiv: 'PART',
          pimsCurrency: 'KRW', pimsPrice: 70000, designCurrency: 'KRW', designCostPrice: 68000,
          purchaseCurrency: 'KRW', purchaseEstPrice: 66000, confirmCurrency: 'KRW', confirmedPrice: 65000, lossRate: 1, rmk: '', sts: 'Y' }
      ]
    });
    console.log(`  ${ccPjt} PartPrice: ${rpp.status} (${rpp.count})`);
  }

  await client.end();

  // ====================================================================
  // VERIFICATION
  // ====================================================================
  console.log('\n\n═══════════════════════════════════════');
  console.log('  VERIFICATION AFTER FIX');
  console.log('═══════════════════════════════════════\n');

  for (const ecPjt of ecPjts) {
    console.log(`--- ${ecPjt} ---`);
    const bom = await post('/bp/cost/ec/bom/findListEcBom.do', { ecPjtCd: ecPjt });
    console.log(`  EC BOM: ${bom.length} rows`);
  }

  const tcPjts = ['TC_S01', 'TC_R01', 'TC_M01'];
  for (const tcPjt of tcPjts) {
    console.log(`\n--- ${tcPjt} ---`);
    const m = await post('/bp/cost/tc/detail/findListManager.do', { tgtPjtCd: tcPjt });
    const s = await post('/bp/cost/tc/detail/findListSpec.do', { tgtPjtCd: tcPjt });
    const p = await post('/bp/cost/tc/detail/findListPrice.do', { tgtPjtCd: tcPjt });
    const q = await post('/bp/cost/tc/detail/findListQtyDisc.do', { tgtPjtCd: tcPjt });
    const d = await post('/bp/cost/tc/detail/findListDevSchedule.do', { tgtPjtCd: tcPjt });
    const ss = await post('/bp/cost/tc/detail/findListSetupSchedule.do', { tgtPjtCd: tcPjt });
    console.log(`  Manager=${m.length} Spec=${s.length} Price=${p.length} QtyDisc=${q.length} DevSched=${d.length} SetupSched=${ss.length}`);
  }

  const ccPjts = ['CC_S01', 'CC_R01', 'CC_M01'];
  for (const ccPjt of ccPjts) {
    console.log(`\n--- ${ccPjt} ---`);
    const m = await post('/bp/cost/cc/detail/findListManager.do', { ccPjtCd: ccPjt, ccRev: 1 });
    const s = await post('/bp/cost/cc/detail/findListSchedule.do', { ccPjtCd: ccPjt, ccRev: 1 });
    const b = await post('/bp/cost/cc/detail/findListBom.do', { ccPjtCd: ccPjt, ccRev: 1 });
    const pp = await post('/bp/cost/cc/detail/findListPartPrice.do', { ccPjtCd: ccPjt, ccRev: 1 });
    console.log(`  Manager=${m.length} Schedule=${s.length} BOM=${b.length} PartPrice=${pp.length}`);
  }

  console.log('\nDone!');
}

run().catch(e => { console.error(e); process.exit(1); });
