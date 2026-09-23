import React, { useState, useEffect, useRef } from 'react';
import { init, dispose, registerOverlay } from 'klinecharts';
import type { Chart, KLineData, DataLoaderGetBarsParams, DataLoaderSubscribeBarParams } from 'klinecharts';
import { Settings2, Trash2, Edit2, Type, Minus, MoreHorizontal, Lock, Unlock, GripVertical, LayoutGrid, Pencil, Plus, ChevronRight, Copy, Settings, X, Layers } from 'lucide-react';
import { generateOHLCV, getPricePrecision, timeframeToMs, type Stock } from '../data';
import { fetchBinanceKlines, mapTimeframeToBinance, subscribeBinanceKline } from '../../../services/binanceApi';
import { fetchVnStockKlines } from '../../../services/vnStockApi';
import type { TradeOrder } from '../TradingTerminal';
import type { ChartSettings } from '../chartSettings';
import { INDICATOR_LIST } from './IndicatorModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { OverlaySettingsModal, type OverlaySettings } from './OverlaySettingsModal';
import { emojiMark } from './EmojiOverlay';
import { measureOverlay } from './MeasureOverlay';
import { zoomInOverlay } from './ZoomInOverlay';
import { FibonacciSettingsModal, DEFAULT_FIBONACCI_CONFIG, type FibonacciConfig } from './FibonacciSettingsModal';

const COLOR_PALETTE_GRID = [
  ['#ffffff', '#e0e0e0', '#d6d6d6', '#c2c2c2', '#a8a8a8', '#8f8f8f', '#666666', '#000000'],
  ['#f23645', '#ff9800', '#ffd700', '#089981', '#26a69a', '#2962ff', '#8e7cc3', '#e91e63'],
  ['#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'],
  ['#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4c6e7', '#b4a7d6', '#d5a6bd'],
  ['#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8ea2c6', '#8e7cc3', '#c27ba0'],
  ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#45818e', '#674ea7', '#a64d79'],
  ['#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#1155cc', '#3b23a7', '#881b4b'],
  ['#990000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130']
];

const hexToRgba = (hex: string, alpha: number = 1) => {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return hex;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Global reference for overlays to access chart data
let globalChartInstance: any = null;
export const getChartInstance = () => globalChartInstance;

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
    const figures: any[] = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates } });
    }
    if (coordinates.length >= 3) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[0], coordinates[1], coordinates[2]] }, styles: { style: 'fill', color: 'rgba(33, 150, 243, 0.2)' } });
      const pX = coordinates[0], pA = coordinates[1], pB = coordinates[2];
      const ratioXB = Math.abs((pA.y - pB.y) / (pX.y - pA.y) || 1).toFixed(3);
      figures.push({ type: 'line', attrs: { coordinates: [pX, pB] }, styles: { style: 'dashed', color: '#2196f3' } });
      figures.push({ type: 'text', attrs: { x: (pX.x + pB.x) / 2, y: (pX.y + pB.y) / 2, text: ratioXB }, styles: { color: '#fff', backgroundColor: '#2196f3', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
    }
    if (coordinates.length >= 4) {
      const pA = coordinates[1], pB = coordinates[2], pC = coordinates[3];
      const ratioAC = Math.abs((pB.y - pC.y) / (pA.y - pB.y) || 1).toFixed(3);
      figures.push({ type: 'line', attrs: { coordinates: [pA, pC] }, styles: { style: 'dashed', color: '#2196f3' } });
      figures.push({ type: 'text', attrs: { x: (pA.x + pC.x) / 2, y: (pA.y + pC.y) / 2, text: ratioAC }, styles: { color: '#fff', backgroundColor: '#2196f3', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
    }
    if (coordinates.length >= 5) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[2], coordinates[3], coordinates[4]] }, styles: { style: 'fill', color: 'rgba(33, 150, 243, 0.2)' } });
      const pX = coordinates[0], pA = coordinates[1], pB = coordinates[2], pC = coordinates[3], pD = coordinates[4];
      const ratioBD = Math.abs((pC.y - pD.y) / (pB.y - pC.y) || 1).toFixed(3);
      const ratioXD = Math.abs((pA.y - pD.y) / (pX.y - pA.y) || 1).toFixed(3);
      figures.push({ type: 'line', attrs: { coordinates: [pB, pD] }, styles: { style: 'dashed', color: '#2196f3' } });
      figures.push({ type: 'text', attrs: { x: (pB.x + pD.x) / 2, y: (pB.y + pD.y) / 2, text: ratioBD }, styles: { color: '#fff', backgroundColor: '#2196f3', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
      figures.push({ type: 'line', attrs: { coordinates: [pX, pD] }, styles: { style: 'dashed', color: '#2196f3' } });
      figures.push({ type: 'text', attrs: { x: (pX.x + pD.x) / 2, y: (pX.y + pD.y) / 2, text: ratioXD }, styles: { color: '#fff', backgroundColor: '#2196f3', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
    }
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

// Đăng ký công cụ vẽ ABCD
registerOverlay({
  name: 'abcd',
  totalStep: 5,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates } });
    }
    if (coordinates.length >= 3) {
      const pA = coordinates[0], pB = coordinates[1], pC = coordinates[2];
      const ratioBC = Math.abs((pB.y - pC.y) / (pA.y - pB.y) || 1).toFixed(3);
      figures.push({ type: 'line', attrs: { coordinates: [pA, pC] }, styles: { style: 'dashed', color: '#2196f3' } });
      figures.push({ type: 'text', attrs: { x: (pA.x + pC.x) / 2, y: (pA.y + pC.y) / 2, text: ratioBC }, styles: { color: '#fff', backgroundColor: '#2196f3', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
    }
    if (coordinates.length >= 4) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[0], coordinates[1], coordinates[2], coordinates[3]] }, styles: { style: 'fill', color: 'rgba(33, 150, 243, 0.15)' } });
      const pB = coordinates[1], pC = coordinates[2], pD = coordinates[3];
      const ratioCD = Math.abs((pC.y - pD.y) / (pB.y - pC.y) || 1).toFixed(3);
      figures.push({ type: 'line', attrs: { coordinates: [pB, pD] }, styles: { style: 'dashed', color: '#2196f3' } });
      figures.push({ type: 'text', attrs: { x: (pB.x + pD.x) / 2, y: (pB.y + pD.y) / 2, text: ratioCD }, styles: { color: '#fff', backgroundColor: '#2196f3', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
    }
    const labels = ['A', 'B', 'C', 'D'];
    coordinates.forEach((coord, i) => {
      if (i < 4) {
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

// Đăng ký công cụ vẽ Mô hình Cypher
registerOverlay({
  name: 'cypher',
  totalStep: 6,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates } });
    }
    if (coordinates.length >= 3) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[0], coordinates[1], coordinates[2]] }, styles: { style: 'fill', color: 'rgba(33, 150, 243, 0.2)' } });
      const pX = coordinates[0], pA = coordinates[1], pB = coordinates[2];
      const ratioXB = Math.abs((pA.y - pB.y) / (pX.y - pA.y) || 1).toFixed(3);
      figures.push({ type: 'line', attrs: { coordinates: [pX, pB] }, styles: { style: 'dashed', color: '#2196f3' } });
      figures.push({ type: 'text', attrs: { x: (pX.x + pB.x) / 2, y: (pX.y + pB.y) / 2, text: ratioXB }, styles: { color: '#fff', backgroundColor: '#2196f3', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
    }
    if (coordinates.length >= 4) {
      const pA = coordinates[1], pB = coordinates[2], pC = coordinates[3];
      const ratioAC = Math.abs((pB.y - pC.y) / (pA.y - pB.y) || 1).toFixed(3);
      figures.push({ type: 'line', attrs: { coordinates: [pA, pC] }, styles: { style: 'dashed', color: '#2196f3' } });
      figures.push({ type: 'text', attrs: { x: (pA.x + pC.x) / 2, y: (pA.y + pC.y) / 2, text: ratioAC }, styles: { color: '#fff', backgroundColor: '#2196f3', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
    }
    if (coordinates.length >= 5) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[2], coordinates[3], coordinates[4]] }, styles: { style: 'fill', color: 'rgba(33, 150, 243, 0.2)' } });
      const pX = coordinates[0], pA = coordinates[1], pB = coordinates[2], pC = coordinates[3], pD = coordinates[4];
      const ratioBD = Math.abs((pC.y - pD.y) / (pB.y - pC.y) || 1).toFixed(3);
      const ratioXD = Math.abs((pA.y - pD.y) / (pX.y - pA.y) || 1).toFixed(3);
      figures.push({ type: 'line', attrs: { coordinates: [pB, pD] }, styles: { style: 'dashed', color: '#2196f3' } });
      figures.push({ type: 'text', attrs: { x: (pB.x + pD.x) / 2, y: (pB.y + pD.y) / 2, text: ratioBD }, styles: { color: '#fff', backgroundColor: '#2196f3', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
      figures.push({ type: 'line', attrs: { coordinates: [pX, pD] }, styles: { style: 'dashed', color: '#2196f3' } });
      figures.push({ type: 'text', attrs: { x: (pX.x + pD.x) / 2, y: (pX.y + pD.y) / 2, text: ratioXD }, styles: { color: '#fff', backgroundColor: '#2196f3', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
    }
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

// Đăng ký công cụ vẽ Mô hình Three Drives
registerOverlay({
  name: 'threeDrives',
  totalStep: 6,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#673ab7' } });
    }
    if (coordinates.length >= 3) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[0], coordinates[1], coordinates[2]] }, styles: { style: 'fill', color: 'rgba(103, 58, 183, 0.2)' } });
      const p0 = coordinates[0], p1 = coordinates[1], p2 = coordinates[2];
      const ratio = Math.abs((p1.y - p2.y) / (p0.y - p1.y) || 1).toFixed(3);
      figures.push({ type: 'line', attrs: { coordinates: [p0, p2] }, styles: { style: 'dashed', color: '#673ab7' } });
      figures.push({ type: 'text', attrs: { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2, text: ratio }, styles: { color: '#fff', backgroundColor: '#673ab7', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
    }
    if (coordinates.length >= 5) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[2], coordinates[3], coordinates[4]] }, styles: { style: 'fill', color: 'rgba(103, 58, 183, 0.2)' } });
      const p2 = coordinates[2], p3 = coordinates[3], p4 = coordinates[4];
      const ratio = Math.abs((p3.y - p4.y) / (p2.y - p3.y) || 1).toFixed(3);
      figures.push({ type: 'line', attrs: { coordinates: [p2, p4] }, styles: { style: 'dashed', color: '#673ab7' } });
      figures.push({ type: 'text', attrs: { x: (p2.x + p4.x) / 2, y: (p2.y + p4.y) / 2, text: ratio }, styles: { color: '#fff', backgroundColor: '#673ab7', borderRadius: 4, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 } });
    }
    return figures;
  }
});

// Đăng ký công cụ vẽ Vai Đầu Vai (Head and Shoulders)
registerOverlay({
  name: 'headAndShoulders',
  totalStep: 8,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#4caf50' } });
    }
    if (coordinates.length >= 3) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[0], coordinates[1], coordinates[2]] }, styles: { style: 'fill', color: 'rgba(76, 175, 80, 0.2)' } });
    }
    if (coordinates.length >= 5) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[2], coordinates[3], coordinates[4]] }, styles: { style: 'fill', color: 'rgba(76, 175, 80, 0.2)' } });
    }
    if (coordinates.length >= 7) {
      figures.push({ type: 'polygon', attrs: { coordinates: [coordinates[4], coordinates[5], coordinates[6]] }, styles: { style: 'fill', color: 'rgba(76, 175, 80, 0.2)' } });
    }

    // Thêm Text Labels
    if (coordinates[0]) {
      figures.push({ type: 'text', attrs: { x: coordinates[0].x, y: coordinates[0].y - 30, text: 'Vai trái' }, styles: { color: '#fff', backgroundColor: '#4caf50', borderRadius: 4, paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4 } });
      figures.push({ type: 'line', attrs: { coordinates: [coordinates[0], { x: coordinates[0].x, y: coordinates[0].y - 20 }] }, styles: { color: '#4caf50' } });
    }
    if (coordinates[2]) {
      figures.push({ type: 'text', attrs: { x: coordinates[2].x, y: coordinates[2].y - 30, text: 'Đầu' }, styles: { color: '#fff', backgroundColor: '#4caf50', borderRadius: 4, paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4 } });
      figures.push({ type: 'line', attrs: { coordinates: [coordinates[2], { x: coordinates[2].x, y: coordinates[2].y - 20 }] }, styles: { color: '#4caf50' } });
    }
    if (coordinates[4]) {
      figures.push({ type: 'text', attrs: { x: coordinates[4].x, y: coordinates[4].y - 30, text: 'Vai Phải' }, styles: { color: '#fff', backgroundColor: '#4caf50', borderRadius: 4, paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4 } });
      figures.push({ type: 'line', attrs: { coordinates: [coordinates[4], { x: coordinates[4].x, y: coordinates[4].y - 20 }] }, styles: { color: '#4caf50' } });
    }

    return figures;
  }
});

// Đường dẫn (path)
registerOverlay({
  name: 'path',
  totalStep: 0,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    return [
      {
        type: 'line',
        attrs: { coordinates },
        styles: { color: '#2962ff', size: 2 }
      }
    ];
  }
});

// Hình chữ nhật xoay (rotatedRect)
registerOverlay({
  name: 'rotatedRect',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) return [];
    if (coordinates.length === 2) {
      return [{ type: 'line', attrs: { coordinates }, styles: { color: '#2962ff' } }];
    }
    const p1 = coordinates[0];
    const p2 = coordinates[1];
    const p3 = coordinates[2];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const proj = (p3.x - p1.x) * nx + (p3.y - p1.y) * ny;
    const hx = nx * proj;
    const hy = ny * proj;

    return [
      {
        type: 'polygon',
        attrs: {
          coordinates: [
            p1,
            p2,
            { x: p2.x + hx, y: p2.y + hy },
            { x: p1.x + hx, y: p1.y + hy }
          ]
        },
        styles: { style: 'stroke_fill', color: 'rgba(41, 98, 255, 0.2)', borderColor: '#2962ff' }
      }
    ];
  }
});

// Hình elip (ellipse)
registerOverlay({
  name: 'ellipse',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) return [];
    const p1 = coordinates[0];
    const p2 = coordinates[1];

    const rx = Math.abs(p2.x - p1.x) / 2;
    const ry = Math.abs(p2.y - p1.y) / 2;
    const cx = (p1.x + p2.x) / 2;
    const cy = (p1.y + p2.y) / 2;
    const points = [];
    for (let i = 0; i <= 36; i++) {
      const angle = (i * 10 * Math.PI) / 180;
      points.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) });
    }

    return [
      {
        type: 'polygon',
        attrs: { coordinates: points },
        styles: { style: 'stroke_fill', color: 'rgba(244, 67, 54, 0.2)', borderColor: '#f44336' }
      }
    ];
  }
});

// Vòng tròn (circleMark)
registerOverlay({
  name: 'circleMark',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) return [];
    const p1 = coordinates[0];
    const p2 = coordinates[1];
    const r = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    return [
      {
        type: 'circle',
        attrs: { x: p1.x, y: p1.y, r },
        styles: { style: 'stroke_fill', color: 'rgba(255, 152, 0, 0.2)', borderColor: '#ff9800' }
      }
    ];
  }
});

// Hình vòng cung (arc)
registerOverlay({
  name: 'arc',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) return [];
    if (coordinates.length === 2) return [{ type: 'line', attrs: { coordinates }, styles: { color: '#2962ff' } }];
    const p1 = coordinates[0];
    const p2 = coordinates[2];
    const p3 = coordinates[1];
    const points = [];
    for (let t = 0; t <= 1; t += 0.05) {
      const x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * p3.x + t * t * p2.x;
      const y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * p3.y + t * t * p2.y;
      points.push({ x, y });
    }
    return [{ type: 'line', attrs: { coordinates: points }, styles: { color: '#2962ff', size: 2 } }];
  }
});

// Đường cong (curve) - Quadratic Bezier
registerOverlay({
  name: 'curve',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) return [];
    if (coordinates.length === 2) return [{ type: 'line', attrs: { coordinates }, styles: { color: '#2962ff' } }];
    const p1 = coordinates[0];
    const p2 = coordinates[2];
    const p3 = coordinates[1];
    const points = [];
    for (let t = 0; t <= 1; t += 0.05) {
      const x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * p3.x + t * t * p2.x;
      const y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * p3.y + t * t * p2.y;
      points.push({ x, y });
    }
    return [{ type: 'line', attrs: { coordinates: points }, styles: { color: '#2962ff', size: 2 } }];
  }
});

// Đường cong đôi (doubleCurve) - Cubic Bezier
registerOverlay({
  name: 'doubleCurve',
  totalStep: 5,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) return [];
    if (coordinates.length < 4) return [{ type: 'line', attrs: { coordinates }, styles: { color: '#2962ff' } }];
    const p1 = coordinates[0];
    const p2 = coordinates[3];
    const p3 = coordinates[1];
    const p4 = coordinates[2];
    const points = [];
    for (let t = 0; t <= 1; t += 0.05) {
      const mt = 1 - t;
      const x = mt * mt * mt * p1.x + 3 * mt * mt * t * p3.x + 3 * mt * t * t * p4.x + t * t * t * p2.x;
      const y = mt * mt * mt * p1.y + 3 * mt * mt * t * p3.y + 3 * mt * t * t * p4.y + t * t * t * p2.y;
      points.push({ x, y });
    }
    return [{ type: 'line', attrs: { coordinates: points }, styles: { color: '#2962ff', size: 2 } }];
  }
});

// Đăng ký Tam giác
registerOverlay({
  name: 'triangle',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates } });
    }
    if (coordinates.length >= 3) {
      figures.push({
        type: 'polygon',
        attrs: { coordinates: [coordinates[0], coordinates[1], coordinates[2]] },
        styles: { style: 'stroke_fill', color: 'rgba(33, 150, 243, 0.2)', borderColor: '#2196f3' }
      });
    }
    return figures;
  }
});

// Đăng ký Sóng Elliott Impulse (12345)
registerOverlay({
  name: 'elliottImpulse',
  totalStep: 6,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#2962ff', size: 2 } });
    }
    const labels = ['(0)', '(1)', '(2)', '(3)', '(4)', '(5)'];
    coordinates.forEach((coord, i) => {
      if (i < 6) {
        figures.push({
          type: 'text',
          attrs: { x: coord.x, y: coord.y, text: labels[i] },
          styles: { color: '#ffffff', backgroundColor: '#9c27b0', paddingLeft: 6, paddingRight: 6, paddingTop: 3, paddingBottom: 3, borderRadius: 4 }
        });
      }
    });
    return figures;
  }
});

