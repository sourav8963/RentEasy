import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticateToken, restrictTo } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Vendor-protected routes
router.post('/', authenticateToken, restrictTo('vendor', 'admin'), createProduct);
router.put('/:id', authenticateToken, restrictTo('vendor', 'admin'), updateProduct);
router.delete('/:id', authenticateToken, restrictTo('vendor', 'admin'), deleteProduct);

export default router;
