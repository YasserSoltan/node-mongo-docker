const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { createError } = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const jsend = require("../utils/jsend");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, req, res) => {
  const token = generateToken(user._id);
  // Remove password from output
  user.password = undefined;
  jsend.success(res, { token, user }, statusCode);
};

exports.signup = catchAsync(async (req, res, next) => {
  if (!req.body)
    return next(createError.badRequest("Please provide user data in Body"));
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    age: req.body.age,
  });
  sendTokenResponse(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  if (!req.body)
    return next(createError.badRequest("Please provide user data in Body"));
  const { email, password } = req.body;
  if (!password || !email) return next(createError.badRequest("Please provide email and password"));
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(createError.notFound("User not found"));
  const isMatch = await user.correctPassword(password, user.password);
  if (!isMatch) return next(createError.unauthorized("Incorrect password"));
  sendTokenResponse(user, 200, req, res);
});
