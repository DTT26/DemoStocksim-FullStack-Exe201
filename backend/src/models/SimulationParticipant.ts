import mongoose, { Schema, Document } from 'mongoose';

export interface ISimulationParticipant extends Document {
  simulationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  joinedAt: Date;
  status: 'ACTIVE' | 'DISQUALIFIED' | 'LEFT';
  initialBalance: number;
  currentBalance: number;
  portfolioValue: number;
  totalProfit: number;
  returnRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const SimulationParticipantSchema: Schema = new Schema(
  {
    simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'DISQUALIFIED', 'LEFT'], default: 'ACTIVE' },
    initialBalance: { type: Number, required: true },
    currentBalance: { type: Number, required: true },
    portfolioValue: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    returnRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Ensure a user can only join a simulation once
SimulationParticipantSchema.index({ simulationId: 1, userId: 1 }, { unique: true });

export default mongoose.model<ISimulationParticipant>('SimulationParticipant', SimulationParticipantSchema);
