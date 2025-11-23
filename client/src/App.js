// App.js
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { connectSocket, disconnectSocket } from "./ultils/socket";
import { fetchMyConversations } from "./store/chat/asynsAction";
import { useDispatch } from "react-redux";

function App() {
  const { current: user } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  useEffect(() => {
    if (user?._id) {
      connectSocket(user._id);
      dispatch(fetchMyConversations());
    }

    return () => {
      if (!user?._id) {
        disconnectSocket();
      }
    };
  }, [user?._id]);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}
export default App;
