import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { STOCKS, type Stock, type MarketCategory, formatVolume } from '../data';
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
  const [activeExchange, setActiveExchange] = useState<string>('Tất cả');
  const [activeType, setActiveType] = useState<'Tất cả' | 'Spot' | 'Futures'>('Tất cả');
  const [volatilityFilter, setVolatilityFilter] = useState<'all' | 'gainers' | 'losers' | 'volatile'>('all');
  const [volumeFilter, setVolumeFilter] = useState<'all' | 'vol_desc' | 'vol_over_1b'>('all');

  // Reset sub-filters when category changes
  const handleCategoryChange = (cat: 'Tất cả' | MarketCategory) => {
    setActiveCategory(cat);
    setActiveExchange('Tất cả');
    setActiveType('Tất cả');
  };

  const availableExchanges = useMemo(() => {
    const exchanges = new Set<string>();
    STOCKS.forEach(stock => {
      if (activeCategory === 'Tất cả' || stock.market === activeCategory) {
        exchanges.add(stock.exchange);
      }
    });
    return ['Tất cả', ...Array.from(exchanges)];
  }, [activeCategory]);

  const filteredStocks = useMemo(() => {
    let list = STOCKS.filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'Tất cả' || stock.market === activeCategory;
      const matchesExchange = activeExchange === 'Tất cả' || stock.exchange === activeExchange;
      
      let matchesType = true;
      if (activeType === 'Spot') matchesType = !stock.isFutures;
      if (activeType === 'Futures') matchesType = !!stock.isFutures;

      let matchesVol = true;
      if (volumeFilter === 'vol_over_1b') {
        matchesVol = (stock.volume24h || 0) >= 1_000_000_000;
      }
      
      return matchesSearch && matchesCategory && matchesExchange && matchesType && matchesVol;
    });

    // Sắp xếp theo Biến động hoặc Khối lượng
    if (volatilityFilter === 'gainers') {
      list = [...list].sort((a, b) => b.percent - a.percent);
    } else if (volatilityFilter === 'losers') {
      list = [...list].sort((a, b) => a.percent - b.percent);
    } else if (volatilityFilter === 'volatile') {
      list = [...list].sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent));
    } else if (volumeFilter === 'vol_desc') {
      list = [...list].sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
    }

    return list;
  }, [searchQuery, activeCategory, activeExchange, activeType, volatilityFilter, volumeFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1e222d] w-full max-w-4xl rounded-lg shadow-2xl border border-[#e6e8ea] dark:border-[#2a2e39] flex flex-col h-[70vh] max-h-[800px] overflow-hidden transition-colors">
        
        {/* Header: Title and Close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e6e8ea] dark:border-[#2a2e39]">
          <h2 className="text-lg font-bold text-[#1e2329] dark:text-white">Tìm kiếm mã giao dịch</h2>
          <button onClick={onClose} className="text-[#787b86] hover:text-[#1e2329] dark:hover:text-white transition-colors">
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
              placeholder="TÌM KIẾM (VÍ DỤ: BTCUSDT, EURUSD, XAUUSD, AAPL)..."
              className="w-full bg-[#f5f5f5] dark:bg-[#131722] border border-[#e6e8ea] dark:border-[#2a2e39] focus:border-[#2962ff] focus:outline-none rounded-lg py-3 pl-12 pr-4 text-[#1e2329] dark:text-white placeholder:text-[#a0a3af] dark:placeholder:text-[#434651] transition-colors"
            />
          </div>
        </div>

        {/* Categories (Chips) */}
        <div className="px-5 py-4 border-b border-[#e6e8ea] dark:border-[#2a2e39] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeCategory === cat
                  ? 'bg-blue-50 dark:bg-[#089981]/20 text-blue-600 dark:text-[#089981] border-blue-500 dark:border-[#089981]/50'
                  : 'bg-transparent text-[#1e2329] dark:text-[#d1d4dc] border-[#e6e8ea] dark:border-[#2a2e39] hover:border-blue-500 dark:hover:border-[#787b86]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sub Filters (Exchange, Type, Volatility & Volume) */}
        <div className="px-5 py-3 border-b border-[#e6e8ea] dark:border-[#2a2e39] flex flex-wrap items-center gap-4 bg-[#f8f9fa] dark:bg-[#131722]/50 text-xs">
          {/* Exchange Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#787b86]">Sàn GD:</span>
            <select 
              value={activeExchange}
              onChange={(e) => setActiveExchange(e.target.value)}
              className="bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc] text-xs rounded px-2.5 py-1 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer font-medium"
            >
              {availableExchanges.map(ex => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>
          
          {/* Spot / Futures */}
          {(activeCategory === 'Tất cả' || activeCategory === 'Tiền điện tử (Crypto)') && (
            <div className="flex items-center gap-2 border-l border-[#e6e8ea] dark:border-[#2a2e39] pl-3">
              <span className="font-semibold text-[#787b86]">Loại:</span>
              <div className="flex bg-[#e6e8ea] dark:bg-[#2a2e39] rounded p-0.5">
                {['Tất cả', 'Spot', 'Futures'].map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type as any)}
                    className={`text-[11px] px-2 py-0.5 rounded transition-colors font-medium ${
                      activeType === type 
                        ? 'bg-white dark:bg-[#1e222d] text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Volatility Filter */}
          <div className="flex items-center gap-2 border-l border-[#e6e8ea] dark:border-[#2a2e39] pl-3">
            <span className="font-semibold text-[#787b86]">Biến động:</span>
            <div className="flex bg-[#e6e8ea] dark:bg-[#2a2e39] rounded p-0.5">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'gainers', label: '🚀 Tăng mạnh' },
                { id: 'losers', label: '📉 Giảm mạnh' },
                { id: 'volatile', label: '⚡ Biến động lớn' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setVolatilityFilter(item.id as any)}
                  className={`text-[11px] px-2 py-0.5 rounded transition-colors font-medium ${
                    volatilityFilter === item.id 
                      ? 'bg-white dark:bg-[#1e222d] text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Volume Filter */}
          <div className="flex items-center gap-2 border-l border-[#e6e8ea] dark:border-[#2a2e39] pl-3">
            <span className="font-semibold text-[#787b86]">Khối lượng:</span>
            <div className="flex bg-[#e6e8ea] dark:bg-[#2a2e39] rounded p-0.5">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'vol_desc', label: '🔥 Volume cao nhất' },
                { id: 'vol_over_1b', label: '> 1B' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setVolumeFilter(item.id as any)}
                  className={`text-[11px] px-2 py-0.5 rounded transition-colors font-medium ${
                    volumeFilter === item.id 
                      ? 'bg-white dark:bg-[#1e222d] text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto">
          {filteredStocks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#787b86]">
              Không tìm thấy kết quả nào phù hợp.
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
                  className="flex items-center px-5 py-3 hover:bg-[#f5f5f5] dark:hover:bg-[#2a2e39]/50 cursor-pointer transition-colors group gap-3 border-b border-[#e6e8ea] dark:border-transparent last:border-b-0"
                >
                  {/* Avatar */}
                  <AssetAvatar stock={stock} size="md" showExchangeBadge />

                  {/* Symbol + Name */}
                  <div className="w-44 shrink-0 flex flex-col">
                    <span className="font-bold text-[#1e2329] dark:text-[#d1d4dc] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">{stock.symbol}</span>
                    <span className="text-[#787b86] text-xs truncate">{stock.name}</span>
                  </div>

                  {/* Market & Leverage */}
                  <div className="w-32 flex flex-col justify-center">
                    <span className="text-[#787b86] text-xs truncate">{stock.market}</span>
                    <span className="text-[10px] font-bold text-[#fcd535] bg-[#fcd535]/10 px-1.5 py-0.5 rounded w-max mt-0.5">
                      Max {stock.leverageInfo.max}x
                    </span>
                  </div>

                  {/* Volume 24h */}
                  <div className="w-28 flex flex-col items-end justify-center pr-2">
                    <span className="text-[10px] text-[#787b86]">Vol 24h</span>
                    <span className="font-mono text-xs font-semibold text-[#1e2329] dark:text-[#d1d4dc]">
                      {formatVolume(stock.volume24h)}
                    </span>
                  </div>

                  {/* Price & CHG% */}
                  <div className="flex-1 flex flex-col items-end justify-center pr-4">
                    <span className="font-mono font-bold text-[#1e2329] dark:text-[#d1d4dc] text-sm">
                      {stock.price.toLocaleString('vi-VN', { maximumFractionDigits: stock.price < 10 ? 4 : 2 })}
                    </span>
                    <span className={`font-mono text-xs font-semibold flex items-center gap-0.5 ${stock.type === 'up' ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                      {stock.type === 'up' ? '↗' : '↘'} {stock.percent > 0 ? '+' : ''}{stock.percent.toFixed(2)}%
                    </span>
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
