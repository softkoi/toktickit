import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/requester.middleware';
import { generateTicketNumber } from '../utils/ticket-number.generator';

const prisma = new PrismaClient();

export async function createTicket(req: AuthenticatedRequest, res: Response) {
  const requesterId = req.requesterId;
  const { categoryId, relatedSystemId, requestedPriority, summary, description } = req.body || {};

  const fields: { field: string; message: string }[] = [];

  // Validate categoryId
  const parsedCategoryId = parseInt(categoryId, 10);
  if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
    fields.push({ field: 'categoryId', message: 'categoryId must be a positive integer.' });
  } else {
    const cat = await prisma.category.findUnique({ where: { id: parsedCategoryId } });
    if (!cat || !cat.isActive) {
      fields.push({ field: 'categoryId', message: 'Selected category does not exist or is inactive.' });
    }
  }

  // Validate relatedSystemId
  const parsedSystemId = parseInt(relatedSystemId, 10);
  if (isNaN(parsedSystemId) || parsedSystemId <= 0) {
    fields.push({ field: 'relatedSystemId', message: 'relatedSystemId must be a positive integer.' });
  } else {
    const sys = await prisma.relatedSystem.findUnique({ where: { id: parsedSystemId } });
    if (!sys || !sys.isActive) {
      fields.push({ field: 'relatedSystemId', message: 'Selected related system does not exist or is inactive.' });
    }
  }

  // Validate requestedPriority
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
  if (!requestedPriority || typeof requestedPriority !== 'string' || !validPriorities.includes(requestedPriority)) {
    fields.push({ field: 'requestedPriority', message: 'requestedPriority must be LOW, MEDIUM, or HIGH.' });
  }

  // Validate summary
  const trimmedSummary = typeof summary === 'string' ? summary.trim() : '';
  if (trimmedSummary.length < 5 || trimmedSummary.length > 200) {
    fields.push({ field: 'summary', message: 'Summary must be between 5 and 200 characters.' });
  }

  // Validate description
  const trimmedDescription = typeof description === 'string' ? description.trim() : '';
  if (trimmedDescription.length < 5 || trimmedDescription.length > 2000) {
    fields.push({ field: 'description', message: 'Description must be between 5 and 2000 characters.' });
  }

  if (fields.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        fields,
      },
    });
  }

  try {
    const ticketNumber = await generateTicketNumber(prisma);

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        requesterId: requesterId!,
        categoryId: parsedCategoryId,
        relatedSystemId: parsedSystemId,
        summary: trimmedSummary,
        description: trimmedDescription,
        requestedPriority,
        currentStatus: 'NEW',
      },
      include: {
        category: true,
        relatedSystem: true,
        requester: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create ticket',
      },
    });
  }
}
