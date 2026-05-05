import { Router } from 'express';
import {
  roomController,
  roomCreateSchema,
  roomUpdateSchema,
} from '../controllers/roomController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.use(authenticate);

router.get('/', roomController.listForApartment); // ?apartmentId=...
router.get('/:id', roomController.get);
router.post('/', validateBody(roomCreateSchema), roomController.create);
router.patch('/:id', validateBody(roomUpdateSchema), roomController.update);
router.delete('/:id', roomController.remove);

export default router;
