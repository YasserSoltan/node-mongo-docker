const express = require("express");
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const userRoutes = require("./routes/userRoute");
const bookRoutes = require("./routes/bookRoute");
const errorMiddleware = require("./middlewares/errorMiddleware");
const { createError } = require("./utils/errorHandler");

const env = process.env.NODE_ENV || "development";
require("dotenv").config({ path: `.env.${env}` });

const app = express();

app.use(express.json());
// Set security HTTP headers
app.use(helmet());
// Implement CORS
app.use(cors());
// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.get("/", (req, res) => {
  res.send("Welcome to the User API");
});
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res, next) =>
  next(createError.notFound(`Route ${req.originalUrl} not found`))
);

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
