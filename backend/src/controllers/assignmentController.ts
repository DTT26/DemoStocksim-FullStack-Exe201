import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import SimulationParticipant from '../models/SimulationParticipant';

// POST /api/assignments (Lecturer/Admin only)
export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { simulationId, title, symbol, description, instructions, requirements, deadline } = req.body;

    const assignment = new Assignment({
      simulationId,
      title,
      symbol: symbol || 'FPT',
      description,
      instructions,
      requirements: Array.isArray(requirements) ? requirements : [],
      deadline,
      createdBy: req.user._id,
      status: 'OPEN',
    });

    const createdAssignment = await assignment.save();
    res.status(201).json(createdAssignment);
  } catch (error) {
    console.error('createAssignment error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/assignments
export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { simulationId } = req.query;
    let filter: any = {};
    if (simulationId) {
      filter.simulationId = simulationId;
    }
    
    const assignments = await Assignment.find(filter)
      .populate('createdBy', 'name email picture')
      .populate('simulationId', 'name')
      .sort({ createdAt: -1 });

    // Đếm số bài nộp cho mỗi assignment
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } });

    const results = assignments.map(a => {
      const assSubmissions = submissions.filter(s => s.assignmentId.toString() === a._id.toString());
      return {
        ...a.toObject(),
        submissionCount: assSubmissions.length,
        gradedCount: assSubmissions.filter(s => s.status === 'GRADED').length,
      };
    });

    res.json(results);
  } catch (error) {
    console.error('getAssignments error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/assignments/:id
export const getAssignmentById = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email picture')
      .populate('simulationId', 'name');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    console.error('getAssignmentById error:', error);
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
    console.error('updateAssignmentStatus error:', error);
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

    const { title, symbol, description, instructions, requirements, deadline, simulationId } = req.body;
    assignment.title = title || assignment.title;
    if (symbol) assignment.symbol = symbol;
    if (simulationId) assignment.simulationId = simulationId;
    assignment.description = description !== undefined ? description : assignment.description;
    assignment.instructions = instructions !== undefined ? instructions : assignment.instructions;
    if (Array.isArray(requirements)) assignment.requirements = requirements;
    assignment.deadline = deadline || assignment.deadline;

    const updatedAssignment = await assignment.save();
    res.json(updatedAssignment);
  } catch (error) {
    console.error('editAssignment error:', error);
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
    await Submission.deleteMany({ assignmentId: req.params.id });
    await assignment.deleteOne();
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    console.error('deleteAssignment error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// PATCH /api/assignments/:id/assign (Lecturer/Admin only)
export const assignToStudents = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const { studentIds } = req.body;
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'studentIds must be an array' });
    }

    assignment.assignedTo = studentIds;
    const updatedAssignment = await assignment.save();
    res.json(updatedAssignment);
  } catch (error) {
    console.error('assignToStudents error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/assignments/my (Student)
export const getMyAssignments = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Tìm các cuộc thi mà sinh viên đang tham gia
    const participations = await SimulationParticipant.find({ userId: req.user._id });
    const simulationIds = participations.map(p => p.simulationId);

    // 2. Lấy tất cả bài tập:
    // - Được gán trực tiếp cho sinh viên này
    // - Thuộc cuộc thi sinh viên tham gia (nếu assignedTo trống)
    // - Hoặc tất cả bài tập OPEN (để sinh viên dễ dàng thấy và làm bài thực hành)
    const assignments = await Assignment.find({
      $or: [
        { assignedTo: req.user._id },
        { 
          simulationId: { $in: simulationIds }, 
          $or: [
            { assignedTo: { $exists: false } },
            { assignedTo: { $size: 0 } }
          ]
        },
        { status: 'OPEN' }
      ]
    })
      .populate('simulationId', 'name')
      .populate('createdBy', 'name email picture')
      .sort({ deadline: 1 });

    // 3. Khử trùng lặp theo _id nếu bài tập rơi vào nhiều điều kiện $or
    const uniqueAssignmentsMap = new Map();
    assignments.forEach(a => {
      uniqueAssignmentsMap.set(a._id.toString(), a);
    });
    const uniqueAssignments = Array.from(uniqueAssignmentsMap.values());

    // 4. Lấy tất cả bài nộp của sinh viên này
    const mySubmissions = await Submission.find({
      assignmentId: { $in: uniqueAssignments.map(a => a._id) },
      studentId: req.user._id,
    });

    const submissionMap = new Map();
    mySubmissions.forEach(sub => {
      submissionMap.set(sub.assignmentId.toString(), sub);
    });

    // 5. Kết hợp thông tin nộp bài vào kết quả trả về
    const result = uniqueAssignments.map(a => {
      const sub = submissionMap.get(a._id.toString());
      const now = new Date();
      const isOverdue = new Date(a.deadline) < now;

      let studentStatus = 'NOT_STARTED';
      if (sub) {
        studentStatus = sub.status === 'GRADED' ? 'GRADED' : 'SUBMITTED';
      } else if (isOverdue) {
        studentStatus = 'OVERDUE';
      }

      const totalReqs = a.requirements && a.requirements.length > 0 ? a.requirements.length : 1;
      let completedReqs = 0;
      if (sub && sub.checklistStatus && sub.checklistStatus.length > 0) {
        completedReqs = sub.checklistStatus.filter((c: any) => c.completed).length;
      } else if (sub) {
        completedReqs = totalReqs;
      }

      const progress = Math.min(100, Math.round((completedReqs / totalReqs) * 100));

      return {
        ...a.toObject(),
        mySubmission: sub || null,
        studentStatus,
        progress,
        requirementsCompleted: completedReqs,
        totalRequirements: totalReqs,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('getMyAssignments error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/assignments/:id/submit (Student nộp bài)
export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = req.params.id;
    const { content, checklistStatus, attachments } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập nội dung phân tích / giải trình' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Bài tập không tồn tại' });
    }

    if (assignment.status === 'CLOSED') {
      return res.status(400).json({ message: 'Bài tập này đã đóng, không thể nộp thêm' });
    }

    // Upsert bài nộp của sinh viên
    const submission = await Submission.findOneAndUpdate(
      { assignmentId, studentId: req.user._id },
      {
        content,
        checklistStatus: Array.isArray(checklistStatus) ? checklistStatus : [],
        attachments: Array.isArray(attachments) ? attachments : [],
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Nộp bài tập thành công!',
      submission,
    });
  } catch (error: any) {
    console.error('submitAssignment error:', error);
    res.status(500).json({ message: error.message || 'Lỗi server khi nộp bài' });
  }
};

// GET /api/assignments/:id/submission (Student xem bài nộp của chính mình)
export const getMySubmission = async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = req.params.id;
    const submission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id,
    }).populate('gradedBy', 'name email');

    res.json(submission || null);
  } catch (error) {
    console.error('getMySubmission error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/assignments/:id/submissions (Lecturer xem toàn bộ bài nộp của 1 bài tập)
export const getAssignmentSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = req.params.id;
    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email picture')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('getAssignmentSubmissions error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/assignments/:id/submissions/:submissionId/grade (Lecturer chấm điểm)
export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({ message: 'Điểm số phải từ 0 đến 100' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Bài nộp không tồn tại' });
    }

    submission.score = Number(score);
    submission.feedback = feedback || '';
    submission.status = 'GRADED';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;

    const updated = await submission.save();

    res.json({
      success: true,
      message: 'Chấm điểm bài tập thành công!',
      submission: updated,
    });
  } catch (error: any) {
    console.error('gradeSubmission error:', error);
    res.status(500).json({ message: error.message || 'Lỗi server khi chấm điểm' });
  }
};
