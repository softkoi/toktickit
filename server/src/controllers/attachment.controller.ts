import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { canAddAttachment } from '../services/attachment.service';
import { safeUnlink } from '../utils/file.utils';

const prisma = new PrismaClient();

export async function uploadAttachment(req: Request, res: Response) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid ticket ID',
        },
      });
    }

    const requesterId = (req as any).requesterId;
    if (!requesterId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUESTER_HEADER',
          message: 'X-Requester-Id header is required',
        },
      });
    }

    // 1. Find ticket by ID
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      // Clean up uploaded temp file if present
      if (req.file) {
        await safeUnlink(req.file.path);
      }
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        },
      });
    }

    // 2. Ownership Enforcement Rule (BR-09 / BR-24)
    if (ticket.requesterId !== requesterId) {
      if (req.file) {
        await safeUnlink(req.file.path);
      }
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden: You do not own this ticket',
        },
      });
    }

    // 3. File presence check
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded in form field "file"',
        },
      });
    }

    // 4. Quota check (Max 5 active attachments)
    const allowed = await canAddAttachment(ticketId, prisma);
    if (!allowed) {
      await safeUnlink(req.file.path);
      return res.status(409).json({
        success: false,
        error: {
          code: 'ATTACHMENT_LIMIT_REACHED',
          message: 'Active attachment limit of 5 reached',
        },
      });
    }

    // 5. Create Attachment record in DB
    const attachment = await prisma.attachment.create({
      data: {
        ticketId,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        filePath: req.file.path,
        isRemoved: false,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: attachment.id,
        ticketId: attachment.ticketId,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        uploadedAt: attachment.uploadedAt,
        isRemoved: attachment.isRemoved,
      },
    });
  } catch (error: any) {
    if (req.file) {
      await safeUnlink(req.file.path);
    }
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'An unexpected error occurred',
      },
    });
  }
}
