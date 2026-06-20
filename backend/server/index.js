require("dotenv").config();

// Core Packages
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

// Database Models
const Message = require("./models/Message");

// API Routes
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");
const uploadRoutes = require("./routes/upload");

// Express App
const app = express();

// Global Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://telegram-clone-ra5s.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Static Files
app.use("/uploads", express.static("uploads"));

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err);
  });

// HTTP Server
const server = http.createServer(app);

// Online Users Store
const onlineUsers = {};

// Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Real-Time Socket Events
io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  // User Online Event
  socket.on("user_online", (userId) => {
    onlineUsers[userId] = socket.id;

    console.log("🟢 Online User:", userId);

    io.emit("online_users", Object.keys(onlineUsers));
  });

  // Send Message
  socket.on("send_message", async (data) => {
    console.log("📩 Incoming Message:", data);

    try {
      const message = new Message({
        senderId: data.senderId,

        receiverId: data.receiverId,

        text: data.text,

        status: "delivered",
      });

      await message.save();

      console.log("✅ Message Saved");

      io.emit("receive_message", message);
    } catch (error) {
      console.error("❌ Save Error:", error);
    }
  });

  // Seen Status
  socket.on("message_seen", async (messageId) => {
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        {
          status: "seen",
        },
        {
          new: true,
        },
      );

      io.emit("message_seen_update", updatedMessage);
    } catch (error) {
      console.error("❌ Seen Error:", error);
    }
  });

  // Disconnect Event
  socket.on("disconnect", () => {
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];

        break;
      }
    }

    io.emit("online_users", Object.keys(onlineUsers));

    console.log("🔴 User Disconnected");
  });
});

// // Start Backend Server
// server.listen(5000, "0.0.0.0", () => {
//   console.log("🚀 Server Running on Port 5000");
// });

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
});
