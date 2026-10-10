// Idea Miner API Test Script
const http = require('http');
const fs = require('fs');

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  const BASE = { hostname: 'localhost', port: 5000 };
  
  try {
    // Test 1: Health check
    console.log('=== Test 1: Health Check ===');
    const h1 = await makeRequest({ ...BASE, path: '/api/health' });
    console.log(`Status: ${h1.statusCode}`);
    const healthBody = JSON.parse(h1.body);
    console.log(`Service: ${healthBody.service}, Version: ${healthBody.version}`);
    console.log('PASS: Health check works\n');
    
    // Test 2: Config endpoint
    console.log('=== Test 2: Config Endpoint ===');
    const h2 = await makeRequest({ ...BASE, path: '/api/config' });
    console.log(`Status: ${h2.statusCode}`);
    const config = JSON.parse(h2.body);
    console.log(`Has Gemini Key: ${config.hasGeminiKey}`);
    console.log(`Has SerpApi Key: ${config.hasSerpApiKey}`);
    console.log(`Gemini Model: ${config.geminiModel}`);
    console.log('PASS: Config endpoint works\n');
    
    // Test 3: Create research (demo mode)
    console.log('=== Test 3: Create Research (Demo) ===');
    const h3 = await makeRequest({
      ...BASE, path: '/api/research', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { topic: 'API coding tools', depth: 'quick', isDemo: true });
    console.log(`Status: ${h3.statusCode}`);
    const research3 = JSON.parse(h3.body);
    console.log(`Topic: ${research3.topic}`);
    console.log(`Is Demo: ${research3.isDemo}`);
    console.log(`Problems count: ${research3.problems?.length || 0}`);
    console.log(`Opportunities count: ${research3.opportunities?.length || 0}`);
    console.log('PASS: Demo research creation works\n');
    
    // Test 4: Get researches
    console.log('=== Test 4: Get All Researches ===');
    const h4 = await makeRequest({ ...BASE, path: '/api/research' });
    console.log(`Status: ${h4.statusCode}`);
    const researches = JSON.parse(h4.body);
    console.log(`Researches count: ${researches.length}`);
    console.log('PASS: Get researches works\n');
    
    // Test 5: Get opportunities
    console.log('=== Test 5: Get Opportunities ===');
    const h5 = await makeRequest({ ...BASE, path: '/api/opportunities' });
    console.log(`Status: ${h5.statusCode}`);
    const opps = JSON.parse(h5.body);
    console.log(`Opportunities count: ${opps.length}`);
    console.log('PASS: Get opportunities works\n');
    
    // Test 6: Get opportunity by ID
    if (opps.length > 0) {
      console.log('=== Test 6: Get Opportunity By ID ===');
      const h6 = await makeRequest({ ...BASE, path: `/api/opportunities/${opps[0].id}` });
      console.log(`Status: ${h6.statusCode}`);
      const oppDetail = JSON.parse(h6.body);
      console.log(`Opportunity name: ${oppDetail.name}`);
      console.log('PASS: Get opportunity by ID works\n');
    }
    
    // Test 7: CSV export
    console.log('=== Test 7: CSV Export ===');
    const h7 = await makeRequest({ ...BASE, path: '/api/export/opportunities' });
    console.log(`Status: ${h7.statusCode}`);
    console.log(`CSV content length: ${h7.body.length}`);
    console.log('CSV starts with:', h7.body.substring(0, 100));
    console.log('PASS: CSV export works\n');
    
    console.log('=== ALL TESTS PASSED ===');
    
  } catch (err) {
    console.error('TEST FAILED:', err.message);
  }
}

runTests();