import { Router } from 'express';
import { dialogueRoutes } from './dialogue.routes';
import { questionRoutes } from './question.routes';
import { databaseService } from '../services/database.service';

const router = Router();

/**
 * API Routes
 * Base path: /api
 */

// Health check endpoint
router.get('/health', async (_req, res) => {
  try {
    const health = await databaseService.healthCheck();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: health.database,
      collections: health.collections,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API info endpoint
router.get('/', (_req, res) => {
  res.json({
    name: 'Machine Dialogues API',
    version: '1.0.0',
    description: 'REST API for generating and managing AI philosophical dialogues',
    endpoints: {
      dialogues: '/api/dialogues',
      questions: '/api/questions',
      health: '/api/health'
    },
    documentation: 'Coming soon'
  });
});

// Mount route modules
router.use('/dialogues', dialogueRoutes);
router.use('/questions', questionRoutes);

export { router as apiRoutes };