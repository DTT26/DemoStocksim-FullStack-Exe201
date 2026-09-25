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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#080C14]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] w-full max-w-md rounded-2xl shadow-2xl border border-[#253047] overflow-hidden flex flex-col">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              type === 'danger' ? 'bg-rose-500/10 text-rose-500' : 
              type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
              'bg-indigo-500/10 text-indigo-500'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#172033]">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-400 text-sm">{message}</p>
        </div>
        
        <div className="px-6 py-4 bg-[#172033] border-t border-[#253047] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-300 hover:text-white bg-[#111827] border border-[#253047] rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 font-medium text-white rounded-lg transition-colors shadow-lg ${
              type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 
              type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 
              'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
