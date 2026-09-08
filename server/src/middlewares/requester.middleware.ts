import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  requesterId?: number;
}

export async function validateRequesterHeader(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const headerValue = req.header('X-Requester-Id');

  if (!headerValue) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_REQUESTER_HEADER',
        message: 'Missing required header X-Requester-Id'
      }
    });
  }

  const requesterId = parseInt(headerValue, 10);
  if (isNaN(requesterId) || requesterId <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUESTER',
        message: 'Header X-Requester-Id must be a valid positive integer'
      }
    });
  }

  const requester = await prisma.requesterUser.findUnique({
    where: { id: requesterId }
  });

  if (!requester || !requester.isActive) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUESTER',
        message: 'Requester does not exist or is inactive'
      }
    });
  }

  req.requesterId = requesterId;
  next();
}
