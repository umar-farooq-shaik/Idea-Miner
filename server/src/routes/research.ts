import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { 
  getAllResearches, 
  getResearchById, 
  createResearch, 
  updateResearchStatus, 
  deleteResearch,
  insertSearchResults,
  getSearchResultsByResearchId,
  insertProblems,
  getProblemsByResearchId,
  insertOpportunities,
  getAllOpportunities
} from '../db/database.js';
import { executeSerpApiSearch } from '../services/serpApi.js';
import { analyzeEvidenceWithGemini } from '../services/gemini.js';
import { calculateOpportunityScore } from '../services/scoring.js';
import { 
  ResearchRecord, 
  SearchResultRecord, 
  ProblemRecord, 
  OpportunityRecord, 
  RecurrenceIndicator, 
  ConfidenceLevel, 
  TechnicalComplexity 
} from '../types/index.js';

const router = Router();

const CreateResearchSchema = z.object({
  topic: z.string().min(2, 'Topic must be at least 2 characters long'),
  targetCustomer: z.string().optional(),
  geographicMarket: z.string().optional(),
  includeKeywords: z.string().optional(),
  excludeKeywords: z.string().optional(),
  depth: z.enum(['quick', 'deep']).default('quick'),
  isDemo: z.boolean().optional()
});

// GET /api/research - List all research scans
router.get('/', async (_req: Request, res: Response) => {
  try {
    const list = await getAllResearches();
    res.json(list);
  } catch (err: unknown) {
    console.error('Error fetching research history:', err);
    res.status(500).json({ error: 'Failed to retrieve research history.' });
  }
});

// GET /api/research/:id - Get research details with full problems, opportunities, and sources
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const research = await getResearchById(req.params.id);
    if (!research) {
      return res.status(404).json({ error: 'Research session not found.' });
    }

    const [searchResults, problems, opportunities] = await Promise.all([
      getSearchResultsByResearchId(research.id),
      getProblemsByResearchId(research.id),
      getAllOpportunities({ researchId: research.id, isArchived: false })
    ]);

    res.json({
      ...research,
      searchResults,
      problems,
      opportunities
    });
  } catch (err: unknown) {
    console.error('Error fetching research details:', err);
    res.status(500).json({ error: 'Failed to retrieve research details.' });
  }
});

// DELETE /api/research/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deleteResearch(req.params.id);
    res.json({ success: true, message: 'Research and associated records deleted.' });
  } catch (err: unknown) {
    console.error('Error deleting research:', err);
    res.status(500).json({ error: 'Failed to delete research session.' });
  }
});

