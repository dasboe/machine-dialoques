import { Schema, model } from 'mongoose';
import { IDialogue, AIResponse, FeedbackEntry } from '../types';

// AI Response subdocument schema
const aiResponseSchema = new Schema<AIResponse>({
  aiName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  model: {
    type: String,
    required: true,
    enum: ['OpenAI', 'Grok', 'LLaMA', 'Claude', 'HuggingFace']
  },
  version: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  text: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 5000
  },
  prompt: {
    type: String,
    required: true,
    maxlength: 2000
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'de', 'es', 'fr', 'zh'],
    default: 'en'
  },
  responseTime: {
    type: Number,
    min: 0
  },
  tokens: {
    type: Number,
    min: 0
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  qualityMetrics: {
    relevance: {
      type: Number,
      min: 0,
      max: 1
    },
    coherence: {
      type: Number,
      min: 0,
      max: 1
    },
    originality: {
      type: Number,
      min: 0,
      max: 1
    }
  }
}, { 
  _id: true,
  timestamps: true 
});

// Feedback subdocument schema
const feedbackSchema = new Schema<FeedbackEntry>({
  reaction: {
    type: String,
    required: true,
    enum: ['surprising', 'inspiring', 'coherent', 'confusing', 'profound']
  },
  count: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Main Dialogue schema
const dialogueSchema = new Schema<IDialogue>({
  question: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  responses: {
    type: [aiResponseSchema],
    required: true,
    validate: {
      validator: function(responses: AIResponse[]) {
        return responses.length >= 1 && responses.length <= 10;
      },
      message: 'Dialogue must have between 1 and 10 responses'
    }
  },
  chosenAnswer: {
    type: Schema.Types.ObjectId,
    ref: 'Response' // References response _id within responses array
  },
  summary: {
    type: String,
    maxlength: 2000
  },
  languages: {
    type: [String],
    enum: ['en', 'de', 'es', 'fr', 'zh'],
    default: ['en']
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  feedback: {
    type: [feedbackSchema],
    default: []
  },
  
  // Quality metrics
  overallQuality: {
    type: Number,
    min: 0,
    max: 1
  },
  engagementLevel: {
    type: Number,
    min: 0,
    max: 1
  },
  
  // Metadata
  generationTime: {
    type: Number,
    min: 0 // in milliseconds
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    required: true
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 10;
      },
      message: 'Maximum 10 tags allowed'
    }
  },
  
  // Version tracking
  version: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: true,
  collection: 'dialogues'
});

// Indexes for performance
dialogueSchema.index({ date: -1 }); // Most recent first
dialogueSchema.index({ status: 1 });
dialogueSchema.index({ tags: 1 });
dialogueSchema.index({ languages: 1 });
dialogueSchema.index({ 'responses.model': 1 });
dialogueSchema.index({ overallQuality: -1 });

// Compound indexes
dialogueSchema.index({ status: 1, date: -1 });
dialogueSchema.index({ tags: 1, date: -1 });

// Text search index
dialogueSchema.index({ 
  question: 'text', 
  'responses.text': 'text',
  summary: 'text'
});

// Virtual for response count
dialogueSchema.virtual('responseCount').get(function() {
  return this.responses.length;
});

// Virtual for average quality
dialogueSchema.virtual('averageQuality').get(function() {
  if (!this.responses.length) return 0;
  
  const totalQuality = this.responses.reduce((sum, response) => {
    if (!response.qualityMetrics) return sum;
    const avgQuality = (
      response.qualityMetrics.relevance + 
      response.qualityMetrics.coherence + 
      response.qualityMetrics.originality
    ) / 3;
    return sum + avgQuality;
  }, 0);
  
  return totalQuality / this.responses.length;
});

// Pre-save middleware to update overallQuality
dialogueSchema.pre('save', function(next) {
  if (this.isModified('responses')) {
    const avgQuality = this.get('averageQuality') as number;
    if (avgQuality > 0) {
      this.overallQuality = avgQuality;
    }
  }
  next();
});

// Methods
dialogueSchema.methods.addFeedback = function(reaction: string) {
  const existingFeedback = this.feedback.find((f: FeedbackEntry) => f.reaction === reaction);
  
  if (existingFeedback) {
    existingFeedback.count += 1;
    existingFeedback.lastUpdated = new Date();
  } else {
    this.feedback.push({
      reaction,
      count: 1,
      lastUpdated: new Date()
    });
  }
  
  return this.save();
};

dialogueSchema.methods.getTopResponse = function() {
  if (!this.responses.length) return null;
  
  return this.responses.reduce((best: AIResponse, current: AIResponse) => {
    const bestScore = best.qualityMetrics ? 
      (best.qualityMetrics.relevance + best.qualityMetrics.coherence + best.qualityMetrics.originality) / 3 : 0;
    const currentScore = current.qualityMetrics ? 
      (current.qualityMetrics.relevance + current.qualityMetrics.coherence + current.qualityMetrics.originality) / 3 : 0;
    
    return currentScore > bestScore ? current : best;
  });
};

// Static methods
dialogueSchema.statics.findByLanguage = function(language: string) {
  return this.find({ languages: language });
};

dialogueSchema.statics.findRecent = function(days: number = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return this.find({ date: { $gte: cutoff } }).sort({ date: -1 });
};

export const Dialogue = model<IDialogue>('Dialogue', dialogueSchema);
export default Dialogue; 