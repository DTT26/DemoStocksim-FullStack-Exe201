import mongoose, { Schema, Document } from 'mongoose';

export interface IHolding extends Document {
  userId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  averagePrice: number;
  leverage: number;
  tp?: number;
  sl?: number;
  createdAt: Date;
  updatedAt: Date;
}

const HoldingSchema: Schema = new Schema({
  userId: { type: String, required: true },
  symbol: { type: String, required: true },
  side: { type: String, enum: ['LONG', 'SHORT'], required: true },
  quantity: { type: Number, required: true },
  averagePrice: { type: Number, required: true },
  leverage: { type: Number, required: true, default: 1 },
  tp: { type: Number, required: false },
  sl: { type: Number, required: false }
}, {
  timestamps: true
});

// A user should only have one holding record per symbol
HoldingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export default mongoose.model<IHolding>('Holding', HoldingSchema);
