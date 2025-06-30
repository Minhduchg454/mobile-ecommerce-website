const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const searchProduct = require("../ultils/searchProduct");

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe("searchProduct thực tế (DB thật)", () => {
    it("trả về kết quả khi có dữ liệu phù hợp", async () => {
        const result = await searchProduct("áo");
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(0);
        if (result.length > 0) {
            expect(result[0]).toHaveProperty("title");
            expect(result[0]).toHaveProperty("score");
        }
    });

    it("trả về [] nếu query không khớp gì", async () => {
        const result = await searchProduct("nội dung không ai có 1234xxx");
        expect(result).toEqual([]);
    });
});
