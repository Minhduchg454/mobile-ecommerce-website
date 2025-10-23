import axios from "../axios";

export const apiGetCustomerCart = (cid) =>
  axios({
    url: `/customer/${cid}/cart`,
    method: "get",
  });
