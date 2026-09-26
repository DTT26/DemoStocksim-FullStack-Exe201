import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import SimulationParticipant from '../models/SimulationParticipant';
import Order from '../models/Order';
import PaperTradingSession from '../models/PaperTradingSession';
import PaperTradingHistory from '../models/PaperTradingHistory';
import PaperTradingPosition from '../models/PaperTradingPosition';
import { createNotification } from './notificationController';

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

    // Notify enrolled students in background
    if (simulationId) {
      SimulationParticipant.find({ simulationId, status: 'APPROVED' }).select('userId').then((participants) => {
        participants.forEach((p) => {
          createNotification(p.userId, {
            title: 'Bài tập mới được giao',
            message: `Giảng viên đã giao bài tập mới: "${title}".`,
            type: 'ASSIGNMENT_NEW',
            link: '/assignments',
          });
        });
      }).catch(err => console.error('Failed to notify participants of new assignment:', err));
    }

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

    const tradingEvidence = await fetchStudentTradingEvidence(req.user._id.toString(), assignment, submission.submittedAt);

    // Notify student about successful submission
    createNotification(req.user._id, {
      title: 'Nộp bài tập thành công',
      message: `Bạn đã nộp thành công bài tập "${assignment.title}".`,
      type: 'ASSIGNMENT_SUBMITTED',
      link: '/assignments',
    }).catch(err => console.error('Failed to notify student on submission:', err));

    // Notify assignment creator (lecturer)
    if (assignment.createdBy && assignment.createdBy.toString() !== req.user._id.toString()) {
      createNotification(assignment.createdBy, {
        title: 'Học viên nộp bài tập',
        message: `${req.user.name || 'Học viên'} đã nộp bài tập "${assignment.title}".`,
        type: 'ASSIGNMENT_SUBMITTED',
        link: '/lecturer/assignments',
      }).catch(err => console.error('Failed to notify lecturer on submission:', err));
    }

    res.json({
      success: true,
      message: 'Nộp bài tập thành công!',
      submission: {
        ...submission.toObject(),
        tradingEvidence
      },
    });
  } catch (error: any) {
    console.error('submitAssignment error:', error);
    res.status(500).json({ message: error.message || 'Lỗi server khi nộp bài' });
  }
};

/**
 * Helper to fetch verified trading activity for a student on an assignment
 */
/**
 * Helper to fetch verified trading activity for a student on an assignment
 * Filters strictly by:
 * - Student ID
 * - Target Symbol
 * - Time window: assignment.createdAt <= executedAt <= submission.submittedAt
 * - Distinguishes FILLED vs CANCELLED orders
 * - Determines currency (VND for VN stocks / HOSE, USD for crypto)
 */
