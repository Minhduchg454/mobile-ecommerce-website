import axios from "./axios";

/**
 * Category
 */
export const apiGetResponse = (data) =>
  axios({
    url: "chatbots/send-message",
    method: "post",
    data,
  });
