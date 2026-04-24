const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");
const {
  getUsers,
  getMyProfile,
  updateMyProfile,
  updateMyAvatar,
  deleteMyAccount
} = require("../controllers/user.controller");

const router = express.Router();

const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    cb(null, `avatar-${Date.now()}-${baseName}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed for avatar"), false);
    }

    cb(null, true);
  }
}).single("avatar");

router.use(authMiddleware);

router.get("/", asyncHandler(getUsers));
router.get("/me/profile", asyncHandler(getMyProfile));
router.patch("/me/profile", asyncHandler(updateMyProfile));
router.patch(
  "/me/avatar",
  (req, res, next) => {
    avatarUpload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Avatar upload failed"
        });
      }

      next();
    });
  },
  asyncHandler(updateMyAvatar)
);
router.delete("/me", asyncHandler(deleteMyAccount));

module.exports = router;