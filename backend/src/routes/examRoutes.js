import express from 'express';
import { createExam, getExams, getExamById, updateExam, deleteExam } from '../controllers/examController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('teacher'), createExam)
  .get(protect, getExams);

router.route('/:id')
  .get(protect, getExamById)
  .put(protect, authorize('teacher'), updateExam)
  .delete(protect, authorize('teacher'), deleteExam);

export default router;
