import { Router } from 'express';
import { dialogueController } from '../controllers/dialogue.controller';

const router = Router();

/**
 * Dialogue Routes
 * Base path: /api/dialogues
 */

// GET /api/dialogues - List dialogues with filtering and pagination
router.get('/', dialogueController.getDialogues);

// GET /api/dialogues/recent - Get recent dialogues
router.get('/recent', dialogueController.getRecentDialogues);

// GET /api/dialogues/featured - Get high-quality featured dialogues
router.get('/featured', dialogueController.getFeaturedDialogues);

// GET /api/dialogues/stats - Get dialogue statistics
router.get('/stats', dialogueController.getDialogueStats);

// GET /api/dialogues/:id - Get single dialogue by ID
router.get('/:id', dialogueController.getDialogue);

// POST /api/dialogues/:id/feedback - Add feedback to a dialogue
router.post('/:id/feedback', dialogueController.addFeedback);

export { router as dialogueRoutes };