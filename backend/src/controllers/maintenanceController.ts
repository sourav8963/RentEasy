import { Response } from 'express';
import { MaintenanceService } from '../services/maintenanceService';
import { RentalService } from '../services/rentalService';
import { ProductService } from '../services/productService';
import { AuthRequest } from '../middleware/auth';

export const createRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { rentalId, issueCategory, description, images } = req.body;

    if (!rentalId || !issueCategory || !description) {
      res.status(400).json({ message: 'Please provide rentalId, issueCategory, and description' });
      return;
    }

    const rental = await RentalService.findById(rentalId);
    if (!rental) {
      res.status(404).json({ message: 'Rental record not found' });
      return;
    }

    const product = await ProductService.findById(
      typeof rental.productId === 'object' ? rental.productId._id : rental.productId
    );
    if (!product) {
      res.status(404).json({ message: 'Associated product not found' });
      return;
    }

    const vendorId = typeof product.vendorId === 'object' ? (product.vendorId._id || product.vendorId.id) : product.vendorId;

    const maintenance = await MaintenanceService.create({
      rentalId,
      userId: req.user.id,
      vendorId: vendorId.toString(),
      issueCategory,
      description,
      images: images || ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'],
      status: 'Pending'
    });

    res.status(201).json(maintenance);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create maintenance request', error: error.message });
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    let requests;
    if (req.user.role === 'customer') {
      requests = await MaintenanceService.getByUserId(req.user.id);
    } else if (req.user.role === 'vendor') {
      requests = await MaintenanceService.getByVendorId(req.user.id);
    } else {
      requests = await MaintenanceService.getAll();
    }

    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch maintenance requests', error: error.message });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { status, resolutionNotes, scheduledDate } = req.body;

    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    const request = await MaintenanceService.findById(id);
    if (!request) {
      res.status(404).json({ message: 'Maintenance request not found' });
      return;
    }

    const vendorIdStr = typeof request.vendorId === 'object' ? (request.vendorId._id || request.vendorId.id) : request.vendorId;

    if (req.user.role !== 'admin' && vendorIdStr.toString() !== req.user.id) {
      res.status(403).json({ message: 'Unauthorized to modify this maintenance request' });
      return;
    }

    const updated = await MaintenanceService.updateStatus(
      id, 
      status, 
      resolutionNotes, 
      scheduledDate ? new Date(scheduledDate) : undefined
    );
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update maintenance request', error: error.message });
  }
};
