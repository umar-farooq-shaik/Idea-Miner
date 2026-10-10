import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { 
  SearchResultRecord, 
  ProblemRecord, 
  OpportunityRecord, 
  RecurrenceIndicator, 
  ConfidenceLevel, 
  OpportunityType, 
  TechnicalComplexity 
} from '../types/index.js';
import { calculateOpportunityScore } from './scoring.js';
import { v4 as uuidv4 } from 'uuid';

// Zod schemas for structured Gemini output validation
const EvidenceLinkSchema = z.object({
  title: z.string(),
  url: z.string(),
  domain: z.string(),
  snippet: z.string().optional()
});

const GeminiProblemSchema = z.object({
  statement: z.string().min(5),
  targetAudience: z.string(),
  userPain: z.string(),
  supportingUrls: z.array(z.string()).default([]),
  recurrenceIndicator: z.enum(['High', 'Medium', 'Low', 'Emerging']).default('Medium'),
  existingSolutions: z.array(z.string()).default([]),
  shortcomings: z.array(z.string()).default([]),
  currentWorkarounds: z.array(z.string()).default([]),
  severity: z.number().min(1).max(10).default(5),
  willingnessToPayHypothesis: z.string().default(''),
  confidenceLevel: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  confidenceExplanation: z.string(),
  evidenceGaps: z.array(z.string()).default([]),
  validationQuestions: z.array(z.string()).default([])
});

const GeminiCompetitorSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  audience: z.string(),
  coreFeatures: z.array(z.string()).default([]),
  recurringComplaints: z.array(z.string()).default([]),
  differentiationGap: z.string(),
  isVerified: z.boolean().default(false)
});

const GeminiOpportunitySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  problemSolved: z.string(),
  targetCustomer: z.string(),
  proposedSolution: z.string(),
  coreDifferentiator: z.string(),
  opportunityType: z.enum([
    'new_product',
    'better_alternative',
    'underserved_segment',
    'missing_feature',
    'workflow_automation',
    'niche_adaptation'
  ]).default('new_product'),
  primaryProblemIndex: z.number().default(0),
  existingCompetitors: z.array(GeminiCompetitorSchema).default([]),
  weaknessesInAlternatives: z.array(z.string()).default([]),
  mvpFeatures: z.array(z.string()).default([]),
  pricingModel: z.string(),
  distributionChannels: z.array(z.string()).default([]),
  technicalComplexity: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  validationExperiment: z.string(),
  risksAndAssumptions: z.array(z.string()).default([]),
  // Raw 0-100 inputs for transparent scoring
  marketGapScore: z.number().min(0).max(100).default(60),
  willingnessToPayScore: z.number().min(0).max(100).default(55)
});

const GeminiAnalysisResponseSchema = z.object({
  executiveSummary: z.string(),
  problems: z.array(GeminiProblemSchema).min(1),
  opportunities: z.array(GeminiOpportunitySchema).min(1)
});

export interface GeminiAnalysisResult {
  problems: ProblemRecord[];
  opportunities: OpportunityRecord[];
  executiveSummary: string;
}

