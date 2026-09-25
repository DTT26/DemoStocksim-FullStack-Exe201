import mongoose from 'mongoose';
import Wallet from '../models/Wallet';
import Holding from '../models/Holding';
import Order, { OrderSide, OrderType, OrderStatus } from '../models/Order';
import Transaction, { TransactionType } from '../models/Transaction';
import Challenge from '../models/Challenge';
import { WalletService } from './walletService';

export class TradingService {
  static async getOrCreateWallet(userId: string) {
    return WalletService.getOrCreateWallet(userId);
  }

  /**
   * Xác định ngữ cảnh tài khoản đang giao dịch:
   * - Nếu User đang có bài thi Cấp Vốn 'ACTIVE' hoặc 'PAUSED' -> Dùng Tài khoản Bài Thi (CHALLENGE)
   * - Nếu User không trong bài thi ('NOT_STARTED', 'PASSED', 'FAILED') -> Dùng Tài khoản Thường (STANDARD)
   * => TÁCH BIỆT HOÀN TOÀN: Tiền bài thi không ảnh hưởng ví thường, kết thúc bài thi ví thường giữ nguyên 100%.
   */
  private static async getActiveContext(userId: string) {
    const challenge = await Challenge.findOne({
      userId,
      status: { $in: ['ACTIVE', 'PAUSED', 'FAILED', 'PASSED'] }
    });

    if (challenge) {
      return {
        isChallenge: true,
        accountType: 'CHALLENGE' as const,
        challenge,
        balance: challenge.currentBalanceUSD,
        availableBalance: challenge.currentBalanceUSD,
        deductBalance: async (amount: number) => {
          challenge.currentBalanceUSD = Math.max(0, challenge.currentBalanceUSD - amount);
          await challenge.save();
        },
        addBalance: async (amount: number) => {
          challenge.currentBalanceUSD += amount;
          await challenge.save();
        }
      };
    }

    const wallet = await WalletService.getOrCreateWallet(userId);
    return {
      isChallenge: false,
      accountType: 'STANDARD' as const,
      wallet,
      balance: wallet.balance,
      availableBalance: wallet.availableBalance,
      deductBalance: async (amount: number) => {
        wallet.balance -= amount;
        wallet.availableBalance -= amount;
        await wallet.save();
      },
      addBalance: async (amount: number) => {
        wallet.balance += amount;
        wallet.availableBalance += amount;
        await wallet.save();
      }
    };
  }

  /**
   * 1. MỞ VỊ THẾ LONG (Cược giá lên)
   */
  static async openLong(userId: string, symbol: string, margin: number, leverage: number, currentPrice: number, stopLoss?: number, takeProfit?: number) {
    if (margin <= 0) throw new Error("Ký quỹ (Margin) phải lớn hơn 0");
    if (leverage < 1 || leverage > 125) throw new Error("Đòn bẩy không hợp lệ");

    const ctx = await this.getActiveContext(userId);
    if (ctx.isChallenge && ctx.challenge) {
      if (ctx.challenge.status === 'FAILED') {
        throw new Error('Bài thi đã bị vi phạm. Vui lòng reset bài thi hoặc hủy thi để tiếp tục.');
      }
      if (ctx.challenge.status === 'PAUSED') {
        throw new Error('Bài thi đang tạm dừng. Vui lòng bấm Tiếp Tục bài thi để mở lệnh.');
      }
      if (ctx.challenge.status === 'PASSED') {
        throw new Error('Bài thi đã hoàn thành xuất sắc! Vui lòng nâng cấp độ tiếp theo.');
      }
    }

    const marginRequired = margin;
    const quantity = (margin * leverage) / currentPrice;

    if (ctx.availableBalance < marginRequired) {
      throw new Error(`Ký quỹ không đủ. Số dư khả dụng hiện tại: $${ctx.availableBalance.toLocaleString('en-US')}`);
    }

    // Kiểm tra xem đã có lệnh SHORT ngược chiều chưa (One-way mode đơn giản) trong cùng loại tài khoản
    const existingShort = await Holding.findOne({ userId, symbol, side: 'SHORT', accountType: ctx.accountType });
    if (existingShort) throw new Error("Vui lòng đóng vị thế SHORT trước khi mở LONG");

    await ctx.deductBalance(marginRequired);

    let holding = await Holding.findOne({ userId, symbol, side: 'LONG', accountType: ctx.accountType });
    if (holding) {
      const totalValueOld = holding.quantity * holding.averagePrice;
      const totalValueNew = quantity * currentPrice;
      holding.quantity += quantity;
      holding.averagePrice = (totalValueOld + totalValueNew) / holding.quantity;
      holding.leverage = leverage;
      if (takeProfit) holding.tp = takeProfit;
      if (stopLoss) holding.sl = stopLoss;
      await holding.save();
    } else {
      await Holding.create({
        userId,
        symbol,
        side: 'LONG',
        quantity,
        averagePrice: currentPrice,
        leverage,
        tp: takeProfit,
        sl: stopLoss,
        accountType: ctx.accountType
      });
    }

    const order = await Order.create({
      userId,
      symbol,
      side: OrderSide.LONG,
      type: OrderType.MARKET,
      quantity,
      price: currentPrice,
      margin: marginRequired,
      leverage,
      stopLoss,
      takeProfit,
      status: OrderStatus.FILLED,
      accountType: ctx.accountType
    });

    await Transaction.create({
      userId,
      orderId: order._id,
      type: TransactionType.BUY_STOCK,
      amount: marginRequired,
      accountType: ctx.accountType,
      description: `Mở LONG ${symbol} ở giá $${currentPrice.toLocaleString('en-US', {maximumFractionDigits:2})} | Margin: $${margin} | x${leverage} | Qty: ${quantity.toFixed(2)} [${ctx.isChallenge ? 'Cấp Vốn' : 'Tài khoản thường'}]`
    });

    return {
      success: true,
      message: `Mở LONG ${symbol} thành công (x${leverage}) [${ctx.isChallenge ? 'Tài khoản Thi' : 'Tài khoản Thường'}]`
    };
  }

