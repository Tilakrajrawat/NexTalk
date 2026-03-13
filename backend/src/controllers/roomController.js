import { Room } from '../models/Room.js';

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ members: req.user.id }).sort({ createdAt: -1 });
    return res.json(rooms);
  } catch (error) {
    return next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Room name is required.' });
    }

    const room = await Room.create({
      name: name.trim(),
      createdBy: req.user.id,
      members: [req.user.id],
    });

    return res.status(201).json(room);
  } catch (error) {
    return next(error);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.user.id } },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    return res.json(room);
  } catch (error) {
    return next(error);
  }
};

export const leaveRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.user.id } },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    return res.json(room);
  } catch (error) {
    return next(error);
  }
};
