import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');
  
  const defaultPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      name: 'Admin User',
      email: 'admin@fundsroom.com',
      password: defaultPassword,
      role: Role.ADMIN,
    },
    {
      name: 'Sales Rep',
      email: 'sales@fundsroom.com',
      password: defaultPassword,
      role: Role.SALES,
    },
    {
      name: 'Warehouse Manager',
      email: 'warehouse@fundsroom.com',
      password: defaultPassword,
      role: Role.WAREHOUSE,
    },
    {
      name: 'Accounts Team',
      email: 'accounts@fundsroom.com',
      password: defaultPassword,
      role: Role.ACCOUNTS,
    }
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`Created user with email: ${user.email} and role: ${user.role}`);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
