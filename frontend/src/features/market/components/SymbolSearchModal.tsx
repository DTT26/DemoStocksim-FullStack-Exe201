import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { STOCKS, type Stock, type MarketCategory } from '../data';
import { AssetAvatar, ExchangeBadge } from './AssetAvatar';

interface SymbolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (stock: Stock) => void;
}

const CATEGORIES: ('Tất cả' | MarketCategory)[] = [
  'Tất cả',
  'Tiền điện tử (Crypto)',
  'Cổ phiếu',
  'Ngoại hối (Forex)',
  'Hàng hóa',
  'Chỉ số'
];

export const SymbolSearchModal = ({ isOpen, onClose, onSelect }: SymbolSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'Tất cả' | MarketCategory>('Tất cả');

  const filteredStocks = useMemo(() => {
    return STOCKS.filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'Tất cả' || stock.market === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e222d] w-full max-w-4xl rounded-lg shadow-2xl border border-[#2a2e39] flex flex-col h-[70vh] max-h-[800px] overflow-hidden">
        
        {/* Header: Title and Close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39]">
          <h2 className="text-lg font-bold text-white">Tìm kiếm mã giao dịch</h2>
          <button onClick={onClose} className="text-[#787b86] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-5 pt-4">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#787b86]" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="TÌM KIẾM (VÍ DỤ: BTCUSDT, EURUSD, XAUUSD, FPT)..."
              className="w-full bg-[#131722] border border-[#2a2e39] focus:border-[#2962ff] focus:outline-none rounded-lg py-3 pl-12 pr-4 text-white placeholder:text-[#434651] transition-colors"
            />
          </div>
        </div>

        {/* Categories (Chips) */}
        <div className="px-5 py-4 border-b border-[#2a2e39] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeCategory === cat
                  ? 'bg-[#089981]/20 text-[#089981] border-[#089981]/50'
                  : 'bg-transparent text-[#d1d4dc] border-[#2a2e39] hover:border-[#787b86]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto">
          {filteredStocks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#787b86]">
              Không tìm thấy kết quả nào.
            </div>
          ) : (
            <div className="flex flex-col py-2">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    onSelect(stock);
                    onClose();
                  }}
                  className="flex items-center px-5 py-3 hover:bg-[#2a2e39]/50 cursor-pointer transition-colors group gap-3"
                >
                  {/* Avatar */}
                  <AssetAvatar stock={stock} size="md" showExchangeBadge />

                  {/* Symbol + Name */}
                  <div className="w-44 shrink-0 flex flex-col">
                    <span className="font-bold text-[#d1d4dc] group-hover:text-blue-400 transition-colors text-sm">{stock.symbol}</span>
                    <span className="text-[#787b86] text-xs truncate">{stock.name}</span>
                  </div>

                  {/* Market */}
                  <div className="flex-1 text-[#787b86] text-xs truncate">
                    {stock.market}
                  </div>

                  {/* Exchange badge */}
                  <div className="shrink-0">
                    <ExchangeBadge exchange={stock.exchange} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
