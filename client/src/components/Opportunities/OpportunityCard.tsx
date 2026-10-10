import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ScoreBadge } from './ScoreBadge';
import { 
  Bookmark, 
  ArrowRight, 
  Users, 
  Zap, 
  ExternalLink,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { OpportunityRecord, OpportunityStatus } from '../../types';
import { formatOpportunityType } from '../../utils/formatters';

interface OpportunityCardProps {
  opportunity: OpportunityRecord;
  onSelect: (opportunity: OpportunityRecord) => void;
  onToggleSave: (id: string, isSaved: boolean) => void;
  onStatusChange: (id: string, status: OpportunityStatus) => void;
  onInspectScore: (opportunity: OpportunityRecord) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onToggleSave,
  onStatusChange,
  onInspectScore
}) => {
  const statusOptions: OpportunityStatus[] = [
    'Discovered',
    'Researching',
    'Validating',
    'Building',
    'Rejected'
  ];

  return (
    <Card 
      hoverable 
      className="flex flex-col justify-between border border-stone-200/90 hover:border-copper/40 transition-all cursor-pointer group"
      onClick={() => onSelect(opportunity)}
    >
      <div className="space-y-3">
        {/* Top Header: Score, Status & Bookmark */}
        <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <ScoreBadge
              score={opportunity.totalScore}
              onClick={() => onInspectScore(opportunity)}
              size="sm"
            />
            {opportunity.isDemo ? (
              <Badge variant="stone" size="sm">Sample</Badge>
            ) : (
              <Badge variant="olive" size="sm">Live Verified</Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Status Dropdown */}
            <select
              value={opportunity.status}
              onChange={(e) => onStatusChange(opportunity.id, e.target.value as OpportunityStatus)}
              className="text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 font-medium text-charcoal focus:outline-none focus:border-copper cursor-pointer"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Save / Bookmark Button */}
            <button
              onClick={() => onToggleSave(opportunity.id, !opportunity.isSaved)}
              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                opportunity.isSaved 
                  ? 'bg-copper text-white border-copper' 
                  : 'bg-white text-stone-400 hover:text-charcoal border-stone-200'
              }`}
              title={opportunity.isSaved ? 'Remove from saved' : 'Save opportunity'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Opportunity Name & Type */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-base font-bold text-charcoal group-hover:text-copper transition-colors">
              {opportunity.name}
            </h3>
            <span className="text-[11px] font-mono text-charcoal-soft shrink-0">
              {opportunity.technicalComplexity} complexity
            </span>
          </div>

          <div className="mt-1">
            <Badge variant="outline" size="sm" className="text-[10px] bg-stone-50/50">
              {formatOpportunityType(opportunity.opportunityType)}
            </Badge>
          </div>

          <p className="text-xs text-charcoal leading-relaxed mt-2 line-clamp-2">
            {opportunity.description}
          </p>
        </div>

        {/* Key Attributes */}
        <div className="p-3 bg-stone-50/70 rounded-lg border border-stone-200/80 space-y-1.5 text-xs">
          <div className="line-clamp-1">
            <span className="font-semibold text-charcoal">Friction: </span>
            <span className="text-charcoal-muted">{opportunity.problemSolved}</span>
          </div>
          <div className="line-clamp-1">
            <span className="font-semibold text-charcoal">Differentiator: </span>
            <span className="text-charcoal-muted">{opportunity.coreDifferentiator}</span>
          </div>
          <div className="line-clamp-1">
            <span className="font-semibold text-charcoal">Target: </span>
            <span className="text-charcoal-muted">{opportunity.targetCustomer}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Sources Count & View Details CTA */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-charcoal-soft">
        <span className="font-mono text-[11px]">
          {opportunity.supportingSources.length} traceable {opportunity.supportingSources.length === 1 ? 'source' : 'sources'}
        </span>
        <span className="font-semibold text-copper group-hover:underline flex items-center gap-1">
          Inspect Details <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Card>
  );
};
