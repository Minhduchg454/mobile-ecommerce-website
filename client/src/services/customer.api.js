import axios from "./axios";

export const apiGetCustomerCart = (cid) =>
  axios({
    url: `/customers/${cid}/cart`,
    method: "get",
  });
