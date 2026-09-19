import { Router } from 'express';
import { authenticateUser, requireRoles } from '../middlewares/authMiddleware';
import {
  getStaffTickets,
  getStaffTicketById,
  claimTicket,
  assignTicket,
  updateItPriority,
  updateTicketStatus
} from '../controllers/staff.controller';

const router = Router();

// Scope authentication and IT_STAFF / ADMINISTRATOR requirement to /staff/* routes only
router.use('/staff', authenticateUser, requireRoles('IT_STAFF', 'ADMINISTRATOR'));

router.get('/staff/tickets', getStaffTickets);
router.get('/staff/tickets/:id', getStaffTicketById);
router.patch('/staff/tickets/:id/claim', claimTicket);
router.patch('/staff/tickets/:id/assign', assignTicket);
router.patch('/staff/tickets/:id/priority', updateItPriority);
router.patch('/staff/tickets/:id/status', updateTicketStatus);

export default router;
