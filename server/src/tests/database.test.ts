import { connectToDatabase, disconnectFromDatabase } from '../config/database';
import { databaseService } from '../services/database.service';
import { AIModelName } from '../types';

describe('Database Tests', () => {
  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/machine-dialogues-test';
    
    try {
      await connectToDatabase();
    } catch (error) {
      console.warn('MongoDB not available for testing. Tests will be skipped.');
    }
  });

  afterAll(async () => {
    try {
      await disconnectFromDatabase();
    } catch (error) {
      console.warn('Error disconnecting from test database:', error);
    }
  });

  describe('Database Connection', () => {
    test('should connect to MongoDB successfully', async () => {
      const health = await databaseService.healthCheck();
      expect(health.database).toBe('connected');
    });

    test('should return collection counts', async () => {
      const health = await databaseService.healthCheck();
      expect(health.collections).toHaveProperty('dialogues');
      expect(health.collections).toHaveProperty('questions');
      expect(health.collections).toHaveProperty('rejectedContent');
      expect(health.collections).toHaveProperty('errorLogs');
    });
  });

  describe('Question Operations', () => {
    test('should create a new question', async () => {
      const questionData = {
        text: 'What is the nature of consciousness in artificial intelligence?',
        tags: ['philosophy', 'ai', 'consciousness'],
        generatedBy: 'OpenAI' as AIModelName,
        language: 'en' as const
      };

      const question = await databaseService.createQuestion(questionData);
      
      expect(question._id).toBeDefined();
      expect(question.text).toBe(questionData.text);
      expect(question.tags).toEqual(questionData.tags);
      expect(question.generatedBy).toBe(questionData.generatedBy);
      expect(question.status).toBe('pending');
      expect(question.usageCount).toBe(0);
    });

    test('should retrieve questions with pagination', async () => {
      const result = await databaseService.getQuestions({}, { page: 1, limit: 10 });
      
      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(typeof result.pagination.total).toBe('number');
    });

    test('should mark question as used', async () => {
      // First create a question
      const questionData = {
        text: 'How does machine consciousness differ from human consciousness?',
        generatedBy: 'Grok' as AIModelName
      };

      const question = await databaseService.createQuestion(questionData);
      const originalUsageCount = question.usageCount;

      // Mark as used
      const updatedQuestion = await databaseService.markQuestionAsUsed((question._id as any).toString());
      
      expect(updatedQuestion).toBeDefined();
      expect(updatedQuestion!.usageCount).toBe(originalUsageCount + 1);
      expect(updatedQuestion!.lastUsed).toBeDefined();
    });
  });

  describe('Dialogue Operations', () => {
    test('should create a new dialogue', async () => {
      const dialogueData = {
        question: 'What is the meaning of existence?',
        responses: [
          {
            aiName: 'GPT-4',
            model: 'OpenAI' as AIModelName,
            version: '4.0',
            text: 'Existence is a fundamental aspect of being, encompassing all that is real and perceivable.',
            prompt: 'Answer philosophically about existence',
            language: 'en' as const,
            responseTime: 1500,
            tokens: 25
          }
        ],
        languages: ['en' as const],
        tags: ['philosophy', 'existence']
      };

      const dialogue = await databaseService.createDialogue(dialogueData);
      
      expect(dialogue._id).toBeDefined();
      expect(dialogue.question).toBe(dialogueData.question);
      expect(dialogue.responses).toHaveLength(1);
      expect(dialogue.responses[0]?.model).toBe('OpenAI');
      expect(dialogue.status).toBe('pending');
      expect(dialogue.version).toBe(1);
    });

    test('should retrieve dialogues with filtering', async () => {
      const result = await databaseService.getDialogues(
        { status: 'pending', tags: ['philosophy'] },
        { page: 1, limit: 5 }
      );
      
      expect(result.data).toBeDefined();
      expect(result.pagination.limit).toBe(5);
      
      // Check that all returned dialogues match the filter
      result.data.forEach(dialogue => {
        expect(dialogue.status).toBe('pending');
        expect(dialogue.tags).toContain('philosophy');
      });
    });
  });

  describe('Error Logging', () => {
    test('should log errors with metadata', async () => {
      const errorLog = await databaseService.logError(
        'Test API timeout error',
        'high',
        'api',
        {
          model: 'OpenAI' as AIModelName,
          endpoint: '/api/generate',
          duration: 30000,
          errorCode: 'TIMEOUT'
        }
      );

      expect(errorLog._id).toBeDefined();
      expect(errorLog.error).toBe('Test API timeout error');
      expect(errorLog.severity).toBe('high');
      expect(errorLog.category).toBe('api');
      expect(errorLog.model).toBe('OpenAI');
      expect(errorLog.resolved).toBe(false);
    });

    test('should retrieve error statistics', async () => {
      const stats = await databaseService.getErrorStats(7);
      expect(Array.isArray(stats)).toBe(true);
    });
  });

  describe('Rejected Content', () => {
    test('should log rejected content', async () => {
      const rejectedContent = await databaseService.createRejectedContent({
        contentType: 'question',
        content: { text: 'This is an inappropriate question' },
        reason: 'inappropriate',
        rejectedBy: 'system',
        reasonDetail: 'Contains inappropriate language'
      });

      expect(rejectedContent._id).toBeDefined();
      expect(rejectedContent.contentType).toBe('question');
      expect(rejectedContent.reason).toBe('inappropriate');
      expect(rejectedContent.rejectedBy).toBe('system');
    });

    test('should get rejection statistics', async () => {
      const stats = await databaseService.getRejectedContentStats(30);
      expect(Array.isArray(stats)).toBe(true);
    });
  });

  describe('Analytics', () => {
    test('should get dashboard statistics', async () => {
      const stats = await databaseService.getDashboardStats(7);
      
      expect(stats.dialogues).toBeDefined();
      expect(stats.questions).toBeDefined();
      expect(stats.errors).toBeDefined();
      expect(stats.rejections).toBeDefined();
      
      expect(typeof stats.dialogues.total).toBe('number');
      expect(typeof stats.questions.total).toBe('number');
      expect(typeof stats.errors.total).toBe('number');
      expect(typeof stats.rejections.total).toBe('number');
    });
  });
}); 