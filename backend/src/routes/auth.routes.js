const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");
const { register, login, getMe } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", authMiddleware, asyncHandler(getMe));

module.exports = router;