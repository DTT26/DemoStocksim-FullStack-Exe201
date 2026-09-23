import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate {
  levelId: number;
  levelName: string;
  capitalUSD: number;
  date: string;
  certCode: string;
  userName: string;
}

export interface IChallengeAttempt {
  levelId: number;
  levelName: string;
  startedAt: Date;
  endedAt?: Date;
  result: 'PASSED' | 'FAILED' | 'ABANDONED';
  profitUSD: number;
  breachReason?: string;
}

export interface IChallenge extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  currentLevel: number;
  unlockedLevels: number[];
  status: 'NOT_STARTED' | 'ACTIVE' | 'PAUSED' | 'PASSED' | 'FAILED';
  startedAt?: Date;
  startingCapitalUSD: number;
  dayStartEquityUSD: number;
  currentEquityUSD: number;
  currentBalanceUSD: number;
  totalProfitUSD: number;
  dailyLossUSD: number;
  maxLossUSD: number;
  tradingDaysCount: number;
  tradingDates: string[];
  breachReason?: string;
  resetsUsedThisWeek: number;
  weekResetTimestamp: number;
  certificates: ICertificate[];
  history: IChallengeAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>({
  levelId: { type: Number, required: true },
  levelName: { type: String, required: true },
  capitalUSD: { type: Number, required: true },
  date: { type: String, required: true },
  certCode: { type: String, required: true },
  userName: { type: String, required: true },
}, { _id: false });

const ChallengeAttemptSchema = new Schema<IChallengeAttempt>({
  levelId: { type: Number, required: true },
  levelName: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  result: { type: String, enum: ['PASSED', 'FAILED', 'ABANDONED'], required: true },
  profitUSD: { type: Number, default: 0 },
  breachReason: { type: String },
}, { _id: false });

const ChallengeSchema = new Schema<IChallenge>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  userName: { type: String, default: 'Trader' },
  currentLevel: { type: Number, default: 1 },
  unlockedLevels: { type: [Number], default: [1] },
  status: { type: String, enum: ['NOT_STARTED', 'ACTIVE', 'PAUSED', 'PASSED', 'FAILED'], default: 'NOT_STARTED' },
  startedAt: { type: Date },
  startingCapitalUSD: { type: Number, default: 10000 },
  dayStartEquityUSD: { type: Number, default: 10000 },
  currentEquityUSD: { type: Number, default: 10000 },
  currentBalanceUSD: { type: Number, default: 10000 },
  totalProfitUSD: { type: Number, default: 0 },
  dailyLossUSD: { type: Number, default: 0 },
  maxLossUSD: { type: Number, default: 0 },
  tradingDaysCount: { type: Number, default: 0 },
  tradingDates: { type: [String], default: [] },
  breachReason: { type: String },
  resetsUsedThisWeek: { type: Number, default: 0 },
  weekResetTimestamp: { type: Number, default: 0 },
  certificates: { type: [CertificateSchema], default: [] },
  history: { type: [ChallengeAttemptSchema], default: [] },
}, { timestamps: true });

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);
