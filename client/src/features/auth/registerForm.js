import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRegisterCustomer } from "../../services/auth.api";
// ⬇️ thay ShowSwal bằng GlassAlert
import { GlassAlert } from "components";
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

export const RegisterForm = () => {
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
  const navigate = useNavigate();

  // ===== GlassAlert state (thay cho ShowSwal) =====
  const [alert, setAlert] = useState({
    open: false,
    title: "",
    message: "",
    variant: "default",
    showCancelButton: false,
    confirmText: "OK",
    cancelText: "Huỷ",
    onConfirm: undefined,
    onCancel: undefined,
  });

  const showAlert = (opts) =>
    setAlert((prev) => ({
      ...prev,
      open: true,
      title: opts.title || "",
      message: opts.text || opts.message || "",
      variant: opts.variant || "default",
      showCancelButton: !!opts.showCancelButton,
      confirmText: opts.confirmText || "OK",
      cancelText: opts.cancelText || "Huỷ",
      onConfirm: opts.onConfirm,
      onCancel: opts.onCancel,
    }));

  const closeAlert = () =>
    setAlert((prev) => ({
      ...prev,
      open: false,
      onConfirm: undefined,
      onCancel: undefined,
    }));

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
      if (dob > today) {
        err.dateOfBirth = "Ngày sinh không được lớn hơn ngày hiện tại.";
      }
    }

    if (!payload.password) err.password = "Mật khẩu không được để trống.";
    else if (payload.password.length < 6)
      err.password = "Mật khẩu tối thiểu 6 ký tự.";

    if (!payload.confirmPassword)
      err.confirmPassword = "Vui lòng nhập lại mật khẩu.";
    else if (payload.confirmPassword !== payload.password)
      err.confirmPassword = "Mật khẩu nhập lại không khớp.";

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
        // ShowSwal -> GlassAlert (không chặn điều hướng)
        showAlert({
          title: "Thành công",
          text: "Đăng ký thành công, hãy đăng nhập.",
          variant: "success",
          showCancelButton: false,
          confirmText: "OK",
        });
        navigate("/login");
      } else {
        const msg = res.error || res.message || "Đăng ký thất bại";
        if (msg.toLowerCase().includes("email"))
          setErrors({ email: "Email đã được sử dụng." });
        else if (msg.toLowerCase().includes("account"))
          setErrors({ email: "Tài khoản đã tồn tại với email này." });
        else if (msg.toLowerCase().includes("mobile"))
          setErrors({ mobile: "SĐT đã được sử dụng." });
        else showAlert({ title: "Lỗi", text: msg, variant: "danger" });
      }
    } catch (error) {
      console.error("Register error:", error);
      showAlert({
        title: "Lỗi",
        text: "Không thể đăng ký.",
        variant: "danger",
      });
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
        {/* Input lastName, fistName */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              name="lastname"
              value={payload.lastname}
              onChange={handleInput}
              placeholder="Nhập họ"
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
              className="pl-10 py-2 border rounded-xl w-full"
            />
            {renderError("firstname")}
          </div>
        </div>

        {/* Input email */}
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
          <input
            name="email"
            value={payload.email}
            onChange={handleInput}
            placeholder="Nhập email"
            className="pl-10 py-2 border rounded-xl w-full"
          />
          {renderError("email")}
        </div>

        {/* Input mobile */}
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

        {/* Input dateOfBirth */}
        <div className="relative">
          <FaCalendar className="absolute left-3 top-3 text-gray-400" />
          <input
            type="date"
            name="dateOfBirth"
            value={payload.dateOfBirth}
            onChange={handleInput}
            className="pl-10 pr-2 py-2 border rounded-xl w-full"
          />
          {renderError("dateOfBirth")}
        </div>

        {/* Input password */}
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

        {/* Confirm password */}
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type="password"
            name="confirmPassword"
            value={payload.confirmPassword}
            onChange={handleInput}
            placeholder="Nhập lại mật khẩu"
            className="pl-10 py-2 border rounded-xl w-full"
          />
          {renderError("confirmPassword")}
        </div>

        <button
          type="submit"
          className="bg-button-bg-ac mt-2 hover:bg-button-bg-hv text-white py-2 rounded-xl font-semibold"
        >
          Đăng ký
        </button>
      </form>

      {/* Chuyển chế độ */}
      <div className="mt-4 text-md">
        <Link
          to={`/login`}
          className="text-auth-text-ac font-bold hover:underline cursor-pointer"
        >
          Quay lại đăng nhập
        </Link>
      </div>

      {/* Quay lại trang chủ */}
      <Link
        to={`/${path.HOME}`}
        className="text-black text-md hover:text-button-bg-ac hover:underline mt-2"
      >
        Trang chủ
      </Link>

      {/* GlassAlert thay cho ShowSwal */}
      <GlassAlert
        key={alert.open ? "open" : "closed"} // remount để mở được nhiều lần
        open={alert.open}
        title={alert.title}
        message={alert.message}
        variant={alert.variant} // "default" | "success" | "danger"
        showCancelButton={alert.showCancelButton}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={() => {
          if (typeof alert.onConfirm === "function") alert.onConfirm();
          closeAlert();
        }}
        onCancel={() => {
          if (typeof alert.onCancel === "function") alert.onCancel();
          closeAlert();
        }}
        onClose={closeAlert}
      />
    </div>
  );
};
