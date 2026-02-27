/**
 * Compare working data (EC20260006/TC20260006/CC20260006) vs test data (TC_S01/CC_S01 etc.)
 * to find structural differences that prevent test data from displaying
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
  console.log('═══════════════════════════════════════════');
  console.log('  WORKING DATA vs TEST DATA COMPARISON');
  console.log('═══════════════════════════════════════════\n');

  // === EC Project Master ===
  console.log('=== EC Project Master ===');
  const ecWorking = await post('/bp/cost/ec/findEstimateCostPjt.do', { ecPjtCd: 'EC20260006' });
  console.log('Working (EC20260006):', JSON.stringify(ecWorking));
  const ecTest = await post('/bp/cost/ec/findEstimateCostPjt.do', { ecPjtCd: 'EC_TC_S01' });
  console.log('Test (EC_TC_S01):', JSON.stringify(ecTest));

  // === TC Project List comparison ===
  console.log('\n=== TC Project List ===');
  const tcList = await post('/bp/cost/tc/findListTargetCostPjt.do', {});
  const tcWorking = tcList.find(r => r.pjtCd === 'TC20260006');
  const tcTest = tcList.find(r => r.pjtCd === 'TC_S01');
  console.log('Working (TC20260006):', JSON.stringify(tcWorking));
  console.log('Test (TC_S01):', JSON.stringify(tcTest));

  // === TC Detail comparison ===
  console.log('\n=== TC Detail ===');
  const tcDetW = await post('/bp/cost/tc/detail/findTcDetail.do', { tgtPjtCd: 'TC20260006' });
  const tcDetT = await post('/bp/cost/tc/detail/findTcDetail.do', { tgtPjtCd: 'TC_S01' });
  console.log('Working (TC20260006):', JSON.stringify(tcDetW));
  console.log('Test (TC_S01):', JSON.stringify(tcDetT));

  // === TC sub-data comparison ===
  const tcEntities = [
    { name: 'Manager', api: '/bp/cost/tc/detail/findListManager.do' },
    { name: 'Spec', api: '/bp/cost/tc/detail/findListSpec.do' },
    { name: 'Price', api: '/bp/cost/tc/detail/findListPrice.do' },
    { name: 'QtyDisc', api: '/bp/cost/tc/detail/findListQtyDisc.do' },
    { name: 'DevSchedule', api: '/bp/cost/tc/detail/findListDevSchedule.do' },
    { name: 'SetupSchedule', api: '/bp/cost/tc/detail/findListSetupSchedule.do' },
    { name: 'Guide', api: '/bp/cost/tc/guide/findListTargetCostGuide.do' },
    { name: 'AchvPlan', api: '/bp/cost/tc/detail/findListAchvPlan.do' },
  ];

  console.log('\n=== TC Sub-data Row Counts ===');
  for (const e of tcEntities) {
    const w = await post(e.api, { tgtPjtCd: 'TC20260006' });
    const t = await post(e.api, { tgtPjtCd: 'TC_S01' });
    console.log(`  ${e.name}: Working=${Array.isArray(w)?w.length:'N/A'}, Test=${Array.isArray(t)?t.length:'N/A'}`);
  }

  // === CC Project comparison ===
  console.log('\n=== CC Project ===');
  const ccList = await post('/bp/cost/cc/findListCurrentCostPjt.do', {});
  const ccWorking = ccList.find(r => r.pjtCd === 'CC20260006');
  const ccTest = ccList.find(r => r.pjtCd === 'CC_S01');
  console.log('Working (CC20260006):', JSON.stringify(ccWorking));
  console.log('Test (CC_S01):', JSON.stringify(ccTest));

  // === CC sub-data comparison ===
  const ccEntities = [
    { name: 'Detail', api: '/bp/cost/cc/detail/findCcDetail.do', isObj: true },
    { name: 'CostCode', api: '/bp/cost/cc/detail/findListCostCode.do' },
    { name: 'QtyDisc', api: '/bp/cost/cc/detail/findListQtyDisc.do' },
    { name: 'Manager', api: '/bp/cost/cc/detail/findListManager.do' },
    { name: 'Schedule', api: '/bp/cost/cc/detail/findListSchedule.do' },
    { name: 'BOM', api: '/bp/cost/cc/detail/findListBom.do' },
    { name: 'PartPrice', api: '/bp/cost/cc/detail/findListPartPrice.do' },
  ];

  console.log('\n=== CC Sub-data Row Counts ===');
  for (const e of ccEntities) {
    const w = await post(e.api, { ccPjtCd: 'CC20260006', ccRev: 1 });
    const t = await post(e.api, { ccPjtCd: 'CC_S01', ccRev: 1 });
    if (e.isObj) {
      console.log(`  ${e.name}: Working=${Object.keys(w).length>0?'YES':'EMPTY'}, Test=${Object.keys(t).length>0?'YES':'EMPTY'}`);
    } else {
      console.log(`  ${e.name}: Working=${Array.isArray(w)?w.length:'ERR'}, Test=${Array.isArray(t)?t.length:'ERR'}`);
    }
  }

  // === KEY DIFFERENCE: Check the test data EC project ===
  console.log('\n=== EC Project List (check test EC projects) ===');
  const ecList = await post('/bp/cost/ec/findListEstimateCostPjt.do', {});
  console.log('Total EC projects:', ecList.length);
  const testEcs = ecList.filter(r => r.ecPjtCd && (r.ecPjtCd.startsWith('EC_TC') || r.ecPjtCd === 'EC20260006'));
  testEcs.forEach(r => console.log(`  ${r.ecPjtCd}: pjtNm=${r.pjtNm}, sts=${r.sts}`));

  // === DB-level check: test data in tables ===
  console.log('\n=== Direct DB check for test data ===');
  // Check if TC_S01 detail data exists by checking a known API
  const tcS01Manager = await post('/bp/cost/tc/detail/findListManager.do', { tgtPjtCd: 'TC_S01' });
  console.log('TC_S01 managers:', tcS01Manager.length);
  if (tcS01Manager.length > 0) {
    console.log('  First:', JSON.stringify(tcS01Manager[0]));
  }

  const ccS01CostCode = await post('/bp/cost/cc/detail/findListCostCode.do', { ccPjtCd: 'CC_S01', ccRev: 1 });
  console.log('CC_S01 cost codes:', ccS01CostCode.length);
  if (ccS01CostCode.length > 0) {
    console.log('  First:', JSON.stringify(ccS01CostCode[0]));
  }

  const ccS01Bom = await post('/bp/cost/cc/detail/findListBom.do', { ccPjtCd: 'CC_S01', ccRev: 1 });
  console.log('CC_S01 BOM:', ccS01Bom.length);

  const ccS01Price = await post('/bp/cost/cc/detail/findListPartPrice.do', { ccPjtCd: 'CC_S01', ccRev: 1 });
  console.log('CC_S01 Part Prices:', ccS01Price.length);
}

run().catch(e => console.error(e));
