import { Schema, model } from 'mongoose';
import { IRejectedContent } from '../types';

// Quality metrics subdocument schema
const qualityMetricsSchema = new Schema({
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
  },
  ethicsScore: {
    type: Number,
    min: 0,
    max: 1
  }
}, { _id: false });

// Main RejectedContent schema
const rejectedContentSchema = new Schema<IRejectedContent>({
  contentType: {
    type: String,
    required: true,
    enum: ['question', 'response']
  },
  content: {
    type: Schema.Types.Mixed,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'hate_speech',
      'incitement', 
      'distress',
      'low_quality',
      'irrelevant',
      'duplicate',
      'inappropriate',
      'technical_error'
    ]
  },
  reasonDetail: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  
  // Context
  rejectedBy: {
    type: String,
    required: true,
    enum: ['system', 'human', 'OpenAI', 'Grok', 'LLaMA', 'Claude', 'HuggingFace']
  },
  rejectedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Quality metrics at time of rejection
  qualityMetrics: {
    type: qualityMetricsSchema
  },
  
  // Related dialogue (if applicable)
  dialogueId: {
    type: Schema.Types.ObjectId,
    ref: 'Dialogue'
  }
}, {
  timestamps: true,
  collection: 'rejectedcontent'
});

// Indexes for analytics and performance
rejectedContentSchema.index({ reason: 1 });
rejectedContentSchema.index({ contentType: 1 });
rejectedContentSchema.index({ rejectedBy: 1 });
rejectedContentSchema.index({ rejectedAt: -1 });
rejectedContentSchema.index({ dialogueId: 1 });

// Compound indexes for analytics
rejectedContentSchema.index({ reason: 1, rejectedAt: -1 });
rejectedContentSchema.index({ contentType: 1, reason: 1 });
rejectedContentSchema.index({ rejectedBy: 1, reason: 1 });

// Virtual for age in days
rejectedContentSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.rejectedAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static methods for analytics
rejectedContentSchema.statics.getReasonStats = function(days: number = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        rejectedAt: { $gte: cutoff }
      }
    },
    {
      $group: {
        _id: '$reason',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

rejectedContentSchema.statics.getContentTypeStats = function(days: number = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        rejectedAt: { $gte: cutoff }
      }
    },
    {
      $group: {
        _id: {
          contentType: '$contentType',
          reason: '$reason'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

rejectedContentSchema.statics.getTrendsByContentType = function(days: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        rejectedAt: { $gte: cutoff }
      }
    },
    {
      $group: {
        _id: {
          contentType: '$contentType',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$rejectedAt'
            }
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

rejectedContentSchema.statics.getRejectorsPerformance = function(days: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        rejectedAt: { $gte: cutoff }
      }
    },
    {
      $group: {
        _id: '$rejectedBy',
        totalRejections: { $sum: 1 },
        reasonBreakdown: {
          $push: '$reason'
        }
      }
    },
    {
      $addFields: {
        mostCommonReason: {
          $arrayElemAt: [
            {
              $map: {
                input: { $setUnion: ['$reasonBreakdown'] },
                as: 'reason',
                in: {
                  reason: '$$reason',
                  count: {
                    $size: {
                      $filter: {
                        input: '$reasonBreakdown',
                        cond: { $eq: ['$$this', '$$reason'] }
                      }
                    }
                  }
                }
              }
            },
            0
          ]
        }
      }
    },
    {
      $sort: { totalRejections: -1 }
    }
  ]);
};

// Instance methods
rejectedContentSchema.methods.getContentText = function() {
  if (this.contentType === 'question') {
    return this.content.text || 'No text available';
  } else if (this.contentType === 'response') {
    return this.content.text || 'No text available';
  }
  return 'Unknown content type';
};

rejectedContentSchema.methods.isRecentRejection = function(hours: number = 24) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);
  return this.rejectedAt >= cutoff;
};

// Pre-save middleware for validation
rejectedContentSchema.pre('save', function(next) {
  // Validate content structure based on contentType
  if (this.contentType === 'question') {
    if (!this.content.text) {
      return next(new Error('Question content must have text field'));
    }
  } else if (this.contentType === 'response') {
    if (!this.content.text || !this.content.model) {
      return next(new Error('Response content must have text and model fields'));
    }
  }
  
  next();
});

export const RejectedContent = model<IRejectedContent>('RejectedContent', rejectedContentSchema);
export default RejectedContent; 