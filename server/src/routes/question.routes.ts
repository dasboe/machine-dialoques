import { Router } from 'express';
import { questionController } from '../controllers/question.controller';

const router = Router();

/**
 * Question Routes
 * Base path: /api/questions
 */

// GET /api/questions - List questions with filtering and pagination
router.get('/', questionController.getQuestions);

// GET /api/questions/approved - Get approved questions
router.get('/approved', questionController.getApprovedQuestions);

// GET /api/questions/random - Get random approved questions
router.get('/random', questionController.getRandomQuestions);

// GET /api/questions/unused - Get unused questions
router.get('/unused', questionController.getUnusedQuestions);

// GET /api/questions/stats - Get question statistics
router.get('/stats', questionController.getQuestionStats);

// GET /api/questions/:id - Get single question by ID
router.get('/:id', questionController.getQuestion);

// POST /api/questions/:id/approve - Add approval from AI model
router.post('/:id/approve', questionController.addApproval);

// POST /api/questions/:id/reject - Add rejection from AI model
router.post('/:id/reject', questionController.addRejection);

// POST /api/questions/:id/use - Mark question as used
router.post('/:id/use', questionController.markAsUsed);

export { router as questionRoutes };