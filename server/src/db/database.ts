import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { 
  ResearchRecord, 
  SearchResultRecord, 
  ProblemRecord, 
  OpportunityRecord, 
  DashboardStats,
  OpportunityStatus
} from '../types/index.js';
import { getSeedData } from './seedData.js';

let dbInstance: SqlJsDatabase | null = null;
const dbFilePath = config.sqlitePath;

// Helper to save database to disk
function persistDatabase(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('Failed to persist SQLite database to disk:', err);
  }
}

export async function initDatabase(): Promise<SqlJsDatabase> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (fs.existsSync(dbFilePath)) {
    try {
      const filebuffer = fs.readFileSync(dbFilePath);
      dbInstance = new SQL.Database(filebuffer);
      console.log(`[Database] Loaded existing database from ${dbFilePath}`);
    } catch (e) {
      console.warn('[Database] Failed to read existing database file, creating fresh database', e);
      dbInstance = new SQL.Database();
    }
  } else {
    console.log(`[Database] Creating new database at ${dbFilePath}`);
    dbInstance = new SQL.Database();
  }

  // Load and execute schema
  const schemaPath = path.resolve(process.cwd(), 'src/db/schema.sql');
  let schemaSql = '';
  if (fs.existsSync(schemaPath)) {
    schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  } else {
    // Fallback if running from dist
    const altSchemaPath = path.resolve(process.cwd(), 'dist/db/schema.sql');
    if (fs.existsSync(altSchemaPath)) {
      schemaSql = fs.readFileSync(altSchemaPath, 'utf-8');
    }
  }

  if (schemaSql) {
    dbInstance.run(schemaSql);
  }

  // Check if database is empty; if so, populate with seed demo data
  const checkStmt = dbInstance.prepare("SELECT COUNT(*) as cnt FROM researches");
  let count = 0;
  if (checkStmt.step()) {
    const row = checkStmt.getAsObject();
    count = Number(row.cnt || 0);
  }
  checkStmt.free();

  if (count === 0) {
    console.log('[Database] Seeding initial realistic demo dataset...');
    const seed = getSeedData();

    // Insert researches
    for (const r of seed.researches) {
      dbInstance.run(
        `INSERT INTO researches (id, query, topic, target_customer, geographic_market, include_keywords, exclude_keywords, depth, status, is_demo, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.id, r.query, r.topic, r.targetCustomer || null, r.geographicMarket || null, r.includeKeywords || null, r.excludeKeywords || null, r.depth, r.status, r.isDemo ? 1 : 0, r.createdAt, r.updatedAt]
      );
    }

    // Insert search results
    for (const sr of seed.searchResults) {
      dbInstance.run(
        `INSERT INTO search_results (id, research_id, title, url, domain, snippet, published_date, source_query, source_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sr.id, sr.researchId, sr.title, sr.url, sr.domain, sr.snippet, sr.publishedDate || null, sr.sourceQuery, sr.sourceType, sr.createdAt]
      );
    }

    // Insert problems
    for (const p of seed.problems) {
      dbInstance.run(
        `INSERT INTO problems (id, research_id, statement, target_audience, user_pain, supporting_sources_count, recurrence_indicator, existing_solutions, shortcomings, current_workarounds, severity, willingness_to_pay, confidence_level, confidence_explanation, evidence_gaps, validation_questions, evidence_links, is_saved, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id, p.researchId, p.statement, p.targetAudience, p.userPain, p.supportingSourcesCount,
          p.recurrenceIndicator, JSON.stringify(p.existingSolutions), JSON.stringify(p.shortcomings),
          JSON.stringify(p.currentWorkarounds), p.severity, p.willingnessToPay, p.confidenceLevel,
          p.confidenceExplanation, JSON.stringify(p.evidenceGaps), JSON.stringify(p.validationQuestions),
          JSON.stringify(p.evidenceLinks), p.isSaved ? 1 : 0, p.createdAt
        ]
      );
    }

    // Insert opportunities
    for (const o of seed.opportunities) {
      dbInstance.run(
        `INSERT INTO opportunities (id, research_id, problem_id, name, description, problem_solved, target_customer, proposed_solution, core_differentiator, opportunity_type, existing_competitors, weaknesses_in_alternatives, mvp_features, pricing_model, distribution_channels, technical_complexity, validation_experiment, risks_and_assumptions, supporting_sources, status, is_saved, is_archived, is_demo, created_at, updated_at, score_pain_severity, score_evidence_strength, score_market_gap, score_willingness_to_pay, score_feasibility, total_score, scoring_explanation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          o.id, o.researchId, o.problemId || null, o.name, o.description, o.problemSolved, o.targetCustomer,
          o.proposedSolution, o.coreDifferentiator, o.opportunityType, JSON.stringify(o.existingCompetitors),
          JSON.stringify(o.weaknessesInAlternatives), JSON.stringify(o.mvpFeatures), o.pricingModel,
          JSON.stringify(o.distributionChannels), o.technicalComplexity, o.validationExperiment,
          JSON.stringify(o.risksAndAssumptions), JSON.stringify(o.supportingSources), o.status,
          o.isSaved ? 1 : 0, o.isArchived ? 1 : 0, o.isDemo ? 1 : 0, o.createdAt, o.updatedAt,
          o.scorePainSeverity, o.scoreEvidenceStrength, o.scoreMarketGap, o.scoreWillingnessToPay,
          o.scoreFeasibility, o.totalScore, o.scoringExplanation
        ]
      );
    }

    persistDatabase();
    console.log('[Database] Seed dataset successfully committed to SQLite.');
  }

  return dbInstance;
}

