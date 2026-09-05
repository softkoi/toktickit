import { PrismaClient, Prisma } from '@prisma/client';

const defaultPrisma = new PrismaClient();

import {
  MAX_ACTIVE_ATTACHMENTS,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} from '../constants/attachment.constants';

export {
  MAX_ACTIVE_ATTACHMENTS,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};


/**
 * Counts active attachments (isRemoved = false) for a given ticket ID.
 */
export async function getActiveAttachmentCount(
  ticketId: number,
  db: PrismaClient | Prisma.TransactionClient = defaultPrisma
): Promise<number> {
  return await db.attachment.count({
    where: {
      ticketId,
      isRemoved: false,
    },
  });
}

/**
 * Checks if a ticket can accept more attachments (active count < MAX_ACTIVE_ATTACHMENTS).
 */
export async function canAddAttachment(
  ticketId: number,
  db: PrismaClient | Prisma.TransactionClient = defaultPrisma
): Promise<boolean> {
  const count = await getActiveAttachmentCount(ticketId, db);
  return count < MAX_ACTIVE_ATTACHMENTS;
}
