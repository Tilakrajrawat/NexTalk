const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
      index: true
    },
    content: {
      type: String,
      default: "",
      maxlength: 5000,
      trim: true
    },
    fileUrl: {
      type: String,
      default: ""
    },
    fileType: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Ensure a message belongs to either a DM or a room
messageSchema.pre("validate", function (next) {
  const hasReceiver = !!this.receiver;
  const hasRoom = !!this.room;

  if ((hasReceiver && hasRoom) || (!hasReceiver && !hasRoom)) {
    return next(new Error("Message must belong to either a receiver (DM) or a room"));
  }

  if (!this.content && !this.fileUrl) {
    return next(new Error("Message must contain text content or a file"));
  }

  next();
});

// Indexes for DM history
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, sender: 1, createdAt: -1 });

// Index for room history
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);