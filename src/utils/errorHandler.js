const AppError = require("./appError");

// Factory functions for different error types
const createError = {
  // 400 Bad Request
  badRequest: (message = "Bad Request") => {
    return new AppError(message, 400);
  },

  // 401 Unauthorized
  unauthorized: (message = "Unauthorized") => {
    return new AppError(message, 401);
  },

  // 403 Forbidden
  forbidden: (message = "Forbidden") => {
    return new AppError(message, 403);
  },

  // 404 Not Found
  notFound: (message = "Resource not found") => {
    return new AppError(message, 404);
  },

  // 409 Conflict
  conflict: (message = "Conflict") => {
    return new AppError(message, 409);
  },

  // 422 Unprocessable Entity
  unprocessable: (message = "Unprocessable Entity") => {
    return new AppError(message, 422);
  },

  // 429 Too Many Requests
  tooManyRequests: (message = "Too many requests") => {
    return new AppError(message, 429);
  },

  // 500 Internal Server Error
  internal: (message = "Internal Server Error") => {
    return new AppError(message, 500);
  },
};

module.exports = { createError, AppError };
