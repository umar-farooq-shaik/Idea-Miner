import React from 'react';
import { OpportunityRecord, ProblemRecord } from '../../types';
import { Printer, Download, ArrowLeft, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';
import { formatDate, formatOpportunityType } from '../../utils/formatters';
import { api } from '../../services/api';

interface PrintableReportProps {
  opportunities: OpportunityRecord[];
  onBack: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ opportunities, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    window.open(api.getOpportunitiesExportUrl(), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden during print) */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 no-print">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          icon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to Workspace
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export All (CSV)
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
            className="font-semibold"
          >
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white border border-stone-300 rounded-xl p-8 sm:p-12 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none print-page">
        {/* Document Header */}
        <div className="border-b-2 border-charcoal pb-6 flex items-start justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-copper">
              IDEA MINER — EXECUTIVE INTELLIGENCE REPORT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal mt-1 tracking-tight">
              Startup Opportunity Dossier
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">
              Generated on {formatDate(new Date().toISOString())} • Grounded in public search results & complaint mining
            </p>
          </div>

          <div className="text-right text-xs font-mono text-charcoal-soft">
            <div>CONFIDENTIAL REPORT</div>
            <div>{opportunities.length} Concepts Synthesized</div>
          </div>
        </div>

        {/* Executive Summary Memo */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-xs leading-relaxed space-y-2">
          <h3 className="font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-olive" /> Methodology & Grounding Note
          </h3>
          <p className="text-charcoal-muted">
            The concepts below represent opportunity clusters derived from real, recurring customer complaints and workarounds identified across public Reddit discussions, community forums, and verified product review platforms. Scoring is computed through a deterministic mathematical model evaluating Pain Severity (25%), Evidence Strength (25%), Market Gap (20%), Willingness to Pay (15%), and MVP Feasibility (15%).
          </p>
        </div>

        {/* Table of Ranked Opportunities */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal border-b border-stone-200 pb-2">
            Ranked Opportunities Summary
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-300 text-charcoal-soft font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-2">Score</th>
                  <th className="py-2.5 px-2">Concept Name</th>
                  <th className="py-2.5 px-2">Opportunity Type</th>
                  <th className="py-2.5 px-2">Target Customer</th>
                  <th className="py-2.5 px-2">Complexity</th>
                  <th className="py-2.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-stone-50">
                    <td className="py-3 px-2 font-mono font-bold text-copper">{opp.totalScore}/100</td>
                    <td className="py-3 px-2 font-semibold text-charcoal">{opp.name}</td>
                    <td className="py-3 px-2 text-charcoal-muted">{formatOpportunityType(opp.opportunityType)}</td>
                    <td className="py-3 px-2 text-charcoal-muted">{opp.targetCustomer}</td>
                    <td className="py-3 px-2 font-mono">{opp.technicalComplexity}</td>
                    <td className="py-3 px-2 font-mono text-stone-600">{opp.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Concept Dossiers */}
        <div className="space-y-8 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal border-b border-stone-200 pb-2">
            Detailed Opportunity Profiles
          </h3>

          {opportunities.map((opp, idx) => (
            <div key={opp.id} className="p-6 bg-stone-50/50 rounded-xl border border-stone-200 space-y-4 break-inside-avoid">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-400">#{idx + 1}</span>
                    <h4 className="text-lg font-bold text-charcoal">{opp.name}</h4>
                  </div>
                  <p className="text-xs font-semibold text-charcoal-muted mt-0.5">{opp.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-extrabold font-mono text-copper">{opp.totalScore} pts</div>
                  <span className="text-[10px] text-charcoal-soft font-mono">{opp.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white rounded border border-stone-200">
                  <span className="font-bold text-charcoal">Friction Being Solved:</span>
                  <p className="text-charcoal-muted mt-1">{opp.problemSolved}</p>
                </div>
                <div className="p-3 bg-white rounded border border-stone-200">
                  <span className="font-bold text-charcoal">Strategic Differentiator:</span>
                  <p className="text-charcoal-muted mt-1">{opp.coreDifferentiator}</p>
                </div>
              </div>

              {/* MVP Scope & Validation Experiment */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-charcoal">MVP Feature Scope (v1.0):</span>
                <ul className="list-disc list-inside text-charcoal-muted space-y-0.5">
                  {opp.mvpFeatures.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white rounded border border-stone-200 text-xs">
                <span className="font-bold text-charcoal">48-Hour Validation Experiment:</span>
                <p className="text-charcoal-muted mt-1">{opp.validationExperiment}</p>
              </div>

              {/* Evidence Traceability Links */}
              {opp.supportingSources.length > 0 && (
                <div className="pt-2 border-t border-stone-200 text-xs space-y-1">
                  <span className="font-bold text-charcoal">Source Evidence Trail:</span>
                  <div className="space-y-1">
                    {opp.supportingSources.map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-charcoal-soft">
                        <span>•</span>
                        <a href={s.url} target="_blank" rel="noreferrer" className="text-copper hover:underline line-clamp-1">
                          {s.title} ({s.domain})
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
