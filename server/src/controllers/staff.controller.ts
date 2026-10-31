import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  NEW: ['OPEN', 'IN_PROGRESS', 'CANCELLED'],
  OPEN: ['IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'RESOLVED', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_FOR_REQUESTER', 'RESOLVED', 'OPEN', 'CANCELLED'],
  WAITING_FOR_REQUESTER: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  CANCELLED: []
};

export function isValidStatusTransition(currentStatus: string, nextStatus: string): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export async function getStaffTickets(req: AuthRequest, res: Response) {
  try {
    const search = req.query.search ? String(req.query.search).trim() : '';
    const status = req.query.status ? String(req.query.status).trim() : undefined;
    const priority = req.query.priority ? String(req.query.priority).trim() : undefined;
    const ownerIdQuery = req.query.ownerId ? String(req.query.ownerId).trim() : undefined;
    const sortBy = String(req.query.sortBy || 'createdAt').trim();
    const sortOrder = String(req.query.sortOrder || 'desc').trim().toLowerCase() === 'asc' ? 'asc' : 'desc';
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const pageSize = Math.max(1, parseInt(String(req.query.pageSize || '10'), 10) || 10);

    const where: any = {};

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search } },
        { summary: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (status) {
      where.currentStatus = status;
    }

    if (priority) {
      where.itPriority = priority;
    }

    if (ownerIdQuery) {
      if (ownerIdQuery.toLowerCase() === 'unassigned') {
        where.ownerId = null;
      } else {
        const parsedOwnerId = parseInt(ownerIdQuery, 10);
        if (!isNaN(parsedOwnerId)) {
          where.ownerId = parsedOwnerId;
        }
      }
    }

    const validSortFields = ['createdAt', 'updatedAt', 'itPriority', 'ticketNumber'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const total = await prisma.ticket.count({ where });
    const items = await prisma.ticket.findMany({
      where,
      include: {
        requester: {
          select: { id: true, name: true, email: true, role: true }
        },
        owner: {
          select: { id: true, name: true, email: true, role: true }
        },
        category: true,
        relatedSystem: true
      },
      orderBy: { [orderField]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return res.status(200).json({
      data: items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch staff ticket queue'
      }
    });
  }
}

export async function getStaffTicketById(req: AuthRequest, res: Response) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid ticket ID' }
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        requester: { select: { id: true, name: true, email: true, role: true } },
        owner: { select: { id: true, name: true, email: true, role: true } },
        category: true,
        relatedSystem: true,
        attachments: true,
        publicComments: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        },
        internalNotes: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch ticket detail' }
    });
  }
}

export async function claimTicket(req: AuthRequest, res: Response) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid ticket ID' }
      });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { ownerId: req.user!.id },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    return res.status(200).json({ ticket: updatedTicket });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to claim ticket' }
    });
  }
}

export async function assignTicket(req: AuthRequest, res: Response) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid ticket ID' }
      });
    }

    const { ownerId } = req.body;
    if (ownerId === undefined) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Owner ID is required' }
      });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    if (ownerId !== null) {
      const targetUser = await prisma.user.findUnique({ where: { id: Number(ownerId) } });
      if (!targetUser || !targetUser.isActive || (targetUser.role !== 'IT_STAFF' && targetUser.role !== 'ADMINISTRATOR')) {
        return res.status(400).json({
          error: { code: 'INVALID_INPUT', message: 'Assigned owner must be an active IT Staff or Administrator' }
        });
      }
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { ownerId: ownerId === null ? null : Number(ownerId) },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    return res.status(200).json({ ticket: updatedTicket });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to assign ticket' }
    });
  }
}

export async function updateItPriority(req: AuthRequest, res: Response) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid ticket ID' }
      });
    }

    const { itPriority } = req.body;
    if (!itPriority || !['LOW', 'MEDIUM', 'HIGH'].includes(itPriority)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Valid IT priority (LOW, MEDIUM, HIGH) is required' }
      });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { itPriority }
    });

    return res.status(200).json({ ticket: updatedTicket });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update IT priority' }
    });
  }
}

export async function updateTicketStatus(req: AuthRequest, res: Response) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid ticket ID' }
      });
    }

    // Role check: Only IT Staff and Admin can update ticket status
    if (req.user?.role === 'REQUESTER') {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Requesters are not permitted to change ticket status directly' }
      });
    }

    const { status, lastKnownUpdatedAt } = req.body;
    if (!status) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Status is required' }
      });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    // BR-08 / API-12: Optimistic Concurrency Control (stale update detection)
    if (lastKnownUpdatedAt) {
      const clientTime = new Date(lastKnownUpdatedAt).getTime();
      const serverTime = new Date(ticket.updatedAt).getTime();
      if (!isNaN(clientTime) && Math.abs(clientTime - serverTime) > 1000) {
        return res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'Conflict: Ticket has been modified by another user. Please refresh and try again.'
          }
        });
      }
    }

    if (!isValidStatusTransition(ticket.currentStatus, status)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition status from ${ticket.currentStatus} to ${status}`,
          details: {
            permittedNextStatuses: ALLOWED_TRANSITIONS[ticket.currentStatus] || []
          }
        }
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { currentStatus: status }
    });

    return res.status(200).json({ ticket: updatedTicket });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update ticket status' }
    });
  }
}
