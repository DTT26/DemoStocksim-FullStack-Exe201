import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  availableBalance: number;
  resetsUsedThisWeek: number;
  weekResetTimestamp: number;
  lastResetAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, required: true, default: 100000, min: [0, 'Balance cannot be negative'] },
  availableBalance: { type: Number, required: true, default: 100000, min: [0, 'Available balance cannot be negative'] },
  resetsUsedThisWeek: { type: Number, default: 0 },
  weekResetTimestamp: { type: Number, default: 0 },
  lastResetAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<IWallet>('Wallet', WalletSchema);
