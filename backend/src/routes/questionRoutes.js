import express from 'express';
import { generateQuestions, saveBulkQuestions, createQuestion, updateQuestion, deleteQuestion } from '../controllers/questionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('teacher'), createQuestion);

router.route('/generate-ai')
  .post(protect, authorize('teacher'), generateQuestions);

router.route('/bulk')
  .post(protect, authorize('teacher'), saveBulkQuestions);

router.route('/:id')
  .put(protect, authorize('teacher'), updateQuestion)
  .delete(protect, authorize('teacher'), deleteQuestion);

export default router;
