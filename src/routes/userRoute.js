const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const authMiddleware = require("./../middlewares/authMiddleware");
const User = require("../models/user");

const router = express.Router();

router.post("/auth/signup", authController.signup);
router.post("/auth/login", authController.login);

router.use(authMiddleware.protect);

router
  .route("/")
  .get(authMiddleware.restrictTo("admin"), userController.getAllUsers);

router.patch(
  "/:id/role",
  authMiddleware.restrictTo("admin"),
  userController.updateUserRole
);

router
  .route("/:id")
  .get(authMiddleware.isAdminOrOwner(User), userController.getUserById)
  .patch(authMiddleware.iswOwner, userController.updateUserById)
  .delete(authMiddleware.isAdminOrOwner(User), userController.deleteUserById);

module.exports = router;
