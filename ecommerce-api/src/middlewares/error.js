module.exports = (err, req, res, next) => {
  if (err.code === 'P2002') return res.status(409).json({ message: 'Dữ liệu đã tồn tại (trùng giá trị duy nhất)' });
  if (err.code === 'P2025') return res.status(404).json({ message: 'Không tìm thấy bản ghi' });
  if (err.code === 'P2003') return res.status(409).json({ message: 'Dữ liệu đang được tham chiếu, không thể thực hiện' });
  if (err.status) return res.status(err.status).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ' });
};