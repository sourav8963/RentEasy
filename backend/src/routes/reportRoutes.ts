import { Router } from 'express';
import { getStats, exportCSV } from '../controllers/reportController';
import { authenticateToken, restrictTo } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(restrictTo('vendor', 'admin'));

router.get('/stats', getStats);
router.get('/export', exportCSV);

export default router;
