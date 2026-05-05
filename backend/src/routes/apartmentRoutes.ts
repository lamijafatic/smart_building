import { Router } from 'express';
import {
  apartmentController,
  apartmentCreateSchema,
  apartmentUpdateSchema,
} from '../controllers/apartmentController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.use(authenticate);

router.get('/', apartmentController.listMine);
router.get('/:id', apartmentController.get);
router.post('/', validateBody(apartmentCreateSchema), apartmentController.create);
router.patch('/:id', validateBody(apartmentUpdateSchema), apartmentController.update);
router.delete('/:id', apartmentController.remove);

export default router;
