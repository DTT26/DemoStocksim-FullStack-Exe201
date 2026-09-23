import mongoose from 'mongoose';
import Wallet, { IWallet } from '../models/Wallet';
import Holding from '../models/Holding';
import Order, { OrderStatus } from '../models/Order';
import Transaction, { TransactionType } from '../models/Transaction';

export const MAX_NORMAL_RESETS_PER_WEEK = 5;
export const DEFAULT_NORMAL_BALANCE = 10_000; // $10,000 USD chuẩn mực trading simulator

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

    // Kiểm tra chu kỳ 7 ngày để hồi lại 5 lượt reset
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
   * Reset số dư tài khoản thường (Chỉ thực hiện khi User chủ động bấm, không tự động)
   * Giới hạn: 5 lần / tuần
   */
  static async resetNormalWallet(userId: string, targetBalance: number = DEFAULT_NORMAL_BALANCE): Promise<{
    success: boolean;
    wallet: IWallet;
    message: string;
  }> {
    const wallet = await this.getOrCreateWallet(userId);
    const now = Date.now();

    // Kiểm tra xem đã qua 7 ngày chưa
    if (wallet.weekResetTimestamp && now >= wallet.weekResetTimestamp) {
      wallet.resetsUsedThisWeek = 0;
      wallet.weekResetTimestamp = now + 7 * 24 * 60 * 60 * 1000;
    }

    // Kiểm tra giới hạn 5 lần / tuần
    if (wallet.resetsUsedThisWeek >= MAX_NORMAL_RESETS_PER_WEEK) {
      const daysRemaining = Math.max(1, Math.ceil((wallet.weekResetTimestamp - now) / (24 * 3600 * 1000)));
      throw new Error(`Bạn đã dùng hết ${MAX_NORMAL_RESETS_PER_WEEK} lượt reset tài khoản thường trong tuần! Vui lòng chờ ${daysRemaining} ngày nữa.`);
    }

    // Tăng số lượt đã dùng
    wallet.resetsUsedThisWeek += 1;
    wallet.balance = targetBalance;
    wallet.availableBalance = targetBalance;
    wallet.lastResetAt = new Date();
    await wallet.save();

    // Hủy các lệnh chờ và vị thế của tài khoản thường để bắt đầu lại sạch sẽ
    await Order.updateMany(
      { userId, status: OrderStatus.PENDING, accountType: { $ne: 'CHALLENGE' } },
      { status: OrderStatus.CANCELLED }
    );
    await Holding.deleteMany({ userId, accountType: { $ne: 'CHALLENGE' } });

    // Ghi nhận lịch sử giao dịch Reset
    await Transaction.create({
      userId,
      type: TransactionType.DEPOSIT,
      amount: targetBalance,
      description: `Reset số dư tài khoản thường về $${targetBalance.toLocaleString('en-US')} (Lần ${wallet.resetsUsedThisWeek}/${MAX_NORMAL_RESETS_PER_WEEK} trong tuần)`
    });

    const remainingResets = MAX_NORMAL_RESETS_PER_WEEK - wallet.resetsUsedThisWeek;

    return {
      success: true,
      wallet,
      message: `Đã reset tài khoản thường về $${targetBalance.toLocaleString('en-US')} thành công! Bạn còn ${remainingResets} lượt reset trong tuần này.`
    };
  }
}
