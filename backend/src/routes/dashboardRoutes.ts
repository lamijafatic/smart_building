import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/apartments/:apartmentId', dashboardController.get);
router.get('/apartments/:apartmentId/live', dashboardController.getLive);

export default router;
