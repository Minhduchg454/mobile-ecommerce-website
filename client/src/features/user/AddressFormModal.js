import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { apiCreateAddress, apiUpdateAddress } from "../../services/user.api";
import { CloseButton } from "../../components";
import { showAlert } from "store/app/appSlice";
import { locations } from "../../ultils/contants";
import { FaCheck } from "react-icons/fa";
import { fetchSellerCurrent } from "store/seller/asynsActions";

export const AddressFormModal = ({
  onClose,
  userId,
  initialAddress = null,
  onSuccess,
  titleCreate = "Thêm địa chỉ mới",
  titleEdit = "Cập nhật địa chỉ",
  addressFor = "customer",
}) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
      addressLatitude: 0,
      addressLongitude: 0,
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
          addressLatitude: initialAddress.addressLatitude || 0,
          addressLongitude: initialAddress.addressLongitude || 0,
          addressIsDefault: !!initialAddress.addressIsDefault,
        }
      : undefined,
  });

  const phoneRegex = /^(?:\+?84|0)(\d{8,10})$/;

  const vDistrict = watch("addressDistrict");
  const vCity = watch("addressCity");

  const provinces = Object.keys(locations);
  const districts = vCity && locations[vCity] ? locations[vCity].districts : [];

  // Lắng nghe thay đổi Thành phố để gán tọa độ
  React.useEffect(() => {
    if (vCity && locations[vCity]) {
      const cityData = locations[vCity];

      const lat = cityData.center?.lat || 0;
      const lng = cityData.center?.lng || 0;

      setValue("addressLatitude", lat, { shouldValidate: true });
      setValue("addressLongitude", lng, { shouldValidate: true });
    } else {
      setValue("addressLatitude", 0, { shouldValidate: true });
      setValue("addressLongitude", 0, { shouldValidate: true });
    }
  }, [vCity, setValue]);

  // Logic xử lý Quận/Huyện khi Thành phố thay đổi (từ initialAddress)
  React.useEffect(() => {
    if (vCity && initialAddress?.addressDistrict) {
      if (districts.includes(initialAddress.addressDistrict)) {
        setValue("addressDistrict", initialAddress.addressDistrict);
      } else {
        setValue("addressDistrict", "");
      }
    }
  }, [vCity, initialAddress, districts, setValue]);

  // Logic reset Quận/Huyện nếu không hợp lệ
  React.useEffect(() => {
    if (vCity && !districts.includes(vDistrict)) {
      setValue("addressDistrict", "");
    }
  }, [vCity, vDistrict, setValue, districts]);

  const handleClose = () => {
    onClose?.();
  };

  const onSubmit = async (vals) => {
    // Kiểm tra tọa độ với tên trường mới: addressLatitude và addressLongitude
    if (!vals.addressLatitude || !vals.addressLongitude) {
      return dispatch(
        showAlert({
          title: "Thiếu thông tin",
          message: "Vui lòng chọn Tỉnh/Thành phố để xác định tọa độ",
          variant: "danger",
        })
      );
    }

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
      const payload = {
        ...vals,
        userId,
        addressFor: addressFor || "customer",
      };
      let savedAddress = null;

      if (initialAddress?._id) {
        const res = await apiUpdateAddress(payload, initialAddress._id);
        savedAddress = res?.address || {
          ...initialAddress,
          ...payload,
        };

        dispatch(
          showAlert({
            title: "Thành công",
            message: "Cập nhật địa chỉ xong",
            variant: "success",
            duration: 1500,
            showConfirmButton: false,
          })
        );
      } else {
        const res = await apiCreateAddress(payload);
        savedAddress = res?.address || null;

        dispatch(
          showAlert({
            title: "Thành công",
            message: "Thêm địa chỉ xong",
            variant: "success",
            duration: 1500,
            showConfirmButton: false,
          })
        );
        reset();
      }

      if (addressFor === "shop") {
        dispatch(fetchSellerCurrent(userId));
      }
      onSuccess?.(savedAddress);
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

  const labelInput = "text-sm px-2";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative border bg-white p-2 md:p-4 rounded-3xl shadow-md w-full md:w-[500px]"
    >
      <CloseButton onClick={onClose} className="absolute top-2 right-2" />
      <h2 className="text-lg font-bold mb-4 text-center">
        {initialAddress?._id ? titleEdit : titleCreate}
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 text-sm"
      >
        {/* Tên người nhận */}
        <div>
          <label className={labelInput}>
            {addressFor === "customer" ? "Tên người nhận" : "Tên người gửi"} *
          </label>
          <input
            {...register("addressUserName", {
              required: "Vui lòng nhập tên người nhận",
              validate: (v) => v.trim().length > 0 || "Không được để trống",
            })}
            className="border rounded-xl w-full p-2 mt-1"
            placeholder="VD: Nguyễn Văn A"
          />
          {errors.addressUserName && (
            <p className="text-red-500 text-xs">
              {errors.addressUserName.message}
            </p>
          )}
        </div>

        {/* Số điện thoại */}
        <div>
          <label className={labelInput}>Số điện thoại *</label>
          <input
            {...register("addressNumberPhone", {
              required: "Vui lòng nhập số điện thoại",
              pattern: {
                value: phoneRegex,
                message: "Số điện thoại không hợp lệ",
              },
            })}
            className="border rounded-xl w-full p-2 mt-1"
            placeholder="VD: 0909xxxxxx"
          />
          {errors.addressNumberPhone && (
            <p className="text-red-500 text-xs">
              {errors.addressNumberPhone.message}
            </p>
          )}
        </div>

        {/* Thành phố & Quận/Huyện */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className={labelInput}>Thành phố/Tỉnh *</label>
            <select
              {...register("addressCity", {
                required: "Vui lòng chọn thành phố/tỉnh",
              })}
              className="border rounded-xl w-full p-2 mt-1 h-10"
            >
              <option value="">Chọn thành phố/tỉnh</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.addressCity && (
              <p className="text-red-500 text-xs">
                {errors.addressCity.message}
              </p>
            )}
          </div>

          <div className="flex-1">
            <label className={labelInput}>Quận/Huyện *</label>
            <select
              {...register("addressDistrict", {
                required: "Vui lòng chọn quận/huyện",
              })}
              className="border rounded-xl w-full p-2 mt-1 h-10"
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {errors.addressDistrict && (
              <p className="text-red-500 text-xs">
                {errors.addressDistrict.message}
              </p>
            )}
          </div>
        </div>

        {/* Phường/Xã & Quốc gia */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className={labelInput}>Phường/Xã *</label>
            <input
              {...register("addressWard", {
                required: "Vui lòng nhập phường/xã",
              })}
              className="border rounded-xl w-full p-2 mt-1"
              placeholder="VD: An Khánh"
            />
            {errors.addressWard && (
              <p className="text-red-500 text-xs">
                {errors.addressWard.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className={labelInput}>Quốc gia *</label>
            <input
              {...register("addressCountry", {
                required: "Vui lòng nhập quốc gia",
              })}
              className="border rounded-xl w-full p-2 mt-1"
              placeholder="Việt Nam"
              defaultValue="Việt Nam"
            />
            {errors.addressCountry && (
              <p className="text-red-500 text-xs">
                {errors.addressCountry.message}
              </p>
            )}
          </div>
        </div>

        {/* Địa chỉ chi tiết */}
        <div className="flex-1">
          <label className={labelInput}>Địa chỉ chi tiết *</label>
          <textarea
            {...register("addressStreet", {
              required: "Vui lòng nhập địa chỉ chi tiết",
              validate: (v) => v.trim().length > 0 || "Không được để trống",
            })}
            className="border rounded-xl w-full p-2 mt-1"
            placeholder="Nhà trọ An Khang, phòng số 1"
            rows={3}
          />
          {errors.addressStreet && (
            <p className="text-red-500 text-xs">
              {errors.addressStreet.message}
            </p>
          )}
        </div>

        {/* Trường ẩn lưu trữ tọa độ */}
        <input
          type="hidden"
          {...register("addressLatitude", { valueAsNumber: true })}
        />
        <input
          type="hidden"
          {...register("addressLongitude", { valueAsNumber: true })}
        />

        {/* Đặt làm mặc định */}
        {addressFor === "customer" && (
          <div className="flex-1 flex items-end px-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <span className="relative inline-flex items-center justify-center">
                <input
                  type="checkbox"
                  {...register("addressIsDefault")}
                  className="peer appearance-none w-4 h-4 border border-black rounded-sm"
                />
                <FaCheck className="absolute text-black opacity-0 peer-checked:opacity-100 w-3 h-3" />
              </span>
              Đặt làm mặc định
            </label>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex justify-end mt-3 gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1 rounded-3xl border hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="px-4 py-1 rounded-3xl bg-button-bg-ac hover:bg-button-bg-hv text-white disabled:opacity-50"
          >
            {isSubmitting
              ? "Đang lưu..."
              : initialAddress?._id
              ? "Cập nhật"
              : "Thêm mới"}
          </button>
        </div>
      </form>
    </div>
  );
};
