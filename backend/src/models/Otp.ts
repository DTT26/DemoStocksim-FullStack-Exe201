import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

const OtpSchema: Schema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    createdAt: { 
      type: Date, 
      default: Date.now, 
      expires: 600 // Tự động xóa bản ghi sau 600 giây (10 phút)
    },
  },
  { timestamps: false }
);

// Tạo index để tìm kiếm theo email nhanh chóng
OtpSchema.index({ email: 1 });

export default mongoose.model<IOtp>('Otp', OtpSchema);
