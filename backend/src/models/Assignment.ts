import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  simulationId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  instructions?: string;
  deadline: Date;
  createdBy: mongoose.Types.ObjectId;
  status: 'OPEN' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema(
  {
    simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: true },
    title: { type: String, required: true },
    description: { type: String },
    instructions: { type: String },
    deadline: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
