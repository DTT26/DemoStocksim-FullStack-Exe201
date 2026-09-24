import { useState, useEffect, useRef } from 'react';
import { init, dispose, registerOverlay } from 'klinecharts';
import type { Chart, KLineData, DataLoaderGetBarsParams, DataLoaderSubscribeBarParams } from 'klinecharts';
import { generateOHLCV, getPricePrecision, timeframeToMs, type Stock } from '../data';
import { fetchBinanceKlines, mapTimeframeToBinance, subscribeBinanceKline } from '../../../services/binanceApi';
import type { TradeOrder } from '../TradingTerminal';
import { INDICATOR_LIST } from './IndicatorModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { GripVertical, Settings, Lock, Unlock, Trash2, X, Layers } from 'lucide-react';
import { FibonacciSettingsModal, DEFAULT_FIBONACCI_CONFIG, type FibonacciConfig } from './FibonacciSettingsModal';

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

// Đăng ký overlay vùng Chốt lời / Cắt lỗ (TP/SL Zone)
registerOverlay({
  name: 'tpslZone',
  totalStep: 2,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,
  createPointFigures: ({ coordinates, bounding }) => {
    if (coordinates && coordinates.length >= 2 && coordinates[0] && coordinates[1]) {
      const y1 = coordinates[0].y;
      const y2 = coordinates[1].y;
      if (typeof y1 === 'number' && typeof y2 === 'number') {
        const width = bounding?.width || 3000;
        return [
          {
            type: 'polygon',
            attrs: {
              coordinates: [
                { x: 0, y: y1 },
                { x: width, y: y1 },
                { x: width, y: y2 },
                { x: 0, y: y2 }
              ]
            },
            styles: {
              style: 'fill',
              color: 'rgba(8, 153, 129, 0.16)'
            }
          }
        ];
      }
    }
    return [];
  }
});

// Đăng ký công cụ Fibonacci Thoái lui (Fibonacci Retracement) chuẩn TradingView
registerOverlay({
  name: 'fibonacciLine',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,
  createPointFigures: ({ coordinates, bounding, overlay }) => {
    if (!coordinates || coordinates.length === 0) return [];

    const figures: any[] = [];
    const config: FibonacciConfig = (overlay.extendData as FibonacciConfig) || DEFAULT_FIBONACCI_CONFIG;
    const points = overlay.points;

    // 1. Đường xu hướng nối 2 điểm neo dạng nét đứt (Anchor Trendline)
    if (coordinates.length >= 2) {
      figures.push({
        type: 'line',
        attrs: {
          coordinates: [
            { x: coordinates[0].x, y: coordinates[0].y },
            { x: coordinates[1].x, y: coordinates[1].y }
          ]
        },
        styles: {
          style: 'dashed',
          dashedValue: [4, 4],
          color: '#888888',
          size: 1
        }
      });
    }

    if (coordinates.length > 1 && typeof points[0]?.value === 'number' && typeof points[1]?.value === 'number') {
      const activeLevels = [...(config.levels || DEFAULT_FIBONACCI_CONFIG.levels)]
        .filter(l => l.active)
        .sort((a, b) => b.level - a.level);

      const yDif = coordinates[0].y - coordinates[1].y;
      const valDif = points[0].value - points[1].value;

      const p0x = coordinates[0].x;
      const p1x = coordinates[1].x;
      const startX = Math.min(p0x, p1x);
      const endX = config.extendRight ? (bounding?.width || 3000) : Math.max(p0x, p1x);

      // 2. Dải nền màu trong suốt giữa các mức Fibonacci liên tiếp
      if (config.showBackground && activeLevels.length > 1) {
        for (let i = 0; i < activeLevels.length - 1; i++) {
          const topLevel = activeLevels[i];
          const btmLevel = activeLevels[i + 1];
          const yTop = coordinates[1].y + yDif * topLevel.level;
          const yBtm = coordinates[1].y + yDif * btmLevel.level;

          figures.push({
            type: 'polygon',
            attrs: {
              coordinates: [
                { x: startX, y: yTop },
                { x: endX, y: yTop },
                { x: endX, y: yBtm },
                { x: startX, y: yBtm }
              ]
            },
            styles: {
              style: 'fill',
              color: topLevel.fill || 'rgba(33, 150, 243, 0.15)'
            }
          });
        }
      }

      // 3. Đường kẻ ngang mức Fibonacci và Text nhãn hiển thị số liệu
      activeLevels.forEach(item => {
        const y = coordinates[1].y + yDif * item.level;
        const priceVal = points[1].value! + valDif * item.level;
        const formattedPrice = priceVal >= 100 
          ? priceVal.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) 
          : priceVal.toFixed(getPricePrecision(priceVal));

        // Đường kẻ ngang
        figures.push({
          type: 'line',
          attrs: {
            coordinates: [
              { x: startX, y },
              { x: endX, y }
            ]
          },
          styles: {
            style: 'solid',
            color: item.color,
            size: config.lineWidth || 1
          }
        });

        // Nhãn text: e.g. "0.618 (81,270.3)" chuẩn TradingView
        let labelText = '';
        if (config.showLabels && config.showPrices) {
          labelText = `${item.level} (${formattedPrice})`;
        } else if (config.showLabels) {
          labelText = `${item.level}`;
        } else if (config.showPrices) {
          labelText = `${formattedPrice}`;
        }

        if (labelText) {
          figures.push({
            type: 'text',
            attrs: {
              x: startX + 6,
              y: y - 2,
              text: labelText,
              align: 'left',
              baseline: 'bottom'
            },
            styles: {
              color: item.color,
              size: 11,
              family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              weight: 'bold'
            },
            ignoreEvent: true
          });
        }
      });
    }

    return figures;
  }
});

