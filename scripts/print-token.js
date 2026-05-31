const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'test+bot@example.com';
  const user = await prisma.user.findUnique({ where: { email } });
  console.log('user:', user ? { id: user.id, email: user.email, verificationToken: user.verificationToken } : null);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
