import React, { useState, useEffect, useCallback } from 'react';
import { 
  SystemConfig, 
  DashboardStats, 
  OpportunityRecord, 
  ProblemRecord, 
  ResearchRecord, 
  ResearchRequest,
  OpportunityStatus 
} from './types';
import { api } from './services/api';
import { ToastProvider, useToast } from './components/common/Toast';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { ApiKeyModal } from './components/Layout/ApiKeyModal';

// Views
import { MetricCards } from './components/Dashboard/MetricCards';
import { SearchBar } from './components/Dashboard/SearchBar';
import { TrendingCategories } from './components/Dashboard/TrendingCategories';
import { HighPriorityOpportunities } from './components/Dashboard/HighPriorityOpportunities';
import { ActivityFeed } from './components/Dashboard/ActivityFeed';

import { DiscoveryForm } from './components/Discovery/DiscoveryForm';
import { ResearchProgress } from './components/Discovery/ResearchProgress';
import { ProblemsList } from './components/Discovery/ProblemsList';

import { OpportunityList } from './components/Opportunities/OpportunityList';
import { OpportunityDetailDrawer } from './components/Opportunities/OpportunityDetailDrawer';
import { ScoreBreakdownModal } from './components/Opportunities/ScoreBreakdownModal';

import { HistoryList } from './components/History/HistoryList';
import { SavedItemsView } from './components/History/SavedItemsView';
import { PrintableReport } from './components/Report/PrintableReport';

type ActiveView = 'dashboard' | 'discovery' | 'opportunities' | 'history' | 'saved' | 'report';

