export interface ChallengeLevelConfig {
  id: number;
  levelName: string;
  badge: string;
  capitalUSD: number;
  capitalVND: number;
  profitTargetPercent: number;
  dailyLossLimitPercent: number;
  maxDrawdownPercent: number;
  minTradingDays: number;
  maxLeverage: number;
}

export interface PassedCertificate {
  levelId: number;
  levelName: string;
  capitalUSD: number;
  date: string;
  certCode: string;
  userName?: string;
}

export interface UserChallengeState {
  currentLevel: number;
  unlockedLevels: number[];
  status: 'NOT_STARTED' | 'ACTIVE' | 'PAUSED' | 'PASSED' | 'FAILED';
  startedAt?: number | string | Date;
  startingCapitalUSD: number;
  dayStartEquityUSD: number;
  currentEquityUSD: number;
  currentBalanceUSD: number;
  totalProfitUSD: number;
  dailyLossUSD: number;
  maxLossUSD: number;
  tradingDaysCount: number;
  tradingDates: string[];
  breachReason?: string;
  resetsUsedThisWeek: number;
  weekResetTimestamp: number;
  certificates: PassedCertificate[];
  userId?: string;
  userName?: string;
}
