import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Notification, { INotification } from '../models/Notification';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import SimulationParticipant from '../models/SimulationParticipant';

/**
 * Helper function to create a notification in DB
 */
export const createNotification = async (
  userId: any,
  data: {
    title: string;
    message: string;
    type?: INotification['type'];
    link?: string;
  }
) => {
  try {
    return await Notification.create({
      userId,
      title: data.title,
      message: data.message,
      type: data.type || 'SYSTEM',
      link: data.link || '',
      read: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * GET /api/notifications
 * Fetch notifications for the current user & auto-check due assignments
 */
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    // If student, check for upcoming assignment deadlines within 48h
    if (req.user.role === 'student') {
      try {
        const now = new Date();
        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        // Find student participations to know their simulations
        const participations = await SimulationParticipant.find({ userId, status: 'ACTIVE' });
        const simIds = participations.map(p => p.simulationId);

        // Find open assignments with deadline in the next 48 hours
        const upcomingAssignments = await Assignment.find({
          status: 'OPEN',
          deadline: { $gte: now, $lte: in48Hours },
          $or: [
            { assignedTo: userId },
            { simulationId: { $in: simIds } },
            { assignedTo: { $exists: false } },
            { assignedTo: { $size: 0 } }
          ]
        });

        for (const ass of upcomingAssignments) {
          // Check if already submitted
          const submission = await Submission.findOne({
            assignmentId: ass._id,
            studentId: userId,
            status: { $in: ['SUBMITTED', 'GRADED'] }
          });

          if (!submission) {
            // Check if already notified for this assignment recently
            const existingNotif = await Notification.findOne({
              userId,
              type: 'ASSIGNMENT_DUE',
              link: `/student/assignments/${ass._id}`
            });

            if (!existingNotif) {
              const formattedDate = new Date(ass.deadline).toLocaleDateString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit'
              });

              await Notification.create({
                userId,
                title: 'Bài tập sắp đến hạn nộp',
                message: `Bài tập "${ass.title}" sẽ hết hạn vào lúc ${formattedDate}. Vui lòng hoàn thành và nộp bài!`,
                type: 'ASSIGNMENT_DUE',
                link: `/student/assignments/${ass._id}`,
                read: false
              });
            }
          }
        }
      } catch (checkErr) {
        console.warn('Error checking due assignments for notification:', checkErr);
      }
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('getMyNotifications error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark single notification as read
 */
export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.json({ success: true, notification, unreadCount });
  } catch (error) {
    console.error('markNotificationAsRead error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, unreadCount: 0 });
  } catch (error) {
    console.error('markAllNotificationsAsRead error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * DELETE /api/notifications
 * Clear all notifications for the user
 */
export const clearMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    console.error('clearMyNotifications error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
