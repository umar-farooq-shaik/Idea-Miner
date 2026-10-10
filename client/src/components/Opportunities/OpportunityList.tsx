import React, { useState, useMemo } from 'react';
import { OpportunityRecord, OpportunityStatus } from '../../types';
import { OpportunityCard } from './OpportunityCard';
import { Search, Download, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { api } from '../../services/api';

interface OpportunityListProps {
  opportunities: OpportunityRecord[];
  onSelectOpportunity: (opportunity: OpportunityRecord) => void;
  onToggleSaveOpportunity: (id: string, isSaved: boolean) => void;
  onStatusChange: (id: string, status: OpportunityStatus) => void;
  onInspectScore: (opportunity: OpportunityRecord) => void;
  onNavigateToDiscovery: () => void;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({
  opportunities,
  onSelectOpportunity,
  onToggleSaveOpportunity,
  onStatusChange,
  onInspectScore,
  onNavigateToDiscovery
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'date_desc' | 'complexity'>('score_desc');

  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const match = 
            opp.name.toLowerCase().includes(q) ||
            opp.description.toLowerCase().includes(q) ||
            opp.problemSolved.toLowerCase().includes(q) ||
            opp.targetCustomer.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Status
        if (statusFilter !== 'all' && opp.status !== statusFilter) {
          return false;
        }

        // Type
        if (typeFilter !== 'all' && opp.opportunityType !== typeFilter) {
          return false;
        }

        // Min score
        if (opp.totalScore < minScore) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score_desc') return b.totalScore - a.totalScore;
        if (sortBy === 'score_asc') return a.totalScore - b.totalScore;
        if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'complexity') {
          const map: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
          return (map[a.technicalComplexity] || 2) - (map[b.technicalComplexity] || 2);
        }
        return 0;
      });
  }, [opportunities, searchTerm, statusFilter, typeFilter, minScore, sortBy]);

  const handleExportCsv = () => {
    window.open(api.getOpportunitiesExportUrl(), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-lg font-bold text-charcoal">
            Synthesized Opportunities ({filteredOpportunities.length})
          </h2>
          <p className="text-xs text-charcoal-muted">
            Ranked by transparent multi-factor viability scoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5 text-copper" />}
            className="text-xs"
          >
            Export Opportunities (CSV)
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToDiscovery}
            icon={<Sparkles className="w-3.5 h-3.5" />}
            className="text-xs font-semibold"
          >
            Mine More Ideas
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-stone-200/90 rounded-xl shadow-card space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-soft" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by concept name, problem, customer, or keywords..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg text-charcoal focus:outline-none focus:border-copper focus:ring-1 focus:ring-copper/20"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-soft mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded text-charcoal focus:outline-none focus:border-copper"
            >
              <option value="all">All Statuses</option>
              <option value="Discovered">Discovered</option>
              <option value="Researching">Researching</option>
              <option value="Validating">Validating</option>
              <option value="Building">Building</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Opportunity Type Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-soft mb-1">
              Opportunity Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded text-charcoal focus:outline-none focus:border-copper"
            >
              <option value="all">All Types</option>
              <option value="new_product">New Standalone Product</option>
              <option value="better_alternative">Better Alternative</option>
              <option value="underserved_segment">Underserved Segment</option>
              <option value="missing_feature">Missing Feature</option>
              <option value="workflow_automation">Workflow Automation</option>
              <option value="niche_adaptation">Niche Adaptation</option>
            </select>
          </div>

          {/* Min Score Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-soft mb-1">
              Min Score: {minScore > 0 ? `${minScore}+` : 'Any'}
            </label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded text-charcoal focus:outline-none focus:border-copper"
            >
              <option value={0}>All Scores (0–100)</option>
              <option value={70}>70+ (Promising)</option>
              <option value={80}>80+ (High Conviction)</option>
              <option value={85}>85+ (Top Tier)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-soft mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded text-charcoal focus:outline-none focus:border-copper"
            >
              <option value="score_desc">Highest Score First</option>
              <option value="score_asc">Lowest Score First</option>
              <option value="date_desc">Newest Discovered</option>
              <option value="complexity">Lowest Complexity First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Opportunities */}
      {filteredOpportunities.length === 0 ? (
        <div className="py-16 text-center bg-white border border-stone-200 rounded-xl p-8 space-y-3 shadow-card">
          <Sparkles className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-charcoal">No Opportunities Match Your Filters</h3>
          <p className="text-xs text-charcoal-muted max-w-md mx-auto">
            Try adjusting your search query, lowering the minimum score filter, or launching a new problem discovery scan.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); setTypeFilter('all'); setMinScore(0); }}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOpportunities.map((opp) => (
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
  );
};
