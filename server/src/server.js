const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const port = process.env.PORT || 5001;
const { initDefaultAdmin } = require("./ultils/initAdmin");
const { startRecommendationJob } = require("./jobs/buildRecommendationMatrix");
const { startBuildIndexDataChatBot } = require("./jobs/buildIndexDataChatBot");
const { startSubscriptionJob } = require("./jobs/shopSubscription");

const onlineUsers = new Set();

// 1. Tạo HTTP Server từ ứng dụng Express
const server = http.createServer(app);

// 2. Khởi tạo Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, "http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 3. Gán Socket.IO instance vào app để các service có thể truy cập
app.set("socketio", io);

// === LOGIC XỬ LÝ SOCKET.IO ===
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  // 1. Authenticate (Đã có - giữ nguyên)
  socket.on("authenticate", (data) => {
    const userId = data.userId;
    if (userId) {
      const userIdString = String(userId);
      socket.userId = userIdString;
      socket.join(userIdString);
      socket.join("persistent_user_room_" + userId);
      if (!onlineUsers.has(userIdString)) {
        onlineUsers.add(userIdString);
        // Thông báo cho tất cả client (trừ mình) rằng user này online
        socket.broadcast.emit("user_online_status", {
          userId: userIdString,
          isOnline: true,
        });
      }
      console.log(`User ${userIdString} online`);
    }
  });

  socket.on("join_conversation", ({ conver_id }) => {
    if (conver_id) {
      const roomId = conver_id.toString();
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined conversation: ${roomId}`);
    }
  });

  socket.on("leave_conversation", ({ conver_id }) => {
    if (conver_id) {
      const roomId = conver_id.toString();
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left conversation: ${roomId}`);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      const userId = socket.userId;
      onlineUsers.delete(userId);
      io.emit("user_online_status", {
        userId,
        isOnline: false,
      });
      console.log(`User ${userId} offline`);
    }
  });
});

// 6. Lắng nghe trên HTTP Server thay vì Express app
server.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    //For admin
    await initDefaultAdmin();
    // for data chatbot
    startBuildIndexDataChatBot();
    //for recommendations
    startRecommendationJob();
    //for shop subscription
    //startSubscriptionJob();
  } catch (err) {
    console.error("Lỗi khi tạo admin mặc định:", err.message);
  }
});

console.log("=== ĐÃ KHỞI ĐỘNG Server ===");
