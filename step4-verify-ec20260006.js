/**
 * Step 4: EC20260006 Full API Verification
 * Call every frontend API endpoint and verify response
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
      res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(buf) }); } catch(e) { resolve({ status: res.statusCode, data: buf }); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function check(label, path, body, expectFn) {
  try {
    const res = await post(path, body);
    const ok = expectFn(res);
    const icon = ok ? 'OK' : 'WARN';
    console.log(`  [${icon}] ${label}: status=${res.status}, ${typeof res.data === 'object' ? (Array.isArray(res.data) ? res.data.length + ' rows' : 'object') : 'string'}`);
    if (!ok && typeof res.data === 'object') {
      console.log(`        ${JSON.stringify(res.data).substring(0, 150)}`);
    }
    return ok;
  } catch (e) {
    console.log(`  [ERR] ${label}: ${e.message}`);
    return false;
  }
}

async function run() {
  let pass = 0, fail = 0;
  const count = (ok) => ok ? pass++ : fail++;

  console.log('========================================');
  console.log('  EC20260006 FULL API VERIFICATION');
  console.log('========================================\n');

  // ---- EC Endpoints ----
  console.log('--- EC (Estimation Cost) ---');
  count(await check('EC Detail', '/bp/cost/ec/detail/findEcDetail.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && typeof r.data === 'object' && !Array.isArray(r.data)));
  count(await check('EC CostCode', '/bp/cost/ec/detail/findListCostCode.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('EC QtyDisc', '/bp/cost/ec/detail/findListQtyDisc.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('EC Manager', '/bp/cost/ec/detail/findListManager.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('EC Schedule', '/bp/cost/ec/detail/findListSchedule.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 2));
  count(await check('EC BOM', '/bp/cost/ec/bom/findListEcBom.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 10));
  count(await check('EC LineInvest', '/bp/cost/ec/detail/findListLineInvest.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 1));
  count(await check('EC OtherInvest', '/bp/cost/ec/detail/findListOtherInvest.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 4));
  count(await check('EC Manpower', '/bp/cost/ec/detail/findListManpower.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('EC MfgCost', '/bp/cost/ec/detail/findListMfgCost.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('EC SgaCost', '/bp/cost/ec/detail/findListSgaCost.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('EC PlStmt', '/bp/cost/ec/detail/findListPlStmt.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 5));
  count(await check('EC Sensitivity', '/bp/cost/ec/detail/findListSensitivity.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 1));
  count(await check('EC FundPlan', '/bp/cost/ec/detail/findListFundPlan.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 1));
  count(await check('EC NPV', '/bp/cost/ec/detail/findListNpv.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 1));
  count(await check('EC Profit', '/bp/cost/ec/profit/findEcProfit.do', { ecPjtCd: 'EC20260006' },
    r => r.status === 200 && typeof r.data === 'object'));

  // ---- TC Endpoints ----
  console.log('\n--- TC (Target Cost) ---');
  count(await check('TC Manager', '/bp/cost/tc/detail/findListManager.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('TC Spec', '/bp/cost/tc/detail/findListSpec.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('TC Price', '/bp/cost/tc/detail/findListPrice.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('TC QtyDisc', '/bp/cost/tc/detail/findListQtyDisc.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 15));
  count(await check('TC DevSchedule', '/bp/cost/tc/detail/findListDevSchedule.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 4));
  count(await check('TC SetupSchedule', '/bp/cost/tc/detail/findListSetupSchedule.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('TC Guide', '/bp/cost/tc/guide/findListTargetCostGuide.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 4));
  count(await check('TC CostReg', '/bp/cost/tc/detail/findListCostReg.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 4));
  count(await check('TC AchvPlan', '/bp/cost/tc/detail/findListAchvPlan.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 4));
  count(await check('TC AchvPlanDtl', '/bp/cost/tc/detail/findListAchvPlanDtl.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 9));
  count(await check('TC Recalc', '/bp/cost/tc/detail/findListRecalc.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 2));
  count(await check('TC AchvStatus', '/bp/cost/tc/detail/findListAchvStatus.do', { tgtPjtCd: 'TC20260006' },
    r => r.status === 200));

  // ---- CC Endpoints ----
  console.log('\n--- CC (Current Cost) ---');
  count(await check('CC Detail', '/bp/cost/cc/detail/findCcDetail.do', { ccPjtCd: 'CC20260006', ccRev: 1 },
    r => r.status === 200 && typeof r.data === 'object'));
  count(await check('CC CostCode', '/bp/cost/cc/detail/findListCostCode.do', { ccPjtCd: 'CC20260006', ccRev: 1 },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('CC QtyDisc', '/bp/cost/cc/detail/findListQtyDisc.do', { ccPjtCd: 'CC20260006', ccRev: 1 },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('CC Manager', '/bp/cost/cc/detail/findListManager.do', { ccPjtCd: 'CC20260006', ccRev: 1 },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('CC Schedule', '/bp/cost/cc/detail/findListSchedule.do', { ccPjtCd: 'CC20260006', ccRev: 1 },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 3));
  count(await check('CC BOM', '/bp/cost/cc/detail/findListBom.do', { ccPjtCd: 'CC20260006', ccRev: 1 },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 11));
  count(await check('CC PartPrice', '/bp/cost/cc/detail/findListPartPrice.do', { ccPjtCd: 'CC20260006', ccRev: 1 },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 7));
  count(await check('CC ActEval', '/bp/cost/cc/detail/findListActEval.do', { ccPjtCd: 'CC20260006', ccRev: 1 },
    r => r.status === 200 && Array.isArray(r.data) && r.data.length >= 4));

  // ---- Achievement Evaluation ----
  console.log('\n--- Achievement Evaluation ---');
  count(await check('AchvEval List', '/bp/cost/cc/achv/findListAchievementEval.do', {},
    r => r.status === 200 && Array.isArray(r.data) && r.data.some(e => e.curPjtCd === 'CC20260006')));

  // ---- Summary ----
  console.log('\n========================================');
  console.log(`  RESULT: ${pass} passed / ${fail} failed / ${pass + fail} total`);
  console.log('========================================');
  if (fail > 0) {
    console.log('  Some endpoints failed. Check WARN/ERR items above.');
  } else {
    console.log('  All endpoints returned expected data!');
  }
}

run().catch(e => console.error('FATAL:', e));
