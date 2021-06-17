exports.errorHandler = (err, req, res, next) => {
  let status = null;
  let msg = null;
  if (err && err.status) status = err.status;
  if (err && err.message) msg = err.message;
  return res.status(status || 500).json({
    success: false,
    error: msg || "Internal server error",
  });
};
