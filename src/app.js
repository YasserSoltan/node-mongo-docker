const express = require("express");
const userRoutes = require("./routes/userRoute");
const bookRoutes = require("./routes/bookRoute");
const errorMiddleware = require("./middlewares/errorMiddleware");
const { createError } = require("./utils/errorHandler");

// Load environment by NODE_ENV (defaults to development)
const env = process.env.NODE_ENV || "development";
require("dotenv").config({ path: `.env.${env}` });

const app = express();

app.use(express.json());

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
