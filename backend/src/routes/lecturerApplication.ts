import { Router } from 'express';
import {
  submitApplication,
  getMyApplication,
  getApplications,
  approveApplication,
  rejectApplication,
} from '../controllers/lecturerApplicationController';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

// Student routes
router.post('/', protect, submitApplication as any);
router.get('/my', protect, getMyApplication as any);

// Admin routes
router.get('/', protect, admin, getApplications as any);
router.patch('/:id/approve', protect, admin, approveApplication as any);
router.patch('/:id/reject', protect, admin, rejectApplication as any);

export default router;
