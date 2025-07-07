// utilities.js
// Hãy chắc chắn bạn đã đổi tên hàm thành 'get_current_temperature' nếu đó là tên bạn dùng trong Function Declaration
async function getCurrentWeather(location) { // Thêm async nếu bạn đang gọi API thực tế
    console.log(`[getCurrentWeather] Được gọi với địa điểm: ${location}`);

    // --- Dữ liệu giả lập cho mục đích kiểm thử ---
    if (location.toLowerCase() === "cần thơ" || location.toLowerCase() === "can tho") {
        const result = { location: "Cần Thơ", temperature: "30", unit: "celsius", conditions: "Nắng, nóng ẩm" };
        console.log("[getCurrentWeather] Trả về (Cần Thơ):", result);
        return result;
    } else if (location.toLowerCase() === "hà nội" || location.toLowerCase() === "ha noi") {
        const result = { location: "Hà Nội", temperature: "28", unit: "celsius", conditions: "Nhiều mây, có mưa rào" };
        console.log("[getCurrentWeather] Trả về (Hà Nội):", result);
        return result;
    } else if (location.toLowerCase() === "london") {
        const result = { location: "London", temperature: "15", unit: "celsius", conditions: "Mưa phùn" };
        console.log("[getCurrentWeather] Trả về (London):", result);
        return result;
    } else {
        // Đây là trường hợp mà Gemini có thể diễn giải là thiếu dữ liệu
        const errorResult = { error: "Không tìm thấy thông tin thời tiết cho địa điểm này.", location: location };
        console.log("[getCurrentWeather] Trả về (Không tìm thấy):", errorResult);
        return errorResult;
    }

}

// const { Query } = require("mongoose");
const searchProduct = require("../../../ultils/searchProduct");

async function searchProductForChatBot(query) {
    console.log(query);

    const result = await searchProduct(query.query); // trả về danh sách sản phẩm
    if (!Array.isArray(result) || result.length === 0) {
        return { suggestions: "❌ Không tìm thấy sản phẩm nào phù hợp với yêu cầu." };
    }

    // Chuyển thành đoạn text ngắn gọn
    const textResult = result.map((product, index) => {
        const item = product.item;
        return `🔹 ${index + 1}. ${item.productName} - ${item.price.toLocaleString()}₫ (${item.categoryName})`;
    }).join("\n");

    return { suggestions: textResult }; // bọc text trong object để tương thích với Gemini
};

module.exports = { getCurrentWeather, searchProductForChatBot };