import { Response } from 'express';
import { UserService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';

export const getUsersList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await UserService.getAll();
    // Exclude password hashes
    const sanitized = users.map(u => ({
      id: u.id || u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      address: u.address,
      businessName: u.businessName,
      serviceAreas: u.serviceAreas,
      createdAt: u.createdAt
    }));
    res.json(sanitized);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch users list', error: error.message });
  }
};

export const updateUserByAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, phone, address, businessName, serviceAreas } = req.body;
    
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (businessName !== undefined) updates.businessName = businessName;
    if (serviceAreas !== undefined) updates.serviceAreas = serviceAreas;

    const updated = await UserService.update(id, updates);
    if (!updated) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: updated.id || updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      address: updated.address,
      businessName: updated.businessName,
      serviceAreas: updated.serviceAreas
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};
