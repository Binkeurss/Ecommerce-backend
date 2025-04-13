const asyncHandler = (fn, errorHandler) => {
  return (req, res, next) => {
    // Gọi hàm controller (fn), bắt lỗi Promise và chuyển đến middleware lỗi
    Promise.resolve(fn(req, res, next)).catch(err => {
      if (errorHandler) {
        errorHandler(err, req, res, next);
      } else {
        next(err);
      }
    });
  };
};

module.exports = asyncHandler;
