import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TokTickIT Database for Lab 2...');

  // 1. Seed Categories
  const categories = [
    { name: 'Account and Access' },
    { name: 'Hardware' },
    { name: 'Network' },
    { name: 'Software' }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { isActive: true },
      create: { name: cat.name, isActive: true }
    });
  }

  // 2. Seed Related Systems
  const relatedSystems = [
    { name: 'Corporate Laptop' },
    { name: 'Email & Communication' },
    { name: 'HR Portal' },
    { name: 'Internal Network / VPN' }
  ];

  for (const sys of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name: sys.name },
      update: { isActive: true },
      create: { name: sys.name, isActive: true }
    });
  }

  // 3. Seed Development Requesters
  const activeRequesters = [
    { id: 1, name: 'Jennifer Anderson', email: 'jennifer.anderson@example.com', isActive: true },
    { id: 2, name: 'Michael Brown', email: 'michael.brown@example.com', isActive: true },
    { id: 3, name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', isActive: true },
    { id: 4, name: 'David Lee', email: 'david.lee@example.com', isActive: true }
  ];

  for (const req of activeRequesters) {
    await prisma.requesterUser.upsert({
      where: { email: req.email },
      update: { name: req.name, isActive: true },
      create: { id: req.id, name: req.name, email: req.email, isActive: true }
    });
  }

  // Seed 1 inactive requester for validation testing
  await prisma.requesterUser.upsert({
    where: { email: 'alex.turner@example.com' },
    update: { isActive: false },
    create: { id: 99, name: 'Alex Turner', email: 'alex.turner@example.com', isActive: false }
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
