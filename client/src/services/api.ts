import { 
  ResearchRecord, 
  ResearchRequest, 
  OpportunityRecord, 
  ProblemRecord, 
  SystemConfig, 
  DashboardStats,
  OpportunityStatus 
} from '../types';

const API_BASE = '/api';

// Helper to get custom API keys stored in localStorage (if any)
export function getCustomCredentials(): { geminiKey: string; serpApiKey: string; geminiModel: string } {
  return {
    geminiKey: localStorage.getItem('idea_miner_gemini_key') || '',
    serpApiKey: localStorage.getItem('idea_miner_serp_key') || '',
    geminiModel: localStorage.getItem('idea_miner_gemini_model') || 'gemini-3.8-flash'
  };
}

export function saveCustomCredentials(creds: { geminiKey: string; serpApiKey: string; geminiModel?: string }) {
  if (creds.geminiKey) localStorage.setItem('idea_miner_gemini_key', creds.geminiKey.trim());
  else localStorage.removeItem('idea_miner_gemini_key');

  if (creds.serpApiKey) localStorage.setItem('idea_miner_serp_key', creds.serpApiKey.trim());
  else localStorage.removeItem('idea_miner_serp_key');

  if (creds.geminiModel) localStorage.setItem('idea_miner_gemini_model', creds.geminiModel.trim());
}

function getHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
  const { geminiKey, serpApiKey, geminiModel } = getCustomCredentials();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  if (geminiKey) headers['x-gemini-key'] = geminiKey;
  if (serpApiKey) headers['x-serpapi-key'] = serpApiKey;
  if (geminiModel) headers['x-gemini-model'] = geminiModel;
  return headers;
}

export const api = {
  // Config & Stats
  async getConfig(): Promise<SystemConfig> {
    const res = await fetch(`${API_BASE}/config`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch system configuration');
    return res.json();
  },

  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard statistics');
    return res.json();
  },

  // Research
  async getResearches(): Promise<ResearchRecord[]> {
    const res = await fetch(`${API_BASE}/research`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch research scans');
    return res.json();
  },

  async getResearch(id: string): Promise<ResearchRecord> {
    const res = await fetch(`${API_BASE}/research/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch research details');
    return res.json();
  },

  async createResearch(params: ResearchRequest): Promise<ResearchRecord> {
    const res = await fetch(`${API_BASE}/research`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Research discovery failed');
    }
    return data;
  },

  async deleteResearch(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/research/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete research');
  },

  // Opportunities
  async getOpportunities(filters: {
    status?: string;
    isSaved?: boolean;
    isArchived?: boolean;
    minScore?: number;
    opportunityType?: string;
    search?: string;
    researchId?: string;
  } = {}): Promise<OpportunityRecord[]> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.isSaved !== undefined) params.set('isSaved', String(filters.isSaved));
    if (filters.isArchived !== undefined) params.set('isArchived', String(filters.isArchived));
    if (filters.minScore !== undefined) params.set('minScore', String(filters.minScore));
    if (filters.opportunityType) params.set('opportunityType', filters.opportunityType);
    if (filters.search) params.set('search', filters.search);
    if (filters.researchId) params.set('researchId', filters.researchId);

    const res = await fetch(`${API_BASE}/opportunities?${params.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch opportunities');
    return res.json();
  },

  async getOpportunity(id: string): Promise<OpportunityRecord> {
    const res = await fetch(`${API_BASE}/opportunities/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch opportunity detail');
    return res.json();
  },

  async updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<OpportunityRecord> {
    const res = await fetch(`${API_BASE}/opportunities/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update opportunity status');
    return res.json();
  },

  async toggleSaveOpportunity(id: string, value: boolean): Promise<OpportunityRecord> {
    const res = await fetch(`${API_BASE}/opportunities/${id}/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ value })
    });
    if (!res.ok) throw new Error('Failed to update bookmark status');
    return res.json();
  },

  async toggleArchiveOpportunity(id: string, value: boolean): Promise<OpportunityRecord> {
    const res = await fetch(`${API_BASE}/opportunities/${id}/archive`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ value })
    });
    if (!res.ok) throw new Error('Failed to update archive status');
    return res.json();
  },

  async deleteOpportunity(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/opportunities/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete opportunity');
  },

  async reanalyzeOpportunity(id: string): Promise<{ opportunity: OpportunityRecord; reanalysisInsights: any }> {
    const res = await fetch(`${API_BASE}/opportunities/${id}/reanalyze`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Re-analysis failed');
    }
    return data;
  },

  // Problems
  async getSavedProblems(): Promise<ProblemRecord[]> {
    const res = await fetch(`${API_BASE}/problems/saved`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch saved problems');
    return res.json();
  },

  async toggleSaveProblem(id: string, value: boolean): Promise<ProblemRecord> {
    const res = await fetch(`${API_BASE}/problems/${id}/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ value })
    });
    if (!res.ok) throw new Error('Failed to save problem');
    return res.json();
  },

  // Export URLs
  getOpportunitiesExportUrl(researchId?: string): string {
    return researchId ? `${API_BASE}/export/opportunities?researchId=${researchId}` : `${API_BASE}/export/opportunities`;
  },

  getResearchExportUrl(researchId: string): string {
    return `${API_BASE}/export/research/${researchId}`;
  }
};
