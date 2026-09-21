import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useNotificationStore } from '../stores/useNotificationStore';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'info':
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return new Date(timestamp).toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-[#2a2e39] p-1.5 rounded transition-colors shrink-0 text-[#787b86] hover:text-[#d1d4dc]"
        title="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-[#131722]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1e222d] rounded-xl shadow-2xl border border-gray-200 dark:border-[#2a2e39] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2a2e39] bg-gray-50 dark:bg-[#1e222d]">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Thông báo {unreadCount > 0 && <span className="bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 text-xs py-0.5 px-2 rounded-full">{unreadCount} mới</span>}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  onClick={() => clearNotifications()}
                  className="p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors"
                  title="Xóa tất cả"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-[#2a2e39]/50">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.id);
                    }}
                    className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-[#2a2e39]/50 ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(notification.timestamp)}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="shrink-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
