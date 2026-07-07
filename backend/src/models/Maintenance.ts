import mongoose, { Schema, Document } from 'mongoose';

export type MaintenanceStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface IMaintenance extends Document {
  rentalId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string; // Cache userId for easy lookup
  vendorId: mongoose.Types.ObjectId | string; // Cache vendorId for vendor dashboard filtering
  issueCategory: string; // e.g. 'Functional Damage', 'Cleaning', 'Wear & Tear'
  description: string;
  images: string[];
  status: MaintenanceStatus;
  scheduledDate?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema: Schema = new Schema(
  {
    rentalId: { type: Schema.Types.ObjectId, ref: 'Rental', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    issueCategory: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    status: { 
      type: String, 
      required: true, 
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending'
    },
    scheduledDate: { type: Date },
    resolutionNotes: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);
