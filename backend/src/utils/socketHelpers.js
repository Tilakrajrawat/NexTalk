const mongoose = require("mongoose");
const Message = require("../models/Message");
const Room = require("../models/Room");
const ApiError = require("./ApiError");

const getUserRoom = (userId) => `user:${userId}`;
const getRoomChannel = (roomId) => `room:${roomId}`;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const sanitizeMessagePayload = (payload = {}) => {
  return {
    content: typeof payload.content === "string" ? payload.content.trim() : "",
    fileUrl: typeof payload.fileUrl === "string" ? payload.fileUrl.trim() : "",
    fileType: typeof payload.fileType === "string" ? payload.fileType.trim() : ""
  };
};

const createDMMessage = async ({ senderId, receiverId, content, fileUrl, fileType }) => {
  if (!isValidObjectId(receiverId)) {
    throw new ApiError(400, "Invalid receiver id");
  }

  const clean = sanitizeMessagePayload({ content, fileUrl, fileType });

  if (!clean.content && !clean.fileUrl) {
    throw new ApiError(400, "Message content or file is required");
  }

  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content: clean.content,
    fileUrl: clean.fileUrl,
    fileType: clean.fileType
  });

  return Message.findById(message._id)
    .populate("sender", "name username avatar isOnline lastSeen")
    .populate("receiver", "name username avatar isOnline lastSeen");
};

const createRoomMessage = async ({ senderId, roomId, content, fileUrl, fileType }) => {
  if (!isValidObjectId(roomId)) {
    throw new ApiError(400, "Invalid room id");
  }

  const room = await Room.findById(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const isMember = room.members.some((memberId) => memberId.toString() === senderId.toString());

  if (!isMember) {
    throw new ApiError(403, "You are not a member of this room");
  }

  const clean = sanitizeMessagePayload({ content, fileUrl, fileType });

  if (!clean.content && !clean.fileUrl) {
    throw new ApiError(400, "Message content or file is required");
  }

  const message = await Message.create({
    sender: senderId,
    room: roomId,
    content: clean.content,
    fileUrl: clean.fileUrl,
    fileType: clean.fileType
  });

  return Message.findById(message._id)
    .populate("sender", "name username avatar isOnline lastSeen")
    .populate("room", "name members");
};

module.exports = {
  getUserRoom,
  getRoomChannel,
  isValidObjectId,
  sanitizeMessagePayload,
  createDMMessage,
  createRoomMessage
};