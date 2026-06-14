import express from 'express';
import { submitExam, getSubmissions, getResultByExamId, getResultById } from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('student'), submitExam)
  .get(protect, getSubmissions);

router.route('/result/exam/:examId')
  .get(protect, getResultByExamId);

router.route('/result/:id')
  .get(protect, getResultById);

export default router;
