const express = require("express");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        file.originalname
    );
  },
});

const upload = multer({
  storage,
});

const getServerUrl = () =>
  process.env.SERVER_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  `http://localhost:${process.env.PORT || 5000}`;

router.post(
  "/avatar",
  upload.single("avatar"),
  (req, res) => {
    res.json({
      imageUrl: `${getServerUrl()}/uploads/${req.file.filename}`,
    });
  }
);

module.exports = router;