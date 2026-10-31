import { Router } from 'express';
import { authenticateUser } from '../middlewares/authMiddleware';
import { getRequesterDashboard, getStaffDashboard } from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticateUser);

router.get('/dashboard/requester', getRequesterDashboard);
router.get('/dashboard/staff', getStaffDashboard);

export default router;
