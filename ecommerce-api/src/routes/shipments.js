const router = require('express').Router();
const prisma = require('../config/prisma');
const httpError = require('../utils/httpError');
const parseId = require('../utils/parseId');
const { authenticate, authorize } = require('../middlewares/auth');

const STATUSES = ['PENDING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

router.patch('/:shipid', authenticate, authorize('admin'), async (req, res) => {
  const shipid = parseId(req.params.shipid);
  const status = req.body?.status;
  if (!STATUSES.includes(status)) throw httpError(400, `status phai thuoc: ${STATUSES.join(', ')}`);
  res.json(await prisma.shipment.update({ where: { shipid }, data: { status } }));
});

module.exports = router;