export async function analyzeEvidenceWithGemini(
  evidence: SearchResultRecord[],
  researchContext: {
    topic: string;
    targetCustomer?: string;
    geographicMarket?: string;
    researchId: string;
  },
  credentials: {
    apiKey: string;
    model: string;
  }
): Promise<GeminiAnalysisResult> {
  const { apiKey, model } = credentials;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is missing. Configure your Gemini API key in Settings or .env.');
  }

  // Create client instance using @google/genai
  const ai = new GoogleGenAI({ apiKey });

  // Map available evidence into clean indexable reference list
  const evidenceList = evidence.map((e, index) => ({
    id: index + 1,
    url: e.url,
    domain: e.domain,
    title: e.title,
    snippet: e.snippet,
    sourceType: e.sourceType,
    publishedDate: e.publishedDate || 'N/A'
  }));

  const prompt = `
You are the lead intelligence analyst for "Idea Miner", a research tool that finds real, recurring problems experienced online and transforms them into evidence-backed startup opportunities.

CRITICAL GROUNDING RULES:
1. ONLY reference URLs that are explicitly provided in the EVIDENCE LIST below. NEVER invent, guess, or hallucinate URLs or source links.
2. Separate observed evidence from AI inference. Clearly state when willingness to pay or market gap is an inferential hypothesis.
3. If evidence is sparse, low quality, or inconclusive, say so explicitly in confidenceExplanation and evidenceGaps. Do NOT artificially inflate scores or pretend weak evidence is strong.
4. Never claim an idea is completely novel or that nobody has built it. Assess how differentiated it is compared to the alternatives found.
5. Provide realistic MVP features (lean, testable, minimum lovable product) and pragmatic validation experiments.

RESEARCH CONTEXT:
Topic/Industry: "${researchContext.topic}"
Target Customer: "${researchContext.targetCustomer || 'Any relevant target persona'}"
Geographic Market: "${researchContext.geographicMarket || 'Global'}"

EVIDENCE LIST (${evidenceList.length} items retrieved):
${JSON.stringify(evidenceList, null, 2)}

Produce a valid JSON object matching this TypeScript structure:
{
  "executiveSummary": "Concise 2-3 sentence overview of the market friction discovered",
  "problems": [
    {
      "statement": "Clear problem statement",
      "targetAudience": "Specific target group suffering from this",
      "userPain": "Consequences and daily friction",
      "supportingUrls": ["Array of exact URLs from the EVIDENCE LIST above that back this problem"],
      "recurrenceIndicator": "High" | "Medium" | "Low" | "Emerging",
      "existingSolutions": ["Tools or solutions users mentioned trying"],
      "shortcomings": ["Why current solutions fail them"],
      "currentWorkarounds": ["Manual hacks, spreadsheets, cobbled tools users currently resort to"],
      "severity": 1 to 10 (1=mild inconvenience, 10=critical blocker costing significant money/time),
      "willingnessToPayHypothesis": "Hypothesis on potential pricing/willingness to pay based on current workarounds",
      "confidenceLevel": "High" | "Medium" | "Low",
      "confidenceExplanation": "Honest assessment of the evidence depth and gaps",
      "evidenceGaps": ["What remains unverified in this research"],
      "validationQuestions": ["Questions a founder should ask 5 prospective users"]
    }
  ],
  "opportunities": [
    {
      "name": "Catchy, professional startup concept name",
      "description": "One-sentence high-impact value proposition",
      "problemSolved": "Which specific friction this solves",
      "targetCustomer": "Primary ideal customer profile",
      "proposedSolution": "How the product works and solves the pain",
      "coreDifferentiator": "Why this beats current alternatives and workarounds",
      "opportunityType": "new_product" | "better_alternative" | "underserved_segment" | "missing_feature" | "workflow_automation" | "niche_adaptation",
      "primaryProblemIndex": 0, // 0-based index linking to the problems array above
      "existingCompetitors": [
        {
          "name": "Competitor name",
          "url": "Website or review URL if present in evidence, or domain",
          "audience": "Target audience",
          "coreFeatures": ["Feature 1", "Feature 2"],
          "recurringComplaints": ["Major complaint from evidence"],
          "differentiationGap": "Why they leave this need unaddressed",
          "isVerified": true or false
        }
      ],
      "weaknessesInAlternatives": ["Common flaws users complain about in existing tools"],
      "mvpFeatures": ["3-5 core MVP features for version 1.0"],
      "pricingModel": "Suggested pricing model (e.g. $29/mo seat-based, usage-based, etc.)",
      "distributionChannels": ["Actionable customer acquisition and go-to-market channels"],
      "technicalComplexity": "Low" | "Medium" | "High",
      "validationExperiment": "Specific test to run in 48 hours (e.g., concierge MVP, landing page test, cold outreach)",
      "risksAndAssumptions": ["Top 3 critical assumptions that must be validated"],
      "marketGapScore": 0 to 100 (degree of unaddressed gap in the market),
      "willingnessToPayScore": 0 to 100 (estimated commercial viability)
    }
  ]
}

Return ONLY valid JSON. No conversational preamble.
`;

  try {
    const response = await ai.models.generateContent({
      model: model || 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const responseText = response.text || '';
    if (!responseText.trim()) {
      throw new Error('Gemini returned an empty response.');
    }

    // Clean JSON markdown fences if present
    const cleanJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON:', cleanJson.slice(0, 300));
      throw new Error(`Gemini response was not valid JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
    }

    const validated = GeminiAnalysisResponseSchema.parse(parsed);

    // Map into domain ProblemRecords
    const urlToEvidenceMap = new Map<string, SearchResultRecord>();
    for (const item of evidence) {
      urlToEvidenceMap.set(item.url, item);
    }

    const problemRecords: ProblemRecord[] = validated.problems.map(p => {
      // Find matching evidence items
      const validEvidenceLinks = p.supportingUrls
        .map(url => {
          const matched = urlToEvidenceMap.get(url);
          if (matched) {
            return {
              title: matched.title,
              url: matched.url,
              domain: matched.domain,
              snippet: matched.snippet
            };
          }
          // If URL is in evidence by loose match
          const loose = evidence.find(e => e.url.includes(url) || url.includes(e.url));
          if (loose) {
            return {
              title: loose.title,
              url: loose.url,
              domain: loose.domain,
              snippet: loose.snippet
            };
          }
          return null;
        })
        .filter((l): l is NonNullable<typeof l> => l !== null);

      return {
        id: uuidv4(),
        researchId: researchContext.researchId,
        statement: p.statement,
        targetAudience: p.targetAudience,
        userPain: p.userPain,
        supportingSourcesCount: Math.max(validEvidenceLinks.length, 1),
        recurrenceIndicator: p.recurrenceIndicator as RecurrenceIndicator,
        existingSolutions: p.existingSolutions,
        shortcomings: p.shortcomings,
        currentWorkarounds: p.currentWorkarounds,
        severity: p.severity,
        willingnessToPay: p.willingnessToPayHypothesis,
        confidenceLevel: p.confidenceLevel as ConfidenceLevel,
        confidenceExplanation: p.confidenceExplanation,
        evidenceGaps: p.evidenceGaps,
        validationQuestions: p.validationQuestions,
        evidenceLinks: validEvidenceLinks,
        isSaved: false,
        createdAt: new Date().toISOString()
      };
    });

    // Map into domain OpportunityRecords with transparent mathematical scoring
    const opportunityRecords: OpportunityRecord[] = validated.opportunities.map(o => {
      const primaryProblem = problemRecords[o.primaryProblemIndex] || problemRecords[0];

      // Calculate score using validated mathematical inputs
      const scoring = calculateOpportunityScore({
        severity: primaryProblem?.severity || 6,
        supportingSourcesCount: primaryProblem?.supportingSourcesCount || 2,
        recurrence: primaryProblem?.recurrenceIndicator || 'Medium',
        marketGapScore: o.marketGapScore,
        willingnessToPayScore: o.willingnessToPayScore,
        technicalComplexity: o.technicalComplexity as TechnicalComplexity,
        mvpFeatureCount: o.mvpFeatures.length
      });

      return {
        id: uuidv4(),
        researchId: researchContext.researchId,
        problemId: primaryProblem?.id,
        name: o.name,
        description: o.description,
        problemSolved: o.problemSolved,
        targetCustomer: o.targetCustomer,
        proposedSolution: o.proposedSolution,
        coreDifferentiator: o.coreDifferentiator,
        opportunityType: o.opportunityType as OpportunityType,
        existingCompetitors: o.existingCompetitors,
        weaknessesInAlternatives: o.weaknessesInAlternatives,
        mvpFeatures: o.mvpFeatures,
        pricingModel: o.pricingModel,
        distributionChannels: o.distributionChannels,
        technicalComplexity: o.technicalComplexity as TechnicalComplexity,
        validationExperiment: o.validationExperiment,
        risksAndAssumptions: o.risksAndAssumptions,
        supportingSources: primaryProblem ? primaryProblem.evidenceLinks : [],
        status: 'Discovered',
        isSaved: false,
        isArchived: false,
        isDemo: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scorePainSeverity: scoring.scorePainSeverity,
        scoreEvidenceStrength: scoring.scoreEvidenceStrength,
        scoreMarketGap: scoring.scoreMarketGap,
        scoreWillingnessToPay: scoring.scoreWillingnessToPay,
        scoreFeasibility: scoring.scoreFeasibility,
        totalScore: scoring.totalScore,
        scoringExplanation: scoring.scoringExplanation
      };
    });

    return {
      problems: problemRecords,
      opportunities: opportunityRecords,
      executiveSummary: validated.executiveSummary
    };
  } catch (err: unknown) {
    console.error('Gemini analysis failed:', err);
    throw err;
  }
}
