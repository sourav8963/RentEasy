import User, { IUser } from '../models/User';
import { JsonDb } from './dbFallback';
import mongoose from 'mongoose';

export const UserService = {
  async findByEmail(email: string): Promise<any | null> {
    if (JsonDb.isMongoActive) {
      return await User.findOne({ email: email.toLowerCase() });
    } else {
      const users = JsonDb.getUsers();
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async findById(id: string): Promise<any | null> {
    if (JsonDb.isMongoActive) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await User.findById(id);
    } else {
      const users = JsonDb.getUsers();
      return users.find(u => u.id === id || u._id === id) || null;
    }
  },

  async create(userData: Partial<IUser> & { passwordHash: string }): Promise<any> {
    if (JsonDb.isMongoActive) {
      const newUser = new User(userData);
      return await newUser.save();
    } else {
      const users = JsonDb.getUsers();
      const newId = new mongoose.Types.ObjectId().toString();
      const newUser = {
        id: newId,
        _id: newId,
        ...userData,
        serviceAreas: userData.serviceAreas || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.push(newUser);
      JsonDb.saveUsers(users);
      return newUser;
    }
  },

  async getAll(): Promise<any[]> {
    if (JsonDb.isMongoActive) {
      return await User.find({});
    } else {
      return JsonDb.getUsers();
    }
  },

  async update(id: string, updateData: any): Promise<any | null> {
    if (JsonDb.isMongoActive) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await User.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const users = JsonDb.getUsers();
      const idx = users.findIndex(u => u.id === id || u._id === id);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...updateData, updatedAt: new Date() };
      JsonDb.saveUsers(users);
      return users[idx];
    }
  }
};
