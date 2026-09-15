import { type Stock } from '../data';
import { FUNDAMENTAL_DATA } from '../fundamentalData';
import { ExternalLink, ArrowUpRight } from 'lucide-react';

interface CoinInfoPanelProps {
  stock: Stock;
}

export const CoinInfoPanel = ({ stock }: CoinInfoPanelProps) => {
  const data = FUNDAMENTAL_DATA[stock.symbol];

  if (!data) {
    return (
      <div className="flex-1 bg-[#131722] flex items-center justify-center text-[#787b86]">
        Chưa có thông tin cơ bản cho mã giao dịch này.
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-[#131722] overflow-y-auto px-4 py-5 md:px-6 text-sm text-[#1e2329] dark:text-[#d1d4dc] transition-colors">
      <div className="w-full flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Left Column: Stats */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-[20px] font-semibold text-[#1e2329] dark:text-white">
              {data.name}
            </h1>
            <p className="text-xs text-[#787b86] leading-relaxed">
              *Dữ liệu do CoinMarketCap cung cấp chỉ cho mục đích tham khảo thông tin. Nó được hiển thị trên cơ sở "nguyên trạng" và không cấu thành bất kỳ hình thức đại diện hay bảo đảm.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
              <span className="text-[#787b86]">Thứ Hạng Vốn Hóa</span>
              <span className="font-semibold text-[#1e2329] dark:text-white">{data.rank || '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
              <span className="text-[#787b86]">Vốn Hóa Lưu Thông</span>
              <span className="font-semibold text-[#1e2329] dark:text-white">{data.marketCap || '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
              <span className="text-[#787b86]">Vốn Hóa Thị Trường Pha Loãng Hoàn Toàn</span>
              <span className="font-semibold text-[#1e2329] dark:text-white">{data.fullyDilutedValuation || '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
              <span className="text-[#787b86]">Thống Trị Thị Trường</span>
              <span className="font-semibold text-[#1e2329] dark:text-white">{data.marketDominance || '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
              <span className="text-[#787b86]">Nguồn Cung Lưu Thông</span>
              <span className="font-semibold text-[#1e2329] dark:text-white">{data.circulatingSupply || '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
              <span className="text-[#787b86]">Nguồn Cung Tối Đa</span>
              <span className="font-semibold text-[#1e2329] dark:text-white">{data.maxSupply || '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
              <span className="text-[#787b86]">Tổng Nguồn Cung</span>
              <span className="font-semibold text-[#1e2329] dark:text-white">{data.totalSupply || '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
              <span className="text-[#787b86]">Ngày Cấp</span>
              <span className="font-semibold text-[#1e2329] dark:text-white">{data.issueDate || '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#f0f3f6] dark:border-[#2a2e39]/50">
              <span className="text-[#787b86]">Đỉnh Cao Nhất</span>
              <span className="font-semibold text-[#1e2329] dark:text-white">{data.allTimeHigh || '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#787b86]">Đáy Thấp Nhất</span>
              <span className="font-semibold text-[#1e2329] dark:text-white">{data.allTimeLow || '--'}</span>
            </div>
            
            <div className="pt-3">
              <span className="text-[#787b86] block mb-2.5">Liên kết liên quan</span>
              <div className="flex flex-wrap gap-2">
                {data.website && (
                  <a href={data.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f3f6] dark:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc] rounded hover:bg-[#e2e8f0] dark:hover:bg-[#363a45] transition-colors text-xs font-medium">
                    Trang web chính thức <ArrowUpRight className="w-3.5 h-3.5 text-[#787b86]" />
                  </a>
                )}
                {data.whitepaper && (
                  <a href={data.whitepaper} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f3f6] dark:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc] rounded hover:bg-[#e2e8f0] dark:hover:bg-[#363a45] transition-colors text-xs font-medium">
                    Sách Trắng <ArrowUpRight className="w-3.5 h-3.5 text-[#787b86]" />
                  </a>
                )}
                {data.explorer && (
                  <a href={data.explorer} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f3f6] dark:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc] rounded hover:bg-[#e2e8f0] dark:hover:bg-[#363a45] transition-colors text-xs font-medium">
                    Explorer <ArrowUpRight className="w-3.5 h-3.5 text-[#787b86]" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Introduction */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[16px] font-semibold text-[#1e2329] dark:text-white">Mở đầu</h2>
            <button className="text-blue-500 hover:underline text-sm font-medium">
              Thêm
            </button>
          </div>
          <p className="text-[#474d57] dark:text-[#b2b5be] leading-relaxed text-[13px] text-justify whitespace-pre-line">
            {data.introduction}
          </p>
        </div>
      </div>
    </div>
  );
};
