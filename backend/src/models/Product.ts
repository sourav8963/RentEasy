import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  vendorId: mongoose.Types.ObjectId | string;
  category: 'furniture' | 'appliances';
  subCategory: string; // e.g. Bed, Sofa, Refrigerator, Washing Machine
  productName: string;
  rentPerMonth: number;
  securityDeposit: number;
  quantity: number;
  availableQuantity: number;
  images: string[];
  description: string;
  specifications: Record<string, string>; // e.g. {"Dimensions": "3x6 ft", "Color": "Teak"}
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true, enum: ['furniture', 'appliances'] },
    subCategory: { type: String, required: true },
    productName: { type: String, required: true },
    rentPerMonth: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    availableQuantity: { type: Number, required: true, default: 1 },
    images: { type: [String], default: [] },
    description: { type: String, default: '' },
    specifications: { type: Map, of: String, default: {} }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
