const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// Get All Messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({
      createdAt: 1,
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

// Get Conversation Between Two Users
router.get("/:senderId/:receiverId", async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          senderId,
          receiverId,
        },
        {
          senderId: receiverId,
          receiverId: senderId,
        },
      ],
    }).sort({
      createdAt: 1,
    });

    res.json(messages);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;
