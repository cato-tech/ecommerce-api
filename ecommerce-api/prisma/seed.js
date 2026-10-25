require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.role.upsert({
    where: { rolename: 'admin' }, update: {}, create: { rolename: 'admin' },
  });
  await prisma.role.upsert({
    where: { rolename: 'customer' }, update: {}, create: { rolename: 'customer' },
  });

  const standard = await prisma.memberShip.upsert({
    where: { mname: 'Standard' }, update: {}, create: { mname: 'Standard', score: 0 },
  });
  await prisma.memberShip.upsert({
    where: { mname: 'Silver' }, update: {}, create: { mname: 'Silver', score: 100 },
  });
  await prisma.memberShip.upsert({
    where: { mname: 'Gold' }, update: {}, create: { mname: 'Gold', score: 500 },
  });

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      fullname: 'Administrator',
      password: await bcrypt.hash(password, 10),
      roleid: admin.roleid,
      mid: standard.mid,
    },
  });

  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({
      data: [
        { pname: 'Laptop 14 inch', price: 1500, quantity: 10 },
        { pname: 'Chuột không dây', price: 20.5, quantity: 100 },
        { pname: 'Bàn phím cơ', price: 45, quantity: 50 },
      ],
    });
  }
  console.log('Seed xong.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());