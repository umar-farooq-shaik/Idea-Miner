import { 
  ResearchRecord, 
  SearchResultRecord, 
  ProblemRecord, 
  OpportunityRecord 
} from '../types/index.js';
import { calculateOpportunityScore } from '../services/scoring.js';

export interface SeedDataCollection {
  researches: ResearchRecord[];
  searchResults: SearchResultRecord[];
  problems: ProblemRecord[];
  opportunities: OpportunityRecord[];
}

export function getSeedData(): SeedDataCollection {
  const now = new Date();
  const d1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const d2 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const d3 = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Research 1: Developers & Third-Party APIs
  const r1: ResearchRecord = {
    id: 'demo-res-1',
    query: 'site:reddit.com "APIs" ("frustrated" OR "complaint" OR "wish there was")',
    topic: 'Problems developers repeatedly encounter with APIs',
    targetCustomer: 'Backend Developers & Technical Founders',
    geographicMarket: 'Global',
    includeKeywords: 'webhooks, breaking changes, rate limits',
    excludeKeywords: 'beginners, tutorial',
    depth: 'deep',
    status: 'completed',
    isDemo: true,
    createdAt: d1,
    updatedAt: d1,
    totalResultsCount: 14,
    totalProblemsCount: 2,
    totalOpportunitiesCount: 2
  };

  const sr1: SearchResultRecord[] = [
    {
      id: 'demo-sr-1',
      researchId: 'demo-res-1',
      title: 'Why are webhook retries still such a nightmare to debug in 2026? - Reddit /r/webdev',
      url: 'https://www.reddit.com/r/webdev/comments/why_are_webhook_retries_nightmare',
      domain: 'reddit.com',
      snippet: 'We spent 4 hours yesterday chasing down why Shopify webhooks silently dropped events during a traffic spike. No dead-letter queue inspection, no alert until customer support complained.',
      publishedDate: '2026-03-12',
      sourceQuery: 'site:reddit.com "APIs" ("frustrated" OR "complaint")',
      sourceType: 'reddit',
      createdAt: d1
    },
    {
      id: 'demo-sr-2',
      researchId: 'demo-res-1',
      title: 'Ask HN: How do you handle third-party API breaking changes without full test regressions?',
      url: 'https://news.ycombinator.com/item?id=38491023',
      domain: 'news.ycombinator.com',
      snippet: 'Vendor changed an enum value in production without incrementing API version. Broke our background workers silently. Swagger/OpenAPI docs were completely desynchronized from actual payload.',
      publishedDate: '2026-02-18',
      sourceQuery: 'site:news.ycombinator.com "third party API breaking changes"',
      sourceType: 'qna',
      createdAt: d1
    },
    {
      id: 'demo-sr-3',
      researchId: 'demo-res-1',
      title: 'Common complaints with modern SaaS webhook architecture - Dev.to',
      url: 'https://dev.to/engineering/common-complaints-with-saas-webhooks-48j1',
      domain: 'dev.to',
      snippet: 'Idempotency key enforcement is left up to every single junior engineer. When an upstream API double-fires, downstream databases end up with corrupted billing records.',
      publishedDate: '2026-01-29',
      sourceQuery: 'saas webhook architecture complaints',
      sourceType: 'forum',
      createdAt: d1
    }
  ];

  const p1_1: ProblemRecord = {
    id: 'demo-prob-1',
    researchId: 'demo-res-1',
    statement: 'Silent webhook failures and unmonitored event drops cause silent data loss and cascading background worker crashes.',
    targetAudience: 'Backend engineers, DevOps, and SaaS founders integrating multi-vendor APIs',
    userPain: 'Hours lost debugging production outages; phantom billing bugs; customer trust damage due to missing webhook deliveries.',
    supportingSourcesCount: 3,
    recurrenceIndicator: 'High',
    existingSolutions: ['Svix', 'AWS SQS dead-letter queues', 'Custom Redis replay scripts', 'Sentry error alerts'],
    shortcomings: ['Manual setup takes days', 'Hard to safely replay historical webhooks with mutated state', 'Lack of idempotency safeguards'],
    currentWorkarounds: ['Engineers write brittle custom cron jobs that query vendor REST APIs to reconcile missing events'],
    severity: 9,
    willingnessToPay: 'Hypothesis: Engineering teams gladly pay $49-$199/month to eliminate silent revenue-impacting webhook drops.',
    confidenceLevel: 'High',
    confidenceExplanation: 'Confirmed by multiple independent discussions across Reddit, Hacker News, and Dev.to with consistent root causes.',
    evidenceGaps: ['Enterprise on-prem compliance requirements remain uninvestigated.'],
    validationQuestions: [
      'How many hours did your team spend in the past month debugging dropped vendor webhooks?',
      'Do you currently have automated alerts when third-party webhooks fail silently?',
      'What happens when a vendor re-sends 5,000 duplicate events simultaneously?'
    ],
    evidenceLinks: [
      { title: sr1[0].title, url: sr1[0].url, domain: sr1[0].domain, snippet: sr1[0].snippet },
      { title: sr1[1].title, url: sr1[1].url, domain: sr1[1].domain, snippet: sr1[1].snippet },
      { title: sr1[2].title, url: sr1[2].url, domain: sr1[2].domain, snippet: sr1[2].snippet }
    ],
    isSaved: true,
    createdAt: d1
  };

  const score1 = calculateOpportunityScore({
    severity: 9,
    supportingSourcesCount: 3,
    recurrence: 'High',
    marketGapScore: 82,
    willingnessToPayScore: 88,
    technicalComplexity: 'Medium',
    mvpFeatureCount: 4
  });

  const opp1_1: OpportunityRecord = {
    id: 'demo-opp-1',
    researchId: 'demo-res-1',
    problemId: 'demo-prob-1',
    name: 'HookGuard',
    description: 'Autonomous reverse proxy for webhooks that enforces idempotency, auto-replays dropped events, and alerts before data loss.',
    problemSolved: 'Eliminates silent webhook drops and duplicate payload processing without requiring complex queue architecture.',
    targetCustomer: 'Mid-market SaaS engineering teams and tech-enabled startups using Stripe, Shopify, or Twilio.',
    proposedSolution: 'A zero-config inbound proxy URL: point your webhooks to HookGuard, which signs, verifies idempotency keys, stores payloads for 30 days, and auto-retries failed handlers with exponential backoff and diff alerts.',
    coreDifferentiator: 'Unlike raw infrastructure queues (SQS), HookGuard has built-in semantic payload diffing and one-click replay without state mutation risk.',
    opportunityType: 'workflow_automation',
    existingCompetitors: [
      {
        name: 'Svix',
        url: 'https://svix.com',
        audience: 'API providers looking to send webhooks',
        coreFeatures: ['Webhook delivery', 'Consumer portals'],
        recurringComplaints: ['Designed for outbound webhook senders, not inbound receivers consuming multiple messy APIs'],
        differentiationGap: 'Focus exclusively on inbound webhook receivers and state reconciliation.',
        isVerified: true
      },
      {
        name: 'Hookdeck',
        url: 'https://hookdeck.com',
        audience: 'Enterprise developers',
        coreFeatures: ['Event routing', 'Rate limiting'],
        recurringComplaints: ['Complex pricing tiers; lacks automatic semantic diffing for payload schema changes'],
        differentiationGap: 'Simpler developer-centric pricing with automated schema drift detection.',
        isVerified: true
      }
    ],
    weaknessesInAlternatives: [
      'Existing solutions focus on outbound senders rather than inbound receivers',
      'Requires substantial infrastructure refactoring rather than drop-in proxying',
      'No automated schema change warnings when vendors mutate payload fields'
    ],
    mvpFeatures: [
      'Inbound HTTPS proxy endpoint with 99.99% ingress uptime',
      'Automatic SHA-256 payload hash idempotency deduplication',
      'Web-based payload inspector with 14-day history',
      'One-click CLI replay tool for local debugging (`hookguard replay <event_id>`)'
    ],
    pricingModel: 'Freemium up to 25,000 events/mo; $49/mo for Pro (250,000 events + Slack alerts); $199/mo for Team.',
    distributionChannels: [
      'Open-source CLI tool on npm and GitHub',
      'Technical tutorials targeting "Shopify webhook dropped" & "Stripe webhook retry" search queries',
      'Show HN launch with live interactive replay simulator'
    ],
    technicalComplexity: 'Medium',
    validationExperiment: 'Build a 1-page landing page with a live playground URL; test if 30 developers configure it on free tier within 7 days.',
    risksAndAssumptions: [
      'Latency overhead: must process and forward inbound payloads in < 25ms',
      'Data privacy: requires encryption at rest for sensitive payload data',
      'Bandwidth costs if customers receive multi-megabyte payloads'
    ],
    supportingSources: p1_1.evidenceLinks,
    status: 'Validating',
    isSaved: true,
    isArchived: false,
    isDemo: true,
    createdAt: d1,
    updatedAt: d1,
    scorePainSeverity: score1.scorePainSeverity,
    scoreEvidenceStrength: score1.scoreEvidenceStrength,
    scoreMarketGap: score1.scoreMarketGap,
    scoreWillingnessToPay: score1.scoreWillingnessToPay,
    scoreFeasibility: score1.scoreFeasibility,
    totalScore: score1.totalScore,
    scoringExplanation: score1.scoringExplanation
  };

  // 2. Research 2: Project Management for Async Remote Teams
  const r2: ResearchRecord = {
    id: 'demo-res-2',
    query: 'site:reddit.com "project management software" ("annoying" OR "frustrated" OR "switched from")',
    topic: 'Complaints about existing project management software',
    targetCustomer: 'Remote Product Managers & Engineering Leads',
    geographicMarket: 'North America / Europe',
    includeKeywords: 'async, context switching, notifications',
    depth: 'quick',
    status: 'completed',
    isDemo: true,
    createdAt: d2,
    updatedAt: d2,
    totalResultsCount: 11,
    totalProblemsCount: 1,
    totalOpportunitiesCount: 1
  };

  const sr2: SearchResultRecord[] = [
    {
      id: 'demo-sr-4',
      researchId: 'demo-res-2',
      title: 'Linear vs Jira in 2026: Why does everything still feel like a digital assembly line? - Reddit',
      url: 'https://www.reddit.com/r/productivity/comments/linear_vs_jira_assembly_line',
      domain: 'reddit.com',
      snippet: 'We spend more time writing updates about what we did on tickets than actually shipping software. 40 notifications per morning across Jira, GitHub, Slack, and Loom.',
      publishedDate: '2026-03-01',
      sourceQuery: 'site:reddit.com "project management" complaints',
      sourceType: 'reddit',
      createdAt: d2
    },
    {
      id: 'demo-sr-5',
      researchId: 'demo-res-2',
      title: 'The async status update problem no tool has solved - Hacker News',
      url: 'https://news.ycombinator.com/item?id=38120491',
      domain: 'news.ycombinator.com',
      snippet: 'Managers ask for async status updates, but reading 12 different Slack threads and Linear comments every morning takes 45 minutes of pure distraction.',
      publishedDate: '2026-02-14',
      sourceQuery: 'async status update problem tools',
      sourceType: 'qna',
      createdAt: d2
    }
  ];

  const p2_1: ProblemRecord = {
    id: 'demo-prob-2',
    researchId: 'demo-res-2',
    statement: 'Status update cognitive fatigue: async teams spend 30-45 minutes every morning parsing fragmented comments across Slack, GitHub PRs, and Linear tickets.',
    targetAudience: 'Remote engineering managers and team leads across multiple timezones',
    userPain: 'Constant context switching, missed blockers, repetitive status requests during sync meetings.',
    supportingSourcesCount: 2,
    recurrenceIndicator: 'Medium',
    existingSolutions: ['Geekbot', 'Standuply', 'Slack threads', 'Linear project updates'],
    shortcomings: ['Manual text entry that engineers hate filling out', 'No automatic synthesis of code commits and merged PRs'],
    currentWorkarounds: ['Managers schedule 30-minute sync Zoom standups that defeat the purpose of async flexibility'],
    severity: 7,
    willingnessToPay: 'Hypothesis: B2B team subscriptions at $10-$15/seat/month to save 2 engineering hours per week.',
    confidenceLevel: 'Medium',
    confidenceExplanation: 'Clear pain expressed on Hacker News and Reddit; however, project management is a crowded category requiring strict differentiation.',
    evidenceGaps: ['Willingness of enterprise IT buyers to approve another Slack integration needs validation.'],
    validationQuestions: [
      'How much time does your team spend writing manual standup updates?',
      'Do managers actually read written updates or default back to synchronous meetings?',
      'Can your team connect GitHub PR activity to automatically draft updates?'
    ],
    evidenceLinks: [
      { title: sr2[0].title, url: sr2[0].url, domain: sr2[0].domain, snippet: sr2[0].snippet },
      { title: sr2[1].title, url: sr2[1].url, domain: sr2[1].domain, snippet: sr2[1].snippet }
    ],
    isSaved: false,
    createdAt: d2
  };

  const score2 = calculateOpportunityScore({
    severity: 7,
    supportingSourcesCount: 2,
    recurrence: 'Medium',
    marketGapScore: 70,
    willingnessToPayScore: 75,
    technicalComplexity: 'Medium',
    mvpFeatureCount: 3
  });

  const opp2_1: OpportunityRecord = {
    id: 'demo-opp-2',
    researchId: 'demo-res-2',
    problemId: 'demo-prob-2',
    name: 'PulseBrief',
    description: 'AI daily intelligence digest that automatically synthesizes GitHub PRs, Linear tickets, and Figma updates into a 60-second audio and text executive summary.',
    problemSolved: 'Replaces manual standup reports and 45 minutes of morning thread reading with zero-effort auto-generated digests.',
    targetCustomer: 'Distributed remote engineering teams of 5-50 developers.',
    proposedSolution: 'Connects read-only to GitHub, Linear, and Slack; every morning at 9am in each team member’s timezone, generates an individualized 3-bullet summary: "What moved yesterday, What is blocked right now, What needs your review today".',
    coreDifferentiator: 'Requires zero manual typing from developers; completely derived from verifiable git commits, pull request status, and ticket activity.',
    opportunityType: 'better_alternative',
    existingCompetitors: [
      {
        name: 'Geekbot',
        url: 'https://geekbot.com',
        audience: 'Slack teams',
        coreFeatures: ['Asynchronous standup surveys'],
        recurringComplaints: ['Requires humans to manually type answers; engineers skip it or copy-paste yesterday’s reply'],
        differentiationGap: 'Zero manual input needed from developers.',
        isVerified: true
      }
    ],
    weaknessesInAlternatives: [
      'Survey bots rely on manual input that decays in quality over time',
      'No deep semantic connection to actual GitHub PR code reviews or merge status'
    ],
    mvpFeatures: [
      'GitHub Organization OAuth connection',
      'Daily 9:00 AM personalized digest in Slack or email',
      'Blocker detection based on PR review requests open > 24 hours'
    ],
    pricingModel: '$8 per active developer per month, with 14-day free trial.',
    distributionChannels: [
      'Slack App Directory listing',
      'GitHub Marketplace app',
      'Targeted cold outreach to remote engineering VPs on LinkedIn'
    ],
    technicalComplexity: 'Medium',
    validationExperiment: 'Generate manual weekly digests for 3 friendly startup teams using a Python script and measure if managers read it daily.',
    risksAndAssumptions: [
      'Managers may distrust automated summaries if a subtle nuance is missed',
      'Read-only GitHub permissions might trigger security review delays in enterprise accounts'
    ],
    supportingSources: p2_1.evidenceLinks,
    status: 'Discovered',
    isSaved: false,
    isArchived: false,
    isDemo: true,
    createdAt: d2,
    updatedAt: d2,
    scorePainSeverity: score2.scorePainSeverity,
    scoreEvidenceStrength: score2.scoreEvidenceStrength,
    scoreMarketGap: score2.scoreMarketGap,
    scoreWillingnessToPay: score2.scoreWillingnessToPay,
    scoreFeasibility: score2.scoreFeasibility,
    totalScore: score2.totalScore,
    scoringExplanation: score2.scoringExplanation
  };

  // 3. Research 3: Small Business Return Management Friction
  const r3: ResearchRecord = {
    id: 'demo-res-3',
    query: 'site:reddit.com "small business" "returns" ("frustration" OR "expensive" OR "chargeback")',
    topic: 'Pain points small business owners experience with customer returns',
    targetCustomer: 'Shopify / WooCommerce Direct-to-Consumer Merchants',
    geographicMarket: 'Global',
    includeKeywords: 'shipping labels, return fraud, restocking',
    depth: 'quick',
    status: 'completed',
    isDemo: true,
    createdAt: d3,
    updatedAt: d3,
    totalResultsCount: 8,
    totalProblemsCount: 1,
    totalOpportunitiesCount: 1
  };

  const sr3: SearchResultRecord[] = [
    {
      id: 'demo-sr-6',
      researchId: 'demo-res-3',
      title: 'Returns are killing my apparel brand margins - Reddit /r/ecommerce',
      url: 'https://www.reddit.com/r/ecommerce/comments/returns_killing_apparel_brand',
      domain: 'reddit.com',
      snippet: 'Return shipping costs $9 each way on a $45 item. By the time it arrives back, inspecting and restocking costs another $5. We lose money on 30% of our orders.',
      publishedDate: '2026-02-05',
      sourceQuery: 'ecommerce return shipping costs killing margin',
      sourceType: 'reddit',
      createdAt: d3
    }
  ];

  const p3_1: ProblemRecord = {
    id: 'demo-prob-3',
    researchId: 'demo-res-3',
    statement: 'Reverse logistics freight and inspection costs destroy net profits on items under $50, with merchants losing $14+ per returned order.',
    targetAudience: 'Independent direct-to-consumer apparel and accessories merchants ($250k - $3M annual GMV)',
    userPain: 'Merchants forced to eat 30% margin hits or risk negative customer reviews and chargebacks.',
    supportingSourcesCount: 1,
    recurrenceIndicator: 'Medium',
    existingSolutions: ['Loop Returns', 'Happy Returns', 'Returnly', 'Manual email exchange'],
    shortcomings: ['Enterprise return platforms cost $350+/mo base fee plus $0.50/label', 'Pushes physical shipping instead of retention offers'],
    currentWorkarounds: ['Merchants manually negotiate with customers via email offering 20% discounts to keep the item'],
    severity: 8,
    willingnessToPay: 'Hypothesis: Performance-based pricing (take 15% of saved return cost).',
    confidenceLevel: 'Medium',
    confidenceExplanation: 'Strong margin pain confirmed, but returns behavior is heavily sector-dependent.',
    evidenceGaps: ['Consumer reaction to keep-the-item offers across varying brand tiers.'],
    validationQuestions: [
      'What percentage of returned items can actually be restocked and resold at full price?',
      'Would you accept a system that gives the customer an instant 60% gift card to keep the item instead of shipping it back?'
    ],
    evidenceLinks: [
      { title: sr3[0].title, url: sr3[0].url, domain: sr3[0].domain, snippet: sr3[0].snippet }
    ],
    isSaved: false,
    createdAt: d3
  };

  const score3 = calculateOpportunityScore({
    severity: 8,
    supportingSourcesCount: 1,
    recurrence: 'Medium',
    marketGapScore: 85,
    willingnessToPayScore: 82,
    technicalComplexity: 'Low',
    mvpFeatureCount: 3
  });

  const opp3_1: OpportunityRecord = {
    id: 'demo-opp-3',
    researchId: 'demo-res-3',
    problemId: 'demo-prob-3',
    name: 'KeepKeep',
    description: 'Shopify app that offers buyers instant store credit bonuses (120% value) or keep-it partial refunds, slashing physical reverse shipping costs by 45%.',
    problemSolved: 'Prevents expensive reverse shipping fees on low-margin items by converting return requests into brand retention and instant upsells.',
    targetCustomer: 'Direct-to-consumer Shopify merchants with average order value under $75.',
    proposedSolution: 'When a customer clicks "Return Item", KeepKeep dynamically computes freight vs product cost. If freight > 40% of item cost, it offers: "Keep the item + get 120% instant store credit to spend today, OR keep the item + get a 50% immediate refund to your card".',
    coreDifferentiator: 'Focuses purely on return deflection and merchant margin preservation rather than generating expensive FedEx return labels.',
    opportunityType: 'niche_adaptation',
    existingCompetitors: [
      {
        name: 'Loop Returns',
        url: 'https://loopreturns.com',
        audience: 'Enterprise Shopify Plus brands',
        coreFeatures: ['Return portal', 'Exchanges'],
        recurringComplaints: ['Prohibitively expensive minimum monthly commitments for small brands ($4,000+/year)'],
        differentiationGap: 'Zero base fee; purely pay-as-you-save for growing brands.',
        isVerified: true
      }
    ],
    weaknessesInAlternatives: [
      'Expensive enterprise pricing alienates 90% of Shopify stores',
      'Assumes every returned item must be physically mailed back'
    ],
    mvpFeatures: [
      'One-click Shopify App Embed widget',
      'Dynamic threshold rule builder (e.g. If item price < $40, offer keep-it refund)',
      'Instant Shopify Gift Card generation API integration'
    ],
    pricingModel: '$29/mo + $1.50 per successfully deflected return.',
    distributionChannels: [
      'Shopify App Store SEO for "Return portal" and "Reduce returns"',
      'Direct YouTube case study break-down on popular ecommerce channels',
      'Shopify merchant Facebook/Reddit communities'
    ],
    technicalComplexity: 'Low',
    validationExperiment: 'Offer 10 friendly Shopify merchants free setup; track deflection rate over 100 return attempts.',
    risksAndAssumptions: [
      'Risk of customer abuse: must include fraud limits per customer email',
      'Brand perception: luxury brands may want items returned to avoid market dilution'
    ],
    supportingSources: p3_1.evidenceLinks,
    status: 'Researching',
    isSaved: false,
    isArchived: false,
    isDemo: true,
    createdAt: d3,
    updatedAt: d3,
    scorePainSeverity: score3.scorePainSeverity,
    scoreEvidenceStrength: score3.scoreEvidenceStrength,
    scoreMarketGap: score3.scoreMarketGap,
    scoreWillingnessToPay: score3.scoreWillingnessToPay,
    scoreFeasibility: score3.scoreFeasibility,
    totalScore: score3.totalScore,
    scoringExplanation: score3.scoringExplanation
  };

  return {
    researches: [r1, r2, r3],
    searchResults: [...sr1, ...sr2, ...sr3],
    problems: [p1_1, p2_1, p3_1],
    opportunities: [opp1_1, opp2_1, opp3_1]
  };
}
