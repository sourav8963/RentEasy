import { Router } from 'express';
import { checkout, getMyRentals, updateRentalStatus, extendRental, buyoutRental, requestRelocate, requestFlexSwap } from '../controllers/rentalController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/checkout', checkout);
router.get('/my-rentals', getMyRentals);
router.put('/:id/status', updateRentalStatus);
router.put('/:id/extend', extendRental);
router.post('/:id/buyout', buyoutRental);
router.post('/:id/relocate', requestRelocate);
router.post('/:id/swap', requestFlexSwap);

export default router;
