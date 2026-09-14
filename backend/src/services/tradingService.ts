import mongoose from 'mongoose';
import Wallet from '../models/Wallet';
import Holding from '../models/Holding';
import Order, { OrderSide, OrderType, OrderStatus } from '../models/Order';
import Transaction, { TransactionType } from '../models/Transaction';

export class TradingService {
  /**
   * Khớp lệnh MUA trực tiếp (Market Buy)
   */
  // 1. MỞ VỊ THẾ LONG (Cược giá lên)
  static async openLong(userId: string, symbol: string, margin: number, leverage: number, currentPrice: number, stopLoss?: number, takeProfit?: number) {
    if (margin <= 0) throw new Error("Ký quỹ (Margin) phải lớn hơn 0");
    if (leverage < 1 || leverage > 125) throw new Error("Đòn bẩy không hợp lệ");

    const marginRequired = margin;
    const quantity = (margin * leverage) / currentPrice;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");
    if (wallet.availableBalance < marginRequired) {
      throw new Error(`Ký quỹ không đủ. Cần ${marginRequired.toLocaleString('vi-VN')} đ`);
    }

    // Kiểm tra xem đã có lệnh SHORT ngược chiều chưa (One-way mode đơn giản)
    const existingShort = await Holding.findOne({ userId, symbol, side: 'SHORT' });
    if (existingShort) throw new Error("Vui lòng đóng vị thế SHORT trước khi mở LONG");

    wallet.balance -= marginRequired;
    wallet.availableBalance -= marginRequired;
    await wallet.save();

    let holding = await Holding.findOne({ userId, symbol, side: 'LONG' });
    if (holding) {
      const totalValueOld = holding.quantity * holding.averagePrice;
      const totalValueNew = quantity * currentPrice;
      holding.quantity += quantity;
      holding.averagePrice = (totalValueOld + totalValueNew) / holding.quantity;
      holding.leverage = leverage; // Cập nhật theo lệnh mới nhất cho đơn giản
      if (takeProfit) holding.tp = takeProfit;
      if (stopLoss) holding.sl = stopLoss;
      await holding.save();
    } else {
      await Holding.create({ userId, symbol, side: 'LONG', quantity, averagePrice: currentPrice, leverage, tp: takeProfit, sl: stopLoss });
    }

    await Transaction.create({
      userId, type: TransactionType.BUY_STOCK,
      amount: marginRequired, description: `Mở LONG ${symbol} | Margin: ${margin} | x${leverage} | Qty: ${quantity.toFixed(2)}`
    });

    return { success: true, message: `Mở LONG ${symbol} thành công (x${leverage})` };
  }

  /**
   * Khớp lệnh BÁN trực tiếp (Market Sell)
   */
  // 2. MỞ VỊ THẾ SHORT (Cược giá xuống)
  static async openShort(userId: string, symbol: string, margin: number, leverage: number, currentPrice: number, stopLoss?: number, takeProfit?: number) {
    if (margin <= 0) throw new Error("Ký quỹ (Margin) phải lớn hơn 0");
    if (leverage < 1 || leverage > 125) throw new Error("Đòn bẩy không hợp lệ");

    const marginRequired = margin;
    const quantity = (margin * leverage) / currentPrice;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");
    if (wallet.availableBalance < marginRequired) {
      throw new Error(`Ký quỹ không đủ. Cần ${marginRequired.toLocaleString('vi-VN')} đ`);
    }

    const existingLong = await Holding.findOne({ userId, symbol, side: 'LONG' });
    if (existingLong) throw new Error("Vui lòng đóng vị thế LONG trước khi mở SHORT");

    wallet.balance -= marginRequired;
    wallet.availableBalance -= marginRequired;
    await wallet.save();

    let holding = await Holding.findOne({ userId, symbol, side: 'SHORT' });
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
      await Holding.create({ userId, symbol, side: 'SHORT', quantity, averagePrice: currentPrice, leverage, tp: takeProfit, sl: stopLoss });
    }

    await Transaction.create({
      userId, type: TransactionType.SELL_STOCK,
      amount: marginRequired, description: `Mở SHORT ${symbol} | Margin: ${margin} | x${leverage} | Qty: ${quantity.toFixed(2)}`
    });

