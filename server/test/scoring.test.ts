import { calculateOpportunityScore } from '../src/services/scoring.js';
import { canonicalizeUrl, detectSourceType, cleanSnippet } from '../src/services/normalizer.js';
import { exportOpportunitiesToCsv } from '../src/services/exportService.js';
import { OpportunityRecord } from '../src/types/index.js';

function runTests() {
  console.log('🧪 Starting Idea Miner Unit Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Scoring calculations & weights
  console.log('--- Test Suite 1: Transparent Opportunity Scoring ---');
  const highScoring = calculateOpportunityScore({
    severity: 9,
    supportingSourcesCount: 4,
    recurrence: 'High',
    marketGapScore: 85,
    willingnessToPayScore: 90,
    technicalComplexity: 'Low',
    mvpFeatureCount: 3
  });

  assert(highScoring.scorePainSeverity === 90, 'Pain severity normalized from 9 to 90');
  assert(highScoring.scoreEvidenceStrength >= 85, 'Evidence strength high with 4 distinct sources and High recurrence');
  assert(highScoring.evidenceConfidence === 'High', 'Evidence confidence is High for multiple sources & High recurrence');
  assert(highScoring.scoreFeasibility === 90, 'Feasibility is 90 for Low technical complexity');
  
  // Mathematical check of weights: 0.25*90 + 0.25*90 + 0.20*85 + 0.15*90 + 0.15*90 = 22.5 + 22.5 + 17 + 13.5 + 13.5 = 89
  assert(highScoring.totalScore >= 85 && highScoring.totalScore <= 95, `Total score weighted accurately (${highScoring.totalScore})`);
  assert(highScoring.scoringExplanation.includes('Total Score:'), 'Scoring explanation contains breakdown');

  // TEST 2: Missing evidence penalty
  console.log('\n--- Test Suite 2: Evidence Penalty & Confidence ---');
  const zeroEvidence = calculateOpportunityScore({
    severity: 10,
    supportingSourcesCount: 0,
    recurrence: 'Low',
    marketGapScore: 90,
    willingnessToPayScore: 90,
    technicalComplexity: 'Low'
  });

  assert(zeroEvidence.scoreEvidenceStrength <= 15, 'Evidence score heavily penalized (<= 15) when source count is 0');
  assert(zeroEvidence.evidenceConfidence === 'Low', 'Evidence confidence is Low when sources are absent');
  assert(zeroEvidence.totalScore < highScoring.totalScore, 'Score is lowered despite high severity due to missing evidence');

  // TEST 3: Normalizer and URL canonicalization
  console.log('\n--- Test Suite 3: Normalization & Deduplication ---');
  const dirtyUrl = 'https://www.reddit.com/r/webdev/comments/123/title/?utm_source=twitter&utm_medium=social&ref=feed#anchor';
  const clean = canonicalizeUrl(dirtyUrl);
  assert(clean === 'https://www.reddit.com/r/webdev/comments/123/title', `Tracking params and anchors removed: ${clean}`);

  assert(detectSourceType('https://reddit.com/r/saas') === 'reddit', 'Detects reddit source');
  assert(detectSourceType('https://g2.com/products/linear/reviews') === 'review', 'Detects review source');
  assert(detectSourceType('https://news.ycombinator.com/item?id=123') === 'qna', 'Detects Hacker News as Q&A');
  assert(detectSourceType('https://discourse.example.com/t/topic') === 'forum', 'Detects forum source');
  assert(detectSourceType('https://techcrunch.com/article') === 'web', 'Detects general web source');

  const dirtyHtmlSnippet = 'Found <b>significant</b> issues with &quot;vendor APIs&quot; &amp; billing.';
  const cleanedText = cleanSnippet(dirtyHtmlSnippet);
  assert(cleanedText === 'Found significant issues with "vendor APIs" & billing.', `HTML tags cleaned and entities decoded: ${cleanedText}`);

  // TEST 4: CSV Export formatting
  console.log('\n--- Test Suite 4: CSV Export Formatting ---');
  const dummyOpp: OpportunityRecord = {
    id: 'opp-1',
    researchId: 'res-1',
    name: 'Test "Startup"',
    description: 'A test product, with commas and "quotes"',
    problemSolved: 'Solves testing',
    targetCustomer: 'Engineers',
    proposedSolution: 'Automated runner',
    coreDifferentiator: 'Blazing fast',
    opportunityType: 'new_product',
    existingCompetitors: [{
      name: 'OldTool',
      audience: 'Legacy teams',
      coreFeatures: ['Feature A'],
      recurringComplaints: ['Too slow'],
      differentiationGap: 'Speed',
      isVerified: true
    }],
    weaknessesInAlternatives: ['Slow'],
    mvpFeatures: ['CLI runner', 'Dashboard'],
    pricingModel: '$20/mo',
    distributionChannels: ['GitHub'],
    technicalComplexity: 'Low',
    validationExperiment: 'Landing page',
    risksAndAssumptions: ['Adoption risk'],
    supportingSources: [{ title: 'Reddit post', url: 'https://reddit.com/test', domain: 'reddit.com' }],
    status: 'Discovered',
    isSaved: false,
    isArchived: false,
    isDemo: false,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    scorePainSeverity: 80,
    scoreEvidenceStrength: 80,
    scoreMarketGap: 80,
    scoreWillingnessToPay: 80,
    scoreFeasibility: 80,
    totalScore: 80,
    scoringExplanation: 'Solid score'
  };

  const csv = exportOpportunitiesToCsv([dummyOpp]);
  assert(csv.includes('"Test ""Startup"""'), 'Double-quotes escaped properly in CSV');
  assert(csv.includes('"A test product, with commas and ""quotes"""'), 'Commas preserved within quotes in CSV');
  assert(csv.includes('Total Score'), 'CSV headers present');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
