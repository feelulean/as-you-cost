/**
 * Complete achievement evaluation flow for EC20260006/TC20260006/CC20260006
 * Step 4: TC CostReg -> Step 5: TC AchvPlan -> Step 6: CC Actual Evaluation
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
  // ====================================================================
  // Step 4: TC 원가등록 (CostReg) - based on Guide data
  // ====================================================================
  console.log('=== Step 4: TC 원가등록 ===');

  // EC20260006 base costs (from P&L year 1):
  // mat_cost=50,400,000, labor=4,500,000, mfg=2,180,400, sga=735,000
  // prod_qty = 120,000
  // Unit: mat=420, labor=37.5, mfg=18.17, sga=6.125
  // But Guide has different values, let's use Guide as base

  const guide = await post('/bp/cost/tc/guide/findListTargetCostGuide.do', { tgtPjtCd: 'TC20260006' });
  console.log('Guide data:', guide.length, 'rows');
  guide.forEach(r => console.log('  ', r.costItemCd, r.costItemNm, 'ec='+r.ecCostUnitAmt, 'tgt='+r.guideTgtUnitAmt));

  // Create CostReg from Guide data
  const costRegList = guide.map((g, i) => ({
    _rowStatus: 'C',
    costSeq: i + 1,
    costItemCd: g.costItemCd,
    costItemNm: g.costItemNm,
    deptCd: g.deptCd,
    deptNm: g.deptNm,
    ecCostAmt: g.ecCostUnitAmt,
    guideAmt: g.guideTgtUnitAmt,
    finalTgtAmt: g.guideTgtUnitAmt,
    diffAmt: 0,
    adjReason: '',
    saveTgtAmt: g.ecCostUnitAmt - g.guideTgtUnitAmt,
    confirmYn: 'Y',
    viewMode: 'T',
    rmk: '',
    sts: 'Y'
  }));

  const r4 = await post('/bp/cost/tc/detail/saveListCostReg.do', {
    tgtPjtCd: 'TC20260006',
    saveList: costRegList
  });
  console.log('CostReg save:', JSON.stringify(r4));

  // Verify
  const costRegs = await post('/bp/cost/tc/detail/findListCostReg.do', { tgtPjtCd: 'TC20260006' });
  console.log('CostReg verify:', costRegs.length, 'rows');
  costRegs.forEach(r => console.log('  ', r.costItemCd, 'ec='+r.ecCostAmt, 'tgt='+r.finalTgtAmt, 'save='+r.saveTgtAmt));

  // ====================================================================
  // Step 5: TC 달성계획 (AchvPlan)
  // ====================================================================
  console.log('\n=== Step 5: TC 달성계획 ===');

  const achvPlanList = costRegs.map((cr, i) => ({
    _rowStatus: 'C',
    planSeq: i + 1,
    costItemCd: cr.costItemCd,
    costItemNm: cr.costItemNm,
    ecCostAmt: cr.ecCostAmt,
    tgtCostAmt: cr.finalTgtAmt,
    saveTgtAmt: cr.saveTgtAmt,
    savePlanAmt: cr.saveTgtAmt, // plan = target
    confirmYn: 'Y',
    rmk: '',
    sts: 'Y'
  }));

  const r5 = await post('/bp/cost/tc/detail/saveListAchvPlan.do', {
    tgtPjtCd: 'TC20260006',
    saveList: achvPlanList
  });
  console.log('AchvPlan save:', JSON.stringify(r5));

  // Verify
  const achvPlans = await post('/bp/cost/tc/detail/findListAchvPlan.do', { tgtPjtCd: 'TC20260006' });
  console.log('AchvPlan verify:', achvPlans.length, 'rows');
  achvPlans.forEach(r => console.log('  ', r.costItemCd, 'ec='+r.ecCostAmt, 'tgt='+r.tgtCostAmt, 'saveTgt='+r.saveTgtAmt, 'savePlan='+r.savePlanAmt));

  // ====================================================================
  // Step 6: CC Actual Evaluation
  // ====================================================================
  console.log('\n=== Step 6: CC 실적평가 ===');

  // CC actual costs (based on confirmed prices from part prices):
  // COST01: DS=33000*2=66000, GearSet=9000 = 75000 (vs EC BOM total for those parts)
  // COST02: Inverter=115000, Connector=43500 = 158500
  // COST03: BLDC=172000, Housing=30500, Rotor=110000 = 312500
  // Total actual material = 546000 per unit
  // vs EC: mat_cost per unit = 50400000/120000 = 420 ? No, that's too low.
  // Actually EC P&L shows total across all years, not per unit.

  // Let's use the Guide cost items for evaluation
  // EC unit amounts from Guide: MAT=13, LABOR=2, MFG=3, SGA=1
  // Target amounts from Guide: MAT=12, LABOR=2, MFG=3, SGA=1
  // Actual amounts (CC - slightly better than target):
  const evalItems = [
    { costItemCd: 'MAT', costItemNm: '재료비', ecAmt: 13, tgtAmt: 12, actAmt: 11 },
    { costItemCd: 'LABOR', costItemNm: '인건비', ecAmt: 2, tgtAmt: 2, actAmt: 2 },
    { costItemCd: 'MFG', costItemNm: '제조경비', ecAmt: 3, tgtAmt: 3, actAmt: 3 },
    { costItemCd: 'SGA', costItemNm: '판관비', ecAmt: 1, tgtAmt: 1, actAmt: 1 }
  ];

  const actEvalList = evalItems.map((it, i) => {
    const saveTgt = it.ecAmt - it.tgtAmt;
    const saveAct = it.ecAmt - it.actAmt;
    const achvRate = saveTgt > 0 ? Math.round(saveAct / saveTgt * 10000) / 100 : (saveAct >= 0 ? 100 : 0);
    return {
      _rowStatus: 'C',
      evalSeq: i + 1,
      tgtCostCd: it.costItemCd,
      costItemNm: it.costItemNm,
      ecAmt: it.ecAmt,
      tgtAmt: it.tgtAmt,
      saveTgtAmt: saveTgt,
      actAmt: it.actAmt,
      saveActAmt: saveAct,
      achvRate: achvRate,
      achvYn: achvRate >= 100 ? 'Y' : 'N',
      rmk: '',
      sts: 'Y'
    };
  });

  const r6 = await post('/bp/cost/cc/detail/saveListActEval.do', {
    ccPjtCd: 'CC20260006',
    ccRev: 1,
    saveList: actEvalList
  });
  console.log('ActEval save:', JSON.stringify(r6));

  // Verify
  const actEvals = await post('/bp/cost/cc/detail/findListActEval.do', { ccPjtCd: 'CC20260006', ccRev: 1 });
  console.log('ActEval verify:', actEvals.length, 'rows');
  if (Array.isArray(actEvals)) {
    actEvals.forEach(r => console.log('  ', r.costItemNm || r.tgtCostCd, 'ec='+r.ecAmt, 'tgt='+r.tgtAmt, 'act='+r.actAmt, 'achv='+r.achvRate+'%', r.achvYn));
  } else {
    console.log('  Response:', JSON.stringify(actEvals).substring(0, 200));
  }

  // ====================================================================
  // Final Summary
  // ====================================================================
  console.log('\n════════════════════════════════════');
  console.log('  FINAL DATA SUMMARY FOR EC20260006');
  console.log('════════════════════════════════════');

  // Count all data
  const counts = {};

  // EC data
  const ecDetail = await post('/bp/cost/ec/detail/findEcDetail.do', { ecPjtCd: 'EC20260006' });
  counts['EC Detail'] = Object.keys(ecDetail).length > 0 ? 'YES' : 'NO';
  const ecBom = await post('/bp/cost/ec/bom/findListEcBom.do', { ecPjtCd: 'EC20260006' });
  counts['EC BOM'] = ecBom.length;

  // TC data
  counts['TC Manager'] = (await post('/bp/cost/tc/detail/findListManager.do', { tgtPjtCd: 'TC20260006' })).length;
  counts['TC Spec'] = (await post('/bp/cost/tc/detail/findListSpec.do', { tgtPjtCd: 'TC20260006' })).length;
  counts['TC Price'] = (await post('/bp/cost/tc/detail/findListPrice.do', { tgtPjtCd: 'TC20260006' })).length;
  counts['TC QtyDisc'] = (await post('/bp/cost/tc/detail/findListQtyDisc.do', { tgtPjtCd: 'TC20260006' })).length;
  counts['TC DevSched'] = (await post('/bp/cost/tc/detail/findListDevSchedule.do', { tgtPjtCd: 'TC20260006' })).length;
  counts['TC SetupSched'] = (await post('/bp/cost/tc/detail/findListSetupSchedule.do', { tgtPjtCd: 'TC20260006' })).length;
  counts['TC Guide'] = (await post('/bp/cost/tc/guide/findListTargetCostGuide.do', { tgtPjtCd: 'TC20260006' })).length;
  counts['TC CostReg'] = (await post('/bp/cost/tc/detail/findListCostReg.do', { tgtPjtCd: 'TC20260006' })).length;
  counts['TC AchvPlan'] = (await post('/bp/cost/tc/detail/findListAchvPlan.do', { tgtPjtCd: 'TC20260006' })).length;

  // CC data
  const ccD = await post('/bp/cost/cc/detail/findCcDetail.do', { ccPjtCd: 'CC20260006', ccRev: 1 });
  counts['CC Detail'] = Object.keys(ccD).length > 0 ? 'YES' : 'NO';
  counts['CC CostCode'] = (await post('/bp/cost/cc/detail/findListCostCode.do', { ccPjtCd: 'CC20260006', ccRev: 1 })).length;
  counts['CC QtyDisc'] = (await post('/bp/cost/cc/detail/findListQtyDisc.do', { ccPjtCd: 'CC20260006', ccRev: 1 })).length;
  counts['CC Manager'] = (await post('/bp/cost/cc/detail/findListManager.do', { ccPjtCd: 'CC20260006', ccRev: 1 })).length;
  counts['CC Schedule'] = (await post('/bp/cost/cc/detail/findListSchedule.do', { ccPjtCd: 'CC20260006', ccRev: 1 })).length;
  counts['CC BOM'] = (await post('/bp/cost/cc/detail/findListBom.do', { ccPjtCd: 'CC20260006', ccRev: 1 })).length;
  counts['CC PartPrice'] = (await post('/bp/cost/cc/detail/findListPartPrice.do', { ccPjtCd: 'CC20260006', ccRev: 1 })).length;

  const aeResult = await post('/bp/cost/cc/detail/findListActEval.do', { ccPjtCd: 'CC20260006', ccRev: 1 });
  counts['CC ActEval'] = Array.isArray(aeResult) ? aeResult.length : 'ERR';

  Object.entries(counts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

run().catch(e => console.error(e));