// POST /api/research - Start new research (Live or Demo Mode)
router.post('/', async (req: Request, res: Response) => {
  const parseResult = CreateResearchSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      error: 'Invalid input parameters.', 
      details: parseResult.error.format() 
    });
  }

  const { topic, targetCustomer, geographicMarket, includeKeywords, excludeKeywords, depth, isDemo } = parseResult.data;

  // Extract effective credentials
  const headerGemini = req.headers['x-gemini-key'] as string | undefined;
  const headerSerp = req.headers['x-serpapi-key'] as string | undefined;
  const headerModel = req.headers['x-gemini-model'] as string | undefined;

  const serpApiKey = config.getEffectiveSerpApiKey(headerSerp);
  const geminiApiKey = config.getEffectiveGeminiKey(headerGemini);
  const geminiModel = config.getEffectiveGeminiModel(headerModel);

  // Check if live credentials exist
  const hasLiveCredentials = Boolean(serpApiKey && geminiApiKey);

  // If live research was requested but credentials are missing, reject with explicit instruction
  if (!isDemo && !hasLiveCredentials) {
    const missing: string[] = [];
    if (!serpApiKey) missing.push('SERPAPI_API_KEY (for real search results)');
    if (!geminiApiKey) missing.push('GEMINI_API_KEY (for structured AI analysis)');

    return res.status(400).json({
      error: 'Missing required API credentials for live research.',
      missingCredentials: missing,
      instruction: 'To run live web research, please provide your API keys in the Settings modal or .env file. Alternatively, enable "Demo Mode" to run an illustrative scan without API keys.'
    });
  }

  const researchId = uuidv4();
  const now = new Date().toISOString();

  // Create initial research record
  const researchRecord: ResearchRecord = {
    id: researchId,
    query: `Topic: ${topic}${targetCustomer ? ` | Audience: ${targetCustomer}` : ''}`,
    topic,
    targetCustomer,
    geographicMarket,
    includeKeywords,
    excludeKeywords,
    depth,
    status: 'searching',
    isDemo: Boolean(isDemo || !hasLiveCredentials),
    createdAt: now,
    updatedAt: now
  };

  await createResearch(researchRecord);

  // ----------------------------------------------------
  // BRANCH A: DEMO MODE (Deterministic Illustrative Scan)
  // ----------------------------------------------------
  if (researchRecord.isDemo) {
    try {
      const generated = generateDeterministicDemoResearch(researchId, {
        topic,
        targetCustomer,
        geographicMarket,
        includeKeywords,
        depth
      });

      await insertSearchResults(generated.searchResults);
      await insertProblems(generated.problems);
      await insertOpportunities(generated.opportunities);
      await updateResearchStatus(researchId, 'completed');

      const finished = await getResearchById(researchId);
      return res.status(201).json({
        ...finished,
        searchResults: generated.searchResults,
        problems: generated.problems,
        opportunities: generated.opportunities
      });
    } catch (demoErr: unknown) {
      console.error('Demo research generation failed:', demoErr);
      await updateResearchStatus(researchId, 'failed', 'Demo dataset synthesis failed.');
      return res.status(500).json({ error: 'Demo generation failed.' });
    }
  }

  // ----------------------------------------------------
  // BRANCH B: LIVE RESEARCH PIPELINE
  // ----------------------------------------------------
  try {
    // 1. Live SerpApi search
    const searchOutcome = await executeSerpApiSearch({
      topic,
      targetCustomer,
      geographicMarket,
      includeKeywords,
      excludeKeywords,
      depth,
      apiKey: serpApiKey,
      researchId
    });

    if (searchOutcome.results.length === 0) {
      await updateResearchStatus(researchId, 'completed', 'Zero search results discovered for this query.');
      const finished = await getResearchById(researchId);
      return res.status(200).json({
        ...finished,
        searchResults: [],
        problems: [],
        opportunities: [],
        warning: 'No relevant search results were found. Try removing keyword restrictions or broadening the topic.'
      });
    }

    // Persist search results
    await insertSearchResults(searchOutcome.results);

    // Update status to analyzing
    await updateResearchStatus(researchId, 'analyzing');

    // 2. Gemini Analysis & Opportunity Synthesis
    const analysis = await analyzeEvidenceWithGemini(
      searchOutcome.results,
      {
        topic,
        targetCustomer,
        geographicMarket,
        researchId
      },
      {
        apiKey: geminiApiKey,
        model: geminiModel
      }
    );

    // Persist problems and opportunities
    await insertProblems(analysis.problems);
    await insertOpportunities(analysis.opportunities);

    // Update status to completed
    await updateResearchStatus(researchId, 'completed');

    const finished = await getResearchById(researchId);
    return res.status(201).json({
      ...finished,
      searchResults: searchOutcome.results,
      problems: analysis.problems,
      opportunities: analysis.opportunities,
      executiveSummary: analysis.executiveSummary
    });
  } catch (liveErr: unknown) {
    const errorMsg = liveErr instanceof Error ? liveErr.message : String(liveErr);
    console.error('Live research execution failed:', errorMsg);
    await updateResearchStatus(researchId, 'failed', errorMsg);
    return res.status(500).json({
      error: `Live research failed: ${errorMsg}`,
      researchId
    });
  }
});

