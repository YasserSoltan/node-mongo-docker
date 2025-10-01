const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { createError } = require("../utils/errorHandler");
const jsend = require("../utils/jsend");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  jsend.success(res, { users }, 200);
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(createError.notFound("User not found"));
  jsend.success(res, { user }, 200);
});

exports.updateUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return next(createError.notFound("User not found"));
  jsend.success(res, { user }, 200);
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  if (!role) return next(createError.badRequest("Please provide a role"));
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) return next(createError.notFound("User not found"));
  jsend.success(res, { user }, 200);
});

exports.deleteUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(createError.notFound("User not found"));
  jsend.success(res, { message: "User deleted successfully" }, 200);
});
