const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, //2mb limit
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(
      file.mimetype
    );
    cb(ok ? null : new Error("Only JPG/PNG/WEBP allowed"), ok);
  },
});

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

router.post(
  "/me/avatar",
  requireAuth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const userId = String(req.session.userId);
      if (!userId) return res.status(401).send("Not logged in.");

      const result = await uploadBuffer(req.file.buffer, {
        folder: "avatars",
        public_id: userId,
        overwrite: true,
        resource_type: "image",
      });

      const updated = await User.findByIdAndUpdate(
        userId,
        { pfpId: result.public_id, pfpUrl: result.secure_url },
        { new: true }
      );

      console.log("uploaded img to mongo", updated?.pfpUrl);
      res.redirect("/settings");
    } catch (e) {
      console.error(e);
      res.status(400).send("Avatar upload failed.");
    }
  }
);

module.exports = router;
