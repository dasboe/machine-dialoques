import { Document, Types } from 'mongoose';

// ==========================================
// Core Types
// ==========================================

export type AIModelName = 'OpenAI' | 'Grok' | 'LLaMA' | 'Claude' | 'HuggingFace';
export type Language = 'en' | 'de' | 'es' | 'fr' | 'zh';
export type FeedbackReaction = 'surprising' | 'inspiring' | 'coherent' | 'confusing' | 'profound';

// ==========================================
// AI Response Interface
// ==========================================

export interface AIResponse {
  aiName: string;
  model: AIModelName;
  version: string;
  text: string;
  prompt: string;
  language: Language;
  responseTime?: number; // in milliseconds
  tokens?: number;
  confidence?: number; // 0-1 score
  qualityMetrics?: {
    relevance: number;
    coherence: number;
    originality: number;
  };
}

// ==========================================
// Feedback Interface
// ==========================================

export interface FeedbackEntry {
  reaction: FeedbackReaction;
  count: number;
  lastUpdated: Date;
}

// ==========================================
// Dialogue Document Interface
// ==========================================

export interface IDialogue extends Document {
  question: string;
  responses: AIResponse[];
  chosenAnswer?: Types.ObjectId | string;
  summary?: string;
  languages: Language[];
  date: Date;
  feedback: FeedbackEntry[];
  
  // Quality metrics
  overallQuality?: number;
  engagementLevel?: number;
  
  // Metadata
  generationTime?: number; // Total time to generate dialogue
  status: 'pending' | 'completed' | 'failed';
  tags: string[];
  
  // Version tracking
  version: number;
  
  // Instance methods
  addFeedback(reaction: FeedbackReaction): Promise<IDialogue>;
  getTopResponse(): AIResponse | null;
}

// ==========================================
// Question Document Interface
// ==========================================

export interface IQuestion extends Document {
  text: string;
  tags: string[];
  lastUsed?: Date;
  usageCount: number;
  
  // Quality scores
  relevanceScore: number; // 0-1
  nonHumanCentricWeight: number; // 0-1
  originalityScore?: number; // 0-1
  
  // Generation metadata
  generatedBy: AIModelName;
  generatedAt: Date;
  approvedBy: AIModelName[];
  rejectedBy: AIModelName[];
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  
  // Language and variants
  language: Language;
  translations?: {
    language: Language;
    text: string;
  }[];
  
  // Instance methods
  addApproval(model: AIModelName): Promise<IQuestion>;
  addRejection(model: AIModelName): Promise<IQuestion>;
  markAsUsed(): Promise<IQuestion>;
  addTranslation(language: Language, text: string): Promise<IQuestion>;
}

// ==========================================
// Rejected Content Interface
// ==========================================

export type RejectionReason = 
  | 'hate_speech' 
  | 'incitement' 
  | 'distress' 
  | 'low_quality' 
  | 'irrelevant' 
  | 'duplicate' 
  | 'inappropriate'
  | 'technical_error';

export interface IRejectedContent extends Document {
  contentType: 'question' | 'response';
  content: IQuestion | AIResponse; // The original content that was rejected
  reason: RejectionReason;
  reasonDetail?: string; // Human-readable explanation
  
  // Context
  rejectedBy: 'system' | 'human' | AIModelName;
  rejectedAt: Date;
  
  // Quality metrics at time of rejection
  qualityMetrics?: {
    relevance?: number;
    coherence?: number;
    originality?: number;
    ethicsScore?: number;
  };
  
  // Related dialogue (if applicable)
  dialogueId?: Types.ObjectId;
}

// ==========================================
// Error Log Interface
// ==========================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'api' | 'database' | 'validation' | 'authentication' | 'system';

export interface IErrorLog extends Document {
  error: string;
  errorCode?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  
  // Context
  aiModel?: AIModelName;
  endpoint?: string;
  userId?: string;
  
  // Error details
  stack?: string;
  metadata?: Record<string, any>;
  
  // Timing
  timestamp: Date;
  duration?: number; // Time until error occurred
  
  // Resolution
  resolved: boolean;
  resolvedAt?: Date;
  resolution?: string;
  
  // Instance methods
  markResolved(resolution?: string): Promise<IErrorLog>;
  isCritical(): boolean;
  isRecent(hours?: number): boolean;
}

// ==========================================
// API Response Types
// ==========================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

// ==========================================
// Quality Control Types
// ==========================================

export interface QualityCheckResult {
  passed: boolean;
  score: number; // 0-1
  details: {
    relevance: number;
    coherence: number;
    originality: number;
    ethics: number;
  };
  flags: string[];
  recommendations?: string[];
}

// ==========================================
// Database Service Types
// ==========================================

export interface CreateDialogueData {
  question: string;
  responses: AIResponse[];
  languages?: Language[];
  tags?: string[];
}

export interface CreateQuestionData {
  text: string;
  tags?: string[];
  generatedBy: AIModelName;
  language?: Language;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  populate?: string[];
}

export interface DialogueQuery {
  language?: Language;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  status?: IDialogue['status'];
}

export interface QuestionQuery {
  language?: Language;
  tags?: string[];
  status?: IQuestion['status'];
  generatedBy?: AIModelName;
} 