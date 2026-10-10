import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';
import { initDatabase } from './db/database.js';

import configRouter from './routes/config.js';
import researchRouter from './routes/research.js';
import opportunitiesRouter from './routes/opportunities.js';
import problemsRouter from './routes/problems.js';
import exportRouter from './routes/export.js';

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ['Content-Disposition']
}));

// Body parsing with generous limit for research payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Idea Miner API',
    version: '1.0.0'
  });
});

// Mount modular API routes
app.use('/api', configRouter);
app.use('/api/research', researchRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/export', exportRouter);

// Serve frontend static build if running in production mode
const clientDistPath = path.resolve(process.cwd(), '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Server] Serving production static files from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global 404 handler for API routes
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Initialize database and start HTTP server
async function startServer() {
  try {
    await initDatabase();
    app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚀 Idea Miner Server running on http://localhost:${config.port}`);
      console.log(`   Mode: ${config.nodeEnv}`);
      console.log(`   Gemini Model: ${config.geminiModel}`);
      console.log(`   SerpApi Configured: ${Boolean(config.serpApiKey)}`);
      console.log(`   Gemini Configured: ${Boolean(config.geminiApiKey)}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal error during server startup:', err);
    process.exit(1);
  }
}

startServer();
