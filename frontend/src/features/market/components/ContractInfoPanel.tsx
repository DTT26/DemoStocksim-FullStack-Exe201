import { useState } from 'react';
import { type Stock } from '../data';

interface ContractInfoPanelProps {
  stock: Stock;
}

type LocalTab = 'contract_info' | 'position_margin' | 'trading_rules' | 'position_leverage';

export const ContractInfoPanel = ({ stock }: ContractInfoPanelProps) => {
  const [activeTab, setActiveTab] = useState<LocalTab>('contract_info');

  return (
    <div className="flex-1 bg-white dark:bg-[#131722] overflow-y-auto px-4 py-5 md:px-6 text-sm text-[#1e2329] dark:text-[#d1d4dc] transition-colors">
      <div className="w-full">
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

        {/* Content Tabs */}
        {activeTab === 'contract_info' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                  <span className="text-[#787b86]">Hợp đồng</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">{stock.symbol}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                  <span className="text-[#787b86]">Đồng quyết toán</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">USDT</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                  <span className="text-[#787b86]">Độ chuẩn giá</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">0.01</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                  <span className="text-[#787b86]">Số lượng giao dịch tối thiểu</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">0.01 {stock.symbol.replace('USDT', '').replace('.P', '')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                  <span className="text-[#787b86]">Chu kỳ tài trợ</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">8 giờ (00:00, 08:00, 16:00 UTC)</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                  <span className="text-[#787b86]">Loại Hợp đồng</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">Hợp đồng Vĩnh viễn (Perpetual Swap)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                  <span className="text-[#787b86]">Nguồn giá chỉ số</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">BINANCE, BYBIT, OKX</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                  <span className="text-[#787b86]">Bước giá tối thiểu</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">0.01</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                  <span className="text-[#787b86]">Giá trị giao dịch tối thiểu</span>
                  <span className="font-semibold text-[#1e2329] dark:text-white">2.00 USDT</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
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
        )}

        {/* Tab 2: Position & Maintenance Margin */}
        {activeTab === 'position_margin' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg text-xs leading-relaxed text-[#1e2329] dark:text-blue-200">
              <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">ℹ️ Cơ chế Ký quỹ duy trì phân tầng (Tiered Maintenance Margin)</p>
              Tỷ lệ ký quỹ duy trì là tỷ lệ tối thiểu bạn phải giữ để duy trì vị thế mở. Khi quy mô vị thế càng lớn, mức đòn bẩy tối đa cho phép sẽ tự động giảm và tỷ lệ ký quỹ duy trì sẽ tăng lên nhằm giảm thiểu rủi ro biến động thị trường.
            </div>

            <div className="overflow-x-auto border border-[#e6e8ea] dark:border-[#2a2e39] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f8f9fa] dark:bg-[#1e222d] text-[#787b86] border-b border-[#e6e8ea] dark:border-[#2a2e39]">
                    <th className="py-3 px-4 font-semibold">Cấp bậc</th>
                    <th className="py-3 px-4 font-semibold">Quy mô vị thế (USDT)</th>
                    <th className="py-3 px-4 font-semibold">Đòn bẩy tối đa</th>
                    <th className="py-3 px-4 font-semibold">Tỷ lệ Ký quỹ duy trì</th>
                    <th className="py-3 px-4 font-semibold">Số tiền ký quỹ duy trì (USDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39]/60">
                  <tr className="hover:bg-gray-50 dark:hover:bg-[#1e222d]/50">
                    <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">Tier 1</td>
                    <td className="py-3 px-4">0 - 50,000</td>
                    <td className="py-3 px-4 font-semibold text-[#1e2329] dark:text-white">{stock.leverageInfo.max}x</td>
                    <td className="py-3 px-4 font-medium text-[#089981]">0.40%</td>
                    <td className="py-3 px-4">0</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-[#1e222d]/50">
                    <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">Tier 2</td>
                    <td className="py-3 px-4">50,000 - 250,000</td>
                    <td className="py-3 px-4 font-semibold text-[#1e2329] dark:text-white">{Math.round(stock.leverageInfo.max * 0.6)}x</td>
                    <td className="py-3 px-4 font-medium text-[#089981]">0.50%</td>
                    <td className="py-3 px-4">50</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-[#1e222d]/50">
                    <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">Tier 3</td>
                    <td className="py-3 px-4">250,000 - 1,000,000</td>
                    <td className="py-3 px-4 font-semibold text-[#1e2329] dark:text-white">{Math.round(stock.leverageInfo.max * 0.4)}x</td>
                    <td className="py-3 px-4 font-medium text-[#089981]">1.00%</td>
                    <td className="py-3 px-4">1,300</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-[#1e222d]/50">
                    <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">Tier 4</td>
                    <td className="py-3 px-4">1,000,000 - 5,000,000</td>
                    <td className="py-3 px-4 font-semibold text-[#1e2329] dark:text-white">{Math.round(stock.leverageInfo.max * 0.2)}x</td>
                    <td className="py-3 px-4 font-medium text-[#089981]">2.50%</td>
                    <td className="py-3 px-4">16,300</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-[#1e222d]/50">
                    <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">Tier 5</td>
                    <td className="py-3 px-4">&gt; 5,000,000</td>
                    <td className="py-3 px-4 font-semibold text-[#1e2329] dark:text-white">5x</td>
                    <td className="py-3 px-4 font-medium text-[#089981]">5.00%</td>
                    <td className="py-3 px-4">141,300</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] space-y-2">
                <span className="font-semibold text-[#1e2329] dark:text-white">📌 Công thức Giá thanh lý ước tính</span>
                <p className="text-[#787b86] leading-relaxed">
                  <strong className="text-[#089981]">Long:</strong> Giá vào lệnh × [1 - (Ký quỹ ban đầu - Ký quỹ duy trì) / Kích cỡ vị thế]
                </p>
                <p className="text-[#787b86] leading-relaxed">
                  <strong className="text-[#f23645]">Short:</strong> Giá vào lệnh × [1 + (Ký quỹ ban đầu - Ký quỹ duy trì) / Kích cỡ vị thế]
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] space-y-2">
                <span className="font-semibold text-[#1e2329] dark:text-white">🛡️ Cơ chế Tự động giảm đòn bẩy (ADL)</span>
                <p className="text-[#787b86] leading-relaxed">
                  Khi tài khoản bị thanh lý mà Quỹ bảo hiểm không đủ bù đắp khoản lỗ, hệ thống ADL sẽ tự động đối ứng với các nhà giao dịch có lợi nhuận cao nhất để bảo vệ an toàn cho toàn hệ thống.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Trading Rules */}
        {activeTab === 'trading_rules' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                <span className="text-[#787b86]">Bước giá tối thiểu (Tick Size)</span>
                <span className="font-semibold text-[#1e2329] dark:text-white">0.01 USDT</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                <span className="text-[#787b86]">Khối lượng lệnh tối thiểu (Min Qty)</span>
                <span className="font-semibold text-[#1e2329] dark:text-white">0.001 {stock.symbol.replace('USDT', '').replace('.P', '')}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                <span className="text-[#787b86]">Lệnh thị trường tối đa (Max Market)</span>
                <span className="font-semibold text-[#1e2329] dark:text-white">1,000,000 USDT</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                <span className="text-[#787b86]">Lệnh giới hạn tối đa (Max Limit)</span>
                <span className="font-semibold text-[#1e2329] dark:text-white">5,000,000 USDT</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                <span className="text-[#787b86]">Số lệnh mở tối đa cho phép</span>
                <span className="font-semibold text-[#1e2329] dark:text-white">200 Lệnh</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                <span className="text-[#787b86]">Phí giao dịch Maker (Tạo lập)</span>
                <span className="font-semibold text-[#089981]">0.0200%</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                <span className="text-[#787b86]">Phí giao dịch Taker (Khớp lệnh)</span>
                <span className="font-semibold text-[#f23645]">0.0500%</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                <span className="text-[#787b86]">Biên độ bảo vệ giá (Price Limit)</span>
                <span className="font-semibold text-[#1e2329] dark:text-white">±5.00% so với Giá đánh dấu</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                <span className="text-[#787b86]">Phí thanh lý cưỡng bức</span>
                <span className="font-semibold text-[#1e2329] dark:text-white">0.50% (Đưa vào Quỹ bảo hiểm)</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
                <span className="text-[#787b86]">Trạng thái hợp đồng</span>
                <span className="font-semibold text-[#089981]">Đang giao dịch (Trading)</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] text-xs text-[#787b86] space-y-1.5 leading-relaxed">
              <span className="font-semibold text-[#1e2329] dark:text-white block mb-1">📋 Các loại lệnh được hỗ trợ:</span>
              <p>• <strong>Lệnh Giới Hạn (Limit Order):</strong> Đặt mua hoặc bán ở mức giá chỉ định hoặc tốt hơn.</p>
              <p>• <strong>Lệnh Thị Trường (Market Order):</strong> Khớp ngay lập tức với các mức giá tốt nhất hiện có trên sổ lệnh.</p>
              <p>• <strong>Lệnh Dừng (Stop-Limit / Stop-Market):</strong> Tự động kích hoạt khi giá chạm mức kích hoạt định trước.</p>
              <p>• <strong>Lệnh Chốt Lời / Cắt Lỗ (TP/SL):</strong> Được đính kèm trực tiếp vào vị thế mở để bảo vệ lợi nhuận và hạn chế thua lỗ.</p>
            </div>
          </div>
        )}

        {/* Tab 4: Position & Leverage */}
        {activeTab === 'position_leverage' && (
          <div className="space-y-6">
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-lg text-xs leading-relaxed text-[#1e2329] dark:text-orange-200">
              <span className="font-semibold text-orange-700 dark:text-orange-300 block mb-1">⚡ Lưu ý về Đòn bẩy và Rủi ro</span>
              Giao dịch đòn bẩy cao giúp tối ưu hóa lợi nhuận với số vốn nhỏ, nhưng đồng thời tỷ lệ rủi ro thanh lý cũng tăng theo tương ứng. Hãy luôn quản lý vốn cẩn thận và đặt Stop Loss khi vào lệnh.
            </div>

            <div className="overflow-x-auto border border-[#e6e8ea] dark:border-[#2a2e39] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f8f9fa] dark:bg-[#1e222d] text-[#787b86] border-b border-[#e6e8ea] dark:border-[#2a2e39]">
                    <th className="py-3 px-4 font-semibold">Mức đòn bẩy</th>
                    <th className="py-3 px-4 font-semibold">Tỷ lệ Ký quỹ ban đầu</th>
                    <th className="py-3 px-4 font-semibold">Hạn mức vị thế tối đa (USDT)</th>
                    <th className="py-3 px-4 font-semibold">Ký quỹ duy trì tối thiểu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39]/60">
                  {stock.leverageInfo.marks.map((mark) => (
                    <tr key={mark} className="hover:bg-gray-50 dark:hover:bg-[#1e222d]/50">
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{mark}x</td>
                      <td className="py-3 px-4 font-semibold text-[#1e2329] dark:text-white">{(100 / mark).toFixed(2)}%</td>
                      <td className="py-3 px-4">
                        {mark >= 100 ? '50,000 USDT' : mark >= 75 ? '100,000 USDT' : mark >= 50 ? '250,000 USDT' : mark >= 20 ? '1,000,000 USDT' : '5,000,000 USDT'}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#089981]">
                        {mark >= 100 ? '0.40%' : mark >= 50 ? '0.50%' : '1.00%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Margin Mode Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-semibold text-sm text-[#1e2329] dark:text-white">Chế độ Cross Margin (Ký quỹ chéo)</span>
                </div>
                <p className="text-[#787b86] leading-relaxed">
                  Tất cả các vị thế sử dụng chung toàn bộ số dư khả dụng trong tài khoản để duy trì ký quỹ. Lợi nhuận từ một vị thế có thể dùng để bù lỗ cho vị thế khác, giảm thiểu nguy cơ bị thanh lý cục bộ.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="font-semibold text-sm text-[#1e2329] dark:text-white">Chế độ Isolated Margin (Ký quỹ cô lập)</span>
                </div>
                <p className="text-[#787b86] leading-relaxed">
                  Số tiền ký quỹ được phân bổ độc lập cho từng vị thế. Trong trường hợp vị thế bị thanh lý, bạn sẽ chỉ mất số tiền ký quỹ được phân bổ cho vị thế đó, không ảnh hưởng tới các vị thế khác hoặc số dư còn lại.
                </p>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
