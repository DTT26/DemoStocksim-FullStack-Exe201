import mongoose, { Schema, Document } from 'mongoose';

export enum OrderSide {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP = 'STOP'
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
  margin: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  status: OrderStatus;
  accountType: 'STANDARD' | 'CHALLENGE';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  side: { type: String, enum: Object.values(OrderSide), required: true },
  type: { type: String, enum: Object.values(OrderType), required: true },
  quantity: { type: Number, required: true, min: [0, 'Quantity must be positive'] },
  price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
  margin: { type: Number, required: true, default: 0 },
  leverage: { type: Number, required: true, default: 1 },
  stopLoss: { type: Number },
  takeProfit: { type: Number },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
  accountType: { type: String, enum: ['STANDARD', 'CHALLENGE'], default: 'STANDARD' }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
