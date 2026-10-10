import React from 'react';
import { Card } from '../common/Card';
import { Clock, Search, Sparkles, CheckCircle } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

interface ActivityFeedProps {
  activities: {
    id: string;
    type: 'research' | 'opportunity' | 'status_change';
    title: string;
    timestamp: string;
    badge?: string;
  }[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <Clock className="w-4 h-4 text-copper" /> Recent Research & Discovery Activity
          </h3>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Audit log of web mining sessions and newly synthesized concepts
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="py-6 text-center text-xs text-charcoal-muted">
          No recent activity logged yet.
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {activities.map((act) => {
            const isResearch = act.type === 'research';
            return (
              <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                    isResearch ? 'bg-stone-100 text-charcoal-soft' : 'bg-copper-light text-copper'
                  }`}>
                    {isResearch ? <Search className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">
                      {act.title}
                    </p>
                    <span className="text-[11px] text-charcoal-soft">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                </div>

                {act.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                    act.badge.includes('Demo') ? 'bg-stone-100 text-stone-600 border border-stone-200' :
                    act.badge.includes('Live') ? 'bg-olive-light text-olive-dark border border-olive-border' :
                    'bg-copper-light text-copper-dark border border-copper-border'
                  }`}>
                    {act.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
