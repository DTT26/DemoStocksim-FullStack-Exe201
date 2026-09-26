import { create } from 'zustand';

export interface AppNotification {
  _id: string;
  id: string; // for compatibility
  title: string;
  message: string;
  description?: string; // alias for message
  type: 
    | 'SIMULATION_JOIN' 
    | 'SIMULATION_APPROVED' 
    | 'SIMULATION_REJECTED' 
    | 'SIMULATION_KICKED' 
    | 'ASSIGNMENT_NEW' 
    | 'ASSIGNMENT_DUE' 
    | 'ASSIGNMENT_SUBMITTED' 
    | 'ASSIGNMENT_GRADED' 
    | 'SYSTEM'
    | 'info' 
    | 'success' 
    | 'warning' 
    | 'error'
    | string;
  link?: string;
  read: boolean;
  createdAt: string;
  timestamp: number;
}

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  addNotification?: (notification: any) => void;
}

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    try {
      const token = localStorage.getItem('token');
      // If no token or not logged in, don't attempt
      if (!token) return;

      const res = await fetch(`${getApiUrl()}/notifications`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        const list: AppNotification[] = (data.notifications || []).map((n: any) => ({
          ...n,
          id: n._id,
          description: n.message,
          timestamp: new Date(n.createdAt).getTime(),
        }));
        set({
          notifications: list,
          unreadCount: typeof data.unreadCount === 'number' ? data.unreadCount : list.filter(n => !n.read).length,
          loading: false,
        });
      }
    } catch (error) {
      console.warn('Failed to fetch notifications from backend:', error);
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic update
    set((state) => {
      const target = state.notifications.find(n => n._id === id || n.id === id);
      const isUnread = target && !target.read;
      return {
        notifications: state.notifications.map((n) =>
          (n._id === id || n.id === id) ? { ...n, read: true } : n
        ),
        unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });

    try {
      await fetch(`${getApiUrl()}/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));

    try {
      await fetch(`${getApiUrl()}/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  clearNotifications: async () => {
    set({ notifications: [], unreadCount: 0 });

    try {
      await fetch(`${getApiUrl()}/notifications`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  },

  addNotification: (notification) => {
    const id = notification._id || Math.random().toString(36).substring(7);
    const newNotif: AppNotification = {
      _id: id,
      id: id,
      title: notification.title,
      message: notification.message || notification.description || '',
      description: notification.message || notification.description || '',
      type: notification.type || 'SYSTEM',
      link: notification.link,
      read: false,
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
