import { databaseService } from '../../services/database.service';
import { 
  createQuestionFixture, 
  createDialogueFixture, 
  createMultipleQuestions,
  createMultipleDialogues 
} from '../fixtures';
import { IDialogue, IQuestion, IErrorLog, IRejectedContent } from '../../types';

/**
 * Database Test Utilities
 */
export class TestDbUtils {
  
  /**
   * Create and save a test question
   */
  static async createTestQuestion(overrides = {}) {
    const questionData = createQuestionFixture(overrides);
    return await databaseService.createQuestion(questionData);
  }

  /**
   * Create and save a test dialogue
   */
  static async createTestDialogue(overrides = {}) {
    const dialogueData = createDialogueFixture(overrides);
    return await databaseService.createDialogue(dialogueData);
  }

  /**
   * Create multiple test questions
   */
  static async createTestQuestions(count: number, overrides = {}) {
    const questionsData = createMultipleQuestions(count);
    const questions: IQuestion[] = [];
    
    for (const questionData of questionsData) {
      const question = await databaseService.createQuestion({ ...questionData, ...overrides });
      questions.push(question);
    }
    
    return questions;
  }

  /**
   * Create multiple test dialogues
   */
  static async createTestDialogues(count: number, overrides = {}) {
    const dialoguesData = createMultipleDialogues(count);
    const dialogues: IDialogue[] = [];
    
    for (const dialogueData of dialoguesData) {
      const dialogue = await databaseService.createDialogue({ ...dialogueData, ...overrides });
      dialogues.push(dialogue);
    }
    
    return dialogues;
  }

  /**
   * Create test error log
   */
  static async createTestError(overrides = {}) {
    return await databaseService.logError(
      'Test error message',
      'medium',
      'system',
      { ...overrides }
    );
  }

  /**
   * Create test rejected content
   */
  static async createTestRejectedContent(overrides = {}) {
    return await databaseService.createRejectedContent({
      contentType: 'question',
      content: { text: 'Test rejected content' },
      reason: 'inappropriate',
      rejectedBy: 'system',
      reasonDetail: 'Test rejection reason',
      ...overrides
    });
  }

  /**
   * Get database health status
   */
  static async getHealthStatus() {
    return await databaseService.healthCheck();
  }

  /**
   * Clear all test data
   */
  static async clearAllData() {
    const mongoose = await import('mongoose');
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }
  }
}

/**
 * Validation Test Utilities
 */
export class TestValidationUtils {
  
  /**
   * Validate question structure
   */
  static validateQuestion(question: IQuestion) {
    expect(question).toBeDefined();
    expect(question._id).toBeValidObjectId();
    expect(question.text).toBeDefined();
    expect(question.text.length).toBeGreaterThan(10);
    expect(question.tags).toBeDefined();
    expect(Array.isArray(question.tags)).toBe(true);
    expect(question.generatedBy).toBeDefined();
    expect(question.status).toBeDefined();
    expect(['pending', 'approved', 'rejected', 'archived']).toContain(question.status);
    expect(question.usageCount).toBeGreaterThanOrEqual(0);
    expect(question.relevanceScore).toBeGreaterThanOrEqual(0);
    expect(question.relevanceScore).toBeLessThanOrEqual(1);
    expect(question.nonHumanCentricWeight).toBeGreaterThanOrEqual(0);
    expect(question.nonHumanCentricWeight).toBeLessThanOrEqual(1);
  }

  /**
   * Validate dialogue structure
   */
  static validateDialogue(dialogue: IDialogue) {
    expect(dialogue).toBeDefined();
    expect(dialogue._id).toBeValidObjectId();
    expect(dialogue.question).toBeDefined();
    expect(dialogue.question.length).toBeGreaterThan(10);
    expect(dialogue.responses).toBeDefined();
    expect(Array.isArray(dialogue.responses)).toBe(true);
    expect(dialogue.responses.length).toBeGreaterThan(0);
    expect(dialogue.status).toBeDefined();
    expect(['pending', 'completed', 'failed']).toContain(dialogue.status);
    expect(dialogue.version).toBeGreaterThanOrEqual(1);
    expect(dialogue.languages).toBeDefined();
    expect(Array.isArray(dialogue.languages)).toBe(true);
    
    // Validate first response
    if (dialogue.responses.length > 0) {
      const response = dialogue.responses[0];
      if (response) {
        expect(response.aiName).toBeDefined();
        expect(response.model).toBeDefined();
        expect(response.version).toBeDefined();
        expect(response.text).toBeDefined();
        expect(response.prompt).toBeDefined();
        expect(response.language).toBeDefined();
      }
    }
  }

