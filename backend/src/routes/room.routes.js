const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");
const {
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  updateRoom,
  addMembersToRoom,
  removeMemberFromRoom,
  deleteRoom
} = require("../controllers/room.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncHandler(getRooms));
router.post("/", asyncHandler(createRoom));
router.post("/:roomId/join", asyncHandler(joinRoom));
router.post("/:roomId/leave", asyncHandler(leaveRoom));

router.patch("/:roomId", asyncHandler(updateRoom));
router.post("/:roomId/members", asyncHandler(addMembersToRoom));
router.delete("/:roomId/members/:memberId", asyncHandler(removeMemberFromRoom));
router.delete("/:roomId", asyncHandler(deleteRoom));

module.exports = router;