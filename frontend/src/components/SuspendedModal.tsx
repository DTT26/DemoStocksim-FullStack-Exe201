import { ShieldAlert, X, Mail, AlertOctagon } from 'lucide-react';

interface SuspendedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const SuspendedModal = ({
  isOpen,
  onClose,
  title = 'Tài khoản bị tạm ngưng (Suspended)',
  message = 'Tài khoản của bạn đã bị khóa hoặc tạm ngưng hoạt động trên hệ thống StockSim. Vui lòng liên hệ Quản trị viên để được hỗ trợ.'
}: SuspendedModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#080C14]/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#111827] w-full max-w-md rounded-2xl shadow-2xl border border-rose-500/30 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-rose-950/40 to-transparent">
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10 shrink-0">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Truy cập bị từ chối • Access Denied</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-2 space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            {message}
          </p>

          {/* Details Box */}
          <div className="bg-[#172033] border border-[#253047] rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#253047]">
              <span className="text-slate-400">Trạng thái tài khoản:</span>
              <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                SUSPENDED
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#253047]">
              <span className="text-slate-400">Nguyên nhân:</span>
              <span className="text-slate-200 font-medium">Bị đình chỉ bởi Quản trị viên</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
              Nếu bạn cho rằng đây là sự nhầm lẫn hoặc cần mở lại tài khoản, vui lòng gửi yêu cầu hỗ trợ qua email bên dưới.
            </p>
          </div>

          {/* Support Email Card */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-mono text-slate-200">support@stocksim.edu.vn</span>
            </div>
            <a 
              href="mailto:support@stocksim.edu.vn?subject=[Yêu cầu hỗ trợ] Mở khóa tài khoản StockSim"
              className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs transition-colors"
            >
              Gửi email
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#172033]/60 border-t border-[#253047] flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 font-bold text-sm text-white rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 transition-all shadow-lg shadow-rose-600/20 active:scale-[0.99] cursor-pointer"
          >
            Đã hiểu &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
