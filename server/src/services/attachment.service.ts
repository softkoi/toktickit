import { PrismaClient, Prisma } from '@prisma/client';

const defaultPrisma = new PrismaClient();

export const MAX_ACTIVE_ATTACHMENTS = 5;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB = 5,242,880 bytes
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

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
