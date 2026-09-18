import { Wifi, Plus } from 'lucide-react';

export const FooterTicker = () => {
  return (
    <div className="h-8 bg-[#0b0e11] border-t border-[#2a2e39] flex items-center px-3 text-[11px] text-[#787b86] shrink-0 font-medium overflow-hidden whitespace-nowrap">
      
      {/* Connection Status */}
      <div className="flex items-center gap-1.5 pr-4 border-r border-[#2a2e39] shrink-0">
        <Wifi className="w-3.5 h-3.5 text-[#089981]" />
        <span className="text-[#089981]">Đường truyền ổn định</span>
      </div>

      {/* Ticker Items */}
      <div className="flex items-center flex-1 overflow-hidden ml-4 gap-6">
        <span className="text-[#d1d4dc] hover:text-white cursor-pointer transition-colors">Tuyển chọn</span>
        
        <span className="hover:text-white cursor-pointer transition-colors">BTCUSDT</span>
        <span className="hover:text-white cursor-pointer transition-colors">ETHUSDT</span>
        <span className="hover:text-white cursor-pointer transition-colors">SOLUSDT</span>
        <span className="hover:text-white cursor-pointer transition-colors">DOGEUSDT</span>

        <button className="flex items-center gap-1 hover:text-white transition-colors ml-2">
          <Plus className="w-3 h-3" />
          <span>Thêm vào Tuyển chọn</span>
        </button>
      </div>

    </div>
  );
};
