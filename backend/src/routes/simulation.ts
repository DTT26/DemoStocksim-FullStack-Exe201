import { Router } from 'express';
import { 
  createSimulation, 
  getSimulations, 
  getSimulationById, 
  updateSimulationStatus,
  editSimulation,
  startSimulation,
  endSimulation,
  joinSimulation,
  leaveSimulation,
  getSimulationParticipants,
  getMyParticipation,
  getMyParticipationsList,
  getLeaderboard,
  addStudentToSimulation
} from '../controllers/simulationController';
import { protect, lecturer } from '../middleware/authMiddleware';

const router = Router();

router.route('/')
  .get(protect, getSimulations as any)
  .post(protect, lecturer, createSimulation as any);

router.get('/participations/me', protect, getMyParticipationsList as any);

router.route('/:id')
  .get(protect, getSimulationById as any)
  .put(protect, lecturer, editSimulation as any);

router.patch('/:id/status', protect, lecturer, updateSimulationStatus as any);
router.patch('/:id/start', protect, lecturer, startSimulation as any);
router.patch('/:id/end', protect, lecturer, endSimulation as any);

router.post('/:id/join', protect, joinSimulation as any);
router.post('/:id/add-student', protect, lecturer, addStudentToSimulation as any);
router.delete('/:id/leave', protect, leaveSimulation as any);

router.get('/:id/participants', protect, getSimulationParticipants as any);
router.get('/:id/participants/me', protect, getMyParticipation as any);

router.get('/:id/leaderboard', protect, getLeaderboard as any);

export default router;
