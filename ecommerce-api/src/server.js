require('dotenv').config();
const app = require('./app');
const prisma = require('./config/prisma');

if (!process.env.JWT_SECRET) {
  console.error('Thiếu JWT_SECRET trong .env');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`API chạy tại http://localhost:${PORT}`));

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);