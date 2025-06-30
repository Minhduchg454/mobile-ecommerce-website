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

    // --- Nếu bạn có code gọi API thời tiết thực tế, hãy đảm bảo nó hoạt động ---
    /*
    // Ví dụ gọi OpenWeatherMap API (Bạn cần đăng ký API key và bỏ comment ra)
    // const apiKey = process.env.OPENWEATHER_API_KEY; // Hoặc một biến môi trường khác
    // if (!apiKey) {
    //     console.error("OPENWEATHER_API_KEY không được đặt!");
    //     return { error: "Thiếu cấu hình API key thời tiết." };
    // }
    // const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`;
    // try {
    //     const fetch = require('node-fetch'); // Cần install node-fetch: npm install node-fetch
    //     const response = await fetch(apiUrl);
    //     const data = await response.json();

    //     if (response.ok && data.main && data.weather) {
    //         const weatherData = {
    //             location: data.name,
    //             temperature: data.main.temp.toString(),
    //             unit: "celsius",
    //             conditions: data.weather[0].description,
    //         };
    //         console.log("[getCurrentWeather] Trả về (API):", weatherData);
    //         return weatherData;
    //     } else {
    //         console.error("[getCurrentWeather] Lỗi từ API thời tiết:", data.message || "Không có dữ liệu.");
    //         return { error: data.message || "Không tìm thấy dữ liệu thời tiết từ API.", location: location };
    //     }
    // } catch (error) {
    //     console.error("[getCurrentWeather] Lỗi khi gọi API thời tiết:", error);
    //     return { error: "Lỗi kết nối API thời tiết.", location: location };
    // }
    */
}

const searchProduct = require("../../../ultils/searchProduct");

module.exports = { getCurrentWeather, searchProduct };