import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Generates an automatic ticket number in format TKT-YYYY-XXXXXX (BR-01)
 * Year is the current 4-digit calendar year (e.g. 2026).
 * Sequence is a 6-digit zero-padded number incremented from the highest existing ticket number for that year.
 */
export async function generateTicketNumber(
  db: PrismaClient | Prisma.TransactionClient
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `TKT-${currentYear}-`;

  const latestTicket = await db.ticket.findFirst({
    where: {
      ticketNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      ticketNumber: 'desc',
    },
    select: {
      ticketNumber: true,
    },
  });

  let nextSequence = 1;
  if (latestTicket) {
    const parts = latestTicket.ticketNumber.split('-');
    if (parts.length === 3) {
      const seqNum = parseInt(parts[2], 10);
      if (!isNaN(seqNum)) {
        nextSequence = seqNum + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(6, '0');
  return `${prefix}${paddedSequence}`;
}
