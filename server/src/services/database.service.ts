import { 
  CreateDialogueData, 
  CreateQuestionData, 
  QueryOptions, 
  DialogueQuery, 
  QuestionQuery,
  PaginatedResponse,
  IDialogue,
  IQuestion,
  IRejectedContent,
  IErrorLog,
  RejectionReason,
  ErrorSeverity,
  ErrorCategory,
  AIModelName
} from '../types';
import { Dialogue } from '../models/Dialogue';
import { Question } from '../models/Question';
import { RejectedContent } from '../models/RejectedContent';
import { ErrorLog } from '../models/ErrorLog';
import { logger } from '../utils/logger';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

export class DatabaseService {
  
  // ==========================================
  // Dialogue Operations
  // ==========================================
  
  async createDialogue(data: CreateDialogueData): Promise<IDialogue> {
    try {
      const dialogue = new Dialogue(data);
      const savedDialogue = await dialogue.save();
      logger.info('Dialogue created successfully', { dialogueId: savedDialogue._id });
      return savedDialogue;
    } catch (error) {
      logger.error('Failed to create dialogue:', error);
      throw new Error(`Failed to create dialogue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDialogue(id: string): Promise<IDialogue | null> {
    try {
      const dialogue = await Dialogue.findById(id);
      return dialogue;
    } catch (error) {
      logger.error('Failed to get dialogue:', error);
      throw new Error(`Failed to get dialogue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDialogues(query: DialogueQuery = {}, options: QueryOptions = {}): Promise<PaginatedResponse<IDialogue>> {
    try {
      const {
        page = 1,
        limit = 20,
        sort = { date: -1 },
        populate = []
      } = options;

      // Build MongoDB query
      const mongoQuery: any = {};
      
      if (query.status) mongoQuery.status = query.status;
      if (query.language) mongoQuery.languages = query.language;
      if (query.tags && query.tags.length > 0) mongoQuery.tags = { $in: query.tags };
      if (query.dateFrom || query.dateTo) {
        mongoQuery.date = {};
        if (query.dateFrom) mongoQuery.date.$gte = query.dateFrom;
        if (query.dateTo) mongoQuery.date.$lte = query.dateTo;
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      let dbQuery = Dialogue.find(mongoQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Apply population
      populate.forEach(field => {
        dbQuery = dbQuery.populate(field);
      });

      const [data, total] = await Promise.all([
        dbQuery.exec(),
        Dialogue.countDocuments(mongoQuery)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to get dialogues:', error);
      throw new Error(`Failed to get dialogues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateDialogue(id: string, updates: Partial<IDialogue>): Promise<IDialogue | null> {
    try {
      const dialogue = await Dialogue.findByIdAndUpdate(
        id,
        { ...updates, $inc: { version: 1 } },
        { new: true, runValidators: true }
      );
      
      if (dialogue) {
        logger.info('Dialogue updated successfully', { dialogueId: id });
      }
      
      return dialogue;
    } catch (error) {
      logger.error('Failed to update dialogue:', error);
      throw new Error(`Failed to update dialogue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteDialogue(id: string): Promise<boolean> {
    try {
      const result = await Dialogue.findByIdAndDelete(id);
      if (result) {
        logger.info('Dialogue deleted successfully', { dialogueId: id });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to delete dialogue:', error);
      throw new Error(`Failed to delete dialogue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==========================================
  // Question Operations
  // ==========================================

  async createQuestion(data: CreateQuestionData): Promise<IQuestion> {
    try {
      const question = new Question(data);
      const savedQuestion = await question.save();
      logger.info('Question created successfully', { questionId: savedQuestion._id });
      return savedQuestion;
    } catch (error) {
      logger.error('Failed to create question:', error);
      throw new Error(`Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getQuestion(id: string): Promise<IQuestion | null> {
    try {
      const question = await Question.findById(id);
      return question;
    } catch (error) {
      logger.error('Failed to get question:', error);
      throw new Error(`Failed to get question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getQuestions(query: QuestionQuery = {}, options: QueryOptions = {}): Promise<PaginatedResponse<IQuestion>> {
    try {
      const {
        page = 1,
        limit = 20,
        sort = { createdAt: -1 }
      } = options;

      // Build MongoDB query
      const mongoQuery: any = {};
      
      if (query.status) mongoQuery.status = query.status;
      if (query.language) mongoQuery.language = query.language;
      if (query.tags && query.tags.length > 0) mongoQuery.tags = { $in: query.tags };
      if (query.generatedBy) mongoQuery.generatedBy = query.generatedBy;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        Question.find(mongoQuery).sort(sort).skip(skip).limit(limit),
        Question.countDocuments(mongoQuery)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to get questions:', error);
      throw new Error(`Failed to get questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getApprovedQuestions(limit: number = 50): Promise<IQuestion[]> {
    try {
      const questions = await Question.find({ status: 'approved' })
        .sort({ qualityScore: -1, usageCount: 1 })
        .limit(limit);
      return questions;
    } catch (error) {
      logger.error('Failed to get approved questions:', error);
      throw new Error(`Failed to get approved questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRandomApprovedQuestion(): Promise<IQuestion | null> {
    try {
      const questions = await Question.aggregate([
        { $match: { status: 'approved' } },
        { $sample: { size: 1 } }
      ]);
      return questions.length > 0 ? questions[0] : null;
    } catch (error) {
      logger.error('Failed to get random approved question:', error);
      throw new Error(`Failed to get random approved question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async markQuestionAsUsed(id: string): Promise<IQuestion | null> {
    try {
      const question = await Question.findById(id);
      if (question) {
        const updatedQuestion = await question.markAsUsed();
        return updatedQuestion;
      }
      return null;
    } catch (error) {
      logger.error('Failed to mark question as used:', error);
      throw new Error(`Failed to mark question as used: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==========================================
  // Rejected Content Operations
  // ==========================================

  async createRejectedContent(
    data: {
      contentType: 'question' | 'response';
      content: any;
      reason: RejectionReason;
      rejectedBy: string;
      reasonDetail?: string;
      dialogueId?: string;
    }
  ): Promise<IRejectedContent> {
    try {
      const rejectedContent = new RejectedContent({
        contentType: data.contentType,
        content: data.content,
        reason: data.reason,
        rejectedBy: data.rejectedBy,
        reasonDetail: data.reasonDetail,
        dialogueId: data.dialogueId ? new Types.ObjectId(data.dialogueId) : undefined
      });

      const saved = await rejectedContent.save();
      logger.info('Rejected content logged', { 
        rejectedContentId: saved._id, 
        reason: data.reason, 
        contentType: data.contentType 
      });
      return saved;
    } catch (error) {
      logger.error('Failed to create rejected content:', error);
      throw new Error(`Failed to create rejected content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRejectedContent(options: QueryOptions = {}): Promise<PaginatedResponse<IRejectedContent>> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 50;
      const skip = (page - 1) * limit;

      const query = RejectedContent.find({});
      
      if (options.sort) {
        query.sort(options.sort);
      } else {
        query.sort({ rejectedAt: -1 });
      }

      const [data, total] = await Promise.all([
        query.skip(skip).limit(limit).exec(),
        RejectedContent.countDocuments({})
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to get rejected content:', error);
      throw new Error(`Failed to get rejected content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRejectionStatistics(days: number = 7): Promise<any[]> {
    try {
      const stats = await (RejectedContent as any).getReasonStats(days);
      return stats;
    } catch (error) {
      logger.error('Failed to get rejection statistics:', error);
      throw new Error(`Failed to get rejection statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRejectedContentStats(days: number = 30): Promise<any> {
    try {
      const stats = await (RejectedContent as any).getReasonStats(days);
      return stats;
    } catch (error) {
      logger.error('Failed to get rejected content stats:', error);
      throw new Error(`Failed to get rejected content stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==========================================
  // Error Log Operations
  // ==========================================

  async logError(
    error: string,
    severity: ErrorSeverity,
    category: ErrorCategory,
    metadata: {
      model?: AIModelName;
      endpoint?: string;
      userId?: string;
      stack?: string;
      errorCode?: string;
      duration?: number;
      [key: string]: any;
    } = {}
  ): Promise<IErrorLog> {
    try {
      const errorLog = new ErrorLog({
        error,
        severity,
        category,
        aiModel: metadata.model,
        endpoint: metadata.endpoint,
        userId: metadata.userId,
        stack: metadata.stack,
        errorCode: metadata.errorCode,
        duration: metadata.duration,
        metadata: Object.fromEntries(
          Object.entries(metadata).filter(([key]) => 
            !['model', 'endpoint', 'userId', 'stack', 'errorCode', 'duration'].includes(key)
          )
        )
      });

      const saved = await errorLog.save();
      logger.error('Error logged to database', { 
        errorLogId: saved._id, 
        severity, 
        category 
      });
      return saved;
    } catch (dbError) {
      logger.error('Failed to log error to database:', dbError);
      // Don't throw here to prevent infinite loops
      throw new Error(`Failed to log error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }
  }

  async getErrorStats(days: number = 7): Promise<any> {
    try {
      const stats = await (ErrorLog as any).getErrorStats(days);
      return stats;
    } catch (error) {
      logger.error('Failed to get error stats:', error);
      throw new Error(`Failed to get error stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCriticalErrors(hours: number = 24): Promise<IErrorLog[]> {
    try {
      const errors = await (ErrorLog as any).getCriticalErrors(hours);
      return errors;
    } catch (error) {
      logger.error('Failed to get critical errors:', error);
      throw new Error(`Failed to get critical errors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==========================================
  // Analytics and Aggregation
  // ==========================================

  async getDashboardStats(days: number = 7): Promise<{
    dialogues: { total: number; completed: number; failed: number };
    questions: { total: number; approved: number; pending: number };
    errors: { total: number; critical: number; resolved: number };
    rejections: { total: number; byReason: any[] };
  }> {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const [dialogueStats, questionStats, errorStats, rejectionStats] = await Promise.all([
        // Dialogue stats
        Dialogue.aggregate([
          { $match: { date: { $gte: cutoff } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
              failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
            }
          }
        ]),

        // Question stats
        Question.aggregate([
          { $match: { createdAt: { $gte: cutoff } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
              pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
            }
          }
        ]),

        // Error stats
        ErrorLog.aggregate([
          { $match: { timestamp: { $gte: cutoff } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
              resolved: { $sum: { $cond: [{ $eq: ['$resolved', true] }, 1, 0] } }
            }
          }
        ]),

        // Rejection stats
        (RejectedContent as any).getReasonStats(days)
      ]);

      return {
        dialogues: dialogueStats[0] || { total: 0, completed: 0, failed: 0 },
        questions: questionStats[0] || { total: 0, approved: 0, pending: 0 },
        errors: errorStats[0] || { total: 0, critical: 0, resolved: 0 },
        rejections: { total: rejectionStats.length, byReason: rejectionStats }
      };
    } catch (error) {
      logger.error('Failed to get dashboard stats:', error);
      throw new Error(`Failed to get dashboard stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==========================================
  // Health Check
  // ==========================================

  async healthCheck(): Promise<{
    database: 'connected' | 'disconnected';
    collections: { [key: string]: number };
    lastError?: Date;
  }> {
    try {
      // Check database connection
      const readyState = mongoose.connection.readyState;
      
      // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      const isConnected = readyState === 1;

      if (!isConnected) {
        return {
          database: 'disconnected',
          collections: {}
        };
      }

      // Get collection counts
      const [dialogues, questions, rejectedContent, errorLogs] = await Promise.all([
        Dialogue.countDocuments(),
        Question.countDocuments(), 
        RejectedContent.countDocuments(),
        ErrorLog.countDocuments()
      ]);

      // Get last error if any
      const lastErrorLog = await ErrorLog.findOne().sort({ timestamp: -1 });
      const lastError = lastErrorLog?.timestamp;

      return {
        database: 'connected' as const,
        collections: {
          dialogues,
          questions,
          rejectedContent,
          errorLogs
        },
        ...(lastError && { lastError })
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        database: 'disconnected' as const,
        collections: {},
        lastError: new Date()
      };
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService(); 