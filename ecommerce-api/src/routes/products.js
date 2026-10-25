const router = require('express').Router();
const prisma = require('../config/prisma');
const httpError = require('../utils/httpError');
const parseId = require('../utils/parseId');
const { authenticate, authorize } = require('../middlewares/auth');

const readProduct = (body = {}) => {
  const { pname, price, quantity } = body;
  if (!pname || typeof pname !== 'string') throw httpError(400, 'pname la bat buoc');
  if (typeof price !== 'number' || price < 0) throw httpError(400, 'price phai la so >= 0');
  if (!Number.isInteger(quantity) || quantity < 0) throw httpError(400, 'quantity phai la so nguyen >= 0');
  return { pname, price, quantity };
};

router.get('/', async (req, res) => {
  res.json(await prisma.product.findMany({ orderBy: { pid: 'asc' } }));
});

router.get('/:pid', async (req, res) => {
  const product = await prisma.product.findUnique({ where: { pid: parseId(req.params.pid) } });
  if (!product) throw httpError(404, 'Khong tim thay san pham');
  res.json(product);
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  res.status(201).json(await prisma.product.create({ data: readProduct(req.body) }));
});

router.put('/:pid', authenticate, authorize('admin'), async (req, res) => {
  const pid = parseId(req.params.pid);
  res.json(await prisma.product.update({ where: { pid }, data: readProduct(req.body) }));
});

router.delete('/:pid', authenticate, authorize('admin'), async (req, res) => {
  await prisma.product.delete({ where: { pid: parseId(req.params.pid) } });
  res.status(204).end();
});

module.exports = router;