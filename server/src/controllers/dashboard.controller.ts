import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

/**
 * GET /api/dashboard/requester
 * Returns operational summary metrics and recent tickets for the authenticated Requester.
 */
export async function getRequesterDashboard(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const [
      totalOpenTickets,
      inProgressTickets,
      waitingForRequesterTickets,
      resolvedTickets,
      closedTickets,
      recentRawTickets
    ] = await Promise.all([
      // Open tickets (NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER, REOPENED)
      prisma.ticket.count({
        where: {
          requesterId: userId,
          currentStatus: { in: ['NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED'] }
        }
      }),
      // In Progress
      prisma.ticket.count({
        where: {
          requesterId: userId,
          currentStatus: 'IN_PROGRESS'
        }
      }),
      // Waiting for Requester
      prisma.ticket.count({
        where: {
          requesterId: userId,
          currentStatus: 'WAITING_FOR_REQUESTER'
        }
      }),
      // Resolved
      prisma.ticket.count({
        where: {
          requesterId: userId,
          currentStatus: 'RESOLVED'
        }
      }),
      // Closed
      prisma.ticket.count({
        where: {
          requesterId: userId,
          currentStatus: 'CLOSED'
        }
      }),
      // Recent tickets (latest 5)
      prisma.ticket.findMany({
        where: { requesterId: userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } }
        }
      })
    ]);

    const recentTickets = recentRawTickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      summary: t.summary,
      status: t.currentStatus,
      currentStatus: t.currentStatus,
      requestedPriority: t.requestedPriority,
      category: t.category,
      relatedSystem: t.relatedSystem,
      updatedAt: t.updatedAt
    }));

    return res.status(200).json({
      metrics: {
        totalOpenTickets,
        inProgressTickets,
        waitingForRequesterTickets,
        resolvedTickets,
        closedTickets
      },
      recentTickets
    });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch requester dashboard data' }
    });
  }
}

/**
 * GET /api/dashboard/staff
 * Returns queue operational metrics and recent tickets for IT Staff and Administrators.
 */
export async function getStaffDashboard(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // Authorization: IT_STAFF and ADMINISTRATOR only
    if (req.user?.role !== 'IT_STAFF' && req.user?.role !== 'ADMINISTRATOR') {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Access denied: IT Staff or Administrator role required' }
      });
    }

    const [
      newCount,
      openCount,
      inProgressCount,
      waitingForRequesterCount,
      resolvedCount,
      closedCount,
      myAssignedCount,
      unassignedCount,
      userAccountsCount,
      recentRawTickets
    ] = await Promise.all([
      prisma.ticket.count({ where: { currentStatus: 'NEW' } }),
      prisma.ticket.count({ where: { currentStatus: 'OPEN' } }),
      prisma.ticket.count({ where: { currentStatus: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { currentStatus: 'WAITING_FOR_REQUESTER' } }),
      prisma.ticket.count({ where: { currentStatus: 'RESOLVED' } }),
      prisma.ticket.count({ where: { currentStatus: 'CLOSED' } }),
      prisma.ticket.count({
        where: {
          ownerId: userId,
          currentStatus: { notIn: ['CLOSED', 'CANCELLED'] }
        }
      }),
      prisma.ticket.count({
        where: {
          ownerId: null,
          currentStatus: { notIn: ['CLOSED', 'CANCELLED'] }
        }
      }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.ticket.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          requester: { select: { id: true, name: true, email: true } },
          owner: { select: { id: true, name: true, email: true, role: true } },
          category: { select: { id: true, name: true } }
        }
      })
    ]);

    const recentTickets = recentRawTickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      summary: t.summary,
      status: t.currentStatus,
      currentStatus: t.currentStatus,
      itPriority: t.itPriority,
      requestedPriority: t.requestedPriority,
      updatedAt: t.updatedAt,
      requester: t.requester,
      assignedTo: t.owner ? { id: t.owner.id, name: t.owner.name } : null
    }));

    return res.status(200).json({
      metrics: {
        newCount,
        openCount,
        inProgressCount,
        waitingForRequesterCount,
        resolvedCount,
        closedCount,
        myAssignedCount,
        unassignedCount,
        userAccountsCount
      },
      recentTickets
    });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch staff dashboard data' }
    });
  }
}
