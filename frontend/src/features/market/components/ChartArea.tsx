import { useEffect, useRef } from 'react';
import { init, dispose } from 'klinecharts';
import type { Chart, KLineData, DataLoaderGetBarsParams, DataLoaderSubscribeBarParams } from 'klinecharts';
import { generateOHLCV, type Stock } from '../data';
import type { TradeOrder } from '../TradingTerminal';

interface ChartAreaProps {
  activeTool: string;
  selectedStock: Stock;
  activeTimeframe: string;
  isReplaying: boolean;
  replayIndex: number;
  tradeOrders: TradeOrder[];
}

// Cache data per stock to avoid re-generating every render
const dataCache = new Map<string, KLineData[]>();

const getStockData = (stock: Stock): KLineData[] => {
  if (!dataCache.has(stock.symbol)) {
    dataCache.set(stock.symbol, generateOHLCV(stock.price, 300));
  }
  return dataCache.get(stock.symbol)!;
};

export const ChartArea = ({ activeTool, selectedStock, activeTimeframe, isReplaying, replayIndex, tradeOrders }: ChartAreaProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const activeToolRef = useRef<string>('cursor');

  // Init chart ONCE
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = init(chartContainerRef.current);
    if (!chart) return;
    
    // Apply dark theme first
    chart.setStyles('dark');
    
    // Then override grid styles
    chart.setStyles({
      grid: {
        horizontal: { color: '#2a2e39', size: 1, style: 'dashed' },
        vertical: { color: '#2a2e39', size: 1, style: 'dashed' },
      },
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
    const chart = chartRef.current;
    if (!chart) return;

    const allData = getStockData(selectedStock);

    // In replay mode: slice data up to replayIndex
    const visibleData = isReplaying
      ? allData.slice(0, Math.max(30, replayIndex))
      : allData;

    chart.setSymbol({ name: selectedStock.symbol });
    
    let tickerInterval: ReturnType<typeof setInterval>;

    chart.setDataLoader({
      getBars: (params: DataLoaderGetBarsParams) => {
        params.callback(visibleData, false);
      },
      subscribeBar: (params: DataLoaderSubscribeBarParams) => {
        // Only run live ticker if we are NOT in replay mode
        if (isReplaying) return;

        // Simulate live market ticking
        tickerInterval = setInterval(() => {
          const lastCandle = allData[allData.length - 1];
          const newPrice = lastCandle.close + (Math.random() - 0.5) * lastCandle.close * 0.005;
          
          const newCandle = {
            ...lastCandle,
            close: parseFloat(newPrice.toFixed(2)),
            high: Math.max(lastCandle.high, parseFloat(newPrice.toFixed(2))),
            low: Math.min(lastCandle.low, parseFloat(newPrice.toFixed(2))),
            volume: (lastCandle.volume || 0) + Math.random() * 500,
          };
          
          // Apply tick
          allData[allData.length - 1] = newCandle;
          params.callback(newCandle);
        }, 1000);
      },
      unsubscribeBar: () => {
        if (tickerInterval) clearInterval(tickerInterval);
      }
    });
    chart.setPeriod({ type: 'day', span: 1 });

    return () => {
      if (tickerInterval) clearInterval(tickerInterval);
    };
  }, [selectedStock, activeTimeframe, isReplaying, replayIndex]);

  // Draw price lines for ALL trade orders
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || tradeOrders.length === 0) return;

    const allData = getStockData(selectedStock);
    if (allData.length === 0) return;
    const lastDataIndex = allData.length - 1;

    // Clear previous order overlays to prevent duplicates if this runs multiple times
    chart.removeOverlay({ name: 'horizontalStraightLine' });

    tradeOrders.forEach(order => {
      const isBuy = order.type === 'buy';
      const color = isBuy ? '#089981' : '#f23645';

      // 1. Draw main entry price line
      chart.createOverlay({
        name: 'horizontalStraightLine',
        lock: true,
        points: [{ dataIndex: lastDataIndex, value: order.price }],
        styles: {
          line: { color, size: 2, style: 'dashed', dashedValue: [5, 5] },
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
        extendData: `${isBuy ? '▲ MUA' : '▼ BÁN'} ${order.qty} @ ${order.price.toLocaleString('vi-VN')}₫`,
      });

      // 2. Draw Take Profit line (TP)
      if (order.tp) {
        chart.createOverlay({
          name: 'horizontalStraightLine',
          lock: true,
          points: [{ dataIndex: lastDataIndex, value: order.tp }],
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
          extendData: `TP @ ${order.tp.toLocaleString('vi-VN')}₫`,
        });
      }

      // 3. Draw Stop Loss line (SL)
      if (order.sl) {
        chart.createOverlay({
          name: 'horizontalStraightLine',
          lock: true,
          points: [{ dataIndex: lastDataIndex, value: order.sl }],
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
          extendData: `SL @ ${order.sl.toLocaleString('vi-VN')}₫`,
        });
      }
    });
  }, [tradeOrders]);

  const priceColor = selectedStock.type === 'up' ? 'text-[#089981]' : 'text-[#f23645]';

  return (
    <div className="flex-1 min-w-0 relative bg-[#131722]">
      {/* Symbol header */}
      <div className="absolute top-2 left-4 z-10 pointer-events-none flex items-baseline gap-2 flex-wrap">
        <span className="text-white font-bold text-sm">{selectedStock.symbol}</span>
        <span className="text-[#787b86] text-xs">{selectedStock.name}</span>
        <span className={`text-sm font-bold font-mono ${priceColor}`}>
          {selectedStock.price.toLocaleString('vi-VN')}
        </span>
        <span className={`text-xs ${priceColor}`}>
          {selectedStock.percent > 0 ? '+' : ''}{selectedStock.percent.toFixed(2)}%
        </span>
      </div>

      {/* Bar Replay banner */}
      {isReplaying && (
        <div className="absolute top-2 right-4 z-10 flex items-center gap-2 bg-orange-900/70 border border-orange-600 text-orange-200 text-xs px-3 py-1.5 rounded-lg backdrop-blur pointer-events-none">
          <span className="animate-pulse w-2 h-2 rounded-full bg-orange-400 inline-block" />
          Bar Replay — Cây nến thứ {replayIndex} / {getStockData(selectedStock).length}
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
