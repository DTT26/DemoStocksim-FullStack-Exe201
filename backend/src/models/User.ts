import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  name?: string;
  picture?: string;
  googleId?: string;
  role: 'student' | 'lecturer' | 'admin';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    name: { type: String },
    picture: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['student', 'lecturer', 'admin'], default: 'student' },
    status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
