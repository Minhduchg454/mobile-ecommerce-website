import axios from 'axios'
import { store } from './store/redux'
const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URI,
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    let localStorageData = window.localStorage.getItem('persist:shop/user')
    let accessToken = null;
    if (localStorageData && typeof localStorageData === 'string') {
        localStorageData = JSON.parse(localStorageData)
        accessToken = localStorageData?.token
        // Nếu token là chuỗi JSON.stringify, parse ra, nếu không thì giữ nguyên
        try {
            if (accessToken && accessToken.startsWith('"') && accessToken.endsWith('"')) {
                accessToken = JSON.parse(accessToken)
            }
        } catch (e) {
            // Nếu parse lỗi, giữ nguyên
        }
    }
    // Nếu không có token ở localStorage, lấy từ Redux store
    if ((!accessToken || accessToken.length < 10) && store) {
        accessToken = store.getState().user.token
    }
    if (typeof accessToken === 'string' && accessToken.length > 10) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${accessToken}`
        }
    }
    // Thêm log để debug
    console.log('[AXIOS DEBUG] baseURL:', config.baseURL, '| url:', config.url)
    console.log('[AXIOS DEBUG] headers:', config.headers)
    return config
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    return response.data ? response.data : response;
  },
  function (error) {
    // Nếu error.response không tồn tại, trả về object rỗng để tránh lỗi undefined
    return error.response ? error.response.data : { success: false, mes: 'Unknown error' };
  }
);

export default instance