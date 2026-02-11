const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.response?.status || err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    message: "Verify your session headers (cookie and nkparam).",
  });
};

module.exports = errorHandler;
