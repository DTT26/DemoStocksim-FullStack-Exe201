export interface ChartSettings {
  symbol: {
    colorBasedOnPreviousClose: boolean;
    precision: string;
    timezone: string;
  };
  candle: {
    bodyUp: string;
    bodyDown: string;
    borderUp: string;
    borderDown: string;
    wickUp: string;
    wickDown: string;
  };
  status: {
    title: string;
    openMarketStatus: boolean;
    chartValues: boolean;
    barChangeValues: boolean;
    volume: boolean;
    indicatorTitles: boolean;
    indicatorInputs: boolean;
    indicatorValues: boolean;
    indicatorBackground: boolean;
    indicatorBackgroundColor: string;
  };
  scales: {
    textColor: string;
    textSize: number;
    lineColor: string;
    noOverlappingLabels: boolean;
    plusButton: boolean;
    countdown: boolean;
    symbolVal: string;
    symbolLabelColor1: string;
    symbolLabelColor2: string;
    indVal: string;
    hlVal: string;
    hlColor: string;
    dayOfWeek: boolean;
    dateFormat: string;
    timeFormat: string;
  };
  canvas: {
    bgType: 'Solid' | 'Gradient';
    bgSolid: string;
    bgGradientTop: string;
    bgGradientBottom: string;
    vGridShow: boolean;
    vGridColor: string;
    vGridStyle: '—' | '- - -' | '· · ·';
    hGridShow: boolean;
    hGridColor: string;
    hGridStyle: '—' | '- - -' | '· · ·';
    crosshairColor: string;
    crosshairStyle: '—' | '- - -' | '· · ·';
    watermarkVal: string;
    navVal: string;
    paneVal: string;
    marginTop: number;
    marginBottom: number;
    marginRight: number;
  };
  alerts: {
    alertLines: boolean;
  };
  events: {
    sessionBreaks: boolean;
    sessionBreaksColor: string;
    sessionBreaksStyle: '—' | '- - -' | '· · ·';
  };
}

export const DEFAULT_CHART_SETTINGS: ChartSettings = {
  symbol: {
    colorBasedOnPreviousClose: false,
    precision: 'Default',
    timezone: 'UTC',
  },
  candle: {
    bodyUp: '#089981',
    bodyDown: '#f23645',
    borderUp: '#089981',
    borderDown: '#f23645',
    wickUp: '#089981',
    wickDown: '#f23645',
  },
  status: {
    title: 'Description',
    openMarketStatus: true,
    chartValues: true,
    barChangeValues: true,
    volume: false,
    indicatorTitles: true,
    indicatorInputs: false,
    indicatorValues: true,
    indicatorBackground: true,
    indicatorBackgroundColor: '#1e222d',
  },
  scales: {
    textColor: '#d1d4dc',
    textSize: 12,
    lineColor: '#2a2e39',
    noOverlappingLabels: true,
    plusButton: true,
    countdown: true,
    symbolVal: 'Name, value, line',
    symbolLabelColor1: '#089981',
    symbolLabelColor2: '#f23645',
    indVal: 'Value',
    hlVal: 'Hidden',
    hlColor: '#d1d4dc',
    dayOfWeek: true,
    dateFormat: 'Mon 29 Sep \'97',
    timeFormat: '24-hours',
  },
  canvas: {
    bgType: 'Gradient',
    bgSolid: '#131722',
    bgGradientTop: '#131722',
    bgGradientBottom: '#1e222d',
    vGridShow: true,
    vGridColor: '#2a2e39',
    vGridStyle: '- - -',
    hGridShow: true,
    hGridColor: '#2a2e39',
    hGridStyle: '- - -',
    crosshairColor: '#787b86',
    crosshairStyle: '- - -',
    watermarkVal: 'Hidden',
    navVal: 'Visible on mouse over',
    paneVal: 'Visible on mouse over',
    marginTop: 10,
    marginBottom: 8,
    marginRight: 10,
  },
  alerts: {
    alertLines: true,
  },
  events: {
    sessionBreaks: false,
    sessionBreaksColor: '#2962ff',
    sessionBreaksStyle: '- - -',
  },
};
