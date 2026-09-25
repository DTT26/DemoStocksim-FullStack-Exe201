import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperTradingOrder extends Document {
  session: mongoose.Types.ObjectId;
  symbol: string;
  side: 'LONG' | 'SHORT';
  type: 'LIMIT' | 'STOP';
  limitPrice: number;
  lot: number;
  sl?: number;
  tp?: number;
  setupTag?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaperTradingOrderSchema: Schema = new Schema(
  {
    session: { type: Schema.Types.ObjectId, ref: 'PaperTradingSession', required: true, index: true },
    symbol: { type: String, required: true },
    side: { type: String, enum: ['LONG', 'SHORT'], required: true },
    type: { type: String, enum: ['LIMIT', 'STOP'], required: true },
    limitPrice: { type: Number, required: true },
    lot: { type: Number, required: true },
    sl: { type: Number },
    tp: { type: Number },
    setupTag: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPaperTradingOrder>('PaperTradingOrder', PaperTradingOrderSchema);
