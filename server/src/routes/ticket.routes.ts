import { Router } from 'express';
import { validateRequesterHeader } from '../middlewares/requester.middleware';
import { createTicket, getTickets, getTicketById } from '../controllers/ticket.controller';
import { handleFileUpload } from '../middlewares/upload.middleware';
import { uploadAttachment, downloadAttachment, removeAttachment } from '../controllers/attachment.controller';

const router = Router();

router.get('/tickets', validateRequesterHeader, getTickets);
router.get('/tickets/:id', validateRequesterHeader, getTicketById);
router.post('/tickets', validateRequesterHeader, createTicket);
router.post('/tickets/:id/attachments', validateRequesterHeader, handleFileUpload, uploadAttachment);

router.get('/attachments/:id/download', validateRequesterHeader, downloadAttachment);
router.patch('/attachments/:id/remove', validateRequesterHeader, removeAttachment);
router.delete('/attachments/:id/remove', validateRequesterHeader, removeAttachment);

export default router;


