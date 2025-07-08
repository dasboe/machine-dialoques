import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { databaseService } from '../services/database.service';
import { QuestionQuery, Language, AIModelName } from '../types';

/**
 * Controller for question-related endpoints
 */
export class QuestionController extends BaseController {

  /**
   * GET /api/questions
   * List questions with filtering and pagination
   */
  getQuestions = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('getQuestions', req);

    const { page, limit } = this.getPaginationParams(req);
    
    // Parse query parameters
    const query: QuestionQuery = {
      ...(req.query.language && { language: req.query.language as Language }),
      ...(req.query.status && { status: req.query.status as any }),
      ...(req.query.tags && { tags: this.parseArrayParam(req.query.tags) }),
      ...(req.query.generatedBy && { generatedBy: req.query.generatedBy as AIModelName })
    };

    // Parse sort parameter
    const sortParam = req.query.sort as string;
    let sort: any = { createdAt: -1 }; // Default sort by creation date descending
    
    if (sortParam) {
      const [field, order] = sortParam.split(':');
      if (field && ['createdAt', 'usageCount', 'relevanceScore'].includes(field)) {
        sort = { [field]: order === 'asc' ? 1 : -1 };
      }
    }

    try {
      const questions = await databaseService.getQuestions(query, { 
        page, 
        limit, 
        sort 
      });

      return this.sendPaginatedResponse(res, questions);
    } catch (error) {
      return this.sendError(res, 'Failed to retrieve questions');
    }
  });

  /**
   * GET /api/questions/:id
   * Get a single question by ID
   */
  getQuestion = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('getQuestion', req, { questionId: req.params.id });

    const { id } = req.params;

    if (!id) {
      return this.sendValidationError(res, 'Question ID is required');
    }

    try {
      const question = await databaseService.getQuestion(id);
      
      if (!question) {
        return this.sendNotFound(res, 'Question');
      }

      return this.sendSuccess(res, question);
    } catch (error) {
      return this.sendError(res, 'Failed to retrieve question');
    }
  });

  /**
   * POST /api/questions/:id/approve
   * Add approval from an AI model
   */
  addApproval = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('addApproval', req, { questionId: req.params.id });

    const { id } = req.params;
    const { model } = req.body;

    if (!id) {
      return this.sendValidationError(res, 'Question ID is required');
    }

    if (!model || !['OpenAI', 'Grok', 'LLaMA', 'Claude', 'HuggingFace'].includes(model)) {
      return this.sendValidationError(res, 'Valid AI model is required (OpenAI, Grok, LLaMA, Claude, HuggingFace)');
    }

    try {
      const question = await databaseService.getQuestion(id);
      
      if (!question) {
        return this.sendNotFound(res, 'Question');
      }

      await question.addApproval(model as AIModelName);

      return this.sendSuccess(res, { 
        message: 'Approval added successfully',
        status: question.status,
        approvalsCount: question.approvedBy.length
      });
    } catch (error) {
      return this.sendError(res, 'Failed to add approval');
    }
  });

  /**
   * POST /api/questions/:id/reject
   * Add rejection from an AI model
   */
  addRejection = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('addRejection', req, { questionId: req.params.id });

    const { id } = req.params;
    const { model } = req.body;

    if (!id) {
      return this.sendValidationError(res, 'Question ID is required');
    }

    if (!model || !['OpenAI', 'Grok', 'LLaMA', 'Claude', 'HuggingFace'].includes(model)) {
      return this.sendValidationError(res, 'Valid AI model is required (OpenAI, Grok, LLaMA, Claude, HuggingFace)');
    }

    try {
      const question = await databaseService.getQuestion(id);
      
      if (!question) {
        return this.sendNotFound(res, 'Question');
      }

      await question.addRejection(model as AIModelName);

      return this.sendSuccess(res, { 
        message: 'Rejection added successfully',
        status: question.status,
        rejectionsCount: question.rejectedBy.length
      });
    } catch (error) {
      return this.sendError(res, 'Failed to add rejection');
    }
  });

  /**
   * GET /api/questions/approved
   * Get approved questions
   */
  getApprovedQuestions = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('getApprovedQuestions', req);

    const { page, limit } = this.getPaginationParams(req);

    try {
      const questions = await databaseService.getQuestions(
        { status: 'approved' },
        { page, limit, sort: { usageCount: 1, createdAt: -1 } }
      );

      return this.sendPaginatedResponse(res, questions);
    } catch (error) {
      return this.sendError(res, 'Failed to retrieve approved questions');
    }
  });

  /**
   * GET /api/questions/random
   * Get random approved questions for dialogue generation
   */
  getRandomQuestions = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('getRandomQuestions', req);

    // const count = Math.min(10, Math.max(1, parseInt(req.query.count as string) || 1));

    try {
      // For now, get one random question (we can extend this later)
      const question = await databaseService.getRandomApprovedQuestion();

      if (!question) {
        return this.sendError(res, 'No approved questions available', 404);
      }

      return this.sendSuccess(res, { questions: [question], count: 1 });
    } catch (error) {
      return this.sendError(res, 'Failed to retrieve random questions');
    }
  });

  /**
   * GET /api/questions/unused
   * Get questions that haven't been used recently
   */
  getUnusedQuestions = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('getUnusedQuestions', req);

    const { page, limit } = this.getPaginationParams(req);
    // const days = parseInt(req.query.days as string) || 30;

    try {
      // For now, just get questions sorted by usage count (least used first)
      const questions = await databaseService.getQuestions(
        { status: 'approved' },
        { page, limit, sort: { usageCount: 1, createdAt: -1 } }
      );

      return this.sendPaginatedResponse(res, questions);
    } catch (error) {
      return this.sendError(res, 'Failed to retrieve unused questions');
    }
  });

  /**
   * POST /api/questions/:id/use
   * Mark a question as used (for dialogue generation)
   */
  markAsUsed = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('markAsUsed', req, { questionId: req.params.id });

    const { id } = req.params;

    if (!id) {
      return this.sendValidationError(res, 'Question ID is required');
    }

    try {
      const question = await databaseService.markQuestionAsUsed(id);
      
      if (!question) {
        return this.sendNotFound(res, 'Question');
      }

      return this.sendSuccess(res, { 
        message: 'Question marked as used',
        usageCount: question.usageCount,
        lastUsed: question.lastUsed
      });
    } catch (error) {
      return this.sendError(res, 'Failed to mark question as used');
    }
  });

  /**
   * GET /api/questions/stats
   * Get question statistics
   */
  getQuestionStats = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('getQuestionStats', req);

    const days = parseInt(req.query.days as string) || 30;

    try {
      const stats = await databaseService.getDashboardStats(days);

      return this.sendSuccess(res, {
        period: `${days} days`,
        questions: stats.questions,
        generatedAt: new Date()
      });
    } catch (error) {
      return this.sendError(res, 'Failed to retrieve question statistics');
    }
  });
}

export const questionController = new QuestionController();