import { Router } from 'express';
import { validateRequesterHeader } from '../middlewares/requester.middleware';
import { createTicket, getTickets } from '../controllers/ticket.controller';
import { handleFileUpload } from '../middlewares/upload.middleware';
import { uploadAttachment } from '../controllers/attachment.controller';

const router = Router();

router.get('/tickets', validateRequesterHeader, getTickets);
router.post('/tickets', validateRequesterHeader, createTicket);
router.post('/tickets/:id/attachments', validateRequesterHeader, handleFileUpload, uploadAttachment);


export default router;

