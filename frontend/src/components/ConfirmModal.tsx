import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#09090b] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-[#262626] overflow-hidden flex flex-col transition-colors">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              type === 'danger' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 
              type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
              'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c1c1f] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>
        
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-[#000000] border-t border-slate-200 dark:border-[#262626] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#262626] rounded-xl hover:bg-slate-100 dark:hover:bg-[#1c1c1f] transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm cursor-pointer ${
              type === 'danger' ? 'bg-rose-600 hover:bg-rose-500' : 
              type === 'warning' ? 'bg-amber-600 hover:bg-amber-500' : 
              'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
