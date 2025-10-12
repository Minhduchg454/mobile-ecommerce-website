const { GoogleGenAI } = require("@google/genai");
const model = new GoogleGenAI(process.env.GEMINI_API_KEY);

module.exports = model;
