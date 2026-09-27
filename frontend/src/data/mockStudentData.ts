export const MOCK_STUDENT_PORTFOLIO = {
  totalValue: 108520,
  totalReturn: 8.52,
  winRate: 65.2,
  totalTrades: 23,
  winningTrades: 15,
  losingTrades: 8,
  averageWin: 1250,
  averageLoss: -680,
  bestTrade: 4200,
  worstTrade: -1500,
  profitFactor: 2.1,
  averageHoldingTime: '2.5 days',
  mostTradedSymbol: 'FPT',
  averagePositionSize: 25000,
  averageTradesPerSession: 4.5,
  mostActiveTradingPeriod: 'Morning (9:00 - 11:30)',
};

export const MOCK_PERFORMANCE_HISTORY = [
  { date: '2026-09-01', value: 100000 },
  { date: '2026-09-03', value: 101200 },
  { date: '2026-09-05', value: 99500 },
  { date: '2026-09-07', value: 102400 },
  { date: '2026-09-10', value: 104500 },
  { date: '2026-09-12', value: 103800 },
  { date: '2026-09-15', value: 106200 },
  { date: '2026-09-18', value: 108520 },
];

export const MOCK_PERFORMANCE_BY_SYMBOL = [
  { symbol: 'FPT', trades: 8, winRate: 75.0, pnl: 4200, returnRate: 8.1 },
  { symbol: 'HPG', trades: 6, winRate: 50.0, pnl: 1100, returnRate: 2.4 },
  { symbol: 'VNM', trades: 4, winRate: 25.0, pnl: -800, returnRate: -1.8 },
  { symbol: 'MWG', trades: 3, winRate: 100.0, pnl: 2500, returnRate: 5.5 },
  { symbol: 'SSI', trades: 2, winRate: 50.0, pnl: 1520, returnRate: 3.2 },
];

export const MOCK_ASSIGNMENTS = [
  {
    id: '1',
    title: 'Technical Analysis: FPT',
    simulation: 'Vietnam Stock Challenge #01',
    deadline: '2026-09-15T23:59:59Z',
    status: 'In Progress',
    progress: 60,
    requirementsCompleted: 3,
    totalRequirements: 5,
    lecturer: 'Dr. Nguyen Van A',
    instructions: 'Analyze the current trend of FPT using MACD and RSI. Place at least one limit order based on your analysis.',
    requirements: [
      { id: 'r1', text: 'Apply MACD indicator to chart', completed: true },
      { id: 'r2', text: 'Apply RSI indicator to chart', completed: true },
      { id: 'r3', text: 'Submit brief trend analysis', completed: true },
      { id: 'r4', text: 'Place Limit BUY order', completed: false },
      { id: 'r5', text: 'Set Stop Loss for the order', completed: false },
    ]
  },
  {
    id: '2',
    title: 'Value Investing Portfolio',
    simulation: 'Advanced Trading #02',
    deadline: '2026-09-20T23:59:59Z',
    status: 'Not Started',
    progress: 0,
    requirementsCompleted: 0,
    totalRequirements: 4,
    lecturer: 'Dr. Nguyen Van A',
    instructions: 'Build a diversified portfolio of at least 3 stocks from different sectors. Hold for minimum 3 days.',
    requirements: [
      { id: 'r1', text: 'Buy stock in Banking sector', completed: false },
      { id: 'r2', text: 'Buy stock in Real Estate sector', completed: false },
      { id: 'r3', text: 'Buy stock in Retail sector', completed: false },
      { id: 'r4', text: 'Hold positions for 3 days', completed: false },
    ]
  },
  {
    id: '3',
    title: 'Basic Order Types',
    simulation: 'Intro to Markets',
    deadline: '2026-08-30T23:59:59Z',
    status: 'Completed',
    progress: 100,
    requirementsCompleted: 3,
    totalRequirements: 3,
    lecturer: 'Dr. Nguyen Van A',
    instructions: 'Learn how to use Market and Limit orders.',
    requirements: [
      { id: 'r1', text: 'Execute 1 Market Order', completed: true },
      { id: 'r2', text: 'Execute 1 Limit Order', completed: true },
      { id: 'r3', text: 'Cancel a pending Limit Order', completed: true },
    ]
  },
  {
    id: '4',
    title: 'Risk Management',
    simulation: 'Trading Challenge #01',
    deadline: '2026-09-01T23:59:59Z',
    status: 'Overdue',
    progress: 50,
    requirementsCompleted: 1,
    totalRequirements: 2,
    lecturer: 'Prof. Tran Thi B',
    instructions: 'Always use stop losses for your trades.',
    requirements: [
      { id: 'r1', text: 'Open a position', completed: true },
      { id: 'r2', text: 'Set Stop Loss within 5% of entry', completed: false },
    ]
  }
];

export const MOCK_TRADES = [
  {
    id: 't1',
    date: '2026-09-18T10:15:00Z',
    symbol: 'FPT',
    side: 'BUY',
    entryPrice: 92500,
    exitPrice: 95000,
    quantity: 1000,
    pnl: 2500000,
    returnRate: 2.7,
    simulation: 'Vietnam Stock Challenge #01',
    status: 'CLOSED',
    entryTime: '2026-09-16T14:20:00Z',
    exitTime: '2026-09-18T10:15:00Z',
    stopLoss: 90000,
    takeProfit: 95000,
    commission: 140625,
    setup: 'Breakout',
    notes: 'Good volume on breakout, reached target quickly.'
  },
  {
    id: 't2',
    date: '2026-09-17T13:45:00Z',
    symbol: 'VNM',
    side: 'SELL',
    entryPrice: 70000,
    exitPrice: 71000,
    quantity: 500,
    pnl: -500000,
    returnRate: -1.4,
    simulation: 'Advanced Trading #02',
    status: 'CLOSED',
    entryTime: '2026-09-15T09:30:00Z',
    exitTime: '2026-09-17T13:45:00Z',
    stopLoss: 71000,
    takeProfit: 68000,
    commission: 52875,
    setup: 'Reversal',
    notes: 'Hit stop loss. Trend was too strong.'
  },
  {
    id: 't3',
    date: '2026-09-18T14:30:00Z',
    symbol: 'HPG',
    side: 'BUY',
    entryPrice: 28500,
    exitPrice: null,
    quantity: 2000,
    pnl: 1000000,
    returnRate: 1.75,
    simulation: 'Vietnam Stock Challenge #01',
    status: 'OPEN',
    entryTime: '2026-09-17T10:10:00Z',
    exitTime: null,
    stopLoss: 27000,
    takeProfit: 31000,
    commission: 42750,
    setup: 'Support Bounce',
    notes: 'Holding for medium term target.'
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'assignment_deadline',
    title: 'Assignment Due Soon',
    description: 'Technical Analysis: FPT is due tomorrow.',
    time: '2026-09-14T10:00:00Z',
    read: false
  },
  {
    id: 'n2',
    type: 'simulation_started',
    title: 'Simulation Started',
    description: 'Vietnam Stock Challenge #01 is now LIVE.',
    time: '2026-09-12T09:00:00Z',
    read: true
  },
  {
    id: 'n3',
    type: 'ranking_update',
    title: 'Ranking Update',
    description: 'You moved up to #7 in Vietnam Stock Challenge #01!',
    time: '2026-09-15T16:30:00Z',
    read: false
  }
];
