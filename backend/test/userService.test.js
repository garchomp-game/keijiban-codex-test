const test = require('node:test');
const assert = require('node:assert');
const { createUser, findUserByEmail, prisma } = require('../src/userService');

test('create and retrieve user via Prisma', async (t) => {
  t.after(async () => {
    await prisma.$disconnect();
  });

  // Clear existing users
  await prisma.user.deleteMany();

  const user = await createUser('Alice', 'alice@example.com');
  assert.strictEqual(user.email, 'alice@example.com');

  const fetched = await findUserByEmail('alice@example.com');
  assert.ok(fetched);
  assert.strictEqual(fetched.id, user.id);
});
