import { Router } from 'express';
import { 
  createAssignment, 
  getAssignments, 
  getAssignmentById, 
  updateAssignmentStatus,
  editAssignment,
  deleteAssignment,
  getMyAssignments,
  assignToStudents,
  submitAssignment,
  getMySubmission,
  getAssignmentSubmissions,
  gradeSubmission
} from '../controllers/assignmentController';
import { protect, lecturer } from '../middleware/authMiddleware';

const router = Router();

// CRUD cơ bản
router.route('/')
  .get(protect, getAssignments as any)
  .post(protect, lecturer, createAssignment as any);

// Lấy danh sách bài tập của sinh viên hiện tại kèm tiến trình nộp bài
router.get('/my', protect, getMyAssignments as any);

router.route('/:id')
  .get(protect, getAssignmentById as any)
  .put(protect, lecturer, editAssignment as any)
  .delete(protect, lecturer, deleteAssignment as any);

router.patch('/:id/status', protect, lecturer, updateAssignmentStatus as any);
router.patch('/:id/assign', protect, lecturer, assignToStudents as any);

// Sinh viên nộp bài & xem bài nộp của chính mình
router.post('/:id/submit', protect, submitAssignment as any);
router.get('/:id/submission', protect, getMySubmission as any);

// Giảng viên xem toàn bộ bài nộp của 1 bài tập & chấm điểm
router.get('/:id/submissions', protect, lecturer, getAssignmentSubmissions as any);
router.post('/:id/submissions/:submissionId/grade', protect, lecturer, gradeSubmission as any);

export default router;