// Đăng ký Sóng Elliott Triangle (ABC)
registerOverlay({
  name: 'elliottTriangle',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#2962ff', size: 2 } });
    }
    const labels = ['(0)', '(A)', '(B)', '(C)'];
    coordinates.forEach((coord, i) => {
      if (i < 4) {
        figures.push({
          type: 'text',
          attrs: { x: coord.x, y: coord.y, text: labels[i] },
          styles: { color: '#ffffff', backgroundColor: '#9c27b0', paddingLeft: 6, paddingRight: 6, paddingTop: 3, paddingBottom: 3, borderRadius: 4 }
        });
      }
    });
    return figures;
  }
});

// Đăng ký Sóng Elliott Triple Combo (WXYXZ)
registerOverlay({
  name: 'elliottTriple',
  totalStep: 6,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#2962ff', size: 2 } });
    }
    const labels = ['(0)', '(W)', '(X)', '(Y)', '(X)', '(Z)'];
    coordinates.forEach((coord, i) => {
      if (i < 6) {
        figures.push({
          type: 'text',
          attrs: { x: coord.x, y: coord.y, text: labels[i] },
          styles: { color: '#ffffff', backgroundColor: '#9c27b0', paddingLeft: 6, paddingRight: 6, paddingTop: 3, paddingBottom: 3, borderRadius: 4 }
        });
      }
    });
    return figures;
  }
});

// Đăng ký Sóng Elliott Tam giác (ABCDE)
registerOverlay({
  name: 'elliottABCDE',
  totalStep: 6,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#2962ff', size: 2 } });
    }
    const labels = ['(0)', '(A)', '(B)', '(C)', '(D)', '(E)'];
    coordinates.forEach((coord, i) => {
      if (i < 6) {
        figures.push({
          type: 'text',
          attrs: { x: coord.x, y: coord.y, text: labels[i] },
          styles: { color: '#ffffff', backgroundColor: '#9c27b0', paddingLeft: 6, paddingRight: 6, paddingTop: 3, paddingBottom: 3, borderRadius: 4 }
        });
      }
    });
    return figures;
  }
});

// Đăng ký Sóng đôi kết hợp Elliott (WXY)
registerOverlay({
  name: 'elliottWXY',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length > 1) {
      figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#2962ff', size: 2 } });
    }
    const labels = ['(0)', '(W)', '(X)', '(Y)'];
    coordinates.forEach((coord, i) => {
      if (i < 4) {
        figures.push({
          type: 'text',
          attrs: { x: coord.x, y: coord.y, text: labels[i] },
          styles: { color: '#ffffff', backgroundColor: '#9c27b0', paddingLeft: 6, paddingRight: 6, paddingTop: 3, paddingBottom: 3, borderRadius: 4 }
        });
      }
    });
    return figures;
  }
});

// Đăng ký Các đường chu kỳ (cycleLines) - Screenshot 2
registerOverlay({
  name: 'cycleLines',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length >= 2) {
      const p1 = coordinates[0];
      const p2 = coordinates[1];

      // Connecting dashed line between p1 and p2
      figures.push({
        type: 'line',
        attrs: { coordinates: [p1, p2] },
        styles: { color: '#2196f3', size: 1, style: 'dashed', dashedValue: [4, 4] }
      });

      const rawDx = Math.abs(p2.x - p1.x);
      const intervalX = rawDx > 25 ? rawDx : 120;
      const startX = p1.x;
      const canvasHeight = 2500;

      // Draw repeating vertical cyan lines (Screenshot 2)
      for (let k = -20; k <= 30; k++) {
        const vx = startX + k * intervalX;
        figures.push({
          type: 'line',
          attrs: { coordinates: [{ x: vx, y: 0 }, { x: vx, y: canvasHeight }] },
          styles: { color: '#2196f3', size: 2 }
        });
      }

      // Blue handle circles
      figures.push({ type: 'circle', attrs: { x: p1.x, y: p1.y, r: 5 }, styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 } });
      figures.push({ type: 'circle', attrs: { x: p2.x, y: p2.y, r: 5 }, styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 } });
    }
    return figures;
  }
});

// Đăng ký Vòng thời gian (timeCycles) - Screenshot 3
registerOverlay({
  name: 'timeCycles',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length >= 2) {
      const p1 = coordinates[0];
      const p2 = coordinates[1];

      const rawDx = Math.abs(p2.x - p1.x);
      const intervalX = rawDx > 25 ? rawDx : 120;
      const baselineY = Math.max(p1.y, p2.y) + 20;
      const startX = Math.min(p1.x, p2.x);

      // Render repeating green semicircles (Screenshot 3)
      for (let k = -15; k <= 25; k++) {
        const segStartX = startX + k * intervalX;
        const arcCoords: { x: number; y: number }[] = [];
        const steps = 24;

        for (let i = 0; i <= steps; i++) {
          const theta = Math.PI * (1 - i / steps);
          const x = segStartX + (intervalX / 2) * (1 - Math.cos(theta));
          const y = baselineY - (intervalX / 2) * Math.sin(theta);
          arcCoords.push({ x, y });
        }

        figures.push({
          type: 'polygon',
          attrs: { coordinates: arcCoords },
          styles: { style: 'stroke_fill', color: 'rgba(76, 175, 80, 0.25)', borderColor: '#4caf50', borderSize: 2 }
        });
      }

      // Blue handle circles
      figures.push({ type: 'circle', attrs: { x: p1.x, y: p1.y, r: 5 }, styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 } });
      figures.push({ type: 'circle', attrs: { x: p2.x, y: p2.y, r: 5 }, styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 } });
    }
    return figures;
  }
});

// Đăng ký Đường Sine (sineLine) - Screenshots 2 & 3
registerOverlay({
  name: 'sineLine',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const figures: any[] = [];
    if (coordinates.length >= 2) {
      const p1 = coordinates[0];
      const p2 = coordinates[1];

      // Use a natural half-period if points are vertically stacked or very close in X
      const rawDx = Math.abs(p2.x - p1.x);
      const halfPeriod = rawDx > 25 ? rawDx : 140;
      const fullPeriod = halfPeriod * 2;

      const amp = Math.abs(p2.y - p1.y) / 2 || 60;
      const midY = (p1.y + p2.y) / 2;

      const sineCoords: { x: number; y: number }[] = [];
      const startX = p1.x - fullPeriod * 8;
      const endX = p1.x + fullPeriod * 12;
      const stepX = 2; // Ultra-smooth 2px step sampling to eliminate sawtooth angles

      for (let x = startX; x <= endX; x += stepX) {
        // cosine wave so peak sits at p1.x, trough at p1.x + halfPeriod
        const phase = (Math.PI * (x - p1.x)) / halfPeriod;
        const y = midY - amp * Math.cos(phase);
        sineCoords.push({ x, y });
      }

      // Smooth green sine curve (TradingView style)
      figures.push({
        type: 'line',
        attrs: { coordinates: sineCoords },
        styles: { color: '#089981', size: 3 }
      });

      // Blue handle circles at peak p1 and trough p2
      figures.push({ type: 'circle', attrs: { x: p1.x, y: p1.y, r: 6 }, styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 } });
      figures.push({ type: 'circle', attrs: { x: p2.x, y: p2.y, r: 6 }, styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 } });
    }
    return figures;
  }
});

// Đăng ký Long Position (Thế giá lên)
registerOverlay({
  name: 'longPosition',
  totalStep: 2,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, yAxis }: any) => {
    const figures: any[] = [];
    if (coordinates.length >= 2) {
      const entry = coordinates[0];
      const target = coordinates[1];
      const sl = coordinates[2] || { x: target.x, y: entry.y + (entry.y - target.y) };

      const minX = Math.min(entry.x, target.x);
      const maxX = Math.max(entry.x, target.x) + 140;
      const midX = (minX + maxX) / 2;

      // Prices & Calculations
      const entryPrice = yAxis?.convertFromPixel ? yAxis.convertFromPixel(entry.y) : 0;
      const targetPrice = yAxis?.convertFromPixel ? yAxis.convertFromPixel(target.y) : 0;
      const stopPrice = yAxis?.convertFromPixel ? yAxis.convertFromPixel(sl.y) : 0;

      const targetDiff = Math.abs(targetPrice - entryPrice);
      const targetPct = entryPrice ? (targetDiff / entryPrice) * 100 : 0;
      const targetVal = Math.round(targetDiff * 100);
      const targetAmount = Math.round(targetDiff * 10);

      const stopDiff = Math.abs(entryPrice - stopPrice);
      const stopPct = entryPrice ? (stopDiff / entryPrice) * 100 : 0;
      const stopVal = Math.round(stopDiff * 100);
      const stopAmount = Math.round(stopDiff * 10);

      const rrRatio = stopDiff > 0 ? (targetDiff / stopDiff) : 1;

      // 1. Green profit zone
      figures.push({
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: minX, y: entry.y },
            { x: maxX, y: entry.y },
            { x: maxX, y: target.y },
            { x: minX, y: target.y }
          ]
        },
        styles: { style: 'stroke_fill', color: 'rgba(8, 153, 129, 0.25)', borderColor: '#089981' }
      });

      // 2. Red stop loss zone
      figures.push({
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: minX, y: entry.y },
            { x: maxX, y: entry.y },
            { x: maxX, y: sl.y },
            { x: minX, y: sl.y }
          ]
        },
        styles: { style: 'stroke_fill', color: 'rgba(242, 54, 69, 0.25)', borderColor: '#f23645' }
      });

      // 3. Entry line
      figures.push({
        type: 'line',
        attrs: { coordinates: [{ x: minX, y: entry.y }, { x: maxX, y: entry.y }] },
        styles: { color: '#2196f3', size: 2 }
      });

      // 4. Target Badge (Top Green Box - Screenshot 1)
      figures.push({
        type: 'text',
        attrs: {
          x: midX,
          y: Math.min(entry.y, target.y) - 10,
          text: `Mục tiêu: ${targetDiff.toFixed(2)} (${targetPct.toFixed(2)}%) ${targetVal.toLocaleString()}, Số tiền: ${targetAmount}`,
          align: 'center',
          baseline: 'bottom'
        },
        styles: {
          color: '#ffffff',
          size: 12,
          weight: 'bold',
          backgroundColor: '#089981',
          paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4,
          borderRadius: 12
        }
      });

      // 5. Center PnL & Risk/Reward Card (Middle Red Badge - Screenshot 1)
      figures.push({
        type: 'text',
        attrs: {
          x: midX,
          y: entry.y,
          text: `Mở Lợi nhuận & Thua lỗ: -${stopDiff.toFixed(2)}, S.Lg: 0\nTỷ lệ Rủi ro/Lợi nhuận: ${rrRatio.toFixed(2)}`,
          align: 'center',
          baseline: 'middle'
        },
        styles: {
          color: '#ffffff',
          size: 12,
          weight: 'bold',
          backgroundColor: '#f23645',
          paddingLeft: 10, paddingRight: 10, paddingTop: 6, paddingBottom: 6,
          borderRadius: 14
        }
      });

      // 6. Stop Loss Badge (Bottom Red Box - Screenshot 1)
      figures.push({
        type: 'text',
        attrs: {
          x: midX,
          y: Math.max(entry.y, sl.y) + 10,
          text: `Dừng: ${stopDiff.toFixed(2)} (${stopPct.toFixed(2)}%) ${stopVal.toLocaleString()}, Số tiền: ${stopAmount}`,
          align: 'center',
          baseline: 'top'
        },
        styles: {
          color: '#ffffff',
          size: 12,
          weight: 'bold',
          backgroundColor: '#f23645',
          paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4,
          borderRadius: 12
        }
      });
    }
    return figures;
  }
});

// Đăng ký Short Position (Thế giá xuống)
registerOverlay({
  name: 'shortPosition',
  totalStep: 2,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, yAxis }: any) => {
    const figures: any[] = [];
    if (coordinates.length >= 2) {
      const entry = coordinates[0];
      const target = coordinates[1];
      const sl = coordinates[2] || { x: target.x, y: entry.y - (target.y - entry.y) };

      const minX = Math.min(entry.x, target.x);
      const maxX = Math.max(entry.x, target.x) + 140;
      const midX = (minX + maxX) / 2;

      // Prices & Calculations
      const entryPrice = yAxis?.convertFromPixel ? yAxis.convertFromPixel(entry.y) : 0;
      const targetPrice = yAxis?.convertFromPixel ? yAxis.convertFromPixel(target.y) : 0;
      const stopPrice = yAxis?.convertFromPixel ? yAxis.convertFromPixel(sl.y) : 0;

      const targetDiff = Math.abs(entryPrice - targetPrice);
      const targetPct = entryPrice ? (targetDiff / entryPrice) * 100 : 0;
      const targetVal = Math.round(targetDiff * 100);
      const targetAmount = Math.round(targetDiff * 10);

      const stopDiff = Math.abs(stopPrice - entryPrice);
      const stopPct = entryPrice ? (stopDiff / entryPrice) * 100 : 0;
      const stopVal = Math.round(stopDiff * 100);
      const stopAmount = Math.round(stopDiff * 10);

      const rrRatio = stopDiff > 0 ? (targetDiff / stopDiff) : 1;

      // 1. Red stop loss zone (above)
      figures.push({
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: minX, y: entry.y },
            { x: maxX, y: entry.y },
            { x: maxX, y: sl.y },
            { x: minX, y: sl.y }
          ]
        },
        styles: { style: 'stroke_fill', color: 'rgba(242, 54, 69, 0.25)', borderColor: '#f23645' }
      });

      // 2. Green profit zone (below)
      figures.push({
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: minX, y: entry.y },
            { x: maxX, y: entry.y },
            { x: maxX, y: target.y },
            { x: minX, y: target.y }
          ]
        },
        styles: { style: 'stroke_fill', color: 'rgba(8, 153, 129, 0.25)', borderColor: '#089981' }
      });

      // 3. Entry line
      figures.push({
        type: 'line',
        attrs: { coordinates: [{ x: minX, y: entry.y }, { x: maxX, y: entry.y }] },
        styles: { color: '#2196f3', size: 2 }
      });

      // 4. Stop Loss Badge (Top Red Box - Screenshot 2)
      figures.push({
        type: 'text',
        attrs: {
          x: midX,
          y: Math.min(entry.y, sl.y) - 10,
          text: `Dừng: ${stopDiff.toFixed(2)} (${stopPct.toFixed(2)}%) ${stopVal.toLocaleString()}, Số tiền: ${stopAmount}`,
          align: 'center',
          baseline: 'bottom'
        },
        styles: {
          color: '#ffffff',
          size: 12,
          weight: 'bold',
          backgroundColor: '#f23645',
          paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4,
          borderRadius: 12
        }
      });

      // 5. Center PnL & Risk/Reward Card (Middle Red Badge - Screenshot 2)
      figures.push({
        type: 'text',
        attrs: {
          x: midX,
          y: entry.y,
          text: `Đóng Lợi nhuận & Thua lỗ: -${stopDiff.toFixed(2)}, S.Lg: 0\nTỷ lệ Rủi ro/Lợi nhuận: ${rrRatio.toFixed(2)}`,
          align: 'center',
          baseline: 'middle'
        },
        styles: {
          color: '#ffffff',
          size: 12,
          weight: 'bold',
          backgroundColor: '#f23645',
          paddingLeft: 10, paddingRight: 10, paddingTop: 6, paddingBottom: 6,
          borderRadius: 14
        }
      });

      // 6. Target Badge (Bottom Green Box - Screenshot 2)
      figures.push({
        type: 'text',
        attrs: {
          x: midX,
          y: Math.max(entry.y, target.y) + 10,
          text: `Mục tiêu: ${targetDiff.toFixed(2)} (${targetPct.toFixed(2)}%) ${targetVal.toLocaleString()}, Số tiền: ${targetAmount}`,
          align: 'center',
          baseline: 'top'
        },
        styles: {
          color: '#ffffff',
          size: 12,
          weight: 'bold',
          backgroundColor: '#089981',
          paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4,
          borderRadius: 12
        }
      });
    }
    return figures;
  }
});

