import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

export async function getPublicComments(req: AuthRequest, res: Response) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid ticket ID' }
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    // Role & ownership check
    if (req.user?.role === 'REQUESTER' && ticket.requesterId !== req.user.id) {
      return res.status(403).json({
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Access denied to this ticket' }
      });
    }

    const comments = await prisma.publicComment.findMany({
      where: { ticketId },
      include: {
        author: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch public comments' }
    });
  }
}

export async function createPublicComment(req: AuthRequest, res: Response) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid ticket ID' }
      });
    }

    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Comment content cannot be empty' }
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Comment content exceeds maximum length of 2000 characters' }
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    if (req.user?.role === 'REQUESTER' && ticket.requesterId !== req.user.id) {
      return res.status(403).json({
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Access denied to this ticket' }
      });
    }

    const newComment = await prisma.publicComment.create({
      data: {
        ticketId,
        authorId: req.user!.id,
        content: content.trim()
      },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    return res.status(201).json(newComment);
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create public comment' }
    });
  }
}

export async function getInternalNotes(req: AuthRequest, res: Response) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid ticket ID' }
      });
    }

    // Requesters must get 403 Forbidden
    if (req.user?.role === 'REQUESTER') {
      return res.status(403).json({
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Requesters are not authorized to view internal notes' }
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    const notes = await prisma.internalNote.findMany({
      where: { ticketId },
      include: {
        author: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch internal notes' }
    });
  }
}

export async function createInternalNote(req: AuthRequest, res: Response) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid ticket ID' }
      });
    }

    if (req.user?.role === 'REQUESTER') {
      return res.status(403).json({
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Requesters are not authorized to create internal notes' }
      });
    }

    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Note content cannot be empty' }
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Note content exceeds maximum length of 2000 characters' }
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    const newNote = await prisma.internalNote.create({
      data: {
        ticketId,
        authorId: req.user!.id,
        content: content.trim()
      },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    return res.status(201).json(newNote);
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create internal note' }
    });
  }
}
