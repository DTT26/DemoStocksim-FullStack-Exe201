import Challenge, { IChallenge } from '../models/Challenge';
import Holding from '../models/Holding';
import Order, { OrderStatus } from '../models/Order';

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

export const CHALLENGE_LEVELS: ChallengeLevelConfig[] = [
  {
    id: 1,
    levelName: 'Tập Sự',
    badge: 'Cấp 1',
    capitalUSD: 10_000,
    capitalVND: 250_000_000,
    profitTargetPercent: 8,
    dailyLossLimitPercent: 4,
    maxDrawdownPercent: 8,
    minTradingDays: 2,
    maxLeverage: 20,
  },
  {
    id: 2,
    levelName: 'Tiềm Năng',
    badge: 'Cấp 2',
    capitalUSD: 25_000,
    capitalVND: 625_000_000,
    profitTargetPercent: 8,
    dailyLossLimitPercent: 4.5,
    maxDrawdownPercent: 8,
    minTradingDays: 3,
    maxLeverage: 30,
  },
  {
    id: 3,
    levelName: 'Chuyên Nghiệp',
    badge: 'Cấp 3',
    capitalUSD: 50_000,
    capitalVND: 1_250_000_000,
    profitTargetPercent: 10,
    dailyLossLimitPercent: 5,
    maxDrawdownPercent: 10,
    minTradingDays: 3,
    maxLeverage: 50,
  },
  {
    id: 4,
    levelName: 'Tinh Anh',
    badge: 'Cấp 4',
    capitalUSD: 100_000,
    capitalVND: 2_500_000_000,
    profitTargetPercent: 10,
    dailyLossLimitPercent: 5,
    maxDrawdownPercent: 10,
    minTradingDays: 4,
    maxLeverage: 50,
  },
  {
    id: 5,
    levelName: 'Bậc Thầy',
    badge: 'Cấp 5',
    capitalUSD: 200_000,
    capitalVND: 5_000_000_000,
    profitTargetPercent: 10,
    dailyLossLimitPercent: 5,
    maxDrawdownPercent: 10,
    minTradingDays: 5,
    maxLeverage: 100,
  },
  {
    id: 6,
    levelName: 'Huyền Thoại',
    badge: 'Cấp 6',
    capitalUSD: 500_000,
    capitalVND: 12_500_000_000,
    profitTargetPercent: 12,
    dailyLossLimitPercent: 4,
    maxDrawdownPercent: 8,
    minTradingDays: 5,
    maxLeverage: 100,
  },
];

export const MAX_RESETS_PER_WEEK = 4;

const getNextMondayTimestamp = (): number => {
  const now = new Date();
  const nextMonday = new Date(now);
  const day = now.getDay();
  const diff = (7 - day + 1) % 7 || 7;
  nextMonday.setDate(now.getDate() + diff);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.getTime();
};

export class ChallengeService {
  public static getLevels(): ChallengeLevelConfig[] {
    return CHALLENGE_LEVELS;
  }

  public static async getUserChallenge(userId: string, userName?: string): Promise<IChallenge> {
    let challenge = await Challenge.findOne({ userId });

    if (!challenge) {
      challenge = await Challenge.create({
        userId,
        userName: userName || 'Trader',
        currentLevel: 1,
        unlockedLevels: [1],
        status: 'NOT_STARTED',
        startingCapitalUSD: 10_000,
        dayStartEquityUSD: 10_000,
        currentEquityUSD: 10_000,
        currentBalanceUSD: 10_000,
        totalProfitUSD: 0,
        dailyLossUSD: 0,
        maxLossUSD: 0,
        tradingDaysCount: 0,
        tradingDates: [],
        resetsUsedThisWeek: 0,
        weekResetTimestamp: getNextMondayTimestamp(),
        certificates: [],
        history: [],
      });
    } else {
      // Kiểm tra reset hàng tuần
      if (Date.now() > challenge.weekResetTimestamp) {
        challenge.resetsUsedThisWeek = 0;
        challenge.weekResetTimestamp = getNextMondayTimestamp();
        await challenge.save();
      }
    }

    return challenge;
  }

