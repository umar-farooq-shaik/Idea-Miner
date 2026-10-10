import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { 
  AlertTriangle, 
  ExternalLink, 
  Bookmark, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Wrench, 
  DollarSign, 
  HelpCircle,
  ShieldAlert,
  FileQuestion
} from 'lucide-react';
import { ProblemRecord } from '../../types';

interface ProblemCardProps {
  problem: ProblemRecord;
  onToggleSave: (id: string, isSaved: boolean) => void;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onToggleSave }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const recurrenceVariants: Record<string, 'danger' | 'warning' | 'stone' | 'olive'> = {
    High: 'danger',
    Medium: 'warning',
    Emerging: 'olive',
    Low: 'stone'
  };

  const confidenceVariants: Record<string, 'olive' | 'warning' | 'stone'> = {
    High: 'olive',
    Medium: 'warning',
    Low: 'stone'
  };

  return (
    <Card className="border border-stone-200/90 hover:border-stone-300 transition-all shadow-card space-y-4">
      {/* Top Header: Severity, Recurrence & Save Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-100 border border-stone-200 text-xs font-mono font-bold text-charcoal">
            <span className="text-[10px] uppercase text-charcoal-soft font-sans font-medium">Severity</span>
            <span className={problem.severity >= 8 ? 'text-copper' : 'text-charcoal'}>
              {problem.severity}/10
            </span>
          </div>

          <Badge variant={recurrenceVariants[problem.recurrenceIndicator] || 'stone'} size="sm">
            Recurrence: {problem.recurrenceIndicator}
          </Badge>

          <Badge variant={confidenceVariants[problem.confidenceLevel] || 'stone'} size="sm">
            Confidence: {problem.confidenceLevel}
          </Badge>

          <span className="text-xs text-charcoal-soft font-mono">
            {problem.supportingSourcesCount} {problem.supportingSourcesCount === 1 ? 'source' : 'sources'}
          </span>
        </div>

        <button
          onClick={() => onToggleSave(problem.id, !problem.isSaved)}
          className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
            problem.isSaved 
              ? 'bg-copper text-white border-copper' 
              : 'bg-white text-stone-400 hover:text-charcoal border-stone-200'
          }`}
          title={problem.isSaved ? 'Remove bookmark' : 'Bookmark problem'}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Problem Statement */}
      <div>
        <h4 className="text-base font-bold text-charcoal leading-snug">
          {problem.statement}
        </h4>
        <p className="text-xs text-charcoal-muted mt-1.5 leading-relaxed">
          <strong>Audience:</strong> {problem.targetAudience}
        </p>
        <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
          <strong>User Pain & Consequences:</strong> {problem.userPain}
        </p>
      </div>

      {/* Grounded Evidence Section (Observed Evidence) */}
      <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-charcoal">
          <span className="flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-copper" /> Observed Evidence & Traceable Sources
          </span>
          <span className="text-[11px] font-normal text-charcoal-soft">
            Click links to inspect raw threads
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {problem.evidenceLinks.map((link, idx) => (
            <div key={idx} className="p-2.5 bg-white rounded border border-stone-200 text-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-charcoal hover:text-copper hover:underline line-clamp-1 flex items-center gap-1"
                >
                  {link.title} <ExternalLink className="w-3 h-3 text-copper shrink-0" />
                </a>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-charcoal-soft shrink-0">
                  {link.domain}
                </span>
              </div>
              {link.snippet && (
                <p className="text-[11px] text-charcoal-muted italic line-clamp-2 pl-2 border-l-2 border-copper-border">
                  "{link.snippet}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Synthesis & Hypotheses (Clearly Labeled as Inference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
        <div className="p-3 bg-stone-50/70 rounded-md border border-stone-200">
          <span className="font-semibold text-charcoal flex items-center gap-1 mb-1">
            <Layers className="w-3.5 h-3.5 text-charcoal-soft" /> Existing Solutions Mentioned:
          </span>
          <p className="text-charcoal-muted">
            {problem.existingSolutions.length > 0 ? problem.existingSolutions.join(', ') : 'None explicitly mentioned'}
          </p>
          {problem.shortcomings.length > 0 && (
            <p className="text-[11px] text-stone-500 mt-1">
              <strong>Shortcomings:</strong> {problem.shortcomings.join('; ')}
            </p>
          )}
        </div>

        <div className="p-3 bg-stone-50/70 rounded-md border border-stone-200">
          <span className="font-semibold text-charcoal flex items-center gap-1 mb-1">
            <Wrench className="w-3.5 h-3.5 text-charcoal-soft" /> Current Workarounds:
          </span>
          <p className="text-charcoal-muted">
            {problem.currentWorkarounds.length > 0 ? problem.currentWorkarounds.join('; ') : 'No workaround documented'}
          </p>
        </div>
      </div>

      {/* Willingness to pay hypothesis */}
      {problem.willingnessToPay && (
        <div className="p-3 bg-amber-50/50 rounded-md border border-amber-200/80 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-0.5">
            <DollarSign className="w-3.5 h-3.5 text-copper" /> Commercial Viability Hypothesis (AI Inference):
          </div>
          <p className="text-amber-800/90 leading-relaxed text-[11px]">
            {problem.willingnessToPay}
          </p>
        </div>
      )}

      {/* Expand/Collapse Additional Details: Confidence Rationale, Evidence Gaps, Validation Questions */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-copper hover:text-copper-hover flex items-center gap-1 cursor-pointer pt-1"
        >
          {isExpanded ? (
            <>Less Analysis <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>View Evidence Gaps & Validation Questions <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-stone-200 space-y-3 text-xs animate-fade-in">
            {/* Confidence Explanation */}
            <div className="p-3 bg-stone-100/60 rounded border border-stone-200">
              <span className="font-bold text-charcoal flex items-center gap-1 mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-copper" /> Confidence Assessment:
              </span>
              <p className="text-charcoal-muted leading-relaxed">
                {problem.confidenceExplanation}
              </p>
            </div>

            {/* Evidence Gaps */}
            {problem.evidenceGaps.length > 0 && (
              <div className="p-3 bg-stone-100/60 rounded border border-stone-200">
                <span className="font-bold text-charcoal flex items-center gap-1 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-stone-600" /> Evidence Gaps (What Remains Unverified):
                </span>
                <ul className="list-disc list-inside text-charcoal-muted space-y-0.5">
                  {problem.evidenceGaps.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Validation Questions */}
            {problem.validationQuestions.length > 0 && (
              <div className="p-3 bg-stone-100/60 rounded border border-stone-200">
                <span className="font-bold text-charcoal flex items-center gap-1 mb-1">
                  <FileQuestion className="w-3.5 h-3.5 text-olive" /> Suggested Founder Validation Questions:
                </span>
                <ul className="list-decimal list-inside text-charcoal-muted space-y-1">
                  {problem.validationQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
