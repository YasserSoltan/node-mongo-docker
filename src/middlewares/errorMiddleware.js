module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  // Log error
  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Development vs Production error response
  if (process.env.NODE_ENV === "development") {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error: error,
      stack: error.stack,
    });
  } else {
    // Production response
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      // Programming or unknown errors
      res.status(500).json({
        status: error.status,
        message: "Something went wrong!",
      });
    }
  }
};
