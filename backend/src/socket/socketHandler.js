import jwt from 'jsonwebtoken';
import { Message } from '../models/Message.js';
import { Room } from '../models/Room.js';
import { User } from '../models/User.js';

const userSocketMap = new Map();

const personalRoom = (userId) => `user:${userId}`;

export const configureSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      next(new Error('Authentication required.'));
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token.'));
    }
  });

  io.on('connection', async (socket) => {
    const { userId } = socket;
    userSocketMap.set(userId, socket.id);
    socket.join(personalRoom(userId));

    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit('user_online', userId);

    socket.on('join_room', async (roomId) => {
      const member = await Room.exists({ _id: roomId, members: userId });
      if (member) socket.join(`room:${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(`room:${roomId}`);
    });

    socket.on('typing_start', ({ roomId = null, receiverId = null } = {}) => {
      const payload = { userId, roomId, receiverId };
      if (roomId) {
        socket.to(`room:${roomId}`).emit('typing', payload);
      }
      if (receiverId) {
        socket.to(personalRoom(receiverId)).emit('typing', payload);
      }
    });

    socket.on('typing_stop', ({ roomId = null, receiverId = null } = {}) => {
      const payload = { userId, roomId, receiverId };
      if (roomId) {
        socket.to(`room:${roomId}`).emit('stop_typing', payload);
      }
      if (receiverId) {
        socket.to(personalRoom(receiverId)).emit('stop_typing', payload);
      }
    });

    socket.on('send_message', async ({ content = '', roomId = null, receiverId = null, fileUrl = null, fileType = null } = {}) => {
      if (!content.trim() && !fileUrl) return;
      if (!roomId && !receiverId) return;

      if (roomId) {
        const member = await Room.exists({ _id: roomId, members: userId });
        if (!member) return;
      }

      const message = await Message.create({
        sender: userId,
        content: content.trim(),
        room: roomId,
        receiver: receiverId,
        fileUrl,
        fileType,
      });

      if (roomId) {
        io.to(`room:${roomId}`).emit('receive_message', message);
      }

      if (receiverId) {
        io.to(personalRoom(userId)).emit('receive_message', message);
        io.to(personalRoom(receiverId)).emit('receive_message', message);
      }
    });

    socket.on('disconnect', async () => {
      userSocketMap.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user_offline', userId);
    });
  });
};
