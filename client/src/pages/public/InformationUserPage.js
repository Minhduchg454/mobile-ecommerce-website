import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import defaultAvatar from "assets/avatarDefault.png";
import { apiUpdateUser } from "../../services/user.api";
import { apiChangePassword } from "../../services/auth.api";
import { showAlert } from "store/app/appSlice";
import { getCurrent } from "store/user/asyncActions";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { logout } from "store/user/userSlice";
import { useNavigate } from "react-router-dom";
import path from "ultils/path";
import { duration } from "moment";

export const InformationUserPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, updating } = useSelector((state) => state.user);
  const [isShow, setIsShow] = useState(false); // toggle modal

  const GENDER_OPTIONS = [
    { value: "female", label: "Nữ" },
    { value: "male", label: "Nam" },
    { value: "other", label: "Khác" },
  ];

  // ===================== useForm chính (Thông tin chung)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      avatar: null,
      gender: "",
      dateOfBirth: "",
    },
  });

  // ====== AUTO-WIDTH
  const chWidth = (len, min = 3, max = 40, extraPx = 15) =>
    `calc(${Math.min(max, Math.max(min, len || 0))}ch + ${extraPx}px)`;
  const vFirst = watch("firstName");
  const vLast = watch("lastName");
  const vEmail = watch("email");
  const vMobile = watch("mobile");

  // ====== PREVIEW ẢNH
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (!current) return;
    reset({
      firstName: current?.userFirstName || "",
      lastName: current?.userLastName || "",
      email: current?.userEmail || "",
      mobile: current?.userMobile || "",
      avatar: null,
      gender: current?.userGender || "",
      dateOfBirth: current?.userDateOfBirth
        ? current.userDateOfBirth.slice(0, 10)
        : "",
    });
    setAvatarPreview(null);
    clearErrors();
  }, [current, reset, clearErrors]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const phoneRegex = /^(?:\+?84|0)(\d{8,10})$/;

  const maxDOB = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 13);
    return d.toISOString().slice(0, 10);
  }, []);
  const minDOB = "1900-01-01";

  const onSubmit = async (values) => {
    const fd = new FormData();
    fd.append("userFirstName", values.firstName.trim());
    fd.append("userLastName", values.lastName.trim());
    fd.append("userEmail", values.email.trim());
    fd.append("userMobile", values.mobile.trim());
    fd.append("userGender", values.gender || "");
    if (values.dateOfBirth) fd.append("userDateOfBirth", values.dateOfBirth);
    if (values.avatar && values.avatar[0]) {
      fd.append("userAvatar", values.avatar[0]);
    }

    try {
      const res = await apiUpdateUser(fd, current._id);
      if (res.success) {
        dispatch(
          showAlert({
            title: "Thành công",
            message: "Cập nhật thông tin xong",
            variant: "success",
            duration: 1500,
            showConfirmButton: false,
          })
        );
        dispatch(getCurrent());
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res.message || "Cập nhật thất bại",
            variant: "danger",
          })
        );
      }
    } catch (err) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không thể cập nhật thông tin",
          variant: "danger",
        })
      );
      console.error(err);
    }
  };

  const title = "px-3 md:px-4 font-bold mb-1";
  const inputRow =
    "flex justify-between items-center gap-3 pb-2 border-b border-gray-200 mt-1";
  const labelCls = "text-sm md:text-base text-gray-700";
  const inputCls =
    "inline-block rounded-lg bg-button-bg px-2 py-1 text-right outline-none focus:ring-2 focus:ring-blue-400 transition w-fit";
  const readOnlyCls = "text-right text-gray-700";

  const hasErrors = Object.keys(errors || {}).length > 0;
  const submitDisabled = !isDirty || hasErrors || isSubmitting || updating;

  // File watch & validate
  const avatarFiles = watch("avatar");
  const chosenFile = avatarFiles?.[0];
  const fileTooBig = chosenFile && chosenFile.size > 2 * 1024 * 1024;
  const fileBadType =
    chosenFile &&
    ![
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
    ].includes(chosenFile.type);

  useEffect(() => {
    if (!chosenFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(chosenFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [chosenFile]);

  // ===================== 🔵 useForm đổi mật khẩu (RIÊNG BIỆT)
  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    watch: watchPw,
    formState: {
      errors: pwErrors,
      isValid: pwIsValid,
      isDirty: pwIsDirty,
      isSubmitting: pwIsSubmitting,
    },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // toggle ẩn/hiện từng field của modal
  const [showPw, setShowPw] = useState({
    old: false,
    next: false,
    confirm: false,
  });

  // submit đổi mật khẩu: gửi oldPassword, newPassword, uId
  const onSubmitPassword = async (vals) => {
    const { oldPassword, newPassword, confirmPassword } = vals;

    // check confirm ở client để UX tốt hơn
    if (newPassword !== confirmPassword) {
      return dispatch(
        showAlert({
          title: "Không khớp",
          message: "Xác nhận mật khẩu không khớp",
          variant: "danger",
          duration: 2000,
        })
      );
    }

    try {
      const res = await apiChangePassword({
        oldPassword, // đúng key theo API
        newPassword, // đúng key theo API
        uId: current?._id, // gửi kèm user id
      });

      if (res?.success) {
        setIsShow(false);
        resetPw();
        setShowPw({ old: false, next: false, confirm: false });
        dispatch(
          showAlert({
            title: "Thành công",
            message: "Vui lòng đăng nhập lại",
            variant: "success",
            duration: 1500,
            showConfirmButton: false,
          })
        );
        dispatch(logout()); // xoá token, clear redux, purge persist
        navigate(`/${path.LOGIN}`);
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res?.message || "Đổi mật khẩu thất bại.",
            variant: "danger",
          })
        );
      }
    } catch (e) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không thể đổi mật khẩu.",
          variant: "danger",
        })
      );
    }
  };

  // điều kiện disable nút xác nhận trong modal
  const pwDisabled = !pwIsDirty || !pwIsValid || pwIsSubmitting;

  return (
    <div className="w-full relative">
      {/* FORM THÔNG TIN CHUNG */}
      <form
        className="grid grid-cols-12 gap-4"
        onSubmit={handleSubmit(onSubmit)}
        encType="multipart/form-data"
      >
        {/* Phải (Ảnh) */}
        <div className="col-span-12  p-4 ">
          <div className="flex flex-col justify-center items-center gap-2">
            <img
              src={avatarPreview || current?.userAvatar || defaultAvatar}
              alt="avatar"
              className="aspect-square w-28 h-28 object-cover rounded-full border border-gray-300"
            />
            <label
              htmlFor="fileAvatar"
              className="cursor-pointer text-sm text-blue-700 hover:underline"
            >
              Chọn để cập nhật ảnh đại diện
            </label>
            <input
              type="file"
              id="fileAvatar"
              accept="image/*"
              hidden
              onChange={(e) => {
                setValue("avatar", e.target.files, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />
            {chosenFile && (
              <p className="text-xs text-gray-600">
                Tệp: {chosenFile.name} ({Math.round(chosenFile.size / 1024)} KB)
              </p>
            )}
            {fileTooBig && (
              <p className="text-xs text-red-600">
                Ảnh tối đa 2MB. Vui lòng chọn ảnh khác.
              </p>
            )}
            {fileBadType && (
              <p className="text-xs text-red-600">
                Chỉ chấp nhận PNG/JPEG/WEBP/GIF.
              </p>
            )}
          </div>
        </div>

        {/* Trái (Form) */}
        <div className="col-span-12 ">
          <h1 className={title}>Thông tin chung</h1>
          <div className="glass p-3 md:p-4 rounded-3xl mb-4">
            <div className={inputRow}>
              <label className={labelCls}>Tên tài khoản</label>
              <p className={readOnlyCls}>{current?.accountName || "-"}</p>
            </div>

            <div className={inputRow}>
              <label className={labelCls}>Vai trò</label>
              <p className={readOnlyCls}>
                {Array.isArray(current?.roles) && current.roles.length > 0
                  ? current.roles
                      .map((r) => {
                        const map = {
                          customer: "Khách hàng",
                          shop: "Cửa hàng",
                          admin: "Quản trị viên",
                        };
                        return map[r] || r; // nếu không khớp thì giữ nguyên
                      })
                      .join(" | ")
                  : "-"}
              </p>
            </div>

            <div className={inputRow}>
              <label className={labelCls} htmlFor="lastName">
                Họ
              </label>
              <input
                id="lastName"
                type="text"
                className={inputCls}
                placeholder="Nhập họ"
                style={{ width: chWidth(vLast?.length, 5, 20) }}
                {...register("lastName", {
                  required: "Vui lòng nhập họ",
                  maxLength: { value: 50, message: "Tối đa 50 ký tự" },
                  validate: (v) =>
                    v.trim().length > 0 || "Họ không được để trống",
                })}
              />
            </div>
            {errors.lastName && (
              <p className="text-red-600 text-right text-sm">
                {errors.lastName.message}
              </p>
            )}

            <div className={inputRow}>
              <label className={labelCls} htmlFor="firstName">
                Tên
              </label>
              <input
                id="firstName"
                type="text"
                className={inputCls}
                placeholder="Nhập tên"
                style={{ width: chWidth(vFirst?.length, 3, 20) }}
                {...register("firstName", {
                  required: "Vui lòng nhập tên",
                  maxLength: { value: 50, message: "Tối đa 50 ký tự" },
                  validate: (v) =>
                    v.trim().length > 0 || "Tên không được để trống",
                })}
              />
            </div>
            {errors.firstName && (
              <p className="text-red-600 text-right text-sm">
                {errors.firstName.message}
              </p>
            )}

            <div className={inputRow}>
              <label className={labelCls} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={inputCls}
                placeholder="Nhập email"
                style={{ width: chWidth(vEmail?.length, 10, 32) }}
                {...register("email", {
                  required: "Vui lòng nhập Email",
                  pattern: { value: emailRegex, message: "Email không hợp lệ" },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-right text-sm">
                {errors.email.message}
              </p>
            )}

            <div className={inputRow}>
              <label className={labelCls} htmlFor="mobile">
                Số điện thoại
              </label>
              <input
                id="mobile"
                type="tel"
                className={inputCls}
                placeholder="Nhập số điện thoại"
                style={{ width: chWidth(vMobile?.length, 9, 16) }}
                {...register("mobile", {
                  required: "Vui lòng nhập số điện thoại",
                  pattern: {
                    value: phoneRegex,
                    message: "Số điện thoại không hợp lệ",
                  },
                })}
              />
            </div>
            {errors.mobile && (
              <p className="text-red-600 text-right text-sm">
                {errors.mobile.message}
              </p>
            )}

            <div className={inputRow}>
              <label className={labelCls} htmlFor="gender">
                Giới tính
              </label>
              <select
                id="gender"
                className={`${inputCls} text-right`}
                {...register("gender", {
                  validate: (v) =>
                    ["female", "male", "other", ""].includes(v) ||
                    "Giá trị không hợp lệ",
                })}
              >
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.gender && (
              <p className="text-red-600 text-right text-sm">
                {errors.gender.message}
              </p>
            )}

            <div className={inputRow}>
              <label className={labelCls} htmlFor="dateOfBirth">
                Ngày sinh
              </label>
              <input
                id="dateOfBirth"
                type="date"
                className={inputCls}
                min={minDOB}
                max={maxDOB}
                {...register("dateOfBirth", {
                  validate: (v) => {
                    if (!v) return true;
                    if (v < minDOB) return "Ngày sinh quá nhỏ";
                    if (v > maxDOB) return "Bạn phải đủ 13 tuổi";
                    return true;
                  },
                })}
              />
            </div>
            {errors.dateOfBirth && (
              <p className="text-red-600 text-right text-sm">
                {errors.dateOfBirth.message}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                className="px-4 py-1 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
                onClick={() => reset()}
                title="Hoàn tác về giá trị ban đầu"
              >
                Hoàn tác
              </button>
              <button
                type="submit"
                disabled={submitDisabled || fileTooBig || fileBadType}
                className={`px-4 py-1 rounded-xl transition ${
                  submitDisabled || fileTooBig || fileBadType
                    ? "bg-blue-400/50 text-white cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                title={
                  submitDisabled
                    ? "Hãy chỉnh sửa và nhập hợp lệ để lưu"
                    : fileTooBig
                    ? "Ảnh tối đa 2MB"
                    : fileBadType
                    ? "Định dạng ảnh không hỗ trợ"
                    : "Lưu thay đổi"
                }
              >
                {isSubmitting || updating ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          {/* khối đổi mật khẩu */}
          <h1 className={title}>Bảo mật</h1>
          <div className="glass p-3 md:p-4 rounded-3xl">
            <div className={inputRow}>
              <label className={labelCls}>Mật khẩu</label>
              <button
                type="button"
                className="px-3 py-1 rounded-xl bg-button-bg text-black"
                onClick={() => {
                  setIsShow(true);
                  resetPw(); // mở modal là sạch
                  setShowPw({ old: false, next: false, confirm: false });
                }}
              >
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ===================== MODAL ĐỔI MẬT KHẨU (useForm riêng) */}
      {isShow && (
        <div className="fixed inset-0 z-[20] bg-black/40 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white backdrop-blur rounded-3xl shadow-xl w-full max-w-md p-5">
            <h3 className="text-lg font-semibold text-center mb-3 ">
              Đổi mật khẩu
            </h3>

            <form
              onSubmit={handleSubmitPw(onSubmitPassword)}
              className="flex flex-col gap-3"
            >
              <div className="bg-app-bg border rounded-xl p-3 text-base">
                <PasswordFieldRHF
                  name="oldPassword"
                  label="Mật khẩu hiện tại"
                  isShown={showPw.old}
                  toggle={() => setShowPw((s) => ({ ...s, old: !s.old }))}
                  register={registerPw("oldPassword", {
                    required: "Vui lòng nhập mật khẩu hiện tại",
                  })}
                  error={pwErrors.oldPassword?.message}
                />

                <PasswordFieldRHF
                  name="newPassword"
                  label="Mật khẩu mới"
                  isShown={showPw.next}
                  toggle={() => setShowPw((s) => ({ ...s, next: !s.next }))}
                  register={registerPw("newPassword", {
                    required: "Vui lòng nhập mật khẩu mới",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu mới phải từ 6 ký tự",
                    },
                  })}
                  error={pwErrors.newPassword?.message}
                />

                <PasswordFieldRHF
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  isShown={showPw.confirm}
                  toggle={() =>
                    setShowPw((s) => ({ ...s, confirm: !s.confirm }))
                  }
                  register={registerPw("confirmPassword", {
                    required: "Vui lòng xác nhận mật khẩu",
                    validate: (v) =>
                      v === watchPw("newPassword") ||
                      "Xác nhận mật khẩu không khớp",
                  })}
                  error={pwErrors.confirmPassword?.message}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsShow(false);
                    resetPw();
                    setShowPw({ old: false, next: false, confirm: false });
                  }}
                  className="w-1/2 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={pwDisabled}
                  className={`w-1/2 px-4 py-2 rounded-2xl text-white ${
                    pwDisabled
                      ? "bg-blue-400/50 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {pwIsSubmitting ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/** Trường mật khẩu dùng RHF (có ẩn/hiện) */
const PasswordFieldRHF = ({
  name,
  label,
  isShown,
  toggle,
  register,
  error,
}) => {
  return (
    <div className="flex flex-col gap-1 mb-2">
      <div className="relative border-b border-gray-300">
        <input
          id={name}
          type={isShown ? "text" : "password"}
          className="w-full px-3 py-2 pr-10 outline-none bg-app-bg"
          placeholder={label}
          {...register}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
          aria-label={isShown ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {isShown ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
