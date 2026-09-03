import { Router } from 'express';
import { validateRequesterHeader } from '../middlewares/requester.middleware';
import { createTicket } from '../controllers/ticket.controller';

const router = Router();

router.post('/tickets', validateRequesterHeader, createTicket);

export default router;
