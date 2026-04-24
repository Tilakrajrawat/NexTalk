const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    description: {
      type: String,
      default: "",
      maxlength: 250
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    isPrivate: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

roomSchema.index({ name: "text" });
roomSchema.index({ members: 1 });

module.exports = mongoose.model("Room", roomSchema);