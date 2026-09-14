import { useEffect, useRef } from 'react';
import { init, dispose } from 'klinecharts';
import type { Chart, KLineData, DataLoaderGetBarsParams, DataLoaderSubscribeBarParams } from 'klinecharts';
import { generateOHLCV, type Stock } from '../data';
import type { TradeOrder } from '../TradingTerminal';
import type { ChartSettings } from '../chartSettings';

interface ChartAreaProps {
  activeTool: string;
  selectedStock: Stock;
  activeTimeframe: string;
  isReplaying: boolean;
  replayIndex: number;
  tradeOrders: TradeOrder[];
  chartSettings: ChartSettings;
}

// Cache data per stock to avoid re-generating every render
const dataCache = new Map<string, KLineData[]>();

const getStockData = (stock: Stock): KLineData[] => {
  if (!dataCache.has(stock.symbol)) {
    dataCache.set(stock.symbol, generateOHLCV(stock.price, 300));
  }
  return dataCache.get(stock.symbol)!;
};

export const ChartArea = ({ activeTool, selectedStock, activeTimeframe, isReplaying, replayIndex, tradeOrders, chartSettings }: ChartAreaProps) => {
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

  // Apply chart settings when they change
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !chartSettings) return;

    chart.setStyles({
      grid: {
        horizontal: {
          show: chartSettings.canvas.hGridShow,
          size: 1,
          color: chartSettings.canvas.hGridColor,
          style: chartSettings.canvas.hGridStyle === '—' ? 'solid' : 'dashed',
        },
        vertical: {
          show: chartSettings.canvas.vGridShow,
          size: 1,
          color: chartSettings.canvas.vGridColor,
          style: chartSettings.canvas.vGridStyle === '—' ? 'solid' : 'dashed',
        }
      },
      candle: {
        type: 'candle_solid',
        bar: {
          upColor: chartSettings.candle.bodyUp,
          downColor: chartSettings.candle.bodyDown,
          noChangeColor: chartSettings.candle.bodyDown,
          upBorderColor: chartSettings.candle.borderUp,
          downBorderColor: chartSettings.candle.borderDown,
          noChangeBorderColor: chartSettings.candle.borderDown,
          upWickColor: chartSettings.candle.wickUp,
          downWickColor: chartSettings.candle.wickDown,
          noChangeWickColor: chartSettings.candle.wickDown,
        }
      },
      crosshair: {
        show: true,
        horizontal: {
          show: true,
          line: {
            show: true,
            style: chartSettings.canvas.crosshairStyle === '—' ? 'solid' : 'dashed',
            color: chartSettings.canvas.crosshairColor,
            size: 1,
          },
        },
        vertical: {
          show: true,
          line: {
            show: true,
            style: chartSettings.canvas.crosshairStyle === '—' ? 'solid' : 'dashed',
            color: chartSettings.canvas.crosshairColor,
            size: 1,
          }
        }
      },
      xAxis: {
        axisLine: { color: chartSettings.scales.lineColor },
        tickText: { color: chartSettings.scales.textColor, size: chartSettings.scales.textSize, family: 'Inter' },
      },
      yAxis: {
        axisLine: { color: chartSettings.scales.lineColor },
        tickText: { color: chartSettings.scales.textColor, size: chartSettings.scales.textSize, family: 'Inter' },
      }
    });

    try {
      const anyChart = chart as any;
      if (typeof anyChart.setTimezone === 'function') {
        anyChart.setTimezone(chartSettings.symbol.timezone);
      }
      if (typeof anyChart.setOffsetRightDistance === 'function') {
        anyChart.setOffsetRightDistance(chartSettings.canvas.marginRight);
      }
      if (typeof anyChart.setPriceVolumePrecision === 'function') {
        let pricePrecision = 2;
        switch (chartSettings.symbol.precision) {
          case '1': pricePrecision = 0; break;
          case '1/10': pricePrecision = 1; break;
          case '1/100': pricePrecision = 2; break;
          case '1/1000': pricePrecision = 3; break;
        }
        anyChart.setPriceVolumePrecision(pricePrecision, 0);
      }
    } catch (e) {
      // Ignored if API is not available in this version
    }
  }, [chartSettings]);

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

  const bgStyle = chartSettings.canvas.bgType === 'Solid' 
    ? { backgroundColor: chartSettings.canvas.bgSolid } 
    : { background: `linear-gradient(to bottom, ${chartSettings.canvas.bgGradientTop}, ${chartSettings.canvas.bgGradientBottom})` };

  return (
    <div className="flex-1 min-w-0 relative" style={bgStyle}>
      {/* Symbol header */}
      <div className="absolute top-2 left-4 z-10 pointer-events-none flex items-baseline gap-2 flex-wrap">
        {['Ticker', 'Ticker and description', 'Name'].includes(chartSettings.status.title) && (
          <span className="text-white font-bold text-sm">{selectedStock.symbol}</span>
        )}
        {['Description', 'Ticker and description'].includes(chartSettings.status.title) && (
          <span className="text-[#787b86] text-xs">{selectedStock.name}</span>
        )}
        
        {chartSettings.status.openMarketStatus && (
          <span className="w-2 h-2 rounded-full bg-[#089981] ml-1 self-center" title="Market Open"></span>
        )}

        {chartSettings.status.chartValues && (
          <span className={`text-sm font-bold font-mono ml-2 ${priceColor}`}>
            {selectedStock.price.toLocaleString('vi-VN')}
          </span>
        )}
        {chartSettings.status.barChangeValues && (
          <span className={`text-xs ${priceColor}`}>
            {selectedStock.percent > 0 ? '+' : ''}{selectedStock.percent.toFixed(2)}%
          </span>
        )}
        {chartSettings.status.volume && (
          <span className="text-[#787b86] text-xs ml-2">Vol: {(getStockData(selectedStock).slice(-1)[0]?.volume || 0).toFixed(0)}</span>
        )}
      </div>

      {/* Watermark overlay */}
      {chartSettings.canvas.watermarkVal !== 'Hidden' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1] overflow-hidden opacity-[0.03]">
          <span className="text-[120px] font-bold text-white select-none whitespace-nowrap">
            {chartSettings.canvas.watermarkVal === 'Ticker' ? selectedStock.symbol 
             : chartSettings.canvas.watermarkVal === 'Description' ? selectedStock.name
             : chartSettings.canvas.watermarkVal === 'Interval' ? activeTimeframe
             : chartSettings.canvas.watermarkVal === 'Replay mode' && isReplaying ? 'Replay Mode' 
             : selectedStock.symbol}
          </span>
        </div>
      )}

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
        style={{ position: 'absolute', top: `${chartSettings.canvas.marginTop}%`, left: 0, right: 0, bottom: `${chartSettings.canvas.marginBottom}%` }}
      />
    </div>
  );
};
