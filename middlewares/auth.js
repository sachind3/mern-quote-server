const jwt = require("jsonwebtoken");
const { AppError } = require("../utils");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token)
      return res.status(401).json({ message: "Missing Authorization header" });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        throw new AppError("Invalid or expired token", 401);
      }
      req.user = user;
      next();
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error("Authentication error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

module.exports = auth;
