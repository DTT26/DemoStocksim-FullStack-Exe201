import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperTradingSession extends Document {
  user: mongoose.Types.ObjectId;
  symbol: string;
  initialBalance: number;
  currentBalance: number;
  status: 'running' | 'completed';
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaperTradingSessionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    initialBalance: { type: Number, required: true },
    currentBalance: { type: Number, required: true },
    status: { type: String, enum: ['running', 'completed'], default: 'running' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IPaperTradingSession>('PaperTradingSession', PaperTradingSessionSchema);
