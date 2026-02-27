/**
 * Step-by-step CC data insertion for CC20260006 (linked to EC20260006)
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

  // 3-1. CC 상세정보 저장
  console.log('=== 3-1. CC 상세정보 저장 ===');
  const r1 = await post('/bp/cost/cc/detail/saveCcDetail.do', {
    ccPjtCd: ccPjt, ccRev: ccRev,
    _rowStatus: 'C',
    revNm: '1차 현상원가',
    factoryDiv: 'F2',
    factoryCd: 'FAC01',
    factoryNm: '화성공장',
    corpDiv: 'HQ',
    corpCd: 'CRP01',
    corpNm: '본사',
    attachFile: '',
    composeYn: 'N',
    rmk: 'EC20260006 기반 현상원가',
    sts: 'T'
  });
  console.log('Result:', JSON.stringify(r1));

  // 3-2. CC 원가코드/판가 등록 (EC의 cost_cd 구조 참조)
  console.log('\n=== 3-2. CC 원가코드/판가 등록 ===');
  const r2 = await post('/bp/cost/cc/detail/saveListCostCode.do', {
    ccPjtCd: ccPjt, ccRev: ccRev,
    saveList: [
      { _rowStatus: 'C', costSeq: 1, costCd: 'COST01', calcTarget: 'Y', prodDesc: 'Drive Shaft ASSY', currency: 'KRW', estSellPrice: 105000, sopYm: '202701', eopYm: '203012', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', costSeq: 2, costCd: 'COST02', calcTarget: 'Y', prodDesc: 'E-Axle ASSY', currency: 'KRW', estSellPrice: 107000, sopYm: '202612', eopYm: '203206', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', costSeq: 3, costCd: 'COST03', calcTarget: 'Y', prodDesc: 'Seat Module', currency: 'KRW', estSellPrice: 85670, sopYm: '202601', eopYm: '203106', rmk: '', sts: 'Y' }
    ]
  });
  console.log('Result:', JSON.stringify(r2));

  // 3-3. CC 수량/할인율 등록
  console.log('\n=== 3-3. CC 수량/할인율 등록 ===');
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

  // 3-4. CC 담당자 등록
  console.log('\n=== 3-4. CC 담당자 등록 ===');
  const r4 = await post('/bp/cost/cc/detail/saveListManager.do', {
    ccPjtCd: ccPjt, ccRev: ccRev,
    saveList: [
      { _rowStatus: 'C', managerSeq: 1, deptDiv: 'PT', mgrId: 'user01', mgrNm: '김설계', roleCd: 'LEADER', email: 'kim@test.com', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', managerSeq: 2, deptDiv: 'PT', mgrId: 'user02', mgrNm: '이구매', roleCd: 'MEMBER', email: 'lee@test.com', rmk: '', sts: 'Y' },
      { _rowStatus: 'C', managerSeq: 3, deptDiv: 'PT', mgrId: 'user03', mgrNm: '박생산', roleCd: 'MEMBER', email: 'park@test.com', rmk: '', sts: 'Y' }
    ]
  });
  console.log('Result:', JSON.stringify(r4));

  // 3-5. CC 일정 등록
  console.log('\n=== 3-5. CC 일정 등록 ===');
  const r5 = await post('/bp/cost/cc/detail/saveListSchedule.do', {
    ccPjtCd: ccPjt, ccRev: ccRev,
    saveList: [
      { _rowStatus: 'C', scheduleSeq: 1, taskNm: '설계검토', stdPeriod: '3M', startDt: '2026-03-01', endDt: '2026-05-31', actEndDt: '2026-05-25', procSts: 'C', delayDays: 0, sortOrder: 1, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', scheduleSeq: 2, taskNm: '시작품 제작', stdPeriod: '3M', startDt: '2026-06-01', endDt: '2026-08-31', actEndDt: '2026-09-05', procSts: 'C', delayDays: 5, sortOrder: 2, rmk: '', sts: 'Y' },
      { _rowStatus: 'C', scheduleSeq: 3, taskNm: '시험평가', stdPeriod: '3M', startDt: '2026-09-01', endDt: '2026-11-30', actEndDt: '', procSts: 'P', delayDays: 0, sortOrder: 3, rmk: '', sts: 'Y' }
    ]
  });
  console.log('Result:', JSON.stringify(r5));

  // 3-6. CC BOM 등록 (COST01 기준 - 간단한 BOM)
  console.log('\n=== 3-6. CC BOM 등록 ===');
  const bomList = [
    // COST01 BOM
    { _rowStatus: 'C', costCd: 'COST01', bomSeq: 1, partNo: 'PT-C01', partNm: '전동축 ASSY', partDiv: 'ASSY', qty: 1, recvUnitYn: 'Y', parentSeq: 0, bomLevel: 0, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST01', bomSeq: 2, partNo: 'PT-C01-D', partNm: '드라이브샤프트', partDiv: 'PART', qty: 2, recvUnitYn: 'N', parentSeq: 1, bomLevel: 1, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST01', bomSeq: 3, partNo: 'PT-C01-G', partNm: '감속기어 ASSY', partDiv: 'ASSY', qty: 1, recvUnitYn: 'N', parentSeq: 1, bomLevel: 1, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST01', bomSeq: 4, partNo: 'PT-C01-G01', partNm: '유성기어SET', partDiv: 'PART', qty: 1, recvUnitYn: 'N', parentSeq: 3, bomLevel: 2, rmk: '', sts: 'Y' },
    // COST02 BOM
    { _rowStatus: 'C', costCd: 'COST02', bomSeq: 1, partNo: 'PT-C01-E', partNm: '제어모듈 ASSY', partDiv: 'ASSY', qty: 1, recvUnitYn: 'Y', parentSeq: 0, bomLevel: 0, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST02', bomSeq: 2, partNo: 'PT-C01-E01', partNm: '인버터PCB', partDiv: 'PART', qty: 1, recvUnitYn: 'N', parentSeq: 1, bomLevel: 1, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST02', bomSeq: 3, partNo: 'PT-C01-E02', partNm: '커넥터하네스', partDiv: 'PART', qty: 1, recvUnitYn: 'N', parentSeq: 1, bomLevel: 1, rmk: '', sts: 'Y' },
    // COST03 BOM
    { _rowStatus: 'C', costCd: 'COST03', bomSeq: 1, partNo: 'PT-C01-M', partNm: '전동모터 ASSY', partDiv: 'ASSY', qty: 1, recvUnitYn: 'Y', parentSeq: 0, bomLevel: 0, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST03', bomSeq: 2, partNo: 'PT-C01-M01', partNm: 'BLDC모터', partDiv: 'PART', qty: 1, recvUnitYn: 'N', parentSeq: 1, bomLevel: 1, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST03', bomSeq: 3, partNo: 'PT-C01-M02', partNm: '모터하우징', partDiv: 'PART', qty: 1, recvUnitYn: 'N', parentSeq: 1, bomLevel: 1, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST03', bomSeq: 4, partNo: 'PT-C01-M03', partNm: '로터+스테이터', partDiv: 'PART', qty: 1, recvUnitYn: 'N', parentSeq: 1, bomLevel: 1, rmk: '', sts: 'Y' }
  ];
  const r6 = await post('/bp/cost/cc/detail/saveListBom.do', {
    ccPjtCd: ccPjt, ccRev: ccRev, saveList: bomList
  });
  console.log('Result:', JSON.stringify(r6));

  // 3-7. CC 부품단가 등록
  console.log('\n=== 3-7. CC 부품단가 등록 ===');
  const priceList = [
    // COST01 prices
    { _rowStatus: 'C', costCd: 'COST01', partPriceSeq: 1, partNo: 'PT-C01-D', partNm: '드라이브샤프트', partDiv: 'PART',
      pimsCurrency: 'KRW', pimsPrice: 35000, designCurrency: 'KRW', designCostPrice: 34000,
      purchaseCurrency: 'KRW', purchaseEstPrice: 33500, confirmCurrency: 'KRW', confirmedPrice: 33000, lossRate: 2, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST01', partPriceSeq: 2, partNo: 'PT-C01-G01', partNm: '유성기어SET', partDiv: 'PART',
      pimsCurrency: 'KRW', pimsPrice: 10000, designCurrency: 'KRW', designCostPrice: 9500,
      purchaseCurrency: 'KRW', purchaseEstPrice: 9200, confirmCurrency: 'KRW', confirmedPrice: 9000, lossRate: 1.5, rmk: '', sts: 'Y' },
    // COST02 prices
    { _rowStatus: 'C', costCd: 'COST02', partPriceSeq: 1, partNo: 'PT-C01-E01', partNm: '인버터PCB', partDiv: 'PART',
      pimsCurrency: 'KRW', pimsPrice: 125000, designCurrency: 'KRW', designCostPrice: 120000,
      purchaseCurrency: 'KRW', purchaseEstPrice: 118000, confirmCurrency: 'KRW', confirmedPrice: 115000, lossRate: 1, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST02', partPriceSeq: 2, partNo: 'PT-C01-E02', partNm: '커넥터하네스', partDiv: 'PART',
      pimsCurrency: 'KRW', pimsPrice: 47000, designCurrency: 'KRW', designCostPrice: 45000,
      purchaseCurrency: 'KRW', purchaseEstPrice: 44000, confirmCurrency: 'KRW', confirmedPrice: 43500, lossRate: 1.5, rmk: '', sts: 'Y' },
    // COST03 prices
    { _rowStatus: 'C', costCd: 'COST03', partPriceSeq: 1, partNo: 'PT-C01-M01', partNm: 'BLDC모터', partDiv: 'PART',
      pimsCurrency: 'KRW', pimsPrice: 185000, designCurrency: 'KRW', designCostPrice: 178000,
      purchaseCurrency: 'KRW', purchaseEstPrice: 175000, confirmCurrency: 'KRW', confirmedPrice: 172000, lossRate: 1, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST03', partPriceSeq: 2, partNo: 'PT-C01-M02', partNm: '모터하우징', partDiv: 'PART',
      pimsCurrency: 'KRW', pimsPrice: 33000, designCurrency: 'KRW', designCostPrice: 32000,
      purchaseCurrency: 'KRW', purchaseEstPrice: 31000, confirmCurrency: 'KRW', confirmedPrice: 30500, lossRate: 2, rmk: '', sts: 'Y' },
    { _rowStatus: 'C', costCd: 'COST03', partPriceSeq: 3, partNo: 'PT-C01-M03', partNm: '로터+스테이터', partDiv: 'PART',
      pimsCurrency: 'KRW', pimsPrice: 120000, designCurrency: 'KRW', designCostPrice: 115000,
      purchaseCurrency: 'KRW', purchaseEstPrice: 112000, confirmCurrency: 'KRW', confirmedPrice: 110000, lossRate: 1.5, rmk: '', sts: 'Y' }
  ];
  const r7 = await post('/bp/cost/cc/detail/saveListPartPrice.do', {
    ccPjtCd: ccPjt, ccRev: ccRev, saveList: priceList
  });
  console.log('Result:', JSON.stringify(r7));

  // === 검증 ===
  console.log('\n=== CC 데이터 검증 ===');

  const vd = await post('/bp/cost/cc/detail/findCcDetail.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('Detail:', vd.revNm || '(empty)', vd.factoryNm || '');

  const vc = await post('/bp/cost/cc/detail/findListCostCode.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('CostCodes:', vc.length, 'rows');
  vc.forEach(r => console.log('  ', r.costCd, r.prodDesc, r.estSellPrice));

  const vq = await post('/bp/cost/cc/detail/findListQtyDisc.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('QtyDisc:', Array.isArray(vq) ? vq.length : 'type=' + typeof vq, 'rows');

  const vm = await post('/bp/cost/cc/detail/findListManager.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('Managers:', vm.length, 'rows');
  vm.forEach(r => console.log('  ', r.mgrNm, r.roleCd));

  const vs = await post('/bp/cost/cc/detail/findListSchedule.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('Schedules:', vs.length, 'rows');
  vs.forEach(r => console.log('  ', r.taskNm, r.procSts));

  const vb = await post('/bp/cost/cc/detail/findListBom.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('BOM:', vb.length, 'rows');
  vb.forEach(r => console.log('  ', r.costCd, r.partNo, r.partNm));

  const vp = await post('/bp/cost/cc/detail/findListPartPrice.do', { ccPjtCd: ccPjt, ccRev: ccRev });
  console.log('PartPrices:', vp.length, 'rows');
  vp.forEach(r => console.log('  ', r.costCd, r.partNo, r.confirmedPrice || r.confirmPrice));
}

run().catch(e => console.error(e));
