import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./app/appSlice"; //quan ly ui
import productSlice from "./products/productSlice"; // du lieu san pham
import userSlice from "./user/userSlice"; //du lieu nguoi dung: token, thong tin
import storage from "redux-persist/lib/storage"; //Luu vao localStorage
import { persistReducer, persistStore } from "redux-persist"; //ket hop reducer voi co che luu tru, khoi tao co che luu va phuc hoi du lieu tu localStorage

//Redux: Quan ly du lieu dung chung giua cac component trong React

const commonConfig = {
  storage,
};

//Luu cac bien isLoggedIn, token,... vao localStorage theo shop/user
const userConfig = {
  ...commonConfig,
  whitelist: ["isLoggedIn", "token", "current", "currentCart"],
  key: "shop/user",
};

//Luu dealDaily vao localStorage de khong phai goi API moi lan reload
const productConfig = {
  ...commonConfig,
  whitelist: ["dealDaily"],
  key: "shop/deal",
};

//Khoi tao redux store
export const store = configureStore({
  reducer: {
    //Chia state thanh ba thanh phan de luu lau dai: trang thai ui, du lieu san pham , user
    app: appSlice,
    products: persistReducer(productConfig, productSlice),
    user: persistReducer(userConfig, userSlice),
  },
  //Tat canh bao khi reudux xu ly du lieu khong thuan tuy nhu class, date, function
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

//Khoi tao, delay render app cho den khi Redux khoi phuc du lieu tu localStorage xong
export const persistor = persistStore(store);

/* 
  	
  1.	Người dùng login → userSlice cập nhật isLoggedIn, token, current.
	2.	persistReducer tự động lưu state vào localStorage.
	3.	Khi F5, redux-persist lấy dữ liệu lại từ localStorage và phục hồi vào Redux store.
	4.	Component đọc state (useSelector) như bình thường.
*/
