import { Router } from 'express';
import {
  deviceController,
  deviceCreateSchema,
  deviceUpdateSchema,
  deviceStatusSchema,
} from '../controllers/deviceController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.use(authenticate);

router.get('/', deviceController.listForApartment); // ?apartmentId=...
router.get('/:id', deviceController.get);
router.get('/:id/history', deviceController.history); // ?days=7
router.post('/', validateBody(deviceCreateSchema), deviceController.create);
router.patch('/:id', validateBody(deviceUpdateSchema), deviceController.update);
router.patch('/:id/status', validateBody(deviceStatusSchema), deviceController.setStatus);
router.delete('/:id', deviceController.remove);

export default router;
