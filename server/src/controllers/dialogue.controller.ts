import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { databaseService } from '../services/database.service';
import { DialogueQuery, Language, FeedbackReaction } from '../types';

/**
 * Controller for dialogue-related endpoints
 */
export class DialogueController extends BaseController {

  /**
   * GET /api/dialogues
   * List dialogues with filtering and pagination
   */
  getDialogues = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('getDialogues', req);

    const { page, limit } = this.getPaginationParams(req);
    
    // Parse query parameters
    const query: DialogueQuery = {};
    
    if (req.query.language) {
      query.language = req.query.language as Language;
    }
    if (req.query.status) {
      query.status = req.query.status as any;
    }
    if (req.query.tags) {
      query.tags = this.parseArrayParam(req.query.tags);
    }
    const dateFrom = this.parseDateParam(req.query.dateFrom);
    if (dateFrom) {
      query.dateFrom = dateFrom;
    }
    const dateTo = this.parseDateParam(req.query.dateTo);
    if (dateTo) {
      query.dateTo = dateTo;
    }

    // Parse sort parameter
    const sortParam = req.query.sort as string;
    let sort: any = { date: -1 }; // Default sort by date descending
    
    if (sortParam) {
      const [field, order] = sortParam.split(':');
      if (field && ['date', 'overallQuality', 'responseCount'].includes(field)) {
        sort = { [field]: order === 'asc' ? 1 : -1 };
      }
    }

    try {
      const dialogues = await databaseService.getDialogues(query, { 
        page, 
        limit, 
        sort 
      });

      return this.sendPaginatedResponse(res, dialogues);
    } catch (error) {
      return this.sendError(res, 'Failed to retrieve dialogues');
    }
  });

  /**
   * GET /api/dialogues/:id
   * Get a single dialogue by ID
   */
  getDialogue = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('getDialogue', req, { dialogueId: req.params.id });

    const { id } = req.params;

    if (!id) {
      return this.sendValidationError(res, 'Dialogue ID is required');
    }

    try {
      const dialogue = await databaseService.getDialogue(id);
      
      if (!dialogue) {
        return this.sendNotFound(res, 'Dialogue');
      }

      return this.sendSuccess(res, dialogue);
    } catch (error) {
      return this.sendError(res, 'Failed to retrieve dialogue');
    }
  });

  /**
   * POST /api/dialogues/:id/feedback
   * Add feedback to a dialogue
   */
  addFeedback = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('addFeedback', req, { dialogueId: req.params.id });

    const { id } = req.params;
    const { reaction } = req.body;

    if (!id) {
      return this.sendValidationError(res, 'Dialogue ID is required');
    }

    if (!reaction || !['surprising', 'inspiring', 'coherent', 'confusing', 'profound'].includes(reaction)) {
      return this.sendValidationError(res, 'Valid reaction is required (surprising, inspiring, coherent, confusing, profound)');
    }

    try {
      const dialogue = await databaseService.getDialogue(id);
      
      if (!dialogue) {
        return this.sendNotFound(res, 'Dialogue');
      }

      await dialogue.addFeedback(reaction as FeedbackReaction);

      return this.sendSuccess(res, { message: 'Feedback added successfully' });
    } catch (error) {
      return this.sendError(res, 'Failed to add feedback');
    }
  });

  /**
   * GET /api/dialogues/recent
   * Get recent dialogues (last 7 days)
   */
  getRecentDialogues = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('getRecentDialogues', req);

    const days = parseInt(req.query.days as string) || 7;
    const { page, limit } = this.getPaginationParams(req);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    try {
      const dialogues = await databaseService.getDialogues(
        { dateFrom: cutoff },
        { page, limit, sort: { date: -1 } }
      );

      return this.sendPaginatedResponse(res, dialogues);
    } catch (error) {
      return this.sendError(res, 'Failed to retrieve recent dialogues');
    }
  });

  /**
   * GET /api/dialogues/featured
   * Get high-quality featured dialogues
   */
  getFeaturedDialogues = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('getFeaturedDialogues', req);

    const { page, limit } = this.getPaginationParams(req);

    try {
      const dialogues = await databaseService.getDialogues(
        { status: 'completed' },
        { 
          page, 
          limit, 
          sort: { overallQuality: -1, date: -1 } 
        }
      );

      // Filter for high-quality dialogues (quality > 0.7)
      const featuredDialogues = {
        ...dialogues,
        data: dialogues.data.filter(dialogue => 
          dialogue.overallQuality && dialogue.overallQuality > 0.7
        )
      };

      return this.sendPaginatedResponse(res, featuredDialogues);
    } catch (error) {
      return this.sendError(res, 'Failed to retrieve featured dialogues');
    }
  });

  /**
   * GET /api/dialogues/stats
   * Get dialogue statistics
   */
  getDialogueStats = this.asyncHandler(async (req: Request, res: Response) => {
    this.logAction('getDialogueStats', req);

    const days = parseInt(req.query.days as string) || 30;

    try {
      const stats = await databaseService.getDashboardStats(days);

      return this.sendSuccess(res, {
        period: `${days} days`,
        dialogues: stats.dialogues,
        generatedAt: new Date()
      });
    } catch (error) {
      return this.sendError(res, 'Failed to retrieve dialogue statistics');
    }
  });
}

export const dialogueController = new DialogueController();