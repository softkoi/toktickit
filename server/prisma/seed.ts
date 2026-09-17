import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TokTickIT Database for Sprint 3 (Lab 03)...');

  const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

  // 1. Seed Categories
  const categoriesData = [
    { name: 'Account and Access' },
    { name: 'Hardware' },
    { name: 'Network' },
    { name: 'Software' }
  ];

  const categoriesMap: Record<string, number> = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: { isActive: true },
      create: { name: cat.name, isActive: true }
    });
    categoriesMap[cat.name] = record.id;
  }

  // 2. Seed Related Systems
  const relatedSystemsData = [
    { name: 'Corporate Laptop' },
    { name: 'Email & Communication' },
    { name: 'HR Portal' },
    { name: 'Internal Network / VPN' }
  ];

  const relatedSystemsMap: Record<string, number> = {};
  for (const sys of relatedSystemsData) {
    const record = await prisma.relatedSystem.upsert({
      where: { name: sys.name },
      update: { isActive: true },
      create: { name: sys.name, isActive: true }
    });
    relatedSystemsMap[sys.name] = record.id;
  }

  // 3. Seed Users
  const usersData = [
    // Requesters (4 Active + 1 Inactive)
    {
      email: 'requester1@toktickit.com',
      name: 'Requester One',
      role: 'REQUESTER',
      isActive: true,
      mustChangePassword: true
    },
    {
      email: 'requester2@toktickit.com',
      name: 'Requester Two',
      role: 'REQUESTER',
      isActive: true,
      mustChangePassword: true
    },
    {
      email: 'requester3@toktickit.com',
      name: 'Requester Three',
      role: 'REQUESTER',
      isActive: true,
      mustChangePassword: true
    },
    {
      email: 'requester4@toktickit.com',
      name: 'Requester Four',
      role: 'REQUESTER',
      isActive: true,
      mustChangePassword: true
    },
    {
      email: 'requester.inactive@toktickit.com',
      name: 'Inactive Requester',
      role: 'REQUESTER',
      isActive: false,
      mustChangePassword: true
    },

    // Legacy Lab 2 Requesters (for backward compatibility)
    {
      email: 'jennifer.anderson@example.com',
      name: 'Jennifer Anderson',
      role: 'REQUESTER',
      isActive: true,
      mustChangePassword: false
    },
    {
      email: 'michael.brown@example.com',
      name: 'Michael Brown',
      role: 'REQUESTER',
      isActive: true,
      mustChangePassword: false
    },
    {
      email: 'sarah.jenkins@example.com',
      name: 'Sarah Jenkins',
      role: 'REQUESTER',
      isActive: true,
      mustChangePassword: false
    },
    {
      email: 'david.lee@example.com',
      name: 'David Lee',
      role: 'REQUESTER',
      isActive: true,
      mustChangePassword: false
    },
    {
      email: 'alex.turner@example.com',
      name: 'Alex Turner',
      role: 'REQUESTER',
      isActive: false,
      mustChangePassword: false
    },

    // IT Staff (3 Active + 1 Inactive)
    {
      email: 'staff1@toktickit.com',
      name: 'IT Staff One',
      role: 'IT_STAFF',
      isActive: true,
      mustChangePassword: true
    },
    {
      email: 'staff2@toktickit.com',
      name: 'IT Staff Two',
      role: 'IT_STAFF',
      isActive: true,
      mustChangePassword: true
    },
    {
      email: 'staff3@toktickit.com',
      name: 'IT Staff Three',
      role: 'IT_STAFF',
      isActive: true,
      mustChangePassword: true
    },
    {
      email: 'staff.inactive@toktickit.com',
      name: 'Inactive IT Staff',
      role: 'IT_STAFF',
      isActive: false,
      mustChangePassword: true
    },

    // Administrator (1 Active)
    {
      email: 'admin@toktickit.com',
      name: 'System Administrator',
      role: 'ADMINISTRATOR',
      isActive: true,
      mustChangePassword: true
    }
  ];

  const usersMap: Record<string, number> = {};
  for (const u of usersData) {
    const userRecord = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        mustChangePassword: u.mustChangePassword
      },
      create: {
        email: u.email,
        name: u.name,
        passwordHash: defaultPasswordHash,
        role: u.role,
        isActive: u.isActive,
        mustChangePassword: u.mustChangePassword
      }
    });
    usersMap[u.email] = userRecord.id;
  }

  // 4. Seed Tickets
  const ticketsData = [
    {
      ticketNumber: 'TK-2026-0001',
      requesterEmail: 'requester1@toktickit.com',
      ownerEmail: null,
      categoryName: 'Account and Access',
      systemName: 'HR Portal',
      summary: 'Cannot reset HR portal password',
      description: 'Password reset link is not arriving in inbox after requesting multiple times.',
      requestedPriority: 'LOW',
      itPriority: 'MEDIUM',
      currentStatus: 'NEW'
    },
    {
      ticketNumber: 'TK-2026-0002',
      requesterEmail: 'requester1@toktickit.com',
      ownerEmail: 'staff1@toktickit.com',
      categoryName: 'Software',
      systemName: 'Corporate Laptop',
      summary: 'VPN client crashing on startup after OS update',
      description: 'Receiving error code 0x80070005 when opening corporate VPN app after Windows update.',
      requestedPriority: 'HIGH',
      itPriority: 'HIGH',
      currentStatus: 'OPEN'
    },
    {
      ticketNumber: 'TK-2026-0003',
      requesterEmail: 'requester2@toktickit.com',
      ownerEmail: 'staff2@toktickit.com',
      categoryName: 'Hardware',
      systemName: 'Corporate Laptop',
      summary: 'External monitor flickering via USB-C dock',
      description: 'Second display flickers randomly throughout the workday. Dock firmware reinstalled.',
      requestedPriority: 'MEDIUM',
      itPriority: 'HIGH',
      currentStatus: 'IN_PROGRESS'
    },
    {
      ticketNumber: 'TK-2026-0004',
      requesterEmail: 'requester2@toktickit.com',
      ownerEmail: 'staff1@toktickit.com',
      categoryName: 'Network',
      systemName: 'Internal Network / VPN',
      summary: 'Intermittent Wi-Fi disconnects on 3rd floor',
      description: 'Wi-Fi drops connection every 20 minutes when working near conference room 3B.',
      requestedPriority: 'HIGH',
      itPriority: 'HIGH',
      currentStatus: 'WAITING_FOR_REQUESTER'
    },
    {
      ticketNumber: 'TK-2026-0005',
      requesterEmail: 'requester3@toktickit.com',
      ownerEmail: 'staff3@toktickit.com',
      categoryName: 'Software',
      systemName: 'Email & Communication',
      summary: 'Outlook shared mailbox access request',
      description: 'Requesting delegate access to support-team@toktickit.com shared mailbox.',
      requestedPriority: 'LOW',
      itPriority: 'LOW',
      currentStatus: 'RESOLVED'
    },
    {
      ticketNumber: 'TK-2026-0006',
      requesterEmail: 'requester3@toktickit.com',
      ownerEmail: 'admin@toktickit.com',
      categoryName: 'Account and Access',
      systemName: 'HR Portal',
      summary: 'New hire onboarding account creation',
      description: 'Setup Active Directory and email accounts for new hire starting next Monday.',
      requestedPriority: 'MEDIUM',
      itPriority: 'MEDIUM',
      currentStatus: 'CLOSED'
    },
    {
      ticketNumber: 'TK-2026-0007',
      requesterEmail: 'requester4@toktickit.com',
      ownerEmail: 'staff2@toktickit.com',
      categoryName: 'Software',
      systemName: 'Corporate Laptop',
      summary: 'Antivirus blocking internal analytics tool',
      description: 'Antivirus flagged python build binary as false positive after latest definitions update.',
      requestedPriority: 'HIGH',
      itPriority: 'HIGH',
      currentStatus: 'REOPENED'
    },
    {
      ticketNumber: 'TK-2026-0008',
      requesterEmail: 'requester4@toktickit.com',
      ownerEmail: null,
      categoryName: 'Hardware',
      systemName: 'Corporate Laptop',
      summary: 'Duplicate request for laptop stand',
      description: 'Created by mistake, please cancel this request.',
      requestedPriority: 'LOW',
      itPriority: 'LOW',
      currentStatus: 'CANCELLED'
    },
    {
      ticketNumber: 'TK-2026-0009',
      requesterEmail: 'requester1@toktickit.com',
      ownerEmail: null,
      categoryName: 'Network',
      systemName: 'Internal Network / VPN',
      summary: 'VPN gateway slow connection from home',
      description: 'Latency spikes observed when routing traffic through US-East gateway.',
      requestedPriority: 'HIGH',
      itPriority: 'HIGH',
      currentStatus: 'NEW'
    },
    {
      ticketNumber: 'TK-2026-0010',
      requesterEmail: 'requester2@toktickit.com',
      ownerEmail: 'staff3@toktickit.com',
      categoryName: 'Account and Access',
      systemName: 'HR Portal',
      summary: 'MFA token desynchronization',
      description: 'Authenticator app OTP codes are rejected during login.',
      requestedPriority: 'MEDIUM',
      itPriority: 'MEDIUM',
      currentStatus: 'OPEN'
    },
    {
      ticketNumber: 'TK-2026-0011',
      requesterEmail: 'requester3@toktickit.com',
      ownerEmail: 'staff1@toktickit.com',
      categoryName: 'Software',
      systemName: 'Email & Communication',
      summary: 'Email signature formatting broken on mobile',
      description: 'HTML signature renders misplaced images on iOS Mail client.',
      requestedPriority: 'LOW',
      itPriority: 'MEDIUM',
      currentStatus: 'IN_PROGRESS'
    },
    {
      ticketNumber: 'TK-2026-0012',
      requesterEmail: 'requester4@toktickit.com',
      ownerEmail: 'admin@toktickit.com',
      categoryName: 'Hardware',
      systemName: 'Corporate Laptop',
      summary: 'Keyboard replacement for spilled water',
      description: 'Liquid damage on laptop keyboard, keys G and H unresponsive.',
      requestedPriority: 'HIGH',
      itPriority: 'HIGH',
      currentStatus: 'RESOLVED'
    }
  ];

  const ticketsMap: Record<string, number> = {};
  for (const t of ticketsData) {
    const reqId = usersMap[t.requesterEmail];
    const ownerId = t.ownerEmail ? usersMap[t.ownerEmail] : null;
    const catId = categoriesMap[t.categoryName];
    const sysId = relatedSystemsMap[t.systemName];

    const ticketRecord = await prisma.ticket.upsert({
      where: { ticketNumber: t.ticketNumber },
      update: {
        requesterId: reqId,
        ownerId: ownerId,
        categoryId: catId,
        relatedSystemId: sysId,
        summary: t.summary,
        description: t.description,
        requestedPriority: t.requestedPriority,
        itPriority: t.itPriority,
        currentStatus: t.currentStatus
      },
      create: {
        ticketNumber: t.ticketNumber,
        requesterId: reqId,
        ownerId: ownerId,
        categoryId: catId,
        relatedSystemId: sysId,
        summary: t.summary,
        description: t.description,
        requestedPriority: t.requestedPriority,
        itPriority: t.itPriority,
        currentStatus: t.currentStatus
      }
    });
    ticketsMap[t.ticketNumber] = ticketRecord.id;
  }

  // 5. Seed Public Comments
  const publicCommentsData = [
    {
      ticketNumber: 'TK-2026-0002',
      authorEmail: 'staff1@toktickit.com',
      content: 'Could you please confirm if you ran the latest VPN hotfix installer?'
    },
    {
      ticketNumber: 'TK-2026-0002',
      authorEmail: 'requester1@toktickit.com',
      content: 'Yes, I ran the hotfix installer but the error 0x80070005 persists.'
    },
    {
      ticketNumber: 'TK-2026-0004',
      authorEmail: 'staff1@toktickit.com',
      content: 'We have updated access point 3B. Please check if Wi-Fi remains stable.'
    },
    {
      ticketNumber: 'TK-2026-0005',
      authorEmail: 'staff3@toktickit.com',
      content: 'Delegate access has been granted. Please restart Outlook to access the mailbox.'
    }
  ];

  for (const pc of publicCommentsData) {
    const ticketId = ticketsMap[pc.ticketNumber];
    const authorId = usersMap[pc.authorEmail];

    // Check existing comment to avoid duplicating on seed re-run
    const existing = await prisma.publicComment.findFirst({
      where: { ticketId, authorId, content: pc.content }
    });

    if (!existing) {
      await prisma.publicComment.create({
        data: {
          ticketId,
          authorId,
          content: pc.content
        }
      });
    }
  }

  // 6. Seed Internal Notes
  const internalNotesData = [
    {
      ticketNumber: 'TK-2026-0002',
      authorEmail: 'staff1@toktickit.com',
      content: 'Internal note: User permission issue in Registry key HKLM\\Software\\VendorVPN.'
    },
    {
      ticketNumber: 'TK-2026-0003',
      authorEmail: 'staff2@toktickit.com',
      content: 'Internal note: Ordered replacement Type-C Thunderbolt dock from inventory.'
    },
    {
      ticketNumber: 'TK-2026-0004',
      authorEmail: 'admin@toktickit.com',
      content: 'Internal note: Network infrastructure team notified regarding 3rd floor AP firmware.'
    }
  ];

  for (const inote of internalNotesData) {
    const ticketId = ticketsMap[inote.ticketNumber];
    const authorId = usersMap[inote.authorEmail];

    const existing = await prisma.internalNote.findFirst({
      where: { ticketId, authorId, content: inote.content }
    });

    if (!existing) {
      await prisma.internalNote.create({
        data: {
          ticketId,
          authorId,
          content: inote.content
        }
      });
    }
  }

  console.log('✅ TokTickIT Database Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
