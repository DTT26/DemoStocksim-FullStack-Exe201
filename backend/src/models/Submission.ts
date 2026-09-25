import mongoose, { Schema, Document } from 'mongoose';

export interface IChecklistStatus {
  requirementId: string;
  completed: boolean;
}

export interface ISubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  content: string;
  checklistStatus: IChecklistStatus[];
  attachments?: string[];
  status: 'SUBMITTED' | 'GRADED' | 'DRAFT';
  score?: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema: Schema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    checklistStatus: [
      {
        requirementId: { type: String, required: true },
        completed: { type: Boolean, default: false },
      }
    ],
    attachments: [{ type: String }],
    status: { type: String, enum: ['SUBMITTED', 'GRADED', 'DRAFT'], default: 'SUBMITTED' },
    score: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
