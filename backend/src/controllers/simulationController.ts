import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Simulation from '../models/Simulation';
import SimulationParticipant from '../models/SimulationParticipant';
import Assignment from '../models/Assignment';
import User from '../models/User';

// POST /api/simulations (Lecturer/Admin only)
export const createSimulation = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, initialBalance, market, startDate, endDate } = req.body;

    const simulation = new Simulation({
      name,
      description,
      initialBalance,
      market,
      startDate,
      endDate,
      createdBy: req.user._id,
      status: 'DRAFT',
    });

    const createdSimulation = await simulation.save();
    res.status(201).json(createdSimulation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/simulations
export const getSimulations = async (req: AuthRequest, res: Response) => {
  try {
    // Nếu là student, chỉ lấy những simulation đã PUBLISHED, ACTIVE, ENDED
    let filter = {};
    if (req.user.role === 'student') {
      filter = { status: { $in: ['PUBLISHED', 'ACTIVE', 'ENDED'] } };
    }
    
    // Nếu là lecturer, lấy tất cả hoặc lấy những simulation do họ tạo (tùy nghiệp vụ)
    const simulations = await Simulation.find(filter).populate('createdBy', 'name email');
    res.json(simulations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/simulations/:id
export const getSimulationById = async (req: AuthRequest, res: Response) => {
  try {
    const simulation = await Simulation.findById(req.params.id).populate('createdBy', 'name email');
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }
    res.json(simulation);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// PATCH /api/simulations/:id/status (Lecturer/Admin only)
export const updateSimulationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    // Tùy chọn: Kiểm tra xem người sửa có phải người tạo không

    simulation.status = req.body.status || simulation.status;
    const updatedSimulation = await simulation.save();
    res.json(updatedSimulation);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/simulations/:id/join (Student only)
export const joinSimulation = async (req: AuthRequest, res: Response) => {
  try {
    const simulationId = req.params.id;
    const userId = req.user._id;

    const simulation = await Simulation.findById(simulationId);
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    if (simulation.status !== 'PUBLISHED' && simulation.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Cannot join this simulation at current status' });
    }

    // Check if already requested or joined
    const existing = await SimulationParticipant.findOne({ simulationId, userId });
    if (existing) {
      if (existing.status === 'PENDING') {
        return res.status(400).json({ message: 'Yêu cầu tham gia của bạn đang chờ phê duyệt' });
      }
      if (existing.status === 'ACTIVE') {
        return res.status(400).json({ message: 'Bạn đã ở trong simulation này' });
      }
      if (existing.status === 'REJECTED') {
        existing.status = 'PENDING';
        await existing.save();
        return res.status(200).json({ message: 'Đã nộp lại yêu cầu tham gia thành công!', participant: existing });
      }
    }

    const participant = new SimulationParticipant({
      simulationId,
      userId,
      initialBalance: simulation.initialBalance,
      currentBalance: simulation.initialBalance,
      portfolioValue: 0,
      totalProfit: 0,
      returnRate: 0,
      status: 'PENDING'
    });

    await participant.save();
    res.status(201).json({ message: 'Yêu cầu tham gia đã gửi. Vui lòng chờ Giảng viên phê duyệt!', participant });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bạn đã gửi yêu cầu tham gia simulation này' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// PATCH /api/simulations/:id/participants/:participantId/approve (Lecturer/Admin only)
export const approveParticipant = async (req: AuthRequest, res: Response) => {
  try {
    const { id, participantId } = req.params;
    const participant = await SimulationParticipant.findOne({ _id: participantId, simulationId: id });
    if (!participant) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu tham gia' });
    }
    participant.status = 'ACTIVE';
    await participant.save();
    res.json({ message: 'Đã chấp nhận sinh viên vào simulation', participant });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// PATCH /api/simulations/:id/participants/:participantId/reject (Lecturer/Admin only)
export const rejectParticipant = async (req: AuthRequest, res: Response) => {
  try {
    const { id, participantId } = req.params;
    const participant = await SimulationParticipant.findOne({ _id: participantId, simulationId: id });
    if (!participant) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu tham gia' });
    }
    participant.status = 'REJECTED';
    await participant.save();
    res.json({ message: 'Đã từ chối yêu cầu tham gia', participant });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// POST /api/simulations/:id/add-student (Lecturer/Admin only)
export const addStudentToSimulation = async (req: AuthRequest, res: Response) => {
  try {
    const simulationId = req.params.id;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const simulation = await Simulation.findById(simulationId);
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    // Check if already joined
    const existing = await SimulationParticipant.findOne({ simulationId, userId: studentId });
    if (existing) {
      return res.status(400).json({ message: 'Student is already in this simulation' });
    }

    const participant = new SimulationParticipant({
      simulationId,
      userId: studentId,
      initialBalance: simulation.initialBalance,
      currentBalance: simulation.initialBalance,
      portfolioValue: 0,
      totalProfit: 0,
      returnRate: 0,
      status: 'ACTIVE'
    });

    await participant.save();
    
    // Populate user info to return
    const populatedParticipant = await SimulationParticipant.findById(participant._id)
      .populate('userId', 'name email picture');
      
    res.status(201).json(populatedParticipant);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Student is already in this simulation' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// DELETE /api/simulations/:id/participants/:studentId (Lecturer/Admin only)
export const removeStudentFromSimulation = async (req: AuthRequest, res: Response) => {
  try {
    const simulationId = req.params.id;
    const studentId = req.params.studentId;

    const simulation = await Simulation.findById(simulationId);
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    const participant = await SimulationParticipant.findOne({ simulationId, userId: studentId });
    if (!participant) {
      return res.status(404).json({ message: 'Student is not in this simulation' });
    }

    await participant.deleteOne();
    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// PUT /api/simulations/:id (Lecturer/Admin only)
export const editSimulation = async (req: AuthRequest, res: Response) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    const { name, description, initialBalance, market, startDate, endDate } = req.body;
    
    simulation.name = name || simulation.name;
    simulation.description = description || simulation.description;
    simulation.initialBalance = initialBalance || simulation.initialBalance;
    simulation.market = market || simulation.market;
    simulation.startDate = startDate || simulation.startDate;
    simulation.endDate = endDate || simulation.endDate;

    const updatedSimulation = await simulation.save();
    res.json(updatedSimulation);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// PATCH /api/simulations/:id/start (Lecturer/Admin only)
export const startSimulation = async (req: AuthRequest, res: Response) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }
    simulation.status = 'ACTIVE';
    const updatedSimulation = await simulation.save();
    res.json(updatedSimulation);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// PATCH /api/simulations/:id/end (Lecturer/Admin only)
export const endSimulation = async (req: AuthRequest, res: Response) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }
    simulation.status = 'ENDED';
    const updatedSimulation = await simulation.save();
    res.json(updatedSimulation);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// DELETE /api/simulations/:id (Lecturer/Admin only)
export const deleteSimulation = async (req: AuthRequest, res: Response) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    if (req.user.role !== 'admin' && simulation.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this simulation' });
    }

    await SimulationParticipant.deleteMany({ simulationId: req.params.id });
    await simulation.deleteOne();

    res.json({ message: 'Simulation deleted successfully' });
  } catch (error) {
    console.error('Error deleting simulation:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// DELETE /api/simulations/:id/leave (Student only)
export const leaveSimulation = async (req: AuthRequest, res: Response) => {
  try {
    const simulationId = req.params.id;
    const userId = req.user._id;

    const simulation = await Simulation.findById(simulationId);
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    if (simulation.status === 'ACTIVE') {
      return res.status(400).json({ message: 'Cannot leave an active simulation. It is already in progress.' });
    }

    const participant = await SimulationParticipant.findOne({ simulationId, userId });
    if (!participant) {
      return res.status(404).json({ message: 'You have not joined this simulation' });
    }

    await participant.deleteOne();
    res.json({ message: 'Successfully left the simulation' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/simulations/:id/participants
export const getSimulationParticipants = async (req: AuthRequest, res: Response) => {
  try {
    const participants = await SimulationParticipant.find({ simulationId: req.params.id })
      .populate('userId', 'name email picture status');
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/simulations/participations/me
export const getMyParticipationsList = async (req: AuthRequest, res: Response) => {
  try {
    const participations = await SimulationParticipant.find({ userId: req.user._id });
    res.json(participations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/simulations/:id/participants/me
export const getMyParticipation = async (req: AuthRequest, res: Response) => {
  try {
    const participant = await SimulationParticipant.findOne({ 
      simulationId: req.params.id, 
      userId: req.user._id 
    }).populate('simulationId');

    if (!participant) {
      return res.status(404).json({ message: 'Participation not found' });
    }
    res.json(participant);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/simulations/:id/leaderboard
export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const sortBy = req.query.sortBy === 'return' ? '-returnRate' : '-totalProfit';
    
    // Tạm thời lấy data mock/sẵn có từ model SimulationParticipant
    // Sau này có thể join/tính toán lại dựa vào data của Member 2
    const leaderboard = await SimulationParticipant.find({ simulationId: req.params.id })
      .sort(sortBy)
      .populate('userId', 'name email picture')
      .limit(100);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/simulations/dashboard/stats
export const getLecturerDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const lecturerId = req.user._id;

    // 1. Get simulations created by this lecturer (or all if none created yet)
    let simulations = await Simulation.find({ createdBy: lecturerId });
    if (simulations.length === 0) {
      simulations = await Simulation.find();
    }
    const simulationIds = simulations.map(sim => sim._id);

    // 2. Count total unique students
    const uniqueStudentIds = await SimulationParticipant.distinct('userId', {
      simulationId: { $in: simulationIds }
    });
    const totalEnrolledStudents = uniqueStudentIds.length || (await User.countDocuments({ role: 'student' }));

    // 3. Count active assignments
    const activeAssignments = await Assignment.countDocuments({ status: 'OPEN' });

    // 4. Calculate average simulation return/score
    const overallStats = await SimulationParticipant.aggregate([
      { $match: { simulationId: { $in: simulationIds } } },
      { $group: { _id: null, avgReturn: { $avg: '$returnRate' } } }
    ]);
    const avgScore = overallStats.length > 0 ? parseFloat(overallStats[0].avgReturn.toFixed(1)) : 0;

    // 5. Chart Data (Average return rate per simulation)
    const chartData = await SimulationParticipant.aggregate([
      { $match: { simulationId: { $in: simulationIds } } },
      { $group: { _id: '$simulationId', avgReturn: { $avg: '$returnRate' } } }
    ]);

    const formattedChartData = simulations.map(sim => {
      const match = chartData.find(d => d._id.toString() === sim._id.toString());
      return {
        id: sim._id,
        name: sim.name,
        avgReturn: match ? parseFloat(match.avgReturn.toFixed(1)) : 0
      };
    });

    // 6. Needs attention students (Negative return rate or PENDING approval)
    const needsAttention = await SimulationParticipant.find({
      simulationId: { $in: simulationIds },
      $or: [{ returnRate: { $lt: 0 } }, { status: 'PENDING' }]
    })
      .limit(6)
      .populate('userId', 'name email')
      .populate('simulationId', 'name');

    const formattedAttention = needsAttention.map(item => ({
      id: item._id,
      name: (item.userId as any)?.name || (item.userId as any)?.email || 'Sinh viên',
      issue: item.status === 'PENDING' 
        ? `Đang chờ duyệt vào ${(item.simulationId as any)?.name || 'Simulation'}`
        : `Lợi nhuận ${item.returnRate.toFixed(1)}% tại ${(item.simulationId as any)?.name || 'Simulation'}`,
      severity: item.status === 'PENDING' ? 'high' : item.returnRate < -5 ? 'high' : 'medium'
    }));

    // 7. Recent activity
    const recentParticipants = await SimulationParticipant.find({
      simulationId: { $in: simulationIds }
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('userId', 'name email')
      .populate('simulationId', 'name');

    const recentActivity = recentParticipants.map(item => ({
      id: item._id,
      studentName: (item.userId as any)?.name || (item.userId as any)?.email || 'Sinh viên',
      action: item.status === 'PENDING' ? 'đã đăng ký chờ duyệt vào' : 'đã tham gia mô phỏng',
      simulationName: (item.simulationId as any)?.name || 'Simulation',
      date: (item as any).createdAt || new Date()
    }));

    res.json({
      totalEnrolledStudents,
      avgScore,
      activeAssignments,
      chartData: formattedChartData,
      needsAttention: formattedAttention,
      recentActivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
