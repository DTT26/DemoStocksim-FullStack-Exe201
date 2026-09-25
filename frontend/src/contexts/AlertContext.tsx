import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface AlertContextType {
  showAlert: (message: string, type?: 'info' | 'error' | 'success') => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'error' | 'success'>('info');

  const showAlert = (msg: string, t: 'info' | 'error' | 'success' = 'error') => {
    setMessage(msg);
    setType(t);
    setIsOpen(true);
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-6 h-6 text-rose-500" />;
      case 'success': return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'info':
      default: return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-white dark:bg-[#1e222d] w-[400px] rounded-xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2a2e39]">
              <div className="flex items-center gap-2">
                {getIcon()}
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {type === 'error' ? 'Lỗi' : type === 'success' ? 'Thành công' : 'Thông báo'}
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#2a2e39] rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-gray-700 dark:text-gray-300">
              {message}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#131722] border-t border-gray-200 dark:border-[#2a2e39] flex justify-end">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
