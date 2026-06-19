const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }

  router.put("/avatar/:id", async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          avatar: req.body.avatar,
        },
        { new: true },
      );

      res.json(user);
    } catch (error) {
      res.status(500).json({
        message: "Server Error",
      });
    }
  });
});

module.exports = router;
