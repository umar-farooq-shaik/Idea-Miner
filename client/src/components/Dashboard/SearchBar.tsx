import React, { useState } from 'react';
import { Search, ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from '../common/Button';

interface SearchBarProps {
  onSearch: (topic: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const suggestedQueries = [
    'Problems people face with AI coding tools',
    'Complaints about existing project management software',
    'Pain points experienced by small business owners',
    'Problems developers repeatedly encounter with APIs',
    'Underserved needs in student productivity tools'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-card space-y-4">
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-charcoal tracking-tight">
          Unearth Unaddressed Market Opportunities
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-muted">
          Enter an industry, audience, or tool category to mine Reddit discussions, verified reviews, and public forums for real pain points.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-soft" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Problems with cross-border freelancer invoicing..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50/60 border border-stone-300 rounded-lg text-charcoal placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-copper focus:ring-2 focus:ring-copper/20 transition-all"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={<ArrowRight className="w-4 h-4" />}
          className="whitespace-nowrap font-semibold"
        >
          Mine Problems
        </Button>
      </form>

      {/* Suggested Search Query Pills */}
      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-charcoal-soft flex items-center gap-1.5 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-copper" /> Suggested:
        </span>
        {suggestedQueries.map((suggested, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSearch(suggested)}
            className="text-xs bg-stone-100 hover:bg-stone-200/80 text-charcoal-muted hover:text-charcoal px-2.5 py-1 rounded-md transition-colors text-left border border-stone-200/60 cursor-pointer"
          >
            {suggested}
          </button>
        ))}
      </div>
    </div>
  );
};
