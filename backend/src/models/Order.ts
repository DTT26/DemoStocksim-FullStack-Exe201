import mongoose, { Schema, Document } from 'mongoose';

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  FILLED = 'FILLED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  side: { type: String, enum: Object.values(OrderSide), required: true },
  type: { type: String, enum: Object.values(OrderType), required: true },
  quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
  price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
  stopLoss: { type: Number },
  takeProfit: { type: Number },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
