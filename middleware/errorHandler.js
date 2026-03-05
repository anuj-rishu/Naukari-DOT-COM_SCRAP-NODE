const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(
    `${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  );

  const statusCode = err.response?.status || err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    message: "Verify your session headers (cookie and nkparam).",
  });
};

module.exports = errorHandler;
