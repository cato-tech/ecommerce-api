const jwt = require('jsonwebtoken');
const httpError = require('../utils/httpError');

// Kiểm tra đã đăng nhập chưa
exports.authenticate = (req, res, next) => {
  const [type, token] = (req.headers.authorization || '').split(' ');
  if (type !== 'Bearer' || !token) throw httpError(401, 'Thiếu token đăng nhập');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { uid, role, iat, exp }
  } catch {
    throw httpError(401, 'Token không hợp lệ hoặc đã hết hạn');
  }
  next();
};

// Kiểm tra quyền (vd: authorize('admin'))
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw httpError(403, 'Bạn không đủ quyền');
  next();
};