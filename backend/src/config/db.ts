import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { JsonDb } from '../services/dbFallback';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rentease';

  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI environment variable not defined. Falling back to local JSON database.');
    JsonDb.isMongoActive = false;
    return;
  }

  try {
    // Set a short timeout (3 seconds) for local checks so it doesn't hang long
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ MongoDB connected successfully.');
    JsonDb.isMongoActive = true;
  } catch (err: any) {
    console.warn(`❌ MongoDB connection failed: ${err.message}`);
    console.warn('⚠️ Falling back to local JSON database.');
    JsonDb.isMongoActive = false;
  }
};
