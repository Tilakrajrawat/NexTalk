const User = require("../models/User");
const { getUserRoom } = require("../utils/socketHelpers");

const activeUserSockets = new Map();

const getUserSocketCount = (userId) => {
  return activeUserSockets.get(userId)?.size || 0;
};

const addUserSocket = (userId, socketId) => {
  const existing = activeUserSockets.get(userId) || new Set();
  existing.add(socketId);
  activeUserSockets.set(userId, existing);
};

const removeUserSocket = (userId, socketId) => {
  const existing = activeUserSockets.get(userId);

  if (!existing) return 0;

  existing.delete(socketId);

  if (existing.size === 0) {
    activeUserSockets.delete(userId);
    return 0;
  }

  activeUserSockets.set(userId, existing);
  return existing.size;
};

const markUserOnline = async (io, userId) => {
  await User.findByIdAndUpdate(userId, {
    isOnline: true
  });

  io.emit("presence:update", {
    userId,
    isOnline: true,
    lastSeen: null
  });
};

const markUserOffline = async (io, userId) => {
  const lastSeen = new Date();

  await User.findByIdAndUpdate(userId, {
    isOnline: false,
    lastSeen
  });

  io.emit("presence:update", {
    userId,
    isOnline: false,
    lastSeen
  });
};

const handleUserConnected = async (io, socket) => {
  const userId = socket.user._id.toString();

  addUserSocket(userId, socket.id);

  socket.join(getUserRoom(userId));

  if (getUserSocketCount(userId) === 1) {
    await markUserOnline(io, userId);
  }

  socket.emit("presence:sync", {
    userId,
    isOnline: true
  });
};

const handleUserDisconnected = async (io, socket) => {
  if (!socket.user?._id) return;

  const userId = socket.user._id.toString();
  const remaining = removeUserSocket(userId, socket.id);

  if (remaining === 0) {
    await markUserOffline(io, userId);
  }
};

module.exports = {
  activeUserSockets,
  getUserSocketCount,
  handleUserConnected,
  handleUserDisconnected
};