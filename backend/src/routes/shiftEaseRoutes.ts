import { Router } from 'express';
import { bookShifting } from '../controllers/shiftEaseController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/mover', authenticateToken, bookShifting);

export default router;
