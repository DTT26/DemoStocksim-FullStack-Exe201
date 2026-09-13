import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  availableBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, required: true, default: 100000 },
  availableBalance: { type: Number, required: true, default: 100000 }
}, { timestamps: true });

export default mongoose.model<IWallet>('Wallet', WalletSchema);
