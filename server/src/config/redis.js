const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => console.log("Redis Client Error", err));
redis.on("connect", () => console.log("Redis connected successfully"));

// Kết nối ngay khi khởi động
redis.connect();

module.exports = redis;
