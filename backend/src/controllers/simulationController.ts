import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Simulation from '../models/Simulation';
import SimulationParticipant from '../models/SimulationParticipant';

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

    // Check if already joined
    const existing = await SimulationParticipant.findOne({ simulationId, userId });
    if (existing) {
      return res.status(400).json({ message: 'You have already joined this simulation' });
    }

    const participant = new SimulationParticipant({
      simulationId,
      userId,
      initialBalance: simulation.initialBalance,
      currentBalance: simulation.initialBalance,
      portfolioValue: 0,
      totalProfit: 0,
      returnRate: 0,
      status: 'ACTIVE'
    });

    await participant.save();
    res.status(201).json(participant);
  } catch (error: any) {
    // MongoError E11000 dup key
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already joined this simulation' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
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
