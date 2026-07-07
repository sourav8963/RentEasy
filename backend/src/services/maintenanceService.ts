import Maintenance, { IMaintenance, MaintenanceStatus } from '../models/Maintenance';
import { JsonDb } from './dbFallback';
import mongoose from 'mongoose';
import { RentalService } from './rentalService';

export const MaintenanceService = {
  async create(data: Partial<IMaintenance>): Promise<any> {
    if (JsonDb.isMongoActive) {
      const newRequest = new Maintenance(data);
      return await newRequest.save();
    } else {
      const list = JsonDb.getMaintenance();
      const newId = new mongoose.Types.ObjectId().toString();
      const newRequest = {
        id: newId,
        _id: newId,
        ...data,
        status: data.status || 'Pending',
        resolutionNotes: data.resolutionNotes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      list.push(newRequest);
      JsonDb.saveMaintenance(list);
      return newRequest;
    }
  },

  async getByUserId(userId: string): Promise<any[]> {
    if (JsonDb.isMongoActive) {
      return await Maintenance.find({ userId })
        .populate('rentalId')
        .sort({ createdAt: -1 });
    } else {
      const list = JsonDb.getMaintenance().filter(m => m.userId === userId);
      const populated = [];
      for (const m of list) {
        const rental = await RentalService.findById(m.rentalId);
        populated.push({
          ...m,
          rentalId: rental
        });
      }
      return populated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async getByVendorId(vendorId: string): Promise<any[]> {
    if (JsonDb.isMongoActive) {
      return await Maintenance.find({ vendorId })
        .populate('rentalId')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 });
    } else {
      const list = JsonDb.getMaintenance().filter(m => m.vendorId === vendorId);
      const populated = [];
      for (const m of list) {
        const rental = await RentalService.findById(m.rentalId);
        populated.push({
          ...m,
          rentalId: rental
        });
      }
      return populated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async getAll(): Promise<any[]> {
    if (JsonDb.isMongoActive) {
      return await Maintenance.find({})
        .populate('rentalId')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    } else {
      const list = JsonDb.getMaintenance();
      const populated = [];
      for (const m of list) {
        const rental = await RentalService.findById(m.rentalId);
        populated.push({
          ...m,
          rentalId: rental
        });
      }
      return populated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async findById(id: string): Promise<any | null> {
    if (JsonDb.isMongoActive) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await Maintenance.findById(id).populate('rentalId').populate('userId', 'name email phone');
    } else {
      const list = JsonDb.getMaintenance();
      const m = list.find(item => item.id === id || item._id === id);
      if (!m) return null;
      const rental = await RentalService.findById(m.rentalId);
      return {
        ...m,
        rentalId: rental
      };
    }
  },

  async updateStatus(
    id: string, 
    status: MaintenanceStatus, 
    resolutionNotes?: string, 
    scheduledDate?: Date
  ): Promise<any | null> {
    if (JsonDb.isMongoActive) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const updates: any = { status };
      if (resolutionNotes !== undefined) updates.resolutionNotes = resolutionNotes;
      if (scheduledDate !== undefined) updates.scheduledDate = scheduledDate;

      return await Maintenance.findByIdAndUpdate(id, updates, { new: true });
    } else {
      const list = JsonDb.getMaintenance();
      const idx = list.findIndex(m => m.id === id || m._id === id);
      if (idx === -1) return null;

      list[idx].status = status;
      if (resolutionNotes !== undefined) list[idx].resolutionNotes = resolutionNotes;
      if (scheduledDate !== undefined) list[idx].scheduledDate = scheduledDate;
      list[idx].updatedAt = new Date();

      JsonDb.saveMaintenance(list);
      return list[idx];
    }
  }
};
