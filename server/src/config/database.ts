import mongoose from 'mongoose';
import { logger } from '../utils/logger';

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

const getDatabaseConfig = (): DatabaseConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  let uri: string;
  if (isTest) {
    uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/machine-dialogues-test';
  } else {
    uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/machine-dialogues';
  }

  const options: mongoose.ConnectOptions = {
    // Connection pool settings
    maxPoolSize: isProduction ? 20 : 5,
    minPoolSize: isProduction ? 2 : 1,
    
    // Timeout settings
    serverSelectionTimeoutMS: 15000, // 15 seconds
    socketTimeoutMS: 45000, // 45 seconds
    connectTimeoutMS: 15000, // 15 seconds
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
  };

  return { uri, options };
};

export const connectToDatabase = async (): Promise<void> => {
  try {
    const { uri, options } = getDatabaseConfig();
    
    logger.info('Connecting to MongoDB...', { 
      uri: uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
      environment: process.env.NODE_ENV 
    });

    await mongoose.connect(uri, options);
    
    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    });

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await disconnectFromDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

export default mongoose; 