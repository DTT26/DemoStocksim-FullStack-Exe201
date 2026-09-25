import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperTradingSession extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  symbol: string;
  timeframe: string;
  
  // Configuration
  initialBalance: number;
  leverage: number;
  minLot: number;
  lotStep: number;
  maxMarginPercent: number;
  spread: number;
  commission: number;
  swapLong: number;
  swapShort: number;

  // Real-time State
  balance: number;
  equity: number;
  usedMargin: number;
  freeMargin: number;

  // Replay State
  replayStartTime: Date;
  replayCurrentTime: Date;

  // Status
  status: 'running' | 'completed';
  startedAt: Date;
  completedAt?: Date;

  // Statistics (for completed sessions)
  statistics?: {
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    grossProfit: number;
    grossLoss: number;
    netPnL: number;
    averageWin: number;
    averageLoss: number;
    largestWin: number;
    largestLoss: number;
    maxDrawdown: number;
    averageRR: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const PaperTradingSessionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    timeframe: { type: String, required: true },
    
    // Configuration
    initialBalance: { type: Number, required: true },
    leverage: { type: Number, required: true, default: 1 },
    minLot: { type: Number, required: true, default: 0.01 },
    lotStep: { type: Number, required: true, default: 0.01 },
    maxMarginPercent: { type: Number, required: true, default: 95 },
    spread: { type: Number, required: true, default: 20 },
    commission: { type: Number, required: true, default: 7 },
    swapLong: { type: Number, required: true, default: -0.5 },
    swapShort: { type: Number, required: true, default: -0.3 },

    // State
    balance: { type: Number, required: true },
    equity: { type: Number, required: true },
    usedMargin: { type: Number, required: true, default: 0 },
    freeMargin: { type: Number, required: true },

    // Replay Metadata
    replayStartTime: { type: Date, required: true },
    replayCurrentTime: { type: Date, required: true },

    status: { type: String, enum: ['running', 'completed'], default: 'running' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },

    statistics: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export default mongoose.model<IPaperTradingSession>('PaperTradingSession', PaperTradingSessionSchema);
