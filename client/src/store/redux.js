import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./app/appSlice"; //quan ly ui
import userSlice from "./user/userSlice"; //du lieu nguoi dung: token, thong tin
import sellerSlice from "./seller/sellerSlice";
import storage from "redux-persist/lib/storage"; //Luu vao localStorage
import notificationSlice from "./notification/notificationSlice";
import chatSlice from "./chat/chatSlice";

import { persistReducer, persistStore } from "redux-persist";
//Redux: Quan ly du lieu dung chung giua cac component trong React
const commonConfig = {
  storage,
};

//Luu cac bien isLoggedIn, token,... vao localStorage theo shop/user
const userConfig = {
  ...commonConfig,
  whitelist: ["isLoggedIn", "token", "current", "currentCart", "wishList"],
  key: "shop/user",
};

const sellerConfig = {
  ...commonConfig,
  whitelist: ["current"],
  key: "shop/seller",
};

const notificationConfig = {
  ...commonConfig,
  whitelist: ["unreadCount", "notifications", "loading"],
  key: "shop/notification",
};

const chatConfig = {
  ...commonConfig,
  whitelist: [
    "conversations",
    "totalUnreadChat",
    "messagesByConverId",
    "loadingConversations",
    "loadingMessages",
    "currentConverId",
  ],
  key: "shop/chat",
};

//Khoi tao redux store
export const store = configureStore({
  reducer: {
    app: appSlice,
    user: persistReducer(userConfig, userSlice),
    seller: persistReducer(sellerConfig, sellerSlice),
    notification: persistReducer(notificationConfig, notificationSlice),
    chat: persistReducer(chatConfig, chatSlice),
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
