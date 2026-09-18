import { useState } from 'react';
import { type Stock } from '../data';

interface ContractInfoPanelProps {
  stock: Stock;
}

type LocalTab = 'contract_info' | 'position_margin' | 'trading_rules' | 'position_leverage';

export const ContractInfoPanel = ({ stock }: ContractInfoPanelProps) => {
  const [activeTab, setActiveTab] = useState<LocalTab>('contract_info');

  return (
    <div className="flex-1 bg-white dark:bg-[#131722] overflow-y-auto p-6 text-sm text-[#1e2329] dark:text-[#d1d4dc] transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Local Tabs */}
        <div className="flex items-center gap-6 border-b border-[#e6e8ea] dark:border-[#2a2e39] mb-6 text-[13px] font-medium">
          <button 
            onClick={() => setActiveTab('contract_info')}
            className={`pb-2 -mb-[1px] ${activeTab === 'contract_info' ? 'text-[#1e2329] dark:text-white border-b-2 border-blue-600' : 'text-[#787b86] hover:text-[#1e2329] dark:hover:text-white'}`}
          >
            Thông tin hợp đồng
          </button>
          <button 
            onClick={() => setActiveTab('position_margin')}
            className={`pb-2 -mb-[1px] ${activeTab === 'position_margin' ? 'text-[#1e2329] dark:text-white border-b-2 border-blue-600' : 'text-[#787b86] hover:text-[#1e2329] dark:hover:text-white'}`}
          >
            Vị thế & Ký quỹ duy trì
          </button>
          <button 
            onClick={() => setActiveTab('trading_rules')}
            className={`pb-2 -mb-[1px] ${activeTab === 'trading_rules' ? 'text-[#1e2329] dark:text-white border-b-2 border-blue-600' : 'text-[#787b86] hover:text-[#1e2329] dark:hover:text-white'}`}
          >
            Quy định về giao dịch
          </button>
          <button 
            onClick={() => setActiveTab('position_leverage')}
            className={`pb-2 -mb-[1px] ${activeTab === 'position_leverage' ? 'text-[#1e2329] dark:text-white border-b-2 border-blue-600' : 'text-[#787b86] hover:text-[#1e2329] dark:hover:text-white'}`}
          >
            Vị thế & Đòn bẩy
          </button>
        </div>

        {/* Content Grid */}
        {activeTab === 'contract_info' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#787b86]">Hợp đồng</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">{stock.symbol}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#787b86]">Đồng quyết toán</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">USDT</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#787b86]">Độ chuẩn giá</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">0.01</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#787b86]">Số lượng giao dịch tối thiểu</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">0.01 {stock.symbol.replace('USDT', '').replace('.P', '')}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#787b86]">Chu kỳ tài trợ</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">8 giờ</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#787b86]">Loại Hợp đồng</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">Hợp đồng Vĩnh viễn</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#787b86]">Nguồn giá chỉ số</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">BINANCE, BYBIT, OKX</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#787b86]">Bước giá tối thiểu</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">0.01</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#787b86]">Giá trị giao dịch tối thiểu</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">2.00 USDT</span>
                </div>
                <div className="flex justify-between items-start py-2">
                  <span className="text-[#787b86] w-1/3">Lãi Lỗ chưa thực hiện</span>
                  <div className="text-right text-[#1e2329] dark:text-white flex-1 text-xs space-y-1">
                    <p>Long: Kích cỡ vị thế * (giá đánh dấu - giá vào lệnh)</p>
                    <p>Short: Kích cỡ vị thế * (giá vào lệnh - giá đánh dấu)</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Full-width Row */}
            <div className="mt-4 flex justify-between items-start py-2 md:w-1/2 md:pr-6">
              <span className="text-[#787b86] w-1/3">Lãi Lỗ đã chốt</span>
              <div className="text-right text-[#1e2329] dark:text-white flex-1 text-xs space-y-1">
                <p>Long: Kích cỡ vị thế * (giá đóng trung bình - giá vào lệnh)</p>
                <p>Short: Kích cỡ vị thế * (giá vào lệnh - giá đóng trung bình)</p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-[#787b86]">
            Nội dung tab {activeTab === 'position_margin' ? 'Vị thế & Ký quỹ' : activeTab === 'trading_rules' ? 'Quy định giao dịch' : 'Đòn bẩy'} đang được cập nhật...
          </div>
        )}
        
      </div>
    </div>
  );
};
