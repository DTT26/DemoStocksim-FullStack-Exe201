import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperTradingHistory extends Document {
  session: mongoose.Types.ObjectId;
  symbol: string;
  side: 'LONG' | 'SHORT';
  lot: number;
  entryPrice: number;
  exitPrice: number;
  closeReason: 'MANUAL' | 'TAKE_PROFIT' | 'STOP_LOSS' | 'STOP_OUT';
  grossPnL: number;
  netPnL: number;
  setupTag?: string;
  openTime: Date;
  closeTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaperTradingHistorySchema: Schema = new Schema(
  {
    session: { type: Schema.Types.ObjectId, ref: 'PaperTradingSession', required: true, index: true },
    symbol: { type: String, required: true },
    side: { type: String, enum: ['LONG', 'SHORT'], required: true },
    lot: { type: Number, required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, required: true },
    closeReason: { type: String, enum: ['MANUAL', 'TAKE_PROFIT', 'STOP_LOSS', 'STOP_OUT'], required: true },
    grossPnL: { type: Number, required: true },
    netPnL: { type: Number, required: true },
    setupTag: { type: String },
    openTime: { type: Date, required: true },
    closeTime: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPaperTradingHistory>('PaperTradingHistory', PaperTradingHistorySchema);
