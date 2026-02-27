/**
 * Step 7-8: Final verification - All projects, all APIs
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

async function check(label, path, body) {
  try {
    const res = await post(path, body);
    const d = res.data;
    let info = '';
    if (Array.isArray(d)) info = `${d.length} rows`;
    else if (typeof d === 'object' && d !== null) {
      if (d.plList) info = `plList:${d.plList.length}`;
      else if (d.sgaData) info = `sgaData:OK`;
      else if (d.detailOutsrc) info = `mfg:nested`;
      else if (d.npvData) info = `npv:OK`;
      else info = `obj:${Object.keys(d).length}keys`;
    }
    const ok = res.status === 200 && (
      (Array.isArray(d) && d.length > 0) ||
      (typeof d === 'object' && d !== null && !d.error && Object.keys(d).length > 2)
    );
    return { label, ok, info, status: res.status };
  } catch (e) {
    return { label, ok: false, info: e.message, status: 0 };
  }
}

async function verifyProject(name, ecPjt, tcPjt, ccPjt) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  ${name}`);
  console.log(`  EC=${ecPjt}  TC=${tcPjt}  CC=${ccPjt}`);
  console.log(`${'─'.repeat(50)}`);

  const results = [];

  // EC endpoints
  results.push(await check('EC Detail', '/bp/cost/ec/detail/findEcDetail.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC CostCode', '/bp/cost/ec/detail/findListCostCode.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC QtyDisc', '/bp/cost/ec/detail/findListQtyDisc.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC Manager', '/bp/cost/ec/detail/findListManager.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC Schedule', '/bp/cost/ec/detail/findListSchedule.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC BOM', '/bp/cost/ec/bom/findListEcBom.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC LineInvest', '/bp/cost/ec/detail/findListLineInvest.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC OtherInvest', '/bp/cost/ec/detail/findListOtherInvest.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC Manpower', '/bp/cost/ec/detail/findListManpower.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC MfgCost', '/bp/cost/ec/detail/findListMfgCost.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC SgaCost', '/bp/cost/ec/detail/findListSgaCost.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC PlStmt', '/bp/cost/ec/detail/findListPlStmt.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC Sensitivity', '/bp/cost/ec/detail/findListSensitivity.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC FundPlan', '/bp/cost/ec/detail/findListFundPlan.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC NPV', '/bp/cost/ec/detail/findListNpv.do', { ecPjtCd: ecPjt }));
  results.push(await check('EC Profit', '/bp/cost/ec/profit/findEcProfit.do', { ecPjtCd: ecPjt }));

  // TC endpoints
  results.push(await check('TC Manager', '/bp/cost/tc/detail/findListManager.do', { tgtPjtCd: tcPjt }));
  results.push(await check('TC Spec', '/bp/cost/tc/detail/findListSpec.do', { tgtPjtCd: tcPjt }));
  results.push(await check('TC Price', '/bp/cost/tc/detail/findListPrice.do', { tgtPjtCd: tcPjt }));
  results.push(await check('TC QtyDisc', '/bp/cost/tc/detail/findListQtyDisc.do', { tgtPjtCd: tcPjt }));
  results.push(await check('TC DevSched', '/bp/cost/tc/detail/findListDevSchedule.do', { tgtPjtCd: tcPjt }));
  results.push(await check('TC SetupSched', '/bp/cost/tc/detail/findListSetupSchedule.do', { tgtPjtCd: tcPjt }));
  results.push(await check('TC Guide', '/bp/cost/tc/guide/findListTargetCostGuide.do', { tgtPjtCd: tcPjt }));
  results.push(await check('TC CostReg', '/bp/cost/tc/detail/findListCostReg.do', { tgtPjtCd: tcPjt }));
  results.push(await check('TC AchvPlan', '/bp/cost/tc/detail/findListAchvPlan.do', { tgtPjtCd: tcPjt }));
  results.push(await check('TC AchvPlanDtl', '/bp/cost/tc/detail/findListAchvPlanDtl.do', { tgtPjtCd: tcPjt }));
  results.push(await check('TC Recalc', '/bp/cost/tc/detail/findListRecalc.do', { tgtPjtCd: tcPjt }));
  results.push(await check('TC AchvStatus', '/bp/cost/tc/detail/findListAchvStatus.do', { tgtPjtCd: tcPjt }));

  // CC endpoints
  results.push(await check('CC Detail', '/bp/cost/cc/detail/findCcDetail.do', { ccPjtCd: ccPjt, ccRev: 1 }));
  results.push(await check('CC CostCode', '/bp/cost/cc/detail/findListCostCode.do', { ccPjtCd: ccPjt, ccRev: 1 }));
  results.push(await check('CC QtyDisc', '/bp/cost/cc/detail/findListQtyDisc.do', { ccPjtCd: ccPjt, ccRev: 1 }));
  results.push(await check('CC Manager', '/bp/cost/cc/detail/findListManager.do', { ccPjtCd: ccPjt, ccRev: 1 }));
  results.push(await check('CC Schedule', '/bp/cost/cc/detail/findListSchedule.do', { ccPjtCd: ccPjt, ccRev: 1 }));
  results.push(await check('CC BOM', '/bp/cost/cc/detail/findListBom.do', { ccPjtCd: ccPjt, ccRev: 1 }));
  results.push(await check('CC PartPrice', '/bp/cost/cc/detail/findListPartPrice.do', { ccPjtCd: ccPjt, ccRev: 1 }));
  results.push(await check('CC ActEval', '/bp/cost/cc/detail/findListActEval.do', { ccPjtCd: ccPjt, ccRev: 1 }));

  const pass = results.filter(r => r.ok).length;
  const fail = results.filter(r => !r.ok).length;

  for (const r of results) {
    console.log(`  [${r.ok ? 'OK' : 'NG'}] ${r.label}: ${r.info}`);
  }
  console.log(`  => ${pass}/${pass+fail} passed`);

  return { pass, fail, name };
}

async function run() {
  console.log('════════════════════════════════════════════════════');
  console.log('  FINAL VERIFICATION - ALL PROJECTS');
  console.log('════════════════════════════════════════════════════');

  const summaries = [];

  // EC20260006 main project
  summaries.push(await verifyProject('EC20260006 (Main)', 'EC20260006', 'TC20260006', 'CC20260006'));

  // Test projects
  summaries.push(await verifyProject('Case1: 원가혁신 성공', 'EC_TC_S01', 'TC_S01', 'CC_S01'));
  summaries.push(await verifyProject('Case2: 환율리스크', 'EC_TC_R01', 'TC_R01', 'CC_R01'));
  summaries.push(await verifyProject('Case3: 혼합', 'EC_TC_M01', 'TC_M01', 'CC_M01'));

  // Achievement Evaluation overall
  console.log(`\n${'─'.repeat(50)}`);
  console.log('  Achievement Evaluation (Global)');
  console.log(`${'─'.repeat(50)}`);
  const achvRes = await post('/bp/cost/cc/achv/findListAchievementEval.do', {});
  if (achvRes.status === 200 && Array.isArray(achvRes.data)) {
    console.log(`  Total AchvEval records: ${achvRes.data.length}`);
    achvRes.data.forEach(r => {
      console.log(`    ${r.curPjtCd}: EC=${r.ecPjtCd}, TGT=${r.tgtPjtCd}, rate=${r.achvRate}% ${r.achvYn}`);
    });
  }

  // Final summary
  console.log(`\n${'═'.repeat(50)}`);
  console.log('  OVERALL SUMMARY');
  console.log(`${'═'.repeat(50)}`);
  let totalPass = 0, totalFail = 0;
  for (const s of summaries) {
    const icon = s.fail === 0 ? 'PASS' : 'PARTIAL';
    console.log(`  [${icon}] ${s.name}: ${s.pass}/${s.pass + s.fail}`);
    totalPass += s.pass;
    totalFail += s.fail;
  }
  console.log(`\n  TOTAL: ${totalPass} passed / ${totalFail} failed / ${totalPass + totalFail} total`);

  if (totalFail === 0) {
    console.log('\n  ALL ENDPOINTS WORKING CORRECTLY!');
  }
}

run().catch(e => console.error('FATAL:', e));
