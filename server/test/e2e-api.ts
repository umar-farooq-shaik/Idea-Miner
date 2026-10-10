const BASE = 'http://localhost:5000';

async function runApiE2ETests() {
  console.log('🚀 Running Live End-to-End API Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, name: string) {
    if (cond) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE}/api/health`);
    const health = await healthRes.json() as any;
    assert(healthRes.status === 200 && health.status === 'healthy', 'GET /api/health returns 200 and healthy');

    // 2. Config check
    const configRes = await fetch(`${BASE}/api/config`);
    const cfg = await configRes.json() as any;
    assert(configRes.status === 200 && cfg.databaseType === 'sqlite' && cfg.isDemoModeDefault === true, 'GET /api/config reports SQLite persistence and demo mode default');

    // 3. Stats check
    const statsRes = await fetch(`${BASE}/api/stats`);
    const stats = await statsRes.json() as any;
    assert(statsRes.status === 200 && stats.totalProblems >= 3 && stats.potentialOpportunities >= 3, 'GET /api/stats returns seeded problems and opportunities');

    // 4. Opportunities list
    const oppsRes = await fetch(`${BASE}/api/opportunities`);
    const opps = await oppsRes.json() as any[];
    assert(oppsRes.status === 200 && opps.length >= 3, `GET /api/opportunities returns ${opps.length} seeded opportunities`);

    const firstOppId = opps[0].id;

    // 5. Missing API keys rejection (Never silently fake live research)
    const liveMissingRes = await fetch(`${BASE}/api/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'AI Coding Tools Friction' })
    });
    const liveMissing = await liveMissingRes.json() as any;
    assert(
      liveMissingRes.status === 400 && 
      liveMissing.missingCredentials && 
      liveMissing.missingCredentials.length === 2,
      'POST /api/research without keys correctly rejects with 400 and clear credential instructions'
    );

    // 6. Demo research creation
    const demoRes = await fetch(`${BASE}/api/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Developer API and Webhook Reliability',
        targetCustomer: 'Backend Developers',
        depth: 'quick',
        isDemo: true
      })
    });
    const demoData = await demoRes.json() as any;
    assert(
      demoRes.status === 201 && 
      demoData.problems && 
      demoData.problems.length >= 1 && 
      demoData.opportunities && 
      demoData.opportunities.length >= 1,
      'POST /api/research with isDemo=true synthesizes problems and opportunities'
    );

    // 7. Opportunity status update
    const patchRes = await fetch(`${BASE}/api/opportunities/${firstOppId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Building' })
    });
    const patched = await patchRes.json() as any;
    assert(patchRes.status === 200 && patched.status === 'Building', 'PATCH /api/opportunities/:id/status updates status to Building');

    // 8. Opportunity bookmark toggle
    const saveRes = await fetch(`${BASE}/api/opportunities/${firstOppId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: true })
    });
    const saved = await saveRes.json() as any;
    assert(saveRes.status === 200 && saved.isSaved === true, 'POST /api/opportunities/:id/save toggles bookmark to true');

    // 9. CSV export
    const exportRes = await fetch(`${BASE}/api/export/opportunities`);
    const csv = await exportRes.text();
    assert(
      exportRes.status === 200 && 
      csv.includes('Total Score') && 
      csv.includes('Opportunity Type') &&
      csv.includes('Supporting Sources'),
      'GET /api/export/opportunities returns formatted CSV with headers'
    );

    // 10. Frontend static serving
    const htmlRes = await fetch(`${BASE}/`);
    const html = await htmlRes.text();
    assert(htmlRes.status === 200 && html.includes('Idea Miner'), 'GET / correctly serves production React frontend HTML');

    console.log(`\n========================================`);
    console.log(`E2E API Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (e) {
    console.error('Test execution error:', e);
    process.exit(1);
  }
}

runApiE2ETests();
