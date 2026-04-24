const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Socket authentication failed: token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("Socket authentication failed: user not found"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Socket authentication failed"));
  }
};

module.exports = authSocket;