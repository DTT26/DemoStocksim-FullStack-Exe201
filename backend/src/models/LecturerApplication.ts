import mongoose, { Schema, Document } from 'mongoose';

export interface ILecturerApplication extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  university?: string;
  department?: string;
  experience: string;
  linkedinOrPortfolio?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LecturerApplicationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    university: { type: String, default: '' },
    department: { type: String, default: '' },
    experience: { type: String, required: true },
    linkedinOrPortfolio: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['PENDING', 'APPROVED', 'REJECTED'], 
      default: 'PENDING' 
    },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ILecturerApplication>('LecturerApplication', LecturerApplicationSchema);
