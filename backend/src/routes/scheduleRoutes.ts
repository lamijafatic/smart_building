import { Router } from 'express';
import { scheduleController } from '../controllers/scheduleController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/device/:deviceId', scheduleController.listForDevice);
router.post('/', scheduleController.create);
router.patch('/:id', scheduleController.update);
router.delete('/:id', scheduleController.remove);

export default router;
