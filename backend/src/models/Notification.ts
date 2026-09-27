import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 
    | 'SIMULATION_JOIN' 
    | 'SIMULATION_APPROVED' 
    | 'SIMULATION_REJECTED' 
    | 'SIMULATION_KICKED' 
    | 'ASSIGNMENT_NEW' 
    | 'ASSIGNMENT_DUE' 
    | 'ASSIGNMENT_SUBMITTED' 
    | 'ASSIGNMENT_GRADED' 
    | 'SYSTEM';
  read: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'SIMULATION_JOIN',
        'SIMULATION_APPROVED',
        'SIMULATION_REJECTED',
        'SIMULATION_KICKED',
        'ASSIGNMENT_NEW',
        'ASSIGNMENT_DUE',
        'ASSIGNMENT_SUBMITTED',
        'ASSIGNMENT_GRADED',
        'SYSTEM'
      ],
      default: 'SYSTEM'
    },
    read: { type: Boolean, default: false, index: true },
    link: { type: String }
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
