import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/apartments/:apartmentId', notificationController.list);
router.patch('/:id/read', notificationController.markRead);
router.patch('/apartments/:apartmentId/read-all', notificationController.markAllRead);

export default router;
