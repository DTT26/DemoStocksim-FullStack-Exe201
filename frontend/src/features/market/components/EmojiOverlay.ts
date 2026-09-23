import type { OverlayTemplate } from 'klinecharts';

export const emojiMark: OverlayTemplate = {
  name: 'emojiMark',
  totalStep: 2,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,
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
  createPointFigures: ({ overlay, coordinates }) => {
    if (coordinates.length === 0) return [];

    return [
      {
        type: 'text',
        attrs: {
          x: coordinates[0].x,
          y: coordinates[0].y,
          text: overlay.extendData || '😀',
          align: 'center',
          baseline: 'middle'
        },
        styles: {
          size: 28,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderSize: 0,
          borderRadius: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0
        },
        ignoreEvent: false,
      }
    ];
  }
};

