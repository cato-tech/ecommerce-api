const express = require('express');
const cors = require('cors');
const prisma = require('./config/prisma');
const errorHandler = require('./middlewares/error');

const app = express();
app.use(cors());
app.use(express.json());

// Health check: kiểm tra app sống và kết nối được database
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      db: 'up',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'down' });
  }
});

// ROUTES (các bước sau sẽ thêm dòng app.use vào đây)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/shipments', require('./routes/shipments'));
app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy đường dẫn' }));
app.use(errorHandler);

module.exports = app;