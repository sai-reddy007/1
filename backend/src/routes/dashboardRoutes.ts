import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';
import { requireTenant } from '../middleware/tenant';

const router = Router();
router.get('/', authMiddleware, requireTenant, getDashboard);
export default router;
