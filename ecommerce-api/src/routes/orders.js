const router = require('express').Router();
const prisma = require('../config/prisma');
const httpError = require('../utils/httpError');
const parseId = require('../utils/parseId');
const { authenticate } = require('../middlewares/auth');

const include = { details: true, shipments: true };

router.post('/', authenticate, async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0) throw httpError(400, 'items phai la mang khong rong');

  const seen = new Set();
  for (const it of items) {
    if (!Number.isInteger(it.pid) || !Number.isInteger(it.qty) || it.qty <= 0) {
      throw httpError(400, 'Moi item can pid va qty la so nguyen duong');
    }
    if (seen.has(it.pid)) throw httpError(400, `pid ${it.pid} bi lap trong don`);
    seen.add(it.pid);
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({ data: { uid: req.user.uid } });

    for (const { pid, qty } of items) {
      const product = await tx.product.findUnique({ where: { pid } });
      if (!product) throw httpError(404, `San pham ${pid} khong ton tai`);

      const r = await tx.product.updateMany({
        where: { pid, quantity: { gte: qty } },
        data: { quantity: { decrement: qty } },
      });
      if (r.count === 0) throw httpError(409, `San pham ${pid} khong du ton kho`);

      await tx.orderDetail.create({
        data: { oid: created.oid, pid, qty, unit_price: product.price },
      });
    }

    await tx.shipment.create({ data: { oid: created.oid, status: 'PENDING' } });
    return tx.order.findUnique({ where: { oid: created.oid }, include });
  });

  res.status(201).json(order);
});

router.get('/', authenticate, async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { uid: req.user.uid };
  res.json(await prisma.order.findMany({ where, include, orderBy: { oid: 'desc' } }));
});

router.get('/:oid', authenticate, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { oid: parseId(req.params.oid) }, include });
  if (!order) throw httpError(404, 'Khong tim thay don hang');
  if (req.user.role !== 'admin' && order.uid !== req.user.uid) {
    throw httpError(403, 'Ban khong co quyen xem don nay');
  }
  res.json(order);
});

module.exports = router;