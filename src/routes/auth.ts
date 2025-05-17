import { Router } from 'express';
import { AuthController } from '../Controllers/AuthController';
import { authenticate } from '../Middleware/authenticate';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/logout', authenticate, AuthController.logout);

export { router as authRoutes };
