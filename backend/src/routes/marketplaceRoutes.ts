import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireTenant } from '../middleware/tenant';
import { createServiceRequest, listServiceRequests } from '../controllers/marketplaceController';

const router = Router();
router.get('/', authMiddleware, requireTenant, listServiceRequests);
router.post('/', authMiddleware, requireTenant, createServiceRequest);

export default router;
