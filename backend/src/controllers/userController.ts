import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Wallet from '../models/Wallet';
import SimulationParticipant from '../models/SimulationParticipant';

// GET /api/users/me
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.status === 'DISABLED' || user.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa hoặc tạm ngưng (Suspended)' });
    }

    // Lấy thông tin Ví của User
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        balance: 100000000,
        availableBalance: 100000000
      });
    }

    // Lấy thêm thông tin về các cuộc thi đã tham gia
    const participations = await SimulationParticipant.find({ userId: req.user._id }).populate('simulationId', 'name status');
    
    res.json({
      ...user.toObject(),
      balance: wallet.availableBalance,
      wallet,
      participations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// PUT /api/users/me
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, bio, university, studentId, className, department, title, picture } = req.body;

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (university !== undefined) user.university = university;
    if (studentId !== undefined) user.studentId = studentId;
    if (req.body.class !== undefined) user.class = req.body.class;
    else if (className !== undefined) user.class = className;
    if (department !== undefined) user.department = department;
    if (title !== undefined) user.title = title;
    if (picture !== undefined) {
      user.picture = picture;
      user.customAvatar = true;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error('updateMyProfile error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/users (Admin only)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, role, status } = req.query;
    let query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }
    if (status) {
      query.status = status;
    }

    const users = await User.find(query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/users/:id (Admin only)
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// PATCH /api/users/:id/role (Admin only)
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = req.body.role || user.role;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// PATCH /api/users/:id/status (Admin only)
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.status = req.body.status || user.status;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// DELETE /api/users/:id (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// PUT /api/users/change-password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có tối thiểu 8 ký tự.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản người dùng.' });
    }

    // Nếu tài khoản đã có mật khẩu thì bắt buộc kiểm tra mật khẩu hiện tại
    if (user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Vui lòng nhập mật khẩu cũ / hiện tại.' });
      }

      const isCurrentMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentMatch) {
        return res.status(400).json({ message: 'Mật khẩu cũ không chính xác. Vui lòng kiểm tra lại.' });
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
      if (isSamePassword) {
        return res.status(400).json({ message: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
      }
    }

    // Băm và lưu mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình đổi mật khẩu.' });
  }
};
