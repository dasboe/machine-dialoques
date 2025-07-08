import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/database';
import { logger } from './utils/logger';
import { databaseService } from './services/database.service';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await databaseService.healthCheck();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth.database,
      collections: dbHealth.collections,
      version: '1.0.0'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Machine Dialogues API',
    version: '1.0.0',
    description: 'Backend API for generating and managing AI philosophical dialogues',
    endpoints: {
      health: '/health',
      docs: '/api-docs (coming soon)'
    }
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  // Log to database if possible
  databaseService.logError(
    error.message || 'Unknown error',
    'high',
    'system',
    {
      endpoint: req.path,
      method: req.method,
      stack: error.stack
    }
  ).catch(dbError => {
    logger.error('Failed to log error to database:', dbError);
  });

  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database first
    await connectToDatabase();
    logger.info('Database connected successfully');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV,
        port: PORT
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app; 