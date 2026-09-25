import { Router } from 'express';
import { 
  getMyProfile, 
  updateMyProfile, 
  changePassword,
  getUsers, 
  getUserById, 
  updateUserRole, 
  updateUserStatus,
  deleteUser 
} from '../controllers/userController';
import { protect, admin, lecturer } from '../middleware/authMiddleware';

const router = Router();

// Các route cho Student / Profile cá nhân
router.route('/me')
  .get(protect, getMyProfile as any)
  .put(protect, updateMyProfile as any);

router.put('/change-password', protect, changePassword as any);

// Các route quản lý User (Dành cho Admin, Lecturer, và Student để xem Leaderboard)
router.route('/')
  .get(protect, getUsers as any);

router.route('/:id')
  .get(protect, admin, getUserById as any)
  .delete(protect, admin, deleteUser as any);

router.patch('/:id/role', protect, admin, updateUserRole as any);
router.patch('/:id/status', protect, admin, updateUserStatus as any);

export default router;
