const mongoose = require("mongoose");
const Room = require("../models/Room");
const Message = require("../models/Message");
const User = require("../models/User");
const { successResponse } = require("../utils/response");

const ROOM_POPULATE = [
  {
    path: "members",
    select: "name username email avatar bio isOnline lastSeen"
  },
  {
    path: "createdBy",
    select: "name username email avatar"
  }
];

const getRooms = async (req, res) => {
  const currentUserId = req.user._id;

  const rooms = await Room.find({
    members: currentUserId
  })
    .populate(ROOM_POPULATE)
    .sort({ updatedAt: -1, _id: -1 });

  const roomIds = rooms.map((room) => room._id);

  const latestMessages = await Message.aggregate([
    {
      $match: {
        room: { $in: roomIds }
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
        _id: "$room",
        lastMessageId: { $first: "$_id" }
      }
    }
  ]);

  const latestMessageIds = latestMessages.map((item) => item.lastMessageId);

  const lastMessages = latestMessageIds.length
    ? await Message.find({
        _id: { $in: latestMessageIds }
      })
        .populate([
          {
            path: "sender",
            select: "name username email avatar isOnline lastSeen"
          },
          {
            path: "receiver",
            select: "name username email avatar isOnline lastSeen"
          },
          {
            path: "room",
            select: "name description members createdBy"
          }
        ])
        .sort({ createdAt: -1, _id: -1 })
    : [];

  const lastMessageMap = new Map(
    lastMessages.map((message) => [String(message.room?._id || message.room), message])
  );

  const data = rooms.map((room) => ({
    ...room.toObject(),
    lastMessage: lastMessageMap.get(String(room._id)) || null
  }));

  return successResponse(res, "Rooms fetched", data);
};

const createRoom = async (req, res) => {
  const currentUserId = req.user._id;
  const { name, description = "", memberIds = [] } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Room name is required"
    });
  }

  const validMemberIds = Array.from(
    new Set(
      [String(currentUserId), ...memberIds]
        .filter(Boolean)
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
    )
  );

  const room = await Room.create({
    name: name.trim(),
    description: description.trim(),
    members: validMemberIds,
    createdBy: currentUserId
  });

  const populatedRoom = await Room.findById(room._id).populate(ROOM_POPULATE);

  return successResponse(res, "Room created", {
    ...populatedRoom.toObject(),
    lastMessage: null
  });
};

const joinRoom = async (req, res) => {
  const currentUserId = req.user._id;
  const { roomId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid room id"
    });
  }

  const room = await Room.findById(roomId);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  if (!room.members.some((memberId) => String(memberId) === String(currentUserId))) {
    room.members.push(currentUserId);
    await room.save();
  }

  const populatedRoom = await Room.findById(room._id).populate(ROOM_POPULATE);

  return successResponse(res, "Joined room", {
    ...populatedRoom.toObject(),
    lastMessage: null
  });
};

const leaveRoom = async (req, res) => {
  const currentUserId = req.user._id;
  const { roomId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid room id"
    });
  }

  const room = await Room.findById(roomId);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  room.members = room.members.filter(
    (memberId) => String(memberId) !== String(currentUserId)
  );

  await room.save();

  return successResponse(res, "Left room", {
    roomId
  });
};

const updateRoom = async (req, res) => {
  const currentUserId = req.user._id;
  const { roomId } = req.params;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid room id"
    });
  }

  const room = await Room.findById(roomId);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  if (String(room.createdBy) !== String(currentUserId)) {
    return res.status(403).json({
      success: false,
      message: "Only the room creator can update room details"
    });
  }

  if (typeof name === "string" && name.trim()) {
    room.name = name.trim();
  }

  if (typeof description === "string") {
    room.description = description.trim();
  }

  await room.save();

  const populatedRoom = await Room.findById(room._id).populate(ROOM_POPULATE);

  return successResponse(res, "Room updated", populatedRoom);
};

const addMembersToRoom = async (req, res) => {
  const currentUserId = req.user._id;
  const { roomId } = req.params;
  const { memberIds = [] } = req.body;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid room id"
    });
  }

  const room = await Room.findById(roomId);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  if (String(room.createdBy) !== String(currentUserId)) {
    return res.status(403).json({
      success: false,
      message: "Only the room creator can add members"
    });
  }

  const validIds = Array.from(
    new Set(
      memberIds
        .filter(Boolean)
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map(String)
    )
  );

  if (!validIds.length) {
    return res.status(400).json({
      success: false,
      message: "No valid members provided"
    });
  }

  const existingUsers = await User.find({
    _id: { $in: validIds }
  }).select("_id");

  const existingIds = existingUsers.map((user) => String(user._id));

  room.members = Array.from(
    new Set([...room.members.map((id) => String(id)), ...existingIds])
  );

  await room.save();

  const populatedRoom = await Room.findById(room._id).populate(ROOM_POPULATE);

  return successResponse(res, "Members added to room", populatedRoom);
};

const removeMemberFromRoom = async (req, res) => {
  const currentUserId = req.user._id;
  const { roomId, memberId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roomId) || !mongoose.Types.ObjectId.isValid(memberId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid room id or member id"
    });
  }

  const room = await Room.findById(roomId);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  if (String(room.createdBy) !== String(currentUserId)) {
    return res.status(403).json({
      success: false,
      message: "Only the room creator can remove members"
    });
  }

  if (String(memberId) === String(room.createdBy)) {
    return res.status(400).json({
      success: false,
      message: "Room creator cannot be removed"
    });
  }

  room.members = room.members.filter((id) => String(id) !== String(memberId));
  await room.save();

  const populatedRoom = await Room.findById(room._id).populate(ROOM_POPULATE);

  return successResponse(res, "Member removed from room", populatedRoom);
};

const deleteRoom = async (req, res) => {
  const currentUserId = req.user._id;
  const { roomId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid room id"
    });
  }

  const room = await Room.findById(roomId);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  if (String(room.createdBy) !== String(currentUserId)) {
    return res.status(403).json({
      success: false,
      message: "Only the room creator can delete the room"
    });
  }

  await Message.deleteMany({
    room: roomId
  });

  await Room.findByIdAndDelete(roomId);

  return successResponse(res, "Room deleted", {
    roomId
  });
};

module.exports = {
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  updateRoom,
  addMembersToRoom,
  removeMemberFromRoom,
  deleteRoom
};