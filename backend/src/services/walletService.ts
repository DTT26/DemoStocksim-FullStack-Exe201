import mongoose from 'mongoose';
import Wallet, { IWallet } from '../models/Wallet';
import Holding from '../models/Holding';
import Order, { OrderStatus } from '../models/Order';
import Transaction, { TransactionType } from '../models/Transaction';

export const MAX_NORMAL_RESETS_PER_DAY = 1;
export const MAX_NORMAL_RESETS_PER_WEEK = 4;
export const DEFAULT_NORMAL_BALANCE = 100_000; // $100,000 USD chuẩn mực trading simulator

export class WalletService {
  /**
   * Lấy hoặc khởi tạo Ví tài khoản thường
   */
  static async getOrCreateWallet(userId: string): Promise<IWallet> {
    let wallet = await Wallet.findOne({ userId });
    const now = Date.now();

    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: DEFAULT_NORMAL_BALANCE,
        availableBalance: DEFAULT_NORMAL_BALANCE,
        resetsUsedThisWeek: 0,
        weekResetTimestamp: now + 7 * 24 * 60 * 60 * 1000,
      });
      return wallet;
    }

    // Nếu tài khoản cũ còn 100 triệu USD do cấu hình cũ, tự động chuyển về 100,000 USD
    if (wallet.balance === 100_000_000 || wallet.availableBalance === 100_000_000) {
      wallet.balance = DEFAULT_NORMAL_BALANCE;
      wallet.availableBalance = DEFAULT_NORMAL_BALANCE;
      await wallet.save();
    }

    // Kiểm tra chu kỳ tuần (7 ngày) để hồi lại lượt reset tuần
    if (wallet.weekResetTimestamp && now >= wallet.weekResetTimestamp) {
      wallet.resetsUsedThisWeek = 0;
      wallet.weekResetTimestamp = now + 7 * 24 * 60 * 60 * 1000;
      await wallet.save();
    } else if (!wallet.weekResetTimestamp) {
      wallet.weekResetTimestamp = now + 7 * 24 * 60 * 60 * 1000;
      await wallet.save();
    }

    return wallet;
  }

  /**
   * Lấy thông tin hạn mức reset hiện tại của người dùng
   */
  static async getResetQuota(userId: string): Promise<{
    canReset: boolean;
    reason?: string;
    hasResetToday: boolean;
    remainingResetsToday: number;
    maxResetsPerDay: number;
    resetsUsedThisWeek: number;
    maxResetsPerWeek: number;
    remainingResetsThisWeek: number;
    currentBalance: number;
    defaultBalance: number;
  }> {
    const wallet = await this.getOrCreateWallet(userId);
    const now = Date.now();

    // Reset tuần nếu hết chu kỳ
    if (wallet.weekResetTimestamp && now >= wallet.weekResetTimestamp) {
      wallet.resetsUsedThisWeek = 0;
      wallet.weekResetTimestamp = now + 7 * 24 * 60 * 60 * 1000;
      await wallet.save();
    }

    // Kiểm tra reset hôm nay (theo ngày dương lịch hiện tại)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const hasResetToday = !!(wallet.lastResetAt && new Date(wallet.lastResetAt).getTime() >= startOfToday.getTime());

    const remainingResetsThisWeek = Math.max(0, MAX_NORMAL_RESETS_PER_WEEK - (wallet.resetsUsedThisWeek || 0));
    const remainingResetsToday = hasResetToday ? 0 : 1;

    let canReset = true;
    let reason = '';

    if (wallet.availableBalance >= DEFAULT_NORMAL_BALANCE) {
      canReset = false;
      reason = `Tài khoản của bạn hiện vẫn còn đủ $${wallet.availableBalance.toLocaleString('en-US')} USD, chỉ có thể khôi phục lại khi đã giao dịch cạn vốn hoặc thua lỗ.`;
    } else if (hasResetToday) {
      canReset = false;
      reason = 'Bạn đã sử dụng lượt reset hôm nay (Tối đa 1 lần / ngày). Vui lòng quay lại vào ngày mai!';
    } else if (remainingResetsThisWeek <= 0) {
      canReset = false;
      const daysRemaining = Math.max(1, Math.ceil((wallet.weekResetTimestamp - now) / (24 * 3600 * 1000)));
      reason = `Bạn đã sử dụng hết ${MAX_NORMAL_RESETS_PER_WEEK} lượt reset trong tuần! Vui lòng chờ ${daysRemaining} ngày nữa để sang chu kỳ tuần mới.`;
    }

    return {
      canReset,
      reason,
      hasResetToday,
      remainingResetsToday,
      maxResetsPerDay: MAX_NORMAL_RESETS_PER_DAY,
      resetsUsedThisWeek: wallet.resetsUsedThisWeek || 0,
      maxResetsPerWeek: MAX_NORMAL_RESETS_PER_WEEK,
      remainingResetsThisWeek,
      currentBalance: wallet.availableBalance,
      defaultBalance: DEFAULT_NORMAL_BALANCE,
    };
  }

  /**
   * Reset số dư tài khoản thường về $100,000 USD
   * Giới hạn: Tối đa 1 lần trong ngày, 4 lần trong 1 tuần
   * Điều kiện: Người dùng đã trade hết 100k đô hoặc thua lỗ (availableBalance < 100,000)
   */
  static async resetNormalWallet(userId: string, targetBalance: number = DEFAULT_NORMAL_BALANCE): Promise<{
    success: boolean;
    wallet: IWallet;
    message: string;
  }> {
    const quota = await this.getResetQuota(userId);
    if (!quota.canReset) {
      throw new Error(quota.reason || 'Không đủ điều kiện reset tài khoản');
    }

    const wallet = await this.getOrCreateWallet(userId);

    // Cập nhật số lượt và số dư
    wallet.resetsUsedThisWeek += 1;
    wallet.balance = DEFAULT_NORMAL_BALANCE;
    wallet.availableBalance = DEFAULT_NORMAL_BALANCE;
    wallet.lastResetAt = new Date();
    await wallet.save();

    // Hủy các lệnh chờ và vị thế của tài khoản thường để làm sạch tài sản bắt đầu lại
    await Order.updateMany(
      { userId, status: OrderStatus.PENDING, accountType: { $ne: 'CHALLENGE' } },
      { status: OrderStatus.CANCELLED }
    );
    await Holding.deleteMany({ userId, accountType: { $ne: 'CHALLENGE' } });

    // Ghi nhận lịch sử giao dịch Reset
    await Transaction.create({
      userId,
      type: TransactionType.DEPOSIT,
      amount: DEFAULT_NORMAL_BALANCE,
      description: `Khôi phục số dư tài khoản về $${DEFAULT_NORMAL_BALANCE.toLocaleString('en-US')} USD (Lần ${wallet.resetsUsedThisWeek}/${MAX_NORMAL_RESETS_PER_WEEK} trong tuần)`
    });

    const remainingResets = MAX_NORMAL_RESETS_PER_WEEK - wallet.resetsUsedThisWeek;

    return {
      success: true,
      wallet,
      message: `Đã khôi phục số dư tài khoản về $${DEFAULT_NORMAL_BALANCE.toLocaleString('en-US')} USD thành công! Bạn còn ${remainingResets} lượt trong tuần này.`
    };
  }
}
