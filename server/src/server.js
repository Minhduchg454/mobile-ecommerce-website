const app = require("./app");
// 1. Import module http để tạo server
const http = require("http");
// 2. Import Socket.IO
const { Server } = require("socket.io");

const port = process.env.PORT || 5001;
const searchService = require("./modules/chatBot/tools/search.tools");
const { initDefaultAdmin } = require("./ultils/initAdmin");
const { startRecommendationJob } = require("./jobs/buildRecommendationMatrix");
const { startBuildIndexDataChatBot } = require("./jobs/buildIndexDataChatBot");

// 3. Tạo HTTP Server từ ứng dụng Express
const server = http.createServer(app);

// 4. Khởi tạo Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, "http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 5. Gán Socket.IO instance vào app để các service có thể truy cập
app.set("socketio", io);

// === LOGIC XỬ LÝ SOCKET.IO ===
// === LOGIC XỬ LÝ SOCKET.IO ===
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Authenticate (Đã có - giữ nguyên)
  socket.on("authenticate", (data) => {
    const userId = data.userId;
    if (userId) {
      const userIdString = String(userId);
      socket.join(userIdString);
      socket.join("persistent_user_room_" + userId);
      socket.userId = userIdString;
      console.log(`User ${userIdString} authenticated and joined room.`);
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
      console.log(`User ${socket.userId} disconnected.`);
    } else {
      console.log(`Socket disconnected: ${socket.id}`);
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
  } catch (err) {
    console.error("Lỗi khi tạo admin mặc định:", err.message);
  }
});

console.log("=== ĐÃ KHỞI ĐỘNG Server ==="); // [Chuyển xuống dưới cùng sau khi khởi động]
