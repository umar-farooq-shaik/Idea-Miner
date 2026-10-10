import React, { useState } from 'react';
import { OpportunityRecord, ProblemRecord, OpportunityStatus } from '../../types';
import { OpportunityCard } from '../Opportunities/OpportunityCard';
import { ProblemCard } from '../Discovery/ProblemCard';
import { Bookmark, Download, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { api } from '../../services/api';

interface SavedItemsViewProps {
  savedOpportunities: OpportunityRecord[];
  savedProblems: ProblemRecord[];
  onSelectOpportunity: (opportunity: OpportunityRecord) => void;
  onToggleSaveOpportunity: (id: string, isSaved: boolean) => void;
  onToggleSaveProblem: (id: string, isSaved: boolean) => void;
  onStatusChange: (id: string, status: OpportunityStatus) => void;
  onInspectScore: (opportunity: OpportunityRecord) => void;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  savedOpportunities,
  savedProblems,
  onSelectOpportunity,
  onToggleSaveOpportunity,
  onToggleSaveProblem,
  onStatusChange,
  onInspectScore
}) => {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'problems'>('opportunities');

  const handleExportSavedOpps = () => {
    window.open(`${api.getOpportunitiesExportUrl()}?isSaved=true`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-copper" /> Bookmarked & Saved Research
          </h2>
          <p className="text-xs text-charcoal-muted">
            Curated list of high-potential startup opportunities and verified market friction points
          </p>
        </div>

        {activeTab === 'opportunities' && savedOpportunities.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSavedOpps}
            icon={<Download className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Export Saved Opportunities (CSV)
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'opportunities'
              ? 'bg-copper text-white shadow-xs'
              : 'bg-stone-100 text-charcoal-muted hover:bg-stone-200/60'
          }`}
        >
          Saved Opportunities ({savedOpportunities.length})
        </button>

        <button
          onClick={() => setActiveTab('problems')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'problems'
              ? 'bg-copper text-white shadow-xs'
              : 'bg-stone-100 text-charcoal-muted hover:bg-stone-200/60'
          }`}
        >
          Saved Problem Statements ({savedProblems.length})
        </button>
      </div>

      {/* Tab 1: Saved Opportunities */}
      {activeTab === 'opportunities' && (
        <div>
          {savedOpportunities.length === 0 ? (
            <div className="py-16 text-center bg-white border border-stone-200 rounded-xl p-8 space-y-3 shadow-card">
              <Sparkles className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-charcoal">No Opportunities Bookmarked Yet</h3>
              <p className="text-xs text-charcoal-muted max-w-md mx-auto">
                Click the bookmark icon on any opportunity card to save it for quick reference and tracking.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedOpportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onSelect={onSelectOpportunity}
                  onToggleSave={onToggleSaveOpportunity}
                  onStatusChange={onStatusChange}
                  onInspectScore={onInspectScore}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Problems */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          {savedProblems.length === 0 ? (
            <div className="py-16 text-center bg-white border border-stone-200 rounded-xl p-8 space-y-3 shadow-card">
              <AlertCircle className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-charcoal">No Problem Records Bookmarked</h3>
              <p className="text-xs text-charcoal-muted max-w-md mx-auto">
                Bookmark specific customer complaints and pain-point clusters in Discovery to track them here.
              </p>
            </div>
          ) : (
            savedProblems.map((prob) => (
              <ProblemCard
                key={prob.id}
                problem={prob}
                onToggleSave={onToggleSaveProblem}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
