const Quote = require("./../models/Quote");
const User = require("./../models/User");
const asyncHandler = require("express-async-handler");
const { checkMongoId, AppError } = require("../utils");
const { default: mongoose } = require("mongoose");

const quoteController = {
  createQuote: asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description)
      throw new AppError("Please enter all the required fields", 401);
    checkMongoId(req.user.id);
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError("User not found", 404);
    const quote = new Quote({ title, description, author: req.user.id });
    const session = await mongoose.startSession();
    session.startTransaction();
    await quote.save({ session });
    if (!user.quotes) {
      user.quotes = [];
    }
    user.quotes.push(quote._id);
    await user.save({ session });
    await session.commitTransaction();
    if (!quote) throw new AppError("Enable to create quote", 401);
    const populatedQuote = await Quote.findById(quote._id)
      .populate({
        path: "author",
        select: ["name"],
      })
      .select("+_createdAt");
    res
      .status(200)
      .json({ message: "Quote created successfully", result: populatedQuote });
  }),
  getAllQuotes: asyncHandler(async (req, res) => {
    const page = req.query.page || 1; // Default to page 1 if not provided
    const limit = 100; // Number of quotes per page
    const skip = (page - 1) * limit;
    const quotes = await Quote.find()
      .populate({ path: "author", select: ["name"] })
      .select("+_createdAt")
      .sort({ _createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (!quotes || quotes.length === 0)
      throw new AppError("No quotes found", 404);
    res
      .status(200)
      .json({ message: "Quotes retrieved successfully", result: quotes });
  }),
  getMyQuotes: asyncHandler(async (req, res) => {
    const { id } = req.user;
    const allQuotes = await Quote.find({ author: id })
      .populate({ path: "author", select: ["name"] })
      .select("+_createdAt")
      .sort({ _createdAt: -1 });
    if (!allQuotes) throw new AppError("Enable to get all quotes", 400);
    res.status(200).json({
      message: "Quotes retrieved successfully",
      result: allQuotes,
    });
  }),
  getSingleQuote: asyncHandler(async (req, res) => {
    const quoteId = req.params.id;
    checkMongoId(quoteId);
    const quote = await Quote.findById(quoteId)
      .populate({ path: "author", select: ["name"] })
      .select("+_createdAt");
    if (!quote) throw new AppError("Quote not found", 404);
    res
      .status(200)
      .json({ message: "Quote fetched successfully", result: quote });
  }),
  deleteQuote: asyncHandler(async (req, res) => {
    const { id } = req.user;
    const quoteId = req.params.id;
    checkMongoId(quoteId);
    const quote = await Quote.findById(quoteId);
    if (!quote) throw new AppError("Quote not found", 404);
    const userId = quote.author;
    checkMongoId(userId);
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (userId.toString() !== id) {
      throw new AppError("not authorized to perform this action", 404);
    }
    const deletedQuote = await Quote.findByIdAndDelete(quoteId).populate(
      "author"
    );
    await user.quotes.pull(deletedQuote);
    await user.save();
    res
      .status(200)
      .json({ message: "Quote deleted successfully", result: deletedQuote });
  }),
  updateQuote: asyncHandler(async (req, res) => {
    const { id } = req.user;
    const quoteId = req.params.id;
    checkMongoId(quoteId);
    const quote = await Quote.findById(quoteId);
    if (!quote) throw new AppError("Quote not found", 404);
    const userId = quote.author;
    checkMongoId(userId);
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (userId.toString() !== id) {
      throw new AppError("not authorized to perform this action", 404);
    }
    const updatedQuote = await Quote.findByIdAndUpdate(quoteId, req.body, {
      new: true,
    });
    if (!updatedQuote)
      throw new AppError(
        "Can't update the quote, please try after some time",
        404
      );
    const populatedQuote = await Quote.findById(updatedQuote._id)
      .populate({
        path: "author",
        select: ["name"],
      })
      .select("+_createdAt");
    res.status(200).json({
      message: "Quote updated successfully",
      result: populatedQuote,
    });
  }),
  getAuthorQuotes: asyncHandler(async (req, res) => {
    const authorId = req.params.id;
    checkMongoId(authorId);
    const author = await User.findById(authorId).select(["name", "_id"]);
    if (!author) throw new AppError("Author not found", 404);
    const quotes = await Quote.find({ author: authorId })
      .populate({ path: "author", select: ["name"] })
      .select("+_createdAt");
    res.status(200).json({
      message: "Quote fetched successfully",
      result: { author, quotes },
    });
  }),
  searchQuotes: asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query || query.length < 3)
      throw new AppError(
        "Query string must be at least 3 characters long",
        404
      );
    const quotes = await Quote.find({
      $or: [
        { title: { $regex: query, $options: "i" } }, // Case-insensitive search
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .populate({ path: "author", select: ["name"] })
      .select("+_createdAt");
    res
      .status(200)
      .json({ message: "Quote fetched successfully", result: quotes });
  }),
};

module.exports = quoteController;
