/**
 * Test: validateCalcPrereq API for EC and CC
 * - EC: /bp/cost/ec/detail/validateCalcPrereq.do
 * - CC: /bp/cost/cc/detail/validateCalcPrereq.do
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
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(buf) }); }
        catch(e) { resolve({ status: res.statusCode, data: buf }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function printValidation(label, result) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${label}`);
  console.log(`${'─'.repeat(60)}`);

  if (result.status !== 200) {
    console.log(`  HTTP ${result.status} - endpoint may not be deployed yet`);
    return;
  }

  const d = result.data;
  console.log(`  Summary: ${d.summary}`);
  console.log(`  Errors: ${d.errorCount}, Warnings: ${d.warningCount}, Info: ${d.infoCount}`);
  console.log(`  canCalcMfg: ${d.canCalcMfg}, canCalcSga: ${d.canCalcSga}, canCalcPl: ${d.canCalcPl}`);
  if (d.canCalcNpv !== undefined) console.log(`  canCalcNpv: ${d.canCalcNpv}`);

  const icons = { ERROR: '🔴', WARNING: '🟡', INFO: '🔵' };
  if (d.messages && d.messages.length > 0) {
    console.log('');
    for (const m of d.messages) {
      console.log(`  ${icons[m.level] || '  '} [${m.calcStep}] ${m.category}: ${m.message}`);
    }
  }
}

async function run() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('  VALIDATION API TEST');
  console.log('════════════════════════════════════════════════════════════');

  // Test EC validation - main project (should have most data)
  const ec1 = await post('/bp/cost/ec/detail/validateCalcPrereq.do', { ecPjtCd: 'EC20260006' });
  printValidation('EC20260006 (Main Project) Validation', ec1);

  // Test EC validation - test projects
  const ec2 = await post('/bp/cost/ec/detail/validateCalcPrereq.do', { ecPjtCd: 'EC_TC_S01' });
  printValidation('EC_TC_S01 (Test - Success) Validation', ec2);

  const ec3 = await post('/bp/cost/ec/detail/validateCalcPrereq.do', { ecPjtCd: 'EC_TC_R01' });
  printValidation('EC_TC_R01 (Test - Risk) Validation', ec3);

  const ec4 = await post('/bp/cost/ec/detail/validateCalcPrereq.do', { ecPjtCd: 'EC_TC_M01' });
  printValidation('EC_TC_M01 (Test - Mixed) Validation', ec4);

  // Test CC validation
  const cc1 = await post('/bp/cost/cc/detail/validateCalcPrereq.do', { ccPjtCd: 'CC20260006', ccRev: 1 });
  printValidation('CC20260006 (Main Project) CC Validation', cc1);

  const cc2 = await post('/bp/cost/cc/detail/validateCalcPrereq.do', { ccPjtCd: 'CC_S01', ccRev: 1 });
  printValidation('CC_S01 (Test - Success) CC Validation', cc2);

  // Test with non-existent project (should return all ERRORs)
  const ec_bad = await post('/bp/cost/ec/detail/validateCalcPrereq.do', { ecPjtCd: 'NONEXIST' });
  printValidation('NONEXIST (No Data) Validation', ec_bad);

  // Summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  TEST COMPLETE');
  console.log(`${'═'.repeat(60)}`);

  const allResults = [ec1, ec2, ec3, ec4, cc1, cc2, ec_bad];
  const deployed = allResults.filter(r => r.status === 200).length;
  console.log(`  ${deployed}/${allResults.length} endpoints returned HTTP 200`);
  if (deployed === 0) {
    console.log('  => Server needs to be restarted with new code');
  }
}

run().catch(e => console.error('FATAL:', e));
