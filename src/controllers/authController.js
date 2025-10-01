const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { createError } = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");

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

  // res.cookie('jwt', token, {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  //   ),
  //   httpOnly: true,
  //   secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  // });

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  if (!req.body)
    return next(createError.badRequest("Please provide user data in Body"));
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    age: req.body.age,
    role: req.body.role,
  });
  sendTokenResponse(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  if (!req.body)
    return next(createError.badRequest("Please provide user data in Body"));
  const { email, password } = req.body;
  if (!password || !email) return next(createError.badRequest("Please provide email and password"));
  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(404).json({ message: "User not found" });
  const isMatch = await user.correctPassword(password, user.password);
  if (!isMatch) return next(createError.unauthorized("Incorrect password"));
  sendTokenResponse(user, 200, req, res);
});
