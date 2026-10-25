const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const httpError = require('../utils/httpError');
const { authenticate } = require('../middlewares/auth');

router.post('/register', async (req, res) => {
  const { username, fullname, password } = req.body ?? {};
  if (!username || !fullname || !password) throw httpError(400, 'Cần username, fullname, password');
  if (password.length < 6) throw httpError(400, 'Mật khẩu tối thiểu 6 ký tự');

  const role = await prisma.role.findUnique({ where: { rolename: 'customer' } });
  const membership = await prisma.memberShip.findUnique({ where: { mname: 'Standard' } });
  if (!role || !membership) throw httpError(500, 'Chưa seed dữ liệu (chạy: npm run seed)');

  const user = await prisma.user.create({
    data: {
      username,
      fullname,
      password: await bcrypt.hash(password, 10),
      roleid: role.roleid,
      mid: membership.mid,
    },
    select: { uid: true, username: true, fullname: true },
  });
  res.status(201).json(user);
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) throw httpError(400, 'Cần username và password');

  const user = await prisma.user.findUnique({ where: { username }, include: { role: true } });
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw httpError(401, 'Sai tên đăng nhập hoặc mật khẩu');

  const token = jwt.sign(
    { uid: user.uid, role: user.role.rolename },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
  res.json({ token, tokenType: 'Bearer' });
});

router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { uid: req.user.uid },
    select: { uid: true, username: true, fullname: true, role: true, membership: true },
  });
  res.json(user);
});

module.exports = router;