const Quote = require("./../models/Quote");
const User = require("./../models/User");
const asyncHandler = require("express-async-handler");
const { checkMongoId, AppError } = require("../utils");
const { default: mongoose } = require("mongoose");

const utilityController = {
  likeQuote: asyncHandler(async (req, res) => {
    const quoteId = req.params.id;
    const userId = req.user.id;
    checkMongoId(quoteId);
    checkMongoId(userId);

    const quote = await Quote.findById(quoteId);
    if (!quote) throw new AppError("Quote not found", 404);

    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const hasLiked = quote.likes.includes(userId);
    if (hasLiked) {
      quote.likes.pull(userId);
      user.likedQuotes.pull(quoteId);
    } else {
      quote.likes.push(userId);
      user.likedQuotes.push(quoteId);
    }

    await quote.save();
    await user.save();

    res.status(200).json({
      message: hasLiked
        ? "Quote unliked successfully"
        : "Quote liked successfully",
      result: quote,
    });
  }),
  saveQuote: asyncHandler(async (req, res) => {
    const quoteId = req.params.id;
    const userId = req.user.id;
    checkMongoId(quoteId);
    checkMongoId(userId);

    const quote = await Quote.findById(quoteId)
      .select("_id title description author _createdAt likes")
      .populate("author");

    if (!quote) throw new AppError("Quote not found", 404);

    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const hasSaved = user.savedQuotes.includes(quoteId);
    if (hasSaved) {
      user.savedQuotes.pull(quoteId);
    } else {
      user.savedQuotes.push(quoteId);
    }
    await user.save();

    res.status(200).json({
      message: hasSaved
        ? "Quote unsaved successfully"
        : "Quote saved successfully",
      result: quote,
    });
  }),
  getLikedQuotes: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    checkMongoId(userId);

    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    const userLiks = user.likedQuotes;
    res.status(200).json({
      message: "Liked quotes retrieved successfully",
      result: userLiks,
    });
  }),
  getSavedQuotes: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    checkMongoId(userId);

    const user = await User.findById(userId).populate({
      path: "savedQuotes",
      populate: { path: "author", select: "name" },
      select: "_id title description author _createdAt likes",
    });
    if (!user) throw new AppError("User not found", 404);

    res.status(200).json({
      message: "Saved quotes retrieved successfully",
      result: user.savedQuotes,
    });
  }),
};

module.exports = utilityController;
