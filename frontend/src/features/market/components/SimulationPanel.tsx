import { useState, useMemo, useEffect } from 'react';
import { HelpCircle, Play, ChevronDown, Calendar, ArrowRight, Edit3, BarChart2 } from 'lucide-react';
import { type Stock } from '../data';
import { AuthOverlay } from './AuthOverlay';
import { useAuth } from '../../../contexts/AuthContext';
import { getSessions, createSession, type PaperSession } from '../../../services/marketApi';

interface SimulationPanelProps {
  currentSymbol: string;
  onStartSimulation: (config: SimulationConfig) => void;
}

export interface SimulationConfig {
  balance: number;
  leverage: number;
  minLot: number;
  lotStep: number;
  maxMarginPercent: number;
  spread: number;
  commission: number;
  swapLong: number;
  swapShort: number;
}

const DEFAULT_CONFIG: SimulationConfig = {
  balance: 10000,
  leverage: 1,
  minLot: 0.01,
  lotStep: 0.01,
  maxMarginPercent: 95,
  spread: 20,
  commission: 7,
  swapLong: -0.5,
  swapShort: -0.3,
};

export const SimulationPanel = ({ currentSymbol, onStartSimulation }: SimulationPanelProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'running' | 'completed'>('running');
  const [isCreating, setIsCreating] = useState(false);
  
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);

  const [sessions, setSessions] = useState<PaperSession[]>([]);

  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      if (user) {
        try {
          const data = await getSessions();
          setSessions(data);
        } catch (error) {
          console.error("Failed to fetch sessions", error);
        }
      }
    };
    fetchSessions();
  }, [user]);

  const activeSessions = sessions.filter(s => s.status === 'running');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  const handleChange = (field: keyof SimulationConfig, value: number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleStart = async () => {
    onStartSimulation(config);
    if (!user) {
      setIsCreating(false);
      return;
    }

    try {
      const newSession = await createSession({
        symbol: currentSymbol,
        initialBalance: config.balance
      });
      setSessions(prev => [newSession, ...prev]);
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create session", error);
    }
  };

  if (isCreating) {
    return (
      <div className="w-[320px] border-l border-[#2a2e39] bg-[#131722] shrink-0 h-full flex flex-col text-[#d1d4dc] font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2e39] shrink-0">
          <h2 className="text-lg font-bold text-white">Bắt đầu phiên giao dịch</h2>
          <button className="w-6 h-6 rounded-full bg-[#1e222d] hover:bg-[#2a2e39] flex items-center justify-center text-[#787b86] transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-5">
          {/* SỐ DƯ BAN ĐẦU */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
              Số dư ban đầu ($)
              <HelpCircle className="w-3.5 h-3.5 text-[#787b86]" />
            </label>
            <input 
              type="number"
              value={config.balance}
              onChange={e => handleChange('balance', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
          </div>

          {/* ĐÒN BẨY */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
              Đòn bẩy (1-1000)
              <HelpCircle className="w-3.5 h-3.5 text-[#787b86]" />
            </label>
            <input 
              type="number"
              value={config.leverage}
              onChange={e => handleChange('leverage', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
          </div>

          {/* LOT */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-bold text-white tracking-wider uppercase">Lot tối thiểu</label>
              <input 
                type="number"
                step="0.01"
                value={config.minLot}
                onChange={e => handleChange('minLot', parseFloat(e.target.value))}
                className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-bold text-white tracking-wider uppercase">Bước nhảy Lot</label>
              <input 
                type="number"
                step="0.01"
                value={config.lotStep}
                onChange={e => handleChange('lotStep', parseFloat(e.target.value))}
                className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
              />
            </div>
          </div>

          {/* SỬ DỤNG KÝ QUỸ TỐI ĐA */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider uppercase">
              Sử dụng ký quỹ tối đa (%)
            </label>
            <input 
              type="number"
              value={config.maxMarginPercent}
              onChange={e => handleChange('maxMarginPercent', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
            
            <div className="mt-1 bg-[#151924] rounded-md p-3 text-xs text-[#787b86] flex items-start gap-2 border border-[#1e222d]">
              <span className="text-yellow-500">💡</span>
              <p>Ký quỹ lot tối thiểu: <strong className="text-white">$137.60</strong> · Tối đa: <strong className="text-white">0.69 lots</strong></p>
            </div>
          </div>

          {/* SPREAD */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider uppercase">Spread (điểm)</label>
            <input 
              type="number"
              value={config.spread}
              onChange={e => handleChange('spread', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
            <div className="bg-[#151924] rounded-md p-2.5 text-xs text-[#787b86]">
              20 pt ≈ 0.20
            </div>
          </div>

          {/* PHÍ HOA HỒNG */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
              Phí hoa hồng mỗi lot ($)
              <HelpCircle className="w-3.5 h-3.5 text-[#787b86]" />
            </label>
            <input 
              type="number"
              value={config.commission}
              onChange={e => handleChange('commission', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
          </div>

          {/* PHÍ QUA ĐÊM LONG */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
              Phí qua đêm Long ($/Lot/Đêm)
              <HelpCircle className="w-3.5 h-3.5 text-[#787b86]" />
            </label>
            <input 
              type="number"
              step="0.1"
              value={config.swapLong}
              onChange={e => handleChange('swapLong', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
          </div>

          {/* PHÍ QUA ĐÊM SHORT */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
              Phí qua đêm Short ($/Lot/Đêm)
              <HelpCircle className="w-3.5 h-3.5 text-[#787b86]" />
            </label>
            <input 
              type="number"
              step="0.1"
              value={config.swapShort}
              onChange={e => handleChange('swapShort', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-[#2a2e39] flex gap-3 shrink-0">
          <button 
            onClick={() => setIsCreating(false)}
            className="flex-1 bg-transparent hover:bg-[#2a2e39] text-white font-bold py-2.5 rounded-md border border-[#2a2e39] transition-colors text-sm"
          >
            HỦY
          </button>
          <button 
            onClick={handleStart}
            className="flex-1 bg-[#089981] hover:bg-[#089981]/90 text-white font-bold py-2.5 rounded-md transition-colors text-sm"
          >
            BẮT ĐẦU
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] border-l border-[#e6e8ea] dark:border-[#2a2e39] bg-white dark:bg-[#131722] shrink-0 h-full flex flex-col text-[#1e2329] dark:text-[#d1d4dc] font-sans relative">
      {!user ? (
        <AuthOverlay
          icon={<BarChart2 className="w-8 h-8" />}
          title="Mô phỏng Giao dịch"
          subtitle="Thực hành giao dịch không rủi ro bằng dữ liệu thực tế"
          features={[
            "Tua lại biểu đồ để kiểm tra chiến lược",
            "Mô phỏng chân thực với thanh khoản thị trường",
            "Đo lường hiệu suất với Nhật ký giao dịch chi tiết"
          ]}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 p-4 shrink-0">
            <h2 className="text-lg font-bold text-[#1e2329] dark:text-white">Mô phỏng Giao dịch</h2>
            <button className="w-6 h-6 rounded-full bg-[#f0f1f3] dark:bg-[#1e222d] hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] flex items-center justify-center text-[#787b86] transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4 shrink-0">
        <button
          onClick={() => setActiveTab('running')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            activeTab === 'running' 
              ? 'bg-[#089981] text-white' 
              : 'bg-[#f0f1f3] dark:bg-[#1e222d] text-[#787b86] hover:text-[#1e2329] dark:hover:text-white'
          }`}
        >
          Đang chạy
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            activeTab === 'completed' 
              ? 'bg-[#089981] text-white' 
              : 'bg-[#f0f1f3] dark:bg-[#1e222d] text-[#787b86] hover:text-[#1e2329] dark:hover:text-white'
          }`}
        >
          Đã xong
        </button>
      </div>

      {activeTab === 'running' && (
        <div className="flex flex-col px-4 flex-1 overflow-hidden">
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full bg-[#089981] hover:bg-[#089981]/90 text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors shrink-0 uppercase text-sm mb-4"
          >
            <Play className="w-4 h-4 fill-white" />
            BẮT ĐẦU PHIÊN MỚI
          </button>
          
          {activeSessions.length === 0 ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center p-6 text-center text-[#787b86]">
              <div className="w-16 h-16 rounded-full bg-[#f0f1f3] dark:bg-[#1e222d] flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-[#a0a3af] dark:text-[#434651] ml-1" />
              </div>
              <p className="mb-4 text-sm font-medium text-[#1e2329] dark:text-white">Không có phiên giao dịch nào</p>
              <p className="mb-6 text-xs text-[#787b86] max-w-[200px] leading-relaxed">Sử dụng nút ở trên để tạo và định cấu hình phiên mới.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pb-4">
              {activeSessions.map((session) => (
                <div key={session._id} className="bg-[#f8f9fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded-lg p-3 cursor-pointer hover:border-[#089981] transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#1e2329] dark:text-white text-base">{session.symbol}</span>
                    <span className="text-xs text-[#089981] bg-[#089981]/10 px-2 py-0.5 rounded font-bold">Đang chạy</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="text-[#787b86]">Số dư:</span>
                    <span className="font-bold text-[#1e2329] dark:text-[#d1d4dc]">${session.currentBalance.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

          {activeTab === 'completed' && (
            <div className="flex flex-col px-4 flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-bold text-[#1e2329] dark:text-white text-base">Lịch sử Phiên</h3>
                <span className="bg-[#f0f1f3] dark:bg-[#1e222d] text-[#1e2329] dark:text-white text-xs font-bold px-2 py-0.5 rounded">{completedSessions.length}</span>
              </div>
              
              <div className="flex gap-2 mb-4 shrink-0">
                <button className="flex-1 bg-transparent border border-[#e6e8ea] dark:border-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc] rounded px-3 py-1.5 text-sm flex items-center justify-between hover:border-[#787b86] transition-colors">
                  <span className="truncate">Tất cả mã...</span>
                  <ChevronDown className="w-4 h-4 text-[#787b86]" />
                </button>
                <button className="flex-1 bg-transparent border border-[#e6e8ea] dark:border-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc] rounded px-3 py-1.5 text-sm flex items-center justify-between hover:border-[#787b86] transition-colors">
                  <span className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-4 h-4 text-[#787b86]" /> Khoảng ngày
                  </span>
                </button>
              </div>

              <div className="bg-[#089981]/10 dark:bg-[#089981]/10 border border-[#089981]/20 rounded-lg p-4 cursor-pointer hover:bg-[#089981]/20 transition-colors shrink-0 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-[#089981] flex items-center justify-center shrink-0">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-[#089981] text-sm mb-1">Mở Nhật ký Giao dịch</h4>
                    <p className="text-xs text-[#787b86] leading-relaxed">Xem lại, gắn thẻ và phân tích các phiên giao dịch</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#089981] shrink-0 mt-1" />
                </div>
              </div>

              {completedSessions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center pb-10">
                  <p className="font-bold text-[#1e2329] dark:text-white text-base">Chưa có phiên nào hoàn tất</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                  {completedSessions.map(session => (
                    <div key={session._id} className="bg-[#f8f9fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-[#1e2329] dark:text-white text-base">{session.symbol}</span>
                        <span className="text-xs text-[#787b86] bg-[#e6e8ea] dark:bg-[#2a2e39] px-2 py-0.5 rounded font-bold">Hoàn tất</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-mono">
                        <span className="text-[#787b86]">Số dư cuối:</span>
                        <span className="font-bold text-[#1e2329] dark:text-[#d1d4dc]">${session.currentBalance.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