  /**
   * 2. MỞ VỊ THẾ SHORT (Cược giá xuống)
   */
  static async openShort(userId: string, symbol: string, margin: number, leverage: number, currentPrice: number, stopLoss?: number, takeProfit?: number) {
    if (margin <= 0) throw new Error("Ký quỹ (Margin) phải lớn hơn 0");
    if (leverage < 1 || leverage > 125) throw new Error("Đòn bẩy không hợp lệ");

    const marginRequired = margin;
    const quantity = (margin * leverage) / currentPrice;

    const ctx = await this.getActiveContext(userId);
    if (ctx.isChallenge && ctx.challenge) {
      if (ctx.challenge.status === 'FAILED') {
        throw new Error('Bài thi đã bị vi phạm. Vui lòng reset bài thi hoặc hủy thi để tiếp tục.');
      }
      if (ctx.challenge.status === 'PAUSED') {
        throw new Error('Bài thi đang tạm dừng. Vui lòng bấm Tiếp Tục bài thi để mở lệnh.');
      }
      if (ctx.challenge.status === 'PASSED') {
        throw new Error('Bài thi đã hoàn thành xuất sắc! Vui lòng nâng cấp độ tiếp theo.');
      }
    }

    if (ctx.availableBalance < marginRequired) {
      throw new Error(`Ký quỹ không đủ. Số dư khả dụng hiện tại: $${ctx.availableBalance.toLocaleString('en-US')}`);
    }

    const existingLong = await Holding.findOne({ userId, symbol, side: 'LONG', accountType: ctx.accountType });
    if (existingLong) throw new Error("Vui lòng đóng vị thế LONG trước khi mở SHORT");

    await ctx.deductBalance(marginRequired);

    let holding = await Holding.findOne({ userId, symbol, side: 'SHORT', accountType: ctx.accountType });
    if (holding) {
      const totalValueOld = holding.quantity * holding.averagePrice;
      const totalValueNew = quantity * currentPrice;
      holding.quantity += quantity;
      holding.averagePrice = (totalValueOld + totalValueNew) / holding.quantity;
      holding.leverage = leverage;
      if (takeProfit) holding.tp = takeProfit;
      if (stopLoss) holding.sl = stopLoss;
      await holding.save();
    } else {
      await Holding.create({
        userId,
        symbol,
        side: 'SHORT',
        quantity,
        averagePrice: currentPrice,
        leverage,
        tp: takeProfit,
        sl: stopLoss,
        accountType: ctx.accountType
      });
    }

    const order = await Order.create({
      userId,
      symbol,
      side: OrderSide.SHORT,
      type: OrderType.MARKET,
      quantity,
      price: currentPrice,
      margin: marginRequired,
      leverage,
      stopLoss,
      takeProfit,
      status: OrderStatus.FILLED,
      accountType: ctx.accountType
    });

    await Transaction.create({
      userId,
      orderId: order._id,
      type: TransactionType.BUY_STOCK,
      amount: marginRequired,
      accountType: ctx.accountType,
      description: `Mở SHORT ${symbol} ở giá $${currentPrice.toLocaleString('en-US', {maximumFractionDigits:2})} | Margin: $${margin} | x${leverage} | Qty: ${quantity.toFixed(2)} [${ctx.isChallenge ? 'Cấp Vốn' : 'Tài khoản thường'}]`
    });

    return {
      success: true,
      message: `Mở SHORT ${symbol} thành công (x${leverage}) [${ctx.isChallenge ? 'Tài khoản Thi' : 'Tài khoản Thường'}]`
    };
  }

