// testSearch.js
const mongoose = require('mongoose');
require('dotenv').config(); // nếu bạn dùng biến môi trường
const searchProduct = require('./ultils/searchProduct'); // đường dẫn đúng tới file bạn đưa ở trên

// Kết nối database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-db-name', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log('✅ Đã kết nối MongoDB');

    // Gọi hàm searchProduct
    const result = await searchProduct('samsung'); // Thay từ khóa tại đây
    console.log('🔍 Kết quả tìm kiếm:', result);

    mongoose.disconnect();
}).catch((err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err);
});
