import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRegisterCustomer } from "../../services/auth.api";
import { GlassAlert } from "../../components";

import path from "ultils/path";
import {
  FaUser,
  FaLock,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaCalendar,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { showAlert } from "store/app/appSlice";

export const RegisterForm = () => {
  const dispatch = useDispatch();
  const [payload, setPayload] = useState({
    firstname: "",
    lastname: "",
    mobile: "",
    email: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const navigate = useNavigate();

  const validateInput = () => {
    const err = {};
    if (!payload.firstname.trim()) err.firstname = "Tên không được để trống.";
    if (!payload.lastname.trim()) err.lastname = "Họ không được để trống.";

    if (!payload.email.trim()) err.email = "Email không được để trống.";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(payload.email.trim()))
      err.email = "Email không hợp lệ.";

    if (!payload.mobile.trim()) err.mobile = "SĐT không được để trống.";
    else if (!/^0\d{9}$/.test(payload.mobile)) err.mobile = "SĐT không hợp lệ.";

    if (!payload.dateOfBirth.trim()) {
      err.dateOfBirth = "Ngày sinh không được để trống.";
    } else {
      const dob = new Date(payload.dateOfBirth);
      const today = new Date();
      if (dob > today)
        err.dateOfBirth = "Ngày sinh không được lớn hơn ngày hiện tại.";
    }

    if (!payload.password) err.password = "Mật khẩu không được để trống.";
    else if (payload.password.length < 6)
      err.password = "Mật khẩu tối thiểu 6 ký tự.";

    if (!payload.confirmPassword)
      err.confirmPassword = "Vui lòng nhập lại mật khẩu.";
    else if (payload.confirmPassword !== payload.password)
      err.confirmPassword = "Mật khẩu nhập lại không khớp.";

    if (!agree)
      err.agree = "Bạn cần đồng ý với Điều khoản và Chính sách bảo mật.";

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

    try {
      setLoading(true);
      const res = await apiRegisterCustomer({
        firstName: payload.firstname,
        lastName: payload.lastname,
        dateOfBirth: payload.dateOfBirth,
        phone: payload.mobile,
        email: payload.email,
        password: payload.password,
        accountName: payload.mobile,
      });

      if (res.success) {
        dispatch(
          showAlert({
            title: "Thành công",
            message: "Đăng ký thành công, hãy đăng nhập.",
            variant: "success",
            showConfirmButton: false,
            duration: 1500,
          })
        );

        setPayload({
          firstname: "",
          lastname: "",
          mobile: "",
          email: "",
          dateOfBirth: "",
          password: "",
          confirmPassword: "",
        });
        setAgree(false);
        navigate("/login");
      } else {
        const msg = res.error || res.message || "Đăng ký thất bại";
        if (msg.toLowerCase().includes("email"))
          setErrors({ email: "Email đã được sử dụng." });
        else if (msg.toLowerCase().includes("account"))
          setErrors({ email: "Tài khoản đã tồn tại với email này." });
        else if (msg.toLowerCase().includes("mobile"))
          setErrors({ mobile: "SĐT đã được sử dụng." });
        else
          dispatch(showAlert({ title: "Lỗi", text: msg, variant: "danger" }));
      }
    } catch (error) {
      console.error("Register error:", error);
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không thể đăng ký.",
          variant: "danger",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) =>
    errors[field] && (
      <span className="text-red-500 text-xs">{errors[field]}</span>
    );

  return (
    <div className="w-full h-full lg:w-[500px] flex flex-col items-center justify-center relative overflow-hidden bg-white/50 backdrop-blur-md rounded-3xl shadow-2xl p-4">
      <h1 className="text-3xl font-bold text-black mb-8">Đăng ký tài khoản</h1>

      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* lastName, firstName */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              name="lastname"
              value={payload.lastname}
              onChange={handleInput}
              placeholder="Nhập họ"
              autoComplete="family-name"
              className="pl-10 py-2 border rounded-xl w-full"
            />
            {renderError("lastname")}
          </div>
          <div className="relative flex-1">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              name="firstname"
              value={payload.firstname}
              onChange={handleInput}
              placeholder="Nhập tên"
              autoComplete="given-name"
              className="pl-10 py-2 border rounded-xl w-full"
            />
            {renderError("firstname")}
          </div>
        </div>

        {/* dateOfBirth */}
        <div className="relative">
          <FaCalendar className="absolute left-3 top-3 text-gray-400" />
          <input
            type="date"
            name="dateOfBirth"
            value={payload.dateOfBirth}
            onChange={handleInput}
            autoComplete="bday"
            className="pl-10 pr-2 py-2 border rounded-xl w-full"
          />
          {renderError("dateOfBirth")}
        </div>

        {/* email */}
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            name="email"
            value={payload.email}
            onChange={handleInput}
            placeholder="Nhập email"
            autoComplete="email"
            className="pl-10 py-2 border rounded-xl w-full"
          />
          {renderError("email")}
        </div>

        {/* mobile */}
        <div className="relative">
          <FaPhone className="absolute left-3 top-3 text-gray-400" />
          <input
            type="tel"
            name="mobile"
            value={payload.mobile}
            onChange={handleInput}
            placeholder="Nhập số điện thoại"
            autoComplete="tel-national"
            className="pl-10 py-2 border rounded-xl w-full"
          />
          {renderError("mobile")}
        </div>

        {/* password */}
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={payload.password}
            onChange={handleInput}
            placeholder="Nhập mật khẩu"
            autoComplete="new-password"
            className="pl-10 pr-10 py-2 border rounded-xl w-full"
          />
          <button
            type="button"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute right-3 top-3 text-gray-400 cursor-pointer"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {renderError("password")}
        </div>

        {/* confirm password */}
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={payload.confirmPassword}
            onChange={handleInput}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            className="pl-10 pr-10 py-2 border rounded-xl w-full"
          />
          <button
            type="button"
            aria-label={
              showConfirmPassword
                ? "Ẩn nhập lại mật khẩu"
                : "Hiện nhập lại mật khẩu"
            }
            className="absolute right-3 top-3 text-gray-400 cursor-pointer"
            onClick={() => setShowConfirmPassword((v) => !v)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {renderError("confirmPassword")}
        </div>

        {/* Checkbox for terms agreement */}
        <div className="flex flex-col gap-1 mt-2">
          <label
            htmlFor="agree"
            className="flex items-center gap-2 text-sm cursor-pointer select-none"
          >
            <input
              id="agree"
              type="checkbox"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                if (errors.agree) {
                  setErrors((prev) => ({ ...prev, agree: "" }));
                }
              }}
              className="w-5 h-5 cursor-pointer border border-gray-400 rounded-sm appearance-none  checked:text-black checked:after:content-['✔'] checked:after:flex checked:after:items-center checked:after:justify-center"
            />
            <span className="text-gray-700 leading-snug">
              Tôi đồng ý với tất cả{" "}
              <Link
                to=""
                className="text-auth-text-ac font-semibold hover:underline"
              >
                Điều khoản
              </Link>{" "}
              và{" "}
              <Link
                to=""
                className="text-auth-text-ac font-semibold hover:underline"
              >
                Chính sách bảo mật
              </Link>
              .
            </span>
          </label>
          {renderError("agree")}
        </div>

        <button
          type="submit"
          disabled={loading || !agree}
          className={`bg-button-bg-ac mt-2 hover:bg-button-bg-hv text-white py-2 rounded-xl font-semibold ${
            loading || !agree ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      {/* Switch to login */}
      <div className="mt-4 text-md">
        <Link
          to={`/login`}
          className="text-auth-text-ac font-bold hover:underline cursor-pointer"
        >
          Quay lại đăng nhập
        </Link>
      </div>

      {/* Back to homepage */}
      <Link
        to={`/${path.HOME}`}
        className="text-black text-md hover:text-button-bg-ac hover:underline mt-2"
      >
        Trang chủ
      </Link>
    </div>
  );
};
