import React from 'react';
import { Menu, Plus, Key, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { SystemConfig } from '../../types';
import { Button } from '../common/Button';

interface HeaderProps {
  activeView: string;
  config: SystemConfig | null;
  onOpenSettings: () => void;
  onStartNewResearch: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  config,
  onOpenSettings,
  onStartNewResearch,
  onToggleMobileMenu
}) => {
  const viewTitles: Record<string, string> = {
    dashboard: 'Intelligence Dashboard',
    discovery: 'Problem Discovery Engine',
    opportunities: 'Opportunity Discovery & Ranking',
    history: 'Research History',
    saved: 'Saved Problems & Opportunities',
    report: 'Executive Opportunity Report'
  };

  const isLiveReady = Boolean(config?.hasSerpApiKey && config?.hasGeminiKey);

  return (
    <header className="sticky top-0 z-30 bg-[#F9F7F2]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 transition-all no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-charcoal hover:bg-stone-200/60 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <span className="text-xs font-mono text-charcoal-soft uppercase tracking-wider hidden sm:inline-block">
              Idea Miner
            </span>
            <h2 className="text-base sm:text-lg font-bold text-charcoal tracking-tight">
              {viewTitles[activeView] || 'Intelligence Workspace'}
            </h2>
          </div>
        </div>

        {/* Right: Engine Mode Badge & Action buttons */}
        <div className="flex items-center gap-3">
          {/* Mode Badge */}
          {isLiveReady ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-olive-light border border-olive-border text-olive-dark text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Live Engine Ready</span>
            </div>
          ) : (
            <div 
              onClick={onOpenSettings}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium cursor-pointer hover:bg-amber-100 transition-colors"
              title="Click to configure API credentials"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo Mode Active</span>
            </div>
          )}

          {/* Quick API Key shortcut button
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            icon={<Key className="w-3.5 h-3.5 text-stone-500" />}
            className="hidden md:inline-flex text-xs"
          >
            API Settings
          </Button> */}

          {/* New Research trigger */}
          <Button
            variant="primary"
            size="sm"
            onClick={onStartNewResearch}
            icon={<Plus className="w-4 h-4" />}
            className="text-xs font-semibold"
          >
            New Research
          </Button>
        </div>
      </div>
    </header>
  );
};
