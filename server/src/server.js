const app = require("./app");
const port = process.env.PORT || 5001;

console.log("=== ĐÃ KHỞI ĐỘNG Server ===");

const { initDefaultAdmin } = require("./ultils/initAdmin");

// Nếu có dùng app.use(morgan('dev')) hoặc custom log request, hãy xóa hoặc comment dòng đó
app.get("/api/test", (req, res) => {
  res.json({ success: true, mes: "Test OK" });
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    await initDefaultAdmin();
  } catch (err) {
    console.error("Lỗi khi tạo admin mặc định:", err.message);
  }
});
