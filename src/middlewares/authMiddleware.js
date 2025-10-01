const { createError } = require("../utils/errorHandler");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      createError.unauthorized(
        "You are not logged in! Please log in to get access."
      )
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      createError.unauthorized(
        "The user belonging to this token does no longer exist."
      )
    );
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createError.forbidden(
          "You do not have permission to perform this action"
        )
      );
    }
    next();
  };
};

exports.isAdminOrOwner = (Model, ownerField = "user") => {
  return catchAsync(async (req, res, next) => {
    // Admin can do anything
    if (req.user.role === "admin") {
      return next();
    }

    // For user resources: check if params.id matches logged-in user ID
    if (Model.modelName === "User") {
      if (req.params.id === req.user._id.toString()) {
        return next();
      }
    } 
    // For other resources: check ownership in database
    else {
      const resource = await Model.findById(req.params.id);
      
      if (!resource) {
        return next(createError.notFound(`${Model.modelName} not found`));
      }

      // Get owner ID from the specified field
      const ownerFieldValue = resource[ownerField];
      let ownerId;

      if (ownerFieldValue && ownerFieldValue._id) {
        // If it's a populated object
        ownerId = ownerFieldValue._id.toString();
      } else if (ownerFieldValue) {
        // If it's just an ID
        ownerId = ownerFieldValue.toString();
      }

      if (ownerId && ownerId === req.user._id.toString()) {
        return next();
      }
    }

    return next(
      createError.forbidden("You do not have permission to perform this action")
    );
  });
};


exports.iswOwner = (req, res, next) => {
  if (req.params.id !== req.user._id.toString()) {
    next(
      createError.forbidden("You do not have permission to perform this action")
    );
  }
  next();
};
