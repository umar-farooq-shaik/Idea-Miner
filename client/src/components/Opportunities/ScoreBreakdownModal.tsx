import React from 'react';
import { Modal } from '../common/Modal';
import { OpportunityRecord } from '../../types';
import { Calculator, ShieldCheck, AlertCircle } from 'lucide-react';
import { getScoreColors } from '../../utils/formatters';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: OpportunityRecord | null;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  opportunity
}) => {
  if (!opportunity) return null;

  const colors = getScoreColors(opportunity.totalScore);

  const criteria = [
    {
      name: 'Pain Severity',
      weight: '25%',
      score: opportunity.scorePainSeverity,
      desc: 'Intensity of user frustration and business impact of the core problem',
      contribution: Math.round(0.25 * opportunity.scorePainSeverity)
    },
    {
      name: 'Evidence Strength & Recurrence',
      weight: '25%',
      score: opportunity.scoreEvidenceStrength,
      desc: 'Count of distinct independent sources (Reddit, reviews, forums) verifying the pattern',
      contribution: Math.round(0.25 * opportunity.scoreEvidenceStrength)
    },
    {
      name: 'Market Gap & Differentiation',
      weight: '20%',
      score: opportunity.scoreMarketGap,
      desc: 'Degree to which incumbents leave this specific friction unaddressed',
      contribution: Math.round(0.20 * opportunity.scoreMarketGap)
    },
    {
      name: 'Willingness to Pay',
      weight: '15%',
      score: opportunity.scoreWillingnessToPay,
      desc: 'Hypothesized commercial viability based on current paid workarounds and ROI',
      contribution: Math.round(0.15 * opportunity.scoreWillingnessToPay)
    },
    {
      name: 'MVP Feasibility',
      weight: '15%',
      score: opportunity.scoreFeasibility,
      desc: 'Ease of shipping a lean v1.0 based on technical complexity and feature scope',
      contribution: Math.round(0.15 * opportunity.scoreFeasibility)
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transparent Opportunity Score Breakdown"
      subtitle={`Calculated mathematical model for "${opportunity.name}"`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Total Score Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${colors.bg} ${colors.border}`}>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-soft font-sans">
              Overall Opportunity Rating
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-3xl font-extrabold font-mono ${colors.text}`}>
                {opportunity.totalScore}
              </span>
              <span className="text-sm font-mono text-charcoal-soft">/100</span>
            </div>
            <p className="text-xs text-charcoal-muted mt-1">
              Deterministic weighted sum of 5 validated normalized inputs (0–100)
            </p>
          </div>
          <div className="p-3 bg-white/80 rounded-lg border border-stone-200/60 shadow-xs">
            <Calculator className="w-6 h-6 text-copper" />
          </div>
        </div>

        {/* 5 Weighted Criteria Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
            Individual Weighted Factors
          </h4>

          {criteria.map((c, i) => (
            <div key={i} className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-charcoal">
                  {c.name} <span className="font-normal text-charcoal-soft">({c.weight} weight)</span>
                </span>
                <span className="font-mono font-bold text-charcoal">
                  {c.score}/100 <span className="text-charcoal-soft font-normal">(+{c.contribution} pts)</span>
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-copper h-full rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, Math.max(0, c.score))}%` }}
                />
              </div>

              <p className="text-[11px] text-charcoal-muted">
                {c.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Full Rationale Explanation */}
        <div className="p-3.5 bg-white rounded-lg border border-stone-200 text-xs space-y-1">
          <span className="font-bold text-charcoal flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-olive" /> Scoring Rationale:
          </span>
          <p className="text-charcoal-muted leading-relaxed font-mono text-[11px]">
            {opportunity.scoringExplanation}
          </p>
        </div>

        {/* Notice on Missing Evidence Penalty */}
        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-amber-900/90 text-[11px] leading-relaxed">
            <strong>Evidence Confidence Rule:</strong> If supporting source evidence is sparse (0 or 1 sources), the Evidence Strength score is heavily penalized, preventing unverified claims from receiving inflated overall scores.
          </p>
        </div>
      </div>
    </Modal>
  );
};