    return { success: true, message: `Mở SHORT ${symbol} thành công (x${leverage})` };
  }

  // 3. ĐÓNG VỊ THẾ (Chốt lời/Lỗ)
  static async closePosition(userId: string, symbol: string, side: 'LONG'|'SHORT', currentPrice: number) {
    const holding = await Holding.findOne({ userId, symbol, side });
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

    const marginReturned = (entryPrice * qty) / (holding.leverage || 1); // Tiền cọc ban đầu được tính lại từ đòn bẩy
    let totalReturn = marginReturned + pnl;
    
    if (totalReturn < 0) {
      totalReturn = 0; // Cháy tài khoản, mất trắng ký quỹ nhưng không bị âm vào số dư
      pnl = -marginReturned; // Lợi nhuận âm tối đa bằng đúng số tiền ký quỹ
    }

    // Cộng trả tiền về Ví
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");
    wallet.balance += totalReturn;
    wallet.availableBalance += totalReturn;
    await wallet.save();

    // Xóa vị thế
    await Holding.deleteOne({ _id: holding._id });

    await Transaction.create({
      userId, type: TransactionType.DEPOSIT,
      amount: totalReturn, description: `Đóng ${side} ${qty.toLocaleString('vi-VN', {maximumFractionDigits: 2})} ${symbol}. Lợi nhuận: ${pnl.toLocaleString('vi-VN')}đ`
    });

    return { success: true, message: `Đã đóng vị thế ${side}. Lợi nhuận: ${pnl.toLocaleString('vi-VN')}đ` };
  }

  // CẬP NHẬT TP / SL
  static async updateTPSL(userId: string, symbol: string, side: 'LONG'|'SHORT', tp?: number, sl?: number) {
    const holding = await Holding.findOne({ userId, symbol, side });
    if (!holding) throw new Error(`Không tìm thấy vị thế ${side} nào của ${symbol} để cập nhật`);
    
    holding.tp = tp;
    holding.sl = sl;
    await holding.save();
    
    return { success: true, message: `Cập nhật TP/SL thành công!` };
  }

  // BƠM THÊM KÝ QUỸ (ADD MARGIN)
  static async addMargin(userId: string, symbol: string, side: 'LONG'|'SHORT', amount: number) {
    if (amount <= 0) throw new Error("Số tiền bơm thêm phải lớn hơn 0");

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");
    if (wallet.availableBalance < amount) {
      throw new Error(`Số dư không đủ. Cần ${amount.toLocaleString('vi-VN')} đ`);
    }

    const holding = await Holding.findOne({ userId, symbol, side });
    if (!holding) throw new Error(`Không tìm thấy vị thế ${side} nào của ${symbol}`);

    // Deduct from wallet
    wallet.balance -= amount;
    wallet.availableBalance -= amount;
    await wallet.save();

    // Calculate new margin and new leverage
    const currentMargin = (holding.quantity * holding.averagePrice) / holding.leverage;
    const newMargin = currentMargin + amount;
    const newLeverage = (holding.quantity * holding.averagePrice) / newMargin;

    holding.leverage = newLeverage; // Effective leverage decreases
    await holding.save();

    await Transaction.create({
      userId, type: TransactionType.DEPOSIT,
      amount: -amount, description: `Bơm ${amount.toLocaleString('vi-VN')}đ ký quỹ vào lệnh ${side} ${symbol}`
    });

    return { success: true, message: `Bơm ${amount.toLocaleString('vi-VN')}đ ký quỹ thành công!` };
  }

  // ĐẶT LỆNH CHỜ (LIMIT / STOP ORDER)
  static async placeLimitOrder(userId: string, symbol: string, side: 'LONG'|'SHORT', price: number, margin: number, leverage: number, stopLoss?: number, takeProfit?: number, orderType: 'LIMIT' | 'STOP' = 'LIMIT') {
    if (margin <= 0) throw new Error("Ký quỹ (Margin) phải lớn hơn 0");
    if (leverage < 1 || leverage > 1000) throw new Error("Đòn bẩy không hợp lệ");
    if (price <= 0) throw new Error("Giá chờ không hợp lệ");

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");
    if (wallet.availableBalance < margin) {
      throw new Error(`Ký quỹ không đủ. Cần ${margin.toLocaleString('vi-VN')} đ`);
    }

    // Tạm trừ tiền ký quỹ để giữ chỗ lệnh chờ
    wallet.balance -= margin;
    wallet.availableBalance -= margin;
    await wallet.save();

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
      status: OrderStatus.PENDING
    });

    await Transaction.create({
      userId, type: TransactionType.BUY_STOCK, // Dùng tạm BUY_STOCK cho lệnh chờ
      amount: margin, description: `Đặt lệnh chờ ${side} Limit ${symbol} tại ${price.toLocaleString('vi-VN')}đ | Margin: ${margin}`
    });

    return { success: true, message: `Đặt lệnh chờ ${side} Limit thành công tại ${price.toLocaleString('vi-VN')}đ!` };
  }

  // HỦY LỆNH CHỜ
  static async cancelLimitOrder(userId: string, orderId: string) {
    const order = await Order.findOne({ _id: orderId, userId, status: OrderStatus.PENDING });
    if (!order) throw new Error("Không tìm thấy lệnh chờ hợp lệ");

    order.status = OrderStatus.CANCELLED;
    await order.save();

    // Hoàn tiền ký quỹ
    const wallet = await Wallet.findOne({ userId });
    if (wallet) {
       wallet.balance += order.margin;
       wallet.availableBalance += order.margin;
       await wallet.save();
    }

    await Transaction.create({
      userId, type: TransactionType.DEPOSIT,
      amount: order.margin, description: `Hủy lệnh chờ ${order.side} Limit ${order.symbol}. Hoàn ký quỹ ${order.margin.toLocaleString('vi-VN')}đ`
    });

    return { success: true, message: `Hủy lệnh chờ thành công!` };
  }

  /**
   * Lấy Danh mục đầu tư (Portfolio)
   */
  static async getPortfolio(userId: string) {
    const wallet = await Wallet.findOne({ userId });
    const holdings = await Holding.find({ userId });
    const pendingOrders = await Order.find({ userId, status: OrderStatus.PENDING });
    
    // Note: To calculate accurate Real-time PnL, the controller should fetch current prices from API
    // and map them into the holdings array before returning to frontend.
    return {
      wallet,
      holdings,
      pendingOrders
    };
  }

  /**
   * Lấy lịch sử giao dịch
   */
  static async getTransactions(userId: string) {
    // Sắp xếp giảm dần theo thời gian (mới nhất lên đầu)
    return await Transaction.find({ userId }).sort({ createdAt: -1 });
  }
}
