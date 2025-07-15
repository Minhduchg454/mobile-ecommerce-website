import axios from "../axios";

export const apiRegister = (data) =>
  axios({
    url: "/customers",
    method: "post",
    data,
    headers: { "Content-Type": "application/json" },
  });
export const apiFinalRegister = (token) =>
  axios({
    url: "/users/finalregister/" + token,
    method: "put",
  });
export const apiLogin = (data) =>
  axios({
    url: "/users/login",
    method: "post",
    data,
  });
export const apiForgotPassword = (data) =>
  axios({
    url: "/users/forgotpassword",
    method: "post",
    data,
  });
export const apiResetPassword = (data) =>
  axios({
    url: "/users/resetpassword",
    method: "put",
    data,
  });
export const apiGetCurrent = () =>
  axios({
    url: "/users/current",
    method: "get",
  });
export const apiGetUsers = (params) =>
  axios({
    url: "/users/",
    method: "get",
    params,
  });
export const apiUpdateUser = (data, uid) =>
  axios({
    url: "/users/" + uid,
    method: "put",
    data,
  });
export const apiDeleteUser = (uid) =>
  axios({
    url: "/users/" + uid,
    method: "delete",
  });

export const apiUpdateCurrent = (data, uid) =>
  axios({
    url: "/users/" + uid, // uid là current._id
    method: "put",
    data,
  });

// export const apiUpdateCart = (data) =>
//   axios({
//     url: "/cartitem",
//     method: "post",
//     data,
//   });

// export const apiRemoveCart = (pid, color) =>
//   axios({
//     url: `/users/remove-cart/${pid}/${color}`,
//     method: "delete",
//   });
export const apiUpdateWishlist = (pid) =>
  axios({
    url: `/users/wishlist/` + pid,
    method: "put",
  });

// ========== CUSTOMER API ENDPOINTS ==========
/* export const apiCreateCustomer = (data) =>
  axios({
    url: "/user/customer",
    method: "post",
    data,
  });

export const apiGetCustomerInfo = (id) =>
  axios({
    url: `/user/customer/${id}`,
    method: "get",
  });

export const apiGetCustomerCart = (id) =>
  axios({
    url: `/user/customer/${id}/cart`,
    method: "get",
  });

export const apiGetCustomerOrders = (id) =>
  axios({
    url: `/user/customer/${id}/orders`,
    method: "get",
  });

export const apiGetCustomerPreviews = (id) =>
  axios({
    url: `/user/customer/${id}/previews`,
    method: "get",
  }); */

// ========== ADMIN API ENDPOINTS ==========
export const apiCreateAdmin = (data) =>
  axios({
    url: "/user/admin",
    method: "post",
    data,
  });

export const apiGetAdminInfo = (id) =>
  axios({
    url: `/user/admin/${id}`,
    method: "get",
  });

export const apiUpdateAdmin = (data) =>
  axios({
    url: "/user/admin/current",
    method: "put",
    data,
  });

export const apiDeleteAdmin = (id) =>
  axios({
    url: `/user/admin/${id}`,
    method: "delete",
  });

/* export const apiCheckEmailExists = (email) =>
  axios({
    url: `/customers/check-email`,
    method: "get",
    params: { email },
  });

export const apiCheckMobileExists = (mobile) =>
  axios({
    url: `/customers/check-mobile`,
    method: "get",
    params: { mobile },
  }); */
