import { Response } from 'express';
import { RentalService } from '../services/rentalService';
import { ProductService } from '../services/productService';
import { UserService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { items, deliveryAddress, deliveryDate, deliveryTimeSlot, rentShieldActive, usedEaseCredits } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !deliveryAddress || !deliveryDate) {
      res.status(400).json({ message: 'Please provide items, address, and delivery date' });
      return;
    }

    const rentals = [];
    const dateParsed = new Date(deliveryDate);

    for (const item of items) {
      const product = await ProductService.findById(item.productId);
      if (!product) {
        res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        return;
      }

      if (product.availableQuantity < item.quantity) {
        res.status(400).json({ message: `Insufficient quantity for ${product.productName}` });
        return;
      }

      // Calculate return date
      const returnDate = new Date(dateParsed);
      returnDate.setMonth(returnDate.getMonth() + Number(item.rentalPlan));

      // Create rental record
      const rental = await RentalService.create({
        userId: req.user.id,
        productId: item.productId,
        rentalPlan: Number(item.rentalPlan),
        rentPerMonth: Number(item.rentPerMonth),
        securityDeposit: Number(item.securityDeposit),
        quantity: Number(item.quantity),
        deliveryAddress,
        deliveryDate: dateParsed,
        returnDate,
        deliveryTimeSlot,
        status: 'Pending',
        paymentStatus: 'Paid',
        rentShieldActive: rentShieldActive || false
      });

      // Update product inventory
      await ProductService.update(item.productId, {
        availableQuantity: product.availableQuantity - item.quantity
      });

      rentals.push(rental);
    }

    // Deduct user EaseCredits if spent
    if (usedEaseCredits && Number(usedEaseCredits) > 0) {
      const userObj = await UserService.findById(req.user.id);
      if (userObj) {
        const currentCredits = userObj.easeCredits || 0;
        await UserService.update(req.user.id, {
          easeCredits: Math.max(0, currentCredits - Number(usedEaseCredits))
        });
      }
    }

    res.status(201).json({ message: 'Checkout successful', rentals });
  } catch (error: any) {
    res.status(500).json({ message: 'Checkout failed', error: error.message });
  }
};

export const getMyRentals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    let rentals;
    if (req.user.role === 'customer') {
      rentals = await RentalService.getByUserId(req.user.id);
    } else if (req.user.role === 'vendor') {
      rentals = await RentalService.getByVendorId(req.user.id);
    } else {
      // Admin gets all rentals
      rentals = await RentalService.getAll();
    }

    res.json(rentals);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch rentals', error: error.message });
  }
};

export const updateRentalStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    const rental = await RentalService.findById(id);
    if (!rental) {
      res.status(404).json({ message: 'Rental order not found' });
      return;
    }

    // Verify permission (Vendor or Admin)
    const product = await ProductService.findById(typeof rental.productId === 'object' ? rental.productId._id : rental.productId);
    const vendorIdStr = product ? (typeof product.vendorId === 'object' ? product.vendorId._id : product.vendorId) : '';

    if (req.user.role !== 'admin' && vendorIdStr.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to modify this rental order' });
      return;
    }

    // If order was cancelled or completed, return the inventory quantity back to the product
    if ((status === 'Cancelled' || status === 'Completed') && rental.status !== 'Cancelled' && rental.status !== 'Completed') {
      const currentProd = await ProductService.findById(typeof rental.productId === 'object' ? rental.productId._id : rental.productId);
      if (currentProd) {
        await ProductService.update(currentProd.id || currentProd._id, {
          availableQuantity: currentProd.availableQuantity + rental.quantity
        });
      }
    }

    const updated = await RentalService.updateStatus(id, status);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update rental status', error: error.message });
  }
};

export const extendRental = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { months } = req.body;

    if (!months || isNaN(Number(months)) || Number(months) <= 0) {
      res.status(400).json({ message: 'Please provide valid number of months to extend' });
      return;
    }

    const rental = await RentalService.findById(id);
    if (!rental) {
      res.status(404).json({ message: 'Rental not found' });
      return;
    }

    const userIdStr = typeof rental.userId === 'object' ? (rental.userId._id || rental.userId.id) : rental.userId;
    if (userIdStr.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Unauthorized to extend this rental' });
      return;
    }

    const updated = await RentalService.extendTenure(id, Number(months));
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to extend rental duration', error: error.message });
  }
};

export const buyoutRental = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const rental = await RentalService.findById(id);
    if (!rental) {
      res.status(404).json({ message: 'Rental not found' });
      return;
    }

    const userIdStr = typeof rental.userId === 'object' ? (rental.userId._id || rental.userId.id) : rental.userId;
    if (userIdStr.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Unauthorized to buyout this rental' });
      return;
    }

    const depositAmount = rental.securityDeposit || 100;
    const planMonths = rental.rentalPlan || 3;
    const rentAmount = rental.rentPerMonth || 20;

    // Depreciated cost buyout calculation
    const buyoutCost = Math.max(
      depositAmount,
      Math.round((depositAmount * 2.5) - (planMonths * rentAmount * 0.15))
    );

    const updated = await RentalService.update(id, {
      status: 'Completed',
      ownedOutright: true
    });

    res.json({
      message: 'Buyout successful. You now own this item outright!',
      buyoutCost,
      rental: updated
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Buyout failed', error: error.message });
  }
};

export const requestRelocate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { address } = req.body;

    if (!address) {
      res.status(400).json({ message: 'Relocation address is required' });
      return;
    }

    const rental = await RentalService.findById(id);
    if (!rental) {
      res.status(404).json({ message: 'Rental not found' });
      return;
    }

    const updated = await RentalService.update(id, {
      relocationRequested: true,
      relocationAddress: address
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Relocation request failed', error: error.message });
  }
};

export const requestFlexSwap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { targetProductId } = req.body;

    if (!targetProductId) {
      res.status(400).json({ message: 'Target product ID is required' });
      return;
    }

    const rental = await RentalService.findById(id);
    if (!rental) {
      res.status(404).json({ message: 'Rental not found' });
      return;
    }

    const updated = await RentalService.update(id, {
      flexSwapRequested: true,
      flexSwapProductId: targetProductId
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'FlexSwap request failed', error: error.message });
  }
};
