import React from 'react';
import { ProblemRecord } from '../../types';
import { ProblemCard } from './ProblemCard';
import { AlertCircle, Filter } from 'lucide-react';

interface ProblemsListProps {
  problems: ProblemRecord[];
  onToggleSaveProblem: (id: string, isSaved: boolean) => void;
}

export const ProblemsList: React.FC<ProblemsListProps> = ({ problems, onToggleSaveProblem }) => {
  if (problems.length === 0) {
    return (
      <div className="py-12 text-center bg-white border border-stone-200 rounded-xl p-8 space-y-3 shadow-card">
        <AlertCircle className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="text-base font-bold text-charcoal">No Problems Discovered Yet</h3>
        <p className="text-xs text-charcoal-muted max-w-md mx-auto">
          Submit a research topic above to trigger our web-mining crawler and Gemini intelligence engine.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-stone-200">
        <div>
          <h3 className="text-base font-bold text-charcoal">
            Validated Problem Clusters ({problems.length})
          </h3>
          <p className="text-xs text-charcoal-muted">
            Ground-truth friction extracted from public Reddit, review, and forum discussions
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {problems.map((problem) => (
          <ProblemCard
            key={problem.id}
            problem={problem}
            onToggleSave={onToggleSaveProblem}
          />
        ))}
      </div>
    </div>
  );
};
