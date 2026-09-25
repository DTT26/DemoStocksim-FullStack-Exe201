import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperTradingPosition extends Document {
  session: mongoose.Types.ObjectId;
  symbol: string;
  side: 'LONG' | 'SHORT';
  lot: number;
  entryPrice: number;
  sl?: number;
  tp?: number;
  setupTag?: string;
  margin: number;
  commission: number;
  accumulatedSwap: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaperTradingPositionSchema: Schema = new Schema(
  {
    session: { type: Schema.Types.ObjectId, ref: 'PaperTradingSession', required: true, index: true },
    symbol: { type: String, required: true },
    side: { type: String, enum: ['LONG', 'SHORT'], required: true },
    lot: { type: Number, required: true },
    entryPrice: { type: Number, required: true },
    sl: { type: Number },
    tp: { type: Number },
    setupTag: { type: String },
    margin: { type: Number, required: true },
    commission: { type: Number, required: true, default: 0 },
    accumulatedSwap: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IPaperTradingPosition>('PaperTradingPosition', PaperTradingPositionSchema);
