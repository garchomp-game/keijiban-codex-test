import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.refreshToken.deleteMany();
  await prisma.message.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      displayName: 'Alice',
      passwordHash: await bcrypt.hash('password', 12),
    },
  });

  const room = await prisma.room.create({
    data: {
      name: 'General',
      visibility: 'public',
      description: 'General discussion',
      members: [{ userId: user.id, roleInRoom: 'owner', joinedAt: new Date().toISOString() }],
    },
  });

  await prisma.message.create({
    data: {
      roomId: room.id,
      userId: user.id,
      body: 'Hello world',
    },
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
