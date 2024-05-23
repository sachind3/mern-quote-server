const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.message = message;
    this.statusCode = statusCode;
  }
}

const santanceCase = (str) => {
  var newString = str
    .toLowerCase()
    .replace(/(^\s*\w|[\.\!\?]\s*\w)/g, function (c) {
      return c.toUpperCase();
    });
  return newString;
};

const checkMongoId = (id) => {
  if (!mongoose.isValidObjectId(id))
    throw new AppError("This is not a valid ID or not found", 404);
};

const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = {
  AppError,
  santanceCase,
  checkMongoId,
  validateEmail,
  createActivationToken,
  createAccessToken,
  createRefreshToken,
};
