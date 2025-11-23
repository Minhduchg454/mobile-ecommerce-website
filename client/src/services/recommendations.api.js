import axios from "./axios";

export const apiRecommendations = (userId) =>
  axios({
    url: "recommendations/" + userId,
    method: "get",
  });
