import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import LecturerApplication from '../models/LecturerApplication';
import User from '../models/User';
import { createNotification } from './notificationController';

// POST /api/lecturer-applications (Student submits application)
export const submitApplication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    // Check current role
    if (req.user.role === 'lecturer' || req.user.role === 'admin') {
      return res.status(400).json({ message: 'Tài khoản của bạn đã là Giảng viên hoặc Quản trị viên' });
    }

    const { fullName, phone, university, department, experience, linkedinOrPortfolio } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: 'Vui lòng cung cấp họ và tên' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Vui lòng cung cấp số điện thoại liên hệ' });
    }
    if (!experience || !experience.trim()) {
      return res.status(400).json({ message: 'Vui lòng nêu rõ kinh nghiệm giảng dạy hoặc lý do đăng ký' });
    }

    // Check if there is already a PENDING application
    const existingPending = await LecturerApplication.findOne({ userId, status: 'PENDING' });
    if (existingPending) {
      return res.status(400).json({ message: 'Bạn đã có đơn đăng ký Giảng viên đang chờ Ban Quản trị phê duyệt' });
    }

    const application = new LecturerApplication({
      userId,
      fullName: fullName.trim(),
      email: req.user.email,
      phone: phone.trim(),
      university: (university || '').trim(),
      department: (department || '').trim(),
      experience: experience.trim(),
      linkedinOrPortfolio: (linkedinOrPortfolio || '').trim(),
      status: 'PENDING',
    });

    const savedApplication = await application.save();

    // Optionally update user's profile info
    await User.findByIdAndUpdate(userId, {
      name: fullName.trim(),
      phone: phone.trim(),
      ...(university ? { university: university.trim() } : {}),
      ...(department ? { department: department.trim() } : {}),
    });

    // Notify admins
    User.find({ role: 'admin' }).select('_id').then((admins) => {
      admins.forEach((adminUser) => {
        createNotification(adminUser._id, {
          title: 'Yêu cầu đăng ký Giảng viên mới',
          message: `Học viên ${fullName.trim()} (${req.user.email}) vừa nộp hồ sơ xin làm Giảng viên.`,
          type: 'SYSTEM',
          link: '/admin/users',
        });
      });
    }).catch(err => console.error('Failed to notify admins of lecturer application:', err));

    // Notify student
    createNotification(userId, {
      title: 'Đã nộp đơn đăng ký Giảng viên',
      message: 'Hồ sơ của bạn đã được gửi tới Ban Quản trị. Vui lòng chờ xem xét và duyệt.',
      type: 'SYSTEM',
      link: '/student/profile',
    }).catch(err => console.error('Failed to notify student of application submission:', err));

    res.status(201).json({
      success: true,
      message: 'Nộp đơn đăng ký Giảng viên thành công! Vui lòng chờ Admin duyệt.',
      application: savedApplication,
    });
  } catch (error) {
    console.error('submitApplication error:', error);
    res.status(500).json({ message: 'Server Error khi nộp hồ sơ' });
  }
};

// GET /api/lecturer-applications/my (Student views their latest application)
export const getMyApplication = async (req: AuthRequest, res: Response) => {
  try {
    const application = await LecturerApplication.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name email');

    res.json(application || null);
  } catch (error) {
    console.error('getMyApplication error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/lecturer-applications (Admin only: list all applications)
export const getApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status as string)) {
      filter.status = status;
    }

    const applications = await LecturerApplication.find(filter)
      .populate('userId', 'name email picture status studentId university department phone')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('getApplications error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// PATCH /api/lecturer-applications/:id/approve (Admin only)
export const approveApplication = async (req: AuthRequest, res: Response) => {
  try {
    const application = await LecturerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ đăng ký' });
    }

    if (application.status === 'APPROVED') {
      return res.status(400).json({ message: 'Hồ sơ này đã được phê duyệt trước đó' });
    }

    application.status = 'APPROVED';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    // Update user role to lecturer and set university/department
    await User.findByIdAndUpdate(application.userId, {
      role: 'lecturer',
      ...(application.university ? { university: application.university } : {}),
      ...(application.department ? { department: application.department } : {}),
    });

    // Notify student
    createNotification(application.userId, {
      title: 'Đăng ký Giảng viên đã được duyệt! 🎉',
      message: 'Chúc mừng! Ban Quản trị đã duyệt yêu cầu của bạn. Tài khoản hiện có đầy đủ quyền Giảng viên.',
      type: 'SYSTEM',
      link: '/lecturer/dashboard',
    }).catch(err => console.error('Failed to notify student on approval:', err));

    res.json({
      success: true,
      message: 'Đã duyệt hồ sơ và nâng cấp quyền Giảng viên thành công!',
      application,
    });
  } catch (error) {
    console.error('approveApplication error:', error);
    res.status(500).json({ message: 'Server Error khi duyệt hồ sơ' });
  }
};

// PATCH /api/lecturer-applications/:id/reject (Admin only)
export const rejectApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const application = await LecturerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ đăng ký' });
    }

    application.status = 'REJECTED';
    application.rejectionReason = reason || '';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    // Notify student
    createNotification(application.userId, {
      title: 'Đăng ký Giảng viên chưa được chấp thuận',
      message: reason
        ? `Yêu cầu làm Giảng viên của bạn bị từ chối: "${reason}".`
        : 'Yêu cầu làm Giảng viên của bạn chưa được Ban Quản trị chấp thuận.',
      type: 'SYSTEM',
      link: '/student/profile',
    }).catch(err => console.error('Failed to notify student on rejection:', err));

    res.json({
      success: true,
      message: 'Đã từ chối hồ sơ đăng ký',
      application,
    });
  } catch (error) {
    console.error('rejectApplication error:', error);
    res.status(500).json({ message: 'Server Error khi từ chối hồ sơ' });
  }
};
