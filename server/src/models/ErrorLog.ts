import { Schema, model } from 'mongoose';
import { IErrorLog } from '../types';

// Main ErrorLog schema
const errorLogSchema = new Schema<IErrorLog>({
  error: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  errorCode: {
    type: String,
    trim: true,
    maxlength: 50
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    required: true
  },
  category: {
    type: String,
    enum: ['api', 'database', 'validation', 'authentication', 'system'],
    required: true
  },
  
  // Context
  aiModel: {
    type: String,
    enum: ['OpenAI', 'Grok', 'LLaMA', 'Claude', 'HuggingFace']
  },
  endpoint: {
    type: String,
    maxlength: 200
  },
  userId: {
    type: String,
    maxlength: 100
  },
  
  // Error details
  stack: {
    type: String,
    maxlength: 10000
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // Timing
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  duration: {
    type: Number,
    min: 0
  },
  
  // Resolution
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  resolution: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true,
  collection: 'errorlogs'
});

// Indexes for performance and analytics
errorLogSchema.index({ timestamp: -1 });
errorLogSchema.index({ severity: 1 });
errorLogSchema.index({ category: 1 });
errorLogSchema.index({ aiModel: 1 });
errorLogSchema.index({ resolved: 1 });
errorLogSchema.index({ errorCode: 1 });

// Compound indexes
errorLogSchema.index({ severity: 1, timestamp: -1 });
errorLogSchema.index({ category: 1, timestamp: -1 });
errorLogSchema.index({ resolved: 1, severity: 1 });
errorLogSchema.index({ aiModel: 1, category: 1 });

// Virtual for age in hours
errorLogSchema.virtual('ageInHours').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.timestamp.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60));
});

// Virtual for resolution time in hours
errorLogSchema.virtual('resolutionTimeHours').get(function() {
  if (!this.resolved || !this.resolvedAt) return null;
  const diffTime = Math.abs(this.resolvedAt.getTime() - this.timestamp.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60));
});

// Static methods for analytics
errorLogSchema.statics.getErrorStats = function(days: number = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: cutoff }
      }
    },
    {
      $group: {
        _id: {
          severity: '$severity',
          category: '$category'
        },
        count: { $sum: 1 },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $eq: ['$resolved', true] },
              { $subtract: ['$resolvedAt', '$timestamp'] },
              null
            ]
          }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

errorLogSchema.statics.getErrorTrends = function(days: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: cutoff }
      }
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          severity: '$severity'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

errorLogSchema.statics.getCriticalErrors = function(hours: number = 24) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);
  
  return this.find({
    severity: 'critical',
    timestamp: { $gte: cutoff },
    resolved: false
  }).sort({ timestamp: -1 });
};

errorLogSchema.statics.getModelErrorRates = function(days: number = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: cutoff },
        aiModel: { $exists: true }
      }
    },
    {
      $group: {
        _id: '$aiModel',
        totalErrors: { $sum: 1 },
        criticalErrors: {
          $sum: {
            $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0]
          }
        },
        resolvedErrors: {
          $sum: {
            $cond: [{ $eq: ['$resolved', true] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        resolutionRate: {
          $cond: [
            { $eq: ['$totalErrors', 0] },
            0,
            { $divide: ['$resolvedErrors', '$totalErrors'] }
          ]
        }
      }
    },
    {
      $sort: { totalErrors: -1 }
    }
  ]);
};

// Instance methods
errorLogSchema.methods.markResolved = function(resolution?: string) {
  this.resolved = true;
  this.resolvedAt = new Date();
  if (resolution) {
    this.resolution = resolution;
  }
  return this.save();
};

errorLogSchema.methods.isCritical = function() {
  return this.severity === 'critical';
};

errorLogSchema.methods.isRecent = function(hours: number = 1) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);
  return this.timestamp >= cutoff;
};

// Pre-save middleware
errorLogSchema.pre('save', function(next) {
  // Auto-set resolvedAt when resolved is set to true
  if (this.isModified('resolved') && this.resolved && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  
  // Validate resolution fields
  if (this.resolved && !this.resolvedAt) {
    return next(new Error('resolvedAt is required when resolved is true'));
  }
  
  next();
});

export const ErrorLog = model<IErrorLog>('ErrorLog', errorLogSchema);
export default ErrorLog; 