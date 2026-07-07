import { Router } from 'express';
import { createRequest, getMyRequests, updateRequestStatus } from '../controllers/maintenanceController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createRequest);
router.get('/my-requests', getMyRequests);
router.put('/:id/status', updateRequestStatus);

export default router;
