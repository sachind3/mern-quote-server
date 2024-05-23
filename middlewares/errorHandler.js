const { AppError } = require("../utils");

const errorHandler = (error, req, res, next) => {
  if (error.name === "ValidationError") {
    let firstError = Object.keys(error.errors)[0];
    return res.status(400).json({
      type: "ValidationError",
      error: Object.keys(error.errors)[0],
      message: error.errors[firstError].message,
    });
  }
  if (error.name === "TokenExpiredError") {
    return res.status(400).json({
      type: "TokenExpiredError",
      error: "TokenExpiredError",
      message: "Access token expired!",
    });
  }
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }
  console.log(error);
  return res.status(500).json({
    message: "Something went wrong",
  });
};

module.exports = errorHandler;
