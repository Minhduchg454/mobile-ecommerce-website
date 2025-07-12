// Simplified and cleaned Login.js with preserved UI layout
import { GoogleLogin } from "@react-oauth/google";
import React, { useState } from "react";
import { apiRegister, apiLogin } from "apis/user";
import Swal from "sweetalert2";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import path from "ultils/path";
import { useDispatch } from "react-redux";
import { login } from "store/user/userSlice";
import { getCurrent } from "store/user/asyncActions";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaMobileAlt,
  FaLaptop,
  FaTabletAlt,
  FaHeadphones,
} from "react-icons/fa";

const Login = () => {
  const [payload, setPayload] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    mobile: "",
  });
  const [isRegister, setIsRegister] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const validateInput = () => {
    const err = {};
    if (isRegister) {
      if (!payload.firstname.trim()) err.firstname = "Họ không được để trống.";
      if (!payload.lastname.trim()) err.lastname = "Tên không được để trống.";
    }
    if (!payload.email.trim()) err.email = "Email không được để trống.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
      err.email = "Email không hợp lệ.";

    if (isRegister) {
      if (!payload.mobile.trim()) err.mobile = "SĐT không được để trống.";
      else if (!/^0\d{9}$/.test(payload.mobile))
        err.mobile = "SĐT không hợp lệ.";
    }
    if (!payload.password) err.password = "Mật khẩu không được để trống.";
    else if (payload.password.length < 6) err.password = "Tối thiểu 6 ký tự.";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleInput = (e) => {
    setPayload({ ...payload, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInput()) return;

    if (isRegister) {
      const res = await apiRegister({
        firstName: payload.firstname,
        lastName: payload.lastname,
        email: payload.email,
        mobile: payload.mobile,
        password: payload.password,
      });

      if (res.success) {
        Swal.fire(
          "Thành công",
          "Đăng ký thành công, hãy đăng nhập.",
          "success"
        );
        setIsRegister(false);
        setPayload({
          email: "",
          password: "",
          firstname: "",
          lastname: "",
          mobile: "",
        });
        setErrors({});
      } else {
        const msg = res.error || res.mes || "Đăng ký thất bại";
        if (msg.toLowerCase().includes("email"))
          setErrors({ email: "Email đã được sử dụng." });
        else if (msg.toLowerCase().includes("account"))
          setErrors({ email: "Tài khoản đã tồn tại với email này." });
        else if (msg.toLowerCase().includes("mobile"))
          setErrors({ mobile: "SĐT đã được sử dụng." });
        else Swal.fire("Lỗi", msg, "error");
      }
    } else {
      const { firstname, lastname, mobile, ...loginData } = payload;
      const res = await apiLogin(loginData);
      if (res.success && res.token && res.user) {
        dispatch(
          login({
            isLoggedIn: true,
            token: String(res.token),
            userData: res.user,
          })
        );
        dispatch(getCurrent());
        navigate(searchParams.get("redirect") || `/${path.HOME}`);
      } else {
        Swal.fire("Lỗi", res.mes || res.error || "Đăng nhập thất bại", "error");
      }
    }
  };

  const renderError = (field) =>
    errors[field] && (
      <span className="text-red-500 text-xs">{errors[field]}</span>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00afff] relative overflow-hidden">
      <FaMobileAlt className="absolute left-8 top-8 text-white/30 text-6xl animate-bounce-slow" />
      <FaLaptop className="absolute right-8 top-16 text-white/20 text-7xl animate-float" />
      <FaTabletAlt className="absolute left-12 bottom-12 text-white/20 text-5xl animate-float2" />
      <FaMobileAlt className="absolute right-16 bottom-8 text-white/10 text-8xl animate-bounce-slow2" />
      <FaHeadphones className="absolute left-1/2 -translate-x-1/2 top-4 text-white/30 text-5xl animate-float" />

      <div className="w-full max-w-md p-8 bg-white/40 backdrop-blur-sm rounded-xl shadow-2xl flex flex-col items-center z-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          {isRegister ? "Đăng ký tài khoản" : "Đăng nhập"}
        </h1>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="firstname"
                  value={payload.firstname}
                  onChange={handleInput}
                  placeholder="Nhập họ"
                  className="pl-10 py-2 border rounded-xl w-full"
                />
                {renderError("firstname")}
              </div>
              <div className="relative flex-1">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="lastname"
                  value={payload.lastname}
                  onChange={handleInput}
                  placeholder="Nhập tên"
                  className="pl-10 py-2 border rounded-xl w-full"
                />
                {renderError("lastname")}
              </div>
            </div>
          )}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input
              name="email"
              value={payload.email}
              onChange={handleInput}
              placeholder="Nhập Email"
              className="pl-10 py-2 border rounded-xl w-full"
            />
            {renderError("email")}
          </div>
          {isRegister && (
            <div className="relative">
              <FaPhone className="absolute left-3 top-3 text-gray-400" />
              <input
                name="mobile"
                value={payload.mobile}
                onChange={handleInput}
                placeholder="Nhập số điện thoại"
                className="pl-10 py-2 border rounded-xl w-full"
              />
              {renderError("mobile")}
            </div>
          )}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={payload.password}
              onChange={handleInput}
              placeholder="Nhập mật khẩu"
              className="pl-10 pr-10 py-2 border rounded-xl w-full"
            />
            <span
              className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {renderError("password")}
          </div>
          <button
            type="submit"
            className="bg-cyan-600 mt-2 hover:bg-cyan-700 text-white py-2 rounded-xl font-semibold"
          >
            {isRegister ? "Đăng ký" : "Đăng nhập"}
          </button>
        </form>
        {!isRegister && (
          <div className="mt-4 w-full rounded-xl">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const token = credentialResponse.credential;

                // Gửi token về backend để xử lý xác thực và lấy thông tin user
                const res = await fetch(
                  `${process.env.REACT_APP_API_URI}/auth/google`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                  }
                );

                const data = await res.json();

                if (data.success && data.token && data.user) {
                  dispatch(
                    login({
                      isLoggedIn: true,
                      token: String(data.token),
                      userData: data.user,
                    })
                  );
                  dispatch(getCurrent());
                  navigate(searchParams.get("redirect") || `/${path.HOME}`);
                } else {
                  Swal.fire(
                    "Lỗi",
                    data.message || "Đăng nhập Google thất bại",
                    "error"
                  );
                }
              }}
              onError={() => {
                Swal.fire("Lỗi", "Đăng nhập Google thất bại", "error");
              }}
            />
          </div>
        )}
        <div className="mt-4 text-sm">
          {isRegister ? (
            <span
              onClick={() => setIsRegister(false)}
              className="text-black hover:underline cursor-pointer"
            >
              Quay lai đăng nhập
            </span>
          ) : (
            <div>
              <span>Bạn chưa có tài khoản ? </span>
              <span
                onClick={() => setIsRegister(true)}
                className="text-cyan-700 hover:underline cursor-pointer font-bold"
              >
                Đăng ký ngay
              </span>
            </div>
          )}
        </div>
        {!isRegister && (
          <Link
            to={`/${path.HOME}`}
            className="text-black text-sm hover:text-cyan-600 hover:underline mt-2"
          >
            Quay lại trang chủ
          </Link>
        )}
      </div>
    </div>
  );
};

export default Login;
