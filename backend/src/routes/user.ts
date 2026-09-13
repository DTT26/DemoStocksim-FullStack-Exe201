import { Router } from 'express';
import { 
  getMyProfile, 
  updateMyProfile, 
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

// Các route quản lý User (Dành cho Admin và Lecturer để xem danh sách sinh viên)
router.route('/')
  .get(protect, lecturer, getUsers as any);

router.route('/:id')
  .get(protect, admin, getUserById as any)
  .delete(protect, admin, deleteUser as any);

router.patch('/:id/role', protect, admin, updateUserRole as any);
router.patch('/:id/status', protect, admin, updateUserStatus as any);

export default router;
