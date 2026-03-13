import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    fileUrl: { type: String, default: null },
    fileType: { type: String, enum: ['image', 'file', null], default: null },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ room: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1 });

export const Message = mongoose.model('Message', messageSchema);