// ==========================================
// RESEARCH CRUD
// ==========================================

export async function getAllResearches(): Promise<ResearchRecord[]> {
  const db = await initDatabase();
  const stmt = db.prepare(`
    SELECT r.*, 
      (SELECT COUNT(*) FROM search_results WHERE research_id = r.id) as total_results_count,
      (SELECT COUNT(*) FROM problems WHERE research_id = r.id) as total_problems_count,
      (SELECT COUNT(*) FROM opportunities WHERE research_id = r.id) as total_opportunities_count
    FROM researches r
    ORDER BY created_at DESC
  `);
  
  const records: ResearchRecord[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    records.push({
      id: String(row.id),
      query: String(row.query),
      topic: String(row.topic),
      targetCustomer: row.target_customer ? String(row.target_customer) : undefined,
      geographicMarket: row.geographic_market ? String(row.geographic_market) : undefined,
      includeKeywords: row.include_keywords ? String(row.include_keywords) : undefined,
      excludeKeywords: row.exclude_keywords ? String(row.exclude_keywords) : undefined,
      depth: row.depth as 'quick' | 'deep',
      status: row.status as any,
      isDemo: Boolean(row.is_demo),
      errorMessage: row.error_message ? String(row.error_message) : undefined,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      totalResultsCount: Number(row.total_results_count || 0),
      totalProblemsCount: Number(row.total_problems_count || 0),
      totalOpportunitiesCount: Number(row.total_opportunities_count || 0)
    });
  }
  stmt.free();
  return records;
}

export async function getResearchById(id: string): Promise<ResearchRecord | null> {
  const db = await initDatabase();
  const stmt = db.prepare(`
    SELECT r.*,
      (SELECT COUNT(*) FROM search_results WHERE research_id = r.id) as total_results_count,
      (SELECT COUNT(*) FROM problems WHERE research_id = r.id) as total_problems_count,
      (SELECT COUNT(*) FROM opportunities WHERE research_id = r.id) as total_opportunities_count
    FROM researches r WHERE r.id = ?
  `);
  stmt.bind([id]);

  let record: ResearchRecord | null = null;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    record = {
      id: String(row.id),
      query: String(row.query),
      topic: String(row.topic),
      targetCustomer: row.target_customer ? String(row.target_customer) : undefined,
      geographicMarket: row.geographic_market ? String(row.geographic_market) : undefined,
      includeKeywords: row.include_keywords ? String(row.include_keywords) : undefined,
      excludeKeywords: row.exclude_keywords ? String(row.exclude_keywords) : undefined,
      depth: row.depth as 'quick' | 'deep',
      status: row.status as any,
      isDemo: Boolean(row.is_demo),
      errorMessage: row.error_message ? String(row.error_message) : undefined,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      totalResultsCount: Number(row.total_results_count || 0),
      totalProblemsCount: Number(row.total_problems_count || 0),
      totalOpportunitiesCount: Number(row.total_opportunities_count || 0)
    };
  }
  stmt.free();
  return record;
}

