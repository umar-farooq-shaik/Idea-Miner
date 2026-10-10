import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  getAllOpportunities, 
  getOpportunityById, 
  updateOpportunityStatus, 
  toggleSaveOpportunity, 
  toggleArchiveOpportunity, 
  deleteOpportunity,
  getProblemById,
  initDatabase
} from '../db/database.js';
import { OpportunityStatus } from '../types/index.js';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

const router = Router();

const StatusSchema = z.object({
  status: z.enum(['Discovered', 'Researching', 'Validating', 'Building', 'Rejected'])
});

const ToggleSchema = z.object({
  value: z.boolean()
});

// GET /api/opportunities
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, isSaved, isArchived, minScore, opportunityType, search } = req.query;

    const filters = {
      status: status ? String(status) : undefined,
      isSaved: isSaved !== undefined ? isSaved === 'true' : undefined,
      isArchived: isArchived !== undefined ? isArchived === 'true' : undefined,
      minScore: minScore ? parseInt(String(minScore), 10) : undefined,
      opportunityType: opportunityType ? String(opportunityType) : undefined,
    };

    let items = await getAllOpportunities(filters);

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase();
      items = items.filter(o => 
        o.name.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.problemSolved.toLowerCase().includes(q) ||
        o.targetCustomer.toLowerCase().includes(q)
      );
    }

    res.json(items);
  } catch (err: unknown) {
    console.error('Error fetching opportunities:', err);
    res.status(500).json({ error: 'Failed to retrieve opportunities.' });
  }
});

// GET /api/opportunities/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const opp = await getOpportunityById(req.params.id);
    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }

    let linkedProblem = null;
    if (opp.problemId) {
      linkedProblem = await getProblemById(opp.problemId);
    }

    res.json({
      ...opp,
      linkedProblem
    });
  } catch (err: unknown) {
    console.error('Error fetching opportunity detail:', err);
    res.status(500).json({ error: 'Failed to retrieve opportunity details.' });
  }
});

// PATCH /api/opportunities/:id/status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const parsed = StatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid status provided.' });
    }

    await updateOpportunityStatus(req.params.id, parsed.data.status as OpportunityStatus);
    const updated = await getOpportunityById(req.params.id);
    res.json(updated);
  } catch (err: unknown) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update opportunity status.' });
  }
});

// POST /api/opportunities/:id/save
router.post('/:id/save', async (req: Request, res: Response) => {
  try {
    const parsed = ToggleSchema.safeParse(req.body);
    const isSaved = parsed.success ? parsed.data.value : true;

    await toggleSaveOpportunity(req.params.id, isSaved);
    const updated = await getOpportunityById(req.params.id);
    res.json(updated);
  } catch (err: unknown) {
    console.error('Error toggling save status:', err);
    res.status(500).json({ error: 'Failed to toggle save status.' });
  }
});

// POST /api/opportunities/:id/archive
router.post('/:id/archive', async (req: Request, res: Response) => {
  try {
    const parsed = ToggleSchema.safeParse(req.body);
    const isArchived = parsed.success ? parsed.data.value : true;

    await toggleArchiveOpportunity(req.params.id, isArchived);
    const updated = await getOpportunityById(req.params.id);
    res.json(updated);
  } catch (err: unknown) {
    console.error('Error toggling archive status:', err);
    res.status(500).json({ error: 'Failed to toggle archive status.' });
  }
});

// DELETE /api/opportunities/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deleteOpportunity(req.params.id);
    res.json({ success: true, message: 'Opportunity deleted.' });
  } catch (err: unknown) {
    console.error('Error deleting opportunity:', err);
    res.status(500).json({ error: 'Failed to delete opportunity.' });
  }
});

// POST /api/opportunities/:id/reanalyze
router.post('/:id/reanalyze', async (req: Request, res: Response) => {
  try {
    const opp = await getOpportunityById(req.params.id);
    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }

    const headerGemini = req.headers['x-gemini-key'] as string | undefined;
    const apiKey = config.getEffectiveGeminiKey(headerGemini);

    if (!apiKey) {
      return res.status(400).json({ 
        error: 'GEMINI_API_KEY is required to re-analyze this opportunity. Please configure your key in Settings or .env.' 
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are an expert startup advisor and product architect evaluating an opportunity.
Current Opportunity Concept:
- Name: ${opp.name}
- One-Sentence Pitch: ${opp.description}
- Problem: ${opp.problemSolved}
- Target Customer: ${opp.targetCustomer}
- Proposed Solution: ${opp.proposedSolution}
- Existing Competitors: ${JSON.stringify(opp.existingCompetitors)}
- Supporting Evidence Count: ${opp.supportingSources.length}

Perform a rigorous, grounded deep-dive re-analysis:
1. Identify 2 unexploited wedge features that incumbents cannot easily copy.
2. Outline a concrete 48-hour validation experiment with clear go/no-go metrics.
3. Identify the #1 kill-risk that could cause this startup to fail.
4. Refine the suggested pricing model based on customer ROI.

Return JSON in this format:
{
  "wedgeFeatures": ["Feature 1", "Feature 2"],
  "validationExperiment": "Detailed 48-hour test protocol with go/no-go metric",
  "killRisk": "The primary existential risk and mitigation",
  "refinedPricing": "Specific recommended pricing model"
}
`;

    const response = await ai.models.generateContent({
      model: config.geminiModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text || '{}';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const insights = JSON.parse(cleanJson);

    // Update opportunity with refined validation experiment if provided
    if (insights.validationExperiment) {
      const db = await initDatabase();
      const updatedRisks = [...opp.risksAndAssumptions];
      if (insights.killRisk) {
        updatedRisks.unshift(`Primary Kill Risk: ${insights.killRisk}`);
      }
      db.run(
        `UPDATE opportunities SET validation_experiment = ?, pricing_model = ?, risks_and_assumptions = ?, updated_at = ? WHERE id = ?`,
        [
          insights.validationExperiment,
          insights.refinedPricing || opp.pricingModel,
          JSON.stringify(updatedRisks.slice(0, 5)),
          new Date().toISOString(),
          opp.id
        ]
      );
    }

    const updated = await getOpportunityById(opp.id);
    res.json({
      opportunity: updated,
      reanalysisInsights: insights
    });
  } catch (err: unknown) {
    console.error('Error re-analyzing opportunity:', err);
    res.status(500).json({ error: `Re-analysis failed: ${err instanceof Error ? err.message : String(err)}` });
  }
});

export default router;
