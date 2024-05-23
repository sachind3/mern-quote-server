const mongoose = require("mongoose");
const { santanceCase } = require("../utils");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name!"],
      set: santanceCase,
    },
    email: {
      type: String,
      required: [true, "Please enter your email!"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password!"],
      select: false,
    },
    role: {
      type: Number,
      default: 0, // 0 = user, 1 = admin
    },
    quotes: [{ type: mongoose.Types.ObjectId, ref: "Quote", required: true }],
    _createdAt: { type: Date, select: false },
    _updatedAt: { type: Date, select: false },
  },
  {
    timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" },
  }
);

module.exports = mongoose.model("User", userSchema);
