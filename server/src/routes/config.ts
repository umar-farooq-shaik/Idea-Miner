import { Router, Request, Response } from 'express';
import { config } from '../config.js';
import { getDashboardStats } from '../db/database.js';

const router = Router();

router.get('/config', (req: Request, res: Response) => {
  const headerGemini = req.headers['x-gemini-key'] as string | undefined;
  const headerSerp = req.headers['x-serpapi-key'] as string | undefined;

  const effectiveGemini = config.getEffectiveGeminiKey(headerGemini);
  const effectiveSerp = config.getEffectiveSerpApiKey(headerSerp);

  res.json({
    hasGeminiKey: Boolean(effectiveGemini && effectiveGemini.trim().length > 0),
    geminiModel: config.geminiModel,
    hasSerpApiKey: Boolean(effectiveSerp && effectiveSerp.trim().length > 0),
    hasDatabaseUrl: Boolean(config.databaseUrl && config.databaseUrl.trim().length > 0),
    databaseType: config.databaseUrl ? 'postgres' : 'sqlite',
    isDemoModeDefault: !effectiveGemini || !effectiveSerp
  });
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err: unknown) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard stats.' });
  }
});

export default router;
