import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or current folder
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // LLM Provider
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  
  // Search Provider
  serpApiKey: process.env.SERPAPI_API_KEY || '',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  sqlitePath: path.resolve(process.cwd(), 'idea_miner.sqlite'),

  // Key inspection helpers
  getEffectiveGeminiKey(headerKey?: string): string {
    return (headerKey && headerKey.trim()) ? headerKey.trim() : (process.env.GEMINI_API_KEY || '');
  },

  getEffectiveSerpApiKey(headerKey?: string): string {
    return (headerKey && headerKey.trim()) ? headerKey.trim() : (process.env.SERPAPI_API_KEY || '');
  },

  getEffectiveGeminiModel(headerModel?: string): string {
    return (headerModel && headerModel.trim()) ? headerModel.trim() : (process.env.GEMINI_MODEL || 'gemini-3.8-flash');
  }
};