export async function createResearch(r: ResearchRecord): Promise<void> {
  const db = await initDatabase();
  db.run(
    `INSERT INTO researches (id, query, topic, target_customer, geographic_market, include_keywords, exclude_keywords, depth, status, is_demo, error_message, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      r.id, r.query, r.topic, r.targetCustomer || null, r.geographicMarket || null,
      r.includeKeywords || null, r.excludeKeywords || null, r.depth, r.status,
      r.isDemo ? 1 : 0, r.errorMessage || null, r.createdAt, r.updatedAt
    ]
  );
  persistDatabase();
}

export async function updateResearchStatus(id: string, status: string, errorMessage?: string): Promise<void> {
  const db = await initDatabase();
  db.run(
    `UPDATE researches SET status = ?, error_message = ?, updated_at = ? WHERE id = ?`,
    [status, errorMessage || null, new Date().toISOString(), id]
  );
  persistDatabase();
}

export async function deleteResearch(id: string): Promise<void> {
  const db = await initDatabase();
  db.run(`DELETE FROM opportunities WHERE research_id = ?`, [id]);
  db.run(`DELETE FROM problems WHERE research_id = ?`, [id]);
  db.run(`DELETE FROM search_results WHERE research_id = ?`, [id]);
  db.run(`DELETE FROM researches WHERE id = ?`, [id]);
  persistDatabase();
}

// ==========================================
// SEARCH RESULTS CRUD
// ==========================================

export async function insertSearchResults(results: SearchResultRecord[]): Promise<void> {
  if (results.length === 0) return;
  const db = await initDatabase();
  for (const sr of results) {
    db.run(
      `INSERT INTO search_results (id, research_id, title, url, domain, snippet, published_date, source_query, source_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sr.id, sr.researchId, sr.title, sr.url, sr.domain, sr.snippet, sr.publishedDate || null, sr.sourceQuery, sr.sourceType, sr.createdAt]
    );
  }
  persistDatabase();
}

export async function getSearchResultsByResearchId(researchId: string): Promise<SearchResultRecord[]> {
  const db = await initDatabase();
  const stmt = db.prepare(`SELECT * FROM search_results WHERE research_id = ? ORDER BY created_at ASC`);
  stmt.bind([researchId]);

  const items: SearchResultRecord[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    items.push({
      id: String(row.id),
      researchId: String(row.research_id),
      title: String(row.title),
      url: String(row.url),
      domain: String(row.domain),
      snippet: String(row.snippet),
      publishedDate: row.published_date ? String(row.published_date) : undefined,
      sourceQuery: String(row.source_query),
      sourceType: row.source_type as any,
      createdAt: String(row.created_at)
    });
  }
  stmt.free();
  return items;
}

// ==========================================
// PROBLEMS CRUD
// ==========================================

