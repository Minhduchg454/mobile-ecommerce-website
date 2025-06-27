// server/server.js
// Khởi tạo server sử dụng app.js chuẩn hóa
const app = require('./app');
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