  /**
   * ĐÓNG VỊ THẾ (Close Position) - Chốt lời/Cắt lỗ theo giá thị trường
   */
  static async closePosition(userId: string, symbol: string, side: 'LONG'|'SHORT', currentPrice: number) {
    const ctx = await this.getActiveContext(userId);
    const holding = await Holding.findOne({ userId, symbol, side, accountType: ctx.accountType });
    if (!holding) throw new Error(`Không tìm thấy vị thế ${side} nào của ${symbol}`);

    const qty = holding.quantity;
    const entryPrice = holding.averagePrice;
    
    // Tính PnL
    let pnl = 0;
    if (side === 'LONG') {
      pnl = (currentPrice - entryPrice) * qty;
    } else {
      pnl = (entryPrice - currentPrice) * qty;
    }

    const marginReturned = (entryPrice * qty) / (holding.leverage || 1);
    let totalReturn = marginReturned + pnl;
    
    if (totalReturn < 0) {
      totalReturn = 0;
      pnl = -marginReturned;
    }

    // Trả tiền về đúng loại tài khoản đang hoạt động
    await ctx.addBalance(totalReturn);

    // Xóa vị thế
    await Holding.deleteOne({ _id: holding._id });

    const order = await Order.create({
      userId,
      symbol,
      side: side === 'LONG' ? OrderSide.SHORT : OrderSide.LONG,
      type: OrderType.MARKET,
      quantity: qty,
      price: currentPrice,
      margin: marginReturned,
      leverage: holding.leverage || 1,
      status: OrderStatus.FILLED,
      accountType: ctx.accountType
    });

    await Transaction.create({
      userId,
      orderId: order._id,
      type: TransactionType.DEPOSIT,
      amount: totalReturn,
      accountType: ctx.accountType,
      description: `Đóng ${side} ${qty.toFixed(2)} ${symbol} ở giá $${currentPrice.toLocaleString('en-US', {maximumFractionDigits:2})}. Lợi nhuận: ${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString('en-US', {maximumFractionDigits:2})}`
    });

    return {
      success: true,
      message: `Đã đóng vị thế ${side}. Lợi nhuận: ${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString('en-US', {maximumFractionDigits:2})}`
    };
  }

  /**
   * CẬP NHẬT TP / SL
   */
  static async updateTPSL(userId: string, symbol: string, side: 'LONG'|'SHORT', tp?: number, sl?: number) {
    const ctx = await this.getActiveContext(userId);
    const holding = await Holding.findOne({ userId, symbol, side, accountType: ctx.accountType });
    if (!holding) throw new Error(`Không tìm thấy vị thế ${side} nào của ${symbol} để cập nhật`);
    
    holding.tp = tp;
    holding.sl = sl;
    await holding.save();
    
    return { success: true, message: `Cập nhật TP/SL thành công!` };
  }

  /**
   * BƠM THÊM KÝ QUỸ (ADD MARGIN)
   */
  static async addMargin(userId: string, symbol: string, side: 'LONG'|'SHORT', amount: number) {
    if (amount <= 0) throw new Error("Số tiền bơm thêm phải lớn hơn 0");

    const ctx = await this.getActiveContext(userId);
    if (ctx.availableBalance < amount) {
      throw new Error(`Số dư không đủ. Cần $${amount.toLocaleString('en-US')}`);
    }

    const holding = await Holding.findOne({ userId, symbol, side, accountType: ctx.accountType });
    if (!holding) throw new Error(`Không tìm thấy vị thế ${side} nào của ${symbol}`);

    await ctx.deductBalance(amount);

    const currentMargin = (holding.quantity * holding.averagePrice) / holding.leverage;
    const newMargin = currentMargin + amount;
    const newLeverage = (holding.quantity * holding.averagePrice) / newMargin;

    holding.leverage = newLeverage;
    await holding.save();

    await Transaction.create({
      userId,
      type: TransactionType.BUY_STOCK,
      amount,
      accountType: ctx.accountType,
      description: `Bơm thêm $${amount.toLocaleString('en-US')} ký quỹ vào vị thế ${side} ${symbol}. Đòn bẩy mới: x${newLeverage.toFixed(1)}`
    });

    return {
      success: true,
      message: `Bơm thêm $${amount.toLocaleString('en-US')} thành công! Đòn bẩy mới: x${newLeverage.toFixed(1)}`
    };
  }