export async function insertProblems(problems: ProblemRecord[]): Promise<void> {
  if (problems.length === 0) return;
  const db = await initDatabase();
  for (const p of problems) {
    db.run(
      `INSERT INTO problems (id, research_id, statement, target_audience, user_pain, supporting_sources_count, recurrence_indicator, existing_solutions, shortcomings, current_workarounds, severity, willingness_to_pay, confidence_level, confidence_explanation, evidence_gaps, validation_questions, evidence_links, is_saved, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id, p.researchId, p.statement, p.targetAudience, p.userPain, p.supportingSourcesCount,
        p.recurrenceIndicator, JSON.stringify(p.existingSolutions), JSON.stringify(p.shortcomings),
        JSON.stringify(p.currentWorkarounds), p.severity, p.willingnessToPay, p.confidenceLevel,
        p.confidenceExplanation, JSON.stringify(p.evidenceGaps), JSON.stringify(p.validationQuestions),
        JSON.stringify(p.evidenceLinks), p.isSaved ? 1 : 0, p.createdAt
      ]
    );
  }
  persistDatabase();
}

function parseProblemRow(row: Record<string, any>): ProblemRecord {
  return {
    id: String(row.id),
    researchId: String(row.research_id),
    statement: String(row.statement),
    targetAudience: String(row.target_audience),
    userPain: String(row.user_pain),
    supportingSourcesCount: Number(row.supporting_sources_count || 1),
    recurrenceIndicator: row.recurrence_indicator as any,
    existingSolutions: JSON.parse(row.existing_solutions || '[]'),
    shortcomings: JSON.parse(row.shortcomings || '[]'),
    currentWorkarounds: JSON.parse(row.current_workarounds || '[]'),
    severity: Number(row.severity || 5),
    willingnessToPay: String(row.willingness_to_pay || ''),
    confidenceLevel: row.confidence_level as any,
    confidenceExplanation: String(row.confidence_explanation || ''),
    evidenceGaps: JSON.parse(row.evidence_gaps || '[]'),
    validationQuestions: JSON.parse(row.validation_questions || '[]'),
    evidenceLinks: JSON.parse(row.evidence_links || '[]'),
    isSaved: Boolean(row.is_saved),
    createdAt: String(row.created_at)
  };
}

export async function getProblemsByResearchId(researchId: string): Promise<ProblemRecord[]> {
  const db = await initDatabase();
  const stmt = db.prepare(`SELECT * FROM problems WHERE research_id = ? ORDER BY severity DESC`);
  stmt.bind([researchId]);

  const items: ProblemRecord[] = [];
  while (stmt.step()) {
    items.push(parseProblemRow(stmt.getAsObject()));
  }
  stmt.free();
  return items;
}

export async function getProblemById(id: string): Promise<ProblemRecord | null> {
  const db = await initDatabase();
  const stmt = db.prepare(`SELECT * FROM problems WHERE id = ?`);
  stmt.bind([id]);

  let item: ProblemRecord | null = null;
  if (stmt.step()) {
    item = parseProblemRow(stmt.getAsObject());
  }
  stmt.free();
  return item;
}

export async function toggleSaveProblem(id: string, isSaved: boolean): Promise<void> {
  const db = await initDatabase();
  db.run(`UPDATE problems SET is_saved = ? WHERE id = ?`, [isSaved ? 1 : 0, id]);
  persistDatabase();
}

export async function getSavedProblems(): Promise<ProblemRecord[]> {
  const db = await initDatabase();
  const stmt = db.prepare(`SELECT * FROM problems WHERE is_saved = 1 ORDER BY created_at DESC`);
  const items: ProblemRecord[] = [];
  while (stmt.step()) {
    items.push(parseProblemRow(stmt.getAsObject()));
  }
  stmt.free();
  return items;
}

// ==========================================
// OPPORTUNITIES CRUD
// ==========================================

export async function insertOpportunities(opportunities: OpportunityRecord[]): Promise<void> {
  if (opportunities.length === 0) return;
  const db = await initDatabase();
  for (const o of opportunities) {
    db.run(
      `INSERT INTO opportunities (id, research_id, problem_id, name, description, problem_solved, target_customer, proposed_solution, core_differentiator, opportunity_type, existing_competitors, weaknesses_in_alternatives, mvp_features, pricing_model, distribution_channels, technical_complexity, validation_experiment, risks_and_assumptions, supporting_sources, status, is_saved, is_archived, is_demo, created_at, updated_at, score_pain_severity, score_evidence_strength, score_market_gap, score_willingness_to_pay, score_feasibility, total_score, scoring_explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.id, o.researchId, o.problemId || null, o.name, o.description, o.problemSolved, o.targetCustomer,
        o.proposedSolution, o.coreDifferentiator, o.opportunityType, JSON.stringify(o.existingCompetitors),
        JSON.stringify(o.weaknessesInAlternatives), JSON.stringify(o.mvpFeatures), o.pricingModel,
        JSON.stringify(o.distributionChannels), o.technicalComplexity, o.validationExperiment,
        JSON.stringify(o.risksAndAssumptions), JSON.stringify(o.supportingSources), o.status,
        o.isSaved ? 1 : 0, o.isArchived ? 1 : 0, o.isDemo ? 1 : 0, o.createdAt, o.updatedAt,
        o.scorePainSeverity, o.scoreEvidenceStrength, o.scoreMarketGap, o.scoreWillingnessToPay,
        o.scoreFeasibility, o.totalScore, o.scoringExplanation
      ]
    );
  }
  persistDatabase();
}

