const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter quote title"],
    },
    description: {
      type: String,
      required: [true, "Please enter quote description"],
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    _createdAt: { type: Date, select: false },
    _updatedAt: { type: Date, select: false },
  },
  {
    timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" },
  }
);

module.exports = mongoose.model("Quote", quoteSchema);
