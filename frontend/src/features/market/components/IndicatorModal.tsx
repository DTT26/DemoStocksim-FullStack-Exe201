import { X, TrendingUp, Zap, BarChart2 } from 'lucide-react';

export interface IndicatorDef {
  name: string;      // klinecharts indicator name
  label: string;     // tên hiển thị
  description: string;
  pane: 'main' | 'sub'; // vẽ trên chart chính hay panel riêng
}

export const INDICATOR_LIST: IndicatorDef[] = [
  // Trend — vẽ trên nến
  { name: 'MA',   label: 'MA',   description: 'Đường trung bình động đơn giản', pane: 'main' },
  { name: 'EMA',  label: 'EMA',  description: 'Đường trung bình động hàm mũ',  pane: 'main' },
  { name: 'BOLL', label: 'BOLL', description: 'Bollinger Bands — dải biến động', pane: 'main' },
  { name: 'SAR',  label: 'SAR',  description: 'Parabolic SAR — điểm đảo chiều', pane: 'main' },
  // Momentum — panel riêng
  { name: 'MACD', label: 'MACD', description: 'Moving Avg Convergence Divergence', pane: 'sub' },
  { name: 'RSI',  label: 'RSI',  description: 'Chỉ số sức mạnh tương đối (0–100)', pane: 'sub' },
  { name: 'KDJ',  label: 'KDJ',  description: 'Stochastic KDJ — vùng quá mua/bán',pane: 'sub' },
  // Volume — panel riêng
  { name: 'VOL',  label: 'VOL',  description: 'Khối lượng giao dịch', pane: 'sub' },
  { name: 'OBV',  label: 'OBV',  description: 'On Balance Volume — tích lũy KL',  pane: 'sub' },
];

const CATEGORIES = [
  { key: 'trend',    label: 'Xu hướng',    icon: TrendingUp, names: ['MA', 'EMA', 'BOLL', 'SAR'] },
  { key: 'momentum', label: 'Động lượng',  icon: Zap,        names: ['MACD', 'RSI', 'KDJ'] },
  { key: 'volume',   label: 'Khối lượng',  icon: BarChart2,  names: ['VOL', 'OBV'] },
];

interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeIndicators: string[];
  onToggle: (name: string) => void;
}

export const IndicatorModal = ({ isOpen, onClose, activeIndicators, onToggle }: IndicatorModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1e222d] w-full max-w-xl rounded-lg shadow-2xl border border-[#2a2e39] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            Chỉ báo kỹ thuật
          </h2>
          <button onClick={onClose} className="text-[#787b86] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
          {CATEGORIES.map(cat => {
            const catIndicators = INDICATOR_LIST.filter(i => cat.names.includes(i.name));
            const Icon = cat.icon;
            return (
              <div key={cat.key}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-[#787b86]" />
                  <span className="text-[#787b86] text-xs font-semibold uppercase tracking-widest">{cat.label}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {catIndicators.map(ind => {
                    const isActive = activeIndicators.includes(ind.name);
                    return (
                      <button
                        key={ind.name}
                        onClick={() => onToggle(ind.name)}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-left ${
                          isActive
                            ? 'bg-blue-600/20 border-blue-500/50 text-white'
                            : 'bg-[#131722] border-[#2a2e39] text-[#d1d4dc] hover:border-[#787b86]'
                        }`}
                      >
                        <div>
                          <span className={`font-bold text-sm ${isActive ? 'text-blue-300' : ''}`}>{ind.label}</span>
                          <p className="text-[#787b86] text-xs mt-0.5">{ind.description}</p>
                        </div>
                        <div className={`w-10 h-5 rounded-full transition-colors shrink-0 ${isActive ? 'bg-blue-600' : 'bg-[#2a2e39]'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2a2e39] text-xs text-[#787b86] flex items-center justify-between">
          <span>{activeIndicators.length} chỉ báo đang bật</span>
          {activeIndicators.length > 0 && (
            <button
              onClick={() => activeIndicators.forEach(n => onToggle(n))}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Tắt tất cả
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
