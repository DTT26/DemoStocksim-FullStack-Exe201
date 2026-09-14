import { useState, useEffect, useRef } from 'react';
import { init, dispose, registerOverlay } from 'klinecharts';
import type { Chart, KLineData, DataLoaderGetBarsParams, DataLoaderSubscribeBarParams } from 'klinecharts';
import { generateOHLCV, type Stock } from '../data';
import { fetchBinanceKlines, mapTimeframeToBinance, subscribeBinanceKline } from '../../../services/binanceApi';
import type { TradeOrder } from '../TradingTerminal';
import { INDICATOR_LIST } from './IndicatorModal';
import { useTheme } from '../../../contexts/ThemeContext';

// Đăng ký công cụ vẽ Hình chữ nhật (rect)
registerOverlay({
  name: 'rect',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length > 1) {
      return [
        {
          type: 'polygon',
          attrs: {
            coordinates: [
              coordinates[0],
              { x: coordinates[1].x, y: coordinates[0].y },
              coordinates[1],
              { x: coordinates[0].x, y: coordinates[1].y }
            ]
          },
          styles: { style: 'stroke_fill', color: 'rgba(33, 150, 243, 0.2)', borderColor: '#2196f3' }
        }
      ];
    }
    return [];
  }
});

// Đăng ký công cụ vẽ Mô hình XABCD
registerOverlay({
  name: 'xabcd',
  totalStep: 6,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates } });
    }
    if (coordinates.length >= 3) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[0], coordinates[1], coordinates[2]] }, styles: { style: 'fill', color: 'rgba(33, 150, 243, 0.2)' } });
    }
    if (coordinates.length >= 5) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[2], coordinates[3], coordinates[4]] }, styles: { style: 'fill', color: 'rgba(33, 150, 243, 0.2)' } });
    }
    // Thêm Text nhãn X, A, B, C, D
    const labels = ['X', 'A', 'B', 'C', 'D'];
    coordinates.forEach((coord, i) => {
      if (i < 5) {
        figures.push({
          type: 'text',
          attrs: { x: coord.x, y: coord.y, text: labels[i] },
          styles: { color: '#fff', backgroundColor: '#2196f3', paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2, borderRadius: 2 }
        });
      }
    });
    return figures;
  }
});

interface ChartAreaProps {
  activeTool: string;
  selectedStock: Stock;
  activeTimeframe: string;
  isReplaying: boolean;
  replayIndex: number;
  tradeOrders: TradeOrder[];
  activeIndicators: string[];
  activePosition?: { quantity: number; averagePrice: number; side: 'LONG'|'SHORT'; leverage: number; tp?: number; sl?: number };
  onPriceUpdate?: (price: number) => void;
}

// Cache data per stock+timeframe to avoid re-generating every render
const dataCache = new Map<string, KLineData[]>();

