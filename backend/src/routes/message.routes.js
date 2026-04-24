const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");
const {
  getDMHistory,
  getRoomHistory,
  getDMThreads
} = require("../controllers/message.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/threads", asyncHandler(getDMThreads));
router.get("/dm/:userId", asyncHandler(getDMHistory));
router.get("/room/:roomId", asyncHandler(getRoomHistory));

module.exports = router;