export async function fetchStudentTradingEvidence(studentId: string, assignment: any, submissionDate?: Date) {
  try {
    const symbol = (assignment.symbol || 'FPT').toUpperCase();
    const symbolRegex = new RegExp(`^${symbol}$`, 'i');

    // Time window filter: FROM assignment created TO student submission
    const startTime = new Date(assignment.createdAt);
    const endTime = submissionDate ? new Date(submissionDate) : (assignment.deadline ? new Date(assignment.deadline) : new Date());

    // Strict upper limit: No orders executed AFTER student submitted the assignment
    // (with a small 5-second buffer for network sync)
    const upperLimitTime = new Date(endTime.getTime() + 5000);
    
    // For lower limit: if assignment was created after submission in test data, handle safely:
    const lowerLimitTime = startTime.getTime() <= endTime.getTime() 
      ? startTime 
      : new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Fetch from Order model (Real-time / Terminal orders) within time window
    const orders = await Order.find({
      userId: studentId,
      symbol: symbolRegex,
      createdAt: { $gte: lowerLimitTime, $lte: upperLimitTime }
    }).sort({ createdAt: -1 });

    // 2. Fetch from PaperTrading sessions for this student within time window
    const paperSessions = await PaperTradingSession.find({
      user: studentId,
      symbol: symbolRegex,
    }).select('_id');

    const sessionIds = paperSessions.map(s => s._id);
    let paperTrades: any[] = [];
    let openPositions: any[] = [];

    if (sessionIds.length > 0) {
      paperTrades = await PaperTradingHistory.find({
        session: { $in: sessionIds },
        $or: [
          { closeTime: { $gte: lowerLimitTime, $lte: upperLimitTime } },
          { openTime: { $gte: lowerLimitTime, $lte: upperLimitTime } },
          { createdAt: { $gte: lowerLimitTime, $lte: upperLimitTime } }
        ]
      }).sort({ closeTime: -1 });

      openPositions = await PaperTradingPosition.find({
        session: { $in: sessionIds },
        createdAt: { $gte: lowerLimitTime, $lte: upperLimitTime }
      }).sort({ createdAt: -1 });
    }

    // Transform orders into normalized evidence items
    const normalizedItems: any[] = [];

    orders.forEach((o: any) => {
      const isFilled = o.status === 'FILLED' || o.status === 'EXECUTED';
      const isCancelled = o.status === 'CANCELLED' || o.status === 'REJECTED';
      normalizedItems.push({
        id: o._id.toString(),
        side: o.side === 'LONG' ? 'BUY' : o.side === 'SHORT' ? 'SELL' : o.side,
        type: o.type || 'MARKET',
        symbol: o.symbol,
        quantity: o.quantity,
        price: o.price,
        stopLoss: o.stopLoss || null,
        takeProfit: o.takeProfit || null,
        status: o.status || 'FILLED',
        isFilled,
        isCancelled,
        time: o.createdAt,
        source: 'TERMINAL_ORDER'
      });
    });

    paperTrades.forEach((pt: any) => {
      normalizedItems.push({
        id: pt._id.toString(),
        side: pt.side === 'LONG' ? 'BUY' : 'SELL',
        type: 'MARKET',
        symbol: pt.symbol,
        quantity: pt.lot ? pt.lot * 100000 : 100,
        price: pt.entryPrice,
        exitPrice: pt.exitPrice,
        pnl: pt.netPnL,
        stopLoss: null,
        takeProfit: null,
        status: 'FILLED',
        isFilled: true,
        isCancelled: false,
        closeReason: pt.closeReason,
        time: pt.closeTime || pt.openTime || pt.createdAt,
        source: 'PAPER_TRADE'
      });
    });

    openPositions.forEach((pos: any) => {
      normalizedItems.push({
        id: pos._id.toString(),
        side: pos.side === 'LONG' ? 'BUY' : 'SELL',
        type: 'POSITION',
        symbol: pos.symbol,
        quantity: pos.lot ? pos.lot * 100000 : 100,
        price: pos.entryPrice,
        stopLoss: pos.sl || null,
        takeProfit: pos.tp || null,
        status: 'OPEN',
        isFilled: true,
        isCancelled: false,
        time: pos.createdAt,
        source: 'PAPER_POSITION'
      });
    });

    // Sort by timestamp descending
    normalizedItems.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Separate Filled orders and Cancelled orders
    const filledOrders = normalizedItems.filter(item => item.isFilled);
    const cancelledOrders = normalizedItems.filter(item => item.isCancelled);

    const totalFilledOrders = filledOrders.length;
    const totalCancelledOrders = cancelledOrders.length;

    let totalPnL = 0;
    let hasStopLoss = false;
    let hasTakeProfit = false;

    // Only calculate P&L and Stop Loss on FILLED / EXECUTED orders
    filledOrders.forEach(item => {
      if (typeof item.pnl === 'number') totalPnL += item.pnl;
      if (item.stopLoss) hasStopLoss = true;
      if (item.takeProfit) hasTakeProfit = true;
    });

    const isCrypto = symbol.endsWith('USDT') || symbol.endsWith('USD');
    const currency = isCrypto ? 'USD' : 'VND';
    const currencySymbol = isCrypto ? '$' : '₫';

    return {
      isVerified: totalFilledOrders > 0,
      totalOrders: totalFilledOrders,
      totalFilledOrders,
      totalCancelledOrders,
      totalPnL,
      hasStopLoss,
      hasTakeProfit,
      targetSymbol: symbol,
      currency,
      currencySymbol,
      timeWindow: {
        from: lowerLimitTime,
        to: endTime
      },
      orders: normalizedItems,
    };
  } catch (err) {
    console.error('Error fetching trading evidence:', err);
    return {
      isVerified: false,
      totalOrders: 0,
      totalFilledOrders: 0,
      totalCancelledOrders: 0,
      totalPnL: 0,
      currency: 'VND',
      currencySymbol: '₫',
      orders: [],
      error: 'Could not load trading evidence'
    };
  }
}

// GET /api/assignments/:id/submission (Student xem bài nộp của chính mình)
export const getMySubmission = async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    const submission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id,
    }).populate('gradedBy', 'name email');

    if (!submission) {
      return res.json(null);
    }

    const tradingEvidence = assignment 
      ? await fetchStudentTradingEvidence(req.user._id.toString(), assignment, submission.submittedAt)
      : null;

    res.json({
      ...submission.toObject(),
      tradingEvidence
    });
  } catch (error) {
    console.error('getMySubmission error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/assignments/:id/submissions (Lecturer xem toàn bộ bài nộp của 1 bài tập kèm bằng chứng giao dịch)
export const getAssignmentSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email picture')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 });

    const submissionsWithEvidence = await Promise.all(
      submissions.map(async (sub) => {
        const studentId = sub.studentId?._id?.toString() || (sub.studentId as any)?.toString();
        const tradingEvidence = await fetchStudentTradingEvidence(studentId, assignment, sub.submittedAt);
        return {
          ...sub.toObject(),
          tradingEvidence,
        };
      })
    );

    res.json(submissionsWithEvidence);
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

    const populated = await Submission.findById(updated._id)
      .populate('studentId', 'name email picture')
      .populate('gradedBy', 'name email');

    const assignment = await Assignment.findById(submission.assignmentId);
    const tradingEvidence = assignment 
      ? await fetchStudentTradingEvidence(submission.studentId.toString(), assignment, submission.submittedAt)
      : null;

    // Notify student about assignment grade
    if (submission.studentId) {
      createNotification(submission.studentId, {
        title: 'Bài tập đã được chấm điểm',
        message: `Bài tập "${assignment?.title || 'bài tập'}" đã được chấm điểm: ${submission.score}/100.`,
        type: 'ASSIGNMENT_GRADED',
        link: '/assignments',
      }).catch(err => console.error('Failed to notify student of grade:', err));
    }

    res.json({
      success: true,
      message: 'Chấm điểm bài tập thành công!',
      submission: {
        ...populated?.toObject(),
        tradingEvidence
      },
    });
  } catch (error: any) {
    console.error('gradeSubmission error:', error);
    res.status(500).json({ message: error.message || 'Lỗi server khi chấm điểm' });
  }
};
