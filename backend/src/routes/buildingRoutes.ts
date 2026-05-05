import { Router } from 'express';
import {
  buildingController,
  buildingCreateSchema,
  buildingUpdateSchema,
} from '../controllers/buildingController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.use(authenticate);

router.get('/', buildingController.list);
router.get('/:id', buildingController.get);
router.post('/', validateBody(buildingCreateSchema), buildingController.create);
router.patch('/:id', validateBody(buildingUpdateSchema), buildingController.update);
router.delete('/:id', buildingController.remove);

export default router;
