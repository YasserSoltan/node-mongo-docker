const mongoose = require("mongoose");
const Book = require("../models/book");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { createError } = require("../utils/errorHandler");
const jsend = require("../utils/jsend");

exports.getAllBooks = catchAsync(async (req, res) => {
  const books = await Book.find();
  jsend.success(res, { books }, 200);
});

exports.createBook = catchAsync(async (req, res, next) => {
  if (!req.body)
    return next(createError.badRequest("Please provide user data in Body"));
  const book = await Book.create({
    title: req.body.title,
    description: req.body.description,
    createdBy: req.user._id,
    amount: req.body.amount,
  });
  jsend.success(res, { book }, 201);
});

exports.getBookById = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) return next(createError.notFound("Book not found"));
  jsend.success(res, { book }, 200);
});

exports.updateBookById = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!book) return next(createError.notFound("Book not found"));
  jsend.success(res, { book }, 200);
});

exports.deleteBookById = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return next(createError.notFound("Book not found"));
  jsend.success(res, { message: "Book deleted successfully" }, 200);
});

exports.buyBook = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookId = req.params.id;
    const userId = req.user._id;
    const updatedBook = await Book.findOneAndUpdate(
      {
        _id: bookId,
        amount: { $gt: 0 },
      },
      {
        $inc: { amount: -1 },
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    );
    if (!updatedBook) {
      await session.abortTransaction();
      const book = await Book.findById(bookId);
      if (!book) {
        return next(createError.notFound("Book not found"));
      }
      return next(createError.badRequest("Book is out of stock"));
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { books_bought_amount: 1 },
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedUser) {
      await session.abortTransaction();
      return next(createError.notFound("User not found"));
    }
    await session.commitTransaction();
    jsend.success(res, {
      message: "Book purchased successfully",
      book: updatedBook,
      user: { books_bought_amount: updatedUser.books_bought_amount },
    }, 200);
  } catch (err) {
    await session.abortTransaction();
    console.error('Buy Book Transaction Error:', err);
    return next(createError.internal("Purchase failed, please try again"));
  } finally {
    session.endSession();
  }
});
