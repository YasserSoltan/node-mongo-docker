const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: [true, "Book title already exists"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
  },
  { timestamps: true }
);

BookSchema.pre(/^find/, function(next) {
  this.populate('createdBy').populate({
    path: 'createdBy',
    select: 'name email -_id'
  });
  next();
});

module.exports = mongoose.model("Book", BookSchema);
