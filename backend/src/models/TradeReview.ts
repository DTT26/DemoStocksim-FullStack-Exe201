import mongoose, { Schema, Document } from 'mongoose';

export interface ITradeReview extends Document {
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  symbol: string;
  side: string;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  processScore: number;
  tradeVerdict: string;
  verdictDescription: string;
  fullAnalysis: any;
  userNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TradeReviewSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  symbol: { type: String, required: true },
  side: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number },
  stopLoss: { type: Number },
  takeProfit: { type: Number },
  processScore: { type: Number, default: 80 },
  tradeVerdict: { type: String, required: true },
  verdictDescription: { type: String, required: true },
  fullAnalysis: { type: Schema.Types.Mixed, required: true },
  userNotes: { type: String }
}, { timestamps: true });

export default mongoose.model<ITradeReview>('TradeReview', TradeReviewSchema);
