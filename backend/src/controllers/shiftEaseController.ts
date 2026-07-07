import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const bookShifting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { sourceAddress, destAddress, date, cargoSize, itemsList } = req.body;

    if (!sourceAddress || !destAddress || !date || !cargoSize) {
      res.status(400).json({ message: 'Missing required shifting fields' });
      return;
    }

    // Base pricing calculator
    let basePrice = 120;
    if (cargoSize === '1 BHK') basePrice = 200;
    else if (cargoSize === '2 BHK') basePrice = 320;
    else if (cargoSize === '3+ BHK') basePrice = 480;

    const refNo = 'SE-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    res.status(201).json({
      message: 'ShiftEase Shifting booked successfully!',
      booking: {
        refNo,
        userId: req.user.id,
        sourceAddress,
        destAddress,
        date,
        cargoSize,
        itemsList: itemsList || [],
        estimatedFee: basePrice,
        status: 'Scheduled'
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to book shifting', error: error.message });
  }
};
