export interface KnowledgeSource {
  id?: string;
  title: string;
  concept: string;
  framework: string;
  source: string;
  sourceUrl: string;
  author: string;
  sourceType: 'PRIMARY' | 'SECONDARY' | 'AI_GENERATED';
  tags?: string[];
  score?: number;
}

export interface AskResponse {
  answer: string;
  concept?: string;
  framework?: string;
  reasoning?: string;
  sources: KnowledgeSource[];
  socraticQuestions: string[];
  guardrailTriggered?: string | null;
}

export interface TradeAnalysisSummary {
  symbol: string;
  side: string;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  quantity: number;
  pnl: number;
  returnPct: number;
  plannedRR: string;
  actualRR: string;
  riskPctOfAccount: string;
  mfe: string;
  mae: string;
  processScore: number;
  tradeVerdict: string;
  verdictDescription: string;
}

export interface TradeReviewData {
  summary: TradeAnalysisSummary;
  marketContext: {
    timeframe: string;
    trend: string;
    supportResistance: string;
    volumeObservation: string;
  };
  setupQuality: {
    strategy: string;
    setupName: string;
    reasonGiven: string;
    score: number;
  };
  entryAnalysis: {
    entryPrice: number;
    assessment: string;
  };
  stopLossAnalysis: {
    stopLoss?: number;
    riskAmount: number;
    riskPct: string;
    comment: string;
  };
  takeProfitAnalysis: {
    takeProfit?: number;
    plannedReward: number;
    comment: string;
  };
  excursionAnalysis: {
    mfe: string;
    mae: string;
    drawdownRisk: string;
    exitEfficiency: string;
  };
  strengths: string[];
  improvements: string[];
  ruleViolations: string[];
  socraticQuestions: string[];
  sources: KnowledgeSource[];
}

export interface StrategyComparisonData {
  symbol: string;
  side: string;
  entryPrice: number;
  priceAction: {
    frameworkName: string;
    keyFocus: string[];
    setupInterpretation: string;
    stopLossPlacement: string;
    takeProfitTarget: string;
    evidenceRequired: string;
  };
  ict: {
    frameworkName: string;
    keyFocus: string[];
    setupInterpretation: string;
    stopLossPlacement: string;
    takeProfitTarget: string;
    evidenceRequired: string;
  };
  similarities: string[];
  differences: string[];
  conclusion: string;
  sources: KnowledgeSource[];
}

const API_BASE = '/api/ai';

export const aiService = {
  async askQuestion(question: string, framework?: string, symbol?: string): Promise<AskResponse> {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, framework, symbol }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi kết nối AI Tutor');
    return json.data;
  },

  async explainConcept(concept: string, framework?: string): Promise<AskResponse> {
    const res = await fetch(`${API_BASE}/explain-concept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept, framework }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi giải thích khái niệm');
    return json.data;
  },

  async analyzeTrade(tradeData: any): Promise<TradeReviewData> {
    const res = await fetch(`${API_BASE}/analyze-trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi phân tích lệnh');
    return json.data;
  },

  async reviewTrade(tradeData: any): Promise<TradeReviewData> {
    const res = await fetch(`${API_BASE}/review-trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi xuất bản Trade Review');
    return json.data;
  },

  async compareStrategies(tradeData: any): Promise<StrategyComparisonData> {
    const res = await fetch(`${API_BASE}/compare-strategies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trade: tradeData }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi so sánh chiến lược');
    return json.data;
  },

  async getBacktestSpec(data: any) {
    const res = await fetch(`${API_BASE}/backtest-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tạo kế hoạch backtest');
    return json.data;
  },

  async getTradeInsights(trades?: any[]) {
    const res = await fetch(`${API_BASE}/trade-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trades: trades || [] }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi phân tích thói quen giao dịch');
    return json.data;
  },

  async getSources(): Promise<{ count: number; sources: KnowledgeSource[] }> {
    const res = await fetch(`${API_BASE}/sources`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải nguồn tri thức');
    return json.data;
  },

  async getLearningProgress() {
    const res = await fetch(`${API_BASE}/learning-progress`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải tiến độ');
    return json.data;
  },

  async getSavedReviews() {
    const res = await fetch(`${API_BASE}/reviews`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh sách review');
    return json.data;
  }
};
