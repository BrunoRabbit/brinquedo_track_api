import { Router } from 'express';
import { StatsController } from '../Controllers/StatsController';
import { authenticate } from '../Middleware/authenticate';

const router = Router();

router.get('/daily-sales', authenticate, StatsController.salesByDay);
router.get('/top-clients', authenticate, StatsController.topCustomers);

export { router as statsRoutes };
