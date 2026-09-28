import { Request, Response } from 'express';
import { WalletService, DEFAULT_NORMAL_BALANCE } from '../services/walletService';

export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id?.toString() || (req as any).user?.userId || req.query.userId || req.params.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin người dùng' });
    }

    const wallet = await WalletService.getOrCreateWallet(userId);
    const quota = await WalletService.getResetQuota(userId);

    res.status(200).json({
      success: true,
      wallet: {
        balance: wallet.balance,
        availableBalance: wallet.availableBalance,
        ...quota,
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
    const userId = (req as any).user?._id?.toString() || (req as any).user?.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin người dùng' });
    }

    const result = await WalletService.resetNormalWallet(userId, DEFAULT_NORMAL_BALANCE);
    const quota = await WalletService.getResetQuota(userId);

    res.status(200).json({
      success: true,
      message: result.message,
      wallet: {
        balance: result.wallet.balance,
        availableBalance: result.wallet.availableBalance,
        ...quota,
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
