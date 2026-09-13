import { Router } from 'express';
import { 
  createAssignment, 
  getAssignments, 
  getAssignmentById, 
  updateAssignmentStatus,
  editAssignment,
  deleteAssignment,
  getMyAssignments
} from '../controllers/assignmentController';
import { protect, lecturer } from '../middleware/authMiddleware';

const router = Router();

router.route('/')
  .get(protect, getAssignments as any)
  .post(protect, lecturer, createAssignment as any);

router.get('/my', protect, getMyAssignments as any);

router.route('/:id')
  .get(protect, getAssignmentById as any)
  .put(protect, lecturer, editAssignment as any)
  .delete(protect, lecturer, deleteAssignment as any);

router.patch('/:id/status', protect, lecturer, updateAssignmentStatus as any);

export default router;
