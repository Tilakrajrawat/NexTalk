const mongoose = require("mongoose");
const Message = require("../models/Message");
const Room = require("../models/Room");
const User = require("../models/User");
const { successResponse } = require("../utils/response");

const MESSAGE_POPULATE = [
  {
    path: "sender",
    select: "name username email avatar bio isOnline lastSeen"
  },
  {
    path: "receiver",
    select: "name username email avatar bio isOnline lastSeen"
  },
  {
    path: "room",
    select: "name description members createdBy"
  }
];

const getDMHistory = async (req, res) => {
  const currentUserId = req.user._id;
  const otherUserId = req.params.userId;
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);

  if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id"
    });
  }

  const otherUser = await User.findById(otherUserId).select(
    "name username email avatar bio isOnline lastSeen"
  );

  if (!otherUser) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  const messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: otherUserId },
      { sender: otherUserId, receiver: currentUserId }
    ]
  })
    .populate(MESSAGE_POPULATE)
    .sort({ createdAt: 1, _id: 1 })
    .limit(limit);

  return successResponse(res, "DM history fetched", messages);
};

const getRoomHistory = async (req, res) => {
  const roomId = req.params.roomId;
  const currentUserId = req.user._id;
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid room id"
    });
  }

  const room = await Room.findOne({
    _id: roomId,
    members: currentUserId
  });

  if (!room) {
    return res.status(403).json({
      success: false,
      message: "You are not a member of this room"
    });
  }

  const messages = await Message.find({
    room: roomId
  })
    .populate(MESSAGE_POPULATE)
    .sort({ createdAt: 1, _id: 1 })
    .limit(limit);

  return successResponse(res, "Room history fetched", messages);
};

const getDMThreads = async (req, res) => {
  const currentUserId = req.user._id;

  const threads = await Message.aggregate([
    {
      $match: {
        room: null,
        $or: [{ sender: currentUserId }, { receiver: currentUserId }]
      }
    },
    {
      $addFields: {
        otherUser: {
          $cond: [{ $eq: ["$sender", currentUserId] }, "$receiver", "$sender"]
        }
      }
    },
    {
      $sort: {
        createdAt: -1,
        _id: -1
      }
    },
    {
      $group: {
        _id: "$otherUser",
        lastMessageId: { $first: "$_id" }
      }
    }
  ]);

  const messageIds = threads.map((t) => t.lastMessageId);

  if (!messageIds.length) {
    return successResponse(res, "DM threads fetched", []);
  }

  const messages = await Message.find({
    _id: { $in: messageIds }
  })
    .populate(MESSAGE_POPULATE)
    .sort({ createdAt: -1, _id: -1 });

  const results = messages.map((message) => {
    const otherUser =
      String(message.sender?._id) === String(currentUserId)
        ? message.receiver
        : message.sender;

    return {
      user: otherUser,
      lastMessage: message
    };
  });

  return successResponse(res, "DM threads fetched", results);
};

module.exports = {
  getDMHistory,
  getRoomHistory,
  getDMThreads
};