function parseOpportunityRow(row: Record<string, any>): OpportunityRecord {
  return {
    id: String(row.id),
    researchId: String(row.research_id),
    problemId: row.problem_id ? String(row.problem_id) : undefined,
    name: String(row.name),
    description: String(row.description),
    problemSolved: String(row.problem_solved),
    targetCustomer: String(row.target_customer),
    proposedSolution: String(row.proposed_solution),
    coreDifferentiator: String(row.core_differentiator),
    opportunityType: row.opportunity_type as any,
    existingCompetitors: JSON.parse(row.existing_competitors || '[]'),
    weaknessesInAlternatives: JSON.parse(row.weaknesses_in_alternatives || '[]'),
    mvpFeatures: JSON.parse(row.mvp_features || '[]'),
    pricingModel: String(row.pricing_model || ''),
    distributionChannels: JSON.parse(row.distribution_channels || '[]'),
    technicalComplexity: row.technical_complexity as any,
    validationExperiment: String(row.validation_experiment || ''),
    risksAndAssumptions: JSON.parse(row.risks_and_assumptions || '[]'),
    supportingSources: JSON.parse(row.supporting_sources || '[]'),
    status: row.status as OpportunityStatus,
    isSaved: Boolean(row.is_saved),
    isArchived: Boolean(row.is_archived),
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    scorePainSeverity: Number(row.score_pain_severity || 50),
    scoreEvidenceStrength: Number(row.score_evidence_strength || 50),
    scoreMarketGap: Number(row.score_market_gap || 50),
    scoreWillingnessToPay: Number(row.score_willingness_to_pay || 50),
    scoreFeasibility: Number(row.score_feasibility || 50),
    totalScore: Number(row.total_score || 50),
    scoringExplanation: String(row.scoring_explanation || '')
  };
}

export async function getAllOpportunities(filters?: {
  researchId?: string;
  status?: string;
  isSaved?: boolean;
  isArchived?: boolean;
  minScore?: number;
  opportunityType?: string;
}): Promise<OpportunityRecord[]> {
  const db = await initDatabase();
  let sql = `SELECT * FROM opportunities WHERE 1=1`;
  const params: any[] = [];

  if (filters?.researchId) {
    sql += ` AND research_id = ?`;
    params.push(filters.researchId);
  }
  if (filters?.status) {
    sql += ` AND status = ?`;
    params.push(filters.status);
  }
  if (filters?.isSaved !== undefined) {
    sql += ` AND is_saved = ?`;
    params.push(filters.isSaved ? 1 : 0);
  }
  if (filters?.isArchived !== undefined) {
    sql += ` AND is_archived = ?`;
    params.push(filters.isArchived ? 1 : 0);
  } else {
    // Default: exclude archived unless explicitly requested
    sql += ` AND is_archived = 0`;
  }
  if (filters?.minScore !== undefined) {
    sql += ` AND total_score >= ?`;
    params.push(filters.minScore);
  }
  if (filters?.opportunityType) {
    sql += ` AND opportunity_type = ?`;
    params.push(filters.opportunityType);
  }

  sql += ` ORDER BY total_score DESC, created_at DESC`;

  const stmt = db.prepare(sql);
  stmt.bind(params);

  const items: OpportunityRecord[] = [];
  while (stmt.step()) {
    items.push(parseOpportunityRow(stmt.getAsObject()));
  }
  stmt.free();
  return items;
}

export async function getOpportunityById(id: string): Promise<OpportunityRecord | null> {
  const db = await initDatabase();
  const stmt = db.prepare(`SELECT * FROM opportunities WHERE id = ?`);
  stmt.bind([id]);

  let item: OpportunityRecord | null = null;
  if (stmt.step()) {
    item = parseOpportunityRow(stmt.getAsObject());
  }
  stmt.free();
  return item;
}

export async function updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<void> {
  const db = await initDatabase();
  db.run(`UPDATE opportunities SET status = ?, updated_at = ? WHERE id = ?`, [status, new Date().toISOString(), id]);
  persistDatabase();
}

