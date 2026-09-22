import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ModalType = 'success' | 'warning' | 'danger' | 'error' | 'info';

export interface AlertOptions {
  title?: string;
  message: string | ReactNode;
  type?: ModalType;
  confirmText?: string;
}

export interface ConfirmOptions {
  title?: string;
  message: string | ReactNode;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
}

interface ModalState {
  isOpen: boolean;
  isConfirm: boolean;
  title: string;
  message: string | ReactNode;
  type: ModalType;
  confirmText: string;
  cancelText: string;
  resolve?: (value: boolean) => void;
}

interface ModalContextType {
  showAlert: (options: AlertOptions | string) => Promise<void>;
  showConfirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    isConfirm: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Đồng ý',
    cancelText: 'Hủy bỏ',
  });

  const showAlert = useCallback((options: AlertOptions | string): Promise<void> => {
    return new Promise((resolve) => {
      const opts: AlertOptions = typeof options === 'string' ? { message: options } : options;
      setModalState({
        isOpen: true,
        isConfirm: false,
        title: opts.title || (opts.type === 'error' ? 'Lỗi' : opts.type === 'success' ? 'Thành công' : opts.type === 'warning' ? 'Cảnh báo' : 'Thông báo'),
        message: opts.message,
        type: opts.type || 'info',
        confirmText: opts.confirmText || 'Đã hiểu',
        cancelText: '',
        resolve: () => resolve(),
      });
    });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
      setModalState({
        isOpen: true,
        isConfirm: true,
        title: opts.title || 'Xác nhận thao tác',
        message: opts.message,
        type: opts.type || 'warning',
        confirmText: opts.confirmText || 'Xác nhận',
        cancelText: opts.cancelText || 'Hủy bỏ',
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (modalState.resolve) {
      modalState.resolve(true);
    }
    setModalState((prev) => ({ ...prev, isOpen: false, resolve: undefined }));
  };

  const handleCancel = () => {
    if (modalState.resolve) {
      modalState.resolve(false);
    }
    setModalState((prev) => ({ ...prev, isOpen: false, resolve: undefined }));
  };

  // Keyboard navigation: Escape cancels, Enter confirms
  useEffect(() => {
    if (!modalState.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState.isOpen, modalState.resolve]);

  const getIcon = () => {
    switch (modalState.type) {
      case 'success':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        );
      case 'danger':
      case 'error':
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-500/10">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/10">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmButtonColor = () => {
    switch (modalState.type) {
      case 'danger':
      case 'error':
        return 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-900/30 focus:ring-rose-500';
      case 'warning':
        return 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-900/30 focus:ring-amber-500';
      case 'success':
        return 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-900/30 focus:ring-emerald-500';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-900/30 focus:ring-blue-500';
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {modalState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={modalState.isConfirm ? handleCancel : handleConfirm}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-[#181a20] border border-[#2b313a] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Top decorative gradient line */}
            <div className={`h-1 w-full ${
              modalState.type === 'danger' || modalState.type === 'error'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600'
                : modalState.type === 'warning'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                : modalState.type === 'success'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500'
            }`} />

            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2b313a] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Area */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                {getIcon()}
                <div className="flex-1 pt-1 min-w-0">
                  <h3 className="text-lg font-bold text-white tracking-wide leading-snug">
                    {modalState.title}
                  </h3>
                  <div className="mt-2 text-sm text-gray-300 leading-relaxed whitespace-pre-line break-words">
                    {modalState.message}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                {modalState.isConfirm && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 bg-[#2b313a] hover:bg-[#363d49] hover:text-white transition-all cursor-pointer border border-[#373e4b]"
                  >
                    {modalState.cancelText}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#181a20] active:scale-[0.98] ${getConfirmButtonColor()}`}
                >
                  {modalState.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
