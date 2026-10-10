import React, { useState } from 'react';
import { 
  OpportunityRecord, 
  OpportunityStatus, 
  CompetitorItem 
} from '../../types';
import { ScoreBadge } from './ScoreBadge';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  X, 
  Bookmark, 
  Archive, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Target, 
  Layers, 
  Wrench, 
  CheckCircle2, 
  DollarSign, 
  HelpCircle,
  Cpu,
  Building,
  Flag
} from 'lucide-react';
import { formatOpportunityType } from '../../utils/formatters';
import { useToast } from '../common/Toast';
import { api } from '../../services/api';

interface OpportunityDetailDrawerProps {
  opportunity: OpportunityRecord | null;
  onClose: () => void;
  onStatusChange: (id: string, status: OpportunityStatus) => void;
  onToggleSave: (id: string, isSaved: boolean) => void;
  onToggleArchive: (id: string, isArchived: boolean) => void;
  onInspectScore: (opportunity: OpportunityRecord) => void;
  onOpportunityUpdated: (updated: OpportunityRecord) => void;
}

export const OpportunityDetailDrawer: React.FC<OpportunityDetailDrawerProps> = ({
  opportunity,
  onClose,
  onStatusChange,
  onToggleSave,
  onToggleArchive,
  onInspectScore,
  onOpportunityUpdated
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'customer' | 'competitors' | 'mvp' | 'validation' | 'risks'>('overview');
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  if (!opportunity) return null;

  const statusOptions: OpportunityStatus[] = [
    'Discovered',
    'Researching',
    'Validating',
    'Building',
    'Rejected'
  ];

  const tabs = [
    { id: 'overview', label: '1. Overview' },
    { id: 'evidence', label: '2. Problem Evidence' },
    { id: 'customer', label: '3. Customer Profile' },
    { id: 'competitors', label: '4. Competitor Analysis' },
    { id: 'mvp', label: '5. MVP Specification' },
    { id: 'validation', label: '6. Validation Plan' },
    { id: 'risks', label: '7. Risks & Assumptions' },
  ] as const;

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      const res = await api.reanalyzeOpportunity(opportunity.id);
      onOpportunityUpdated(res.opportunity);
      success('Deep Re-Analysis Complete', 'Gemini synthesized updated unexploited wedges and refined validation protocols.');
    } catch (err: unknown) {
      error('Re-Analysis Failed', err instanceof Error ? err.message : String(err));
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleExportCsv = () => {
    window.open(api.getOpportunitiesExportUrl(opportunity.researchId), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] shadow-editorial border-l border-stone-200 flex flex-col h-full z-10 animate-slide-left">
        {/* Top Header Bar */}
        <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <ScoreBadge
              score={opportunity.totalScore}
              onClick={() => onInspectScore(opportunity)}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-charcoal">{opportunity.name}</h2>
                {opportunity.isDemo ? (
                  <Badge variant="stone" size="sm">Sample Dataset</Badge>
                ) : (
                  <Badge variant="olive" size="sm">Live Grounded</Badge>
                )}
              </div>
              <p className="text-xs text-charcoal-muted line-clamp-1">{opportunity.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Dropdown */}
            <select
              value={opportunity.status}
              onChange={(e) => onStatusChange(opportunity.id, e.target.value as OpportunityStatus)}
              className="text-xs bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 font-semibold text-charcoal focus:outline-none focus:border-copper cursor-pointer"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Save / Bookmark Button */}
            <button
              onClick={() => onToggleSave(opportunity.id, !opportunity.isSaved)}
              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                opportunity.isSaved ? 'bg-copper text-white border-copper' : 'bg-white text-stone-500 hover:text-charcoal border-stone-300'
              }`}
              title={opportunity.isSaved ? 'Bookmarked' : 'Bookmark'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            {/* Archive Button */}
            <button
              onClick={() => onToggleArchive(opportunity.id, !opportunity.isArchived)}
              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                opportunity.isArchived ? 'bg-stone-700 text-white border-stone-700' : 'bg-white text-stone-500 hover:text-charcoal border-stone-300'
              }`}
              title={opportunity.isArchived ? 'Unarchive' : 'Archive'}
            >
              <Archive className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded text-stone-400 hover:text-charcoal hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-stone-200 bg-white flex gap-1 overflow-x-auto shrink-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-copper text-copper-dark bg-stone-50/50'
                  : 'border-transparent text-charcoal-muted hover:text-charcoal hover:border-stone-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Pitch Banner */}
              <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-soft font-mono">
                  Concept Proposition
                </span>
                <p className="text-base font-semibold text-charcoal leading-relaxed">
                  {opportunity.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                  <Badge variant="outline" size="sm">{formatOpportunityType(opportunity.opportunityType)}</Badge>
                  <span className="text-xs text-charcoal-soft font-mono">
                    Complexity: <strong className="text-charcoal">{opportunity.technicalComplexity}</strong>
                  </span>
                  <span className="text-xs text-charcoal-soft font-mono">
                    Score: <strong className="text-copper">{opportunity.totalScore}/100</strong>
                  </span>
                </div>
              </div>

              {/* Problem Solved & Proposed Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-copper" /> Friction Solved
                  </h4>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    {opportunity.problemSolved}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-olive" /> Proposed Product Solution
                  </h4>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    {opportunity.proposedSolution}
                  </p>
                </div>
              </div>

              {/* Core Differentiator */}
              <div className="p-4 bg-copper-light/40 rounded-xl border border-copper-border/70 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-copper-dark flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-copper" /> Core Strategic Differentiator
                </h4>
                <p className="text-xs text-charcoal leading-relaxed">
                  {opportunity.coreDifferentiator}
                </p>
              </div>

              {/* Weaknesses in Alternatives */}
              {opportunity.weaknessesInAlternatives.length > 0 && (
                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    Evidence-Backed Weaknesses in Existing Alternatives
                  </h4>
                  <ul className="list-disc list-inside text-xs text-charcoal-muted space-y-1">
                    {opportunity.weaknessesInAlternatives.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROBLEM EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-stone-100 rounded-lg text-xs text-charcoal-muted">
                <strong>Ground-Truth Evidence:</strong> Below are the actual public threads, reviews, and forum postings that surfaced this demand. Click any source to inspect the original context.
              </div>

              {opportunity.supportingSources.length === 0 ? (
                <div className="p-8 text-center text-xs text-charcoal-muted bg-white rounded-lg border">
                  No source links attached directly to this opportunity. Check the linked Problem statement in Discovery.
                </div>
              ) : (
                <div className="space-y-3">
                  {opportunity.supportingSources.map((source, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-charcoal hover:text-copper hover:underline flex items-center gap-1.5"
                        >
                          {source.title} <ExternalLink className="w-3.5 h-3.5 text-copper shrink-0" />
                        </a>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-charcoal-soft shrink-0">
                          {source.domain}
                        </span>
                      </div>

                      {source.snippet && (
                        <p className="text-xs text-charcoal-muted italic pl-3 border-l-2 border-copper bg-stone-50/70 p-2 rounded-r">
                          "{source.snippet}"
                        </p>
                      )}

                      <div className="text-[11px] font-mono text-stone-400 break-all pt-1">
                        Canonical URL: {source.url}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOMER PROFILE */}
          {activeTab === 'customer' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-copper" /> Primary Target Customer Persona
                </h4>
                <p className="text-sm font-semibold text-charcoal">
                  {opportunity.targetCustomer}
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-olive" /> Commercial Viability Hypothesis
                </h4>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  {opportunity.pricingModel ? `Recommended Pricing: ${opportunity.pricingModel}` : 'Usage or tiered subscription'}
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Distribution & Customer Acquisition Channels (GTM)
                </h4>
                <div className="space-y-1.5">
                  {opportunity.distributionChannels.map((channel, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-charcoal-muted">
                      <CheckCircle2 className="w-3.5 h-3.5 text-olive shrink-0" />
                      <span>{channel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPETITOR ANALYSIS */}
          {activeTab === 'competitors' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-stone-100 rounded-lg text-xs text-charcoal-muted">
                <strong>Competitor & Alternative Audit:</strong> Real existing products addressing this area, with recurring complaints and differentiation gaps isolated from research evidence.
              </div>

              {opportunity.existingCompetitors.length === 0 ? (
                <div className="p-8 text-center text-xs text-charcoal-muted bg-white rounded-lg border">
                  No direct competitors cataloged in this cluster.
                </div>
              ) : (
                <div className="space-y-4">
                  {opportunity.existingCompetitors.map((comp, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-charcoal">{comp.name}</h4>
                          {comp.isVerified ? (
                            <Badge variant="olive" size="sm" className="text-[10px]">Verified Product</Badge>
                          ) : (
                            <Badge variant="stone" size="sm" className="text-[10px]">Identified Incumbent</Badge>
                          )}
                        </div>
                        {comp.url && (
                          <a 
                            href={comp.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-copper hover:underline flex items-center gap-1"
                          >
                            Visit Site <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-stone-50 rounded border border-stone-200/80">
                          <span className="font-semibold text-charcoal">Target Audience:</span>
                          <p className="text-charcoal-muted mt-0.5">{comp.audience}</p>
                        </div>

                        <div className="p-2.5 bg-stone-50 rounded border border-stone-200/80">
                          <span className="font-semibold text-charcoal">Core Features:</span>
                          <p className="text-charcoal-muted mt-0.5">{comp.coreFeatures.join(', ')}</p>
                        </div>
                      </div>

                      {/* Recurring Complaints About Competitor */}
                      {comp.recurringComplaints.length > 0 && (
                        <div className="p-3 bg-red-50/50 rounded border border-red-200/60 text-xs">
                          <span className="font-bold text-red-900 flex items-center gap-1 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-700" /> Recurring Customer Complaints:
                          </span>
                          <ul className="list-disc list-inside text-red-800 space-y-0.5">
                            {comp.recurringComplaints.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Differentiation Gap */}
                      <div className="p-3 bg-olive-light/50 rounded border border-olive-border/70 text-xs">
                        <span className="font-bold text-olive-dark">Why They Leave This Gap Open:</span>
                        <p className="text-olive-dark/90 mt-0.5">{comp.differentiationGap}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MVP SPECIFICATION */}
          {activeTab === 'mvp' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-copper" /> Recommended MVP Scope (v1.0)
                  </h4>
                  <Badge variant="stone" size="sm">
                    {opportunity.technicalComplexity} Technical Complexity
                  </Badge>
                </div>
                <p className="text-xs text-charcoal-muted">
                  Strictly prioritized minimal feature set required to deliver value and validate willingness to pay.
                </p>

                <div className="space-y-2 pt-2">
                  {opportunity.mvpFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded border border-stone-200 text-xs text-charcoal">
                      <span className="w-5 h-5 rounded-full bg-copper-light text-copper-dark font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Suggested Commercial Pricing Model
                </h4>
                <p className="text-xs text-charcoal font-medium">
                  {opportunity.pricingModel}
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: VALIDATION PLAN */}
          {activeTab === 'validation' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-olive" /> 48-Hour Lean Validation Experiment
                </h4>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  How a solo builder or early-stage team should validate this concept before writing substantial code:
                </p>
                <div className="p-3.5 bg-olive-light/40 border border-olive-border/80 rounded-lg text-xs text-olive-dark font-medium leading-relaxed">
                  {opportunity.validationExperiment}
                </div>
              </div>

              {/* Action to trigger Deep AI Re-Analysis */}
              <div className="p-4 bg-copper-light/30 border border-copper-border rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-copper-dark flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-copper" /> Re-Analyze with Gemini AI
                  </h4>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleReanalyze}
                    isLoading={isReanalyzing}
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Run Deep Re-Analysis
                  </Button>
                </div>
                <p className="text-[11px] text-charcoal-muted">
                  Triggers an advanced synthesis turn to discover counter-intuitive wedge features, refine validation kill-metrics, and pressure-test assumptions.
                </p>
              </div>
            </div>
          )}

          {/* TAB 7: RISKS & ASSUMPTIONS */}
          {activeTab === 'risks' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Critical Assumptions & Kill-Risks
                </h4>
                <p className="text-xs text-charcoal-muted">
                  These underlying premises must be confirmed. If any prove false, the opportunity thesis fails.
                </p>

                <div className="space-y-2 pt-2">
                  {opportunity.risksAndAssumptions.map((risk, i) => (
                    <div key={i} className="p-3 bg-red-50/50 rounded border border-red-200 text-xs text-red-900 flex items-start gap-2">
                      <span className="font-mono font-bold text-red-700 shrink-0">#{i + 1}</span>
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-between shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Export Concept CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
