import mongoose, { Schema, Document } from 'mongoose';

export type RentalStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Delivered' 
  | 'Active' 
  | 'Pickup Scheduled' 
  | 'Completed' 
  | 'Cancelled';

export interface IRental extends Document {
  userId: mongoose.Types.ObjectId | string;
  productId: mongoose.Types.ObjectId | string;
  rentalPlan: number; // e.g., 3, 6, 12, 24 months
  rentPerMonth: number;
  securityDeposit: number;
  quantity: number;
  deliveryDate: Date;
  returnDate: Date;
  deliveryAddress: string;
  deliveryTimeSlot?: string;
  status: RentalStatus;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  rentShieldActive: boolean;
  relocationRequested: boolean;
  relocationAddress?: string;
  flexSwapRequested: boolean;
  flexSwapProductId?: mongoose.Types.ObjectId | string;
  ownedOutright: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RentalSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    rentalPlan: { type: Number, required: true }, // duration in months
    rentPerMonth: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    deliveryDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryTimeSlot: { type: String },
    status: { 
      type: String, 
      required: true, 
      enum: ['Pending', 'Confirmed', 'Delivered', 'Active', 'Pickup Scheduled', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Paid'
    },
    rentShieldActive: { type: Boolean, default: false },
    relocationRequested: { type: Boolean, default: false },
    relocationAddress: { type: String, default: '' },
    flexSwapRequested: { type: Boolean, default: false },
    flexSwapProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
    ownedOutright: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IRental>('Rental', RentalSchema);
