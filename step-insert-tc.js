/**
 * Step-by-step TC data insertion for EC20260006
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
  const p = 'TC20260006';

  // 2-1. 담당자 등록
  console.log('=== 2-1. TC 담당자 등록 ===');
  const r1 = await post('/bp/cost/tc/detail/saveListManager.do', {
    tgtPjtCd: p,
    saveList: [
      { _rowStatus: 'C', mgrSeq: 1, deptDiv: 'PT', mgrNm: '김설계', position: '과장', deptNm: 'PT설계팀', roleCd: 'LEADER', email: 'kim@test.com', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', mgrSeq: 2, deptDiv: 'PT', mgrNm: '이구매', position: '대리', deptNm: 'PT구매팀', roleCd: 'MEMBER', email: 'lee@test.com', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', mgrSeq: 3, deptDiv: 'PT', mgrNm: '박생산', position: '차장', deptNm: 'PT생산팀', roleCd: 'MEMBER', email: 'park@test.com', rmk: '', sts: 'Y' }
    ]
  });
  console.log('Result:', JSON.stringify(r1));

  // 2-2. 스펙 등록
  console.log('\n=== 2-2. TC 스펙 등록 ===');
  const r2 = await post('/bp/cost/tc/detail/saveListSpec.do', {
    tgtPjtCd: p,
    saveList: [
      { _rowStatus: 'C', specSeq: 1, ecCostCd: 'COST01', tgtCostCd: 'COST01', prodGrpNm: 'TM', carType: 'EV', oemNm: 'HMG', specDesc: 'Drive Shaft ASSY', selYn: 'Y', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', specSeq: 2, ecCostCd: 'COST02', tgtCostCd: 'COST02', prodGrpNm: 'AXLE', carType: 'EV', oemNm: 'HMG', specDesc: 'E-Axle ASSY', selYn: 'Y', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', specSeq: 3, ecCostCd: 'COST03', tgtCostCd: 'COST03', prodGrpNm: 'SEAT', carType: 'EV', oemNm: 'HMG', specDesc: 'Seat Module', selYn: 'Y', rmk: '', sts: 'Y' }
    ]
  });
  console.log('Result:', JSON.stringify(r2));

  // 2-3. 판가 등록
  console.log('\n=== 2-3. TC 판가 등록 ===');
  const r3 = await post('/bp/cost/tc/detail/saveListPrice.do', {
    tgtPjtCd: p,
    saveList: [
      { _rowStatus: 'C', priceSeq: 1, specDesc: 'Drive Shaft ASSY', tgtCostCd: 'COST01', currency: 'KRW', estSellPrice: 105000, sopYm: '202701', eopYm: '203012', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', priceSeq: 2, specDesc: 'E-Axle ASSY', tgtCostCd: 'COST02', currency: 'KRW', estSellPrice: 107000, sopYm: '202612', eopYm: '203206', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', priceSeq: 3, specDesc: 'Seat Module', tgtCostCd: 'COST03', currency: 'KRW', estSellPrice: 85670, sopYm: '202601', eopYm: '203106', rmk: '', sts: 'Y' }
    ]
  });
  console.log('Result:', JSON.stringify(r3));

  // 2-4. 수량/할인율 등록 (5년치 x 3 cost codes)
  console.log('\n=== 2-4. TC 수량/할인율 등록 ===');
  const qtyList = [];
  let seq = 1;
  const costCds = ['COST01', 'COST02', 'COST03'];
  const descs = ['Drive Shaft ASSY', 'E-Axle ASSY', 'Seat Module'];
  const qtys = [
    [20000, 25000, 30000, 25000, 20000],
    [20000, 25000, 30000, 25000, 20000],
    [20000, 25000, 30000, 25000, 20000]
  ];
  for (let i = 0; i < 3; i++) {
    for (let y = 1; y <= 5; y++) {
      qtyList.push({
        _rowStatus: 'C', qtyDiscSeq: seq++, specDesc: descs[i], tgtCostCd: costCds[i],
        yearVal: String(y), qty: qtys[i][y-1], discRate: y === 1 ? 0 : (y - 1) * 1.5,
        rmk: '', sts: 'Y'
      });
    }
  }
  const r4 = await post('/bp/cost/tc/detail/saveListQtyDisc.do', { tgtPjtCd: p, saveList: qtyList });
  console.log('Result:', JSON.stringify(r4));

  // 2-5. 개발일정 등록
  console.log('\n=== 2-5. TC 개발일정 등록 ===');
  const r5 = await post('/bp/cost/tc/detail/saveListDevSchedule.do', {
    tgtPjtCd: p,
    saveList: [
      { _rowStatus: 'C', schedSeq: 1, schedType: 'DEV', schedNm: '설계검토', planStartDt: '2026-03-01', planEndDt: '2026-05-31', actEndDt: '', evalRound: '1', evalPeriod: '2026-Q1', delayDays: 0, procYn: 'N', sortOrder: 1, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', schedSeq: 2, schedType: 'DEV', schedNm: '시작품 제작', planStartDt: '2026-06-01', planEndDt: '2026-08-31', actEndDt: '', evalRound: '2', evalPeriod: '2026-Q2', delayDays: 0, procYn: 'N', sortOrder: 2, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', schedSeq: 3, schedType: 'DEV', schedNm: '시험평가', planStartDt: '2026-09-01', planEndDt: '2026-11-30', actEndDt: '', evalRound: '3', evalPeriod: '2026-Q3', delayDays: 0, procYn: 'N', sortOrder: 3, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', schedSeq: 4, schedType: 'DEV', schedNm: '양산이행 준비', planStartDt: '2026-12-01', planEndDt: '2027-01-31', actEndDt: '', evalRound: '4', evalPeriod: '2026-Q4', delayDays: 0, procYn: 'N', sortOrder: 4, rmk: '', sts: 'Y' }
    ]
  });
  console.log('Result:', JSON.stringify(r5));

  // 2-6. 양산일정 등록
  console.log('\n=== 2-6. TC 양산일정 등록 ===');
  const r6 = await post('/bp/cost/tc/detail/saveListSetupSchedule.do', {
    tgtPjtCd: p,
    saveList: [
      { _rowStatus: 'C', setupSchedSeq: 1, deptNm: 'PT설계팀', startDt: '2026-12-01', endDt: '2027-01-15', actEndDt: '', procYn: 'N', delayDays: 0, emailSent: 'N', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', setupSchedSeq: 2, deptNm: 'PT생산팀', startDt: '2027-01-16', endDt: '2027-02-28', actEndDt: '', procYn: 'N', delayDays: 0, emailSent: 'N', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', setupSchedSeq: 3, deptNm: 'PT품질팀', startDt: '2027-03-01', endDt: '2027-03-31', actEndDt: '', procYn: 'N', delayDays: 0, emailSent: 'N', rmk: '', sts: 'Y' }
    ]
  });
  console.log('Result:', JSON.stringify(r6));

  // === 검증 ===
  console.log('\n=== 검증 ===');
  const v1 = await post('/bp/cost/tc/detail/findListManager.do', { tgtPjtCd: p });
  console.log('Managers:', v1.length, 'rows');
  v1.forEach(r => console.log('  ', r.mgrNm, r.deptNm, r.roleCd));

  const v2 = await post('/bp/cost/tc/detail/findListSpec.do', { tgtPjtCd: p });
  console.log('Specs:', v2.length, 'rows');
  v2.forEach(r => console.log('  ', r.tgtCostCd, r.specDesc));

  const v3 = await post('/bp/cost/tc/detail/findListPrice.do', { tgtPjtCd: p });
  console.log('Prices:', v3.length, 'rows');
  v3.forEach(r => console.log('  ', r.tgtCostCd, r.estSellPrice));

  const v4 = await post('/bp/cost/tc/detail/findListQtyDisc.do', { tgtPjtCd: p });
  console.log('QtyDisc:', v4.length, 'rows');

  const v5 = await post('/bp/cost/tc/detail/findListDevSchedule.do', { tgtPjtCd: p });
  console.log('DevSchedule:', v5.length, 'rows');
  v5.forEach(r => console.log('  ', r.schedNm, r.planStartDt, '-', r.planEndDt));

  const v6 = await post('/bp/cost/tc/detail/findListSetupSchedule.do', { tgtPjtCd: p });
  console.log('SetupSchedule:', v6.length, 'rows');
  v6.forEach(r => console.log('  ', r.deptNm, r.startDt, '-', r.endDt));
}

run().catch(e => console.error(e));
