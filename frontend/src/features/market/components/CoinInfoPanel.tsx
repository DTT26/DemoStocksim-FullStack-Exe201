import { useMemo, useState, useEffect, useRef } from 'react';
import { type Stock } from '../data';
import { getFundamentalData, calculateRealtimeMetrics, formatLiveUSD } from '../fundamentalData';
import { useMarketStore } from '../../../stores/useMarketStore';
import { useI18n } from '../../../contexts/I18nContext';
import { AssetAvatar } from './AssetAvatar';
import { 
  ArrowUpRight, 
  Globe, 
  FileText, 
  ExternalLink, 
  Building2, 
  Users, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Layers,
  BarChart2,
  Info,
  Radio
} from 'lucide-react';

interface CoinInfoPanelProps {
  stock: Stock;
}

export const CoinInfoPanel = ({ stock }: CoinInfoPanelProps) => {
  const { t, lang } = useI18n();

  // Lấy dữ liệu ticker thời gian thực từ WebSocket / polling của useMarketStore
  const ticker = useMarketStore(state => state.tickers[stock.symbol]);
  const livePrice = ticker?.price && ticker.price > 0 ? ticker.price : stock.price;

  // Lấy thông tin cơ bản định danh theo ngôn ngữ (vi, en)
  const data = getFundamentalData(stock, lang);

  // Hiệu ứng flash khi giá thay đổi thời gian thực
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef<number>(livePrice);

  useEffect(() => {
    if (prevPriceRef.current && livePrice !== prevPriceRef.current) {
      setPriceFlash(livePrice > prevPriceRef.current ? 'up' : 'down');
      const timer = setTimeout(() => setPriceFlash(null), 800);
      prevPriceRef.current = livePrice;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = livePrice;
  }, [livePrice]);

  // Tính toán chỉ số tài chính THỜI GIAN THỰC theo giá live
  const realtime = useMemo(() => calculateRealtimeMetrics(data, livePrice), [data, livePrice]);

  const isStock = data.category === 'stock' || stock.market === 'Cổ phiếu';
  const isCommodity = data.category === 'commodity' || stock.market === 'Hàng hóa';
  const isForex = data.category === 'forex' || stock.market === 'Ngoại hối (Forex)';
  const isIndex = data.category === 'index' || stock.market === 'Chỉ số';
  const isCrypto = !isStock && !isCommodity && !isForex && !isIndex;

  // Tính tỷ lệ vị trí giá hiện tại trong biên độ 24h (24h Range Bar)
  const high24h = ticker?.high24h || livePrice * 1.02;
  const low24h = ticker?.low24h || livePrice * 0.98;
  const rangeSpan = Math.max(0.000001, high24h - low24h);
  const rangePct = Math.min(100, Math.max(0, ((livePrice - low24h) / rangeSpan) * 100));

  const changePct = ticker?.percent !== undefined ? ticker.percent : stock.percent;
  const isPositive = changePct >= 0;

  return (
    <div className="flex-1 bg-white dark:bg-[#131722] overflow-y-auto px-4 py-5 md:px-8 text-sm text-[#1e2329] dark:text-[#d1d4dc] transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ─── Header Section ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e6e8ea] dark:border-[#2a2e39]">
          <div className="flex items-center gap-3.5">
            <AssetAvatar stock={stock} size="lg" showExchangeBadge={false} />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-[#1e2329] dark:text-white tracking-tight">
                  {data.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#f0f3f6] dark:bg-[#2a2e39] text-[#787b86] dark:text-[#9ca3af]">
                  {stock.symbol}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {stock.market}
                </span>
                {stock.exchange && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    {stock.exchange}
                  </span>
                )}
                {data.sector && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    {data.sector}
                  </span>
                )}

                {/* Badge Real-time Pulse */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {t('info.realtime', 'Thời gian thực')}
                </div>
              </div>
              
              <p className="text-xs text-[#787b86] mt-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                {isStock && t('info.disclaimerStock', '*Dữ liệu tài chính & vốn hóa tự động cập nhật theo giá khớp lệnh trực tiếp từ sàn.')}
                {isCrypto && t('info.disclaimerCrypto', '*Vốn hóa thị trường và định giá FDV được tính theo thời gian thực dựa trên giá Binance/BingX.')}
                {(isCommodity || isForex || isIndex) && t('info.disclaimerMacro', '*Dữ liệu tỷ giá & biên độ biến động được đồng bộ liên tục 24/7.')}
              </p>
            </div>
          </div>

          {/* Quick Price & 24h Change Badge */}
          <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#787b86]">{t('info.livePrice', 'Giá trực tiếp:')}</span>
              <span className={`text-xl font-bold font-mono transition-colors duration-300 ${
                priceFlash === 'up' 
                  ? 'bg-emerald-500/20 text-emerald-500 px-1 rounded' 
                  : priceFlash === 'down' 
                  ? 'bg-rose-500/20 text-rose-500 px-1 rounded' 
                  : isPositive 
                  ? 'text-emerald-500' 
                  : 'text-rose-500'
              }`}>
                ${livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className={`px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                {isPositive ? '+' : ''}{changePct.toFixed(2)}%
              </span>
              <span className="text-[#787b86] font-normal">(24h)</span>
            </div>
          </div>
        </div>

        {/* ─── 24h Range Bar Visual ─── */}
        <div className="p-3 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d] space-y-1.5">
          <div className="flex justify-between items-center text-xs text-[#787b86]">
            <span>{t('info.low24h', 'Thấp nhất 24h:')} <strong className="text-[#1e2329] dark:text-white font-mono">${low24h.toLocaleString()}</strong></span>
            <span className="font-medium text-blue-600 dark:text-blue-400">{t('info.range24h', 'Biên độ dao động trong ngày')}</span>
            <span>{t('info.high24h', 'Cao nhất 24h:')} <strong className="text-[#1e2329] dark:text-white font-mono">${high24h.toLocaleString()}</strong></span>
          </div>
          <div className="relative w-full h-2 bg-[#e2e8f0] dark:bg-[#2a2e39] rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-rose-500 transition-all duration-500 rounded-full"
              style={{ width: `${rangePct}%` }}
            />
          </div>
        </div>

        {/* ─── Highlights Cards (Live Recalculated) ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {isStock && (
            <>
              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d] transition-all">
                <div className="flex items-center justify-between text-xs text-[#787b86] mb-1">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-blue-500" /> {t('info.marketCap', 'Vốn Hóa Thị Trường')}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-medium">{t('info.live', 'Live')}</span>
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {realtime.marketCapLive}
                </div>
                <div className="text-[11px] text-[#787b86] mt-0.5">
                  ≈ {realtime.marketCapCompact} USD
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d]">
                <div className="flex items-center justify-between text-xs text-[#787b86] mb-1">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {t('info.peRatio', 'Hệ Số P/E (TTM)')}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-medium">{t('info.live', 'Live')}</span>
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {realtime.peRatioLive || '--'}
                </div>
                <div className="text-[11px] text-[#787b86] mt-0.5">
                  {t('info.currentPriceBasis', 'Theo giá hiện tại')}
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d]">
                <div className="flex items-center gap-1.5 text-xs text-[#787b86] mb-1">
                  <BarChart2 className="w-3.5 h-3.5 text-amber-500" /> {t('info.eps', 'Lãi Trên Cổ Phần (EPS)')}
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {data.eps || '--'}
                </div>
                <div className="text-[11px] text-[#787b86] mt-0.5">
                  {t('info.last4Quarters', '4 quý gần nhất')}
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d]">
                <div className="flex items-center gap-1.5 text-xs text-[#787b86] mb-1">
                  <Layers className="w-3.5 h-3.5 text-purple-500" /> {t('info.dividendYield', 'Tỷ Suất Cổ Tức')}
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {realtime.dividendYieldLive || data.dividendYield || '0.00%'}
                </div>
                <div className="text-[11px] text-[#787b86] mt-0.5">
                  {t('info.annualPayment', 'Chi trả hàng năm')}
                </div>
              </div>
            </>
          )}

          {isCrypto && (
            <>
              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d]">
                <div className="flex items-center gap-1.5 text-xs text-[#787b86] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> {t('info.rank', 'Thứ Hạng Vốn Hóa')}
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {data.rank || '--'}
                </div>
                <div className="text-[11px] text-[#787b86] mt-0.5">
                  {t('info.globalShare', 'Thị phần:')} {data.marketDominance || t('info.global', 'Toàn cầu')}
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d] transition-all">
                <div className="flex items-center justify-between text-xs text-[#787b86] mb-1">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {t('info.marketCap', 'Vốn Hóa Thị Trường')}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-medium">{t('info.live', 'Live')}</span>
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {realtime.marketCapLive}
                </div>
                <div className="text-[11px] text-[#787b86] mt-0.5">
                  ≈ {realtime.marketCapCompact} USD
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d]">
                <div className="flex items-center gap-1.5 text-xs text-[#787b86] mb-1">
                  <Layers className="w-3.5 h-3.5 text-amber-500" /> {t('info.circulatingSupply', 'Nguồn Cung Lưu Thông')}
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {realtime.circulatingSupply}
                </div>
                <div className="text-[11px] text-[#787b86] mt-0.5">
                  {t('info.maxSupply', 'Nguồn Cung Tối Đa')}: {realtime.maxSupply}
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d]">
                <div className="flex items-center gap-1.5 text-xs text-[#787b86] mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" /> {t('info.ath', 'Đỉnh Cao Nhất (ATH)')}
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {data.allTimeHigh || '--'}
                </div>
                <div className="text-[11px] text-rose-500 font-medium mt-0.5">
                  {realtime.distanceToATH ? `${realtime.distanceToATH} ${t('info.fromATH', 'so với đỉnh')}` : t('info.reference', 'Tham chiếu')}
                </div>
              </div>
            </>
          )}

          {(isCommodity || isForex || isIndex) && (
            <>
              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d]">
                <div className="flex items-center gap-1.5 text-xs text-[#787b86] mb-1">
                  <Layers className="w-3.5 h-3.5 text-blue-500" /> {t('info.tradingUnit', 'Đơn Vị Giao Dịch')}
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {data.tradingUnit || '1 Lot'}
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d]">
                <div className="flex items-center gap-1.5 text-xs text-[#787b86] mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {t('info.maxLeverage', 'Đòn Bẩy Tối Đa')}
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {stock.leverageInfo?.max ? `${stock.leverageInfo.max}x` : t('info.none', 'Không')}
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d]">
                <div className="flex items-center gap-1.5 text-xs text-[#787b86] mb-1">
                  <BarChart2 className="w-3.5 h-3.5 text-amber-500" /> {t('info.high52w', 'Đỉnh 52 Tuần')}
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {data.fiftyTwoWeekHigh || '--'}
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d]">
                <div className="flex items-center gap-1.5 text-xs text-[#787b86] mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-purple-500" /> {t('info.low52w', 'Đáy 52 Tuần')}
                </div>
                <div className="text-base font-bold text-[#1e2329] dark:text-white truncate">
                  {data.fiftyTwoWeekLow || '--'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── Main Two Columns ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Data Rows */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#1e2329] dark:text-white border-l-3 border-blue-500 pl-2.5">
                {isStock 
                  ? t('info.financialMetrics', 'Chỉ Số Tài Chính & Niêm Yết') 
                  : isCrypto 
                  ? t('info.networkMetrics', 'Thông Số Mạng Lưới & Cung Cầu') 
                  : t('info.contractSpecs', 'Thông Số Hợp Đồng & Định Giá')}
              </h2>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> Live Ticker
              </span>
            </div>

            <div className="divide-y divide-[#f0f3f6] dark:divide-[#2a2e39]/60 text-[13px]">
              
              {/* === Stock Details === */}
              {isStock && (
                <>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.marketCap', 'Vốn Hóa Thị Trường')} (Live)</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white font-mono">{realtime.marketCapLive}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.peRatio', 'Hệ Số P/E (TTM)')} (Live)</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white font-mono">{realtime.peRatioLive || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.primaryExchange', 'Sàn giao dịch chính')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white">{data.exchange || stock.exchange || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.industry', 'Ngành nghề chi tiết')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white">{data.industry || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.pbRatio', 'Hệ số P/B')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white">{data.pbRatio || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.revenue', 'Doanh thu (TTM)')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white">{data.revenue || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.netIncome', 'Lợi nhuận ròng (TTM)')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white">{data.netIncome || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.sharesOutstanding', 'Số lượng cổ phiếu lưu hành')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white">{data.sharesOutstanding || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.high52w', 'Đỉnh 52 Tuần')}</span>
                    <div className="text-right">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{data.fiftyTwoWeekHigh || '--'}</span>
                      {realtime.distanceTo52wHigh && (
                        <span className="text-xs text-[#787b86] ml-2">({realtime.distanceTo52wHigh})</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.low52w', 'Đáy 52 Tuần')}</span>
                    <div className="text-right">
                      <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">{data.fiftyTwoWeekLow || '--'}</span>
                      {realtime.distanceTo52wLow && (
                        <span className="text-xs text-[#787b86] ml-2">({realtime.distanceTo52wLow})</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* === Crypto Details === */}
              {isCrypto && (
                <>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.marketCap', 'Vốn Hóa Thị Trường')} (Live)</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white font-mono">{realtime.marketCapLive}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.fdv', 'Vốn Hóa Pha Loãng Hoàn Toàn (FDV)')} (Live)</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white font-mono">{realtime.fdvLive || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.volume24h', 'Khối lượng giao dịch 24h')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white font-mono">
                      {ticker?.quoteVolume24h ? formatLiveUSD(ticker.quoteVolume24h, true) : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.dominance', 'Thống Trị Thị Trường')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white">{data.marketDominance || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.maxSupply', 'Nguồn Cung Tối Đa')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white">{realtime.maxSupply}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.totalSupply', 'Tổng Nguồn Cung')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white">{data.totalSupply || realtime.circulatingSupply}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.issueDate', 'Ngày phát hành / Khởi chạy')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white">{data.issueDate || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.issuePrice', 'Giá phát hành (ICO / Listing)')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white">{data.issuePrice || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.ath', 'Đỉnh Cao Nhất (ATH)')}</span>
                    <div className="text-right">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{data.allTimeHigh || '--'}</span>
                      {realtime.distanceToATH && (
                        <span className="text-xs text-rose-500 ml-2">({realtime.distanceToATH} {t('info.fromATH', 'so với đỉnh')})</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.atl', 'Đáy Thấp Nhất (ATL)')}</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">{data.allTimeLow || '--'}</span>
                  </div>
                </>
              )}

              {/* === Commodity / Forex / Index Details === */}
              {(isCommodity || isForex || isIndex) && (
                <>
                  {data.pricingBenchmark && (
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-[#787b86]">{t('info.pricingBenchmark', 'Sàn tham chiếu / Chuẩn định giá')}</span>
                      <span className="font-semibold text-[#1e2329] dark:text-white">{data.pricingBenchmark}</span>
                    </div>
                  )}
                  {data.baseCurrency && (
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-[#787b86]">{t('info.baseCurrency', 'Đồng tiền / Tài sản cơ sở')}</span>
                      <span className="font-semibold text-[#1e2329] dark:text-white">{data.baseCurrency}</span>
                    </div>
                  )}
                  {data.quoteCurrency && (
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-[#787b86]">{t('info.quoteCurrency', 'Đồng tiền định giá')}</span>
                      <span className="font-semibold text-[#1e2329] dark:text-white">{data.quoteCurrency}</span>
                    </div>
                  )}
                  {data.componentsCount && (
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-[#787b86]">{t('info.indexComponents', 'Cấu phần chỉ số')}</span>
                      <span className="font-semibold text-[#1e2329] dark:text-white">{data.componentsCount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.volume24h', 'Khối lượng giao dịch 24h')}</span>
                    <span className="font-semibold text-[#1e2329] dark:text-white font-mono">
                      {ticker?.quoteVolume24h ? formatLiveUSD(ticker.quoteVolume24h, true) : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.high52w', 'Đỉnh 52 Tuần')}</span>
                    <div className="text-right">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{data.fiftyTwoWeekHigh || '--'}</span>
                      {realtime.distanceTo52wHigh && (
                        <span className="text-xs text-[#787b86] ml-2">({realtime.distanceTo52wHigh})</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#787b86]">{t('info.low52w', 'Đáy 52 Tuần')}</span>
                    <div className="text-right">
                      <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">{data.fiftyTwoWeekLow || '--'}</span>
                      {realtime.distanceTo52wLow && (
                        <span className="text-xs text-[#787b86] ml-2">({realtime.distanceTo52wLow})</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Info for Companies */}
            {isStock && (
              <div className="pt-3 border-t border-[#f0f3f6] dark:border-[#2a2e39]/60">
                <h3 className="text-xs font-semibold text-[#787b86] uppercase tracking-wider mb-2.5">
                  {t('info.companyProfile', 'Hồ sơ doanh nghiệp')}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {data.ceo && (
                    <div className="p-2.5 rounded bg-[#f8f9fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39]">
                      <span className="text-[#787b86] flex items-center gap-1 mb-1">
                        <Users className="w-3 h-3 text-blue-500" /> {t('info.ceo', 'Tổng Giám Đốc (CEO)')}
                      </span>
                      <span className="font-semibold text-[#1e2329] dark:text-white">{data.ceo}</span>
                    </div>
                  )}
                  {data.headquarters && (
                    <div className="p-2.5 rounded bg-[#f8f9fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39]">
                      <span className="text-[#787b86] flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 text-rose-500" /> {t('info.headquarters', 'Trụ sở chính')}
                      </span>
                      <span className="font-semibold text-[#1e2329] dark:text-white truncate block">{data.headquarters}</span>
                    </div>
                  )}
                  {data.founded && (
                    <div className="p-2.5 rounded bg-[#f8f9fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39]">
                      <span className="text-[#787b86] flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3 text-emerald-500" /> {t('info.founded', 'Năm thành lập')}
                      </span>
                      <span className="font-semibold text-[#1e2329] dark:text-white">{data.founded}</span>
                    </div>
                  )}
                  {data.employees && (
                    <div className="p-2.5 rounded bg-[#f8f9fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39]">
                      <span className="text-[#787b86] flex items-center gap-1 mb-1">
                        <Building2 className="w-3 h-3 text-amber-500" /> {t('info.employees', 'Quy mô nhân sự')}
                      </span>
                      <span className="font-semibold text-[#1e2329] dark:text-white">{data.employees}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Introduction & Links */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1e2329] dark:text-white border-l-3 border-emerald-500 pl-2.5 mb-3">
                {t('info.overview', 'Tổng Quan & Giới Thiệu')}
              </h2>
              <div className="p-4 rounded-lg bg-[#f8f9fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39]">
                <p className="text-[#474d57] dark:text-[#b2b5be] leading-relaxed text-[13px] text-justify whitespace-pre-line">
                  {data.introduction}
                </p>
              </div>
            </div>

            {/* Useful Links */}
            <div>
              <h3 className="text-xs font-semibold text-[#787b86] uppercase tracking-wider mb-2.5">
                {t('info.officialLinks', 'Liên kết & Nguồn dữ liệu chính thức')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.website && (
                  <a 
                    href={data.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#f0f3f6] dark:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc] rounded-md hover:bg-[#e2e8f0] dark:hover:bg-[#363a45] transition-colors text-xs font-medium border border-transparent hover:border-blue-500"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    {t('info.officialWebsite', 'Trang web chính thức')}
                    <ArrowUpRight className="w-3 h-3 text-[#787b86]" />
                  </a>
                )}

                {data.investorRelations && (
                  <a 
                    href={data.investorRelations} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#f0f3f6] dark:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc] rounded-md hover:bg-[#e2e8f0] dark:hover:bg-[#363a45] transition-colors text-xs font-medium border border-transparent hover:border-emerald-500"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    {t('info.investorRelations', 'Quan hệ cổ đông (IR)')}
                    <ArrowUpRight className="w-3 h-3 text-[#787b86]" />
                  </a>
                )}

                {data.whitepaper && (
                  <a 
                    href={data.whitepaper} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#f0f3f6] dark:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc] rounded-md hover:bg-[#e2e8f0] dark:hover:bg-[#363a45] transition-colors text-xs font-medium border border-transparent hover:border-purple-500"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-500" />
                    {t('info.whitepaper', 'Sách Trắng (Whitepaper)')}
                    <ArrowUpRight className="w-3 h-3 text-[#787b86]" />
                  </a>
                )}

                {data.explorer && (
                  <a 
                    href={data.explorer} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#f0f3f6] dark:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc] rounded-md hover:bg-[#e2e8f0] dark:hover:bg-[#363a45] transition-colors text-xs font-medium border border-transparent hover:border-amber-500"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                    {t('info.explorer', 'Explorer / Tra cứu dữ liệu')}
                    <ArrowUpRight className="w-3 h-3 text-[#787b86]" />
                  </a>
                )}
              </div>
            </div>

            {/* Trading Guidance Tip */}
            <div className="p-3 rounded bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 text-xs text-[#474d57] dark:text-[#9ca3af]">
              💡 <span className="font-semibold text-blue-600 dark:text-blue-400">{t('info.tradingTip', 'Mẹo giao dịch:')}</span> {t('info.tradingTipDesc', 'Bạn có thể chuyển sang tab "Biểu đồ" để theo dõi chuyển động nến thời gian thực và đặt lệnh Long/Short trực tiếp tại thanh đặt lệnh bên phải.')}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
