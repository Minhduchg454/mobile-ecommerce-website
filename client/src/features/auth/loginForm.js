import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "store/user/userSlice";
import { showAlert } from "store/app/appSlice";
import {
  getCurrent,
  syncCartFromServer,
  fetchWishlist,
} from "store/user/asyncActions";
import { fetchSellerCurrent } from "store/seller/asynsActions";
import { GoogleLogin } from "@react-oauth/google";
import { apiLogin } from "../../services/auth.api";
import path from "ultils/path";
import axios from "axios";
import { FaLock, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";

export const LoginForm = () => {
  const [payload, setPayload] = useState({ password: "", accountName: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || `/${path.HOME}`;

  const validateInput = () => {
    const err = {};
    if (!payload.accountName.trim())
      err.accountName = "Số điện thoại không được để trống.";
    else if (!/^0\d{9}$/.test(payload.accountName))
      err.accountName = "Số điện thoại không hợp lệ.";
    if (!payload.password) err.password = "Mật khẩu không được để trống.";
    else if (payload.password.length < 6) err.password = "Tối thiểu 6 ký tự.";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse?.credential;
    if (!token) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URI}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) throw new Error("Google Auth response not OK");
      const data = await res.json();

      if (data.success && data.token && data.user) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        localStorage.setItem("accessToken", data.token);
        dispatch(
          login({
            isLoggedIn: true,
            token: String(data.token),
            userData: data.user,
          })
        );

        // Alert thành công (không chặn điều hướng)
        dispatch(
          showAlert({
            title: "Thành công",
            message: `Chào mừng ${
              data.user?.userLastName || data.user?.userEmail
            } quay lại`,
            variant: "success",
            showCancelButton: false,
            confirmText: "OK",
          })
        );

        dispatch(getCurrent()).then((res2) => {
          if (res2.meta.requestStatus === "fulfilled") {
            const user = res2.payload;
            if (user.roleId?.roleName === "customer") {
              dispatch(syncCartFromServer(user._id));
              dispatch(fetchWishlist());
            }
            navigate("/");
          }
        });

        navigate(redirectPath);
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: data.message || "Đăng nhập Google thất bại",
            variant: "danger",
          })
        );
      }
    } catch (err) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Đăng nhập Google thất bại",
          variant: "danger",
        })
      );
      console.error("Lỗi đăng nhập Google:", err);
    }
  };

  const handleInput = (e) => {
    setPayload({ ...payload, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInput()) return;

    const res = await apiLogin({
      accountName: payload.accountName,
      password: payload.password,
    });

    if (res.success && res.token && res.user) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;
      localStorage.setItem("accessToken", res.token);
      dispatch(
        login({
          isLoggedIn: true,
          token: String(res.token),
          userData: res.user,
        })
      );

      dispatch(
        showAlert({
          title: "Chào mừng",
          message: `${res.user?.userFistName || res.user?.userEmail} quay lại`,
          variant: "success",
          duration: 1500,
          showConfirmButton: false,
        })
      );
      let roles = res?.user?.roles || [];

      if (roles.includes("shop")) {
        dispatch(fetchSellerCurrent(res?.user._id));
      }
      dispatch(syncCartFromServer(res?.user._id));
      dispatch(fetchWishlist());
      navigatePath(roles, res?.user._id);
      //navigate(redirectPath);
    } else {
      const msg = res.message || res.err || "Đăng nhập thất bại";
      dispatch(
        showAlert({
          title: "Lỗi",
          message: msg,
          variant: "danger",
          confirmText: "Thử lại",
        })
      );
    }
  };

  const navigatePath = (roles, userId) => {
    if (roles.includes("admin")) {
      navigate(`/${path.ADMIN}/${userId}/${path.A_DASHBOARD}`);
    } else if (roles.includes("shop")) {
      navigate(`/${path.SELLER}/${userId}/${path.S_DASHBOARD}`);
    } else {
      navigate(`/${path.HOME}`);
    }
  };
  const renderError = (field) =>
    errors[field] && (
      <span className="text-red-500 text-xs">{errors[field]}</span>
    );

  return (
    <div className="w-full h-full lg:h-[500px] lg:w-[500px] flex flex-col items-center justify-center relative overflow-hidden bg-white/50 backdrop-blur-md rounded-3xl shadow-2xl p-4">
      <h1 className="text-3xl font-bold text-auth-text mb-10">Đăng nhập</h1>
      <form
        className="w-full min-w-[350px] flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        {/* Input mobile */}
        <div className="relative">
          <FaPhone className="absolute left-3 top-3 text-gray-400" />
          <input
            name="accountName"
            value={payload.accountName}
            onChange={handleInput}
            placeholder="Nhập số điện thoại"
            className="pl-10 py-2 border rounded-xl w-full"
          />
          {renderError("accountName")}
        </div>

        {/* Input password */}
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            mb-2
            type={showPassword ? "text" : "password"}
            name="password"
            value={payload.password}
            onChange={handleInput}
            placeholder="Nhập mật khẩu"
            className="pl-10 pr-10 py-2 border rounded-xl w-full"
          />
          <span
            className="absolute right-3 top-3 text-gray-400 cursor-pointer "
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          {renderError("password")}
        </div>

        <button
          type="submit"
          className="bg-button-bg-ac mt-2 hover:bg-button-bg-hv text-white py-2 rounded-xl font-semibold mb-2"
        >
          Đăng nhập
        </button>
      </form>

      <div className="w-full rounded-xl overflow-hidden shadow ">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() =>
            showAlert({
              title: "Lỗi",
              text: "Đăng nhập Google thất bại",
              variant: "danger",
            })
          }
          theme="outline"
          buttonText="Đăng nhập bằng Google"
          size="large"
          width="100%"
        />
      </div>

      {/* Chuyển chế độ */}
      <div className="mt-4 text-md">
        <span>Bạn chưa có tài khoản ? </span>
        <Link
          to={`/register`}
          className="text-auth-text-ac font-bold hover:underline cursor-pointer"
        >
          Đăng ký
        </Link>
      </div>

      <Link
        to={`/${path.HOME}`}
        className="text-black text-md hover:text-auth-text-ac hover:underline mt-2"
      >
        Trang chủ
      </Link>
    </div>
  );
};
