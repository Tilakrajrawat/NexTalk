const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { successResponse } = require("../utils/response");

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
};

const register = async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email or username already exists"
    });
  }

  const user = await User.create({
    name: name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password
  });

  const token = generateToken(user);

  return successResponse(
    res,
    "User registered successfully",
    {
      token,
      user: user.toSafeObject()
    },
    201
  );
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const token = generateToken(user);

  return successResponse(res, "Login successful", {
    token,
    user: user.toSafeObject()
  });
};

const getMe = async (req, res) => {
  return successResponse(res, "Current user fetched", {
    user: req.user
  });
};

module.exports = {
  register,
  login,
  getMe
};