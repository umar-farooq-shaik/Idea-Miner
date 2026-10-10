import { OpportunityRecord, ProblemRecord, SearchResultRecord } from '../types/index.js';

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const str = typeof field === 'object' ? JSON.stringify(field) : String(field);
  // Double-quote escape
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function exportOpportunitiesToCsv(opportunities: OpportunityRecord[]): string {
  const headers = [
    'ID',
    'Name',
    'Description',
    'Total Score',
    'Status',
    'Opportunity Type',
    'Target Customer',
    'Problem Solved',
    'Core Differentiator',
    'Proposed Solution',
    'Technical Complexity',
    'Pricing Model',
    'Pain Severity (25%)',
    'Evidence Strength (25%)',
    'Market Gap (20%)',
    'Willingness to Pay (15%)',
    'Feasibility (15%)',
    'MVP Features',
    'Existing Competitors',
    'Validation Experiment',
    'Supporting Sources',
    'Created At'
  ];

  const rows = opportunities.map(opp => [
    escapeCsvField(opp.id),
    escapeCsvField(opp.name),
    escapeCsvField(opp.description),
    escapeCsvField(opp.totalScore),
    escapeCsvField(opp.status),
    escapeCsvField(opp.opportunityType),
    escapeCsvField(opp.targetCustomer),
    escapeCsvField(opp.problemSolved),
    escapeCsvField(opp.coreDifferentiator),
    escapeCsvField(opp.proposedSolution),
    escapeCsvField(opp.technicalComplexity),
    escapeCsvField(opp.pricingModel),
    escapeCsvField(opp.scorePainSeverity),
    escapeCsvField(opp.scoreEvidenceStrength),
    escapeCsvField(opp.scoreMarketGap),
    escapeCsvField(opp.scoreWillingnessToPay),
    escapeCsvField(opp.scoreFeasibility),
    escapeCsvField(opp.mvpFeatures.join('; ')),
    escapeCsvField(opp.existingCompetitors.map(c => c.name).join(', ')),
    escapeCsvField(opp.validationExperiment),
    escapeCsvField(opp.supportingSources.map(s => `${s.title}: ${s.url}`).join(' | ')),
    escapeCsvField(opp.createdAt)
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}

export function exportResearchToCsv(
  problems: ProblemRecord[],
  searchResults: SearchResultRecord[]
): string {
  const headers = [
    'Problem Statement',
    'Target Audience',
    'Severity (1-10)',
    'Recurrence',
    'Distinct Sources Count',
    'Confidence Level',
    'Existing Solutions Mentioned',
    'Shortcomings',
    'Workarounds',
    'Willingness To Pay Hypothesis',
    'Validation Questions',
    'Evidence Sources'
  ];

  const rows = problems.map(prob => [
    escapeCsvField(prob.statement),
    escapeCsvField(prob.targetAudience),
    escapeCsvField(prob.severity),
    escapeCsvField(prob.recurrenceIndicator),
    escapeCsvField(prob.supportingSourcesCount),
    escapeCsvField(prob.confidenceLevel),
    escapeCsvField(prob.existingSolutions.join('; ')),
    escapeCsvField(prob.shortcomings.join('; ')),
    escapeCsvField(prob.currentWorkarounds.join('; ')),
    escapeCsvField(prob.willingnessToPay),
    escapeCsvField(prob.validationQuestions.join('; ')),
    escapeCsvField(prob.evidenceLinks.map(l => `${l.title} (${l.domain}) - ${l.url}`).join(' | '))
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}
