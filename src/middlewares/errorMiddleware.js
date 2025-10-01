const jsend = require("../utils/jsend");

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
    if (`${error.statusCode}`.startsWith("4")) {
      return jsend.fail(res, { message: error.message, error }, error.statusCode);
    }
    return jsend.error(
      res,
      error.message || "Internal Server Error",
      error.statusCode,
      error.code
    );
  } else {
    if (error.isOperational) {
      if (`${error.statusCode}`.startsWith("4")) {
        return jsend.fail(res, { message: error.message }, error.statusCode);
      }
      return jsend.error(res, error.message, error.statusCode, error.code);
    }
    return jsend.error(res, "Something went wrong!", 500);
  }
};
