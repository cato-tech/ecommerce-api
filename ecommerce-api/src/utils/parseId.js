const httpError = require('./httpError');

module.exports = (value) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw httpError(400, 'ID không hợp lệ');
  return n;
};