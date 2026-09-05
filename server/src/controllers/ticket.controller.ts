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

export async function getTickets(req: AuthenticatedRequest, res: Response) {
  const requesterId = req.requesterId;
  if (!requesterId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_REQUESTER_HEADER',
        message: 'X-Requester-Id header is required',
      },
    });
  }

  const {
    search = '',
    category,
    requestedPriority,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = '1',
    pageSize = '50',
  } = req.query;

  // Validate page
  const pageRaw = String(page).trim();
  const pageNum = parseInt(pageRaw, 10);
  if (isNaN(pageNum) || pageNum <= 0 || pageRaw !== String(pageNum)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PAGE',
        message: 'page must be a positive integer',
      },
    });
  }

  // Validate pageSize
  const pageSizeRaw = String(pageSize).trim();
  const pageSizeNum = parseInt(pageSizeRaw, 10);
  const allowedPageSizes = [10, 20, 50];
  if (isNaN(pageSizeNum) || !allowedPageSizes.includes(pageSizeNum) || pageSizeRaw !== String(pageSizeNum)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PAGE_SIZE',
        message: 'pageSize must be 10, 20, or 50',
      },
    });
  }

  // Validate sortBy and sortOrder
  const validSortBy = ['ticketNumber', 'createdAt', 'updatedAt'];
  const validSortOrder = ['asc', 'desc'];
  if (
    typeof sortBy !== 'string' ||
    !validSortBy.includes(sortBy) ||
    typeof sortOrder !== 'string' ||
    !validSortOrder.includes(sortOrder)
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_SORT',
        message: 'sortBy or sortOrder is invalid',
      },
    });
  }

  try {
    const whereClause: any = {
      requesterId,
    };

    if (category) {
      const catRaw = String(category).trim();
      const catId = parseInt(catRaw, 10);
      if (isNaN(catId) || catId <= 0 || catRaw !== String(catId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CATEGORY',
            message: 'category must be a positive integer',
          },
        });
      }
      whereClause.categoryId = catId;
    }

    if (requestedPriority && typeof requestedPriority === 'string') {
      whereClause.requestedPriority = requestedPriority;
    }

    if (status && typeof status === 'string') {
      whereClause.currentStatus = status;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchKeyword = search.trim();
      whereClause.OR = [
        { summary: { contains: searchKeyword } },
        { ticketNumber: { contains: searchKeyword } },
      ];
    }

    const [totalItems, rawItems] = await Promise.all([
      prisma.ticket.count({
        where: whereClause,
      }),
      prisma.ticket.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        select: {
          id: true,
          ticketNumber: true,
          summary: true,
          requestedPriority: true,
          currentStatus: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSizeNum);
    const items = pageNum <= totalPages ? rawItems : [];


    return res.status(200).json({
      success: true,
      data: {
        items,
        meta: {
          page: pageNum,
          pageSize: pageSizeNum,
          totalItems,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}