interface ChartAreaProps {
  activeTool: string;
  selectedStock: Stock;
  activeTimeframe: string;
  isReplaying: boolean;
  replayTime?: number | null;
  replayStepTrigger?: number;
  onReplayTimeChange?: (time: number) => void;
  tradeOrders: TradeOrder[];
  pendingOrders?: any[];
  activeIndicators?: string[];
  activePosition?: { quantity: number; averagePrice: number; side: 'LONG' | 'SHORT'; leverage: number; tp?: number; sl?: number };
  onPriceChange?: (price: number) => void;
  onPriceUpdate?: (price: number) => void;
  isSelectingReplayStart?: boolean;
  onSelectReplayStart?: (timestamp: number) => void;
  goToRealtimeTrigger?: number;
  onDataLoaded?: (count: number) => void;
  previewTPSL?: { tp?: number; sl?: number; side?: 'LONG' | 'SHORT'; enabled: boolean } | null;
  onTPSLChange?: (type: 'tp' | 'sl', price: number) => void;
  undoTrigger?: number;
  redoTrigger?: number;
  onUndoRedoChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
}

// Cache data per stock+timeframe to avoid re-generating every render
const dataCache = new Map<string, KLineData[]>();

const getStockData = (stock: Stock): KLineData[] => {
  if (!dataCache.has(stock.symbol)) {
    dataCache.set(stock.symbol, generateOHLCV(stock.price, 300));
  }
  return dataCache.get(stock.symbol)!;
};

