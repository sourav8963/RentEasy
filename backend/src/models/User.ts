import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'vendor' | 'admin';
  phone?: string;
  address?: string;
  businessName?: string; // For vendors
  serviceAreas?: string[]; // For vendors (e.g. ['New York', 'Los Angeles'])
  referralCode?: string;
  easeCredits?: number;
  verifyStatus?: 'Unverified' | 'Pending' | 'Verified';
  verifyDocUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    phone: { type: String },
    address: { type: String },
    businessName: { type: String },
    serviceAreas: { type: [String], default: [] },
    referralCode: { type: String },
    easeCredits: { type: Number, default: 0 },
    verifyStatus: { type: String, enum: ['Unverified', 'Pending', 'Verified'], default: 'Unverified' },
    verifyDocUrl: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IUser>('User', UserSchema);
