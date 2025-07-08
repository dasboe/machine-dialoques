import { databaseService } from '../services/database.service';
import { testDb, testValidation, testPerformance } from './utils';
import { createQuestionFixture, createDialogueFixture, getTestDates } from './fixtures';
import { AIModelName, IQuestion } from '../types';

describe('Database Integration Tests', () => {
  
  describe('Health and Connection', () => {
    it('should connect to test database successfully', async () => {
      const health = await databaseService.healthCheck();
      expect(health.database).toBe('connected');
      expect(health.collections).toBeDefined();
    });

    it('should return accurate collection counts', async () => {
      // Create some test data
      await testDb.createTestQuestion();
      await testDb.createTestDialogue();
      
      const health = await databaseService.healthCheck();
      expect(health.collections.questions).toBeGreaterThan(0);
      expect(health.collections.dialogues).toBeGreaterThan(0);
    });
  });

  describe('Question Management Workflow', () => {
    it('should create, approve, and use questions in complete workflow', async () => {
      // 1. Create a question and verify workflow
      const questionData = createQuestionFixture();
      const question = await databaseService.createQuestion(questionData);
      
      // 2. Verify it appears in pending questions
      const pendingQuestions = await databaseService.getQuestions({ status: 'pending' });
      expect(pendingQuestions.data.length).toBeGreaterThan(0);
      expect(pendingQuestions.data[0]?.status).toBe('pending');
      
      // Test question approval workflow
      const questionFromDb = await databaseService.getQuestion((question._id as any).toString());
      expect(questionFromDb).toBeDefined();
      
      // 3. Add approvals from multiple AI models
      await questionFromDb!.addApproval('OpenAI' as AIModelName);
      await questionFromDb!.addApproval('Claude' as AIModelName);
      await questionFromDb!.addApproval('Grok' as AIModelName);
      await questionFromDb!.addApproval('LLaMA' as AIModelName);
      
      // Question should auto-approve with 4+ approvals and good quality
      const approvedQuestion = await databaseService.getQuestion((question._id as any).toString());
      expect(approvedQuestion!.status).toBe('approved');
      expect(approvedQuestion!.approvedBy.length).toBe(4);
      
      // 4. Use the question in dialogue generation
      const usedQuestion = await databaseService.markQuestionAsUsed((question._id as any).toString());
      expect(usedQuestion!.usageCount).toBe(1);
      expect(usedQuestion!.lastUsed).toBeDefined();
      
      // 5. Verify approved questions are retrievable
      const approvedQuestions = await databaseService.getApprovedQuestions();
      expect(approvedQuestions.length).toBeGreaterThan(0);
      expect(approvedQuestions[0]?.status).toBe('approved');
      
      // Test rejection workflow
      const rejectQuestionData = createQuestionFixture({
        text: 'This is a test question for rejection workflow'
      });
      const question2 = await databaseService.createQuestion(rejectQuestionData);
      
      // Add rejections
      await question2.addRejection('OpenAI' as AIModelName);
      await question2.addRejection('Claude' as AIModelName);
      await question2.addRejection('Grok' as AIModelName);
      
      const rejectedQuestion = await databaseService.getQuestion((question2._id as any).toString());
      expect(rejectedQuestion!.status).toBe('rejected');
      expect(rejectedQuestion!.rejectedBy.length).toBe(3);
    });
  });

  describe('Dialogue Generation Workflow', () => {
    it('should create and manage complete dialogue lifecycle', async () => {
      // 1. Create dialogue with multiple AI responses
      const dialogueData = createDialogueFixture({
        question: 'How should AI systems approach ethical decision-making?',
        responses: [
          {
            aiName: 'GPT-4',
            model: 'OpenAI' as AIModelName,
            version: '4.0',
            text: 'Ethical AI decision-making requires a framework that balances multiple moral principles...',
            prompt: 'Respond ethically about AI decision-making',
            language: 'en' as const,
            responseTime: 1200,
            tokens: 50,
            qualityMetrics: { relevance: 0.95, coherence: 0.90, originality: 0.85 }
          },
          {
            aiName: 'Claude-2',
            model: 'Claude' as AIModelName,
            version: '2.0',
            text: 'I believe ethical AI systems should prioritize transparency and human welfare...',
            prompt: 'Respond ethically about AI decision-making',
            language: 'en' as const,
            responseTime: 1000,
            tokens: 45,
            qualityMetrics: { relevance: 0.92, coherence: 0.88, originality: 0.78 }
          }
        ]
      });

      const dialogue = await databaseService.createDialogue(dialogueData);
      testValidation.validateDialogue(dialogue);
      expect(dialogue.responses.length).toBe(2);
      expect(dialogue.status).toBe('pending');

      // Complete the dialogue
      const completedDialogue = await databaseService.updateDialogue(
        (dialogue._id as any).toString(),
        { status: 'completed' }
      );
      expect(completedDialogue!.status).toBe('completed');
      
      // Add user feedback
      await completedDialogue!.addFeedback('inspiring');
      await completedDialogue!.addFeedback('coherent');
      await completedDialogue!.addFeedback('inspiring'); // Second time
      
      const feedbackDialogue = await databaseService.getDialogue((dialogue._id as any).toString());
      expect(feedbackDialogue!.feedback).toHaveLength(2);
      expect(feedbackDialogue!.feedback.find(f => f.reaction === 'inspiring')?.count).toBe(2);
      
      const topResponse = feedbackDialogue!.getTopResponse();
      expect(topResponse).toBeDefined();
    });

    it('should filter and query dialogues effectively', async () => {
      const { oneWeekAgo, now } = getTestDates();
      
      // Create dialogues with different properties
      await testDb.createTestDialogues(3, { 
        tags: ['philosophy', 'consciousness'],
        languages: ['en']
      });
      await testDb.createTestDialogues(2, { 
        tags: ['ethics', 'morality'],
        languages: ['en']
      });

      // Test filtering by tags
      const philosophyDialogues = await databaseService.getDialogues(
        { tags: ['philosophy'] },
        { page: 1, limit: 10 }
      );
      testValidation.validatePaginationResponse(philosophyDialogues);
      expect(philosophyDialogues.data.length).toBe(3);

      // Test filtering by date range
      const recentDialogues = await databaseService.getDialogues(
        { dateFrom: oneWeekAgo, dateTo: now },
        { page: 1, limit: 10 }
      );
      expect(recentDialogues.data.length).toBeGreaterThan(0);

      // Test pagination
      const firstPage = await databaseService.getDialogues({}, { page: 1, limit: 2 });
      expect(firstPage.data.length).toBeLessThanOrEqual(2);
      expect(firstPage.pagination.page).toBe(1);
    });
  });

  describe('Quality Control and Analytics', () => {
    it('should track and analyze rejected content', async () => {
      // Create various rejected content
      await databaseService.createRejectedContent({
        contentType: 'question',
        content: { text: 'Inappropriate question content' },
        reason: 'inappropriate',
        rejectedBy: 'system',
        reasonDetail: 'Contains inappropriate language'
      });

      await databaseService.createRejectedContent({
        contentType: 'response',
        content: { text: 'Low quality response', model: 'OpenAI' },
        reason: 'low_quality',
        rejectedBy: 'OpenAI',
        reasonDetail: 'Response lacks depth and relevance'
      });

      // Get rejection statistics
      const rejectionStats = await databaseService.getRejectedContentStats(30);
      expect(Array.isArray(rejectionStats)).toBe(true);
      expect(rejectionStats.length).toBeGreaterThan(0);
      
      // Should have reason breakdown
      const inappropriateRejections = rejectionStats.find((stat: any) => stat._id === 'inappropriate');
      expect(inappropriateRejections).toBeDefined();
      expect(inappropriateRejections.count).toBeGreaterThan(0);
    });

    it('should provide comprehensive dashboard analytics', async () => {
      // Create test data for analytics
      await testDb.createTestQuestions(5, { status: 'approved' });
      await testDb.createTestQuestions(3, { status: 'pending' });
      await testDb.createTestDialogues(4, { status: 'completed' });
      await testDb.createTestDialogues(1, { status: 'failed' });
      await testDb.createTestError({ severity: 'critical' });
      await testDb.createTestError({ severity: 'medium' });

      const dashboardStats = await databaseService.getDashboardStats(7);
      
      expect(dashboardStats.questions.approved).toBe(5);
      expect(dashboardStats.questions.pending).toBe(3);
      expect(dashboardStats.dialogues.completed).toBe(4);
      expect(dashboardStats.dialogues.failed).toBe(1);
      expect(dashboardStats.errors.total).toBeGreaterThan(0);
    });

    it('should track error logs and resolution', async () => {
      // Log an error with test data
      const errorData = {
        error: 'Test API timeout error',
        severity: 'high' as const,
        category: 'api' as const,
        metadata: {
          aiModel: 'OpenAI' as const,
          endpoint: '/api/generate',
          duration: 30000,
          errorCode: 'TIMEOUT'
        }
      };

      // Log the error
      const errorLog = await databaseService.logError(
        errorData.error,
        errorData.severity,
        errorData.category,
        errorData.metadata
      );
      expect(errorLog.resolved).toBe(false);

      // Mark as resolved
      await errorLog.markResolved('Increased timeout settings');
      expect(errorLog.resolved).toBe(true);
      expect(errorLog.resolution).toBe('Increased timeout settings');

      // Get error statistics  
      const errorStats = await databaseService.getErrorStats();
      expect(Array.isArray(errorStats)).toBe(true);
    });

    it('should handle content workflow with rejections', async () => {
      // Create some test content that would be rejected
      await databaseService.createRejectedContent({
        contentType: 'question',
        content: { text: 'Inappropriate question content' },
        reason: 'inappropriate',
        rejectedBy: 'system',
        reasonDetail: 'Contains inappropriate language'
      });

      await databaseService.createRejectedContent({
        contentType: 'response',
        content: { text: 'Low quality response', model: 'OpenAI' },
        reason: 'low_quality',
        rejectedBy: 'OpenAI',
        reasonDetail: 'Response lacks depth and relevance'
      });

      // Get rejection statistics
      const rejectionStats = await databaseService.getRejectionStatistics();
      expect(rejectionStats.length).toBeGreaterThan(0);
      
      const inappropriateRejections = rejectionStats.find((stat: { _id: string; count: number }) => stat._id === 'inappropriate');
      expect(inappropriateRejections?.count).toBeGreaterThanOrEqual(1);
    });

    it('should handle content filtering during dialogue creation', async () => {
      const questionData = createQuestionFixture();
      const question = await databaseService.createQuestion(questionData);
      
      const dialogue = await databaseService.createDialogue({
        question: question.text,
        responses: createDialogueFixture().responses,
        tags: ['test']
      });

      // Simulate content being rejected during dialogue creation
      await databaseService.createRejectedContent({
        contentType: 'response',
        content: { text: 'Bad response', model: 'OpenAI' },
        reason: 'low_quality',
        rejectedBy: 'system',
        reasonDetail: 'Quality too low',
        dialogueId: (dialogue._id as any).toString()
      });

      const rejectedContent = await databaseService.getRejectedContent();
      expect(rejectedContent.data[0]?.dialogueId?.toString()).toBe((dialogue._id as any).toString());
    });

    it('should handle concurrent operations efficiently', async () => {
      // Test concurrent question marking
      const questions = await Promise.all([
        databaseService.createQuestion(createQuestionFixture()),
        databaseService.createQuestion(createQuestionFixture()),
        databaseService.createQuestion(createQuestionFixture())
      ]);

      // Ensure we have valid questions with IDs
      const questionIds = questions.map(q => (q._id as any).toString());

      // Mark all as used concurrently
      await Promise.all([
        databaseService.markQuestionAsUsed(questionIds[0]),
        databaseService.markQuestionAsUsed(questionIds[1]),
        databaseService.markQuestionAsUsed(questionIds[2])
      ]);

      // Verify all were updated
      const finalQuestion = await databaseService.getQuestion(questionIds[0]);
      expect(finalQuestion!.usageCount).toBe(1);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle bulk operations efficiently', async () => {
      const bulkQuestionCreation = async () => {
        const questions: IQuestion[] = [];
        for (let i = 0; i < 10; i++) {
          questions.push(await testDb.createTestQuestion({ 
            text: `Performance test question ${i + 1}` 
          }));
        }
        return questions;
      };

      const questions = await testPerformance.expectOperationToBefast(
        bulkQuestionCreation, 
        5000 // 5 seconds max for 10 questions
      );

      expect(questions.length).toBe(10);
    });

    it('should query large datasets efficiently', async () => {
      // Create 20 test dialogues
      await testDb.createTestDialogues(20);

      const efficientQuery = async () => {
        return await databaseService.getDialogues({}, { page: 1, limit: 10 });
      };

      const result = await testPerformance.testQueryPerformance(
        'paginated dialogue query',
        efficientQuery,
        1000 // 1 second max
      );

      expect(result.data.length).toBe(10);
      expect(result.pagination.total).toBe(20);
    });

    it('should handle complex aggregation queries', async () => {
      // Create test data for aggregation
      await testDb.createTestQuestions(15, { status: 'approved' });
      await testDb.createTestDialogues(10, { status: 'completed' });

      const complexAggregation = async () => {
        return await databaseService.getDashboardStats(30);
      };

      const stats = await testPerformance.testQueryPerformance(
        'dashboard aggregation',
        complexAggregation,
        2000 // 2 seconds max
      );

      expect(stats.questions.approved).toBe(15);
      expect(stats.dialogues.completed).toBe(10);
    });
  });

  describe('Data Integrity and Validation', () => {
    it('should enforce schema validation constraints', async () => {
      // Test question text length validation
      await expect(
        databaseService.createQuestion({
          text: 'Too short',
          generatedBy: 'OpenAI' as AIModelName
        })
      ).rejects.toThrow();

      // Test dialogue response validation
      await expect(
        databaseService.createDialogue({
          question: 'Valid question?',
          responses: [] // Empty responses should fail
        })
      ).rejects.toThrow();
    });

    it('should maintain referential integrity', async () => {
      const dialogue = await testDb.createTestDialogue();
      
      // Create rejected content linked to dialogue
      const rejectedContent = await databaseService.createRejectedContent({
        contentType: 'response',
        content: { text: 'Bad response', model: 'OpenAI' },
        reason: 'low_quality',
        rejectedBy: 'system',
        reasonDetail: 'Quality too low',
        dialogueId: (dialogue._id as any).toString()
      });

      expect(rejectedContent.dialogueId?.toString()).toBe((dialogue._id as any).toString());
    });

    it('should handle concurrent operations safely', async () => {
      const question = await testDb.createTestQuestion();
      
      // Simulate concurrent usage marking
      const concurrentOperations = [
        databaseService.markQuestionAsUsed((question._id as any).toString()),
        databaseService.markQuestionAsUsed((question._id as any).toString()),
        databaseService.markQuestionAsUsed((question._id as any).toString())
      ];

      await Promise.all(concurrentOperations);
      
      const finalQuestion = await databaseService.getQuestion((question._id as any).toString());
      expect(finalQuestion!.usageCount).toBe(3);
    });
  });
}); 