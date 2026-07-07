import { Response } from 'express';
import { RentalService } from '../services/rentalService';
import { ProductService } from '../services/productService';
import { MaintenanceService } from '../services/maintenanceService';
import { UserService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const isVendor = req.user.role === 'vendor';
    const isAdmin = req.user.role === 'admin';

    if (!isVendor && !isAdmin) {
      res.status(403).json({ message: 'Access denied: stats only available for vendors/admins' });
      return;
    }

    // Retrieve active inventory data
    let products = await ProductService.getAll({});
    let rentals = await RentalService.getAll();
    let maintenance = await MaintenanceService.getAll();

    if (isVendor) {
      // Filter for vendor products
      const vId = req.user.id;
      products = products.filter(p => {
        const vendorIdStr = typeof p.vendorId === 'object' ? (p.vendorId._id || p.vendorId.id) : p.vendorId;
        return vendorIdStr.toString() === vId;
      });
      // Filter for vendor rentals
      rentals = rentals.filter(r => {
        const p = r.productId;
        const vendorIdStr = p ? (typeof p.vendorId === 'object' ? p.vendorId._id : p.vendorId) : '';
        return vendorIdStr.toString() === vId;
      });
      // Filter for vendor maintenance
      maintenance = maintenance.filter(m => {
        const vendorIdStr = typeof m.vendorId === 'object' ? (m.vendorId._id || m.vendorId.id) : m.vendorId;
        return vendorIdStr.toString() === vId;
      });
    }

    // Calculations
    const totalProductsCount = products.length;
    const totalInventoryCount = products.reduce((acc, p) => acc + p.quantity, 0);
    const availableInventoryCount = products.reduce((acc, p) => acc + p.availableQuantity, 0);
    const rentedInventoryCount = totalInventoryCount - availableInventoryCount;

    const utilizationRate = totalInventoryCount > 0 
      ? Math.round((rentedInventoryCount / totalInventoryCount) * 100) 
      : 0;

    const activeRentals = rentals.filter(r => r.status === 'Active' || r.status === 'Delivered');
    const totalRevenue = rentals.reduce((acc, r) => acc + (r.rentPerMonth * r.quantity), 0);
    const mrr = activeRentals.reduce((acc, r) => acc + (r.rentPerMonth * r.quantity), 0);

    const pendingMaintenance = maintenance.filter(m => m.status === 'Pending').length;
    const completedMaintenance = maintenance.filter(m => m.status === 'Resolved').length;

    res.json({
      totalProductsCount,
      totalInventoryCount,
      rentedInventoryCount,
      utilizationRate,
      activeRentalsCount: activeRentals.length,
      totalRevenue,
      mrr,
      pendingMaintenance,
      completedMaintenance,
      rentalsList: rentals.slice(0, 10), // Limit list for summary
      maintenanceList: maintenance.slice(0, 10)
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve stats', error: error.message });
  }
};

export const exportCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { type } = req.query; // 'rentals', 'products', 'maintenance'
    let csvContent = '';
    let fileName = 'report.csv';

    if (type === 'rentals') {
      const rentals = req.user.role === 'admin' 
        ? await RentalService.getAll() 
        : await RentalService.getByVendorId(req.user.id);
      
      csvContent = 'Rental ID,Customer Name,Product,Plan (Months),Monthly Rent,Security Deposit,Status,Delivery Date,Return Date\n';
      rentals.forEach(r => {
        const customerName = r.userId && typeof r.userId === 'object' ? r.userId.name : 'N/A';
        const productName = r.productId && typeof r.productId === 'object' ? r.productId.productName : 'N/A';
        csvContent += `"${r.id || r._id}","${customerName}","${productName}",${r.rentalPlan},${r.rentPerMonth},${r.securityDeposit},"${r.status}","${r.deliveryDate}","${r.returnDate}"\n`;
      });
      fileName = 'rentals_report.csv';
    } else if (type === 'products') {
      const products = await ProductService.getAll({});
      const filtered = req.user.role === 'admin' 
        ? products 
        : products.filter(p => {
            const vendorIdStr = typeof p.vendorId === 'object' ? (p.vendorId._id || p.vendorId.id) : p.vendorId;
            return vendorIdStr.toString() === req.user!.id;
          });

      csvContent = 'Product ID,Product Name,Category,Sub-Category,Monthly Rent,Security Deposit,Total Qty,Available Qty\n';
      filtered.forEach(p => {
        csvContent += `"${p.id || p._id}","${p.productName}","${p.category}","${p.subCategory}",${p.rentPerMonth},${p.securityDeposit},${p.quantity},${p.availableQuantity}\n`;
      });
      fileName = 'products_report.csv';
    } else if (type === 'maintenance') {
      const requests = req.user.role === 'admin'
        ? await MaintenanceService.getAll()
        : await MaintenanceService.getByVendorId(req.user.id);

      csvContent = 'Ticket ID,Rental ID,Issue,Description,Status,Resolution Notes\n';
      requests.forEach(m => {
        csvContent += `"${m.id || m._id}","${m.rentalId}","${m.issueCategory}","${m.description}","${m.status}","${m.resolutionNotes || ''}"\n`;
      });
      fileName = 'maintenance_report.csv';
    } else {
      res.status(400).json({ message: 'Invalid report type' });
      return;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to export CSV report', error: error.message });
  }
};
