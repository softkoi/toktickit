import { Router } from 'express';
import { authenticateUser } from '../middlewares/authMiddleware';
import { createTicket, getTickets, getTicketById, requestResolution } from '../controllers/ticket.controller';
import { getPublicComments, createPublicComment, getInternalNotes, createInternalNote } from '../controllers/commentNote.controller';
import { handleFileUpload } from '../middlewares/upload.middleware';
import { uploadAttachment, downloadAttachment, removeAttachment } from '../controllers/attachment.controller';

const router = Router();

// Middleware to authenticate
router.use(authenticateUser);

router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicketById);
router.post('/tickets', createTicket);
router.post('/tickets/:id/resolve-request', requestResolution);

// Comments
router.get('/tickets/:id/comments', getPublicComments);
router.post('/tickets/:id/comments', createPublicComment);

// Internal Notes
router.get('/staff/tickets/:id/notes', getInternalNotes);
router.post('/staff/tickets/:id/notes', createInternalNote);

// Attachments
router.post('/tickets/:id/attachments', handleFileUpload, uploadAttachment);
router.get('/attachments/:id/download', downloadAttachment);
router.patch('/attachments/:id/remove', removeAttachment);
router.delete('/attachments/:id/remove', removeAttachment);

export default router;
