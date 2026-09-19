import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { validatePasswordPolicy } from '../utils/passwordPolicy';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();
const VALID_ROLES = ['REQUESTER', 'IT_STAFF', 'ADMINISTRATOR'];

export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const search = req.query.search ? String(req.query.search).trim() : '';
    const roleParam = req.query.role ? String(req.query.role).trim().toUpperCase() : undefined;
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const pageSize = Math.max(1, parseInt(String(req.query.pageSize || '10'), 10) || 10);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (roleParam && VALID_ROLES.includes(roleParam)) {
      where.role = roleParam;
    }

    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return res.status(200).json({
      data: users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1
      }
    });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve users'
      }
    });
  }
}

export async function createUser(req: AuthRequest, res: Response) {
  try {
    const { name, email, role, isActive, initialPassword, mustChangePassword } = req.body;

    if (!name || !email || !role || !initialPassword) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Name, email, role, and initial password are required'
        }
      });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'User with this email already exists'
        }
      });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid role specified'
        }
      });
    }

    if (!validatePasswordPolicy(initialPassword)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Initial password does not meet complexity rules'
        }
      });
    }

    const passwordHash = bcrypt.hashSync(initialPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: sanitizedEmail,
        role: role,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        mustChangePassword: mustChangePassword !== undefined ? Boolean(mustChangePassword) : true,
        passwordHash
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user account'
      }
    });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid user ID'
        }
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const { name, email, role, isActive } = req.body;
    const currentAdminId = req.user?.id;

    // BR-13 / AC-10: Administrator cannot deactivate their own account
    if (currentAdminId === userId && isActive === false) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Administrators cannot deactivate their own account'
        }
      });
    }

    // BR-14 / AC-11: Protect last active administrator from deactivation or role change
    const isTargetAdmin = targetUser.role === 'ADMINISTRATOR' && targetUser.isActive;
    const willBeInactiveOrNonAdmin = (isActive === false) || (role && role !== 'ADMINISTRATOR');

    if (isTargetAdmin && willBeInactiveOrNonAdmin) {
      const activeAdminCount = await prisma.user.count({
        where: { role: 'ADMINISTRATOR', isActive: true }
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          error: {
            code: 'BAD_REQUEST',
            message: 'Cannot deactivate or change role of the last active Administrator'
          }
        });
      }
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) {
      const sanitizedEmail = email.trim().toLowerCase();
      if (sanitizedEmail !== targetUser.email) {
        const emailCheck = await prisma.user.findUnique({
          where: { email: sanitizedEmail }
        });
        if (emailCheck) {
          return res.status(409).json({
            error: {
              code: 'CONFLICT',
              message: 'User with this email already exists'
            }
          });
        }
        updateData.email = sanitizedEmail;
      }
    }

    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid role specified'
          }
        });
      }
      updateData.role = role;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user account'
      }
    });
  }
}

export async function resetUserPassword(req: AuthRequest, res: Response) {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid user ID'
        }
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const { newInitialPassword } = req.body;
    if (!newInitialPassword) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'New initial password is required'
        }
      });
    }

    if (!validatePasswordPolicy(newInitialPassword)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'New initial password does not meet password policy requirements'
        }
      });
    }

    const passwordHash = bcrypt.hashSync(newInitialPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: true
      },
      select: {
        id: true,
        mustChangePassword: true
      }
    });

    return res.status(200).json({
      message: 'Password reset successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('resetUserPassword error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reset user password'
      }
    });
  }
}
