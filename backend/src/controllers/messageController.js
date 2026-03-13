import path from 'path';
import { Message } from '../models/Message.js';
import { Room } from '../models/Room.js';

export const getRoomMessages = async (req, res, next) => {
  try {
    const membership = await Room.exists({ _id: req.params.roomId, members: req.user.id });
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this room.' });
    }

    const messages = await Message.find({ room: req.params.roomId }).sort({ createdAt: 1 });
    return res.json(messages);
  } catch (error) {
    return next(error);
  }
};

export const getDMs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      room: null,
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    return res.json(messages);
  } catch (error) {
    return next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { content = '', roomId = null, receiverId = null, fileUrl = null, fileType = null } = req.body;
    if (!content.trim() && !fileUrl) {
      return res.status(400).json({ message: 'Message requires text or a file.' });
    }
    if (!roomId && !receiverId) {
      return res.status(400).json({ message: 'roomId or receiverId is required.' });
    }

    if (roomId) {
      const membership = await Room.exists({ _id: roomId, members: req.user.id });
      if (!membership) {
        return res.status(403).json({ message: 'You are not a member of this room.' });
      }
    }

    const message = await Message.create({
      sender: req.user.id,
      content: content.trim(),
      room: roomId,
      receiver: receiverId,
      fileUrl,
      fileType,
    });

    return res.status(201).json(message);
  } catch (error) {
    return next(error);
  }
};

export const uploadAttachment = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const extension = path.extname(req.file.originalname).toLowerCase();
  const fileType = ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(extension) ? 'image' : 'file';
  const fileUrl = `/uploads/${req.file.filename}`;

  return res.status(201).json({ fileUrl, fileType, originalName: req.file.originalname, size: req.file.size });
};
