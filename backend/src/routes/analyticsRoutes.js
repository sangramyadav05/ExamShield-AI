import express from 'express';
import { getAdminAnalytics, getTeacherAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/admin')
  .get(protect, authorize('admin'), getAdminAnalytics);

router.route('/teacher')
  .get(protect, authorize('teacher'), getTeacherAnalytics);

router.route('/student')
  .get(protect, authorize('student'), getStudentAnalytics);

export default router;
