import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

/**
 * GET /api/tickets/:id/actions-taken
 * Retrieve all actions taken for a ticket
 */
export async function getActionsTaken(req: AuthRequest, res: Response) {
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
        error: { code: 'FORBIDDEN', message: 'Access denied to this ticket' }
      });
    }

    const actionsTaken = await prisma.actionTaken.findMany({
      where: { ticketId },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json({ actionsTaken });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch actions taken' }
    });
  }
}

/**
 * POST /api/tickets/:id/actions-taken
 * Create a new action taken record for a ticket
 */
export async function createActionTaken(req: AuthRequest, res: Response) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid ticket ID' }
      });
    }

    // Authorization check: Only IT Staff and Admin can create actions taken
    if (req.user?.role === 'REQUESTER') {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Requesters are not permitted to create actions taken' }
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

    const { description, result, followUpRequired, followUpNote, attachmentNotes } = req.body;

    // Validation
    if (!description || typeof description !== 'string' || description.trim().length < 3) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Action description is required and must be at least 3 characters' }
      });
    }

    if (!result || typeof result !== 'string' || result.trim().length < 3) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Action result is required and must be at least 3 characters' }
      });
    }

    const isFollowUpRequired = Boolean(followUpRequired);
    const trimmedFollowUpNote = followUpNote ? String(followUpNote).trim() : null;

    if (isFollowUpRequired && (!trimmedFollowUpNote || trimmedFollowUpNote.length < 3)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Follow-up note is required and must be at least 3 characters when follow-up is required' }
      });
    }

    const actionTaken = await prisma.actionTaken.create({
      data: {
        ticketId,
        performedById: req.user!.id,
        description: description.trim(),
        result: result.trim(),
        followUpRequired: isFollowUpRequired,
        followUpNote: isFollowUpRequired ? trimmedFollowUpNote : null,
        attachmentNotes: attachmentNotes ? String(attachmentNotes).trim() : null
      },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    return res.status(201).json({ actionTaken });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create action taken' }
    });
  }
}

/**
 * PUT /api/actions-taken/:actionId
 * Update an existing action taken record
 */
export async function updateActionTaken(req: AuthRequest, res: Response) {
  try {
    const actionId = parseInt(req.params.actionId, 10);
    if (isNaN(actionId)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid action ID' }
      });
    }

    // Authorization check: Only IT Staff and Admin can update actions taken
    if (req.user?.role === 'REQUESTER') {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Requesters are not permitted to update actions taken' }
      });
    }

    const existingAction = await prisma.actionTaken.findUnique({
      where: { id: actionId }
    });

    if (!existingAction) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Action taken not found' }
      });
    }

    const { description, result, followUpRequired, followUpNote, attachmentNotes } = req.body;

    // Validation
    if (description !== undefined && (typeof description !== 'string' || description.trim().length < 3)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Action description must be at least 3 characters' }
      });
    }

    if (result !== undefined && (typeof result !== 'string' || result.trim().length < 3)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Action result must be at least 3 characters' }
      });
    }

    const isFollowUpRequired = followUpRequired !== undefined ? Boolean(followUpRequired) : existingAction.followUpRequired;
    const trimmedFollowUpNote = followUpNote !== undefined ? (followUpNote ? String(followUpNote).trim() : null) : existingAction.followUpNote;

    if (isFollowUpRequired && (!trimmedFollowUpNote || trimmedFollowUpNote.length < 3)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Follow-up note is required and must be at least 3 characters when follow-up is required' }
      });
    }

    const updatedAction = await prisma.actionTaken.update({
      where: { id: actionId },
      data: {
        description: description !== undefined ? description.trim() : existingAction.description,
        result: result !== undefined ? result.trim() : existingAction.result,
        followUpRequired: isFollowUpRequired,
        followUpNote: isFollowUpRequired ? trimmedFollowUpNote : null,
        attachmentNotes: attachmentNotes !== undefined ? (attachmentNotes ? String(attachmentNotes).trim() : null) : existingAction.attachmentNotes
      },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    return res.status(200).json({ actionTaken: updatedAction });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update action taken' }
    });
  }
}
