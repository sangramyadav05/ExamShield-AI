import express from 'express';
import { getChatSessions, getChatMessages, sendMessageToAssistant } from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/chat')
  .post(protect, authorize('student'), sendMessageToAssistant);

router.route('/sessions')
  .get(protect, authorize('student'), getChatSessions);

router.route('/sessions/:id')
  .get(protect, authorize('student'), getChatMessages);

export default router;
