// src/components/address/AddressFormModal.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  apiCreateAddress,
  apiUpdateAddress,
  apiDeleteAddress,
} from "../../services/user.api";

import { CloseButton } from "../../components";
import { showAlert } from "store/app/appSlice";

const chWidth = (len, min = 3, max = 40, extraPx = 15) =>
  `calc(${Math.min(max, Math.max(min || 0, len || 0))}ch + ${extraPx}px)`;

const rowCls =
  "flex justify-between items-center gap-3 pb-2 border-b border-gray-200 mt-1";
const labelCls = "text-sm md:text-base text-gray-700";
const inputCls =
  "inline-block rounded-lg bg-button-bg px-2 py-1 text-right outline-none focus:ring-2 focus:ring-blue-400 transition w-fit";

export const AddressFormModal = ({
  open,
  onClose,
  userId,
  initialAddress = null,
  onSuccess,
  titleCreate = "Thêm địa chỉ mới",
  titleEdit = "Cập nhật địa chỉ",
}) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      addressUserName: "",
      addressNumberPhone: "",
      addressStreet: "",
      addressWard: "",
      addressDistrict: "",
      addressCity: "",
      addressCountry: "Việt Nam",
      addressIsDefault: false,
    },
    values: initialAddress
      ? {
          addressUserName: initialAddress.addressUserName || "",
          addressNumberPhone: initialAddress.addressNumberPhone || "",
          addressStreet: initialAddress.addressStreet || "",
          addressWard: initialAddress.addressWard || "",
          addressDistrict: initialAddress.addressDistrict || "",
          addressCity: initialAddress.addressCity || "",
          addressCountry: initialAddress.addressCountry || "Việt Nam",
          addressIsDefault: !!initialAddress.addressIsDefault,
        }
      : undefined,
  });

  const phoneRegex = /^(?:\+?84|0)(\d{8,10})$/;

  const vName = watch("addressUserName");
  const vPhone = watch("addressNumberPhone");
  const vStreet = watch("addressStreet");
  const vWard = watch("addressWard");
  const vDistrict = watch("addressDistrict");
  const vCity = watch("addressCity");
  const vCountry = watch("addressCountry");

  if (!open) return null;

  const handleClose = () => {
    onClose?.();
    // không reset cứng để khi mở lại (edit) vẫn giữ values từ props
  };

  const onSubmit = async (vals) => {
    if (!userId) {
      return dispatch(
        showAlert({
          title: "Thiếu thông tin",
          message: "Không xác định được người dùng",
          variant: "danger",
        })
      );
    }

    try {
      if (initialAddress?._id) {
        await apiUpdateAddress({ ...vals, userId }, initialAddress._id);
        dispatch(
          showAlert({
            title: "Thành công",
            message: "Cập nhật địa chỉ xong",
            variant: "success",
            duration: 1500,
          })
        );
      } else {
        await apiCreateAddress({ ...vals, userId });
        dispatch(
          showAlert({
            title: "Thành công",
            message: "Thêm địa chỉ xong",
            variant: "success",
            duration: 1500,
          })
        );
        reset(); // tạo xong thì reset
      }
      onSuccess?.(); // để parent fetch lại
      handleClose();
    } catch (e) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: e?.response?.data?.message || "Lưu địa chỉ thất bại",
          variant: "danger",
        })
      );
    }
  };

  const onDelete = async () => {
    if (!initialAddress?._id) return;
    if (!window.confirm("Xoá địa chỉ này?")) return;
    try {
      await apiDeleteAddress(initialAddress._id, userId);
      dispatch(
        showAlert({
          title: "Đã xoá",
          message: "Xoá địa chỉ thành công",
          variant: "success",
          duration: 1200,
        })
      );
      onSuccess?.();
      handleClose();
    } catch (e) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: e?.response?.data?.message || "Xoá địa chỉ thất bại",
          variant: "danger",
        })
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-white backdrop-blur rounded-3xl shadow-xl w-full max-w-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {initialAddress?._id ? titleEdit : titleCreate}
          </h3>

          <CloseButton className="top-4 right-4" onClick={handleClose} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <div className="bg-app-bg border rounded-xl p-3 text-base">
            <div className={rowCls}>
              <label className={labelCls}>Tên người nhận</label>
              <input
                className={inputCls}
                placeholder="VD: Nguyễn Văn A"
                style={{ width: chWidth(vName?.length, 6, 26) }}
                {...register("addressUserName", {
                  required: "Vui lòng nhập tên người nhận",
                  validate: (v) => v.trim().length > 0 || "Không được để trống",
                })}
              />
            </div>
            {errors.addressUserName && (
              <p className="text-xs text-red-600 text-right">
                {errors.addressUserName.message}
              </p>
            )}

            <div className={rowCls}>
              <label className={labelCls}>Số điện thoại</label>
              <input
                className={inputCls}
                placeholder="VD: 0909xxxxxx"
                style={{ width: chWidth(vPhone?.length, 10, 18) }}
                {...register("addressNumberPhone", {
                  required: "Vui lòng nhập số điện thoại",
                  pattern: {
                    value: phoneRegex,
                    message: "Số điện thoại không hợp lệ",
                  },
                })}
              />
            </div>
            {errors.addressNumberPhone && (
              <p className="text-xs text-red-600 text-right">
                {errors.addressNumberPhone.message}
              </p>
            )}

            <div className={rowCls}>
              <label className={labelCls}>Địa chỉ/Đường</label>
              <input
                className={inputCls}
                placeholder="Nhà trọ An Khang, phòng số 1"
                style={{ width: chWidth(vStreet?.length, 10, 34) }}
                {...register("addressStreet", {
                  required: "Vui lòng nhập địa chỉ/đường",
                  validate: (v) => v.trim().length > 0 || "Không được để trống",
                })}
              />
            </div>
            {errors.addressStreet && (
              <p className="text-xs text-red-600 text-right">
                {errors.addressStreet.message}
              </p>
            )}

            <div className={rowCls}>
              <label className={labelCls}>Phường/Xã</label>
              <input
                className={inputCls}
                placeholder="VD: An Khánh"
                style={{ width: chWidth(vWard?.length, 6, 20) }}
                {...register("addressWard", {
                  required: "Vui lòng nhập phường/xã",
                })}
              />
            </div>
            {errors.addressWard && (
              <p className="text-xs text-red-600 text-right">
                {errors.addressWard.message}
              </p>
            )}

            <div className={rowCls}>
              <label className={labelCls}>Quận/Huyện</label>
              <input
                className={inputCls}
                placeholder="VD: Ninh Kiều"
                style={{ width: chWidth(vDistrict?.length, 6, 20) }}
                {...register("addressDistrict", {
                  required: "Vui lòng nhập quận/huyện",
                })}
              />
            </div>
            {errors.addressDistrict && (
              <p className="text-xs text-red-600 text-right">
                {errors.addressDistrict.message}
              </p>
            )}

            <div className={rowCls}>
              <label className={labelCls}>Thành phố/Tỉnh</label>
              <input
                className={inputCls}
                placeholder="VD: Cần Thơ"
                style={{ width: chWidth(vCity?.length, 6, 18) }}
                {...register("addressCity", {
                  required: "Vui lòng nhập thành phố/tỉnh",
                })}
              />
            </div>
            {errors.addressCity && (
              <p className="text-xs text-red-600 text-right">
                {errors.addressCity.message}
              </p>
            )}

            <div className={rowCls}>
              <label className={labelCls}>Quốc gia</label>
              <input
                className={inputCls}
                placeholder="Việt Nam"
                style={{ width: chWidth(vCountry?.length, 6, 16) }}
                {...register("addressCountry", {
                  required: "Vui lòng nhập quốc gia",
                })}
              />
            </div>
            {errors.addressCountry && (
              <p className="text-xs text-red-600 text-right">
                {errors.addressCountry.message}
              </p>
            )}

            <div className="flex justify-between items-center mt-2">
              <label className={labelCls + " flex items-center gap-2"}>
                <input
                  type="checkbox"
                  {...register("addressIsDefault")}
                  className="w-5 h-5 cursor-pointer border border-gray-400 rounded-sm appearance-none  checked:text-black checked:after:content-['✔'] checked:after:flex checked:after:items-center checked:after:justify-center"
                />
                Đặt làm địa chỉ mặc định
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-3xl bg-gray-200 hover:bg-gray-300 ml-auto"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`px-4 py-2 rounded-3xl text-white ${
                !isValid || isSubmitting
                  ? "bg-blue-400/50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting
                ? "Đang xử lý..."
                : initialAddress?._id
                ? "Cập nhật"
                : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