  /**
   * Validate error log structure
   */
  static validateErrorLog(errorLog: IErrorLog) {
    expect(errorLog).toBeDefined();
    expect(errorLog._id).toBeValidObjectId();
    expect(errorLog.error).toBeDefined();
    expect(errorLog.severity).toBeDefined();
    expect(['low', 'medium', 'high', 'critical']).toContain(errorLog.severity);
    expect(errorLog.category).toBeDefined();
    expect(['api', 'database', 'validation', 'authentication', 'system']).toContain(errorLog.category);
    expect(errorLog.timestamp).toBeDefined();
    expect(typeof errorLog.resolved).toBe('boolean');
  }

  /**
   * Validate rejected content structure
   */
  static validateRejectedContent(rejectedContent: IRejectedContent) {
    expect(rejectedContent).toBeDefined();
    expect(rejectedContent._id).toBeValidObjectId();
    expect(rejectedContent.contentType).toBeDefined();
    expect(['question', 'response']).toContain(rejectedContent.contentType);
    expect(rejectedContent.content).toBeDefined();
    expect(rejectedContent.reason).toBeDefined();
    expect(rejectedContent.rejectedBy).toBeDefined();
    expect(rejectedContent.rejectedAt).toBeDefined();
  }

  /**
   * Validate pagination response
   */
  static validatePaginationResponse(response: any, expectedPage = 1, expectedLimit = 20) {
    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.pagination).toBeDefined();
    expect(response.pagination.page).toBe(expectedPage);
    expect(response.pagination.limit).toBe(expectedLimit);
    expect(typeof response.pagination.total).toBe('number');
    expect(typeof response.pagination.totalPages).toBe('number');
    expect(typeof response.pagination.hasNext).toBe('boolean');
    expect(typeof response.pagination.hasPrev).toBe('boolean');
  }
}

/**
 * Performance Test Utilities
 */
export class TestPerformanceUtils {
  
  /**
   * Time an async operation
   */
  static async timeOperation<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await operation();
    const duration = Date.now() - start;
    return { result, duration };
  }

  /**
   * Test operation performance
   */
  static async expectOperationToBefast<T>(
    operation: () => Promise<T>, 
    maxDurationMs: number = 1000
  ): Promise<T> {
    const { result, duration } = await this.timeOperation(operation);
    expect(duration).toBeLessThan(maxDurationMs);
    return result;
  }

  /**
   * Test database query performance
   */
  static async testQueryPerformance(
    queryName: string,
    query: () => Promise<any>,
    maxDurationMs: number = 500
  ) {
    console.log(`🔍 Testing ${queryName} performance...`);
    const { result, duration } = await this.timeOperation(query);
    console.log(`⚡ ${queryName} completed in ${duration}ms`);
    expect(duration).toBeLessThan(maxDurationMs);
    return result;
  }
}

/**
 * Mock and Spy Utilities
 */
export class TestMockUtils {
  
  /**
   * Create mock AI response
   */
  static createMockAIResponse(overrides = {}) {
    return {
      aiName: 'Mock-AI',
      model: 'OpenAI' as const,
      version: '1.0',
      text: 'Mock AI response for testing',
      prompt: 'Mock prompt',
      language: 'en' as const,
      responseTime: 1000,
      tokens: 20,
      confidence: 0.8,
      qualityMetrics: {
        relevance: 0.8,
        coherence: 0.7,
        originality: 0.9
      },
      ...overrides
    };
  }

  /**
   * Create console spy for testing logs
   */
  static createConsoleSpy() {
    return {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation()
    };
  }

  /**
   * Restore all console spies
   */
  static restoreConsoleSpy(spy: any) {
    Object.values(spy).forEach((s: any) => s.mockRestore());
  }
}

// Export all utilities
export const testDb = TestDbUtils;
export const testValidation = TestValidationUtils;
export const testPerformance = TestPerformanceUtils;
export const testMock = TestMockUtils; 