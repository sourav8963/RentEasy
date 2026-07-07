import Rental, { IRental, RentalStatus } from '../models/Rental';
import { JsonDb } from './dbFallback';
import mongoose from 'mongoose';
import { ProductService } from './productService';
import { UserService } from './userService';

export const RentalService = {
  async create(rentalData: Partial<IRental>): Promise<any> {
    if (JsonDb.isMongoActive) {
      const newRental = new Rental(rentalData);
      return await newRental.save();
    } else {
      const rentals = JsonDb.getRentals();
      const newId = new mongoose.Types.ObjectId().toString();
      const newRental = {
        id: newId,
        _id: newId,
        ...rentalData,
        status: rentalData.status || 'Pending',
        paymentStatus: rentalData.paymentStatus || 'Paid',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      rentals.push(newRental);
      JsonDb.saveRentals(rentals);
      return newRental;
    }
  },

  async getByUserId(userId: string): Promise<any[]> {
    if (JsonDb.isMongoActive) {
      return await Rental.find({ userId }).populate('productId').sort({ createdAt: -1 });
    } else {
      const rentals = JsonDb.getRentals().filter(r => r.userId === userId);
      const populated = [];
      for (const r of rentals) {
        const prod = await ProductService.findById(r.productId);
        populated.push({
          ...r,
          productId: prod
        });
      }
      return populated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async getByVendorId(vendorId: string): Promise<any[]> {
    if (JsonDb.isMongoActive) {
      // Find products belonging to the vendor
      const productIds = await mongoose.model('Product').find({ vendorId }).select('_id');
      return await Rental.find({ productId: { $in: productIds } })
        .populate('productId')
        .populate('userId', 'name email phone address')
        .sort({ createdAt: -1 });
    } else {
      const rentals = JsonDb.getRentals();
      const products = JsonDb.getProducts().filter(p => p.vendorId === vendorId);
      const productIds = products.map(p => p.id || p._id);
      
      const vendorRentals = rentals.filter(r => productIds.includes(r.productId));
      const populated = [];
      for (const r of vendorRentals) {
        const prod = products.find(p => p.id === r.productId || p._id === r.productId);
        const user = await UserService.findById(r.userId);
        populated.push({
          ...r,
          productId: prod,
          userId: user ? { _id: user.id || user._id, name: user.name, email: user.email, phone: user.phone, address: user.address } : r.userId
        });
      }
      return populated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async getAll(): Promise<any[]> {
    if (JsonDb.isMongoActive) {
      return await Rental.find({})
        .populate('productId')
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      const rentals = JsonDb.getRentals();
      const populated = [];
      for (const r of rentals) {
        const prod = await ProductService.findById(r.productId);
        const user = await UserService.findById(r.userId);
        populated.push({
          ...r,
          productId: prod,
          userId: user ? { _id: user.id || user._id, name: user.name, email: user.email, role: user.role } : r.userId
        });
      }
      return populated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async findById(id: string): Promise<any | null> {
    if (JsonDb.isMongoActive) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await Rental.findById(id).populate('productId').populate('userId', 'name email phone address');
    } else {
      const rentals = JsonDb.getRentals();
      const r = rentals.find(rent => rent.id === id || rent._id === id);
      if (!r) return null;
      const prod = await ProductService.findById(r.productId);
      const user = await UserService.findById(r.userId);
      return {
        ...r,
        productId: prod,
        userId: user ? { _id: user.id || user._id, name: user.name, email: user.email, phone: user.phone, address: user.address } : r.userId
      };
    }
  },

  async updateStatus(id: string, status: RentalStatus): Promise<any | null> {
    if (JsonDb.isMongoActive) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await Rental.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      const rentals = JsonDb.getRentals();
      const idx = rentals.findIndex(r => r.id === id || r._id === id);
      if (idx === -1) return null;
      rentals[idx].status = status;
      rentals[idx].updatedAt = new Date();
      JsonDb.saveRentals(rentals);
      return rentals[idx];
    }
  },

  async extendTenure(id: string, extraMonths: number): Promise<any | null> {
    if (JsonDb.isMongoActive) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const rental = await Rental.findById(id);
      if (!rental) return null;
      
      const newPlan = rental.rentalPlan + extraMonths;
      const newReturnDate = new Date(rental.returnDate);
      newReturnDate.setMonth(newReturnDate.getMonth() + extraMonths);

      return await Rental.findByIdAndUpdate(
        id, 
        { rentalPlan: newPlan, returnDate: newReturnDate }, 
        { new: true }
      );
    } else {
      const rentals = JsonDb.getRentals();
      const idx = rentals.findIndex(r => r.id === id || r._id === id);
      if (idx === -1) return null;
      
      const r = rentals[idx];
      r.rentalPlan = Number(r.rentalPlan) + Number(extraMonths);
      const newReturnDate = new Date(r.returnDate);
      newReturnDate.setMonth(newReturnDate.getMonth() + Number(extraMonths));
      r.returnDate = newReturnDate;
      r.updatedAt = new Date();

      JsonDb.saveRentals(rentals);
      return r;
    }
  },

  async update(id: string, updateData: any): Promise<any | null> {
    if (JsonDb.isMongoActive) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await Rental.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const rentals = JsonDb.getRentals();
      const idx = rentals.findIndex(r => r.id === id || r._id === id);
      if (idx === -1) return null;
      rentals[idx] = { ...rentals[idx], ...updateData, ...updateData, updatedAt: new Date() };
      JsonDb.saveRentals(rentals);
      return rentals[idx];
    }
  }
};