export async function toggleSaveOpportunity(id: string, isSaved: boolean): Promise<void> {
  const db = await initDatabase();
  db.run(`UPDATE opportunities SET is_saved = ?, updated_at = ? WHERE id = ?`, [isSaved ? 1 : 0, new Date().toISOString(), id]);
  persistDatabase();
}

export async function toggleArchiveOpportunity(id: string, isArchived: boolean): Promise<void> {
  const db = await initDatabase();
  db.run(`UPDATE opportunities SET is_archived = ?, updated_at = ? WHERE id = ?`, [isArchived ? 1 : 0, new Date().toISOString(), id]);
  persistDatabase();
}

export async function deleteOpportunity(id: string): Promise<void> {
  const db = await initDatabase();
  db.run(`DELETE FROM opportunities WHERE id = ?`, [id]);
  persistDatabase();
}

// ==========================================
// DASHBOARD STATS
// ==========================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await initDatabase();

  // Total problems
  const pStmt = db.prepare(`SELECT COUNT(*) as count FROM problems`);
  pStmt.step();
  const totalProblems = Number(pStmt.getAsObject().count || 0);
  pStmt.free();

  // Recurring complaints (problems with recurrence High or Medium)
  const rStmt = db.prepare(`SELECT COUNT(*) as count FROM problems WHERE recurrence_indicator IN ('High', 'Medium')`);
  rStmt.step();
  const recurringComplaints = Number(rStmt.getAsObject().count || 0);
  rStmt.free();

  // Potential opportunities
  const oStmt = db.prepare(`SELECT COUNT(*) as count FROM opportunities WHERE is_archived = 0`);
  oStmt.step();
  const potentialOpportunities = Number(oStmt.getAsObject().count || 0);
  oStmt.free();

  // Completed searches
  const sStmt = db.prepare(`SELECT COUNT(*) as count FROM researches WHERE status = 'completed'`);
  sStmt.step();
  const completedSearches = Number(sStmt.getAsObject().count || 0);
  sStmt.free();

  // Trending problem categories (derived from topics)
  const catStmt = db.prepare(`SELECT topic, COUNT(*) as count FROM researches GROUP BY topic ORDER BY count DESC LIMIT 5`);
  const trendingCategories: { name: string; count: number }[] = [];
  while (catStmt.step()) {
    const row = catStmt.getAsObject();
    trendingCategories.push({
      name: String(row.topic),
      count: Number(row.count || 1)
    });
  }
  catStmt.free();

  // If few categories, add standard categories from opportunities
  if (trendingCategories.length < 3) {
    const oppTypeStmt = db.prepare(`SELECT opportunity_type, COUNT(*) as count FROM opportunities GROUP BY opportunity_type`);
    while (oppTypeStmt.step()) {
      const row = oppTypeStmt.getAsObject();
      trendingCategories.push({
        name: String(row.opportunity_type).replace('_', ' ').toUpperCase(),
        count: Number(row.count || 1)
      });
    }
    oppTypeStmt.free();
  }

  // Recent activity
  const recentActivity: DashboardStats['recentActivity'] = [];

  const actResStmt = db.prepare(`SELECT id, topic, status, created_at, is_demo FROM researches ORDER BY created_at DESC LIMIT 5`);
  while (actResStmt.step()) {
    const row = actResStmt.getAsObject();
    recentActivity.push({
      id: String(row.id),
      type: 'research',
      title: `Research scan: "${row.topic}"`,
      timestamp: String(row.created_at),
      badge: row.is_demo ? 'Demo Dataset' : 'Live Research'
    });
  }
  actResStmt.free();

  const actOppStmt = db.prepare(`SELECT id, name, status, total_score, created_at FROM opportunities ORDER BY created_at DESC LIMIT 5`);
  while (actOppStmt.step()) {
    const row = actOppStmt.getAsObject();
    recentActivity.push({
      id: String(row.id),
      type: 'opportunity',
      title: `Opportunity discovered: ${row.name} (${row.total_score}/100)`,
      timestamp: String(row.created_at),
      badge: String(row.status)
    });
  }
  actOppStmt.free();

  // Sort combined activity by timestamp descending
  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    totalProblems,
    recurringComplaints,
    potentialOpportunities,
    completedSearches,
    trendingCategories: trendingCategories.slice(0, 6),
    recentActivity: recentActivity.slice(0, 8)
  };
}
