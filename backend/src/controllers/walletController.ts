import { Request, Response } from 'express';
import { WalletService, MAX_NORMAL_RESETS_PER_WEEK, DEFAULT_NORMAL_BALANCE } from '../services/walletService';

export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || req.query.userId || req.params.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin người dùng' });
    }

    const wallet = await WalletService.getOrCreateWallet(userId);
    const remainingResets = Math.max(0, MAX_NORMAL_RESETS_PER_WEEK - (wallet.resetsUsedThisWeek || 0));

    res.status(200).json({
      success: true,
      wallet: {
        balance: wallet.balance,
        availableBalance: wallet.availableBalance,
        resetsUsedThisWeek: wallet.resetsUsedThisWeek || 0,
        maxResetsPerWeek: MAX_NORMAL_RESETS_PER_WEEK,
        remainingResets,
        weekResetTimestamp: wallet.weekResetTimestamp,
        defaultBalance: DEFAULT_NORMAL_BALANCE,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetNormalWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin người dùng' });
    }

    const { targetBalance } = req.body;
    const amount = Number(targetBalance) > 0 ? Number(targetBalance) : DEFAULT_NORMAL_BALANCE;

    const result = await WalletService.resetNormalWallet(userId, amount);
    const remainingResets = Math.max(0, MAX_NORMAL_RESETS_PER_WEEK - (result.wallet.resetsUsedThisWeek || 0));

    res.status(200).json({
      success: true,
      message: result.message,
      wallet: {
        balance: result.wallet.balance,
        availableBalance: result.wallet.availableBalance,
        resetsUsedThisWeek: result.wallet.resetsUsedThisWeek,
        remainingResets,
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