  public static async startChallenge(userId: string, userName: string, levelId: number): Promise<IChallenge> {
    const challenge = await this.getUserChallenge(userId, userName);
    const levelConfig = CHALLENGE_LEVELS.find(l => l.id === levelId);

    if (!levelConfig) {
      throw new Error('Cấp độ thử thách không hợp lệ');
    }

    if (!challenge.unlockedLevels.includes(levelId)) {
      throw new Error(`Bạn cần vượt qua Level ${levelId - 1} để mở khóa Level này`);
    }

    // Nếu đang có bài thi trước đó dở dang, lưu vào lịch sử
    if (challenge.status === 'ACTIVE') {
      challenge.history.push({
        levelId: challenge.currentLevel,
        levelName: CHALLENGE_LEVELS.find(l => l.id === challenge.currentLevel)?.levelName || `Level ${challenge.currentLevel}`,
        startedAt: challenge.startedAt || new Date(),
        endedAt: new Date(),
        result: 'ABANDONED',
        profitUSD: challenge.totalProfitUSD,
        breachReason: 'Bỏ dở để bắt đầu bài thi mới',
      });
    }

    // Dọn sạch vị thế và lệnh chờ bài thi cấp vốn trước đó
    await Holding.deleteMany({ userId, accountType: 'CHALLENGE' });
    await Order.updateMany(
      { userId, status: OrderStatus.PENDING, accountType: 'CHALLENGE' },
      { status: OrderStatus.CANCELLED }
    );

    challenge.currentLevel = levelId;
    challenge.status = 'ACTIVE';
    challenge.startedAt = new Date();
    challenge.startingCapitalUSD = levelConfig.capitalUSD;
    challenge.dayStartEquityUSD = levelConfig.capitalUSD;
    challenge.currentEquityUSD = levelConfig.capitalUSD;
    challenge.currentBalanceUSD = levelConfig.capitalUSD;
    challenge.totalProfitUSD = 0;
    challenge.dailyLossUSD = 0;
    challenge.maxLossUSD = 0;
    challenge.tradingDaysCount = 0;
    challenge.tradingDates = [];
    challenge.breachReason = undefined;

    await challenge.save();
    return challenge;
  }

  public static async resetChallenge(userId: string): Promise<{ success: boolean; challenge: IChallenge; message: string }> {
    const challenge = await this.getUserChallenge(userId);

    if (challenge.resetsUsedThisWeek >= MAX_RESETS_PER_WEEK) {
      const daysLeft = Math.ceil((challenge.weekResetTimestamp - Date.now()) / (24 * 3600 * 1000));
      return {
        success: false,
        challenge,
        message: `Bạn đã dùng hết ${MAX_RESETS_PER_WEEK} lượt reset trong tuần! Vui lòng chờ ${daysLeft} ngày nữa để hồi lượt.`,
      };
    }

    const levelConfig = CHALLENGE_LEVELS.find(l => l.id === challenge.currentLevel) || CHALLENGE_LEVELS[0];

    // Dọn sạch vị thế và lệnh chờ bài thi cũ khi reset
    await Holding.deleteMany({ userId, accountType: 'CHALLENGE' });
    await Order.updateMany(
      { userId, status: OrderStatus.PENDING, accountType: 'CHALLENGE' },
      { status: OrderStatus.CANCELLED }
    );

    // Lưu vào lịch sử
    challenge.history.push({
      levelId: challenge.currentLevel,
      levelName: levelConfig.levelName,
      startedAt: challenge.startedAt || new Date(),
      endedAt: new Date(),
      result: challenge.status === 'FAILED' ? 'FAILED' : 'ABANDONED',
      profitUSD: challenge.totalProfitUSD,
      breachReason: challenge.breachReason || 'Người dùng yêu cầu reset lại',
    });

    challenge.status = 'ACTIVE';
    challenge.startedAt = new Date();
    challenge.resetsUsedThisWeek += 1;
    challenge.startingCapitalUSD = levelConfig.capitalUSD;
    challenge.dayStartEquityUSD = levelConfig.capitalUSD;
    challenge.currentEquityUSD = levelConfig.capitalUSD;
    challenge.currentBalanceUSD = levelConfig.capitalUSD;
    challenge.totalProfitUSD = 0;
    challenge.dailyLossUSD = 0;
    challenge.maxLossUSD = 0;
    challenge.tradingDaysCount = 0;
    challenge.tradingDates = [];
    challenge.breachReason = undefined;

    await challenge.save();
    return {
      success: true,
      challenge,
      message: `Đã reset bài thi Level ${levelConfig.id}! Còn ${MAX_RESETS_PER_WEEK - challenge.resetsUsedThisWeek} lượt tuần này.`,
    };
  }

  public static async pauseChallenge(userId: string): Promise<IChallenge> {
    const challenge = await this.getUserChallenge(userId);
    if (challenge.status === 'ACTIVE') {
      challenge.status = 'PAUSED';
      await challenge.save();
    }
    return challenge;
  }

  public static async resumeChallenge(userId: string): Promise<IChallenge> {
    const challenge = await this.getUserChallenge(userId);
    if (challenge.status === 'PAUSED') {
      challenge.status = 'ACTIVE';
      await challenge.save();
    }
    return challenge;
  }

  public static async endChallenge(userId: string): Promise<IChallenge> {
    const challenge = await this.getUserChallenge(userId);
    if (challenge.status !== 'NOT_STARTED') {
      const levelConfig = CHALLENGE_LEVELS.find(l => l.id === challenge.currentLevel) || CHALLENGE_LEVELS[0];
      challenge.history.push({
        levelId: challenge.currentLevel,
        levelName: levelConfig.levelName,
        startedAt: challenge.startedAt || new Date(),
        endedAt: new Date(),
        result: 'ABANDONED',
        profitUSD: challenge.totalProfitUSD,
        breachReason: 'Người dùng chủ động kết thúc bài thi',
      });
      challenge.status = 'NOT_STARTED';
      challenge.totalProfitUSD = 0;
      challenge.dailyLossUSD = 0;
      challenge.maxLossUSD = 0;
      challenge.tradingDaysCount = 0;
      challenge.tradingDates = [];
      challenge.breachReason = undefined;
      await challenge.save();

      // Đóng và dọn dẹp các vị thế cùng lệnh chờ của bài thi
      await Holding.deleteMany({ userId, accountType: 'CHALLENGE' });
      await Order.updateMany(
        { userId, status: OrderStatus.PENDING, accountType: 'CHALLENGE' },
        { status: OrderStatus.CANCELLED }
      );
    }
    return challenge;
  }

