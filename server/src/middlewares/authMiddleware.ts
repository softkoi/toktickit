import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import { parseCookies, verifySessionToken } from '../utils/session';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: User;
}

export async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  const cookies = parseCookies(req.headers.cookie);
  let token = cookies['toktickit_session'];

  // Optional fallback for Bearer token if passed in Authorization header
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'No active session found'
      }
    });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid session token'
      }
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });

  if (!user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'User account not found'
      }
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'User account is deactivated'
      }
    });
  }

  req.user = user;
  next();
}

export function requireRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Access denied due to insufficient permissions'
        }
      });
    }

    next();
  };
}
