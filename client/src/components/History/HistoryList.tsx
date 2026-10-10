import React from 'react';
import { ResearchRecord } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  History, 
  ExternalLink, 
  Trash2, 
  Download, 
  Search, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { api } from '../../services/api';

interface HistoryListProps {
  researches: ResearchRecord[];
  onReopenResearch: (id: string) => void;
  onDeleteResearch: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  researches,
  onReopenResearch,
  onDeleteResearch
}) => {
  const handleExportResearch = (id: string) => {
    window.open(api.getResearchExportUrl(id), '_blank');
  };

  if (researches.length === 0) {
    return (
      <div className="py-16 text-center bg-white border border-stone-200 rounded-xl p-8 space-y-3 shadow-card">
        <History className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="text-base font-bold text-charcoal">No Research Sessions Logged</h3>
        <p className="text-xs text-charcoal-muted max-w-md mx-auto">
          Start a discovery query to build your research log and evidence database.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-lg font-bold text-charcoal">
            Research History ({researches.length})
          </h2>
          <p className="text-xs text-charcoal-muted">
            Inspect past problem discovery scans, reopened sessions, and exported datasets
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {researches.map((r) => (
          <Card key={r.id} className="p-4 border border-stone-200 hover:border-stone-300 transition-all shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-charcoal">
                    {r.topic}
                  </h3>
                  {r.isDemo ? (
                    <Badge variant="stone" size="sm">Sample</Badge>
                  ) : (
                    <Badge variant="olive" size="sm">Live Web</Badge>
                  )}
                  <Badge variant={r.status === 'completed' ? 'olive' : r.status === 'failed' ? 'danger' : 'warning'} size="sm">
                    {r.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-soft font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {formatDate(r.createdAt)} ({formatRelativeTime(r.createdAt)})
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-stone-400" />
                    {r.totalProblemsCount ?? 0} problems
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-copper" />
                    {r.totalOpportunitiesCount ?? 0} opportunities
                  </span>
                  <span>
                    Depth: <strong>{r.depth}</strong>
                  </span>
                </div>

                {r.targetCustomer && (
                  <p className="text-xs text-charcoal-muted">
                    Target audience: <span className="text-charcoal font-medium">{r.targetCustomer}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportResearch(r.id)}
                  icon={<Download className="w-3.5 h-3.5 text-stone-600" />}
                  className="text-xs"
                  title="Export raw research evidence and problems as CSV"
                >
                  CSV
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onReopenResearch(r.id)}
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold"
                >
                  Reopen
                </Button>

                <button
                  onClick={() => onDeleteResearch(r.id)}
                  className="p-1.5 rounded text-stone-400 hover:text-red-700 hover:bg-stone-100 cursor-pointer"
                  title="Delete research session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
