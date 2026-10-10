import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Search, Sliders, Globe, Users, Filter, Zap, HelpCircle } from 'lucide-react';
import { ResearchDepth, ResearchRequest } from '../../types';

interface DiscoveryFormProps {
  initialTopic?: string;
  onSubmit: (params: ResearchRequest) => void;
  isLoading: boolean;
  isLiveReady: boolean;
}

export const DiscoveryForm: React.FC<DiscoveryFormProps> = ({
  initialTopic = '',
  onSubmit,
  isLoading,
  isLiveReady
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [targetCustomer, setTargetCustomer] = useState('');
  const [geographicMarket, setGeographicMarket] = useState('Global');
  const [includeKeywords, setIncludeKeywords] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState('');
  const [depth, setDepth] = useState<ResearchDepth>('quick');
  const [isDemo, setIsDemo] = useState(!isLiveReady);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync initial topic when changed from outside
  React.useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onSubmit({
      topic: topic.trim(),
      targetCustomer: targetCustomer.trim() || undefined,
      geographicMarket: geographicMarket.trim() || undefined,
      includeKeywords: includeKeywords.trim() || undefined,
      excludeKeywords: excludeKeywords.trim() || undefined,
      depth,
      isDemo
    });
  };

  return (
    <Card className="border border-stone-200/90 shadow-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Topic Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
            Topic, Industry, or Domain <span className="text-copper">*</span>
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-soft" />
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Problems with cross-border freelancer invoicing"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-lg text-charcoal placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-copper focus:ring-2 focus:ring-copper/20 transition-all"
            />
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1">
            Focus on problem areas, software categories, or customer segments rather than a predefined solution.
          </p>
        </div>

        {/* Primary Row: Target Customer & Depth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-charcoal-soft" /> Target Customer / Persona (Optional)
            </label>
            <input
              type="text"
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              placeholder="e.g. Solo consultants, Remote dev teams, SMBs"
              className="w-full px-3 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-lg text-charcoal placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-copper focus:ring-2 focus:ring-copper/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-copper" /> Research Depth
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDepth('quick')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                  depth === 'quick'
                    ? 'bg-copper-light text-copper-dark border-copper font-semibold shadow-xs'
                    : 'bg-stone-50 text-charcoal-muted border-stone-200 hover:bg-stone-100'
                }`}
              >
                ⚡ Quick Scan (10-15 sources)
              </button>
              <button
                type="button"
                onClick={() => setDepth('deep')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                  depth === 'deep'
                    ? 'bg-copper-light text-copper-dark border-copper font-semibold shadow-xs'
                    : 'bg-stone-50 text-charcoal-muted border-stone-200 hover:bg-stone-100'
                }`}
              >
                🔬 Deep Research (30+ sources)
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Advanced Filters Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-medium text-copper hover:text-copper-hover hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters (Market, Keywords, Demo Mode)'}
          </button>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvanced && (
          <div className="p-4 bg-stone-50/70 border border-stone-200 rounded-lg space-y-3 animate-fade-in text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-charcoal mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-charcoal-soft" /> Geographic Market
                </label>
                <input
                  type="text"
                  value={geographicMarket}
                  onChange={(e) => setGeographicMarket(e.target.value)}
                  placeholder="e.g. US, Global, Europe"
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded focus:border-copper focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-charcoal-soft" /> Include Specific Keywords
                </label>
                <input
                  type="text"
                  value={includeKeywords}
                  onChange={(e) => setIncludeKeywords(e.target.value)}
                  placeholder="e.g. pricing, manual, bugs"
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded focus:border-copper focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Exclude Keywords
              </label>
              <input
                type="text"
                value={excludeKeywords}
                onChange={(e) => setExcludeKeywords(e.target.value)}
                placeholder="e.g. beginner, tutorial, student"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded focus:border-copper focus:outline-none"
              />
            </div>

            {/* Mode selection toggle */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-charcoal">Execution Mode:</span>
                <p className="text-[11px] text-charcoal-muted">
                  {isDemo ? 'Using deterministic illustrative dataset (no API keys consumed).' : 'Using live SerpApi search queries and Gemini API synthesis.'}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-charcoal">
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="rounded border-stone-300 text-copper focus:ring-copper cursor-pointer"
                />
                Force Demo Mode
              </label>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            icon={<Search className="w-4 h-4" />}
            className="w-full sm:w-auto font-semibold px-6"
          >
            {isLoading ? 'Mining Market Friction...' : 'Launch Problem Discovery'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