// Helper for deterministic demo generation when exploring in Demo Mode
function generateDeterministicDemoResearch(
  researchId: string,
  params: {
    topic: string;
    targetCustomer?: string;
    geographicMarket?: string;
    includeKeywords?: string;
    depth: 'quick' | 'deep';
  }
) {
  const { topic, targetCustomer, depth } = params;
  const now = new Date().toISOString();

  // Create 4 realistic search results matching the topic
  const searchResults: SearchResultRecord[] = [
    {
      id: uuidv4(),
      researchId,
      title: `Common complaints and frustrations with ${topic} - Reddit Discussion`,
      url: `https://www.reddit.com/r/technology/comments/sample_discussion_${encodeURIComponent(topic.slice(0, 15))}`,
      domain: 'reddit.com',
      snippet: `Users in the community express continuous frustration: "The biggest issue with ${topic} is that current tools assume a one-size-fits-all workflow. We spend hours manually stitching spreadsheets together to make up for missing features."`,
      publishedDate: '2026-03-10',
      sourceQuery: `site:reddit.com "${topic}" complaints`,
      sourceType: 'reddit',
      createdAt: now
    },
    {
      id: uuidv4(),
      researchId,
      title: `Why incumbent tools in ${topic} fail modern teams - Hacker News`,
      url: `https://news.ycombinator.com/item?id=sample_hn_${encodeURIComponent(topic.slice(0, 10))}`,
      domain: 'news.ycombinator.com',
      snippet: `Top comment: "We evaluated 4 commercial solutions in this space. Every single one had bloated enterprise pricing, poor API access, and required 3 weeks of onboarding just to get basic reports."`,
      publishedDate: '2026-02-24',
      sourceQuery: `"${topic}" alternatives drawback`,
      sourceType: 'qna',
      createdAt: now
    },
    {
      id: uuidv4(),
      researchId,
      title: `Customer review drawbacks: Top 3 things missing in ${topic} - G2 Reviews`,
      url: `https://www.g2.com/products/sample-suite/reviews#cons-${encodeURIComponent(topic.slice(0, 10))}`,
      domain: 'g2.com',
      snippet: `Verified user review: "Cons: Lack of automated workflows and alert triggers. When an issue occurs, there is no proactive notification, leading to delayed response times and angry customers."`,
      publishedDate: '2026-01-18',
      sourceQuery: `site:g2.com "${topic}" review cons`,
      sourceType: 'review',
      createdAt: now
    }
  ];

  if (depth === 'deep') {
    searchResults.push({
      id: uuidv4(),
      researchId,
      title: `Workaround patterns observed among ${targetCustomer || 'users'} - Community Forum`,
      url: `https://community.saasfounders.org/t/workarounds-for-${encodeURIComponent(topic.slice(0, 12))}`,
      domain: 'community.saasfounders.org',
      snippet: `Discussion thread: "Most teams end up writing custom Zapier / Make webhooks or running nightly Python scripts because standard tools fail to synchronize operational records reliably."`,
      publishedDate: '2026-02-08',
      sourceQuery: `"${topic}" workaround manual process`,
      sourceType: 'forum',
      createdAt: now
    });
  }

  // Create structured Problem Record
  const problem1: ProblemRecord = {
    id: uuidv4(),
    researchId,
    statement: `Lack of workflow automation and fragmented context in ${topic} forces teams into error-prone manual spreadsheets and brittle custom scripts.`,
    targetAudience: targetCustomer || `Teams and professionals operating within ${topic}`,
    userPain: `High operational overhead, repeated human errors during handoffs, and delayed reaction time to urgent customer issues.`,
    supportingSourcesCount: searchResults.length,
    recurrenceIndicator: 'High' as RecurrenceIndicator,
    existingSolutions: ['Legacy Enterprise Suites', 'Generic Spreadsheet Trackers', 'Custom Webhooks'],
    shortcomings: ['Enterprise tools are bloated and prohibitively expensive', 'Spreadsheets lack audit trails and real-time triggers'],
    currentWorkarounds: ['Teams cobble together multi-step Zapier recipes and manual copy-paste checklists'],
    severity: 8,
    willingnessToPay: `Hypothesis: Buyers currently spending $500+/mo on fragmented tools would readily pay $49-$149/mo for an integrated workflow.`,
    confidenceLevel: 'High' as ConfidenceLevel,
    confidenceExplanation: 'Grounded in multiple recurring complaints across Reddit, Hacker News, and verified G2 product reviews.',
    evidenceGaps: ['Specific compliance requirements in regulated industries remain unverified.'],
    validationQuestions: [
      `How many hours each week does your team spend on manual data entry related to ${topic}?`,
      `What is the single most frustrating bottleneck in your current tooling?`,
      `If an automated tool resolved this bottleneck in under 5 minutes, what would be an acceptable monthly price?`
    ],
    evidenceLinks: searchResults.map(s => ({
      title: s.title,
      url: s.url,
      domain: s.domain,
      snippet: s.snippet
    })),
    isSaved: false,
    createdAt: now
  };

  // Opportunity 1: Core Startup Concept
  const score1 = calculateOpportunityScore({
    severity: 8,
    supportingSourcesCount: searchResults.length,
    recurrence: 'High',
    marketGapScore: 84,
    willingnessToPayScore: 80,
    technicalComplexity: 'Medium' as TechnicalComplexity,
    mvpFeatureCount: 4
  });

  const oppName = `${topic.split(' ')[0] || 'Flow'}Miner`;
  const opp1: OpportunityRecord = {
    id: uuidv4(),
    researchId,
    problemId: problem1.id,
    name: oppName,
    description: `Targeted workflow copilot that replaces manual spreadsheet tracking in ${topic} with automated sync and proactive alerts.`,
    problemSolved: problem1.statement,
    targetCustomer: problem1.targetAudience,
    proposedSolution: `A streamlined, focused web application that connects directly to existing data sources, eliminates manual handoffs, and provides real-time health alerts and automated reports.`,
    coreDifferentiator: `Purpose-built for ${targetCustomer || 'modern practitioners'} with zero complex onboarding, instant ROI, and transparent flat-rate pricing.`,
    opportunityType: 'better_alternative',
    existingCompetitors: [
      {
        name: 'Legacy Market Leader',
        url: 'https://example-competitor.com',
        audience: 'Enterprise corporations',
        coreFeatures: ['Complex multi-department modules', 'Custom reporting'],
        recurringComplaints: ['Cumbersome UI, mandatory annual sales contracts, slow support'],
        differentiationGap: 'Self-serve setup in 10 minutes; no enterprise sales friction.',
        isVerified: true
      }
    ],
    weaknessesInAlternatives: [
      'Prohibitively expensive seat-based pricing that discourages whole-team adoption',
      'Over-engineered interfaces requiring certified training'
    ],
    mvpFeatures: [
      'Direct one-click data import and bi-directional sync',
      'Automated error detection and Slack/email notification dispatch',
      'Clean executive dashboard with real-time status indicators',
      'CSV/JSON export for reporting and board updates'
    ],
    pricingModel: '$49/month for small teams (up to 5 users); $129/month for scaling teams with unlimited integrations.',
    distributionChannels: [
      `Content marketing targeting high-intent "${topic} alternatives" search queries`,
      `Direct founder outreach in niche communities and subreddits`,
      `Free interactive ROI calculator tool on product landing page`
    ],
    technicalComplexity: 'Medium' as TechnicalComplexity,
    validationExperiment: `Create a high-converting landing page showcasing the automated workflow; run $100 in targeted LinkedIn/Reddit ads and aim for a 10% email waitlist conversion.`,
    risksAndAssumptions: [
      'Incumbents could release a simplified tier',
      'Requires clean data formatting from customer input sources'
    ],
    supportingSources: problem1.evidenceLinks,
    status: 'Discovered',
    isSaved: false,
    isArchived: false,
    isDemo: true,
    createdAt: now,
    updatedAt: now,
    scorePainSeverity: score1.scorePainSeverity,
    scoreEvidenceStrength: score1.scoreEvidenceStrength,
    scoreMarketGap: score1.scoreMarketGap,
    scoreWillingnessToPay: score1.scoreWillingnessToPay,
    scoreFeasibility: score1.scoreFeasibility,
    totalScore: score1.totalScore,
    scoringExplanation: score1.scoringExplanation
  };

  return {
    searchResults,
    problems: [problem1],
    opportunities: [opp1]
  };
}

export default router;
