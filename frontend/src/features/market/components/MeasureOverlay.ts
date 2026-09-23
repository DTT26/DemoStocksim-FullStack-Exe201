import type { OverlayTemplate } from 'klinecharts';
import { getChartInstance } from './ChartArea';

export const measureOverlay: OverlayTemplate = {
  name: 'measure',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay, xAxis, yAxis }) => {
    if (!coordinates || coordinates.length < 2) return [];

    const start = coordinates[0];
    const end = coordinates[1];
    if (!start || !end) return [];
    
    const points = overlay?.points || [];

    // Safe retrieval of values, fallback to 0 if axes methods are missing
    let startValue = points[0]?.value;
    if (startValue === undefined && yAxis?.convertFromPixel) {
      startValue = yAxis.convertFromPixel(start.y);
    }
    startValue = startValue || 0;

    let endValue = points[1]?.value;
    if (endValue === undefined && yAxis?.convertFromPixel) {
      endValue = yAxis.convertFromPixel(end.y);
    }
    endValue = endValue || 0;
    
    let startIdx = points[0]?.dataIndex;
    if (startIdx === undefined && xAxis?.convertFromPixel) {
      startIdx = Math.round(xAxis.convertFromPixel(start.x));
    }
    startIdx = startIdx || 0;

    let endIdx = points[1]?.dataIndex;
    if (endIdx === undefined && xAxis?.convertFromPixel) {
      endIdx = Math.round(xAxis.convertFromPixel(end.x));
    }
    endIdx = endIdx || 0;

    // Calculate Price Difference
    const priceDiff = endValue - startValue;
    const priceRatio = startValue ? priceDiff / startValue : 0;
    const percent = (priceRatio * 100).toFixed(2) + '%';
    
    // Ticks (approximated based on precision)
    const safePrecision = 2; // Fixed to 2 to resolve TS error
    const ticks = Math.abs(priceDiff * Math.pow(10, safePrecision)).toFixed(0);
    
    // Calculate Bars Difference
    const barsDiff = Math.abs(endIdx - startIdx);
    
    // Calculate Volume
    const chart = getChartInstance();
    const dataList = chart?.getDataList() || [];
    let totalVolume = 0;
    const minIdx = Math.min(startIdx, endIdx);
    const maxIdx = Math.max(startIdx, endIdx);
    
    for (let i = minIdx; i <= maxIdx; i++) {
      const kline = dataList[i];
      if (kline && typeof kline.volume === 'number') {
        totalVolume += kline.volume;
      }
    }

    const formatVolume = (vol: number) => {
      if (vol === 0) return '0';
      if (vol >= 1000000000) return (vol / 1000000000).toFixed(2) + 'B';
      if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M';
      if (vol >= 1000) return (vol / 1000).toFixed(2) + 'K';
      return vol.toFixed(2);
    };

    // Colors
    const isUp = priceDiff >= 0;
    const areaColor = isUp ? 'rgba(38, 166, 154, 0.2)' : 'rgba(239, 83, 80, 0.2)';
    
    // Format texts
    const sign = priceDiff > 0 ? '+' : '';
    const textLine1 = `${sign}${priceDiff.toFixed(safePrecision)} (${sign}${percent}) ${ticks}`;
    const textLine2 = `${barsDiff} thanh (bars)`;
    const textLine3 = `Khối lượng ${formatVolume(totalVolume)}`;
    
    // Layout calculations
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const topY = Math.min(start.y, end.y);
    
    // Text box layout
    const boxWidth = 200;
    const boxHeight = 75; // Increased height to fit 3 lines
    const boxTop = topY - boxHeight - 10;
    
    const figures = [];

    // 1. Shaded Background Area
    figures.push({
      type: 'polygon',
      attrs: {
        coordinates: [
          { x: start.x, y: start.y },
          { x: end.x, y: start.y },
          { x: end.x, y: end.y },
          { x: start.x, y: end.y }
        ]
      },
      styles: { style: 'fill', color: areaColor },
      ignoreEvent: true
    });

    // 2. Horizontal Cross Line (Arrow)
    figures.push({
      type: 'line',
      attrs: { coordinates: [{ x: start.x, y: centerY }, { x: end.x, y: centerY }] },
      styles: { style: 'solid', color: '#2962FF', size: 1 },
      ignoreEvent: true
    });
    // Horizontal Arrow Head
    const hArrowDir = start.x < end.x ? -1 : 1;
    figures.push({
      type: 'line',
      attrs: { coordinates: [{ x: end.x + hArrowDir * 5, y: centerY - 5 }, { x: end.x, y: centerY }, { x: end.x + hArrowDir * 5, y: centerY + 5 }] },
      styles: { style: 'solid', color: '#2962FF', size: 1 },
      ignoreEvent: true
    });

    // 3. Vertical Cross Line (Arrow)
    figures.push({
      type: 'line',
      attrs: { coordinates: [{ x: centerX, y: start.y }, { x: centerX, y: end.y }] },
      styles: { style: 'solid', color: '#2962FF', size: 1 },
      ignoreEvent: true
    });
    // Vertical Arrow Head (pointing to text box at topY)
    figures.push({
      type: 'line',
      attrs: { coordinates: [{ x: centerX - 5, y: topY + 5 }, { x: centerX, y: topY }, { x: centerX + 5, y: topY + 5 }] },
      styles: { style: 'solid', color: '#2962FF', size: 1 },
      ignoreEvent: true
    });

    // 4. Text Box Background (Blue)
    figures.push({
      type: 'polygon',
      attrs: {
        coordinates: [
          { x: centerX - boxWidth / 2, y: boxTop },
          { x: centerX + boxWidth / 2, y: boxTop },
          { x: centerX + boxWidth / 2, y: boxTop + boxHeight },
          { x: centerX - boxWidth / 2, y: boxTop + boxHeight }
        ]
      },
      styles: { style: 'fill', color: '#2962FF' },
      ignoreEvent: false
    });

    // 5. Text Line 1 (Price)
    figures.push({
      type: 'text',
      attrs: { x: centerX, y: boxTop + 16, text: textLine1, align: 'center', baseline: 'middle' },
      styles: { color: '#ffffff', size: 13, family: 'sans-serif' },
      ignoreEvent: true
    });

    // 6. Text Line 2 (Bars)
    figures.push({
      type: 'text',
      attrs: { x: centerX, y: boxTop + 37, text: textLine2, align: 'center', baseline: 'middle' },
      styles: { color: '#ffffff', size: 13, family: 'sans-serif' },
      ignoreEvent: true
    });

    // 7. Text Line 3 (Volume)
    figures.push({
      type: 'text',
      attrs: { x: centerX, y: boxTop + 58, text: textLine3, align: 'center', baseline: 'middle' },
      styles: { color: '#ffffff', size: 13, family: 'sans-serif' },
      ignoreEvent: true
    });

    return figures;
  }
};
