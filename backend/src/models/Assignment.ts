import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignmentRequirement {
  id: string;
  text: string;
}

export interface IAssignment extends Document {
  simulationId: mongoose.Types.ObjectId;
  title: string;
  symbol?: string;
  description?: string;
  instructions?: string;
  requirements?: IAssignmentRequirement[];
  deadline: Date;
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  status: 'OPEN' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema(
  {
    simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: true },
    title: { type: String, required: true },
    symbol: { type: String, default: 'FPT' },
    description: { type: String },
    instructions: { type: String },
    requirements: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
      }
    ],
    deadline: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
