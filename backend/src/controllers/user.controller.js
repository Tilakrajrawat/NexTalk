const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Message = require("../models/Message");
const Room = require("../models/Room");
const { successResponse } = require("../utils/response");

const getUsers = async (req, res) => {
  const currentUserId = req.user._id;
  const query = (req.query.q || "").trim();
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

  const filter = {
    _id: { $ne: currentUserId }
  };

  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } }
    ];
  }

  const users = await User.find(filter)
    .select("name username email avatar bio isOnline lastSeen")
    .sort({ isOnline: -1, name: 1 })
    .limit(limit);

  return successResponse(res, "Users fetched", users);
};

const getMyProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "name username email avatar bio isOnline lastSeen createdAt updatedAt"
  );

  return successResponse(res, "Profile fetched", user);
};

const updateMyProfile = async (req, res) => {
  const currentUserId = req.user._id;
  const { name, username, bio } = req.body;

  const user = await User.findById(currentUserId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  if (typeof name === "string") {
    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters"
      });
    }

    user.name = trimmedName;
  }

  if (typeof username === "string") {
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername || normalizedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters"
      });
    }

    if (!/^[a-z0-9._]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username can only contain lowercase letters, numbers, dot, underscore"
      });
    }

    const existing = await User.findOne({
      _id: { $ne: currentUserId },
      username: normalizedUsername
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken"
      });
    }

    user.username = normalizedUsername;
  }

  if (typeof bio === "string") {
    user.bio = bio.trim().slice(0, 160);
  }

  await user.save();

  return successResponse(res, "Profile updated", user.toSafeObject());
};

const updateMyAvatar = async (req, res) => {
  const currentUserId = req.user._id;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No avatar uploaded"
    });
  }

  const user = await User.findById(currentUserId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  if (user.avatar) {
    try {
      const currentUrl = new URL(user.avatar);
      const existingFilename = path.basename(currentUrl.pathname);
      const existingPath = path.join(process.cwd(), "uploads", existingFilename);

      if (fs.existsSync(existingPath)) {
        fs.unlinkSync(existingPath);
      }
    } catch (error) {
      // ignore invalid old avatar path
    }
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  user.avatar = `${baseUrl}/uploads/${req.file.filename}`;

  await user.save();

  return successResponse(res, "Avatar updated", user.toSafeObject());
};

const deleteMyAccount = async (req, res) => {
  const currentUserId = req.user._id;

  const user = await User.findById(currentUserId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  // Remove from rooms
  await Room.updateMany(
    { members: currentUserId },
    { $pull: { members: currentUserId } }
  );

  // Delete rooms created by user (optional design choice)
  const ownedRooms = await Room.find({ createdBy: currentUserId }).select("_id");
  const ownedRoomIds = ownedRooms.map((room) => room._id);

  if (ownedRoomIds.length) {
    await Message.deleteMany({
      room: { $in: ownedRoomIds }
    });

    await Room.deleteMany({
      _id: { $in: ownedRoomIds }
    });
  }

  // Delete direct and remaining user messages
  await Message.deleteMany({
    $or: [{ sender: currentUserId }, { receiver: currentUserId }]
  });

  // Delete avatar file if present
  if (user.avatar) {
    try {
      const avatarUrl = new URL(user.avatar);
      const avatarFilename = path.basename(avatarUrl.pathname);
      const avatarPath = path.join(process.cwd(), "uploads", avatarFilename);

      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    } catch (error) {
      // ignore invalid path
    }
  }

  await User.findByIdAndDelete(currentUserId);

  return successResponse(res, "Account deleted", null);
};

module.exports = {
  getUsers,
  getMyProfile,
  updateMyProfile,
  updateMyAvatar,
  deleteMyAccount
};