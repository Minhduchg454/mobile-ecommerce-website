import axios from "../axios"

export const apiRegister = (data) =>
  axios({
    url: "/user/register",
    method: "post",
    data,
  })
export const apiFinalRegister = (token) =>
  axios({
    url: "/user/finalregister/" + token,
    method: "put",
  })
export const apiLogin = (data) =>
  axios({
    url: "/user/login",
    method: "post",
    data,
  })
export const apiForgotPassword = (data) =>
  axios({
    url: "/user/forgotpassword",
    method: "post",
    data,
  })
export const apiResetPassword = (data) =>
  axios({
    url: "/user/resetpassword",
    method: "put",
    data,
  })
export const apiGetCurrent = () =>
  axios({
    url: "/user/current",
    method: "get",
  })
export const apiGetUsers = (params) =>
  axios({
    url: "/user/",
    method: "get",
    params,
  })
export const apiUpdateUser = (data, uid) =>
  axios({
    url: "/user/" + uid,
    method: "put",
    data,
  })
export const apiDeleteUser = (uid) =>
  axios({
    url: "/user/" + uid,
    method: "delete",
  })
export const apiUpdateCurrent = (data) =>
  axios({
    url: "/user/current",
    method: "put",
    data,
  })
export const apiUpdateCart = (data) =>
  axios({
    url: "/user/cart",
    method: "put",
    data,
  })
export const apiRemoveCart = (pid, color) =>
  axios({
    url: `/user/remove-cart/${pid}/${color}`,
    method: "delete",
  })
export const apiUpdateWishlist = (pid) =>
  axios({
    url: `/user/wishlist/` + pid,
    method: "put",
  })

// ========== CUSTOMER API ENDPOINTS ==========
export const apiCreateCustomer = (data) =>
  axios({
    url: "/user/customer",
    method: "post",
    data,
  })

export const apiGetCustomerInfo = (id) =>
  axios({
    url: `/user/customer/${id}`,
    method: "get",
  })

export const apiGetCustomerCart = (id) =>
  axios({
    url: `/user/customer/${id}/cart`,
    method: "get",
  })

export const apiGetCustomerOrders = (id) =>
  axios({
    url: `/user/customer/${id}/orders`,
    method: "get",
  })

export const apiGetCustomerPreviews = (id) =>
  axios({
    url: `/user/customer/${id}/previews`,
    method: "get",
  })

// ========== ADMIN API ENDPOINTS ==========
export const apiCreateAdmin = (data) =>
  axios({
    url: "/user/admin",
    method: "post",
    data,
  })

export const apiGetAdminInfo = (id) =>
  axios({
    url: `/user/admin/${id}`,
    method: "get",
  })

export const apiUpdateAdmin = (data) =>
  axios({
    url: "/user/admin/current",
    method: "put",
    data,
  })

export const apiDeleteAdmin = (id) =>
  axios({
    url: `/user/admin/${id}`,
    method: "delete",
  })