export const ChartArea = ({ activeTool, selectedStock, activeTimeframe, isReplaying, replayTime, replayStepTrigger, onReplayTimeChange, tradeOrders, pendingOrders, activeIndicators = [], activePosition, onPriceUpdate, onPriceChange, isSelectingReplayStart, onSelectReplayStart, goToRealtimeTrigger, onDataLoaded, previewTPSL, onTPSLChange, undoTrigger, redoTrigger, onUndoRedoChange }: ChartAreaProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const activeToolRef = useRef<string>('cursor');
  const activeTimeframeRef = useRef<string>(activeTimeframe);
  const isSelectingReplayStartRef = useRef(isSelectingReplayStart);
  const onSelectReplayStartRef = useRef(onSelectReplayStart);
  const replayTimeRef = useRef<number | null | undefined>(replayTime);
  const onReplayTimeChangeRef = useRef(onReplayTimeChange);
  const crosshairIndexRef = useRef<number | null>(null);
  const subscriberCallbackRef = useRef<((data: KLineData) => void) | null>(null);

  const isDraggingRef = useRef(false);
  const currentTpRef = useRef<number | undefined>(undefined);
  const currentSlRef = useRef<number | undefined>(undefined);
  const onTPSLChangeRef = useRef(onTPSLChange);

  // Fibonacci & Tool Floating Bar States
  const [isFibModalOpen, setIsFibModalOpen] = useState(false);
  const [fibConfig, setFibConfig] = useState<FibonacciConfig>(DEFAULT_FIBONACCI_CONFIG);
  const fibConfigRef = useRef<FibonacciConfig>(DEFAULT_FIBONACCI_CONFIG);
  const [selectedOverlay, setSelectedOverlay] = useState<{ id: string; name: string; extendData: FibonacciConfig; lock: boolean; x: number; y: number } | null>(null);

  // Undo / Redo History Stacks
  const historyStackRef = useRef<any[]>([]);
  const redoStackRef = useRef<any[]>([]);

  const updateUndoRedo = () => {
    onUndoRedoChange?.({
      canUndo: historyStackRef.current.length > 0,
      canRedo: redoStackRef.current.length > 0
    });
  };

  const handleOverlayDrawEnd = (event: any) => {
    const ov = event.overlay;
    if (ov) {
      historyStackRef.current.push({
        id: ov.id,
        name: ov.name,
        points: ov.points,
        extendData: ov.extendData,
        styles: ov.styles,
        lock: ov.lock
      });
      redoStackRef.current = [];
      updateUndoRedo();

      if (ov.name === 'fibonacciLine') {
        const bounding = chartRef.current?.getSize();
        const w = bounding?.width || 800;
        const xPos = Math.min(w - 280, Math.max(20, (event.x || 300) - 100));
        const yPos = Math.max(50, (event.y || 150) - 50);
        setSelectedOverlay({
          id: ov.id,
          name: ov.name,
          extendData: ov.extendData || fibConfigRef.current,
          lock: ov.lock,
          x: xPos,
          y: yPos
        });
      }
    }
  };

  const handleOverlaySelect = (event: any) => {
    const ov = event.overlay;
    if (ov && ov.name === 'fibonacciLine') {
      const bounding = chartRef.current?.getSize();
      const w = bounding?.width || 800;
      const xPos = Math.min(w - 280, Math.max(20, (event.x || 300) - 100));
      const yPos = Math.max(50, (event.y || 150) - 50);
      setSelectedOverlay({
        id: ov.id,
        name: ov.name,
        extendData: ov.extendData || fibConfigRef.current,
        lock: ov.lock,
        x: xPos,
        y: yPos
      });
    }
  };

  // Listen to Undo trigger from toolbar / shortcut
  useEffect(() => {
    if (!undoTrigger) return;
    const chart = chartRef.current;
    if (!chart) return;
    if (historyStackRef.current.length > 0) {
      const last = historyStackRef.current.pop();
      chart.removeOverlay({ id: last.id });
      redoStackRef.current.push(last);
      if (selectedOverlay?.id === last.id) {
        setSelectedOverlay(null);
      }
      updateUndoRedo();
    }
  }, [undoTrigger]);

  // Listen to Redo trigger from toolbar / shortcut
  useEffect(() => {
    if (!redoTrigger) return;
    const chart = chartRef.current;
    if (!chart) return;
    if (redoStackRef.current.length > 0) {
      const item = redoStackRef.current.pop();
      const newId = chart.createOverlay({
        name: item.name,
        points: item.points,
        extendData: item.extendData,
        styles: item.styles,
        lock: item.lock,
        onDrawEnd: handleOverlayDrawEnd,
        onSelected: handleOverlaySelect,
        onClick: handleOverlaySelect
      });
      historyStackRef.current.push({ ...item, id: (newId as string) || item.id });
      updateUndoRedo();
    }
  }, [redoTrigger]);

  const handleSaveFibConfig = (newConfig: FibonacciConfig) => {
    setFibConfig(newConfig);
    fibConfigRef.current = newConfig;
    if (chartRef.current && selectedOverlay) {
      chartRef.current.overrideOverlay({
        id: selectedOverlay.id,
        extendData: newConfig
      });
      setSelectedOverlay(prev => prev ? { ...prev, extendData: newConfig } : null);
    }
  };

  const handleUpdateOverlayConfig = (patch: Partial<FibonacciConfig>) => {
    if (!selectedOverlay || !chartRef.current) return;
    const updated: FibonacciConfig = { ...selectedOverlay.extendData, ...patch };
    chartRef.current.overrideOverlay({
      id: selectedOverlay.id,
      extendData: updated
    });
    setSelectedOverlay(prev => prev ? { ...prev, extendData: updated } : null);
    setFibConfig(updated);
    fibConfigRef.current = updated;
  };
  useEffect(() => {
    onTPSLChangeRef.current = onTPSLChange;
  }, [onTPSLChange]);
  
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  // Map: indicator name → sub-pane id (undefined = on main pane)
  const indicatorPaneRef = useRef<Map<string, string | undefined>>(new Map());

  useEffect(() => {
    isSelectingReplayStartRef.current = isSelectingReplayStart;
    onSelectReplayStartRef.current = onSelectReplayStart;
  }, [isSelectingReplayStart, onSelectReplayStart]);

  useEffect(() => {
    replayTimeRef.current = replayTime;
  }, [replayTime]);

  useEffect(() => {
    onReplayTimeChangeRef.current = onReplayTimeChange;
  }, [onReplayTimeChange]);

  useEffect(() => {
    if (goToRealtimeTrigger && goToRealtimeTrigger > 0 && chartRef.current) {
      chartRef.current.setOffsetRightDistance(50);
      chartRef.current.scrollToRealTime(0);
    }
  }, [goToRealtimeTrigger]);

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
          tooltip: {
            showRule: 'always',
            showType: 'standard',
            legend: {
              template: (data: any) => {
                const d = data.current;
                if (!d) return [];
                const time = new Date(d.timestamp).toLocaleString('vi-VN', {
                  hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                });
                const precision = getPricePrecision(d.close || selectedStock.price || 1);
                return [
                  { 
                    title: '', 
                    value: { 
                      text: `Time: ${time}   Open: ${Number(d.open).toFixed(precision)}   High: ${Number(d.high).toFixed(precision)}   Low: ${Number(d.low).toFixed(precision)}   Close: ${Number(d.close).toFixed(precision)}   Volume: ${(d.volume/1000).toFixed(2)}K`, 
                      color: theme === 'dark' ? '#c4c6cb' : '#131722' 
                    } 
                  }
                ];
              }
            }
          },
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
          const tf = activeTimeframeRef.current || 'D';
          const isIntraday = tf.endsWith('m') || tf.endsWith('h');
          if (params.type === 'crosshair' || params.type === 'tooltip') {
            return isIntraday ? `${dd}/${mo}/${yyyy} ${hh}:${mm}` : `${dd}/${mo}/${yyyy}`;
          }

          // xAxis tick
          if (isIntraday) {
             return `${dd}/${mo} ${hh}:${mm}`;
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

    chart.subscribeAction('onCandleTooltipFeatureClick' as any, () => {
      // logic for tooltip feature click
    });

    chart.subscribeAction('onCrosshairChange', (data: any) => {
      crosshairIndexRef.current = data?.dataIndex ?? null;
    });

    // Native bar click for Bar Replay start point selection
    chart.subscribeAction('onCandleBarClick', (data: any) => {
      if (isSelectingReplayStartRef.current) {
        let ts: number | undefined = data?.kLineData?.timestamp;
        if (!ts && typeof data?.dataIndex === 'number') {
          const list = chartRef.current?.getDataList();
          ts = list?.[data.dataIndex]?.timestamp;
        }
        if (ts) {
          onSelectReplayStartRef.current?.(ts);
        }
      }
    });

    const handleChartClick = () => {
      if (isSelectingReplayStartRef.current && crosshairIndexRef.current !== null) {
        const list = chartRef.current?.getDataList();
        const ts = list?.[crosshairIndexRef.current]?.timestamp;
        if (ts) {
          onSelectReplayStartRef.current?.(ts);
        }
      }
    };
    
    const container = chartContainerRef.current;
    container?.addEventListener('click', handleChartClick);

    const handleResize = () => chart?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container?.removeEventListener('click', handleChartClick);
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
      const overlays = chart.getOverlays();
      const userOverlays = overlays.filter(o => o.name !== 'tpslZone' && o.id !== 'tpsl_zone' && o.id !== 'preview_tp_line' && o.id !== 'preview_sl_line');
      userOverlays.forEach(o => chart.removeOverlay({ id: o.id }));
      if (userOverlays.length > 0) {
        historyStackRef.current.push(...userOverlays);
        updateUndoRedo();
      }
      setSelectedOverlay(null);
    } else if (activeTool === 'cursor') {
      // Cancel any pending overlay
    } else {
      chart.createOverlay({
        name: activeTool,
        lock: false,
        extendData: activeTool === 'fibonacciLine' ? fibConfigRef.current : undefined,
        onDrawEnd: handleOverlayDrawEnd,
        onSelected: handleOverlaySelect,
        onClick: handleOverlaySelect
      });
    }
  }, [activeTool]);

  // Handle step updates during replay smoothly
  useEffect(() => {
    if (!replayStepTrigger || !isReplaying) return;
    const cacheKey = `${selectedStock.symbol}-${activeTimeframe}`;
    const fullData = dataCache.get(cacheKey);
    if (!fullData || fullData.length === 0) return;

    const currentTime = replayTimeRef.current ?? 0;
    const nextBar = fullData.find(d => d.timestamp > currentTime);
    if (nextBar) {
      if (subscriberCallbackRef.current) {
        subscriberCallbackRef.current(nextBar);
      }
      if (onPriceUpdate) onPriceUpdate(nextBar.close);
      replayTimeRef.current = nextBar.timestamp;
      onReplayTimeChangeRef.current?.(nextBar.timestamp);
    }
  }, [replayStepTrigger]);

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
      const intervalMs = timeframeToMs(activeTimeframe);
      const currentReplayTime = replayTimeRef.current;

      let allData: KLineData[] = [];

      // Phân loại data source
      if (selectedStock.market === 'Tiền điện tử (Crypto)') {
        // Lấy dữ liệu thật từ Binance
        const binanceInterval = mapTimeframeToBinance(activeTimeframe);
        try {
          if (isReplaying && currentReplayTime) {
            // Lấy nến bao quanh mốc replayTime: dự trù 300 nến phía sau để bước tiếp
            const targetEndTime = Math.min(Date.now(), currentReplayTime + 300 * intervalMs);
            allData = await fetchBinanceKlines({
              symbol: selectedStock.symbol,
              interval: binanceInterval,
              limit: 1000,
              isFutures: selectedStock.isFutures,
              endTime: targetEndTime
            });
          } else {
            allData = await fetchBinanceKlines({
              symbol: selectedStock.symbol,
              interval: binanceInterval,
              limit: 1000,
              isFutures: selectedStock.isFutures
            });
          }
        } catch (error) {
          allData = [];
        }
      }

      // NẾU allData rỗng (hoặc thị trường không phải Crypto/VN Stock, hoặc API lỗi)
      if (!allData || allData.length === 0) {
        const targetEndTime = (isReplaying && currentReplayTime) 
          ? Math.min(Date.now(), currentReplayTime + 500 * intervalMs) 
          : undefined;
        
        // Kiểm tra xem cache hiện có bao phủ được mốc replayTime không
        const cached = dataCache.get(cacheKey);
        const cacheValid = cached && cached.length > 0 && (!isReplaying || !currentReplayTime || (cached[0].timestamp <= currentReplayTime && cached[cached.length - 1].timestamp >= currentReplayTime));

        if (!cacheValid) {
          dataCache.set(cacheKey, generateOHLCV(selectedStock.price, 5000, activeTimeframe, targetEndTime));
        }
        allData = dataCache.get(cacheKey)!;
      } else {
        dataCache.set(cacheKey, allData);
      }
      onDataLoaded?.(allData.length);

      if (!isMounted) return;

      // In replay mode: filter data up to replayTime
      const visibleData = (isReplaying && currentReplayTime)
        ? allData.filter(d => d.timestamp <= currentReplayTime)
        : allData;

      if (isReplaying && visibleData.length > 0) {
        const lastCandle = visibleData[visibleData.length - 1];
        if (onPriceUpdate) onPriceUpdate(lastCandle.close);
      } else if (!isReplaying && allData.length > 0 && onPriceUpdate) {
        onPriceUpdate(allData[allData.length - 1].close);
      }

      const precision = getPricePrecision(selectedStock.price);
      chart.setSymbol({ 
        ticker: `${selectedStock.exchange} • ${selectedStock.symbol}`,
        name: selectedStock.name,
        shortName: selectedStock.symbol,
        pricePrecision: precision,
        volumePrecision: 2,
      });
      chart.setDataLoader({
        getBars: async (params: DataLoaderGetBarsParams) => {
          // Khi người dùng cuộn sang trái (kéo về quá khứ)
          // CHÚ Ý: Trong KlineCharts v10, 'forward' là cuộn về quá khứ (prepend data)
          if (params.type === 'forward') {
            if (!params.timestamp) return params.callback([], true);

            // Lấy nến cũ hơn dựa vào timestamp của nến đầu tiên hiện tại
            const oldestTime = params.timestamp;
            if (selectedStock.market === 'Tiền điện tử (Crypto)') {
              const binanceInterval = mapTimeframeToBinance(activeTimeframe);
              
              try {
                let olderData = await fetchBinanceKlines({
                  symbol: selectedStock.symbol,
                  interval: binanceInterval,
                  limit: 1000,
                  isFutures: selectedStock.isFutures,
                  endTime: oldestTime - 1, // Tránh lấy trùng nến đầu tiên
                });
                
                olderData = olderData.filter(d => d.timestamp < oldestTime);
                if (olderData.length > 0) {
                  // Nối dữ liệu cũ vào mảng allData
                  allData = [...olderData, ...allData];
                  dataCache.set(cacheKey, allData);
                  onDataLoaded?.(allData.length);
                  params.callback(olderData, true); // Luôn cho phép cuộn tiếp
                  return;
                }
              } catch (err) {
                // Fake data fallback nếu lỗi hoặc hết data Binance
              }

              const oldestCandle = allData[0];
              const basePrice = oldestCandle ? oldestCandle.open : selectedStock.price;
              const olderData = generateOHLCV(basePrice, 500, activeTimeframe, oldestTime - 1).filter(d => d.timestamp < oldestTime);
              if (olderData.length > 0) {
                allData = [...olderData, ...allData];
                dataCache.set(cacheKey, allData);
                onDataLoaded?.(allData.length);
                params.callback(olderData, true);
              } else {
                params.callback([], true);
              }
              return;
            } else {
              // Fake data cho thị trường khác
              const oldestCandle = allData[0];
              const basePrice = oldestCandle ? oldestCandle.open : selectedStock.price;
              const olderData = generateOHLCV(basePrice, 1000, activeTimeframe, oldestTime - 1).filter(d => d.timestamp < oldestTime);
              
              if (olderData.length > 0) {
                allData = [...olderData, ...allData];
                dataCache.set(cacheKey, allData);
                onDataLoaded?.(allData.length);
                params.callback(olderData, true);
              } else {
                params.callback([], true);
              }
              return;
            }
          }

          // Khi người dùng cuộn sang phải (về tương lai)
          if (params.type === 'backward') {
            params.callback([], false);
            return;
          }

          // Gọi lần đầu (type === 'init')
          params.callback(visibleData, true);
        },
        subscribeBar: (params: DataLoaderSubscribeBarParams) => {
          subscriberCallbackRef.current = params.callback;
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
              const tickPrecision = getPricePrecision(lastCandle.close);
              const swing = (Math.random() - 0.5) * lastCandle.close * 0.005;
              const newPrice = lastCandle.close + swing;
              const newCandle = {
                ...lastCandle,
                close: parseFloat(newPrice.toFixed(tickPrecision)),
                high: parseFloat(Math.max(lastCandle.high, newPrice).toFixed(tickPrecision)),
                low: parseFloat(Math.min(lastCandle.low, newPrice).toFixed(tickPrecision)),
                volume: (lastCandle.volume || 0) + Math.random() * 500,
              };

              allData[allData.length - 1] = newCandle;
              params.callback(newCandle);
              if (onPriceUpdate) onPriceUpdate(newCandle.close);
            }, 1000);
          }
        },
        unsubscribeBar: () => {
          subscriberCallbackRef.current = null;
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
  }, [selectedStock.symbol, selectedStock.market, selectedStock.isFutures, activeTimeframe, isReplaying]);

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
        } catch (_) { }
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

    if (isDraggingRef.current) return;

    const allData = chart.getDataList();
    if (allData.length === 0) return;
    const lastDataIndex = allData.length - 1;

    // Clear previous order overlays to prevent duplicates if this runs multiple times
    chart.removeOverlay({ name: 'horizontalStraightLine' });
    chart.removeOverlay({ name: 'tpslZone' });

    // Determine TP and SL to draw
    const tpToDraw = (previewTPSL?.enabled && previewTPSL.tp) ? previewTPSL.tp : activePosition?.tp;
    const slToDraw = (previewTPSL?.enabled && previewTPSL.sl) ? previewTPSL.sl : activePosition?.sl;

    currentTpRef.current = tpToDraw;
    currentSlRef.current = slToDraw;

    // 0. Draw Green Shaded TP/SL Zone between Take-Profit and Stop-Loss
    if (tpToDraw && slToDraw) {
      chart.createOverlay({
        id: 'tpsl_zone',
        name: 'tpslZone',
        lock: true,
        points: [
          { timestamp: allData[lastDataIndex].timestamp, value: tpToDraw },
          { timestamp: allData[lastDataIndex].timestamp, value: slToDraw }
        ]
      });
    }

    if (activePosition && activePosition.quantity > 0) {
      const isBuy = activePosition.side === 'LONG';
      const color = '#ffffff'; // White for entry line

      // 1. Draw main entry price line
      chart.createOverlay({
        name: 'horizontalStraightLine',
        lock: true,
        points: [{ timestamp: allData[lastDataIndex].timestamp, value: activePosition.averagePrice }],
        styles: {
          line: { color: '#ffffff', size: 2, style: 'dashed', dashedValue: [5, 5] },
          text: {
            color: '#131722',
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
        extendData: `${isBuy ? '▲ LONG' : '▼ SHORT'} ${activePosition.quantity.toFixed(2)} @ $${activePosition.averagePrice.toLocaleString('en-US')}`,
      });
    }

    // 2. Draw Take Profit line (TP) - Draggable
    if (tpToDraw) {
      const isPreview = previewTPSL?.enabled && previewTPSL.tp;
      chart.createOverlay({
        id: 'preview_tp_line',
        name: 'horizontalStraightLine',
        lock: false,
        points: [{ timestamp: allData[lastDataIndex].timestamp, value: tpToDraw }],
        styles: {
          line: { color: '#089981', size: 2, style: isPreview ? 'dashed' : 'solid', dashedValue: [5, 5] },
          point: {
            color: '#089981',
            borderColor: '#ffffff',
            borderSize: 2,
            radius: 5,
            activeColor: '#ffffff',
            activeBorderColor: '#089981',
            activeBorderSize: 3,
            activeRadius: 7
          },
          text: {
            color: '#ffffff',
            backgroundColor: '#089981',
            paddingLeft: 6,
            paddingRight: 6,
            paddingTop: 3,
            paddingBottom: 3,
            borderRadius: 4,
            size: 10,
            family: 'Inter',
            weight: 'bold',
          },
        },
        extendData: `TP (Chốt lời) @ $${tpToDraw.toLocaleString('en-US')} ↕ Kéo`,
        onPressedMoveStart: () => {
          isDraggingRef.current = true;
        },
        onPressedMoving: (event: any) => {
          const newPrice = event.overlay?.points?.[0]?.value;
          if (typeof newPrice === 'number' && !isNaN(newPrice)) {
            const precision = getPricePrecision(newPrice);
            const cleanPrice = Number(newPrice.toFixed(precision));
            currentTpRef.current = cleanPrice;
            if (currentSlRef.current) {
              chart.overrideOverlay({
                id: 'tpsl_zone',
                points: [
                  { timestamp: allData[lastDataIndex].timestamp, value: cleanPrice },
                  { timestamp: allData[lastDataIndex].timestamp, value: currentSlRef.current }
                ]
              });
            }
            chart.overrideOverlay({
              id: 'preview_tp_line',
              extendData: `TP (Chốt lời) @ $${cleanPrice.toLocaleString('en-US')} ↕ Kéo`
            });
            onTPSLChangeRef.current?.('tp', cleanPrice);
          }
        },
        onPressedMoveEnd: (event: any) => {
          isDraggingRef.current = false;
          const newPrice = event.overlay?.points?.[0]?.value;
          if (typeof newPrice === 'number' && !isNaN(newPrice)) {
            const precision = getPricePrecision(newPrice);
            const cleanPrice = Number(newPrice.toFixed(precision));
            onTPSLChangeRef.current?.('tp', cleanPrice);
          }
        }
      });
    }

    // 3. Draw Stop Loss line (SL) - Draggable
    if (slToDraw) {
      const isPreview = previewTPSL?.enabled && previewTPSL.sl;
      chart.createOverlay({
        id: 'preview_sl_line',
        name: 'horizontalStraightLine',
        lock: false,
        points: [{ timestamp: allData[lastDataIndex].timestamp, value: slToDraw }],
        styles: {
          line: { color: '#f23645', size: 2, style: isPreview ? 'dashed' : 'solid', dashedValue: [5, 5] },
          point: {
            color: '#f23645',
            borderColor: '#ffffff',
            borderSize: 2,
            radius: 5,
            activeColor: '#ffffff',
            activeBorderColor: '#f23645',
            activeBorderSize: 3,
            activeRadius: 7
          },
          text: {
            color: '#ffffff',
            backgroundColor: '#f23645',
            paddingLeft: 6,
            paddingRight: 6,
            paddingTop: 3,
            paddingBottom: 3,
            borderRadius: 4,
            size: 10,
            family: 'Inter',
            weight: 'bold',
          },
        },
        extendData: `SL (Cắt lỗ) @ $${slToDraw.toLocaleString('en-US')} ↕ Kéo`,
        onPressedMoveStart: () => {
          isDraggingRef.current = true;
        },
        onPressedMoving: (event: any) => {
          const newPrice = event.overlay?.points?.[0]?.value;
          if (typeof newPrice === 'number' && !isNaN(newPrice)) {
            const precision = getPricePrecision(newPrice);
            const cleanPrice = Number(newPrice.toFixed(precision));
            currentSlRef.current = cleanPrice;
            if (currentTpRef.current) {
              chart.overrideOverlay({
                id: 'tpsl_zone',
                points: [
                  { timestamp: allData[lastDataIndex].timestamp, value: currentTpRef.current },
                  { timestamp: allData[lastDataIndex].timestamp, value: cleanPrice }
                ]
              });
            }
            chart.overrideOverlay({
              id: 'preview_sl_line',
              extendData: `SL (Cắt lỗ) @ $${cleanPrice.toLocaleString('en-US')} ↕ Kéo`
            });
            onTPSLChangeRef.current?.('sl', cleanPrice);
          }
        },
        onPressedMoveEnd: (event: any) => {
          isDraggingRef.current = false;
          const newPrice = event.overlay?.points?.[0]?.value;
          if (typeof newPrice === 'number' && !isNaN(newPrice)) {
            const precision = getPricePrecision(newPrice);
            const cleanPrice = Number(newPrice.toFixed(precision));
            onTPSLChangeRef.current?.('sl', cleanPrice);
          }
        }
      });
    }

    // Draw Pending Orders
    if (pendingOrders && pendingOrders.length > 0) {
      const stockPending = pendingOrders.filter(o => o.symbol === selectedStock.symbol);
      stockPending.forEach(order => {
        const isBuy = order.side === 'LONG';
        const isLimit = order.type === 'LIMIT';
        const color = isLimit ? '#2962ff' : '#e65100'; // Blue for limit, Orange for stop

        chart.createOverlay({
          name: 'horizontalStraightLine',
          lock: true,
          points: [{ timestamp: allData[lastDataIndex].timestamp, value: order.price }],
          styles: {
            line: { color, size: 1, style: 'dashed', dashedValue: [2, 2] },
            text: {
              color: '#ffffff',
              backgroundColor: color,
              paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2,
              borderRadius: 2, size: 10, family: 'Inter', weight: 'bold',
            },
          },
          extendData: `${order.type} ${order.side} ${order.quantity?.toFixed(2) || ''} @ $${order.price.toLocaleString('en-US')}`,
        });
      });
    }
  }, [activePosition, pendingOrders, isReplaying, replayTime, selectedStock, previewTPSL]);

  const priceColor = selectedStock.type === 'up' ? 'text-[#089981]' : 'text-[#f23645]';

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

      {/* Active tool hint */}
      {activeTool !== 'cursor' && activeTool !== 'clear' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-xs text-blue-200 bg-blue-900/80 border border-blue-700/60 px-4 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2 shadow-lg">
          <span>✏️ <span className="font-semibold">{activeTool}</span> đang hoạt động</span>
          {activeTool === 'fibonacciLine' && (
            <button
              onClick={() => setIsFibModalOpen(true)}
              className="ml-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 shadow"
            >
              <Settings className="w-3 h-3" />
              <span>Chỉnh thông tin số liệu</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Action Toolbar for Fibonacci */}
      {selectedOverlay && selectedOverlay.name === 'fibonacciLine' && (
        <div
          className="absolute z-30 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl px-2 py-1.5 flex items-center gap-2 text-[#d1d4dc] text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-none"
          style={{
            left: `${selectedOverlay.x}px`,
            top: `${selectedOverlay.y}px`
          }}
        >
          {/* Drag handle */}
          <div className="cursor-move text-[#787b86] p-0.5 hover:text-white" title="Thanh công cụ Fibonacci">
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="w-px h-4 bg-[#2a2e39]" />

          {/* Line width toggle */}
          <button
            onClick={() => {
              const nextWidth = ((selectedOverlay.extendData?.lineWidth || 1) % 3) + 1;
              handleUpdateOverlayConfig({ lineWidth: nextWidth });
            }}
            className="px-1.5 py-0.5 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-white font-mono flex items-center gap-1 transition-colors"
            title="Độ dày đường kẻ"
          >
            <span>—</span>
            <span>{selectedOverlay.extendData?.lineWidth || 1}px</span>
          </button>

          {/* Background fill toggle */}
          <button
            onClick={() => {
              handleUpdateOverlayConfig({ showBackground: !selectedOverlay.extendData?.showBackground });
            }}
            className={`p-1 rounded transition-colors ${
              selectedOverlay.extendData?.showBackground !== false
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
            }`}
            title="Bật/Tắt tô màu nền"
          >
            <Layers className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-[#2a2e39]" />

          {/* Settings Cog button -> Opens Modal */}
          <button
            onClick={() => setIsFibModalOpen(true)}
            className="p-1.5 rounded hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1.5"
            title="Cài đặt thông số số liệu Fibonacci"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Chỉnh số liệu</span>
          </button>

          <div className="w-px h-4 bg-[#2a2e39]" />

          {/* Lock button */}
          <button
            onClick={() => {
              const newLock = !selectedOverlay.lock;
              chartRef.current?.overrideOverlay({ id: selectedOverlay.id, lock: newLock });
              setSelectedOverlay(prev => prev ? { ...prev, lock: newLock } : null);
            }}
            className={`p-1.5 rounded transition-colors ${
              selectedOverlay.lock ? 'text-amber-400 bg-amber-500/10' : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
            }`}
            title={selectedOverlay.lock ? 'Mở khóa' : 'Khóa vị trí'}
          >
            {selectedOverlay.lock ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          {/* Delete button */}
          <button
            onClick={() => {
              chartRef.current?.removeOverlay({ id: selectedOverlay.id });
              setSelectedOverlay(null);
            }}
            className="p-1.5 rounded hover:bg-red-500/20 text-[#787b86] hover:text-red-400 transition-colors"
            title="Xóa Fibonacci này"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Close toolbar */}
          <button
            onClick={() => setSelectedOverlay(null)}
            className="p-1 rounded text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors"
            title="Đóng thanh công cụ"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Fibonacci Settings Modal */}
      <FibonacciSettingsModal
        isOpen={isFibModalOpen}
        onClose={() => setIsFibModalOpen(false)}
        config={selectedOverlay?.extendData || fibConfig}
        onSave={handleSaveFibConfig}
      />

      {/* Chart canvas */}
      <div
        id="market-chart" 
        ref={chartContainerRef}
        className={isSelectingReplayStart ? 'cursor-crosshair' : ''}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Selection Mode Overlay / Indicator */}
      {isSelectingReplayStart && (
        <div className="absolute inset-0 border-4 border-blue-500/30 pointer-events-none rounded transition-all animate-pulse z-10" />
      )}
    </div>
  );
};