export const ChartArea = ({ activeTool, selectedStock, activeTimeframe, isReplaying, replayIndex, tradeOrders, activeIndicators, activePosition, onPriceUpdate }: ChartAreaProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const activeToolRef = useRef<string>('cursor');
  const activeTimeframeRef = useRef<string>(activeTimeframe);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  // Map: indicator name → sub-pane id (undefined = on main pane)
  const indicatorPaneRef = useRef<Map<string, string | undefined>>(new Map());

  // Apply theme dynamically to klinecharts
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setStyles(theme === 'dark' ? 'dark' : 'light');
      // Override grid and candle styles
      chartRef.current.setStyles({
        grid: {
          horizontal: { color: theme === 'dark' ? '#2a2e39' : '#e6e8ea', size: 1, style: 'dashed' },
          vertical: { color: theme === 'dark' ? '#2a2e39' : '#e6e8ea', size: 1, style: 'dashed' },
        },
        candle: {
          bar: {
            upColor: '#089981',
            downColor: '#f23645',
            upBorderColor: '#089981',
            downBorderColor: '#f23645',
            upWickColor: '#089981',
            downWickColor: '#f23645',
          }
        }
      });
    }
  }, [theme]);

  // Init chart ONCE
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = init(chartContainerRef.current, {
      formatter: {
        formatDate: (params: any) => {
          const d = new Date(params.timestamp);
          const hh = d.getHours().toString().padStart(2, '0');
          const mm = d.getMinutes().toString().padStart(2, '0');
          const dd = d.getDate().toString().padStart(2, '0');
          const mo = (d.getMonth() + 1).toString().padStart(2, '0');
          const yyyy = d.getFullYear();
          
          const isIntraday = ['1m', '5m', '15m', '30m'].includes(activeTimeframeRef.current);
          
          if (params.type === 'crosshair' || params.type === 'tooltip') {
             return isIntraday ? `${dd}/${mo}/${yyyy} ${hh}:${mm}` : `${dd}/${mo}/${yyyy}`;
          }
          
          // xAxis tick
          if (isIntraday) {
             return `${hh}:${mm}`;
          } else {
             return `${dd}/${mo}/${yyyy}`;
          }
        }
      }
    });
    if (!chart) return;
    
    // Apply initial theme
    chart.setStyles(theme === 'dark' ? 'dark' : 'light');
    
    // Then override grid and candle styles
    chart.setStyles({
      grid: {
        horizontal: { color: theme === 'dark' ? '#2a2e39' : '#e6e8ea', size: 1, style: 'dashed' },
        vertical: { color: theme === 'dark' ? '#2a2e39' : '#e6e8ea', size: 1, style: 'dashed' },
      },
      candle: {
        bar: {
          upColor: '#089981',
          downColor: '#f23645',
          upBorderColor: '#089981',
          downBorderColor: '#f23645',
          upWickColor: '#089981',
          downWickColor: '#f23645',
        }
      }
    });

    chartRef.current = chart;

    // Listen for overlay finished event to re-activate same tool
    chart.subscribeAction('onOverlayDrawEnd' as any, () => {
      const currentTool = activeToolRef.current;
      if (currentTool !== 'cursor' && currentTool !== 'clear') {
        // Small delay then re-create overlay to keep tool active
        setTimeout(() => {
          chart.createOverlay({ name: currentTool, lock: false });
        }, 50);
      }
    });

    const handleResize = () => chart?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartContainerRef.current) {
        dispose(chartContainerRef.current);
      }
      chartRef.current = null;
    };
  }, []);

  // Sync activeTool to ref so the closure can access it
  useEffect(() => {
    activeToolRef.current = activeTool;
    const chart = chartRef.current;
    if (!chart) return;

    if (activeTool === 'clear') {
      chart.removeOverlay();
    } else if (activeTool === 'cursor') {
      // Cancel any pending overlay
    } else {
      chart.createOverlay({ name: activeTool, lock: false });
    }
  }, [activeTool]);

  // Reload data when stock, timeframe, or replay state changes
  useEffect(() => {
    activeTimeframeRef.current = activeTimeframe;
    const chart = chartRef.current;
    if (!chart) return;

    let isMounted = true;
    let tickerInterval: ReturnType<typeof setInterval>;
    let wsUnsubscribe: (() => void) | null = null;
    
    // Map activeTimeframe to klinecharts period
    let timespan = 'day';
    let multiplier = 1;
    if (activeTimeframe.endsWith('m')) {
      timespan = 'minute';
      multiplier = parseInt(activeTimeframe);
    } else if (activeTimeframe.endsWith('h')) {
      timespan = 'hour';
      multiplier = parseInt(activeTimeframe);
    } else if (activeTimeframe === 'W') {
      timespan = 'week';
    } else if (activeTimeframe === 'M') {
      timespan = 'month';
    }

    const loadData = async () => {
      setIsLoading(true);
      const cacheKey = `${selectedStock.symbol}-${activeTimeframe}`;
      
      let allData: KLineData[] = [];

      // Phân loại data source
      if (selectedStock.market === 'Tiền điện tử (Crypto)') {
        // Lấy dữ liệu thật từ Binance
        const binanceInterval = mapTimeframeToBinance(activeTimeframe);
        allData = await fetchBinanceKlines({
          symbol: selectedStock.symbol,
          interval: binanceInterval,
          limit: 300,
          isFutures: selectedStock.isFutures
        });
      } else {
        // Dùng mock data (generateOHLCV) cho chứng khoán VN, Forex...
        if (!dataCache.has(cacheKey)) {
          dataCache.set(cacheKey, generateOHLCV(selectedStock.price, 300, activeTimeframe));
        }
        allData = dataCache.get(cacheKey)!;
      }

      if (!isMounted) return;

      // In replay mode: slice data up to replayIndex
      const visibleData = isReplaying
        ? allData.slice(0, Math.max(30, replayIndex))
        : allData;

      chart.setSymbol({ name: selectedStock.symbol });
      
      chart.setDataLoader({
        getBars: async (params: DataLoaderGetBarsParams) => {
          // Khi người dùng cuộn sang trái (kéo về quá khứ)
          if (params.type === 'backward' && selectedStock.market === 'Tiền điện tử (Crypto)') {
            if (!params.timestamp) return params.callback([], true);
            
            // Lấy nến cũ hơn dựa vào timestamp của nến đầu tiên hiện tại
            const oldestTime = params.timestamp;
            const binanceInterval = mapTimeframeToBinance(activeTimeframe);
            
            const olderData = await fetchBinanceKlines({
              symbol: selectedStock.symbol,
              interval: binanceInterval,
              limit: 500,
              isFutures: selectedStock.isFutures,
              endTime: oldestTime - 1, // Tránh lấy trùng nến đầu tiên
            });
            
            // Nối dữ liệu cũ vào mảng allData để live ticker có thể dùng nếu cần
            allData = [...olderData, ...allData];
            
            // Báo cho klinecharts đã lấy xong, false = vẫn còn data, true = hết data
            params.callback(olderData, olderData.length === 0);
            return;
          }

          // Gọi lần đầu
          params.callback(visibleData, false);
        },
        subscribeBar: (params: DataLoaderSubscribeBarParams) => {
          if (isReplaying) return;

          if (selectedStock.market === 'Tiền điện tử (Crypto)') {
            // Lấy dữ liệu thật realtime qua WebSocket
            const binanceInterval = mapTimeframeToBinance(activeTimeframe);
            wsUnsubscribe = subscribeBinanceKline(
              selectedStock.symbol,
              binanceInterval,
              !!selectedStock.isFutures,
              (newCandle) => {
                params.callback(newCandle);
                if (onPriceUpdate) onPriceUpdate(newCandle.close);
              }
            );
          } else {
            // Simulate live market ticking cho các thị trường khác
            tickerInterval = setInterval(() => {
              if (allData.length === 0) return;
              const lastCandle = allData[allData.length - 1];
              const newPrice = lastCandle.close + (Math.random() - 0.5) * lastCandle.close * 0.005;
              
              const newCandle = {
                ...lastCandle,
                close: parseFloat(newPrice.toFixed(2)),
                high: Math.max(lastCandle.high, parseFloat(newPrice.toFixed(2))),
                low: Math.min(lastCandle.low, parseFloat(newPrice.toFixed(2))),
                volume: (lastCandle.volume || 0) + Math.random() * 500,
              };
              
              allData[allData.length - 1] = newCandle;
              params.callback(newCandle);
              if (onPriceUpdate) onPriceUpdate(newCandle.close);
            }, 1000);
          }
        },
        unsubscribeBar: () => {
          if (tickerInterval) clearInterval(tickerInterval);
          if (wsUnsubscribe) wsUnsubscribe();
        }
      });

      setIsLoading(false);
    };

    loadData();

    // Pass the correct period so the chart tooltip displays it correctly
    chart.setPeriod({ timespan, text: activeTimeframe } as any);

    return () => {
      isMounted = false;
      if (tickerInterval) clearInterval(tickerInterval);
      if (wsUnsubscribe) wsUnsubscribe();
    };
  }, [selectedStock.symbol, selectedStock.market, selectedStock.isFutures, activeTimeframe, isReplaying, replayIndex]);

  // Sync active indicators with chart
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const paneMap = indicatorPaneRef.current;
    const currentlyOn = new Set(paneMap.keys());
    const wantOn = new Set(activeIndicators);

    // Remove indicators that are no longer active
    currentlyOn.forEach(name => {
      if (!wantOn.has(name)) {
        const paneId = paneMap.get(name);
        try {
          // API v10: removeIndicator(filter?: { id?, paneId?, name? })
          chart.removeIndicator(paneId ? { paneId, name } : { name });
        } catch (_) {}
        paneMap.delete(name);
      }
    });

    // Add indicators that are newly active
    wantOn.forEach(name => {
      if (!currentlyOn.has(name)) {
        const def = INDICATOR_LIST.find(i => i.name === name);
        if (!def) return;
        try {
          if (def.pane === 'main') {
            // Overlay on the main candle chart using IndicatorCreate shape
            chart.createIndicator({ name, paneId: 'candle_pane' } as any, true);
            paneMap.set(name, undefined);
          } else {
            // Create a new sub pane — returns the new pane id
            const paneId = chart.createIndicator(name, false);
            paneMap.set(name, paneId ?? undefined);
          }
        } catch (err) {
          console.warn(`Failed to create indicator ${name}:`, err);
        }
      }
    });
  }, [activeIndicators]);

  // Draw price lines for active position
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const allData = chart.getDataList();
    if (allData.length === 0) return;
    const lastDataIndex = allData.length - 1;

    // Clear previous order overlays to prevent duplicates if this runs multiple times
    chart.removeOverlay({ name: 'horizontalStraightLine' });

    if (activePosition && activePosition.quantity > 0) {
      const isBuy = activePosition.side === 'LONG';
      const color = isBuy ? '#089981' : '#f23645';

      // 1. Draw main entry price line
      chart.createOverlay({
        name: 'horizontalStraightLine',
        lock: true,
        points: [{ timestamp: allData[lastDataIndex].timestamp, value: activePosition.averagePrice }],
        styles: {
          line: { color: '#ffffff', size: 2, style: 'dashed', dashedValue: [5, 5] },
          text: {
            color: '#ffffff',
            backgroundColor: color,
            paddingLeft: 6,
            paddingRight: 6,
            paddingTop: 4,
            paddingBottom: 4,
            borderRadius: 4,
            size: 12,
            family: 'Inter',
            weight: 'bold',
          },
        },
        extendData: `${isBuy ? '▲ LONG' : '▼ SHORT'} ${activePosition.quantity.toFixed(2)} @ ${activePosition.averagePrice.toLocaleString('vi-VN')}₫`,
      });

      // 2. Draw Take Profit line (TP)
      if (activePosition.tp) {
        chart.createOverlay({
          name: 'horizontalStraightLine',
          lock: true,
          points: [{ timestamp: allData[lastDataIndex].timestamp, value: activePosition.tp }],
          styles: {
            line: { color: '#089981', size: 1, style: 'solid' },
            text: {
              color: '#ffffff',
              backgroundColor: '#089981',
              paddingLeft: 6,
              paddingRight: 6,
              paddingTop: 3,
              paddingBottom: 3,
              borderRadius: 4,
              size: 10,
            },
          },
          extendData: `TP @ ${activePosition.tp.toLocaleString('vi-VN')}₫`,
        });
      }

      // 3. Draw Stop Loss line (SL)
      if (activePosition.sl) {
        chart.createOverlay({
          name: 'horizontalStraightLine',
          lock: true,
          points: [{ timestamp: allData[lastDataIndex].timestamp, value: activePosition.sl }],
          styles: {
            line: { color: '#f23645', size: 1, style: 'solid' },
            text: {
              color: '#ffffff',
              backgroundColor: '#f23645',
              paddingLeft: 6,
              paddingRight: 6,
              paddingTop: 3,
              paddingBottom: 3,
              borderRadius: 4,
              size: 10,
            },
          },
          extendData: `SL @ ${activePosition.sl.toLocaleString('vi-VN')}₫`,
        });
      }
    }
  }, [activePosition, activeTimeframe, selectedStock.symbol, isLoading]);

  return (
    <div className="flex-1 min-w-0 relative bg-white dark:bg-[#131722]">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 dark:bg-[#131722]/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-[#787b86]">
            <div className="w-8 h-8 border-4 border-[#e6e8ea] dark:border-[#2a2e39] border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Đang tải dữ liệu...</span>
          </div>
        </div>
      )}

      {/* Bar Replay banner */}
      {isReplaying && (
        <div className="absolute top-2 right-4 z-10 flex items-center gap-2 bg-orange-900/70 border border-orange-600 text-orange-200 text-xs px-3 py-1.5 rounded-lg backdrop-blur pointer-events-none">
          <span className="animate-pulse w-2 h-2 rounded-full bg-orange-400 inline-block" />
          Bar Replay — Cây nến thứ {replayIndex} / {dataCache.get(`${selectedStock.symbol}-${activeTimeframe}`)?.length || 300}
        </div>
      )}

      {/* Active tool hint */}
      {activeTool !== 'cursor' && activeTool !== 'clear' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-xs text-blue-200 bg-blue-900/60 border border-blue-700/60 px-4 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
          ✏️ <span className="font-semibold">{activeTool}</span> đang hoạt động
        </div>
      )}

      {/* Chart canvas */}
      <div
        ref={chartContainerRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
    </div>
  );
};
