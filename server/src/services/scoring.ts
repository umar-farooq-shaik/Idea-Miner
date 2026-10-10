import { RecurrenceIndicator, TechnicalComplexity } from '../types/index.js';

export interface RawScoringInputs {
  severity: number; // 1-10
  supportingSourcesCount: number; // number of distinct sources
  recurrence: RecurrenceIndicator;
  marketGapScore: number; // 0-100
  willingnessToPayScore: number; // 0-100
  technicalComplexity: TechnicalComplexity;
  mvpFeatureCount?: number;
}

export interface CalculatedScore {
  scorePainSeverity: number;     // 0-100
  scoreEvidenceStrength: number; // 0-100
  scoreMarketGap: number;        // 0-100
  scoreWillingnessToPay: number; // 0-100
  scoreFeasibility: number;      // 0-100
  totalScore: number;            // 0-100
  evidenceConfidence: 'High' | 'Medium' | 'Low';
  scoringExplanation: string;
}

/**
 * Calculates a mathematically transparent, deterministic 0-100 score for opportunities.
 * Weight Distribution:
 * - Pain Severity: 25%
 * - Evidence Strength & Recurrence: 25%
 * - Market Gap & Differentiation: 20%
 * - Potential Willingness to Pay: 15%
 * - MVP Feasibility: 15%
 */
export function calculateOpportunityScore(inputs: RawScoringInputs): CalculatedScore {
  // 1. Pain Severity (Normalized 1-10 -> 0-100)
  const clampedSeverity = Math.max(1, Math.min(10, inputs.severity || 5));
  const scorePainSeverity = Math.round(clampedSeverity * 10);

  // 2. Evidence Strength & Recurrence (0-100)
  // Missing evidence heavily penalizes this criterion.
  const sourceCount = Math.max(0, inputs.supportingSourcesCount || 0);
  let baseEvidence = 0;
  if (sourceCount === 0) {
    baseEvidence = 10;
  } else if (sourceCount === 1) {
    baseEvidence = 40;
  } else if (sourceCount === 2) {
    baseEvidence = 65;
  } else if (sourceCount === 3) {
    baseEvidence = 85;
  } else {
    baseEvidence = Math.min(100, 85 + (sourceCount - 3) * 5);
  }

  // Recurrence multiplier
  let recurrenceMultiplier = 0.5;
  if (inputs.recurrence === 'High') recurrenceMultiplier = 1.0;
  else if (inputs.recurrence === 'Medium') recurrenceMultiplier = 0.85;
  else if (inputs.recurrence === 'Emerging') recurrenceMultiplier = 0.75;
  else if (inputs.recurrence === 'Low') recurrenceMultiplier = 0.5;

  const scoreEvidenceStrength = Math.min(100, Math.max(0, Math.round(baseEvidence * recurrenceMultiplier)));

  // Evidence Confidence label
  let evidenceConfidence: 'High' | 'Medium' | 'Low' = 'Low';
  if (sourceCount >= 3 && (inputs.recurrence === 'High' || inputs.recurrence === 'Medium')) {
    evidenceConfidence = 'High';
  } else if (sourceCount >= 2) {
    evidenceConfidence = 'Medium';
  } else {
    evidenceConfidence = 'Low';
  }

  // 3. Market Gap & Differentiation (0-100)
  const scoreMarketGap = Math.max(0, Math.min(100, Math.round(inputs.marketGapScore || 50)));

  // 4. Potential Willingness to Pay (0-100)
  const scoreWillingnessToPay = Math.max(0, Math.min(100, Math.round(inputs.willingnessToPayScore || 50)));

  // 5. MVP Feasibility (0-100)
  // Low complexity = higher feasibility (easier to test/ship)
  let baseFeasibility = 65;
  if (inputs.technicalComplexity === 'Low') {
    baseFeasibility = 90;
  } else if (inputs.technicalComplexity === 'Medium') {
    baseFeasibility = 68;
  } else if (inputs.technicalComplexity === 'High') {
    baseFeasibility = 40;
  }
  
  // Moderate deduction if MVP has excessive features (> 5 features)
  const featureDeduction = (inputs.mvpFeatureCount && inputs.mvpFeatureCount > 5) ? 10 : 0;
  const scoreFeasibility = Math.max(10, Math.min(100, baseFeasibility - featureDeduction));

  // Weighted formula: 25% + 25% + 20% + 15% + 15% = 100%
  const totalScore = Math.round(
    (0.25 * scorePainSeverity) +
    (0.25 * scoreEvidenceStrength) +
    (0.20 * scoreMarketGap) +
    (0.15 * scoreWillingnessToPay) +
    (0.15 * scoreFeasibility)
  );

  // Generate transparent rationale explanation
  const parts: string[] = [];
  parts.push(`Pain Severity: ${scorePainSeverity}/100 (25% weight)`);
  parts.push(`Evidence Recurrence: ${scoreEvidenceStrength}/100 (25% weight, ${sourceCount} distinct sources, ${inputs.recurrence} recurrence)`);
  parts.push(`Market Differentiation Gap: ${scoreMarketGap}/100 (20% weight)`);
  parts.push(`Willingness to Pay: ${scoreWillingnessToPay}/100 (15% weight)`);
  parts.push(`MVP Feasibility: ${scoreFeasibility}/100 (15% weight, ${inputs.technicalComplexity} complexity)`);

  const scoringExplanation = `Total Score: ${totalScore}/100. Breakdown: ${parts.join(' | ')}. Evidence confidence is ${evidenceConfidence}.`;

  return {
    scorePainSeverity,
    scoreEvidenceStrength,
    scoreMarketGap,
    scoreWillingnessToPay,
    scoreFeasibility,
    totalScore,
    evidenceConfidence,
    scoringExplanation
  };
}
