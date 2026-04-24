const { successResponse } = require("../utils/response");

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded"
    });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  return successResponse(res, "File uploaded successfully", {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    fileUrl: `${baseUrl}/uploads/${req.file.filename}`
  });
};

module.exports = {
  uploadFile
};