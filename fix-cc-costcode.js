/**
 * Debug and fix CC CostCode/QtyDisc for test projects
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
  const projects = [
    { cc: 'CC_S01', costCodes: [
      { cd: 'COST01', desc: 'Seat Frame ASSY', price: 85000, sopYm: '202701', eopYm: '203112' },
      { cd: 'COST02', desc: 'Seat Heater Module', price: 42000, sopYm: '202701', eopYm: '203112' }
    ], qty: [15000, 18000, 20000, 18000, 15000] },
    { cc: 'CC_R01', costCodes: [
      { cd: 'COST01', desc: 'Drive Shaft ASSY', price: 120000, sopYm: '202606', eopYm: '203006' },
      { cd: 'COST02', desc: 'E-Motor ASSY', price: 280000, sopYm: '202606', eopYm: '203006' },
      { cd: 'COST03', desc: 'Reducer ASSY', price: 95000, sopYm: '202606', eopYm: '203006' }
    ], qty: [10000, 12000, 15000, 12000, 10000] },
    { cc: 'CC_M01', costCodes: [
      { cd: 'COST01', desc: 'E-Axle Module', price: 350000, sopYm: '202703', eopYm: '203203' },
      { cd: 'COST02', desc: 'Inverter Unit', price: 180000, sopYm: '202703', eopYm: '203203' }
    ], qty: [8000, 10000, 12000, 10000, 8000] }
  ];

  for (const p of projects) {
    console.log(`\n=== ${p.cc} ===`);

    // Check current state
    const curCc = await post('/bp/cost/cc/detail/findListCostCode.do', { ccPjtCd: p.cc, ccRev: 1 });
    console.log('  Current CostCode:', Array.isArray(curCc) ? curCc.length + ' rows' : JSON.stringify(curCc).substring(0, 100));

    // Try saving CostCode
    const ccList = p.costCodes.map((cc, i) => ({
      _rowStatus: 'C', costCodeSeq: i+1, costCd: cc.cd, calcTarget: 'Y',
      prodDesc: cc.desc, currency: 'KRW', estSellPrice: cc.price,
      sopYm: cc.sopYm, eopYm: cc.eopYm, rmk: '', sts: 'Y'
    }));
    console.log('  Saving CostCode:', JSON.stringify(ccList[0]).substring(0, 100));
    const r1 = await post('/bp/cost/cc/detail/saveListCostCode.do', { ccPjtCd: p.cc, ccRev: 1, saveList: ccList });
    console.log('  Save result:', JSON.stringify(r1).substring(0, 200));

    // Verify
    const v1 = await post('/bp/cost/cc/detail/findListCostCode.do', { ccPjtCd: p.cc, ccRev: 1 });
    console.log('  After save CostCode:', Array.isArray(v1) ? v1.length + ' rows' : JSON.stringify(v1).substring(0, 100));

    // Save QtyDisc (pivoted format: yr1Qty~yr5Qty per costCd)
    const qtyList = p.costCodes.map(cc => {
      const row = { costCd: cc.cd };
      for (let y = 0; y < 5; y++) {
        row[`yr${y+1}Qty`] = p.qty[y];
        row[`yr${y+1}DiscRate`] = y === 0 ? 0 : y * 1.5;
      }
      return row;
    });
    const r2 = await post('/bp/cost/cc/detail/saveListQtyDisc.do', { ccPjtCd: p.cc, ccRev: 1, saveList: qtyList });
    console.log('  QtyDisc save result:', JSON.stringify(r2).substring(0, 200));

    // Verify
    const v2 = await post('/bp/cost/cc/detail/findListQtyDisc.do', { ccPjtCd: p.cc, ccRev: 1 });
    console.log('  After save QtyDisc:', Array.isArray(v2) ? v2.length + ' rows' : JSON.stringify(v2).substring(0, 100));
  }
}

run().catch(e => console.error(e));
