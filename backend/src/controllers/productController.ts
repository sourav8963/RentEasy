import { Response } from 'express';
import { ProductService } from '../services/productService';
import { AuthRequest } from '../middleware/auth';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, subCategory, search, sort } = req.query;
    const products = await ProductService.getAll({
      category: category as string,
      subCategory: subCategory as string,
      search: search as string,
      sort: sort as string
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await ProductService.findById(id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch product details', error: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { category, subCategory, productName, rentPerMonth, securityDeposit, quantity, images, description, specifications } = req.body;

    if (!category || !subCategory || !productName || !rentPerMonth || !securityDeposit || !quantity) {
      res.status(400).json({ message: 'Missing required product fields' });
      return;
    }

    const product = await ProductService.create({
      vendorId: req.user.id,
      category,
      subCategory,
      productName,
      rentPerMonth: Number(rentPerMonth),
      securityDeposit: Number(securityDeposit),
      quantity: Number(quantity),
      availableQuantity: Number(quantity),
      images: images || ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'],
      description: description || '',
      specifications: specifications || {}
    });

    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const product = await ProductService.findById(id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Verify vendor owns this product
    const vendorIdStr = typeof product.vendorId === 'object' ? (product.vendorId._id || product.vendorId.id) : product.vendorId;
    if (vendorIdStr.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Unauthorized to edit this product' });
      return;
    }

    // Adjust availableQuantity if quantity changes
    if (req.body.quantity !== undefined) {
      const diff = Number(req.body.quantity) - product.quantity;
      req.body.availableQuantity = Math.max(0, product.availableQuantity + diff);
    }

    const updated = await ProductService.update(id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const product = await ProductService.findById(id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const vendorIdStr = typeof product.vendorId === 'object' ? (product.vendorId._id || product.vendorId.id) : product.vendorId;
    if (vendorIdStr.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Unauthorized to delete this product' });
      return;
    }

    const success = await ProductService.delete(id);
    if (success) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete product' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};
