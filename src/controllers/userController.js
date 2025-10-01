const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { createError } = require("../utils/errorHandler");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json(users);
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(createError.notFound("User not found"));
  res.status(200).json(user);
});

exports.updateUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return next(createError.notFound("User not found"));
  res.status(200).json(user);
});

exports.deleteUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(createError.notFound("User not found"));
  res.status(200).json({ message: "User deleted successfully" });
});
