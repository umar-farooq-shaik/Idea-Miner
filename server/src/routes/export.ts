import { Router, Request, Response } from 'express';
import { 
  getAllOpportunities, 
  getProblemsByResearchId, 
  getSearchResultsByResearchId,
  getResearchById
} from '../db/database.js';
import { exportOpportunitiesToCsv, exportResearchToCsv } from '../services/exportService.js';

const router = Router();

// GET /api/export/opportunities - Download all or filtered opportunities as CSV
router.get('/opportunities', async (req: Request, res: Response) => {
  try {
    const { researchId, status } = req.query;
    const opportunities = await getAllOpportunities({
      researchId: researchId ? String(researchId) : undefined,
      status: status ? String(status) : undefined
    });

    const csvContent = exportOpportunitiesToCsv(opportunities);
    const filename = `idea-miner-opportunities-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (err: unknown) {
    console.error('Error generating opportunities CSV:', err);
    res.status(500).json({ error: 'Failed to generate opportunities CSV.' });
  }
});

// GET /api/export/research/:id - Download research problems and evidence as CSV
router.get('/research/:id', async (req: Request, res: Response) => {
  try {
    const research = await getResearchById(req.params.id);
    if (!research) {
      return res.status(404).json({ error: 'Research record not found.' });
    }

    const problems = await getProblemsByResearchId(req.params.id);
    const results = await getSearchResultsByResearchId(req.params.id);

    const csvContent = exportResearchToCsv(problems, results);
    const safeTopic = research.topic.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 30);
    const filename = `idea-miner-research-${safeTopic}-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (err: unknown) {
    console.error('Error generating research CSV:', err);
    res.status(500).json({ error: 'Failed to generate research CSV.' });
  }
});

export default router;