const MainApp: React.FC = () => {
  const { success, error, info } = useToast();

  // Navigation & Modal states
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data states
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [researches, setResearches] = useState<ResearchRecord[]>([]);
  const [savedProblems, setSavedProblems] = useState<ProblemRecord[]>([]);

  // Active Research Scan state
  const [activeResearch, setActiveResearch] = useState<ResearchRecord | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [activeResearchParams, setActiveResearchParams] = useState<ResearchRequest | null>(null);
  const [discoveryInitialTopic, setDiscoveryInitialTopic] = useState('');

  // Selected Detail Opportunity state
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityRecord | null>(null);
  const [scoreModalOpp, setScoreModalOpp] = useState<OpportunityRecord | null>(null);

  // Initial Data Fetch
  const loadInitialData = useCallback(async () => {
    try {
      const [cfg, st, opps, resList, savedProbs] = await Promise.all([
        api.getConfig(),
        api.getStats(),
        api.getOpportunities({ isArchived: false }),
        api.getResearches(),
        api.getSavedProblems()
      ]);
      setConfig(cfg);
      setStats(st);
      setOpportunities(opps);
      setResearches(resList);
      setSavedProblems(savedProbs);

      // If researches exist, set active research to the most recent one
      if (resList.length > 0 && !activeResearch) {
        const latest = await api.getResearch(resList[0].id);
        setActiveResearch(latest);
      }
    } catch (err: unknown) {
      console.error('Failed to load initial workspace data:', err);
      error('Backend connection issue', 'Make sure the Idea Miner server is running on port 5000.');
    }
  }, [activeResearch, error]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handler: Start New Research Scan
  const handleStartResearch = async (params: ResearchRequest) => {
    setIsResearching(true);
    setActiveResearchParams(params);
    try {
      const result = await api.createResearch(params);
      setActiveResearch(result);
      success(
        result.isDemo ? 'Sample Research Complete' : 'Live Research Complete',
        `Discovered ${result.problems?.length || 0} problem clusters and ${result.opportunities?.length || 0} opportunities.`
      );
      // Reload opportunities and stats
      const [updatedOpps, updatedStats, updatedResearches] = await Promise.all([
        api.getOpportunities({ isArchived: false }),
        api.getStats(),
        api.getResearches()
      ]);
      setOpportunities(updatedOpps);
      setStats(updatedStats);
      setResearches(updatedResearches);
      setActiveView('discovery');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Missing required API credentials')) {
        setIsSettingsOpen(true);
      }
      error('Research Failed', msg);
    } finally {
      setIsResearching(false);
      setActiveResearchParams(null);
    }
  };

  // Handler: Search from Dashboard SearchBar
  const handleSearchFromDashboard = (queryTopic: string) => {
    setDiscoveryInitialTopic(queryTopic);
    setActiveView('discovery');
  };

  // Handler: Update Opportunity Status
  const handleStatusChange = async (id: string, newStatus: OpportunityStatus) => {
    try {
      const updated = await api.updateOpportunityStatus(id, newStatus);
      setOpportunities(prev => prev.map(o => o.id === id ? updated : o));
      if (selectedOpportunity && selectedOpportunity.id === id) {
        setSelectedOpportunity(updated);
      }
      success('Status Updated', `Opportunity status changed to "${newStatus}".`);
      api.getStats().then(setStats);
    } catch (err: unknown) {
      error('Failed to update status', err instanceof Error ? err.message : String(err));
    }
  };

  // Handler: Bookmark Opportunity
  const handleToggleSaveOpp = async (id: string, isSaved: boolean) => {
    try {
      const updated = await api.toggleSaveOpportunity(id, isSaved);
      setOpportunities(prev => prev.map(o => o.id === id ? updated : o));
      if (selectedOpportunity && selectedOpportunity.id === id) {
        setSelectedOpportunity(updated);
      }
      success(isSaved ? 'Opportunity Saved' : 'Bookmark Removed');
    } catch (err: unknown) {
      error('Failed to update bookmark', err instanceof Error ? err.message : String(err));
    }
  };

  // Handler: Archive Opportunity
  const handleToggleArchiveOpp = async (id: string, isArchived: boolean) => {
    try {
      const updated = await api.toggleArchiveOpportunity(id, isArchived);
      setOpportunities(prev => prev.filter(o => o.id !== id));
      if (selectedOpportunity && selectedOpportunity.id === id) {
        setSelectedOpportunity(null);
      }
      success(isArchived ? 'Opportunity Archived' : 'Unarchived');
      api.getStats().then(setStats);
    } catch (err: unknown) {
      error('Failed to update archive state', err instanceof Error ? err.message : String(err));
    }
  };

  // Handler: Bookmark Problem
  const handleToggleSaveProb = async (id: string, isSaved: boolean) => {
    try {
      const updated = await api.toggleSaveProblem(id, isSaved);
      // Update in active research if present
      if (activeResearch && activeResearch.problems) {
        setActiveResearch({
          ...activeResearch,
          problems: activeResearch.problems.map(p => p.id === id ? updated : p)
        });
      }
      // Update in saved problems list
      const updatedSavedProbs = await api.getSavedProblems();
      setSavedProblems(updatedSavedProbs);
      success(isSaved ? 'Problem Bookmarked' : 'Problem Unsaved');
    } catch (err: unknown) {
      error('Failed to update problem bookmark', err instanceof Error ? err.message : String(err));
    }
  };

  // Handler: Reopen Research from History
  const handleReopenResearch = async (id: string) => {
    try {
      const full = await api.getResearch(id);
      setActiveResearch(full);
      setActiveView('discovery');
      info(`Loaded research: "${full.topic}"`);
    } catch (err: unknown) {
      error('Failed to open research session', err instanceof Error ? err.message : String(err));
    }
  };

  // Handler: Delete Research from History
  const handleDeleteResearch = async (id: string) => {
    if (!window.confirm('Delete this research session and its associated problem records?')) return;
    try {
      await api.deleteResearch(id);
      setResearches(prev => prev.filter(r => r.id !== id));
      if (activeResearch && activeResearch.id === id) {
        setActiveResearch(null);
      }
      // Refresh opportunities & stats
      const [opps, st] = await Promise.all([
        api.getOpportunities({ isArchived: false }),
        api.getStats()
      ]);
      setOpportunities(opps);
      setStats(st);
      success('Research Deleted');
    } catch (err: unknown) {
      error('Failed to delete research', err instanceof Error ? err.message : String(err));
    }
  };

  const savedOpportunities = opportunities.filter(o => o.isSaved);
  const isLiveReady = Boolean(config?.hasSerpApiKey && config?.hasGeminiKey);

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-charcoal flex">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        config={config}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen transition-all">
        {/* Header */}
        <Header
          activeView={activeView}
          config={config}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onStartNewResearch={() => { setDiscoveryInitialTopic(''); setActiveView('discovery'); }}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* View Routing Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* 1. DASHBOARD VIEW */}
          {activeView === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Metrics */}
              <MetricCards stats={stats} isLoading={!stats} />

              {/* Prominent Search Bar with Suggestions */}
              <SearchBar onSearch={handleSearchFromDashboard} />

              {/* Middle Row: Trending Categories & High Priority Opportunities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendingCategories categories={stats?.trendingCategories || []} />
                <HighPriorityOpportunities
                  opportunities={opportunities}
                  onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
                  onViewAll={() => setActiveView('opportunities')}
                />
              </div>

              {/* Bottom Row: Recent Activity Feed */}
              <ActivityFeed activities={stats?.recentActivity || []} />
            </div>
          )}

          {/* 2. PROBLEM DISCOVERY VIEW */}
          {activeView === 'discovery' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-stone-200 pb-2">
                <h2 className="text-lg font-bold text-charcoal">
                  Problem Discovery Engine
                </h2>
                <p className="text-xs text-charcoal-muted">
                  Mine unfiltered user complaints, workarounds, and unmet needs from Reddit, forums, and reviews.
                </p>
              </div>

              {/* Discovery Input Form */}
              <DiscoveryForm
                initialTopic={discoveryInitialTopic}
                onSubmit={handleStartResearch}
                isLoading={isResearching}
                isLiveReady={isLiveReady}
              />

              {/* Live Research Progress Visualizer */}
              {isResearching && activeResearchParams && (
                <ResearchProgress
                  topic={activeResearchParams.topic}
                  depth={activeResearchParams.depth}
                  isDemo={activeResearchParams.isDemo}
                />
              )}

              {/* Discovered Problems Cluster List */}
              {activeResearch && activeResearch.problems && !isResearching && (
                <div className="space-y-6 pt-4">
                  <div className="p-4 bg-white border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-soft">Active Session</span>
                      <h3 className="text-base font-bold text-charcoal">{activeResearch.topic}</h3>
                      <p className="text-xs text-charcoal-muted font-mono mt-0.5">
                        {activeResearch.isDemo ? 'Sample Research Run' : 'Live SerpApi & Gemini Web Scan'} • {activeResearch.problems.length} problems discovered
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveView('opportunities')}
                      className="px-4 py-2 bg-copper text-white rounded-lg text-xs font-semibold hover:bg-copper-hover transition-colors shrink-0 cursor-pointer"
                    >
                      View Generated Opportunities →
                    </button>
                  </div>

                  <ProblemsList
                    problems={activeResearch.problems}
                    onToggleSaveProblem={handleToggleSaveProb}
                  />
                </div>
              )}
            </div>
          )}

          {/* 3. OPPORTUNITIES VIEW */}
          {activeView === 'opportunities' && (
            <div className="animate-fade-in">
              <OpportunityList
                opportunities={opportunities}
                onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
                onToggleSaveOpportunity={handleToggleSaveOpp}
                onStatusChange={handleStatusChange}
                onInspectScore={(opp) => setScoreModalOpp(opp)}
                onNavigateToDiscovery={() => setActiveView('discovery')}
              />
            </div>
          )}

          {/* 4. HISTORY VIEW */}
          {activeView === 'history' && (
            <div className="animate-fade-in">
              <HistoryList
                researches={researches}
                onReopenResearch={handleReopenResearch}
                onDeleteResearch={handleDeleteResearch}
              />
            </div>
          )}

          {/* 5. SAVED ITEMS VIEW */}
          {activeView === 'saved' && (
            <div className="animate-fade-in">
              <SavedItemsView
                savedOpportunities={savedOpportunities}
                savedProblems={savedProblems}
                onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
                onToggleSaveOpportunity={handleToggleSaveOpp}
                onToggleSaveProblem={handleToggleSaveProb}
                onStatusChange={handleStatusChange}
                onInspectScore={(opp) => setScoreModalOpp(opp)}
              />
            </div>
          )}

          {/* 6. REPORT VIEW */}
          {activeView === 'report' && (
            <div className="animate-fade-in">
              <PrintableReport
                opportunities={opportunities}
                onBack={() => setActiveView('opportunities')}
              />
            </div>
          )}
        </main>
      </div>

      {/* Detail Slide-Over Drawer */}
      <OpportunityDetailDrawer
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onStatusChange={handleStatusChange}
        onToggleSave={handleToggleSaveOpp}
        onToggleArchive={handleToggleArchiveOpp}
        onInspectScore={(opp) => setScoreModalOpp(opp)}
        onOpportunityUpdated={(updated) => {
          setSelectedOpportunity(updated);
          setOpportunities(prev => prev.map(o => o.id === updated.id ? updated : o));
        }}
      />

      {/* Transparent Score Breakdown Modal */}
      <ScoreBreakdownModal
        isOpen={Boolean(scoreModalOpp)}
        onClose={() => setScoreModalOpp(null)}
        opportunity={scoreModalOpp}
      />

      {/* API Key & Engine Config Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigUpdated={loadInitialData}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
};

export default App;
