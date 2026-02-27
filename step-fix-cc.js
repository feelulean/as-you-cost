/**
 * Fix CC data: CostCode (costCodeSeq), Schedule (stdPeriod=integer), QtyDisc
 */
const http = require('http');

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

async function run() {
  const ccPjt = 'CC20260006';
  const ccRev = 1;

  // Fix 1: CC 원가코드/판가 등록 (costCodeSeq, not costSeq)
  console.log('=== Fix 1. CC 원가코드/판가 등록 ===');
  const r1 = await post('/bp/cost/cc/detail/saveListCostCode.do', {
    ccPjtCd: ccPjt, ccRev: ccRev,
    saveList: [
      { _rowStatus: 'C', costCodeSeq: 1, costCd: 'COST01', calcTarget: 'Y', prodDesc: 'Drive Shaft ASSY', currency: 'KRW', estSellPrice: 105000, sopYm: '202701', eopYm: '203012', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', costCodeSeq: 2, costCd: 'COST02', calcTarget: 'Y', prodDesc: 'E-Axle ASSY', currency: 'KRW', estSellPrice: 107000, sopYm: '202612', eopYm: '203206', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', costCodeSeq: 3, costCd: 'COST03', calcTarget: 'Y', prodDesc: 'Seat Module', currency: 'KRW', estSellPrice: 85670, sopYm: '202601', eopYm: '203106', rmk: '', sts: 'Y' }
    ]
  });
  console.log('Result:', JSON.stringify(r1));

  // Fix 2: CC 일정 등록 (stdPeriod = integer, e.g., 90 days)
  console.log('\n=== Fix 2. CC 일정 등록 ===');
  const r2 = await post('/bp/cost/cc/detail/saveListSchedule.do', {
    ccPjtCd: ccPjt, ccRev: ccRev,
    saveList: [
      { _rowStatus: 'C', scheduleSeq: 1, taskNm: '설계검토', stdPeriod: 90, startDt: '2026-03-01', endDt: '2026-05-31', actEndDt: '2026-05-25', procSts: 'C', delayDays: 0, sortOrder: 1, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', scheduleSeq: 2, taskNm: '시작품 제작', stdPeriod: 90, startDt: '2026-06-01', endDt: '2026-08-31', actEndDt: '2026-09-05', procSts: 'C', delayDays: 5, sortOrder: 2, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', scheduleSeq: 3, taskNm: '시험평가', stdPeriod: 90, startDt: '2026-09-01', endDt: '2026-11-30', actEndDt: '', procSts: 'P', delayDays: 0, sortOrder: 3, rmk: '', sts: 'Y' }
    ]
  });
  console.log('Result:', JSON.stringify(r2));

  // Fix 3: CC 수량/할인율 등록 (must have costCodes first)
  console.log('\n=== Fix 3. CC 수량/할인율 등록 ===');
  const qtyList = [];
  let seq = 1;
  const costCds = ['COST01', 'COST02', 'COST03'];
  for (let i = 0; i < 3; i++) {
    const qtys = [20000, 25000, 30000, 25000, 20000];
    for (let y = 1; y <= 5; y++) {
      qtyList.push({
        _rowStatus: 'C', qtyDiscSeq: seq++, costCd: costCds[i],
        yearVal: String(y), sellQty: qtys[y-1], discRate: y === 1 ? 0 : (y - 1) * 1.5,
        rmk: '', sts: 'Y'
      });
    }
  }
  const r3 = await post('/bp/cost/cc/detail/saveListQtyDisc.do', {
    ccPjtCd: ccPjt, ccRev: ccRev, saveList: qtyList
  });
  console.log('Result:', JSON.stringify(r3));

  // === 전체 CC 검증 ===
  console.log('\n=== CC 전체 데이터 검증 ===');

  const vc = await post('/bp/cost/cc/detail/findListCostCode.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('CostCodes:', vc.length, 'rows');
  vc.forEach(r => console.log('  ', r.costCd, r.prodDesc, r.estSellPrice));

  const vs = await post('/bp/cost/cc/detail/findListSchedule.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('Schedules:', vs.length, 'rows');
  vs.forEach(r => console.log('  ', r.taskNm, r.procSts, r.stdPeriod));

  const vq = await post('/bp/cost/cc/detail/findListQtyDisc.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('QtyDisc:', Array.isArray(vq) ? vq.length + ' rows' : JSON.stringify(vq).substring(0, 200));

  // Full summary
  const vd = await post('/bp/cost/cc/detail/findCcDetail.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('\n--- CC20260006 Summary ---');
  console.log('Detail:', vd.revNm, vd.factoryNm);

  const vm = await post('/bp/cost/cc/detail/findListManager.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('Managers:', vm.length);

  const vb = await post('/bp/cost/cc/detail/findListBom.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('BOM:', vb.length);

  const vp = await post('/bp/cost/cc/detail/findListPartPrice.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('PartPrices:', vp.length);
}

run().catch(e => console.error(e));
