import express from 'express';
import { getUsers, toggleUserStatus } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id/toggle')
  .put(protect, authorize('admin'), toggleUserStatus);

export default router;
