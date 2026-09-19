import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createSessionToken } from '../utils/session';
import { validatePasswordPolicy } from '../utils/passwordPolicy';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

export async function login(req: AuthRequest, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Email and password are required'
      }
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  if (!user) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Account is deactivated'
      }
    });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    });
  }

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  res.cookie('toktickit_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  return res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      isActive: user.isActive
    }
  });
}

export async function logout(_req: AuthRequest, res: Response) {
  res.clearCookie('toktickit_session', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  return res.status(200).json({
    message: 'Logged out successfully'
  });
}

export async function getMe(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated'
      }
    });
  }

  return res.status(200).json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      mustChangePassword: req.user.mustChangePassword,
      isActive: req.user.isActive
    }
  });
}

export async function changePassword(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: {
        code: 'INVALID_INPUT',
        message: 'Current password and new password are required'
      }
    });
  }

  const isCurrentPasswordValid = bcrypt.compareSync(currentPassword, req.user.passwordHash);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      error: {
        code: 'INVALID_INPUT',
        message: 'Current password is incorrect'
      }
    });
  }

  const isPolicyValid = validatePasswordPolicy(newPassword);
  if (!isPolicyValid) {
    return res.status(400).json({
      error: {
        code: 'INVALID_INPUT',
        message: 'New password does not meet password policy requirements'
      }
    });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false
    }
  });

  return res.status(200).json({
    message: 'Password changed successfully',
    user: {
      id: updatedUser.id,
      mustChangePassword: updatedUser.mustChangePassword
    }
  });
}
