import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Assignment from '../models/Assignment';
import SimulationParticipant from '../models/SimulationParticipant';

// POST /api/assignments (Lecturer/Admin only)
export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { simulationId, title, description, instructions, deadline } = req.body;

    const assignment = new Assignment({
      simulationId,
      title,
      description,
      instructions,
      deadline,
      createdBy: req.user._id,
      status: 'OPEN',
    });

    const createdAssignment = await assignment.save();
    res.status(201).json(createdAssignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/assignments
export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { simulationId } = req.query;
    let filter = {};
    if (simulationId) {
      filter = { simulationId };
    }
    
    const assignments = await Assignment.find(filter).populate('createdBy', 'name email');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/assignments/:id
export const getAssignmentById = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('createdBy', 'name email');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// PATCH /api/assignments/:id/status (Lecturer/Admin only)
export const updateAssignmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.status = req.body.status || assignment.status;
    const updatedAssignment = await assignment.save();
    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// PUT /api/assignments/:id (Lecturer/Admin only)
export const editAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const { title, description, instructions, deadline } = req.body;
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.instructions = instructions || assignment.instructions;
    assignment.deadline = deadline || assignment.deadline;

    const updatedAssignment = await assignment.save();
    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// DELETE /api/assignments/:id (Lecturer/Admin only)
export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    await assignment.deleteOne();
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/assignments/my (Student only)
export const getMyAssignments = async (req: AuthRequest, res: Response) => {
  try {
    // Tìm các cuộc thi mà sinh viên đang tham gia
    const participations = await SimulationParticipant.find({ userId: req.user._id });
    const simulationIds = participations.map(p => p.simulationId);

    // Lấy tất cả bài tập thuộc các cuộc thi đó
    const assignments = await Assignment.find({ 
      simulationId: { $in: simulationIds } 
    }).populate('simulationId', 'name');

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
