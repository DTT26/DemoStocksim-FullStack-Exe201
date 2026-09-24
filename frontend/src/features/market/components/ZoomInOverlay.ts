import type { OverlayTemplate } from 'klinecharts';

export const zoomInOverlay: OverlayTemplate = {
  name: 'zoomInBox',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (!coordinates || coordinates.length < 2) return [];

    const start = coordinates[0];
    const end = coordinates[1];
    if (!start || !end) return [];

    return [
      {
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: start.x, y: start.y },
            { x: end.x, y: start.y },
            { x: end.x, y: end.y },
            { x: start.x, y: end.y }
          ]
        },
        styles: { style: 'fill', color: 'rgba(41, 98, 255, 0.15)' },
        ignoreEvent: true
      },
      {
        type: 'line',
        attrs: {
          coordinates: [
            { x: start.x, y: start.y },
            { x: end.x, y: start.y },
            { x: end.x, y: end.y },
            { x: start.x, y: end.y },
            { x: start.x, y: start.y }
          ]
        },
        styles: { style: 'dashed', color: '#2962FF', size: 1, dashedValue: [4, 4] },
        ignoreEvent: true
      }
    ];
  }
};
