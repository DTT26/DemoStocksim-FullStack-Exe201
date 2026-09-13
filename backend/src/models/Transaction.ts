import mongoose, { Schema, Document } from 'mongoose';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BUY_STOCK = 'BUY_STOCK',
  SELL_STOCK = 'SELL_STOCK'
}

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' }, // Optional, as Deposit/Withdrawal might not have an order
  type: { type: String, enum: Object.values(TransactionType), required: true },
  amount: { type: Number, required: true },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
