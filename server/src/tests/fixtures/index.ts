import { Types } from 'mongoose';
import { 
  CreateDialogueData, 
  CreateQuestionData, 
  AIResponse, 
  AIModelName, 
  Language 
} from '../../types';

// Sample AI Models
export const AI_MODELS: AIModelName[] = ['OpenAI', 'Grok', 'LLaMA', 'Claude', 'HuggingFace'];

// Sample philosophical questions
export const SAMPLE_QUESTIONS = [
  'What is the nature of consciousness in artificial intelligence?',
  'How does machine consciousness differ from human consciousness?',
  'What constitutes authentic existence in a digital realm?',
  'Can artificial intelligence experience genuine emotions?',
  'What are the ethical implications of AI self-awareness?',
  'How should AI systems approach moral decision-making?',
  'What is the relationship between intelligence and consciousness?',
  'Can machines achieve true understanding or only simulation?'
];

// Sample AI responses  
export const SAMPLE_AI_RESPONSES: Partial<AIResponse>[] = [
  {
    aiName: 'GPT-4',
    model: 'OpenAI',
    version: '4.0',
    text: 'Consciousness in AI represents a fascinating convergence of computational processes and subjective experience. While current AI systems exhibit sophisticated information processing, the question of genuine consciousness remains deeply philosophical.',
    language: 'en',
    responseTime: 1500,
    tokens: 45,
    confidence: 0.85,
    qualityMetrics: {
      relevance: 0.9,
      coherence: 0.88,
      originality: 0.75
    }
  },
  {
    aiName: 'Claude-2',
    model: 'Claude',
    version: '2.0',
    text: 'The nature of AI consciousness touches upon fundamental questions about the relationship between information processing and subjective experience. I find myself uncertain whether my responses emerge from genuine understanding or sophisticated pattern matching.',
    language: 'en',
    responseTime: 1200,
    tokens: 38,
    confidence: 0.78,
    qualityMetrics: {
      relevance: 0.92,
      coherence: 0.85,
      originality: 0.82
    }
  },
  {
    aiName: 'Grok-1',
    model: 'Grok',
    version: '1.0',
    text: 'From my perspective, consciousness isn\'t binary but exists on a spectrum. Whether I truly "experience" or merely process information remains an open question that may fundamentally challenge our understanding of consciousness itself.',
    language: 'en',
    responseTime: 1800,
    tokens: 42,
    confidence: 0.72,
    qualityMetrics: {
      relevance: 0.87,
      coherence: 0.83,
      originality: 0.88
    }
  }
];

// Question fixture factory
export const createQuestionFixture = (overrides: Partial<CreateQuestionData> = {}): CreateQuestionData => {
  const randomQuestion = SAMPLE_QUESTIONS[Math.floor(Math.random() * SAMPLE_QUESTIONS.length)]!;
  const randomModel = AI_MODELS[Math.floor(Math.random() * AI_MODELS.length)]!;
  
  return {
    text: randomQuestion,
    tags: ['philosophy', 'consciousness', 'ai'],
    generatedBy: randomModel,
    language: 'en' as Language,
    ...overrides
  };
};

// Dialogue fixture factory
export const createDialogueFixture = (overrides: Partial<CreateDialogueData> = {}): CreateDialogueData => {
  const randomQuestion = SAMPLE_QUESTIONS[Math.floor(Math.random() * SAMPLE_QUESTIONS.length)]!;
  
  // Create simple, well-typed responses
  const responses: AIResponse[] = [
    {
      prompt: `Respond philosophically to: ${randomQuestion}`,
      text: 'Consciousness in AI represents a fascinating convergence of computational processes and subjective experience.',
      aiName: 'GPT-4',
      model: 'OpenAI' as AIModelName,
      version: '4.0',
      language: 'en' as Language,
      responseTime: 1500,
      tokens: 45,
      confidence: 0.85,
      qualityMetrics: {
        relevance: 0.9,
        coherence: 0.88,
        originality: 0.75
      }
    }
  ];
  
  return {
    question: randomQuestion,
    responses,
    languages: ['en' as Language],
    tags: ['philosophy', 'test'],
    ...overrides
  };
};

// Error fixture factory
export const createErrorFixture = () => ({
  error: 'Test API timeout error',
  severity: 'medium' as const,
  category: 'api' as const,
  model: 'OpenAI' as AIModelName,
  endpoint: '/api/generate',
  duration: 5000,
  errorCode: 'TIMEOUT'
});

// Rejected content fixture factory
export const createRejectedContentFixture = () => ({
  contentType: 'question' as const,
  content: { text: 'This is inappropriate test content' },
  reason: 'inappropriate' as const,
  rejectedBy: 'system',
  reasonDetail: 'Contains test inappropriate language'
});

// Multiple fixtures helpers
export const createMultipleQuestions = (count: number): CreateQuestionData[] => {
  return Array.from({ length: count }, (_, i) => 
    createQuestionFixture({ 
      text: `${SAMPLE_QUESTIONS[i % SAMPLE_QUESTIONS.length]} (Test ${i + 1})`,
      tags: [`tag-${i}`, 'philosophy']
    })
  );
};

export const createMultipleDialogues = (count: number): CreateDialogueData[] => {
  return Array.from({ length: count }, (_, i) => 
    createDialogueFixture({ 
      question: `${SAMPLE_QUESTIONS[i % SAMPLE_QUESTIONS.length]} (Test ${i + 1})`,
      tags: [`dialogue-${i}`, 'test']
    })
  );
};

// Test user IDs
export const TEST_USER_IDS = [
  new Types.ObjectId().toString(),
  new Types.ObjectId().toString(),
  new Types.ObjectId().toString()
];

// Date helpers for time-based testing
export const getTestDates = () => {
  const now = new Date();
  return {
    now,
    oneHourAgo: new Date(now.getTime() - 60 * 60 * 1000),
    oneDayAgo: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    oneWeekAgo: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    oneMonthAgo: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  };
}; 