import { Router } from 'express';
import { authController, loginSchema } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
