import axios from "./axios";

//-----------------Shop --------------------
export const apiGetPreviews = (query) =>
  axios({
    url: "previews/products",
    method: "get",
    params: query,
  });

export const apiCreatePreview = (data) =>
  axios({
    url: "previews/products",
    method: "post",
    data,
  });

export const apiUpdatePreview = (data, pId) =>
  axios({
    url: "previews/products/" + pId,
    method: "put",
    data,
  });

export const apiDeletePreview = (pId) =>
  axios({
    url: "previews/products/" + pId,
    method: "delete",
  });