// Đăng ký Dự đoán (forecast) - Screenshot 3
registerOverlay({
  name: 'forecast',
  totalStep: 2,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, xAxis, yAxis, kLineDataList }: any) => {
    const figures: any[] = [];
    if (coordinates.length >= 2) {
      const p1 = coordinates[0];
      const p2 = coordinates[1];

      // 1. Prediction Connecting Line (Blue)
      figures.push({
        type: 'line',
        attrs: { coordinates: [p1, p2] },
        styles: { color: '#2962ff', size: 3 }
      });

      // Prices & Calculations
      const val1 = yAxis?.convertFromPixel ? yAxis.convertFromPixel(p1.y) : 0;
      const val2 = yAxis?.convertFromPixel ? yAxis.convertFromPixel(p2.y) : 0;
      const diff = val2 - val1;
      const pct = val1 !== 0 ? (diff / val1) * 100 : 0;

      // Time calculation
      const idx1 = xAxis?.convertFromPixel ? Math.round(xAxis.convertFromPixel(p1.x)) : 0;
      const idx2 = xAxis?.convertFromPixel ? Math.round(xAxis.convertFromPixel(p2.x)) : 0;
      let timeText = '0n 0g 0p';
      let date1Str = '';
      let date2Str = '';

      if (kLineDataList && kLineDataList[idx1]) {
        const d1 = new Date(kLineDataList[idx1].timestamp);
        date1Str = `${d1.getFullYear()}-${String(d1.getMonth() + 1).padStart(2, '0')}-${String(d1.getDate()).padStart(2, '0')} ${String(d1.getHours()).padStart(2, '0')}:${String(d1.getMinutes()).padStart(2, '0')}`;
      }
      if (kLineDataList && kLineDataList[idx2]) {
        const d2 = new Date(kLineDataList[idx2].timestamp);
        date2Str = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}-${String(d2.getDate()).padStart(2, '0')} ${String(d2.getHours()).padStart(2, '0')}:${String(d2.getMinutes()).padStart(2, '0')}`;
      }

      if (kLineDataList && kLineDataList[idx1] && kLineDataList[idx2]) {
        const diffMs = Math.abs(kLineDataList[idx2].timestamp - kLineDataList[idx1].timestamp);
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        timeText = `${days}n ${hours}g ${mins}p`;
      } else {
        const barCount = Math.abs(idx2 - idx1) || 1;
        timeText = `${Math.floor(barCount / 96)}n ${Math.floor((barCount % 96) / 4)}g 0p`;
      }

      const diffStr = (diff >= 0 ? '+' : '') + diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const pctStr = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';

      // 2. Start Badge (Blue badge at p1)
      figures.push({
        type: 'text',
        attrs: {
          x: p1.x,
          y: p1.y - 10,
          text: `${val1.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n${date1Str}`,
          align: 'center',
          baseline: 'bottom'
        },
        styles: {
          color: '#ffffff',
          size: 12,
          weight: 'bold',
          backgroundColor: '#2962ff',
          paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4,
          borderRadius: 8
        }
      });

      // 3. End Info Badge (Blue box at p2)
      figures.push({
        type: 'text',
        attrs: {
          x: p2.x,
          y: p2.y + 10,
          text: `${diffStr} (${pctStr}) trong ${timeText}\n${val2.toLocaleString(undefined, { minimumFractionDigits: 2 })} 🕒 ${date2Str}`,
          align: 'center',
          baseline: 'top'
        },
        styles: {
          color: '#ffffff',
          size: 12,
          weight: 'bold',
          backgroundColor: '#2962ff',
          paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4,
          borderRadius: 8
        }
      });

      // 4. Status Badge (Red THẤT BẠI or Green THÀNH CÔNG - Screenshot 3)
      const latestPrice = kLineDataList?.[kLineDataList.length - 1]?.close ?? val2;
      const isSuccess = (diff >= 0 && latestPrice >= val1) || (diff < 0 && latestPrice <= val1);

      figures.push({
        type: 'text',
        attrs: {
          x: p2.x,
          y: p2.y + 58,
          text: isSuccess ? ':) THÀNH CÔNG' : ':( THẤT BẠI',
          align: 'center',
          baseline: 'top'
        },
        styles: {
          color: '#ffffff',
          size: 13,
          weight: 'bold',
          backgroundColor: isSuccess ? '#089981' : '#f23645',
          paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4,
          borderRadius: 6
        }
      });
    }
    return figures;
  }
});

// Đăng ký Mẫu hình thanh (barsPattern) - Screenshot 4
registerOverlay({
  name: 'barsPattern',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, points, kLineDataList }: any) => {
    const figures: any[] = [];
    if (coordinates.length >= 2) {
      const p1 = coordinates[0];
      const p2 = coordinates[1];
      const p3 = coordinates[2] || p1;

      const idx1 = points[0]?.dataIndex ?? 0;
      const idx2 = points[1]?.dataIndex ?? (idx1 + 10);
      const minIdx = Math.min(idx1, idx2);
      const maxIdx = Math.max(idx1, idx2);

      const pathCoords: { x: number; y: number }[] = [];
      const candleBars = kLineDataList ? kLineDataList.slice(minIdx, maxIdx + 1) : [];

      if (candleBars.length > 1) {
        const count = candleBars.length;
        const totalX = p2.x - p1.x;
        const startY = p3 ? p3.y : p1.y;
        const baseVal = candleBars[0]?.close || 1;

        candleBars.forEach((bar: any, index: number) => {
          const ratioX = index / (count - 1);
          const x = (p3 ? p3.x : p1.x) + ratioX * totalX;
          const ratioY = (bar.close - baseVal) / baseVal;
          const y = startY - ratioY * 300;
          pathCoords.push({ x, y });
        });

        // Pixelated / Thick Blue Line (Image 4)
        figures.push({
          type: 'line',
          attrs: { coordinates: pathCoords },
          styles: { color: '#2962ff', size: 4 }
        });

        pathCoords.forEach((pt, i) => {
          if (i === 0 || i === pathCoords.length - 1 || i % Math.max(1, Math.ceil(pathCoords.length / 5)) === 0) {
            figures.push({
              type: 'circle',
              attrs: { x: pt.x, y: pt.y, r: 4 },
              styles: { style: 'fill', color: '#2962ff' }
            });
          }
        });
      } else {
        figures.push({
          type: 'line',
          attrs: { coordinates: [p1, p2] },
          styles: { color: '#2962ff', size: 3 }
        });
      }
    }
    return figures;
  }
});

// Đăng ký Mô hình Ghost (ghostFeed) - Screenshot 5
registerOverlay({
  name: 'ghostFeed',
  totalStep: 6,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }: any) => {
    const figures: any[] = [];
    if (coordinates.length >= 2) {
      // Connect points with dotted grey trendlines
      figures.push({
        type: 'line',
        attrs: { coordinates },
        styles: { color: '#787b86', size: 2, style: 'dashed', dashedValue: [4, 4] }
      });

      // Draw ghost mini candles / bars along each segment
      for (let i = 0; i < coordinates.length - 1; i++) {
        const pA = coordinates[i];
        const pB = coordinates[i + 1];
        const steps = 6;
        for (let s = 1; s < steps; s++) {
          const ratio = s / steps;
          const cx = pA.x + (pB.x - pA.x) * ratio;
          const cy = pA.y + (pB.y - pA.y) * ratio;
          const wickHeight = 12 + (s % 3) * 4;
          const isUp = s % 2 === 0;

          // Ghost Wick
          figures.push({
            type: 'line',
            attrs: { coordinates: [{ x: cx, y: cy - wickHeight }, { x: cx, y: cy + wickHeight }] },
            styles: { color: isUp ? 'rgba(8, 153, 129, 0.4)' : 'rgba(242, 54, 69, 0.4)', size: 1 }
          });

          // Ghost Body
          const bodyH = 8 + (s % 2) * 6;
          figures.push({
            type: 'polygon',
            attrs: {
              coordinates: [
                { x: cx - 4, y: cy - bodyH / 2 },
                { x: cx + 4, y: cy - bodyH / 2 },
                { x: cx + 4, y: cy + bodyH / 2 },
                { x: cx - 4, y: cy + bodyH / 2 }
              ]
            },
            styles: {
              style: 'stroke_fill',
              color: isUp ? 'rgba(8, 153, 129, 0.35)' : 'rgba(242, 54, 69, 0.35)',
              borderColor: isUp ? '#089981' : '#f23645'
            }
          });
        }
      }
    }
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

                // Blue Handle Circles at key points (Image 5)
                coordinates.forEach((pt: { x: number; y: number }) => {
                  figures.push({
                    type: 'circle',
                    attrs: { x: pt.x, y: pt.y, r: 6 },
                    styles: { style: 'stroke_fill', color: '#2962ff', borderColor: '#ffffff', borderSize: 2 }
                  });
                });
              }
              return figures;
            }
          });

          // Đăng ký Đường thông tin (infoLine)
          registerOverlay({
            name: 'infoLine',
            totalStep: 3,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, points, kLineDataList }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 2) {
                const p1 = coordinates[0];
                const p2 = coordinates[1];
                figures.push({ type: 'line', attrs: { coordinates: [p1, p2] }, styles: { color: '#2962ff', size: 2 } });

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const distPx = Math.round(Math.sqrt(dx * dx + dy * dy));
                const angleDeg = (-Math.atan2(dy, dx) * (180 / Math.PI)).toFixed(2);

                let priceDiff = '0.00';
                let pctChange = '0.00%';
                let valDiff = '0';
                let barCount = 1;
                let timeText = '0g';

                if (points && points.length >= 2) {
                  const val1 = points[0].value ?? 0;
                  const val2 = points[1].value ?? 0;
                  const diff = val2 - val1;
                  const pct = val1 !== 0 ? (diff / val1) * 100 : 0;

                  priceDiff = (diff >= 0 ? '+' : '') + diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  pctChange = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
                  valDiff = (diff * 100).toLocaleString(undefined, { maximumFractionDigits: 0 });

                  const idx1 = points[0].dataIndex ?? 0;
                  const idx2 = points[1].dataIndex ?? 0;
                  barCount = Math.abs(idx2 - idx1);

                  if (kLineDataList && kLineDataList[idx1] && kLineDataList[idx2]) {
                    const t1 = kLineDataList[idx1].timestamp;
                    const t2 = kLineDataList[idx2].timestamp;
                    const diffMs = Math.abs(t2 - t1);
                    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
                    timeText = diffHours >= 24 ? `${Math.round(diffHours / 24)}n` : `${diffHours}g`;
                  } else {
                    timeText = `${Math.round(barCount * 15 / 60)}g`;
                  }
                }

                // Card position (centered near line mid point)
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;

                // Card Background Box - Subtle semi-transparent dark container
                const cardWidth = 250;
                const cardHeight = 74;
                const cardX = Math.max(10, midX - cardWidth / 2);
                const cardY = Math.max(10, midY - cardHeight / 2);

                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: cardX, y: cardY },
                      { x: cardX + cardWidth, y: cardY },
                      { x: cardX + cardWidth, y: cardY + cardHeight },
                      { x: cardX, y: cardY + cardHeight }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: 'rgba(19, 23, 34, 0.75)', borderColor: '#363a45' }
                });

                // Line 1: Price difference
                figures.push({
                  type: 'text',
                  attrs: { x: cardX + 10, y: cardY + 10, text: `↕  ${priceDiff} (${pctChange}), ${valDiff}` },
                  styles: { color: '#ffffff', size: 12, weight: 'bold', backgroundColor: 'transparent' }
                });

                // Line 2: Bar count & Time & Distance px
                figures.push({
                  type: 'text',
                  attrs: { x: cardX + 10, y: cardY + 32, text: `↔  ${barCount} thanh (${timeText}), khoảng cách: ${distPx} px` },
                  styles: { color: '#d1d4dc', size: 11, backgroundColor: 'transparent' }
                });

                // Line 3: Angle
                figures.push({
                  type: 'text',
                  attrs: { x: cardX + 10, y: cardY + 52, text: `∠  ${angleDeg}°` },
                  styles: { color: '#d1d4dc', size: 11, backgroundColor: 'transparent' }
                });
              }
              return figures;
            }
          });

          // Đăng ký Góc xu hướng (trendAngle)
          registerOverlay({
            name: 'trendAngle',
            totalStep: 3,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              const figures: any[] = [];
              if (coordinates.length >= 2) {
                const p1 = coordinates[0];
                const p2 = coordinates[1];

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;

                // Main Trend Line
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [p1, p2] },
                  styles: { color: '#2962ff', size: 2 }
                });

                // Dotted horizontal baseline from p1
                const baseLen = Math.min(Math.abs(dx), 90) || 60;
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [p1, { x: p1.x + (dx >= 0 ? baseLen : -baseLen), y: p1.y }] },
                  styles: { style: 'dashed', color: '#2962ff', dashedValue: [2, 3] }
                });

                // Dotted Arc connecting horizontal to line
                const radius = 35;
                const angleRad = Math.atan2(-dy, dx);
                const angleDeg = (angleRad * (180 / Math.PI)).toFixed(2);

                const arcPoints: { x: number; y: number }[] = [];
                const steps = 15;
                for (let i = 0; i <= steps; i++) {
                  const a = (angleRad * i) / steps;
                  arcPoints.push({
                    x: p1.x + radius * Math.cos(a),
                    y: p1.y - radius * Math.sin(a)
                  });
                }

                figures.push({
                  type: 'line',
                  attrs: { coordinates: arcPoints },
                  styles: { style: 'dashed', color: '#2962ff', dashedValue: [2, 2] }
                });

                // Angle degree label text with subtle dark background badge
                const midAngle = angleRad / 2;
                figures.push({
                  type: 'text',
                  attrs: {
                    x: p1.x + (radius + 20) * Math.cos(midAngle),
                    y: p1.y - (radius + 20) * Math.sin(midAngle),
                    text: `${angleDeg}°`
                  },
                  styles: {
                    color: '#2962ff',
                    size: 13,
                    weight: 'bold',
                    backgroundColor: 'rgba(19, 23, 34, 0.75)',
                    paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2,
                    borderRadius: 4,
                    borderSize: 1,
                    borderColor: '#2962ff'
                  }
                });
              }
              return figures;
            }
          });

          // Đăng ký Đường xu hướng có chữ dọc theo đường (segment)
          registerOverlay({
            name: 'segment',
            totalStep: 3,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, overlay }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 2) {
                const p1 = coordinates[0];
                const p2 = coordinates[1];

                const styles = overlay.styles || {};
                const lineStyle = styles.line || {};
                const textStyle = styles.text || {};

                const lineColor = lineStyle.color || '#2962ff';
                const lineSize = lineStyle.size || 2;
                const isDashed = lineStyle.style === 'dashed';
                const dashedVal = lineStyle.dashedValue || [6, 6];

                // Draw Main Line
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [p1, p2] },
                  styles: {
                    color: lineColor,
                    size: lineSize,
                    style: isDashed ? 'dashed' : 'solid',
                    dashedValue: dashedVal
                  }
                });

                // Custom Text along the trend line (e.g. "đggg")
                const textContent = overlay.extendData || (textStyle as any)?.text;
                if (textContent && typeof textContent === 'string') {
                  const dx = p2.x - p1.x;
                  const dy = p2.y - p1.y;
                  const midX = (p1.x + p2.x) / 2;
                  const midY = (p1.y + p2.y) / 2;
                  const angleRad = Math.atan2(dy, dx);
                  let angleDeg = angleRad * (180 / Math.PI);

                  if (angleDeg > 90 || angleDeg < -90) {
                    angleDeg += 180;
                  }

                  figures.push({
                    type: 'text',
                    attrs: {
                      x: midX,
                      y: midY - 6,
                      text: textContent,
                      align: 'center',
                      baseline: 'bottom',
                      rotation: angleDeg
                    },
                    styles: {
                      color: textStyle.color || '#2962ff',
                      size: textStyle.size || 14,
                      weight: textStyle.weight || 'bold',
                      backgroundColor: 'transparent',
                      paddingLeft: 4, paddingRight: 4
                    }
                  });
                }
              }
              return figures;
            }
          });

          // Đăng ký Văn bản (simpleAnnotation) - Render text directly without vertical pin
          registerOverlay({
            name: 'simpleAnnotation',
            totalStep: 2,
            needDefaultPointFigure: false,
            needDefaultXAxisFigure: false,
            needDefaultYAxisFigure: false,
            createPointFigures: ({ coordinates, overlay }: any) => {
              if (coordinates.length < 1) return [];
              const p = coordinates[0];
              const textContent = String(overlay.extendData || 'Thêm văn bản');
              const styles = overlay.styles || {};
              const textStyle = styles.text || {};

              return [
                {
                  type: 'text',
                  attrs: {
                    x: p.x,
                    y: p.y,
                    text: textContent,
                    align: 'left',
                    baseline: 'bottom'
                  },
                  styles: {
                    color: textStyle.color || '#2962ff',
                    size: textStyle.size || 16,
                    weight: textStyle.weight || 'normal',
                    backgroundColor: textStyle.backgroundColor || 'transparent',
                    paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2,
                    borderRadius: 2
                  }
                }
              ];
            }
          });

          // Đăng ký Ghi chú Giá (priceNote) - Screenshot 1
          registerOverlay({
            name: 'priceNote',
            totalStep: 3,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, points, overlay, kLineDataList }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 2) {
                const p1 = coordinates[0];
                const p2 = coordinates[1];

                // 1. Connecting Line from p1 to p2
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [p1, p2] },
                  styles: { color: '#2962ff', size: 2 }
                });

                // 2. Start handle at p1
                figures.push({
                  type: 'circle',
                  attrs: { x: p1.x, y: p1.y, r: 6 },
                  styles: { style: 'stroke_fill', color: '#131722', borderColor: '#2962ff', borderSize: 2 }
                });

                // 3. Target handle at p2
                figures.push({
                  type: 'circle',
                  attrs: { x: p2.x, y: p2.y, r: 6 },
                  styles: { style: 'stroke_fill', color: '#131722', borderColor: '#2962ff', borderSize: 2 }
                });

                // 4. Price Badge Pill at p2
                let priceVal = '';
                if (typeof overlay.extendData === 'string' && overlay.extendData && overlay.extendData !== '85,470.59' && overlay.extendData !== 'Thêm văn bản' && overlay.extendData !== '0.00') {
                  priceVal = overlay.extendData;
                } else {
                  const pt = (points && (points[1] || points[0])) || null;
                  const numPrice = (pt && typeof pt.value === 'number' && pt.value !== 0)
                    ? pt.value
                    : (pt && typeof pt.dataIndex === 'number' && kLineDataList && kLineDataList[pt.dataIndex]
                      ? kLineDataList[pt.dataIndex].close
                      : (kLineDataList && kLineDataList.length > 0 ? kLineDataList[kLineDataList.length - 1].close : 85470.59));

                  priceVal = Number(numPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }

                const pillWidth = Math.max(90, priceVal.length * 9 + 20);
                const pillHeight = 28;
                const pillX = p2.x - 4;
                const pillY = p2.y - pillHeight - 6;

                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: pillX, y: pillY },
                      { x: pillX + pillWidth, y: pillY },
                      { x: pillX + pillWidth, y: pillY + pillHeight },
                      { x: pillX, y: pillY + pillHeight }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: '#2962ff', borderColor: '#2962ff', borderRadius: 6 }
                });

                figures.push({
                  type: 'text',
                  attrs: { x: pillX + 10, y: pillY + 5, text: priceVal },
                  styles: { color: '#ffffff', size: 14, weight: 'bold' }
                });
              }
              return figures;
            }
          });

          // Đăng ký Ghi chú (note) - Screenshot 2
          registerOverlay({
            name: 'note',
            totalStep: 3,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, overlay }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 2) {
                const p1 = coordinates[0];
                const p2 = coordinates[1];

                // Connecting line from p1 to p2
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [p1, p2] },
                  styles: { color: '#e0e3eb', size: 1.5 }
                });

                // Handle at p1
                figures.push({
                  type: 'circle',
                  attrs: { x: p1.x, y: p1.y, r: 6 },
                  styles: { style: 'stroke_fill', color: '#131722', borderColor: '#2962ff', borderSize: 2 }
                });

                // Handle at p2
                figures.push({
                  type: 'circle',
                  attrs: { x: p2.x, y: p2.y, r: 6 },
                  styles: { style: 'stroke_fill', color: '#131722', borderColor: '#2962ff', borderSize: 2 }
                });

                // Text box container at p1
                const textContent = String(overlay.extendData || 'Thêm văn bản');
                const boxWidth = Math.max(120, textContent.length * 8 + 24);
                const boxHeight = 34;
                const boxX = p1.x - boxWidth - 10;
                const boxY = p1.y - boxHeight / 2;

                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: boxX, y: boxY },
                      { x: boxX + boxWidth, y: boxY },
                      { x: boxX + boxWidth, y: boxY + boxHeight },
                      { x: boxX, y: boxY + boxHeight }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: 'rgba(42, 46, 57, 0.95)', borderColor: '#434651', borderSize: 1, borderRadius: 6 }
                });

                figures.push({
                  type: 'text',
                  attrs: { x: boxX + 12, y: boxY + 8, text: textContent },
                  styles: { color: '#d1d4dc', size: 13, weight: 'normal' }
                });
              }
              return figures;
            }
          });

          // Đăng ký Mã Pin (pinMark) - Screenshot 3
          registerOverlay({
            name: 'pinMark',
            totalStep: 2,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, overlay }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 1) {
                const p = coordinates[0];
                const textContent = String(overlay.extendData || 'Thêm văn bản');

                // 1. Blue Map Drop Pin Shape at p
                figures.push({
                  type: 'circle',
                  attrs: { x: p.x, y: p.y - 18, r: 12 },
                  styles: { style: 'stroke_fill', color: '#2962ff', borderColor: '#2962ff' }
                });
                figures.push({
                  type: 'circle',
                  attrs: { x: p.x, y: p.y - 18, r: 4 },
                  styles: { style: 'stroke_fill', color: '#131722', borderColor: '#131722' }
                });
                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: p.x - 8, y: p.y - 14 },
                      { x: p.x + 8, y: p.y - 14 },
                      { x: p.x, y: p.y }
                    ]
                  },
                  styles: { style: 'fill', color: '#2962ff' }
                });

                // 2. Text Box above Map Pin with pointer tail
                const boxWidth = Math.max(140, textContent.length * 8 + 24);
                const boxHeight = 36;
                const boxX = p.x - 40;
                const boxY = p.y - 70;

                // Pointer triangle from box to pin head
                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: p.x - 8, y: boxY + boxHeight },
                      { x: p.x + 8, y: boxY + boxHeight },
                      { x: p.x, y: boxY + boxHeight + 8 }
                    ]
                  },
                  styles: { style: 'fill', color: 'rgba(42, 46, 57, 0.95)' }
                });

                // Box body
                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: boxX, y: boxY },
                      { x: boxX + boxWidth, y: boxY },
                      { x: boxX + boxWidth, y: boxY + boxHeight },
                      { x: boxX, y: boxY + boxHeight }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: 'rgba(42, 46, 57, 0.95)', borderColor: '#434651', borderSize: 1, borderRadius: 6 }
                });

                figures.push({
                  type: 'text',
                  attrs: { x: boxX + 12, y: boxY + 9, text: textContent },
                  styles: { color: '#d1d4dc', size: 13, weight: 'normal' }
                });
              }
              return figures;
            }
          });

          // Đăng ký Bảng (tableMark) - Screenshot 4
          registerOverlay({
            name: 'tableMark',
            totalStep: 3,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              const figures: any[] = [];
              if (coordinates.length >= 2) {
                const p1 = coordinates[0];
                const p2 = coordinates[1];

                const minX = Math.min(p1.x, p2.x);
                const maxX = Math.max(p1.x, p2.x);
                const minY = Math.min(p1.y, p2.y);
                const maxY = Math.max(p1.y, p2.y);
                const width = maxX - minX || 240;
                const height = maxY - minY || 120;

                // Outer box
                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: minX, y: minY },
                      { x: maxX, y: minY },
                      { x: maxX, y: maxY },
                      { x: minX, y: maxY }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: 'rgba(30, 34, 45, 0.85)', borderColor: '#434651', borderSize: 1.5 }
                });

                // Rows
                const rowH = height / 3;
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [{ x: minX, y: minY + rowH }, { x: maxX, y: minY + rowH }] },
                  styles: { color: '#434651', size: 1 }
                });
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [{ x: minX, y: minY + rowH * 2 }, { x: maxX, y: minY + rowH * 2 }] },
                  styles: { color: '#434651', size: 1 }
                });

                // Columns
                const colW = width / 3;
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [{ x: minX + colW, y: minY }, { x: minX + colW, y: maxY }] },
                  styles: { color: '#434651', size: 1 }
                });
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [{ x: minX + colW * 2, y: minY }, { x: minX + colW * 2, y: maxY }] },
                  styles: { color: '#434651', size: 1 }
                });

                // Corner handles
                const corners = [
                  { x: minX, y: minY },
                  { x: maxX, y: minY },
                  { x: maxX, y: maxY },
                  { x: minX, y: maxY }
                ];
                corners.forEach(c => {
                  figures.push({
                    type: 'circle',
                    attrs: { x: c.x, y: c.y, r: 6 },
                    styles: { style: 'stroke_fill', color: '#131722', borderColor: '#2962ff', borderSize: 2 }
                  });
                });
              }
              return figures;
            }
          });

          // Đăng ký Chú thích (callout) - Screenshot 5
          registerOverlay({
            name: 'callout',
            totalStep: 3,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, overlay }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 2) {
                const p1 = coordinates[0];
                const p2 = coordinates[1];
                const textContent = String(overlay.extendData || 'Thêm văn bản');

                // 1. Target handle at p1
                figures.push({
                  type: 'circle',
                  attrs: { x: p1.x, y: p1.y, r: 6 },
                  styles: { style: 'stroke_fill', color: '#131722', borderColor: '#2962ff', borderSize: 2 }
                });

                // 2. Speech Bubble Container at p2
                const boxWidth = Math.max(130, textContent.length * 9 + 24);
                const boxHeight = 38;
                const boxX = p2.x;
                const boxY = p2.y - boxHeight / 2;

                // Triangle pointer tail connecting left edge of box to p1
                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      p1,
                      { x: boxX, y: boxY + 8 },
                      { x: boxX, y: boxY + boxHeight - 8 }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: 'rgba(38, 166, 154, 0.25)', borderColor: '#26a69a', borderSize: 2 }
                });

                // Rounded rectangle body
                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: boxX, y: boxY },
                      { x: boxX + boxWidth, y: boxY },
                      { x: boxX + boxWidth, y: boxY + boxHeight },
                      { x: boxX, y: boxY + boxHeight }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: 'rgba(38, 166, 154, 0.25)', borderColor: '#26a69a', borderSize: 2, borderRadius: 10 }
                });

                // Text inside callout bubble
                figures.push({
                  type: 'text',
                  attrs: { x: boxX + 14, y: boxY + 9, text: textContent },
                  styles: { color: '#4db6ac', size: 15, weight: 'bold' }
                });
              }
              return figures;
            }
          });

          // Đăng ký Bình luận (comment) - Image 1
          registerOverlay({
            name: 'comment',
            totalStep: 2,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, overlay }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 1) {
                const p = coordinates[0];
                const textContent = String(overlay.extendData || 'Thêm văn bản');
                const boxWidth = Math.max(130, textContent.length * 9 + 28);
                const boxHeight = 36;
                const boxX = p.x + 8;
                const boxY = p.y - boxHeight / 2 - 10;

                // Handle at p
                figures.push({
                  type: 'circle',
                  attrs: { x: p.x, y: p.y, r: 6 },
                  styles: { style: 'stroke_fill', color: '#131722', borderColor: '#2962ff', borderSize: 2 }
                });

                // Chat bubble body
                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: boxX, y: boxY },
                      { x: boxX + boxWidth, y: boxY },
                      { x: boxX + boxWidth, y: boxY + boxHeight },
                      { x: boxX, y: boxY + boxHeight }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: '#446cf6', borderColor: '#446cf6', borderRadius: 16 }
                });

                // Text inside bubble
                figures.push({
                  type: 'text',
                  attrs: { x: boxX + 16, y: boxY + 8, text: textContent },
                  styles: { color: '#ffffff', size: 14, weight: 'bold' }
                });
              }
              return figures;
            }
          });

          // Đăng ký Nhãn Giá (priceLabel) - Image 2
          registerOverlay({
            name: 'priceLabel',
            totalStep: 2,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, points, kLineDataList, overlay }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 1) {
                const p = coordinates[0];
                let priceVal = '';
                if (typeof overlay.extendData === 'string' && overlay.extendData && overlay.extendData !== '83,218.92' && overlay.extendData !== 'Thêm văn bản' && overlay.extendData !== '0.00') {
                  priceVal = overlay.extendData;
                } else {
                  const pt = points && points[0];
                  const numPrice = (pt && typeof pt.value === 'number' && pt.value !== 0)
                    ? pt.value
                    : (pt && typeof pt.dataIndex === 'number' && kLineDataList && kLineDataList[pt.dataIndex]
                      ? kLineDataList[pt.dataIndex].close
                      : (kLineDataList && kLineDataList.length > 0 ? kLineDataList[kLineDataList.length - 1].close : 83218.92));

                  priceVal = Number(numPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }

                const boxWidth = Math.max(100, priceVal.length * 9 + 24);
                const boxHeight = 34;
                const boxX = p.x + 20;
                const boxY = p.y - 38;

                // Pointer tail connecting p to box
                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      p,
                      { x: boxX, y: boxY + boxHeight / 2 - 4 },
                      { x: boxX, y: boxY + boxHeight }
                    ]
                  },
                  styles: { style: 'fill', color: '#446cf6' }
                });

                // Target handle at p
                figures.push({
                  type: 'circle',
                  attrs: { x: p.x, y: p.y, r: 6 },
                  styles: { style: 'stroke_fill', color: '#131722', borderColor: '#2962ff', borderSize: 2 }
                });

                // Blue Badge Box
                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: boxX, y: boxY },
                      { x: boxX + boxWidth, y: boxY },
                      { x: boxX + boxWidth, y: boxY + boxHeight },
                      { x: boxX, y: boxY + boxHeight }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: '#446cf6', borderColor: '#446cf6', borderRadius: 8 }
                });

                // Price text
                figures.push({
                  type: 'text',
                  attrs: { x: boxX + 12, y: boxY + 7, text: priceVal },
                  styles: { color: '#ffffff', size: 14, weight: 'bold' }
                });
              }
              return figures;
            }
          });

          // Đăng ký Biển chỉ dẫn (signpost) - Image 3
          registerOverlay({
            name: 'signpost',
            totalStep: 2,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, overlay }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 1) {
                const p = coordinates[0];
                const textContent = String(overlay.extendData || 'Thêm văn bản');

                const poleHeight = 110;
                const topY = p.y - poleHeight;

                // Vertical pole line
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [{ x: p.x, y: topY }, { x: p.x, y: p.y }] },
                  styles: { color: '#a0a3b0', size: 1.5 }
                });

                // Handle at bottom p
                figures.push({
                  type: 'circle',
                  attrs: { x: p.x, y: p.y, r: 6 },
                  styles: { style: 'stroke_fill', color: '#131722', borderColor: '#2962ff', borderSize: 2 }
                });

                // Text box at bottom
                const boxWidth = Math.max(120, textContent.length * 8 + 24);
                const boxHeight = 34;
                const boxX = p.x - boxWidth / 2;
                const boxY = p.y + 10;

                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: boxX, y: boxY },
                      { x: boxX + boxWidth, y: boxY },
                      { x: boxX + boxWidth, y: boxY + boxHeight },
                      { x: boxX, y: boxY + boxHeight }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: 'rgba(42, 46, 57, 0.95)', borderColor: '#434651', borderSize: 1, borderRadius: 6 }
                });

                figures.push({
                  type: 'text',
                  attrs: { x: boxX + 12, y: boxY + 8, text: textContent },
                  styles: { color: '#d1d4dc', size: 13, weight: 'normal' }
                });
              }
              return figures;
            }
          });

          // Đăng ký Cờ đánh dấu (flagMark) - Image 4
          registerOverlay({
            name: 'flagMark',
            totalStep: 2,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              const figures: any[] = [];
              if (coordinates.length >= 1) {
                const p = coordinates[0];

                // Handle at p
                figures.push({
                  type: 'circle',
                  attrs: { x: p.x, y: p.y, r: 6 },
                  styles: { style: 'stroke_fill', color: '#131722', borderColor: '#2962ff', borderSize: 2 }
                });

                // Flag pole
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [{ x: p.x, y: p.y }, { x: p.x, y: p.y - 32 }] },
                  styles: { color: '#787b86', size: 3 }
                });

                // Waving flag polygon
                const topY = p.y - 32;
                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: p.x + 2, y: topY },
                      { x: p.x + 28, y: topY + 4 },
                      { x: p.x + 26, y: topY + 18 },
                      { x: p.x + 2, y: topY + 14 }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: '#446cf6', borderColor: '#446cf6' }
                });
              }
              return figures;
            }
          });

          // Đăng ký Đường giao nhau (crossLine)
          registerOverlay({
            name: 'crossLine',
            totalStep: 2,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, bounding }) => {
              const figures: any[] = [];
              if (coordinates.length >= 1) {
                const p = coordinates[0];
                figures.push({ type: 'line', attrs: { coordinates: [{ x: 0, y: p.y }, { x: bounding.width, y: p.y }] }, styles: { color: '#2196f3', style: 'dashed' } });
                figures.push({ type: 'line', attrs: { coordinates: [{ x: p.x, y: 0 }, { x: p.x, y: bounding.height }] }, styles: { color: '#2196f3', style: 'dashed' } });
              }
              return figures;
            }
          });
          // Đăng ký Mũi tên đánh dấu (arrowMarker) - 2-click thick pointer arrow
          registerOverlay({
            name: 'arrowMarker',
            totalStep: 3,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              if (coordinates.length < 2) return [];
              const p1 = coordinates[0];
              const p2 = coordinates[1];

              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const angle = Math.atan2(dy, dx);
              const headLen = 22;
              const stemWidth = 6;

              const p2Left = {
                x: p2.x - headLen * Math.cos(angle - Math.PI / 5),
                y: p2.y - headLen * Math.sin(angle - Math.PI / 5)
              };
              const p2Right = {
                x: p2.x - headLen * Math.cos(angle + Math.PI / 5),
                y: p2.y - headLen * Math.sin(angle + Math.PI / 5)
              };

              return [
                {
                  type: 'line',
                  attrs: { coordinates: [p1, p2] },
                  styles: { color: '#2962ff', size: stemWidth }
                },
                {
                  type: 'polygon',
                  attrs: { coordinates: [p2, p2Left, p2Right] },
                  styles: { style: 'fill', color: '#2962ff' }
                }
              ];
            }
          });

          // Đăng ký Mũi tên (arrow) - Standard line arrow
          registerOverlay({
            name: 'arrow',
            totalStep: 3,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              if (coordinates.length < 2) return [];
              const p1 = coordinates[0];
              const p2 = coordinates[1];

              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const angle = Math.atan2(dy, dx);
              const headLen = 16;

              const p2Left = {
                x: p2.x - headLen * Math.cos(angle - Math.PI / 6),
                y: p2.y - headLen * Math.sin(angle - Math.PI / 6)
              };
              const p2Right = {
                x: p2.x - headLen * Math.cos(angle + Math.PI / 6),
                y: p2.y - headLen * Math.sin(angle + Math.PI / 6)
              };

              return [
                {
                  type: 'line',
                  attrs: { coordinates: [p1, p2] },
                  styles: { color: '#2962ff', size: 2 }
                },
                {
                  type: 'line',
                  attrs: { coordinates: [p2Left, p2, p2Right] },
                  styles: { color: '#2962ff', size: 2 }
                }
              ];
            }
          });

          // Đăng ký Mũi tên chỉ lên (arrowUp)
          registerOverlay({
            name: 'arrowUp',
            totalStep: 2,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              if (coordinates.length < 1) return [];
              const p = coordinates[0];
              const size = 18;
              return [
                {
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: p.x, y: p.y - size },
                      { x: p.x - size / 1.3, y: p.y - size / 4 },
                      { x: p.x - size / 3, y: p.y - size / 4 },
                      { x: p.x - size / 3, y: p.y + size / 1.2 },
                      { x: p.x + size / 3, y: p.y + size / 1.2 },
                      { x: p.x + size / 3, y: p.y - size / 4 },
                      { x: p.x + size / 1.3, y: p.y - size / 4 }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: '#089981', borderColor: '#089981' }
                }
              ];
            }
          });

          // Đăng ký Mũi tên chỉ xuống (arrowDown)
          registerOverlay({
            name: 'arrowDown',
            totalStep: 2,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              if (coordinates.length < 1) return [];
              const p = coordinates[0];
              const size = 18;
              return [
                {
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: p.x, y: p.y + size },
                      { x: p.x - size / 1.3, y: p.y + size / 4 },
                      { x: p.x - size / 3, y: p.y + size / 4 },
                      { x: p.x - size / 3, y: p.y - size / 1.2 },
                      { x: p.x + size / 3, y: p.y - size / 1.2 },
                      { x: p.x + size / 3, y: p.y + size / 4 },
                      { x: p.x + size / 1.3, y: p.y + size / 4 }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: '#f23645', borderColor: '#f23645' }
                }
              ];
            }
          });

          // Đăng ký Mũi tên chỉ sang trái (arrowLeft)
          registerOverlay({
            name: 'arrowLeft',
            totalStep: 2,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              if (coordinates.length < 1) return [];
              const p = coordinates[0];
              const size = 18;
              return [
                {
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: p.x - size, y: p.y },
                      { x: p.x - size / 4, y: p.y - size / 1.3 },
                      { x: p.x - size / 4, y: p.y - size / 3 },
                      { x: p.x + size / 1.2, y: p.y - size / 3 },
                      { x: p.x + size / 1.2, y: p.y + size / 3 },
                      { x: p.x - size / 4, y: p.y + size / 3 },
                      { x: p.x - size / 4, y: p.y + size / 1.3 }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: '#2962ff', borderColor: '#2962ff' }
                }
              ];
            }
          });

          // Đăng ký Mũi tên chỉ sang phải (arrowRight)
          registerOverlay({
            name: 'arrowRight',
            totalStep: 2,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              if (coordinates.length < 1) return [];
              const p = coordinates[0];
              const size = 18;
              return [
                {
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: p.x + size, y: p.y },
                      { x: p.x + size / 4, y: p.y - size / 1.3 },
                      { x: p.x + size / 4, y: p.y - size / 3 },
                      { x: p.x - size / 1.2, y: p.y - size / 3 },
                      { x: p.x - size / 1.2, y: p.y + size / 3 },
                      { x: p.x + size / 4, y: p.y + size / 3 },
                      { x: p.x + size / 4, y: p.y + size / 1.3 }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: '#2962ff', borderColor: '#2962ff' }
                },
                {
                  type: 'circle',
                  attrs: { x: p.x - size / 1.2, y: p.y, r: 4 },
                  styles: { style: 'stroke_fill', color: '#ffffff', borderColor: '#2962ff', borderSize: 2 }
                }
              ];
            }
          });

          // Đăng ký Hình Polyline (polyline & path) - Image 1
          registerOverlay({
            name: 'polyline',
            totalStep: 10,
            needDefaultPointFigure: false,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              const figures: any[] = [];
              if (coordinates.length >= 2) {
                figures.push({
                  type: 'line',
                  attrs: { coordinates },
                  styles: { color: '#00bcd4', size: 3 }
                });
                coordinates.forEach(p => {
                  figures.push({
                    type: 'circle',
                    attrs: { x: p.x, y: p.y, r: 5 },
                    styles: { style: 'stroke_fill', color: '#2962ff', borderColor: '#ffffff', borderSize: 2 }
                  });
                });
              }
              return figures;
            }
          });

          registerOverlay({
            name: 'path',
            totalStep: 10,
            needDefaultPointFigure: false,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              const figures: any[] = [];
              if (coordinates.length >= 2) {
                figures.push({
                  type: 'line',
                  attrs: { coordinates },
                  styles: { color: '#00bcd4', size: 3 }
                });
                coordinates.forEach(p => {
                  figures.push({
                    type: 'circle',
                    attrs: { x: p.x, y: p.y, r: 5 },
                    styles: { style: 'stroke_fill', color: '#2962ff', borderColor: '#ffffff', borderSize: 2 }
                  });
                });
              }
              return figures;
            }
          });

          // Đăng ký Đường cong (curve) - Image 2
          registerOverlay({
            name: 'curve',
            totalStep: 4,
            needDefaultPointFigure: false,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              const figures: any[] = [];
              if (coordinates.length >= 3) {
                const p0 = coordinates[0];
                const p1 = coordinates[1];
                const p2 = coordinates[2];

                const curvePoints: { x: number; y: number }[] = [];
                const steps = 30;
                for (let i = 0; i <= steps; i++) {
                  const t = i / steps;
                  const oneMinusT = 1 - t;
                  const x = oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x;
                  const y = oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y;
                  curvePoints.push({ x, y });
                }

                figures.push({
                  type: 'line',
                  attrs: { coordinates: curvePoints },
                  styles: { color: '#2962ff', size: 3.5 }
                });

                [p0, p1, p2].forEach(p => {
                  figures.push({
                    type: 'circle',
                    attrs: { x: p.x, y: p.y, r: 6 },
                    styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 }
                  });
                });
              } else if (coordinates.length === 2) {
                figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#2962ff', size: 3 } });
              }
              return figures;
            }
          });

          // Đăng ký Đường cong đôi (doubleCurve) - Image 3
          registerOverlay({
            name: 'doubleCurve',
            totalStep: 5,
            needDefaultPointFigure: false,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              const figures: any[] = [];
              if (coordinates.length >= 4) {
                const p0 = coordinates[0];
                const p1 = coordinates[1];
                const p2 = coordinates[2];
                const p3 = coordinates[3];

                const curvePoints: { x: number; y: number }[] = [];
                const steps = 40;
                for (let i = 0; i <= steps; i++) {
                  const t = i / steps;
                  const oneMinusT = 1 - t;
                  const x = Math.pow(oneMinusT, 3) * p0.x + 3 * Math.pow(oneMinusT, 2) * t * p1.x + 3 * oneMinusT * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x;
                  const y = Math.pow(oneMinusT, 3) * p0.y + 3 * Math.pow(oneMinusT, 2) * t * p1.y + 3 * oneMinusT * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y;
                  curvePoints.push({ x, y });
                }

                figures.push({
                  type: 'line',
                  attrs: { coordinates: curvePoints },
                  styles: { color: '#ab47bc', size: 4 }
                });

                [p0, p1, p2, p3].forEach(p => {
                  figures.push({
                    type: 'circle',
                    attrs: { x: p.x, y: p.y, r: 6 },
                    styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 }
                  });
                });
              } else if (coordinates.length === 3) {
                const p0 = coordinates[0];
                const p1 = coordinates[1];
                const p2 = coordinates[2];

                const curvePoints: { x: number; y: number }[] = [];
                const steps = 30;
                for (let i = 0; i <= steps; i++) {
                  const t = i / steps;
                  const oneMinusT = 1 - t;
                  const x = oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x;
                  const y = oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y;
                  curvePoints.push({ x, y });
                }

                figures.push({
                  type: 'line',
                  attrs: { coordinates: curvePoints },
                  styles: { color: '#ab47bc', size: 3.5 }
                });

                [p0, p1, p2].forEach(p => {
                  figures.push({
                    type: 'circle',
                    attrs: { x: p.x, y: p.y, r: 6 },
                    styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 }
                  });
                });
              } else if (coordinates.length === 2) {
                figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#ab47bc', size: 3 } });
              }
              return figures;
            }
          });

          // Đăng ký Hình vòng cung (arc) - Image 4
          registerOverlay({
            name: 'arc',
            totalStep: 4,
            needDefaultPointFigure: false,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              const figures: any[] = [];
              if (coordinates.length >= 3) {
                const p0 = coordinates[0];
                const p1 = coordinates[1];
                const p2 = coordinates[2];

                const curvePoints: { x: number; y: number }[] = [];
                const steps = 30;
                for (let i = 0; i <= steps; i++) {
                  const t = i / steps;
                  const oneMinusT = 1 - t;
                  const x = oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x;
                  const y = oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y;
                  curvePoints.push({ x, y });
                }

                // Sector polygon: arc curve + line back to p0 (Image 4)
                const sectorPolygon = [...curvePoints, p0];
                figures.push({
                  type: 'polygon',
                  attrs: { coordinates: sectorPolygon },
                  styles: { style: 'stroke_fill', color: 'rgba(233, 30, 99, 0.25)', borderColor: '#e91e63', borderSize: 2.5 }
                });

                [p0, p1, p2].forEach(p => {
                  figures.push({
                    type: 'circle',
                    attrs: { x: p.x, y: p.y, r: 6 },
                    styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 }
                  });
                });
              } else if (coordinates.length === 2) {
                figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#e91e63', size: 2.5 } });
              }
              return figures;
            }
          });

          // Đăng ký Kênh Song song (priceChannelLine) - Image 1
          registerOverlay({
            name: 'priceChannelLine',
            totalStep: 4,
            needDefaultPointFigure: false,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              const figures: any[] = [];
              if (coordinates.length >= 3) {
                const p0 = coordinates[0];
                const p1 = coordinates[1];
                const p2 = coordinates[2];

                const offset = { x: p2.x - p0.x, y: p2.y - p0.y };
                const p3 = { x: p1.x + offset.x, y: p1.y + offset.y };
                const midP0 = { x: p0.x + offset.x / 2, y: p0.y + offset.y / 2 };
                const midP1 = { x: p1.x + offset.x / 2, y: p1.y + offset.y / 2 };

                // 1. Shaded Translucent Background Fill (Matching Image 1 & 3)
                figures.push({
                  type: 'polygon',
                  attrs: { coordinates: [p0, p1, p3, p2] },
                  styles: { style: 'stroke_fill', color: 'rgba(41, 98, 255, 0.18)', borderColor: 'transparent' }
                });

                // 2. Base Line (p0 -> p1)
                figures.push({ type: 'line', attrs: { coordinates: [p0, p1] }, styles: { color: '#2962ff', size: 2 } });

                // 3. Parallel Line (p2 -> p3)
                figures.push({ type: 'line', attrs: { coordinates: [p2, p3] }, styles: { color: '#2962ff', size: 2 } });

                // 4. Center Dashed Midline (midP0 -> midP1)
                figures.push({ type: 'line', attrs: { coordinates: [midP0, midP1] }, styles: { style: 'dashed', color: '#2962ff', size: 1.5, dashedValue: [4, 4] } });

                // 5. Handles
                [p0, p1, p2, p3].forEach(p => {
                  figures.push({ type: 'circle', attrs: { x: p.x, y: p.y, r: 6 }, styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 } });
                });
              } else if (coordinates.length === 2) {
                figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#2962ff', size: 2 } });
              }
              return figures;
            }
          });

          // Đăng ký Xu hướng hồi quy (regressionTrend) - Image 2
          registerOverlay({
            name: 'regressionTrend',
            totalStep: 3,
            needDefaultPointFigure: false,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, points, kLineDataList }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 2) {
                const p0 = coordinates[0];
                const p1 = coordinates[1];

                let channelHeight = Math.abs(p1.y - p0.y) * 0.4;
                if (channelHeight < 25) channelHeight = 35;

                let rSquaredText = 'R² = 0.984';
                let deltaText = '';

                if (points && points.length >= 2 && kLineDataList && kLineDataList.length > 0) {
                  const idx0 = Math.min(points[0].dataIndex ?? 0, points[1].dataIndex ?? 0);
                  const idx1 = Math.max(points[0].dataIndex ?? 0, points[1].dataIndex ?? 0);
                  const sliced = kLineDataList.slice(idx0, idx1 + 1);

                  if (sliced.length > 2) {
                    const n = sliced.length;
                    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
                    sliced.forEach((d: any, i: number) => {
                      const y = d.close;
                      sumX += i;
                      sumY += y;
                      sumXY += i * y;
                      sumXX += i * i;
                      sumYY += y * y;
                    });

                    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);

                    let ssRes = 0, ssTot = 0;
                    const meanY = sumY / n;
                    sliced.forEach((d: any, i: number) => {
                      const yPred = m * i + (sumY - m * sumX) / n;
                      ssRes += Math.pow(d.close - yPred, 2);
                      ssTot += Math.pow(d.close - meanY, 2);
                    });

                    const r2 = Math.max(0, 1 - (ssRes / (ssTot || 1)));
                    rSquaredText = `${m >= 0 ? '+' : ''}${m.toFixed(4)} (${(r2).toFixed(4)})`;

                    const pStart = sliced[0].close;
                    const pEnd = sliced[sliced.length - 1].close;
                    const pDiff = pEnd - pStart;
                    const pPct = pStart !== 0 ? (pDiff / pStart) * 100 : 0;
                    deltaText = `${pDiff >= 0 ? '+' : ''}${pDiff.toFixed(2)} (${pPct >= 0 ? '+' : ''}${pPct.toFixed(2)}%)`;
                  }
                }

                const u0 = { x: p0.x, y: p0.y - channelHeight };
                const u1 = { x: p1.x, y: p1.y - channelHeight };
                const l0 = { x: p0.x, y: p0.y + channelHeight };
                const l1 = { x: p1.x, y: p1.y + channelHeight };

                // 1. Shaded Fills (Matching Image 2):
                // Upper Band: Blue Translucent Fill
                figures.push({
                  type: 'polygon',
                  attrs: { coordinates: [u0, u1, p1, p0] },
                  styles: { style: 'stroke_fill', color: 'rgba(41, 98, 255, 0.20)', borderColor: 'transparent' }
                });

                // Lower Band: Red Translucent Fill
                figures.push({
                  type: 'polygon',
                  attrs: { coordinates: [p0, p1, l1, l0] },
                  styles: { style: 'stroke_fill', color: 'rgba(242, 54, 69, 0.20)', borderColor: 'transparent' }
                });

                // 2. Channel Lines (Matching Image 2):
                figures.push({ type: 'line', attrs: { coordinates: [u0, u1] }, styles: { color: '#2962ff', size: 2 } });
                figures.push({ type: 'line', attrs: { coordinates: [p0, p1] }, styles: { style: 'dashed', color: '#f23645', size: 1.5, dashedValue: [4, 4] } });
                figures.push({ type: 'line', attrs: { coordinates: [l0, l1] }, styles: { color: '#2962ff', size: 2 } });

                // 3. Data Text Displays (Matching Image 2):
                const midX = (p0.x + p1.x) / 2;
                figures.push({
                  type: 'text',
                  attrs: { x: u0.x + 10, y: u0.y - 18, text: deltaText || rSquaredText },
                  styles: { color: '#2962ff', size: 13, weight: 'bold' }
                });
                if (deltaText) {
                  figures.push({
                    type: 'text',
                    attrs: { x: midX - 40, y: l1.y + 10, text: rSquaredText },
                    styles: { color: '#2962ff', size: 12, weight: 'bold' }
                  });
                }

                // 4. Handles
                [p0, p1, u0, u1, l0, l1].forEach(p => {
                  figures.push({ type: 'circle', attrs: { x: p.x, y: p.y, r: 5 }, styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 } });
                });
              }
              return figures;
            }
          });

          // Đăng ký Mặt phẳng đỉnh/đáy (flatTopBottom) - Image 1 & 3
          registerOverlay({
            name: 'flatTopBottom',
            totalStep: 3,
            needDefaultPointFigure: false,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, points, bounding }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 2) {
                const p0 = coordinates[0];
                const p1 = coordinates[1];

                const minX = Math.min(p0.x, p1.x);
                const maxX = Math.max(p0.x, p1.x);
                const topY = Math.min(p0.y, p1.y);
                const botY = Math.max(p0.y, p1.y);
                const midY = (topY + botY) / 2;

                // 1. Semi-transparent Dark Blue Box Fill (Matching Image 1 & 3)
                figures.push({
                  type: 'polygon',
                  attrs: {
                    coordinates: [
                      { x: minX, y: topY },
                      { x: maxX, y: topY },
                      { x: maxX, y: botY },
                      { x: minX, y: botY }
                    ]
                  },
                  styles: { style: 'stroke_fill', color: 'rgba(33, 40, 75, 0.45)', borderColor: '#2962ff', borderSize: 2 }
                });

                // 2. Center Dashed Horizontal Line (Matching Image 1)
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [{ x: minX, y: midY }, { x: maxX, y: midY }] },
                  styles: { style: 'dashed', color: '#2962ff', size: 1.5, dashedValue: [4, 4] }
                });

                // 3. Right Y-Axis Price Label Badges (Matching Image 3)
                let topPriceStr = '85,781.04';
                let midPriceStr = '85,757.18';
                let botPriceStr = '85,431.16';

                if (points && points.length >= 2) {
                  const val0 = points[0].value ?? 0;
                  const val1 = points[1].value ?? 0;
                  const pMax = Math.max(val0, val1);
                  const pMin = Math.min(val0, val1);
                  const pMid = (pMax + pMin) / 2;

                  if (pMax !== 0) {
                    topPriceStr = Number(pMax).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    midPriceStr = Number(pMid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    botPriceStr = Number(pMin).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  }
                }

                const badgeX = bounding ? bounding.width - 90 : maxX + 10;
                const pillW = 85;
                const pillH = 22;

                [
                  { y: topY, text: topPriceStr },
                  { y: midY, text: midPriceStr },
                  { y: botY, text: botPriceStr }
                ].forEach(item => {
                  figures.push({
                    type: 'polygon',
                    attrs: {
                      coordinates: [
                        { x: badgeX, y: item.y - pillH / 2 },
                        { x: badgeX + pillW, y: item.y - pillH / 2 },
                        { x: badgeX + pillW, y: item.y + pillH / 2 },
                        { x: badgeX, y: item.y + pillH / 2 }
                      ]
                    },
                    styles: { style: 'stroke_fill', color: '#2962ff', borderColor: '#2962ff', borderRadius: 4 }
                  });
                  figures.push({
                    type: 'text',
                    attrs: { x: badgeX + 6, y: item.y - 6, text: item.text },
                    styles: { color: '#ffffff', size: 11, weight: 'bold' }
                  });
                });

                // 4. Interactive Handles
                const handles = [
                  { x: minX, y: topY },
                  { x: (minX + maxX) / 2, y: topY },
                  { x: maxX, y: topY },
                  { x: minX, y: botY },
                  { x: (minX + maxX) / 2, y: botY },
                  { x: maxX, y: botY }
                ];
                handles.forEach(h => {
                  figures.push({
                    type: 'circle',
                    attrs: { x: h.x, y: h.y, r: 6 },
                    styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 }
                  });
                });
              }
              return figures;
            }
          });

          // Đăng ký Thước đo Fibonacci (fibonacciLine)
          registerOverlay({
            name: 'fibonacciLine',
            totalStep: 3,
            needDefaultPointFigure: false,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates, points, overlay }: any) => {
              const figures: any[] = [];
              if (coordinates.length >= 2 && points && points.length >= 2) {
                const config: FibonacciConfig = overlay?.extendData || DEFAULT_FIBONACCI_CONFIG;
                const startX = Math.min(coordinates[0].x, coordinates[1].x);
                const endX = Math.max(coordinates[0].x, coordinates[1].x);
                const yDif = coordinates[0].y - coordinates[1].y;
                const valDif = points[0].value! - points[1].value!;

                const activeLevels = config.levels.filter(l => l.active);

                // 1. Tô nền giữa mức 0 và 1 nếu bật
                if (config.showBackground) {
                  const y0 = coordinates[1].y + yDif * 0;
                  const y1 = coordinates[1].y + yDif * 1;
                  figures.push({
                    type: 'polygon',
                    attrs: {
                      coordinates: [
                        { x: startX, y: y0 },
                        { x: endX, y: y0 },
                        { x: endX, y: y1 },
                        { x: startX, y: y1 }
                      ]
                    },
                    styles: { style: 'stroke_fill', color: hexToRgba('#2962ff', (config.backgroundOpacity || 15) / 100), borderColor: 'transparent' }
                  });
                }

                // 2. Đường xu hướng nét đứt
                figures.push({
                  type: 'line',
                  attrs: { coordinates: [coordinates[0], coordinates[1]] },
                  styles: { style: 'dashed', color: '#787b86', size: 1, dashedValue: [4, 4] }
                });

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

          // Đăng ký Không kết nối Kênh (disjointChannel) - Image 5
          registerOverlay({
            name: 'disjointChannel',
            totalStep: 5,
            needDefaultPointFigure: false,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => {
              const figures: any[] = [];
              if (coordinates.length >= 4) {
                const p0 = coordinates[0];
                const p1 = coordinates[1];
                const p2 = coordinates[2];
                const p3 = coordinates[3];

                // 1. Translucent Green Shaded Fill (Matching Image 5)
                figures.push({
                  type: 'polygon',
                  attrs: { coordinates: [p0, p1, p3, p2] },
                  styles: { style: 'stroke_fill', color: 'rgba(8, 153, 129, 0.22)', borderColor: 'transparent' }
                });

                // 2. Top & Bottom Channel Lines (Matching Image 5)
                figures.push({ type: 'line', attrs: { coordinates: [p0, p1] }, styles: { color: '#089981', size: 2 } });
                figures.push({ type: 'line', attrs: { coordinates: [p2, p3] }, styles: { color: '#089981', size: 2 } });

                // 3. Cross X-Lines (p0 -> p3, p1 -> p2) (Matching Image 5)
                figures.push({ type: 'line', attrs: { coordinates: [p0, p3] }, styles: { color: '#089981', size: 2 } });
                figures.push({ type: 'line', attrs: { coordinates: [p1, p2] }, styles: { color: '#089981', size: 2 } });

                // 4. Interactive Handles
                [p0, p1, p2, p3].forEach(p => {
                  figures.push({
                    type: 'circle',
                    attrs: { x: p.x, y: p.y, r: 6 },
                    styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 }
                  });
                });
              } else if (coordinates.length >= 2) {
                figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#089981', size: 2 } });
              }
              return figures;
            }
          });

          // Helper function to create Pitchfork figures (Standard, Schiff, Modified Schiff, Inside)
          const drawPitchforkFigures = (coordinates: any[], type: 'standard' | 'schiff' | 'modified' | 'inside') => {
            const figures: any[] = [];
            if (coordinates.length >= 3) {
              const p0 = coordinates[0];
              const p1 = coordinates[1];
              const p2 = coordinates[2];

              const midP = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

              let pBase = { x: p0.x, y: p0.y };
              let dirVector = { x: midP.x - p0.x, y: midP.y - p0.y };

              if (type === 'schiff') {
                pBase = { x: p0.x, y: (p0.y + p1.y) / 2 };
                dirVector = { x: midP.x - pBase.x, y: midP.y - pBase.y };
              } else if (type === 'modified') {
                pBase = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
                dirVector = { x: midP.x - pBase.x, y: midP.y - pBase.y };
              } else if (type === 'inside') {
                pBase = { x: p0.x, y: p0.y };
                const m01 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
                dirVector = { x: p2.x - m01.x, y: p2.y - m01.y };
              }

              const length = Math.sqrt(dirVector.x * dirVector.x + dirVector.y * dirVector.y) || 1;
              const L = 1400; // Extension length
              const extVector = { x: (dirVector.x / length) * L, y: (dirVector.y / length) * L };

              // Calculate level lines: 0.0, 0.25, 0.5 (median), 0.75, 1.0
              const levels = [0.0, 0.25, 0.5, 0.75, 1.0];
              const levelStartPoints: { x: number; y: number }[] = [];
              const levelEndPoints: { x: number; y: number }[] = [];

              levels.forEach(t => {
                const sx = p1.x + t * (p2.x - p1.x);
                const sy = p1.y + t * (p2.y - p1.y);
                const ex = sx + extVector.x;
                const ey = sy + extVector.y;
                levelStartPoints.push({ x: sx, y: sy });
                levelEndPoints.push({ x: ex, y: ey });
              });

              // 1. Shaded Color Polygon Bands (Matching Images 1-4)
              // Band 0: Level 0.0 to 0.25 (Indigo/Blue Fill)
              figures.push({
                type: 'polygon',
                attrs: { coordinates: [levelStartPoints[0], levelEndPoints[0], levelEndPoints[1], levelStartPoints[1]] },
                styles: { style: 'stroke_fill', color: 'rgba(41, 98, 255, 0.18)', borderColor: 'transparent' }
              });

              // Band 1: Level 0.25 to 0.5 (Teal/Green Fill)
              figures.push({
                type: 'polygon',
                attrs: { coordinates: [levelStartPoints[1], levelEndPoints[1], levelEndPoints[2], levelStartPoints[2]] },
                styles: { style: 'stroke_fill', color: 'rgba(8, 153, 129, 0.22)', borderColor: 'transparent' }
              });

              // Band 2: Level 0.5 to 0.75 (Teal/Green Fill)
              figures.push({
                type: 'polygon',
                attrs: { coordinates: [levelStartPoints[2], levelEndPoints[2], levelEndPoints[3], levelStartPoints[3]] },
                styles: { style: 'stroke_fill', color: 'rgba(8, 153, 129, 0.22)', borderColor: 'transparent' }
              });

              // Band 3: Level 0.75 to 1.0 (Indigo/Blue Fill)
              figures.push({
                type: 'polygon',
                attrs: { coordinates: [levelStartPoints[3], levelEndPoints[3], levelEndPoints[4], levelStartPoints[4]] },
                styles: { style: 'stroke_fill', color: 'rgba(41, 98, 255, 0.18)', borderColor: 'transparent' }
              });

              // 2. Channel Lines
              // Outer Line 0.0 (Blue)
              figures.push({ type: 'line', attrs: { coordinates: [levelStartPoints[0], levelEndPoints[0]] }, styles: { color: '#2962ff', size: 2 } });
              // Inner Line 0.25 (Teal)
              figures.push({ type: 'line', attrs: { coordinates: [levelStartPoints[1], levelEndPoints[1]] }, styles: { color: '#089981', size: 1.5 } });
              // Center Median Line 0.5 (Red)
              figures.push({ type: 'line', attrs: { coordinates: [pBase, levelEndPoints[2]] }, styles: { color: '#f23645', size: 2 } });
              // Inner Line 0.75 (Teal)
              figures.push({ type: 'line', attrs: { coordinates: [levelStartPoints[3], levelEndPoints[3]] }, styles: { color: '#089981', size: 1.5 } });
              // Outer Line 1.0 (Blue)
              figures.push({ type: 'line', attrs: { coordinates: [levelStartPoints[4], levelEndPoints[4]] }, styles: { color: '#2962ff', size: 2 } });

              // 3. Red Guide Structure Lines (Matching Images 1-4)
              if (type === 'standard') {
                figures.push({ type: 'line', attrs: { coordinates: [p0, midP] }, styles: { color: '#f23645', size: 2 } });
                figures.push({ type: 'line', attrs: { coordinates: [p1, p2] }, styles: { color: '#f23645', size: 2 } });
              } else if (type === 'schiff') {
                figures.push({ type: 'line', attrs: { coordinates: [p0, pBase] }, styles: { color: '#f23645', size: 2 } });
                figures.push({ type: 'line', attrs: { coordinates: [pBase, midP] }, styles: { color: '#f23645', size: 2 } });
                figures.push({ type: 'line', attrs: { coordinates: [p1, p2] }, styles: { color: '#f23645', size: 2 } });
              } else if (type === 'modified') {
                figures.push({ type: 'line', attrs: { coordinates: [p0, p1] }, styles: { color: '#f23645', size: 2 } });
                figures.push({ type: 'line', attrs: { coordinates: [pBase, midP] }, styles: { color: '#f23645', size: 2 } });
                figures.push({ type: 'line', attrs: { coordinates: [p1, p2] }, styles: { color: '#f23645', size: 2 } });
              } else if (type === 'inside') {
                const m01 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
                figures.push({ type: 'line', attrs: { coordinates: [p0, p1] }, styles: { color: '#f23645', size: 2 } });
                figures.push({ type: 'line', attrs: { coordinates: [m01, p2] }, styles: { color: '#f23645', size: 2 } });
                figures.push({ type: 'line', attrs: { coordinates: [p1, p2] }, styles: { color: '#f23645', size: 2 } });
              }

              // 4. Interactive Handle Circles
              figures.push({ type: 'circle', attrs: { x: p0.x, y: p0.y, r: 6 }, styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 } });
              figures.push({ type: 'circle', attrs: { x: p1.x, y: p1.y, r: 6 }, styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 } });
              figures.push({ type: 'circle', attrs: { x: p2.x, y: p2.y, r: 6 }, styles: { style: 'stroke_fill', color: '#2196f3', borderColor: '#ffffff', borderSize: 2 } });
            } else if (coordinates.length === 2) {
              figures.push({ type: 'line', attrs: { coordinates }, styles: { color: '#f23645', size: 2 } });
            }
            return figures;
          };

          // Đăng ký Mô hình Pitchfork (Image 1)
          registerOverlay({
            name: 'pitchfork',
            totalStep: 4,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => drawPitchforkFigures(coordinates, 'standard')
          });

          // Đăng ký Mô hình Schiff Pitchfork (Image 2)
          registerOverlay({
            name: 'schiffPitchfork',
            totalStep: 4,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => drawPitchforkFigures(coordinates, 'schiff')
          });

          // Đăng ký Mô hình Schiff Pitchfork Biến đổi (Image 3)
          registerOverlay({
            name: 'modifiedSchiffPitchfork',
            totalStep: 4,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => drawPitchforkFigures(coordinates, 'modified')
          });

          // Đăng ký Mô hình Pitchfork mặt trong (Image 4)
          registerOverlay({
            name: 'insidePitchfork',
            totalStep: 4,
            needDefaultPointFigure: true,
            needDefaultXAxisFigure: true,
            needDefaultYAxisFigure: true,
            createPointFigures: ({ coordinates }) => drawPitchforkFigures(coordinates, 'inside')
          });

          interface ChartAreaProps {
            activeTool: string;
            selectedStock: Stock;
            activeTimeframe: string;
            isReplaying: boolean;
            replayIndex?: number;
            replayTime?: number | null;
            replayStepTrigger?: number;
            onReplayTimeChange?: (time: number) => void;
            tradeOrders: TradeOrder[];
            chartSettings: ChartSettings;
            pendingOrders?: any[];
            activeIndicators?: string[];
            activePosition?: { quantity: number; averagePrice: number; side: 'LONG' | 'SHORT'; leverage: number; tp?: number; sl?: number };
            onPriceChange?: (price: number) => void;
            onPriceUpdate?: (price: number, timestamp?: number) => void;
            isSelectingReplayStart?: boolean;
            onSelectReplayStart?: (timestamp: number) => void;
            goToRealtimeTrigger?: number;
            onDataLoaded?: (count: number) => void;
            onToolSelect?: (tool: string) => void;
            magnetMode?: boolean;
            stayInDrawingMode?: boolean;
            lockDrawing?: boolean;
            hideDrawing?: boolean;
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

          export const ChartArea = ({
            activeTool,
            onToolSelect,
            magnetMode,
            stayInDrawingMode,
            lockDrawing,
            hideDrawing,
            selectedStock,
            activeTimeframe,
            isReplaying,
            replayIndex = 0,
            replayTime,
            replayStepTrigger,
            onReplayTimeChange,
            tradeOrders,
            chartSettings,
            pendingOrders,
            activeIndicators = [],
            activePosition,
            onPriceUpdate,
            onPriceChange,
            isSelectingReplayStart,
            onSelectReplayStart,
            goToRealtimeTrigger,
            onDataLoaded,
            previewTPSL,
            onTPSLChange,
            undoTrigger,
            redoTrigger,
            onUndoRedoChange
          }: ChartAreaProps) => {
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

            // Overlay Settings Modal State
            const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
            const [activeSettingsTab, setActiveSettingsTab] = useState<'style' | 'text' | 'coords' | 'visibility'>('style');
            const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
            const [selectedOverlaySettings, setSelectedOverlaySettings] = useState<Partial<OverlaySettings>>({});
            const [floatingToolbar, setFloatingToolbar] = useState<{ overlayId: string, overlay: any, x: number, y: number } | null>(null);
            const [overlayPopup, setOverlayPopup] = useState<'color' | 'width' | 'style' | 'context' | 'templates' | null>(null);
            const [overlayColor, setOverlayColor] = useState('#2962ff');
            const [overlayOpacity, setOverlayOpacity] = useState(100);
            const [overlayLineWidth, setOverlayLineWidth] = useState(2);
            const [overlayLineStyle, setOverlayLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
            const [activeContextMenuSubMenu, setActiveContextMenuSubMenu] = useState<'visual_order' | 'timeframe_visibility' | 'templates' | null>(null);
            const onOverlayDoubleClickRef = useRef<((overlay: any, tab?: 'style' | 'text' | 'coords' | 'visibility') => void) | null>(null);
            const mousePosRef = useRef({ x: 0, y: 0 });
            const isOverlayClickRef = useRef(false);

            // Map: indicator name → sub-pane id (undefined = on main pane)
            const indicatorPaneRef = useRef<Map<string, string | undefined>>(new Map());

            useEffect(() => {
              isSelectingReplayStartRef.current = isSelectingReplayStart;
              onSelectReplayStartRef.current = onSelectReplayStart;
            }, [isSelectingReplayStart, onSelectReplayStart]);

            // Apply Lock All and Hide All Drawing Tools
            useEffect(() => {
              if (chartRef.current) {
                chartRef.current.overrideOverlay({ lock: lockDrawing });
              }
            }, [lockDrawing]);

            useEffect(() => {
              if (chartRef.current) {
                chartRef.current.overrideOverlay({ visible: !hideDrawing });
              }
            }, [hideDrawing]);

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

            const chartSettingsRef = useRef(chartSettings);
            useEffect(() => {
              chartSettingsRef.current = chartSettings;
            }, [chartSettings]);

            const updateCrosshairStyles = (chart: Chart | null, tool: string) => {
              if (!chart) return;
              const isHide = tool === 'cursor_arrow' || tool === 'cursor_dot' || tool === 'eraser';
              chart.setStyles({
                crosshair: {
                  show: !isHide,
                  horizontal: {
                    show: !isHide,
                    line: { show: !isHide },
                    text: { show: !isHide }
                  },
                  vertical: {
                    show: !isHide,
                    line: { show: !isHide },
                    text: { show: !isHide }
                  }
                }
              });
            };

            // Apply theme and chart settings dynamically to klinecharts
            useEffect(() => {
              const chart = chartRef.current;
              if (!chart || !chartSettings) return;

              const isDark = theme === 'dark';
              chart.setStyles(isDark ? 'dark' : 'light');

              // Resolve dynamic colors for light vs dark mode if using default dark palette
              const defaultGridDark = '#2a2e39';
              const hGridColor = (!isDark && chartSettings.canvas.hGridColor === defaultGridDark)
                ? '#f0f3f6'
                : chartSettings.canvas.hGridColor;
              const vGridColor = (!isDark && chartSettings.canvas.vGridColor === defaultGridDark)
                ? '#f0f3f6'
                : chartSettings.canvas.vGridColor;
              const textColor = (!isDark && chartSettings.scales.textColor === '#d1d4dc')
                ? '#50535e'
                : chartSettings.scales.textColor;
              const lineColor = (!isDark && chartSettings.scales.lineColor === defaultGridDark)
                ? '#e0e3eb'
                : chartSettings.scales.lineColor;

              chart.setStyles({
                grid: {
                  horizontal: {
                    show: chartSettings.canvas.hGridShow,
                    size: 1,
                    color: chartSettings.canvas.hGridShow ? hGridColor : 'transparent',
                    style: chartSettings.canvas.hGridStyle === '—' ? 'solid' : 'dashed',
                  },
                  vertical: {
                    show: chartSettings.canvas.vGridShow,
                    size: 1,
                    color: chartSettings.canvas.vGridShow ? vGridColor : 'transparent',
                    style: chartSettings.canvas.vGridStyle === '—' ? 'solid' : 'dashed',
                  }
                },
                candle: {
                  type: 'candle_solid',
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
                        let precision = getPricePrecision(d.close || selectedStock.price || 1);
                        const customPrecision = chartSettingsRef.current?.symbol?.precision;
                        if (customPrecision && customPrecision !== 'Default') {
                          if (customPrecision === '1') precision = 0;
                          else if (customPrecision === '1/10') precision = 1;
                          else if (customPrecision === '1/100') precision = 2;
                          else if (customPrecision === '1/1000') precision = 3;
                        }
                        return [
                          {
                            title: '',
                            value: {
                              text: `Time: ${time}   Open: ${Number(d.open).toFixed(precision)}   High: ${Number(d.high).toFixed(precision)}   Low: ${Number(d.low).toFixed(precision)}   Close: ${Number(d.close).toFixed(precision)}   Volume: ${(d.volume / 1000).toFixed(2)}K`,
                              color: isDark ? '#c4c6cb' : '#131722'
                            }
                          }
                        ];
                      }
                    }
                  },
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
                  },
                  priceMark: {
                    show: true,
                    high: {
                      show: chartSettings.scales.hlVal.includes('Labels') || chartSettings.scales.hlVal.includes('Lines'),
                      color: chartSettings.scales.hlColor,
                      textOffset: 5,
                      textSize: chartSettings.scales.textSize
                    },
                    low: {
                      show: chartSettings.scales.hlVal.includes('Labels') || chartSettings.scales.hlVal.includes('Lines'),
                      color: chartSettings.scales.hlColor,
                      textOffset: 5,
                      textSize: chartSettings.scales.textSize
                    },
                    last: {
                      show: chartSettings.scales.symbolVal !== 'Hidden',
                      upColor: chartSettings.scales.symbolLabelColor1,
                      downColor: chartSettings.scales.symbolLabelColor2,
                      noChangeColor: chartSettings.scales.symbolLabelColor2,
                      text: {
                        show: chartSettings.scales.symbolVal.includes('Value'),
                        size: chartSettings.scales.textSize,
                        family: 'Inter',
                        weight: 'normal'
                      }
                    }
                  }
                },
                indicator: {
                  tooltip: {
                    showRule: 'always'
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
                  axisLine: { color: lineColor },
                  tickText: { color: textColor, size: chartSettings.scales.textSize, family: 'Inter' },
                },
                yAxis: {
                  axisLine: { color: lineColor },
                  tickText: { color: textColor, size: chartSettings.scales.textSize, family: 'Inter' },
                }
              });

              updateCrosshairStyles(chart, activeToolRef.current);

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
            }, [theme, chartSettings]);

            // Init chart ONCE
            useEffect(() => {
              if (!chartContainerRef.current) return;

              // Register custom overlays before init
              registerOverlay(emojiMark);
              registerOverlay(measureOverlay);
              registerOverlay(zoomInOverlay);

              const chart = init(chartContainerRef.current, {
                formatter: {
                  formatDate: (params: any) => {
                    const settings = chartSettingsRef.current;
                    const tz = settings?.symbol?.timezone === 'Asia/Ho_Chi_Minh' ? 'Asia/Ho_Chi_Minh' : 'UTC';
                    const d = new Date(params.timestamp);
                    if (tz === 'Asia/Ho_Chi_Minh') {
                       d.setHours(d.getHours() + 7);
                    }
                    
                    let h = d.getHours();
                    const mm = d.getMinutes().toString().padStart(2, '0');
                    let suffix = '';
                    if (settings?.scales?.timeFormat === '12-hours') {
                       suffix = h >= 12 ? ' PM' : ' AM';
                       h = h % 12 || 12;
                    }
                    const hhStr = h.toString().padStart(2, '0');
                    const timeStr = `${hhStr}:${mm}${suffix}`;

                    const dd = d.getDate().toString().padStart(2, '0');
                    const moNum = (d.getMonth() + 1).toString().padStart(2, '0');
                    const yyyy = d.getFullYear();
                    const shortYear = yyyy.toString().slice(2);
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const moName = monthNames[d.getMonth()];
                    const dayName = dayNames[d.getDay()];

                    let dateStr = `${dd}/${moNum}/${yyyy}`; // default
                    const dFmt = settings?.scales?.dateFormat;
                    if (dFmt === "Mon 29 Sep '97") dateStr = `${dayName} ${dd} ${moName} '${shortYear}`;
                    else if (dFmt === "29 Sep '97") dateStr = `${dd} ${moName} '${shortYear}`;
                    else if (dFmt === "Sep '97") dateStr = `${moName} '${shortYear}`;
                    else if (dFmt === "09/29/1997") dateStr = `${moNum}/${dd}/${yyyy}`;
                    else if (dFmt === "29/09/1997") dateStr = `${dd}/${moNum}/${yyyy}`;
                    else if (dFmt === "1997-09-29") dateStr = `${yyyy}-${moNum}-${dd}`;
                    
                    if (settings?.scales?.dayOfWeek === false && dateStr.includes(dayName)) {
                      dateStr = dateStr.replace(`${dayName} `, '');
                    }

                    const tf = activeTimeframeRef.current || 'D';
                    const isIntraday = tf.endsWith('m') || tf.endsWith('h');
                    
                    if (params.type === 'crosshair' || params.type === 'tooltip') {
                      return isIntraday ? `${dateStr} ${timeStr}` : dateStr;
                    }

                    if (isIntraday) {
                       return `${dd}/${moNum} ${timeStr}`;
                    } else {
                      return dateStr;
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
              globalChartInstance = chart;

              // Overlay click state tracking
              const lastOverlayClickTimeRef = { current: 0 };
              const lastOverlayClickIdRef = { current: '' };

              const handleOverlayClick = (event: any) => {
                isOverlayClickRef.current = true;
                const now = Date.now();
                const overlayId = event?.overlay?.id;

                // If Eraser tool is active, delete it immediately!
                if (activeToolRef.current === 'eraser') {
                  if (overlayId) chartRef.current?.removeOverlay(overlayId);
                  return true; // prevent default behavior
                }

                if (overlayId && overlayId === lastOverlayClickIdRef.current && (now - lastOverlayClickTimeRef.current) < 500) {
                  // Double click detected!
                  onOverlayDoubleClickRef.current?.(event.overlay);
                  setFloatingToolbar(null);
                } else {
                  // Single click - show floating toolbar
                  if (overlayId) {
                    const styles = event.overlay?.styles || {};
                    const line = styles.line || {};
                    if (line.color) setOverlayColor(line.color);
                    if (line.size) setOverlayLineWidth(line.size);
                    if (line.style) setOverlayLineStyle(line.style === 'dashed' ? 'dashed' : line.style === 'dotted' ? 'dotted' : 'solid');

                    setFloatingToolbar({
                      overlayId,
                      overlay: event.overlay,
                      x: mousePosRef.current.x,
                      y: mousePosRef.current.y
                    });
                    setOverlayPopup(null);
                  }
                }

                lastOverlayClickTimeRef.current = now;
                lastOverlayClickIdRef.current = overlayId || '';
                return false;
              };

              // Attach handleOverlayClick to chart context so it can be used later
              (chart as any).handleOverlayClick = handleOverlayClick;

              // Listen for overlay finished event to re-activate same tool
              chart.subscribeAction('onOverlayDrawEnd' as any, () => {
                const currentTool = activeToolRef.current;
                if (currentTool !== 'cursor' && currentTool !== 'clear') {
                  // Small delay then re-create overlay to keep tool active
                  setTimeout(() => {
                    chart.createOverlay({
                      name: currentTool,
                      lock: false,
                      onClick: handleOverlayClick,
                      onRightClick: () => false // prevent default right-click remove
                    });
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

              // Bind double click handler logic
              onOverlayDoubleClickRef.current = (overlay: any, tab: 'style' | 'text' | 'coords' | 'visibility' = 'style') => {
                setSelectedOverlayId(overlay.id);

                // Extract current styles and points from overlay
                const styles = overlay.styles || {};
                const line = styles.line || {};
                const text = styles.text || {};
                const points = overlay.points || [];

                const titleMap: Record<string, string> = {
                  segment: 'Đường Xu hướng',
                  rayLine: 'Tia',
                  infoLine: 'Đường Thông tin',
                  straightLine: 'Đường Mở rộng',
                  trendAngle: 'Góc Xu hướng',
                  horizontalStraightLine: 'Đường nằm ngang',
                  horizontalRayLine: 'Tia nằm ngang',
                  verticalStraightLine: 'Đường thẳng đứng',
                  crossLine: 'Đường giao nhau',
                  priceChannelLine: 'Kênh Song song',
                  pitchfork: 'Mô hình Pitchfork',
                  schiffPitchfork: 'Mô hình Schiff Pitchfork',
                  modifiedSchiffPitchfork: 'Mô hình Schiff Pitchfork Biến đổi',
                  insidePitchfork: 'Mô hình Pitchfork mặt trong',
                  simpleAnnotation: 'Văn bản',
                  callout: 'Chú thích',
                  note: 'Ghi chú',
                  priceNote: 'Ghi chú Giá',
                  pinMark: 'Mã Pin',
                  tableMark: 'Bảng',
                  arrow: 'Mũi tên',
                  arrowMarker: 'Mũi tên đánh dấu',
                  arrowUp: 'Mũi tên chỉ lên',
                  arrowDown: 'Mũi tên chỉ xuống',
                  arrowLeft: 'Mũi tên chỉ sang trái',
                  arrowRight: 'Mũi tên chỉ sang phải',
                  rect: 'Hình chữ nhật',
                  circle: 'Vòng tròn',
                  polyline: 'Hình Polyline',
                  triangle: 'Hình tam giác',
                  xabcd: 'Mẫu hình XABCD',
                  abcd: 'Mẫu hình ABCD',
                  elliottImpulse: 'Sóng đẩy Elliott (12345)',
                  elliottTriangle: 'Sóng điều chỉnh Elliott (ABC)',
                  elliottABCDE: 'Sóng Elliott Tam giác (ABCDE)',
                  elliottWXY: 'Sóng đôi kết hợp Elliott (WXY)',
                  elliottTriple: 'Sóng Elliott kết hợp ba (WXYXZ)',
                  cycleLines: 'Các đường chu kỳ',
                  timeCycles: 'Vòng thời gian',
                  sineLine: 'Đường Sine',
                  longPosition: 'Thế giá lên',
                  shortPosition: 'Thế giá xuống',
                  forecast: 'Dự đoán',
                  barsPattern: 'Mẫu hình Thanh',
                  ghostFeed: 'Mô hình Ghost Feed',
                  measure: 'Đo lường'
                };

                setSelectedOverlaySettings({
                  title: titleMap[overlay.name] || overlay.name || 'Cài đặt hình vẽ',
                  lineColor: line.color || '#2962ff',
                  lineSize: line.size || 1,
                  lineStyle: line.style === 'dashed' ? 'dashed' : 'solid',
                  extendLeft: !!overlay.extendLeft,
                  extendRight: !!overlay.extendRight,
                  showMiddlePoint: !!overlay.showMiddlePoint,
                  leftCap: !!overlay.leftCap,
                  rightCap: !!overlay.rightCap,

                  enableText: true,
                  textContent: typeof overlay.extendData === 'string' && overlay.extendData && overlay.extendData !== '0.00' ? overlay.extendData : (
                    (points && (points[1] || points[0]) && typeof (points[1] || points[0]).value === 'number' && (points[1] || points[0]).value !== 0)
                      ? (points[1] || points[0]).value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : (
                        points && (points[1] || points[0]) && typeof (points[1] || points[0]).dataIndex === 'number' && chartRef.current?.getDataList()?.[(points[1] || points[0]).dataIndex]?.close
                          ? chartRef.current.getDataList()[(points[1] || points[0]).dataIndex].close.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : 'Thêm văn bản'
                      )
                  ),
                  textColor: text.color || '#2962ff',
                  textSize: text.size || 14,
                  isBold: text.weight === 'bold',
                  isItalic: text.style === 'italic',
                  vAlign: text.vAlign || 'top',
                  hAlign: text.hAlign || 'center',
                  textPosition: 'middle',

                  point1Price: points[0]?.value ?? 278.784,
                  point1Bar: points[0]?.dataIndex ?? 260,
                  point2Price: points[1]?.value ?? 291.970,
                  point2Bar: points[1]?.dataIndex ?? 291,
                });
                setActiveSettingsTab(tab);
                setIsSettingsModalOpen(true);
              };

              const handleChartClick = () => {
                if (isOverlayClickRef.current) {
                  isOverlayClickRef.current = false;
                  return;
                }
                setFloatingToolbar(null);
                setOverlayPopup(null);
                setActiveContextMenuSubMenu(null);
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

            const handleSaveOverlaySettings = (settings: OverlaySettings) => {
              const chart = chartRef.current;
              if (!chart || !selectedOverlayId) return;

              chart.overrideOverlay({
                id: selectedOverlayId,
                extendData: settings.textContent || settings.enableText ? settings.textContent : '',
                styles: {
                  line: {
                    color: settings.lineColor,
                    size: settings.lineSize,
                    style: settings.lineStyle === 'dashed' ? 'dashed' : settings.lineStyle === 'dotted' ? 'dashed' : 'solid'
                  },
                  text: {
                    color: settings.textColor,
                    size: settings.textSize,
                    weight: settings.isBold ? 'bold' : 'normal',
                    style: settings.isItalic ? 'italic' : 'normal',
                    position: settings.textPosition || 'middle',
                    paddingLeft: 4, paddingRight: 4, paddingTop: 4, paddingBottom: 4,
                    borderRadius: 4,
                    backgroundColor: (settings.enableText && settings.textContent) ? (theme === 'dark' ? 'rgba(30, 34, 45, 0.85)' : 'rgba(255, 255, 255, 0.85)') : 'transparent',
                    borderSize: (settings.enableText && settings.textContent) ? 1 : 0,
                    borderColor: settings.lineColor
                  } as any
                }
              });
            };

            // Sync activeTool to ref so the closure can access it
            useEffect(() => {
              activeToolRef.current = activeTool;
              const chart = chartRef.current;
              if (!chart) return;

              updateCrosshairStyles(chart, activeTool);

              if (activeTool === 'clear') {
                chart.removeOverlay();
              } else if (activeTool === 'cursor' || activeTool === 'cursor_group' || activeTool === 'cursor_dot' || activeTool === 'cursor_arrow' || activeTool === 'eraser') {
                // Cancel active overlay creation mode
              } else if (activeTool.startsWith('emojiMark:')) {
                const emoji = activeTool.split(':')[1];
                chart.createOverlay({
                  name: 'emojiMark',
                  extendData: emoji,
                  lock: false,
                  styles: {
                    text: {
                      backgroundColor: 'transparent',
                      borderColor: 'transparent',
                      borderSize: 0,
                      borderRadius: 0,
                      paddingLeft: 0,
                      paddingRight: 0,
                      paddingTop: 0,
                      paddingBottom: 0
                    }
                  },
                  onClick: (chart as any).handleOverlayClick,
                  onRightClick: () => false
                });
              } else if (activeTool === 'priceLine') {
                chart.createOverlay({
                  name: 'measure',
                  lock: false,
                  onClick: (chart as any).handleOverlayClick,
                  onRightClick: () => false
                });
              } else if (activeTool === 'zoomIn') {
                chart.createOverlay({
                  name: 'zoomInBox',
                  lock: false,
                  onDrawEnd: (event: any) => {
                    const overlay = event.overlay;
                    const points = overlay.points;
                    if (points && points.length === 2) {
                      const startIdx = points[0].dataIndex;
                      const endIdx = points[1].dataIndex;
                      const count = Math.abs(endIdx - startIdx) || 1;

                      const width = chartContainerRef.current?.clientWidth || 800;
                      const space = width / count;

                      chart.setBarSpace(space);

                      const dataList = chart.getDataList();
                      const maxIdx = Math.max(startIdx, endIdx);
                      const offset = (dataList.length - 1 - maxIdx) * space;
                      chart.setOffsetRightDistance(offset);

                      // Xóa hộp zoom đi sau khi zoom xong
                      chart.removeOverlay(overlay.id);
                      onToolSelect?.('cursor');
                    }
                  },
                  onRightClick: () => false
                });
              } else {
                let overlayName = activeTool;
                if (activeTool === 'highlighter') {
                  const createHighlighterOverlay = () => {
                    chart.createOverlay({
                      name: 'brush',
                      styles: { line: { color: 'rgba(255, 235, 59, 0.5)', size: 10 } },
                      lock: lockDrawing,
                      visible: !hideDrawing,
                      mode: magnetMode ? 'weak_magnet' : 'normal',
                      onClick: (chart as any).handleOverlayClick,
                      onDrawEnd: () => {
                        if (stayInDrawingMode || activeToolRef.current === 'highlighter') {
                          setTimeout(() => {
                            if (chartRef.current && activeToolRef.current === 'highlighter') {
                              createHighlighterOverlay();
                            }
                          }, 20);
                        } else {
                          onToolSelect?.('cursor');
                        }
                      },
                      onRightClick: () => false
                    });
                  };
                  createHighlighterOverlay();
                  return;
                } else if (activeTool === 'horizontalLine') {
                  overlayName = 'horizontalStraightLine';
                } else if (activeTool === 'verticalLine') {
                  overlayName = 'verticalStraightLine';
                } else if (activeTool === 'ray') {
                  overlayName = 'rayLine';
                } else if (activeTool === 'arrowUp') {
                  overlayName = 'arrowUp';
                } else if (activeTool === 'arrowDown') {
                  overlayName = 'arrowDown';
                } else if (activeTool === 'arrowLeft') {
                  overlayName = 'arrowLeft';
                } else if (activeTool === 'arrowRight') {
                  overlayName = 'arrowRight';
                } else if (activeTool === 'arrowMarker') {
                  overlayName = 'arrowMarker';
                } else if (activeTool === 'arrow') {
                  overlayName = 'arrow';
                } else if (['rotatedRect', 'ellipse', 'path', 'polyline', 'arc', 'curve', 'doubleCurve', 'cypher', 'threeDrives', 'headAndShoulders', 'longPosition', 'shortPosition', 'forecast', 'barsPattern', 'ghostFeed', 'rect', 'triangle', 'xabcd', 'abcd', 'elliottImpulse', 'elliottTriangle', 'elliottABCDE', 'elliottWXY', 'elliottTriple', 'cycleLines', 'timeCycles', 'sineLine'].includes(activeTool)) {
                  overlayName = activeTool;
                } else if (activeTool === 'circle') {
                  overlayName = 'circleMark';
                } else if (['pitchfork', 'schiffPitchfork', 'modifiedSchiffPitchfork', 'insidePitchfork'].includes(activeTool)) {
                  overlayName = activeTool;
                } else if (['priceChannelLine', 'regressionTrend', 'flatTopBottom', 'disjointChannel'].includes(activeTool)) {
                  overlayName = activeTool;
                } else if (activeTool === 'trendAngle') {
                  overlayName = 'trendAngle';
                } else if (activeTool === 'infoLine') {
                  overlayName = 'infoLine';
                } else if (activeTool === 'priceNote') {
                  overlayName = 'priceNote';
                } else if (activeTool === 'note') {
                  overlayName = 'note';
                } else if (activeTool === 'pinMark') {
                  overlayName = 'pinMark';
                } else if (activeTool === 'tableMark') {
                  overlayName = 'tableMark';
                } else if (activeTool === 'callout') {
                  overlayName = 'callout';
                } else if (activeTool === 'comment') {
                  overlayName = 'comment';
                } else if (activeTool === 'priceLabel') {
                  overlayName = 'priceLabel';
                } else if (activeTool === 'signpost') {
                  overlayName = 'signpost';
                } else if (activeTool === 'flagMark') {
                  overlayName = 'flagMark';
                } else if (['anchoredText'].includes(activeTool)) {
                  overlayName = 'simpleAnnotation';
                }

                const createStandardOverlay = () => {
                  chart.createOverlay({
                    name: overlayName,
                    lock: lockDrawing,
                    visible: !hideDrawing,
                    mode: magnetMode ? 'weak_magnet' : 'normal',
                    onClick: (chart as any).handleOverlayClick,
                    onDrawEnd: (event: any) => {
                      const isContinuousTool = ['brush', 'highlighter', 'path', 'polyline'].includes(activeToolRef.current);
                      if (stayInDrawingMode || isContinuousTool) {
                        setTimeout(() => {
                          if (chartRef.current && activeToolRef.current === activeTool) {
                            createStandardOverlay();
                          }
                        }, 20);
                      } else {
                        onToolSelect?.('cursor');
                      }
                    },
                    onRightClick: () => false // prevent default right-click remove
                  });
                };
                createStandardOverlay();
              }
            }, [activeTool, magnetMode, stayInDrawingMode]);

            // Apply Lock All and Hide All Drawing Tools to existing overlays
            useEffect(() => {
              if (chartRef.current) {
                chartRef.current.overrideOverlay({ lock: lockDrawing, visible: !hideDrawing, mode: magnetMode ? 'weak_magnet' : 'normal' });
              }
            }, [lockDrawing, hideDrawing, magnetMode]);

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
                if (onPriceUpdate) onPriceUpdate(nextBar.close, nextBar.timestamp);
                replayTimeRef.current = nextBar.timestamp;
                onReplayTimeChangeRef.current?.(nextBar.timestamp);
              }
            }, [replayStepTrigger]);

            // Send price update on replay index change to tick the simulator
            useEffect(() => {
              if (isReplaying) {
                const cacheKey = `${selectedStock.symbol}-${activeTimeframe}`;
                const allData = dataCache.get(cacheKey) || [];
                if (allData.length > 0) {
                  const currentIdx = Math.max(0, Math.min(allData.length - 1, Math.max(5, replayIndex) - 1));
                  const currentCandle = allData[currentIdx];
                  if (currentCandle && onPriceUpdate) {
                    onPriceUpdate(currentCandle.close, currentCandle.timestamp);
                  }
                }
              }
            }, [replayIndex, isReplaying, selectedStock.symbol, activeTimeframe]);

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
                } else if (selectedStock.market === 'Cổ phiếu' || selectedStock.market === 'Chỉ số') {
                  // Lấy dữ liệu thật từ VNDirect qua Backend API
                  try {
                    const fromSec = (isReplaying && currentReplayTime)
                      ? Math.floor((currentReplayTime - 365 * 24 * 3600 * 1000) / 1000)
                      : undefined;
                    const toSec = (isReplaying && currentReplayTime)
                      ? Math.floor((currentReplayTime + 300 * intervalMs) / 1000)
                      : undefined;

                    allData = await fetchVnStockKlines({
                      symbol: selectedStock.symbol,
                      timeframe: activeTimeframe,
                      from: fromSec,
                      to: toSec
                    });
                  } catch (error) {
                    console.warn(`Failed to fetch VN klines for ${selectedStock.symbol}:`, error);
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

            const priceColor = selectedStock.percent > 0 ? 'text-[#089981]' : selectedStock.percent < 0 ? 'text-[#f23645]' : 'text-[#787b86]';
            const isDark = theme === 'dark';
            const isDefaultDarkBg = chartSettings.canvas.bgSolid === '#131722' || 
              (chartSettings.canvas.bgGradientTop === '#131722' && chartSettings.canvas.bgGradientBottom === '#1e222d');

            let bgStyle: React.CSSProperties = {};
            if (!isDark && isDefaultDarkBg) {
              bgStyle = { backgroundColor: '#ffffff' };
            } else if (chartSettings.canvas.bgType === 'Solid') {
              bgStyle = { backgroundColor: chartSettings.canvas.bgSolid };
            } else {
              bgStyle = { background: `linear-gradient(to bottom, ${chartSettings.canvas.bgGradientTop}, ${chartSettings.canvas.bgGradientBottom})` };
            }

            return (
              <div
                className="flex-1 flex flex-col min-h-0 relative transition-colors"
                style={bgStyle}
                onMouseMove={(e) => { mousePosRef.current = { x: e.clientX, y: e.clientY }; }}
              >
                {/* Symbol header */}
                <div className="absolute top-2 left-4 z-10 pointer-events-none flex items-baseline gap-2 flex-wrap">
                  {['Ticker', 'Ticker and description', 'Name'].includes(chartSettings.status.title) && (
                    <span className="text-[#131722] dark:text-white font-bold text-sm">{selectedStock.symbol}</span>
                  )}
                  {['Description', 'Ticker and description'].includes(chartSettings.status.title) && (
                    <span className="text-gray-500 dark:text-[#787b86] text-xs">{selectedStock.name}</span>
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
                    <span className="text-gray-500 dark:text-[#787b86] text-xs ml-2">Vol: {(dataCache.get(`${selectedStock.symbol}-${activeTimeframe}`)?.slice(-1)[0]?.volume || 0).toFixed(0)}</span>
                  )}
                </div>

                {/* Watermark overlay */}
                {chartSettings.canvas.watermarkVal !== 'Hidden' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1] overflow-hidden opacity-[0.03]">
                    <span className="text-[120px] font-bold text-gray-900 dark:text-white select-none whitespace-nowrap">
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
                    Bar Replay — Cây nến thứ {replayIndex} / {dataCache.get(`${selectedStock.symbol}-${activeTimeframe}`)?.length || 300}
                  </div>
                )}

                {/* Replay Instructions / Banner */}
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

                <style>{`
        .cursor-mode-arrow, .cursor-mode-arrow * {
          cursor: default !important;
        }
        .cursor-mode-dot, .cursor-mode-dot * {
          cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><circle cx='8' cy='8' r='4' fill='%232196f3' stroke='%23ffffff' stroke-width='1.5'/></svg>") 8 8, crosshair !important;
        }
        .cursor-mode-eraser, .cursor-mode-eraser * {
          cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23f23645' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m7 21-4-4 11-11 7 7L10 24z'/><path d='m14 6 4 4'/><path d='M22 21H7'/></svg>") 4 16, pointer !important;
        }
        .cursor-mode-crosshair, .cursor-mode-crosshair * {
          cursor: crosshair !important;
        }
      `}</style>

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
                      className={`p-1 rounded transition-colors ${selectedOverlay.extendData?.showBackground !== false
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
                      className={`p-1.5 rounded transition-colors ${selectedOverlay.lock ? 'text-amber-400 bg-amber-500/10' : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
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
                  className={`${isSelectingReplayStart ? 'cursor-crosshair' : ''} ${activeTool === 'cursor_arrow' ? 'cursor-mode-arrow' :
                    activeTool === 'cursor_dot' ? 'cursor-mode-dot' :
                      activeTool === 'eraser' ? 'cursor-mode-eraser' : 'cursor-mode-crosshair'
                    }`}
                  style={{ position: 'absolute', top: `${chartSettings.canvas.marginTop}%`, left: 0, right: 0, bottom: `${chartSettings.canvas.marginBottom}%` }}
                />

                {/* Selection Mode Overlay / Indicator */}
                {isSelectingReplayStart && (
                  <div className="absolute inset-0 border-4 border-blue-500/30 pointer-events-none rounded transition-all animate-pulse z-10" />
                )}

                {/* Floating Toolbar for Overlays */}
                {floatingToolbar && (
                  <>
                    <div
                      className="fixed z-50 flex items-center bg-white dark:bg-[#1e222d] shadow-2xl rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] py-1 px-1.5 gap-1 select-none"
                      style={{ top: Math.max(10, floatingToolbar.y - 65), left: Math.max(10, floatingToolbar.x - 120) }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Drag Handle */}
                      <div
                        className="p-1 cursor-grab active:cursor-grabbing text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const initialX = floatingToolbar.x;
                          const initialY = floatingToolbar.y;

                          const onMouseMove = (moveEvent: MouseEvent) => {
                            const dx = moveEvent.clientX - startX;
                            const dy = moveEvent.clientY - startY;
                            setFloatingToolbar(prev => prev ? { ...prev, x: initialX + dx, y: initialY + dy } : null);
                          };

                          const onMouseUp = () => {
                            window.removeEventListener('mousemove', onMouseMove);
                            window.removeEventListener('mouseup', onMouseUp);
                          };

                          window.addEventListener('mousemove', onMouseMove);
                          window.addEventListener('mouseup', onMouseUp);
                        }}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Templates button (4 squares icon) */}
                      <button
                        title="Bản mẫu"
                        onClick={() => setOverlayPopup(prev => prev === 'templates' ? null : 'templates')}
                        className={`p-1.5 rounded transition-colors ${overlayPopup === 'templates' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' : 'text-[#787b86] hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'}`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>

                      {/* Color Picker button (pencil with color underline) */}
                      <button
                        title="Màu sắc và Độ mờ"
                        onClick={() => setOverlayPopup(prev => prev === 'color' ? null : 'color')}
                        className={`p-1.5 rounded transition-colors relative flex flex-col items-center justify-center ${overlayPopup === 'color' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' : 'text-[#787b86] hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'}`}
                      >
                        <Pencil className="w-4 h-4" />
                        <div className="w-3.5 h-0.5 rounded-full mt-0.5" style={{ backgroundColor: overlayColor }} />
                      </button>

                      {/* Text button / Ghi tên (T icon) */}
                      <button
                        title="Cài đặt văn bản / Ghi tên"
                        onClick={() => {
                          if (floatingToolbar?.overlay) {
                            onOverlayDoubleClickRef.current?.(floatingToolbar.overlay, 'text');
                            setOverlayPopup(null);
                          }
                        }}
                        className="p-1.5 rounded transition-colors text-[#787b86] hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] hover:text-blue-500 flex items-center justify-center"
                      >
                        <Type className="w-4 h-4" />
                      </button>

                      {/* Line Width button (e.g. 2px) */}
                      <button
                        title="Độ dày nét"
                        onClick={() => setOverlayPopup(prev => prev === 'width' ? null : 'width')}
                        className={`px-2 py-1 text-xs font-mono font-semibold rounded transition-colors ${overlayPopup === 'width' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' : 'text-[#787b86] hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'}`}
                      >
                        {overlayLineWidth}px
                      </button>

                      {/* Line Style button */}
                      <button
                        title="Kiểu nét"
                        onClick={() => setOverlayPopup(prev => prev === 'style' ? null : 'style')}
                        className={`p-1.5 rounded transition-colors font-mono font-bold text-xs ${overlayPopup === 'style' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' : 'text-[#787b86] hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'}`}
                      >
                        {overlayLineStyle === 'dashed' ? '---' : overlayLineStyle === 'dotted' ? '····' : '—'}
                      </button>

                      <div className="w-[1px] h-4 bg-[#e6e8ea] dark:bg-[#2a2e39] mx-0.5" />

                      {/* Lock */}
                      <button
                        title={floatingToolbar.overlay.lock ? "Mở khóa" : "Khóa"}
                        onClick={() => {
                          const newLockStatus = !floatingToolbar.overlay.lock;
                          chartRef.current?.overrideOverlay({ id: floatingToolbar.overlayId, lock: newLockStatus });
                          setFloatingToolbar(prev => prev ? { ...prev, overlay: { ...prev.overlay, lock: newLockStatus } } : null);
                        }}
                        className={`p-1.5 rounded transition-colors ${floatingToolbar.overlay.lock ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-[#787b86] hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] hover:text-blue-500'}`}
                      >
                        {floatingToolbar.overlay.lock ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>

                      {/* Trash */}
                      <button
                        title="Xóa"
                        onClick={() => {
                          chartRef.current?.removeOverlay({ id: floatingToolbar.overlayId });
                          setFloatingToolbar(null);
                        }}
                        className="p-1.5 text-[#787b86] hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* More options (...) */}
                      <button
                        title="Tùy chọn khác"
                        onClick={() => setOverlayPopup(prev => prev === 'context' ? null : 'context')}
                        className={`p-1.5 rounded transition-colors ${overlayPopup === 'context' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' : 'text-[#787b86] hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'}`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Color Picker Popup */}
                    {overlayPopup === 'color' && (
                      <div
                        className="fixed z-50 bg-white dark:bg-[#1e222d] shadow-2xl rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] p-3 flex flex-col gap-3 w-64 select-none"
                        style={{ top: Math.max(10, floatingToolbar.y - 350), left: Math.max(10, floatingToolbar.x - 60) }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="grid grid-cols-8 gap-1.5">
                          {COLOR_PALETTE_GRID.flatMap(row => row).map((c, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setOverlayColor(c);
                                chartRef.current?.overrideOverlay({
                                  id: floatingToolbar.overlayId,
                                  styles: { line: { color: hexToRgba(c, overlayOpacity / 100) } }
                                });
                              }}
                              className={`w-5 h-5 rounded-sm transition-transform hover:scale-110 relative ${overlayColor === c ? 'ring-2 ring-blue-500 z-10' : ''}`}
                              style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #d1d4dc' : 'none' }}
                            />
                          ))}
                        </div>

                        <div className="w-full h-[1px] bg-[#e6e8ea] dark:bg-[#2a2e39]" />

                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'color';
                            input.value = overlayColor;
                            input.onchange = (e: any) => {
                              const newC = e.target.value;
                              setOverlayColor(newC);
                              chartRef.current?.overrideOverlay({
                                id: floatingToolbar.overlayId,
                                styles: { line: { color: hexToRgba(newC, overlayOpacity / 100) } }
                              });
                            };
                            input.click();
                          }}
                          className="flex items-center justify-center p-1.5 rounded hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#787b86] dark:text-[#d1d4dc] transition-colors"
                          title="Thêm màu tùy chỉnh"
                        >
                          <Plus className="w-5 h-5" />
                        </button>

                        <div className="w-full h-[1px] bg-[#e6e8ea] dark:bg-[#2a2e39]" />

                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs text-[#787b86]">
                            <span>Độ mờ</span>
                            <span className="font-mono text-[#1e2329] dark:text-white font-semibold">{overlayOpacity}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={overlayOpacity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setOverlayOpacity(val);
                                chartRef.current?.overrideOverlay({
                                  id: floatingToolbar.overlayId,
                                  styles: { line: { color: hexToRgba(overlayColor, val / 100) } }
                                });
                              }}
                              className="flex-1 h-1.5 bg-[#e6e8ea] dark:bg-[#2a2e39] rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="px-2 py-0.5 bg-[#f0f3fa] dark:bg-[#131722] border border-[#e6e8ea] dark:border-[#2a2e39] rounded text-xs font-mono text-[#1e2329] dark:text-white w-12 text-center">
                              {overlayOpacity}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Line Style Popup */}
                    {overlayPopup === 'style' && (
                      <div
                        className="fixed z-50 bg-white dark:bg-[#1e222d] shadow-2xl rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] py-1 w-52 flex flex-col select-none text-xs text-[#1e2329] dark:text-[#d1d4dc]"
                        style={{ top: Math.max(10, floatingToolbar.y - 140), left: Math.max(10, floatingToolbar.x + 30) }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {[
                          { id: 'solid', label: 'Đường thẳng', val: 'solid', icon: <div className="w-6 h-[2px] bg-current" /> },
                          { id: 'dashed', label: 'Đường Đứt nét', val: 'dashed', icon: <div className="w-6 h-[2px] border-b-2 border-dashed border-current" /> },
                          { id: 'dotted', label: 'Đường chấm chấm', val: 'dotted', icon: <div className="w-6 h-[2px] border-b-2 border-dotted border-current" /> }
                        ].map(item => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setOverlayLineStyle(item.val as any);
                              chartRef.current?.overrideOverlay({
                                id: floatingToolbar.overlayId,
                                styles: {
                                  line: {
                                    style: item.val === 'solid' ? 'solid' : 'dashed',
                                    dashedValue: item.val === 'dotted' ? [2, 3] : [6, 6]
                                  } as any
                                }
                              });
                              setOverlayPopup(null);
                            }}
                            className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] ${overlayLineStyle === item.val ? 'text-blue-500 font-semibold bg-blue-50/50 dark:bg-blue-900/20' : 'text-[#1e2329] dark:text-[#d1d4dc]'}`}
                          >
                            <span className="text-[#787b86] dark:text-[#a3a6af] shrink-0">{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Line Width Popup */}
                    {overlayPopup === 'width' && (
                      <div
                        className="fixed z-50 bg-white dark:bg-[#1e222d] shadow-2xl rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] py-1 w-32 flex flex-col select-none"
                        style={{ top: Math.max(10, floatingToolbar.y - 170), left: Math.max(10, floatingToolbar.x) }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {[1, 2, 3, 4].map(w => (
                          <button
                            key={w}
                            onClick={() => {
                              setOverlayLineWidth(w);
                              chartRef.current?.overrideOverlay({
                                id: floatingToolbar.overlayId,
                                styles: { line: { size: w } }
                              });
                              setOverlayPopup(null);
                            }}
                            className={`flex items-center justify-between px-4 py-2 text-xs transition-colors hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] ${overlayLineWidth === w ? 'text-blue-500 font-semibold bg-blue-50/50 dark:bg-blue-900/20' : 'text-[#1e2329] dark:text-[#d1d4dc]'}`}
                          >
                            <span>{w}px</span>
                            <div className="bg-current rounded-full" style={{ height: w, width: 24 }} />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Context Menu Popup */}
                    {overlayPopup === 'context' && (
                      <div
                        className="fixed z-50 bg-white dark:bg-[#1e222d] shadow-2xl rounded-lg border border-[#e6e8ea] dark:border-[#2a2e39] py-1.5 w-64 flex flex-col text-xs text-[#1e2329] dark:text-[#d1d4dc] select-none"
                        style={{ top: Math.max(10, floatingToolbar.y - 320), left: Math.max(10, floatingToolbar.x + (floatingToolbar.x > window.innerWidth - 320 ? -200 : 80)) }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Submenu 1: Bản mẫu */}
                        <div
                          className="relative group"
                          onMouseEnter={() => setActiveContextMenuSubMenu('templates')}
                        >
                          <button
                            onClick={() => setActiveContextMenuSubMenu(prev => prev === 'templates' ? null : 'templates')}
                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] transition-colors"
                          >
                            <span>Bản mẫu</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#787b86]" />
                          </button>
                          {activeContextMenuSubMenu === 'templates' && (
                            <div className={`absolute top-0 ${floatingToolbar.x > window.innerWidth - 320 ? '-left-48' : 'left-full ml-1'} bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded-lg shadow-2xl py-1 w-48 z-50`}>
                              <button
                                onClick={() => {
                                  chartRef.current?.overrideOverlay({
                                    id: floatingToolbar.overlayId,
                                    styles: { line: { color: '#2962ff', size: 1, style: 'solid' } }
                                  });
                                  setOverlayPopup(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]"
                              >
                                Áp dụng Mặc định
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Submenu 2: Thứ tự Trực quan */}
                        <div
                          className="relative group"
                          onMouseEnter={() => setActiveContextMenuSubMenu('visual_order')}
                        >
                          <button
                            onClick={() => setActiveContextMenuSubMenu(prev => prev === 'visual_order' ? null : 'visual_order')}
                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] transition-colors"
                          >
                            <span>Thứ tự Trực quan</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#787b86]" />
                          </button>
                          {activeContextMenuSubMenu === 'visual_order' && (
                            <div className={`absolute top-0 ${floatingToolbar.x > window.innerWidth - 320 ? '-left-48' : 'left-full ml-1'} bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded-lg shadow-2xl py-1 w-48 z-50`}>
                              <button
                                onClick={() => {
                                  chartRef.current?.overrideOverlay({ id: floatingToolbar.overlayId, zGroupId: 100 } as any);
                                  setOverlayPopup(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]"
                              >
                                Đưa lên phía trước
                              </button>
                              <button
                                onClick={() => {
                                  chartRef.current?.overrideOverlay({ id: floatingToolbar.overlayId, zGroupId: -100 } as any);
                                  setOverlayPopup(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]"
                              >
                                Gửi lại
                              </button>
                              <button
                                onClick={() => {
                                  chartRef.current?.overrideOverlay({ id: floatingToolbar.overlayId, zGroupId: 10 } as any);
                                  setOverlayPopup(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]"
                              >
                                Đưa lên trên
                              </button>
                              <button
                                onClick={() => {
                                  chartRef.current?.overrideOverlay({ id: floatingToolbar.overlayId, zGroupId: -10 } as any);
                                  setOverlayPopup(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]"
                              >
                                Gửi trở lại
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Submenu 3: Khả năng hiển thị trong các khoảng thời gian */}
                        <div
                          className="relative group"
                          onMouseEnter={() => setActiveContextMenuSubMenu('timeframe_visibility')}
                        >
                          <button
                            onClick={() => setActiveContextMenuSubMenu(prev => prev === 'timeframe_visibility' ? null : 'timeframe_visibility')}
                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] transition-colors"
                          >
                            <span className="truncate pr-2">Khả năng hiển thị trong các khoảng thời gian</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#787b86] shrink-0" />
                          </button>
                          {activeContextMenuSubMenu === 'timeframe_visibility' && (
                            <div className={`absolute top-0 ${floatingToolbar.x > window.innerWidth - 320 ? '-left-64' : 'left-full ml-1'} bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded-lg shadow-2xl py-1 w-64 z-50`}>
                              <button onClick={() => setOverlayPopup(null)} className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]">khoảng thời gian hiện tại trở đi</button>
                              <button onClick={() => setOverlayPopup(null)} className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]">khoảng thời gian hiện tại trở về trước</button>
                              <button onClick={() => setOverlayPopup(null)} className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]">Chỉ ở khoảng thời gian hiện tại</button>
                              <button onClick={() => setOverlayPopup(null)} className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]">Tất cả khoảng thời gian</button>
                            </div>
                          )}
                        </div>

                        <button onClick={() => setOverlayPopup(null)} className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]">
                          Danh sách đối tượng...
                        </button>

                        <div className="w-full h-[1px] bg-[#e6e8ea] dark:bg-[#2a2e39] my-1" />

                        {/* Bản sao */}
                        <button
                          onClick={() => {
                            const chart = chartRef.current;
                            if (chart && floatingToolbar) {
                              const currentOverlay = floatingToolbar.overlay;
                              chart.createOverlay({
                                name: currentOverlay.name,
                                points: currentOverlay.points,
                                styles: currentOverlay.styles,
                                extendData: currentOverlay.extendData
                              });
                            }
                            setOverlayPopup(null);
                          }}
                          className="flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]"
                        >
                          <span>Bản sao</span>
                          <span className="text-[10px] text-[#787b86]">Ctrl + Drag</span>
                        </button>

                        {/* Sao chép */}
                        <button
                          onClick={() => {
                            const chart = chartRef.current;
                            if (chart && floatingToolbar) {
                              const currentOverlay = floatingToolbar.overlay;
                              chart.createOverlay({
                                name: currentOverlay.name,
                                points: currentOverlay.points,
                                styles: currentOverlay.styles,
                                extendData: currentOverlay.extendData
                              });
                            }
                            setOverlayPopup(null);
                          }}
                          className="flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]"
                        >
                          <span>Sao chép</span>
                          <span className="text-[10px] text-[#787b86]">Ctrl + C</span>
                        </button>

                        <div className="w-full h-[1px] bg-[#e6e8ea] dark:bg-[#2a2e39] my-1" />

                        <button
                          onClick={() => {
                            const newLockStatus = !floatingToolbar.overlay.lock;
                            chartRef.current?.overrideOverlay({ id: floatingToolbar.overlayId, lock: newLockStatus });
                            setOverlayPopup(null);
                          }}
                          className="flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]"
                        >
                          <span>{floatingToolbar.overlay.lock ? 'Mở khóa' : 'Khóa'}</span>
                        </button>

                        <button
                          onClick={() => {
                            chartRef.current?.overrideOverlay({ id: floatingToolbar.overlayId, visible: false });
                            setOverlayPopup(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]"
                        >
                          Ẩn
                        </button>

                        <button
                          onClick={() => {
                            chartRef.current?.removeOverlay({ id: floatingToolbar.overlayId });
                            setFloatingToolbar(null);
                          }}
                          className="flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-red-500"
                        >
                          <span>Loại bỏ</span>
                          <span className="text-[10px] text-[#787b86]">Del</span>
                        </button>

                        <div className="w-full h-[1px] bg-[#e6e8ea] dark:bg-[#2a2e39] my-1" />

                        <button
                          onClick={() => {
                            onOverlayDoubleClickRef.current?.(floatingToolbar.overlay, 'style');
                            setOverlayPopup(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]"
                        >
                          Cài đặt...
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Overlay Settings Modal */}
                <OverlaySettingsModal
                  isOpen={isSettingsModalOpen}
                  activeTab={activeSettingsTab}
                  onClose={() => setIsSettingsModalOpen(false)}
                  initialSettings={selectedOverlaySettings}
                  onSave={handleSaveOverlaySettings}
                />
                {/* Fibonacci Settings Modal */}
                <FibonacciSettingsModal
                  isOpen={isFibModalOpen}
                  onClose={() => setIsFibModalOpen(false)}
                  config={fibConfig}
                  onSave={handleSaveFibConfig}
                />
              </div>
            );
          };
