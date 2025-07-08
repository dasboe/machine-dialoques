import { Schema, model } from 'mongoose';
import { IQuestion, AIModelName, Language } from '../types';

// Translation subdocument schema
const translationSchema = new Schema({
  language: {
    type: String,
    required: true,
    enum: ['en', 'de', 'es', 'fr', 'zh']
  },
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  }
}, { _id: false });

// Main Question schema
const questionSchema = new Schema<IQuestion>({
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000,
    unique: true // Prevent duplicate questions
  },
  tags: {
    type: [String],
    default: ['philosophy'],
    validate: {
      validator: function(tags: string[]) {
        return tags.length >= 1 && tags.length <= 10;
      },
      message: 'Question must have between 1 and 10 tags'
    }
  },
  lastUsed: {
    type: Date
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Quality scores (0-1 range)
  relevanceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.5
  },
  nonHumanCentricWeight: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.5
  },
  originalityScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  
  // Generation metadata
  generatedBy: {
    type: String,
    required: true,
    enum: ['OpenAI', 'Grok', 'LLaMA', 'Claude', 'HuggingFace']
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  approvedBy: {
    type: [String],
    enum: ['OpenAI', 'Grok', 'LLaMA', 'Claude', 'HuggingFace'],
    default: []
  },
  rejectedBy: {
    type: [String],
    enum: ['OpenAI', 'Grok', 'LLaMA', 'Claude', 'HuggingFace'],
    default: []
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived'],
    default: 'pending',
    required: true
  },
  
  // Language support
  language: {
    type: String,
    enum: ['en', 'de', 'es', 'fr', 'zh'],
    default: 'en',
    required: true
  },
  translations: {
    type: [translationSchema],
    default: []
  }
}, {
  timestamps: true,
  collection: 'questions'
});

// Indexes for performance
questionSchema.index({ status: 1 });
questionSchema.index({ generatedBy: 1 });
questionSchema.index({ language: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ relevanceScore: -1 });
questionSchema.index({ nonHumanCentricWeight: -1 });
questionSchema.index({ usageCount: 1 });
questionSchema.index({ lastUsed: -1 });
questionSchema.index({ generatedAt: -1 });

// Compound indexes
questionSchema.index({ status: 1, relevanceScore: -1 });
questionSchema.index({ status: 1, usageCount: 1 });
questionSchema.index({ tags: 1, status: 1 });

// Text search index
questionSchema.index({ 
  text: 'text',
  tags: 'text'
});

// Unique compound index to prevent duplicate questions per language
questionSchema.index({ text: 1, language: 1 }, { unique: true });

// Virtual for overall quality score
questionSchema.virtual('qualityScore').get(function() {
  // Weighted average: 40% relevance, 30% non-human-centric, 30% originality
  const relevanceWeight = 0.4;
  const nonHumanWeight = 0.3;
  const originalityWeight = 0.3;
  
  return (
    this.relevanceScore * relevanceWeight +
    this.nonHumanCentricWeight * nonHumanWeight +
    (this.originalityScore || 0.5) * originalityWeight
  );
});

// Virtual for approval ratio
questionSchema.virtual('approvalRatio').get(function() {
  const totalVotes = this.approvedBy.length + this.rejectedBy.length;
  if (totalVotes === 0) return 0;
  return this.approvedBy.length / totalVotes;
});

// Virtual for translation count
questionSchema.virtual('translationCount').get(function() {
  return this.translations?.length || 0;
});

// Pre-save middleware
questionSchema.pre('save', function(next) {
  // Auto-approve if 4+ models approved and quality score > 0.7
  if (this.isModified('approvedBy') || this.isModified('rejectedBy')) {
    const approvalRatio = this.get('approvalRatio') as number;
    const qualityScore = this.get('qualityScore') as number;
    
    if (this.approvedBy.length >= 4 && approvalRatio >= 0.67 && qualityScore >= 0.7) {
      this.status = 'approved';
    } else if (this.rejectedBy.length >= 3 || approvalRatio < 0.33) {
      this.status = 'rejected';
    }
  }
  
  next();
});

// Instance methods
questionSchema.methods.addApproval = function(model: AIModelName) {
  if (!this.approvedBy.includes(model) && !this.rejectedBy.includes(model)) {
    this.approvedBy.push(model);
    return this.save();
  }
  return Promise.resolve(this);
};

questionSchema.methods.addRejection = function(model: AIModelName) {
  if (!this.rejectedBy.includes(model) && !this.approvedBy.includes(model)) {
    this.rejectedBy.push(model);
    return this.save();
  }
  return Promise.resolve(this);
};

questionSchema.methods.markAsUsed = function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return this.save();
};

questionSchema.methods.addTranslation = function(language: Language, text: string) {
  const existingTranslation = this.translations?.find((t: any) => t.language === language);
  
  if (existingTranslation) {
    existingTranslation.text = text;
  } else {
    this.translations = this.translations || [];
    this.translations.push({ language, text });
  }
  
  return this.save();
};

// Static methods
questionSchema.statics.findApproved = function() {
  return this.find({ status: 'approved' });
};

questionSchema.statics.findByQuality = function(minScore: number = 0.7) {
  return this.aggregate([
    {
      $addFields: {
        qualityScore: {
          $add: [
            { $multiply: ['$relevanceScore', 0.4] },
            { $multiply: ['$nonHumanCentricWeight', 0.3] },
            { $multiply: [{ $ifNull: ['$originalityScore', 0.5] }, 0.3] }
          ]
        }
      }
    },
    {
      $match: {
        qualityScore: { $gte: minScore }
      }
    },
    {
      $sort: { qualityScore: -1 }
    }
  ]);
};

questionSchema.statics.findUnused = function(days: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return this.find({
    $or: [
      { lastUsed: null },
      { lastUsed: { $lt: cutoff } }
    ],
    status: 'approved'
  }).sort({ usageCount: 1, qualityScore: -1 });
};

questionSchema.statics.getRandomApproved = function(count: number = 1) {
  return this.aggregate([
    { $match: { status: 'approved' } },
    { $sample: { size: count } }
  ]);
};

export const Question = model<IQuestion>('Question', questionSchema);
export default Question; 