const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Gọi hàm controller (fn), bắt lỗi Promise và chuyển đến middleware lỗi
    fn(req, res, next).catch(next);
  };
};

module.exports = asyncHandler;