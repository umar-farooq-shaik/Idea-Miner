export type ResearchDepth = 'quick' | 'deep';

export type ResearchStatus = 'pending' | 'searching' | 'analyzing' | 'completed' | 'failed';

export type SourceType = 'reddit' | 'forum' | 'review' | 'qna' | 'web';

export type RecurrenceIndicator = 'High' | 'Medium' | 'Low' | 'Emerging';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type OpportunityType = 
  | 'new_product' 
  | 'better_alternative' 
  | 'underserved_segment' 
  | 'missing_feature' 
  | 'workflow_automation' 
  | 'niche_adaptation';

export type TechnicalComplexity = 'Low' | 'Medium' | 'High';

export type OpportunityStatus = 'Discovered' | 'Researching' | 'Validating' | 'Building' | 'Rejected';

export interface ResearchRequest {
  topic: string;
  targetCustomer?: string;
  geographicMarket?: string;
  includeKeywords?: string;
  excludeKeywords?: string;
  depth: ResearchDepth;
  isDemo?: boolean;
}

export interface ResearchRecord {
  id: string;
  query: string;
  topic: string;
  targetCustomer?: string;
  geographicMarket?: string;
  includeKeywords?: string;
  excludeKeywords?: string;
  depth: ResearchDepth;
  status: ResearchStatus;
  isDemo: boolean;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  totalResultsCount?: number;
  totalProblemsCount?: number;
  totalOpportunitiesCount?: number;
}

export interface SearchResultRecord {
  id: string;
  researchId: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedDate?: string;
  sourceQuery: string;
  sourceType: SourceType;
  createdAt: string;
}

export interface EvidenceLink {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

export interface ProblemRecord {
  id: string;
  researchId: string;
  statement: string;
  targetAudience: string;
  userPain: string;
  supportingSourcesCount: number;
  recurrenceIndicator: RecurrenceIndicator;
  existingSolutions: string[];
  shortcomings: string[];
  currentWorkarounds: string[];
  severity: number; // 1-10
  willingnessToPay: string; // Hypothesis statement
  confidenceLevel: ConfidenceLevel;
  confidenceExplanation: string;
  evidenceGaps: string[];
  validationQuestions: string[];
  evidenceLinks: EvidenceLink[];
  isSaved: boolean;
  createdAt: string;
}

export interface CompetitorItem {
  name: string;
  url?: string;
  audience: string;
  coreFeatures: string[];
  recurringComplaints: string[];
  differentiationGap: string;
  isVerified: boolean;
}

export interface OpportunityRecord {
  id: string;
  researchId: string;
  problemId?: string;
  name: string;
  description: string;
  problemSolved: string;
  targetCustomer: string;
  proposedSolution: string;
  coreDifferentiator: string;
  opportunityType: OpportunityType;
  existingCompetitors: CompetitorItem[];
  weaknessesInAlternatives: string[];
  mvpFeatures: string[];
  pricingModel: string;
  distributionChannels: string[];
  technicalComplexity: TechnicalComplexity;
  validationExperiment: string;
  risksAndAssumptions: string[];
  supportingSources: EvidenceLink[];
  status: OpportunityStatus;
  isSaved: boolean;
  isArchived: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  // Transparent Scoring Breakdown
  scorePainSeverity: number;     // 0-100 (weight 25%)
  scoreEvidenceStrength: number; // 0-100 (weight 25%)
  scoreMarketGap: number;        // 0-100 (weight 20%)
  scoreWillingnessToPay: number; // 0-100 (weight 15%)
  scoreFeasibility: number;      // 0-100 (weight 15%)
  totalScore: number;            // 0-100
  scoringExplanation: string;
}

export interface SystemConfig {
  hasGeminiKey: boolean;
  geminiModel: string;
  hasSerpApiKey: boolean;
  hasDatabaseUrl: boolean;
  databaseType: 'sqlite' | 'postgres';
  isDemoModeDefault: boolean;
}

export interface DashboardStats {
  totalProblems: number;
  recurringComplaints: number;
  potentialOpportunities: number;
  completedSearches: number;
  trendingCategories: { name: string; count: number }[];
  recentActivity: {
    id: string;
    type: 'research' | 'opportunity' | 'status_change';
    title: string;
    timestamp: string;
    badge?: string;
  }[];
}
