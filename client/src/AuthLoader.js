// src/AuthLoader.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrent } from "./store/user/asyncActions";

const AuthLoader = () => {
  const dispatch = useDispatch();
  const { token, isLoggedIn, current } = useSelector((state) => state.user);

  useEffect(() => {
    if (token && isLoggedIn && !current) {
      dispatch(getCurrent());
    }
  }, [token, isLoggedIn]);

  return null;
};

export default AuthLoader; // ✅ export default
