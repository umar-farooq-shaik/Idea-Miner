-- Idea Miner Database Schema (SQLite & PostgreSQL Compatible)

CREATE TABLE IF NOT EXISTS researches (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  topic TEXT NOT NULL,
  target_customer TEXT,
  geographic_market TEXT,
  include_keywords TEXT,
  exclude_keywords TEXT,
  depth TEXT NOT NULL DEFAULT 'quick',
  status TEXT NOT NULL DEFAULT 'pending',
  is_demo INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS search_results (
  id TEXT PRIMARY KEY,
  research_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  snippet TEXT NOT NULL,
  published_date TEXT,
  source_query TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'web',
  created_at TEXT NOT NULL,
  FOREIGN KEY (research_id) REFERENCES researches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  research_id TEXT NOT NULL,
  statement TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  user_pain TEXT NOT NULL,
  supporting_sources_count INTEGER NOT NULL DEFAULT 1,
  recurrence_indicator TEXT NOT NULL DEFAULT 'Medium',
  existing_solutions TEXT NOT NULL DEFAULT '[]',
  shortcomings TEXT NOT NULL DEFAULT '[]',
  current_workarounds TEXT NOT NULL DEFAULT '[]',
  severity INTEGER NOT NULL DEFAULT 5,
  willingness_to_pay TEXT NOT NULL DEFAULT '',
  confidence_level TEXT NOT NULL DEFAULT 'Medium',
  confidence_explanation TEXT NOT NULL,
  evidence_gaps TEXT NOT NULL DEFAULT '[]',
  validation_questions TEXT NOT NULL DEFAULT '[]',
  evidence_links TEXT NOT NULL DEFAULT '[]',
  is_saved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (research_id) REFERENCES researches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  research_id TEXT NOT NULL,
  problem_id TEXT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_solved TEXT NOT NULL,
  target_customer TEXT NOT NULL,
  proposed_solution TEXT NOT NULL,
  core_differentiator TEXT NOT NULL,
  opportunity_type TEXT NOT NULL DEFAULT 'new_product',
  existing_competitors TEXT NOT NULL DEFAULT '[]',
  weaknesses_in_alternatives TEXT NOT NULL DEFAULT '[]',
  mvp_features TEXT NOT NULL DEFAULT '[]',
  pricing_model TEXT NOT NULL DEFAULT '',
  distribution_channels TEXT NOT NULL DEFAULT '[]',
  technical_complexity TEXT NOT NULL DEFAULT 'Medium',
  validation_experiment TEXT NOT NULL,
  risks_and_assumptions TEXT NOT NULL DEFAULT '[]',
  supporting_sources TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'Discovered',
  is_saved INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  is_demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  score_pain_severity INTEGER NOT NULL DEFAULT 50,
  score_evidence_strength INTEGER NOT NULL DEFAULT 50,
  score_market_gap INTEGER NOT NULL DEFAULT 50,
  score_willingness_to_pay INTEGER NOT NULL DEFAULT 50,
  score_feasibility INTEGER NOT NULL DEFAULT 50,
  total_score INTEGER NOT NULL DEFAULT 50,
  scoring_explanation TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (research_id) REFERENCES researches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_researches_created ON researches(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON opportunities(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_search_results_research ON search_results(research_id);
CREATE INDEX IF NOT EXISTS idx_problems_research ON problems(research_id);
