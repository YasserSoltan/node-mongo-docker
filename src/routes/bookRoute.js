const express = require("express");
const bookController = require("../controllers/bookController");
const authMiddleware = require("./../middlewares/authMiddleware");
const Book = require("../models/book");

const router = express.Router();

router
  .route("/")
  .get(bookController.getAllBooks)
  .post(authMiddleware.protect, bookController.createBook);

router.use(authMiddleware.protect);

router
  .route("/:id")
  .get(bookController.getBookById)
  .patch(authMiddleware.isAdminOrOwner(Book, "createdBy"), bookController.updateBookById)
  .delete(authMiddleware.isAdminOrOwner(Book, "createdBy"), bookController.deleteBookById);

router.post("/:id/buy", bookController.buyBook);
module.exports = router;
