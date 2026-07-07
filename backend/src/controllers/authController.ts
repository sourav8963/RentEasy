import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'rentease_super_secret_key';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone, address, businessName, serviceAreas, referredBy } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Generate RentEase referral code
    const referralCode = 'EASE-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Check if referred by a valid user code to award EaseCredits
    let initialCredits = 0;
    if (referredBy) {
      const users = await UserService.getAll();
      const referrer = users.find(u => u.referralCode === referredBy);
      if (referrer) {
        // Credit the referrer by $25
        const currentRefCredits = referrer.easeCredits || 0;
        await UserService.update(referrer.id || referrer._id, { easeCredits: currentRefCredits + 25 });
        // Award $15 credit to the new user
        initialCredits = 15;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await UserService.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      phone,
      address,
      businessName: role === 'vendor' ? businessName : undefined,
      serviceAreas: role === 'vendor' ? (serviceAreas || []) : undefined,
      referralCode,
      easeCredits: initialCredits,
      verifyStatus: 'Unverified',
      verifyDocUrl: ''
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id || newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id || newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        businessName: newUser.businessName,
        serviceAreas: newUser.serviceAreas,
        referralCode: newUser.referralCode,
        easeCredits: newUser.easeCredits,
        verifyStatus: newUser.verifyStatus,
        verifyDocUrl: newUser.verifyDocUrl
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    const user = await UserService.findByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        businessName: user.businessName,
        serviceAreas: user.serviceAreas,
        referralCode: user.referralCode,
        easeCredits: user.easeCredits || 0,
        verifyStatus: user.verifyStatus || 'Unverified',
        verifyDocUrl: user.verifyDocUrl || ''
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const user = await UserService.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      businessName: user.businessName,
      serviceAreas: user.serviceAreas,
      referralCode: user.referralCode,
      easeCredits: user.easeCredits || 0,
      verifyStatus: user.verifyStatus || 'Unverified',
      verifyDocUrl: user.verifyDocUrl || ''
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { name, phone, address, businessName, serviceAreas, password } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (businessName) updates.businessName = businessName;
    if (serviceAreas) updates.serviceAreas = serviceAreas;

    if (password) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await UserService.update(req.user.id, updates);
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: updatedUser.id || updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      businessName: updatedUser.businessName,
      serviceAreas: updatedUser.serviceAreas,
      referralCode: updatedUser.referralCode,
      easeCredits: updatedUser.easeCredits || 0,
      verifyStatus: updatedUser.verifyStatus || 'Unverified',
      verifyDocUrl: updatedUser.verifyDocUrl || ''
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
};

export const verifyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { docUrl } = req.body;
    if (!docUrl) {
      res.status(400).json({ message: 'Document URL is required' });
      return;
    }

    const updatedUser = await UserService.update(req.user.id, {
      verifyStatus: 'Pending',
      verifyDocUrl: docUrl
    });

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: updatedUser.id || updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      verifyStatus: updatedUser.verifyStatus,
      verifyDocUrl: updatedUser.verifyDocUrl
    });
  } catch (error: any) {
    res.status(500).json({ message: 'KYC submission failed', error: error.message });
  }
};
