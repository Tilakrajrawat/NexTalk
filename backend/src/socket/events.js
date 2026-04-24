const mongoose = require("mongoose");
const Message = require("../models/Message");
const Room = require("../models/Room");

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

const safeAck = (ack, payload) => {
  if (typeof ack === "function") {
    ack(payload);
  }
};

const emitRoomUpdatedToMembers = (io, room) => {
  const roomObj = room.toObject ? room.toObject() : room;

  roomObj.members?.forEach((member) => {
    const memberId = member?._id || member;
    io.to(`user:${memberId}`).emit("room:updated", roomObj);
  });
};

const registerSocketEvents = (io, socket) => {
  const currentUser = socket.user;

  socket.on("room:join", async ({ roomId } = {}, ack) => {
    try {
      if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        return safeAck(ack, {
          success: false,
          message: "Invalid room id"
        });
      }

      const room = await Room.findOne({
        _id: roomId,
        members: currentUser._id
      });

      if (!room) {
        return safeAck(ack, {
          success: false,
          message: "You are not a member of this room"
        });
      }

      socket.join(`room:${roomId}`);

      return safeAck(ack, {
        success: true
      });
    } catch (error) {
      return safeAck(ack, {
        success: false,
        message: "Failed to join room"
      });
    }
  });

  socket.on("room:leave", ({ roomId } = {}, ack) => {
    if (!roomId) {
      return safeAck(ack, {
        success: false,
        message: "roomId is required"
      });
    }

    socket.leave(`room:${roomId}`);

    return safeAck(ack, {
      success: true
    });
  });

  socket.on("dm:send", async ({ receiverId, content = "", fileUrl = "", fileType = "" } = {}, ack) => {
    try {
      if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
        return safeAck(ack, {
          success: false,
          message: "Valid receiverId is required"
        });
      }

      if (!content.trim() && !fileUrl) {
        return safeAck(ack, {
          success: false,
          message: "Message content or file is required"
        });
      }

      const message = await Message.create({
        sender: currentUser._id,
        receiver: receiverId,
        content: content.trim(),
        fileUrl,
        fileType
      });

      const populatedMessage = await Message.findById(message._id).populate(MESSAGE_POPULATE);

      io.to(`user:${currentUser._id}`).emit("dm:new", populatedMessage);
      io.to(`user:${receiverId}`).emit("dm:new", populatedMessage);

      return safeAck(ack, {
        success: true,
        message: populatedMessage
      });
    } catch (error) {
      return safeAck(ack, {
        success: false,
        message: "Failed to send DM"
      });
    }
  });

  socket.on("room:send", async ({ roomId, content = "", fileUrl = "", fileType = "" } = {}, ack) => {
    try {
      if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        return safeAck(ack, {
          success: false,
          message: "Valid roomId is required"
        });
      }

      if (!content.trim() && !fileUrl) {
        return safeAck(ack, {
          success: false,
          message: "Message content or file is required"
        });
      }

      const room = await Room.findOne({
        _id: roomId,
        members: currentUser._id
      });

      if (!room) {
        return safeAck(ack, {
          success: false,
          message: "You are not a member of this room"
        });
      }

      const message = await Message.create({
        sender: currentUser._id,
        room: roomId,
        content: content.trim(),
        fileUrl,
        fileType
      });

      await Room.findByIdAndUpdate(roomId, {
        $set: { updatedAt: new Date() }
      });

      const populatedMessage = await Message.findById(message._id).populate(MESSAGE_POPULATE);

      io.to(`room:${roomId}`).emit("room:new", populatedMessage);

      room.members.forEach((memberId) => {
        io.to(`user:${memberId}`).emit("room:new", populatedMessage);
      });

      return safeAck(ack, {
        success: true,
        message: populatedMessage
      });
    } catch (error) {
      return safeAck(ack, {
        success: false,
        message: "Failed to send room message"
      });
    }
  });

  socket.on("dm:typing", ({ receiverId, isTyping } = {}) => {
    if (!receiverId) return;

    io.to(`user:${receiverId}`).emit("dm:typing", {
      fromUserId: String(currentUser._id),
      isTyping: Boolean(isTyping)
    });
  });

  socket.on("room:typing", async ({ roomId, isTyping } = {}) => {
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) return;

    const room = await Room.findOne({
      _id: roomId,
      members: currentUser._id
    });

    if (!room) return;

    socket.to(`room:${roomId}`).emit("room:typing", {
      roomId,
      fromUserId: String(currentUser._id),
      isTyping: Boolean(isTyping)
    });
  });
};

module.exports = registerSocketEvents;