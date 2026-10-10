import React from 'react';
import { Card } from '../common/Card';
import { AlertCircle, Repeat, Sparkles, SearchCheck } from 'lucide-react';
import { DashboardStats } from '../../types';

interface MetricCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      label: 'Problems Discovered',
      value: stats?.totalProblems ?? 0,
      description: 'Documented friction points',
      icon: AlertCircle,
      accent: 'border-l-copper'
    },
    {
      label: 'Recurring Complaints',
      value: stats?.recurringComplaints ?? 0,
      description: 'High/Medium pattern recurrence',
      icon: Repeat,
      accent: 'border-l-olive'
    },
    {
      label: 'Potential Opportunities',
      value: stats?.potentialOpportunities ?? 0,
      description: 'Evidence-backed concepts',
      icon: Sparkles,
      accent: 'border-l-amber-600'
    },
    {
      label: 'Completed Searches',
      value: stats?.completedSearches ?? 0,
      description: 'Historical research runs',
      icon: SearchCheck,
      accent: 'border-l-stone-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className={`p-4.5 border-l-4 ${c.accent} flex items-center justify-between`}>
            <div>
              <p className="text-xs font-semibold text-charcoal-soft uppercase tracking-wider">
                {c.label}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                {isLoading ? (
                  <div className="h-7 w-16 bg-stone-200 animate-pulse rounded"></div>
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight font-mono">
                    {c.value}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-charcoal-muted mt-1">
                {c.description}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-100 text-charcoal-soft shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
