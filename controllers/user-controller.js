const bcrypt = require("bcryptjs");
const {
  AppError,
  validateEmail,
  createActivationToken,
  createRefreshToken,
  createAccessToken,
} = require("../utils");
const User = require("./../models/User");
const sendEmail = require("./sendEmail");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const CLIENT_URI =
  process.env.ENVIRONMENT === "DEVELOPMENT"
    ? process.env.CLIENT_URI_DEV
    : process.env.CLIENT_URI_PROD;

const userController = {
  register: asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      throw new AppError("Please enter all required fields.", 401);
    if (!validateEmail(email))
      throw new AppError("Please enter valid email address.", 401);
    const user = await User.findOne({ email });
    if (user) throw new AppError("This user already exists", 401);
    const passwordHash = await bcrypt.hashSync(password, 12);
    const newUser = { name, email, password: passwordHash };
    const activation_token = createActivationToken(newUser);
    const url = `${process.env.CLIENT_URI}/user/activate/${activation_token}`;
    sendEmail(email, url, "Please verify your email address");
    res.status(201).json({
      message: "Register success! Please activate your email to start.",
    });
  }),
  activateEmail: asyncHandler(async (req, res) => {
    const { activation_token } = req.body;
    const user = jwt.verify(
      activation_token,
      process.env.ACTIVATION_TOKEN_SECRET
    );
    const { name, email, password } = user;
    const check = await User.findOne({ email });
    if (check) throw new AppError("This email is already in use.", 400);
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: "Account has been activated" });
  }),
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      throw new AppError("Please enter all required fields.", 401);
    if (!validateEmail(email))
      throw new AppError("Please enter valid email address.", 401);
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new AppError("User not found, please register.", 404);
    const isMatch = await bcrypt.compareSync(password, user.password);
    if (!isMatch) throw new AppError("Invalid credentials.", 400);
    const refresh_token = createRefreshToken({ id: user._id });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      sameSite: "none",
      //secure: true,
      path: "/user/refresh_token",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: "Login successful!" });
  }),
  getAccessToken: asyncHandler((req, res) => {
    const rf_token = req.cookies.refresh_token;
    console.log(rf_token);
    console.log(process.env.REFRESH_TOKEN_SECRET);
    if (!rf_token) throw new AppError("Please login now!", 400);
    jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) throw new AppError("Please login now!", 400);
      const access_token = createAccessToken({ id: user.id });
      res
        .status(200)
        .json({ message: "Access token", result: { access_token } });
    });
  }),
  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new AppError("Please enter all required fields.", 401);
    if (!validateEmail(email))
      throw new AppError("Please enter valid email address", 401);
    const user = await User.findOne({ email });
    if (!user) throw new AppError("User not found, please register.", 404);
    const access_token = createAccessToken({ id: user._id });
    const url = `${CLIENT_URI}/user/reset/${access_token}`;
    sendEmail(email, url, "Reset your password");
    res
      .status(200)
      .json({ message: "Re-send the password, Please check your email" });
  }),
  resetPassword: asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) throw new AppError("Please fill in all fields.", 401);
    const passwordHash = await bcrypt.hashSync(password, 12);
    await User.findOneAndUpdate(
      { _id: req.user.id },
      {
        password: passwordHash,
      }
    );
    res.json({ message: "Password has been reset." });
  }),
  getUserInfo: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ message: "user info", result: user });
  }),
  getAllUserInfo: asyncHandler(async (req, res) => {
    const users = await User.find();
    res.status(200).json({ message: "user info", result: users });
  }),
  logout: asyncHandler(async (req, res) => {
    res.clearCookie("refresh_token", { path: "/user/refresh_token" });
    return res.status(200).json({ message: "logout success" });
  }),
};

module.exports = userController;
