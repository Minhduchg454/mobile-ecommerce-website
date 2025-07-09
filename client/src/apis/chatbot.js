import axios from "../axios";

// Gửi tin nhắn tới chatbot để nhận phản hồi
export const apiSendMessageToChatbot = (data) =>
    axios({
        url: "/chatbot/send-message",
        method: "post",
        data,
    });
