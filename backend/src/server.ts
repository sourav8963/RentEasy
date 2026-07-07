import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import { seedDatabase } from './utils/seeder';

// Routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import rentalRoutes from './routes/rentalRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import reportRoutes from './routes/reportRoutes';
import adminRoutes from './routes/adminRoutes';
import shiftEaseRoutes from './routes/shiftEaseRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads folder statically for product/maintenance image uploads
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// Create uploads folder if it doesn't exist
import fs from 'fs';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// API Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shiftease', shiftEaseRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Start DB & Server
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 RentEase backend server is running on http://localhost:${PORT}`);
  });
};

startServer();
