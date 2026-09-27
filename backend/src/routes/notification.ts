import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearMyNotifications
} from '../controllers/notificationController';

const router = Router();

router.get('/', protect, getMyNotifications as any);
router.patch('/read-all', protect, markAllNotificationsAsRead as any);
router.patch('/:id/read', protect, markNotificationAsRead as any);
router.delete('/', protect, clearMyNotifications as any);

export default router;
