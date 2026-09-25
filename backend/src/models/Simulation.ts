import mongoose, { Schema, Document } from 'mongoose';

export interface ISimulation extends Document {
  name: string;
  description?: string;
  initialBalance: number;
  market: string;
  startDate: Date;
  endDate: Date;
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'ENDED';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SimulationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    initialBalance: { type: Number, required: true, default: 10000 },
    market: { type: String, default: 'GLOBAL' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['DRAFT', 'PUBLISHED', 'ACTIVE', 'ENDED'], 
      default: 'DRAFT' 
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model<ISimulation>('Simulation', SimulationSchema);
