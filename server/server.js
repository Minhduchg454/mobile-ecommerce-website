// server/server.js
// Khởi tạo server sử dụng app.js chuẩn hóa
const app = require("./app");
const port = process.env.PORT || 5000;

console.log("=== ĐÃ KHỞI ĐỘNG BACKEND CT250 ===");

// Nếu có dùng app.use(morgan('dev')) hoặc custom log request, hãy xóa hoặc comment dòng đó
app.get("/api/test", (req, res) => {
  res.json({ success: true, mes: "Test OK" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
