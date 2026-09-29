import { getChartInstance } from '../components/ChartArea';
import type { Stock } from '../data';

export interface SnapshotOptions {
  theme?: 'dark' | 'light';
  user?: { name?: string; fullName?: string; email?: string } | null;
  selectedStock?: Stock;
  activeTimeframe?: string;
  watermarkText?: string;
}

/**
 * Format date to UTC string like: "Sep 29, 2026 10:08 UTC"
 */
export const formatUtcDateTime = (date: Date = new Date()): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${month} ${day}, ${year} ${hours}:${minutes} UTC`;
};

/**
 * Capture chart snapshot including candles, indicators, axes, drawing overlays (Fibonacci, lines, etc.)
 * and branded attribution header & watermark like Image 3.
 */
export const captureChartSnapshot = async (options: SnapshotOptions = {}): Promise<string> => {
  const chart = getChartInstance();
  if (!chart) {
    throw new Error('Biểu đồ chưa sẵn sàng hoặc chưa được khởi tạo');
  }

  const isDark = options.theme !== 'light';
  const bgColor = isDark ? '#131722' : '#ffffff';

  // 1. Temporarily hide default tooltip legend so it does not conflict with our custom header
  try {
    chart.setStyles({
      candle: {
        tooltip: {
          showRule: 'none'
        }
      },
      indicator: {
        tooltip: {
          showRule: 'none'
        }
      }
    });
  } catch (e) {
    // Ignore if setStyles error
  }

  // KlineCharts built-in picture export with overlays (drawings, Fibonacci, etc.) included
  let rawDataUrl = '';
  try {
    rawDataUrl = chart.getConvertPictureUrl(true, 'png', bgColor);
  } catch (err: any) {
    console.error('Error calling getConvertPictureUrl:', err);
    throw new Error('Không thể xuất ảnh từ biểu đồ: ' + (err?.message || 'Lỗi không xác định'));
  } finally {
    // Restore tooltip legend immediately
    try {
      chart.setStyles({
        candle: {
          tooltip: {
            showRule: 'always'
          }
        },
        indicator: {
          tooltip: {
            showRule: 'always'
          }
        }
      });
    } catch (e) {
      // Ignore
    }
  }

  if (!rawDataUrl || rawDataUrl === 'data:,' || rawDataUrl.length < 100) {
    throw new Error('Ảnh chụp biểu đồ rỗng hoặc không tải được dữ liệu canvas');
  }

  // 2. Load into HTML Image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Lỗi load dữ liệu ảnh biểu đồ'));
    img.src = rawDataUrl;
  });

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const ctx = outCanvas.getContext('2d');
  if (!ctx) {
    return rawDataUrl;
  }

  // Draw the base chart with all candles, overlays, and axes
  ctx.drawImage(img, 0, 0);

  // Determine scale factor for High-DPI screens
  const chartSize = chart.getSize ? chart.getSize() : null;
  const logicalWidth = chartSize?.width || (width > 1200 ? width / 2 : width);
  const logicalHeight = chartSize?.height || (height > 800 ? height / 2 : height);
  const scale = width / logicalWidth;

  ctx.save();
  ctx.scale(scale, scale);

  // 3. Extract Latest Candle & OHLC Data
  let lastClose = options.selectedStock?.price ?? 0;
  let open = lastClose;
  let high = lastClose;
  let low = lastClose;
  let change = options.selectedStock?.change ?? 0;
  let percent = options.selectedStock?.percent ?? 0;

  try {
    const dataList = chart.getDataList?.() || [];
    if (dataList.length > 0) {
      const lastBar = dataList[dataList.length - 1];
      open = lastBar.open ?? open;
      high = lastBar.high ?? high;
      low = lastBar.low ?? low;
      lastClose = lastBar.close ?? lastClose;

      const prevBar = dataList.length > 1 ? dataList[dataList.length - 2] : null;
      if (prevBar) {
        change = lastClose - prevBar.close;
        percent = prevBar.close > 0 ? (change / prevBar.close) * 100 : 0;
      } else {
        change = lastClose - open;
        percent = open > 0 ? (change / open) * 100 : 0;
      }
    }
  } catch (e) {
    // Ignore and fallback to options.selectedStock
  }

  const isUp = change >= 0;
  const colorUp = '#089981';
  const colorDown = '#f23645';
  const valueColor = isUp ? colorUp : colorDown;

  const authorName = options.user?.name || options.user?.fullName || 'StockSim Trader';
  const symbol = options.selectedStock?.symbol || 'BTCUSDT';
  const name = options.selectedStock?.name || symbol;
  const timeframe = options.activeTimeframe || '15m';
  const exchange = options.selectedStock?.exchange || 'STOCKSIM';
  const dateUtcStr = formatUtcDateTime(new Date());

  // 3. Clear default legend area at top left so only our custom branded header is shown
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, Math.min(750, logicalWidth * 0.75), 48);

  // 4. Draw Header Line 1: Author attribution & UTC Timestamp (like Image 3)
  ctx.font = '500 11px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillStyle = isDark ? 'rgba(209, 212, 220, 0.65)' : 'rgba(30, 35, 41, 0.65)';
  ctx.fillText(`${authorName} created with StockSim, ${dateUtcStr}`, 16, 18);

  // 5. Draw Header Line 2: Symbol · Timeframe · Exchange 🟢 O H L C change (like Image 3)
  ctx.font = 'bold 12px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillStyle = isDark ? '#ffffff' : '#131722';
  const symbolPrefix = `${symbol} · ${timeframe} · ${exchange}  `;
  ctx.fillText(symbolPrefix, 16, 36);
  const symbolPrefixWidth = ctx.measureText(symbolPrefix).width;

  // Draw status dot (green or red circle)
  let currX = 16 + symbolPrefixWidth;
  ctx.beginPath();
  ctx.arc(currX + 4, 34, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = valueColor;
  ctx.fill();
  currX += 14;

  // Format precision helper
  const fmt = (v: number) => {
    return v >= 1000 ? v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : v >= 1 ? v.toFixed(2)
      : v.toFixed(4);
  };

  // Draw OHLC labels and values
  ctx.font = '500 11.5px Inter, monospace';
  const ohlcPairs = [
    { label: 'O', val: fmt(open) },
    { label: 'H', val: fmt(high) },
    { label: 'L', val: fmt(low) },
    { label: 'C', val: fmt(lastClose) },
  ];

  ohlcPairs.forEach(item => {
    ctx.fillStyle = isDark ? '#787b86' : '#787b86';
    ctx.fillText(`${item.label} `, currX, 38);
    currX += ctx.measureText(`${item.label} `).width;

    ctx.fillStyle = valueColor;
    ctx.fillText(`${item.val} `, currX, 38);
    currX += ctx.measureText(`${item.val} `).width + 3;
  });

  // Change and percent
  const sign = isUp ? '+' : '';
  const changeStr = `${sign}${fmt(change)} (${sign}${percent.toFixed(2)}%)`;
  ctx.fillStyle = valueColor;
  ctx.fillText(changeStr, currX, 38);

  // 6. Draw Bottom-Left Watermark (⚡ StockSim like "⚡ thefreechart" in Image 3)
  const xAxisHeight = 30;
  const botY = logicalHeight - xAxisHeight - 12;
  ctx.font = 'bold 13px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)';
  ctx.fillText('⚡ StockSim', 16, botY);

  ctx.restore();

  return outCanvas.toDataURL('image/png');
};

/**
 * Trigger file download of the captured snapshot
 */
export const downloadChartSnapshot = (dataUrl: string, symbol: string = 'CHART'): void => {
  const dateStr = new Date().toISOString().slice(0, 10);
  const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '-');
  const filename = `StockSim_${symbol}_${dateStr}_${timeStr}.png`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copy image data directly to clipboard as PNG blob
 */
export const copyChartSnapshotToClipboard = async (dataUrl: string): Promise<boolean> => {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    }
    // Fallback: Copy data URL as text if ClipboardItem is not available
    await navigator.clipboard.writeText(dataUrl);
    return true;
  } catch (err) {
    console.error('Failed to copy snapshot to clipboard:', err);
    throw err;
  }
};

/**
 * Open snapshot image in a new browser tab with clean dark-mode presentation
 */
export const openChartSnapshotInNewTab = (dataUrl: string, symbol: string = 'CHART', isDark: boolean = true): void => {
  const win = window.open();
  if (win) {
    win.document.title = `StockSim - ${symbol} Chart Snapshot`;
    win.document.body.style.margin = '0';
    win.document.body.style.backgroundColor = isDark ? '#131722' : '#f0f3fa';
    win.document.body.style.display = 'flex';
    win.document.body.style.alignItems = 'center';
    win.document.body.style.justifyContent = 'center';
    win.document.body.style.minHeight = '100vh';
    win.document.body.style.padding = '20px';
    win.document.body.style.boxSizing = 'border-box';

    const img = win.document.createElement('img');
    img.src = dataUrl;
    img.alt = `${symbol} Chart Snapshot`;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '92vh';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';
    img.style.objectFit = 'contain';

    win.document.body.appendChild(img);
  }
};
