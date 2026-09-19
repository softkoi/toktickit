import { Router } from 'express';
import { login, logout, getMe, changePassword } from '../controllers/auth.controller';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = Router();

router.post('/auth/login', login);
router.post('/auth/logout', authenticateUser, logout);
router.get('/auth/me', authenticateUser, getMe);
router.post('/auth/change-password', authenticateUser, changePassword);

export default router;
