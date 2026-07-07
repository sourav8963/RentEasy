import { Router } from 'express';
import { getUsersList, updateUserByAdmin } from '../controllers/adminController';
import { authenticateToken, restrictTo } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(restrictTo('admin'));

router.get('/users', getUsersList);
router.put('/users/:id', updateUserByAdmin);

export default router;
