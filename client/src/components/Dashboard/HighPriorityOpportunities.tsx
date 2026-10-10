import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { OpportunityRecord } from '../../types';
import { getScoreColors } from '../../utils/formatters';

interface HighPriorityOpportunitiesProps {
  opportunities: OpportunityRecord[];
  onSelectOpportunity: (opportunity: OpportunityRecord) => void;
  onViewAll: () => void;
}

export const HighPriorityOpportunities: React.FC<HighPriorityOpportunitiesProps> = ({
  opportunities,
  onSelectOpportunity,
  onViewAll
}) => {
  const topOpportunities = opportunities.slice(0, 4);

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-copper" /> High-Priority Opportunities
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Strongest evidence recurrence and willingness to pay
            </p>
          </div>
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-copper hover:text-copper-hover hover:underline flex items-center gap-1 cursor-pointer"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {topOpportunities.length === 0 ? (
          <div className="py-8 text-center text-xs text-charcoal-muted">
            No opportunities recorded yet. Run a problem discovery scan above!
          </div>
        ) : (
          <div className="space-y-3">
            {topOpportunities.map((opp) => {
              const scoreColors = getScoreColors(opp.totalScore);
              return (
                <div
                  key={opp.id}
                  onClick={() => onSelectOpportunity(opp)}
                  className="p-3 rounded-lg border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-copper/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-charcoal group-hover:text-copper transition-colors">
                          {opp.name}
                        </h4>
                        {opp.isDemo ? (
                          <Badge variant="stone" size="sm" className="text-[10px]">Sample</Badge>
                        ) : (
                          <Badge variant="olive" size="sm" className="text-[10px]">Verified Live</Badge>
                        )}
                        <span className="text-[10px] text-charcoal-soft font-mono">
                          {opp.status}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-muted line-clamp-1">
                        {opp.description}
                      </p>
                      <p className="text-[11px] text-charcoal-soft font-medium">
                        Target: <span className="text-charcoal">{opp.targetCustomer}</span>
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className={`inline-flex flex-col items-center justify-center px-2 py-1 rounded font-mono font-bold text-xs ${scoreColors.bg} ${scoreColors.text} border ${scoreColors.border}`}>
                        <span>{opp.totalScore}</span>
                        <span className="text-[9px] font-sans font-normal opacity-75">/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-charcoal-soft">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-olive" /> Grounded in verifiable customer quotes
        </span>
      </div>
    </Card>
  );
};
