import mongoose, { Schema, Document } from 'mongoose';

export interface IAiChatMessage extends Document {
  userId: mongoose.Types.ObjectId | string;
  symbol: string;
  sender: 'user' | 'tutor';
  text: string;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

const AiChatMessageSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    symbol: { type: String, default: 'BTCUSDT', index: true },
    sender: { type: String, enum: ['user', 'tutor'], required: true },
    text: { type: String, required: true },
    data: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export default mongoose.model<IAiChatMessage>('AiChatMessage', AiChatMessageSchema);
