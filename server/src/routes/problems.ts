import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getSavedProblems, getProblemById, toggleSaveProblem } from '../db/database.js';

const router = Router();

const ToggleSchema = z.object({
  value: z.boolean()
});

// GET /api/problems/saved
router.get('/saved', async (req: Request, res: Response) => {
  try {
    const problems = await getSavedProblems();
    res.json(problems);
  } catch (err: unknown) {
    console.error('Error fetching saved problems:', err);
    res.status(500).json({ error: 'Failed to retrieve saved problems.' });
  }
});

// GET /api/problems/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const problem = await getProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }
    res.json(problem);
  } catch (err: unknown) {
    console.error('Error fetching problem by id:', err);
    res.status(500).json({ error: 'Failed to retrieve problem.' });
  }
});

// POST /api/problems/:id/save
router.post('/:id/save', async (req: Request, res: Response) => {
  try {
    const parsed = ToggleSchema.safeParse(req.body);
    const isSaved = parsed.success ? parsed.data.value : true;

    await toggleSaveProblem(req.params.id, isSaved);
    const problem = await getProblemById(req.params.id);
    res.json(problem);
  } catch (err: unknown) {
    console.error('Error toggling problem save status:', err);
    res.status(500).json({ error: 'Failed to toggle problem save status.' });
  }
});

export default router;
