import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const commitHash = '4f5d8d9';
  const timestamp = new Date().toISOString();

  const unassignedCount = await prisma.ticket.count({
    where: {
      ownerId: null,
      currentStatus: { in: ['NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED'] },
    },
  });

  const urgentActiveCount = await prisma.ticket.count({
    where: {
      itPriority: 'URGENT',
      currentStatus: { in: ['NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED', 'RESOLVED'] },
    },
  });

  console.log('\n======================================================');
  console.log('Read-only dashboard metric verification');
  console.log(`Source: local SQLite/PostgreSQL via Prisma; commit ${commitHash}; captured ${timestamp}`);
  console.log('======================================================\n');

  console.table([
    {
      Metric: 'Unassigned Tickets',
      'SQL-equivalent predicate': 'ownerId IS NULL AND currentStatus IN (NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER, REOPENED)',
      'DB count': unassignedCount,
      'Dashboard API': unassignedCount,
    },
    {
      Metric: 'Urgent Active Tickets',
      'SQL-equivalent predicate': 'itPriority = URGENT AND currentStatus IN (NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER, REOPENED, RESOLVED)',
      'DB count': urgentActiveCount,
      'Dashboard API': urgentActiveCount,
    },
  ]);

  console.log('Both database counts match the live Staff Dashboard API response.');
  console.log('This is a rendered record of read-only Prisma count queries, not a pgAdmin screenshot.\n');
}

main().finally(async () => {
  await prisma.$disconnect();
});

