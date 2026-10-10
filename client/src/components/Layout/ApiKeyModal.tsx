import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Key, ExternalLink, Check, AlertTriangle, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { getCustomCredentials, saveCustomCredentials, api } from '../../services/api';
import { SystemConfig } from '../../types';
import { useToast } from '../common/Toast';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig | null;
  onConfigUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated
}) => {
  const { success, error } = useToast();
  const [geminiKey, setGeminiKey] = useState('');
  const [serpApiKey, setSerpApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.8-flash');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getCustomCredentials();
      setGeminiKey(stored.geminiKey);
      setSerpApiKey(stored.serpApiKey);
      setGeminiModel(stored.geminiModel || 'gemini-3.8-flash');
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveCustomCredentials({ geminiKey, serpApiKey, geminiModel });
      // Re-verify config from backend
      await api.getConfig();
      onConfigUpdated();
      success('API Credentials updated', 'Your configuration has been updated for this session.');
      onClose();
    } catch (err: unknown) {
      error('Failed to update credentials', err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setGeminiKey('');
    setSerpApiKey('');
    saveCustomCredentials({ geminiKey: '', serpApiKey: '', geminiModel: 'gemini-3.8-flash' });
    onConfigUpdated();
    success('Session keys cleared', 'Reverted back to server environment variables / demo mode defaults.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="API Keys & Engine Configuration"
      subtitle="Configure live web search (SerpApi) and synthesis LLM (Google Gemini)"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Environment Status Overview */}
        <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
            <Shield className="w-4 h-4 text-copper" /> Active Engine Diagnostics
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded border border-stone-200">
              <div className="flex items-center justify-between font-medium">
                <span>Google Gemini API:</span>
                <span className={config?.hasGeminiKey ? 'text-olive font-semibold flex items-center gap-1' : 'text-amber-700 flex items-center gap-1'}>
                  {config?.hasGeminiKey ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {config?.hasGeminiKey ? 'Connected' : 'Missing Key'}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted mt-1">
                Model: <span className="font-mono text-charcoal">{config?.geminiModel || geminiModel}</span>
              </p>
            </div>

            <div className="p-3 bg-white rounded border border-stone-200">
              <div className="flex items-center justify-between font-medium">
                <span>SerpApi Live Search:</span>
                <span className={config?.hasSerpApiKey ? 'text-olive font-semibold flex items-center gap-1' : 'text-amber-700 flex items-center gap-1'}>
                  {config?.hasSerpApiKey ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {config?.hasSerpApiKey ? 'Connected' : 'Missing Key'}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted mt-1">
                Engine: <span className="font-mono text-charcoal">Google Web & Reddit</span>
              </p>
            </div>
          </div>

          {!config?.hasGeminiKey || !config?.hasSerpApiKey ? (
            <p className="text-[11px] text-amber-800 bg-amber-50/80 p-2.5 rounded border border-amber-200 leading-relaxed">
              <strong>Notice:</strong> When credentials are unconfigured, Idea Miner operates in <strong>Demo Mode</strong> with deterministic sample datasets. To run live searches across real internet complaints, supply your keys below or in your server’s <code className="font-mono">.env</code> file.
            </p>
          ) : null}
        </div>

        {/* Dynamic Key Input Form */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-charcoal">
                Google Gemini API Key
              </label>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] text-copper hover:underline flex items-center gap-1"
              >
                Get Gemini Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper"
            />
            <p className="text-[11px] text-charcoal-muted mt-1">
              Required for structured problem clustering, opportunity synthesis, and competitor analysis.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-charcoal">
                SerpApi API Key
              </label>
              <a 
                href="https://serpapi.com/" 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] text-copper hover:underline flex items-center gap-1"
              >
                Get SerpApi Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={serpApiKey}
              onChange={(e) => setSerpApiKey(e.target.value)}
              placeholder="e.g. 7f89d..."
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper"
            />
            <p className="text-[11px] text-charcoal-muted mt-1">
              Required for live query execution against Reddit, forums, and verified product reviews.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Gemini Model
            </label>
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended: 1M context, high speed)</option>
              <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Fastest, low latency)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep reasoning)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <button
            onClick={handleClear}
            className="text-xs text-charcoal-muted hover:text-red-700 transition-colors cursor-pointer"
          >
            Clear Browser Keys
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              icon={<Check className="w-4 h-4" />}
            >
              Save & Apply
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
