import React from 'react';
import { 
  LayoutDashboard, 
  SearchCode, 
  Sparkles, 
  History, 
  Bookmark, 
  FileText, 
  Settings, 
  Compass,
  Database,
  ExternalLink
} from 'lucide-react';
import { SystemConfig } from '../../types';

interface SidebarProps {
  activeView: 'dashboard' | 'discovery' | 'opportunities' | 'history' | 'saved' | 'report';
  setActiveView: (view: 'dashboard' | 'discovery' | 'opportunities' | 'history' | 'saved' | 'report') => void;
  config: SystemConfig | null;
  onOpenSettings: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  config,
  onOpenSettings,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discovery', label: 'Problem Discovery', icon: SearchCode },
    { id: 'opportunities', label: 'Opportunities', icon: Sparkles },
    { id: 'history', label: 'Research History', icon: History },
    { id: 'saved', label: 'Saved Items', icon: Bookmark },
    { id: 'report', label: 'Executive Report', icon: FileText },
  ] as const;

  const handleNavClick = (id: typeof activeView) => {
    setActiveView(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-charcoal/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Persistent Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#F5F2EB] border-r border-stone-200 flex flex-col justify-between transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Brand Header */}
        <div>
          <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-copper flex items-center justify-center text-white shadow-sm font-semibold text-lg tracking-wider">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-charcoal leading-none">
                  Idea Miner
                </h1>
                <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-soft">
                  Opportunity Engine
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer
                    ${isActive 
                      ? 'bg-white text-copper-dark shadow-xs border border-stone-200/80 font-semibold' 
                      : 'text-charcoal-muted hover:text-charcoal hover:bg-stone-200/40'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-copper' : 'text-charcoal-soft'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & Settings */}
        <div className="p-4 border-t border-stone-200/80 space-y-3 bg-[#EFECE5]">
          {/* Connection Status Card */}
          <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-charcoal flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-charcoal-soft" /> Engine Status
              </span>
              <button
                onClick={onOpenSettings}
                className="text-copper hover:text-copper-hover hover:underline text-[11px] font-medium cursor-pointer"
              >
                Configure
              </button>
            </div>
            
            <div className="space-y-1 pt-1 border-t border-stone-100 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-soft">SerpApi Search:</span>
                <span className={config?.hasSerpApiKey ? 'text-olive font-semibold' : 'text-stone-400'}>
                  {config?.hasSerpApiKey ? 'Active' : 'Unconfigured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-soft">Gemini AI:</span>
                <span className={config?.hasGeminiKey ? 'text-olive font-semibold' : 'text-stone-400'}>
                  {config?.hasGeminiKey ? 'Active' : 'Unconfigured'}
                </span>
              </div>
            </div>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-charcoal-muted hover:text-charcoal bg-white/70 hover:bg-white border border-stone-200 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            API Keys & Providers
          </button>
        </div>
      </aside>
    </>
  );
};
