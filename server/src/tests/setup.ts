import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

let mongod: MongoMemoryServer;

// Global test setup
beforeAll(async () => {
  try {
    // Create in-memory MongoDB instance
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'machine-dialogues-test'
      }
    });

    // Get the URI
    const uri = mongod.getUri();
    
    // Connect mongoose to the in-memory database
    await mongoose.connect(uri);
    
    // Silence logger during tests
    logger.silent = true;
    
    console.log('🧪 Test database connected successfully');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  try {
    // Close mongoose connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    
    // Stop the in-memory MongoDB instance
    await mongod.stop();
    
    console.log('🧹 Test database cleaned up successfully');
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
    throw error;
  }
});

// Clean up between tests
afterEach(async () => {
  try {
    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }
  } catch (error) {
    console.error('❌ Failed to clean test data:', error);
    throw error;
  }
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidObjectId(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidObjectId(received) {
    const pass = mongoose.Types.ObjectId.isValid(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false,
      };
    }
  },
});

export {}; 