  /**
   * ĐẶT LỆNH CHỜ (Limit / Stop Order)
   */
  static async placeLimitOrder(userId: string, symbol: string, side: 'LONG'|'SHORT', price: number, margin: number, leverage: number, stopLoss?: number, takeProfit?: number, orderType: 'LIMIT' | 'STOP' = 'LIMIT') {
    if (margin <= 0) throw new Error("Ký quỹ (Margin) phải lớn hơn 0");
    if (leverage < 1 || leverage > 1000) throw new Error("Đòn bẩy không hợp lệ");
    if (price <= 0) throw new Error("Giá chờ không hợp lệ");

    const ctx = await this.getActiveContext(userId);
    if (ctx.isChallenge && ctx.challenge) {
      if (ctx.challenge.status === 'FAILED') {
        throw new Error('Bài thi đã bị vi phạm. Vui lòng reset bài thi hoặc hủy thi để tiếp tục.');
      }
      if (ctx.challenge.status === 'PAUSED') {
        throw new Error('Bài thi đang tạm dừng. Vui lòng bấm Tiếp Tục bài thi để mở lệnh.');
      }
      if (ctx.challenge.status === 'PASSED') {
        throw new Error('Bài thi đã hoàn thành xuất sắc! Vui lòng nâng cấp độ tiếp theo.');
      }
    }

    if (ctx.availableBalance < margin) {
      throw new Error(`Ký quỹ không đủ. Cần $${margin.toLocaleString('en-US')}`);
    }

    // Tạm trừ tiền ký quỹ để giữ chỗ lệnh chờ
    await ctx.deductBalance(margin);

    const quantity = (margin * leverage) / price;

    const order = await Order.create({
      userId,
      symbol,
      side,
      type: orderType,
      quantity,
      price,
      margin,
      leverage,
      stopLoss,
      takeProfit,
      status: OrderStatus.PENDING,
      accountType: ctx.accountType
    });

    await Transaction.create({
      userId,
      type: TransactionType.BUY_STOCK,
      amount: margin,
      accountType: ctx.accountType,
      description: `Đặt lệnh chờ ${side} Limit ${symbol} tại $${price.toLocaleString('en-US')} | Margin: $${margin}`
    });

    return { success: true, message: `Đặt lệnh chờ ${side} Limit thành công tại $${price.toLocaleString('en-US')}!` };
  }

  /**
   * HỦY LỆNH CHỜ
   */
  static async cancelLimitOrder(userId: string, orderId: string) {
    const order = await Order.findOne({ _id: orderId, userId, status: OrderStatus.PENDING });
    if (!order) throw new Error("Không tìm thấy lệnh chờ hợp lệ");

    order.status = OrderStatus.CANCELLED;
    await order.save();

    const ctx = await this.getActiveContext(userId);
    await ctx.addBalance(order.margin);

    await Transaction.create({
      userId,
      type: TransactionType.DEPOSIT,
      amount: order.margin,
      accountType: order.accountType || ctx.accountType,
      description: `Hủy lệnh chờ ${order.side} Limit ${order.symbol}. Hoàn ký quỹ $${order.margin.toLocaleString('en-US')}`
    });

    return { success: true, message: `Hủy lệnh chờ thành công!` };
  }

  /**
   * Lấy Danh mục đầu tư (Portfolio) theo đúng trạng thái tài khoản
   */
  static async getPortfolio(userId: string) {
    const ctx = await this.getActiveContext(userId);
    const holdings = await Holding.find({ userId, accountType: ctx.accountType });
    const pendingOrders = await Order.find({ userId, status: OrderStatus.PENDING, accountType: ctx.accountType });

    // Note: To calculate accurate Real-time PnL, the controller should fetch current prices from API
    // and map them into the holdings array before returning to frontend.
    return {
      wallet: {
        balance: ctx.balance,
        availableBalance: ctx.availableBalance,
        isChallenge: ctx.isChallenge,
        accountType: ctx.accountType
      },
      holdings,
      pendingOrders
    };
  }

  /**
   * Lấy lịch sử giao dịch theo loại tài khoản hiện tại
   */
  static async getTransactions(userId: string) {
    const ctx = await this.getActiveContext(userId);
    return await Transaction.find({ userId, accountType: ctx.accountType }).sort({ createdAt: -1 });
  }
}
