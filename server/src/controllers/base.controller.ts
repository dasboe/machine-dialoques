import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse, PaginatedResponse } from '../types';

/**
 * Base controller class with common functionality
 */
export abstract class BaseController {
  
  /**
   * Wrapper for async route handlers with error handling
   */
  protected asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  /**
   * Send successful response
   */
  protected sendSuccess<T>(res: Response, data: T, message?: string): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date(),
      ...(message && { message })
    };
    return res.json(response);
  }

  /**
   * Send paginated response
   */
  protected sendPaginatedResponse<T>(res: Response, paginatedData: PaginatedResponse<T>): Response {
    const response: ApiResponse<PaginatedResponse<T>> = {
      success: true,
      data: paginatedData,
      timestamp: new Date()
    };
    return res.json(response);
  }

  /**
   * Send error response
   */
  protected sendError(res: Response, message: string, statusCode: number = 500): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
      timestamp: new Date()
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  protected sendValidationError(res: Response, message: string): Response {
    return this.sendError(res, message, 400);
  }

  /**
   * Send not found error response
   */
  protected sendNotFound(res: Response, resource: string = 'Resource'): Response {
    return this.sendError(res, `${resource} not found`, 404);
  }

  /**
   * Parse and validate pagination parameters
   */
  protected getPaginationParams(req: Request): { page: number; limit: number } {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    return { page, limit };
  }

  /**
   * Parse array query parameter
   */
  protected parseArrayParam(param: any): string[] {
    if (!param) return [];
    if (Array.isArray(param)) return param;
    if (typeof param === 'string') return param.split(',').map(s => s.trim());
    return [];
  }

  /**
   * Parse date query parameter
   */
  protected parseDateParam(param: any): Date | undefined {
    if (!param) return undefined;
    const date = new Date(param);
    return isNaN(date.getTime()) ? undefined : date;
  }

  /**
   * Log controller action
   */
  protected logAction(action: string, req: Request, additionalInfo?: any): void {
    logger.info(`Controller action: ${action}`, {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      ...additionalInfo
    });
  }
}