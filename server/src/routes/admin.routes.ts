import { Router } from 'express';
import { authenticateUser, requireRoles } from '../middlewares/authMiddleware';
import { getUsers, createUser, updateUser, resetUserPassword } from '../controllers/admin.controller';

const router = Router();

// Scope authentication and ADMINISTRATOR role requirement to /admin/* routes only
router.use('/admin', authenticateUser, requireRoles('ADMINISTRATOR'));

router.get('/admin/users', getUsers);
router.post('/admin/users', createUser);
router.patch('/admin/users/:id', updateUser);
router.post('/admin/users/:id/reset-password', resetUserPassword);

export default router;