  public static async evaluateRisk(
    userId: string,
    unrealizedPnLUSD: number = 0,
    hasExecutedTradeToday = false
  ): Promise<IChallenge> {
    const challenge = await this.getUserChallenge(userId);
    if (challenge.status !== 'ACTIVE') return challenge;

    const levelConfig = CHALLENGE_LEVELS.find(l => l.id === challenge.currentLevel) || CHALLENGE_LEVELS[0];
    // Luôn lấy số dư độc lập của bài thi Cấp Vốn, tuyệt đối không lấy số dư của ví thường
    const balanceUSD = challenge.currentBalanceUSD;
    const currentEquity = balanceUSD + unrealizedPnLUSD;
    const startingCapital = challenge.startingCapitalUSD;

    const totalProfit = currentEquity - startingCapital;
    const targetProfitAmount = (levelConfig.profitTargetPercent / 100) * startingCapital;

    const maxLoss = Math.max(0, startingCapital - currentEquity);
    const maxLossLimit = (levelConfig.maxDrawdownPercent / 100) * startingCapital;

    const todayLoss = Math.max(0, challenge.dayStartEquityUSD - currentEquity);
    const dailyLossLimit = (levelConfig.dailyLossLimitPercent / 100) * startingCapital;

    const todayStr = new Date().toISOString().slice(0, 10);
    if (hasExecutedTradeToday && !challenge.tradingDates.includes(todayStr)) {
      challenge.tradingDates.push(todayStr);
      challenge.tradingDaysCount = challenge.tradingDates.length;
    }

    // 1. Kiểm tra Lỗ trong ngày
    if (todayLoss >= dailyLossLimit) {
      challenge.status = 'FAILED';
      challenge.breachReason = `Vi phạm Giới Hạn Lỗ Trong Ngày (-$${todayLoss.toFixed(1)} / Giới hạn -$${dailyLossLimit.toFixed(1)})`;
      challenge.history.push({
        levelId: challenge.currentLevel,
        levelName: levelConfig.levelName,
        startedAt: challenge.startedAt || new Date(),
        endedAt: new Date(),
        result: 'FAILED',
        profitUSD: totalProfit,
        breachReason: challenge.breachReason,
      });
    }
    // 2. Kiểm tra Mức sụt giảm tối đa
    else if (maxLoss >= maxLossLimit) {
      challenge.status = 'FAILED';
      challenge.breachReason = `Vi phạm Mức Sụt Giảm Tối Đa (-$${maxLoss.toFixed(1)} / Giới hạn -$${maxLossLimit.toFixed(1)})`;
      challenge.history.push({
        levelId: challenge.currentLevel,
        levelName: levelConfig.levelName,
        startedAt: challenge.startedAt || new Date(),
        endedAt: new Date(),
        result: 'FAILED',
        profitUSD: totalProfit,
        breachReason: challenge.breachReason,
      });
    }
    // 3. Kiểm tra ĐỖ bài thi
    else if (totalProfit >= targetProfitAmount && challenge.tradingDates.length >= levelConfig.minTradingDays) {
      challenge.status = 'PASSED';
      const nextLevelId = challenge.currentLevel + 1;
      if (nextLevelId <= 6 && !challenge.unlockedLevels.includes(nextLevelId)) {
        challenge.unlockedLevels.push(nextLevelId);
      }

      const certCode = `CERT-PROP-${challenge.currentLevel}-${Date.now().toString(36).toUpperCase()}`;
      challenge.certificates = challenge.certificates.filter(c => c.levelId !== challenge.currentLevel);
      challenge.certificates.push({
        levelId: challenge.currentLevel,
        levelName: levelConfig.levelName,
        capitalUSD: levelConfig.capitalUSD,
        date: new Date().toLocaleDateString('vi-VN'),
        certCode,
        userName: challenge.userName,
      });

      challenge.history.push({
        levelId: challenge.currentLevel,
        levelName: levelConfig.levelName,
        startedAt: challenge.startedAt || new Date(),
        endedAt: new Date(),
        result: 'PASSED',
        profitUSD: totalProfit,
      });
    }

    challenge.currentEquityUSD = currentEquity;
    challenge.totalProfitUSD = totalProfit;
    challenge.dailyLossUSD = todayLoss;
    challenge.maxLossUSD = maxLoss;

    await challenge.save();
    return challenge;
  }
}
