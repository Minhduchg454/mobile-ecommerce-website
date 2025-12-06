import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { apiCreateCoupon, apiUpdateCoupon } from "../../services/coupon.api";
import { CloseButton } from "../../components";
import { showAlert } from "store/app/appSlice";
import { formatMoney } from "ultils/helpers";

export const VoucherForm = ({
  onClose,
  initialData = null,
  createdById,
  createdByType = "Shop",
  onCloseSuccess,
  titleCreate = "Thêm voucher mới",
  titleEdit = "Cập nhật voucher",
}) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      couponCode: "",
      couponDescription: "",
      couponDiscountType: "percentage",
      couponDiscount: 0,
      couponStartDate: "",
      couponExpirationDate: "",
      couponUsageLimit: 1,
      couponMinOrderAmount: 0,
      couponMaxDiscountAmount: 0,
      couponIsActive: true,
    },
  });
  const couponDiscountType = watch("couponDiscountType");

  // Nếu có dữ liệu ban đầu (sửa)
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        couponIsActive: initialData.couponIsActive ? "true" : "false",
        couponStartDate: initialData.couponStartDate
          ? new Date(initialData.couponStartDate).toISOString().slice(0, 10)
          : "",
        couponExpirationDate: initialData.couponExpirationDate
          ? new Date(initialData.couponExpirationDate)
              .toISOString()
              .slice(0, 10)
          : "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        couponIsActive: data.couponIsActive === "true",
        createdById,
        createdByType,
      };
      let res;

      if (initialData) {
        const {
          createdById,
          createdByType,
          isDeleted,
          deletedAt,
          ...updateData
        } = payload;
        res = await apiUpdateCoupon(initialData._id, updateData);
      } else {
        res = await apiCreateCoupon(payload);
      }

      if (res?.success) {
        dispatch(
          showAlert({
            title: "Thành công",
            message: res.message || "Thao tác thành công",
            variant: "success",
            duration: 1500,
            showConfirmButton: false,
          })
        );
        onCloseSuccess?.(res.coupon);
        onClose?.();
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res?.message || "Không thể lưu voucher",
            variant: "danger",
          })
        );
      }
    } catch (err) {
      console.error("VoucherForm error:", err);
      dispatch(
        showAlert({
          title: "Lỗi",
          message: err?.message || "Thao tác thất bại",
          variant: "danger",
        })
      );
    }
  };

  const labelInput = "text-sm px-2";

  // Xử lý nhập liệu số tiền
  const handleMoneyChange = (e, onChange) => {
    const raw = e.target.value.replace(/\D/g, "");
    onChange(Number(raw || 0));
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative bg-white p-2 md:p-4 border rounded-3xl shadow-md w-full md:w-[500px]"
    >
      <CloseButton onClick={onClose} className="absolute top-2 right-2" />
      <h2 className="text-lg font-bold mb-4 text-center">
        {initialData ? titleEdit : titleCreate}
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 text-sm"
      >
        {/* Mã voucher */}
        <div>
          <label className={labelInput}>Mã voucher *</label>
          <input
            {...register("couponCode", { required: "Vui lòng nhập mã" })}
            className="border rounded-xl w-full p-2 mt-1"
            placeholder="Ví dụ: SALE20, FREESHIP100..."
            disabled={!!initialData}
          />
          {errors.couponCode && (
            <p className="text-red-500 text-xs">{errors.couponCode.message}</p>
          )}
        </div>

        {/* Mô tả */}
        <div>
          <label className={labelInput}>Mô tả</label>
          <textarea
            {...register("couponDescription")}
            className="border rounded-xl w-full p-2 mt-1"
            placeholder="Mô tả ngắn gọn: giảm 30k cho đơn từ 200k..."
            rows={2}
          />
        </div>

        {/* Loại giảm giá + Giá trị */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className={labelInput}>Loại giảm giá *</label>
            <select
              {...register("couponDiscountType", { required: true })}
              className="border rounded-xl w-full p-2 mt-1"
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed_amount">Giá trị cố định</option>
            </select>
          </div>

          <div className="flex-1">
            <label className={labelInput}>
              Giá trị giảm {couponDiscountType === "percentage" ? "%" : "vnđ"}*
            </label>
            {couponDiscountType === "percentage" ? (
              <input
                type="number"
                {...register("couponDiscount", {
                  required: "Vui lòng nhập giá trị giảm",
                  min: { value: 0, message: "Phải >= 0" },
                })}
                className="border rounded-xl w-full p-2 mt-1"
              />
            ) : (
              <Controller
                name="couponDiscount"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <input
                    type="text"
                    inputMode="numeric"
                    className="border rounded-xl w-full p-2 mt-1"
                    value={formatMoney(value)}
                    onChange={(e) => handleMoneyChange(e, onChange)}
                    placeholder="VD: 50.000"
                  />
                )}
              />
            )}
          </div>
        </div>

        {/* Ngày bắt đầu - hết hạn */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className={labelInput}>Ngày bắt đầu</label>
            <input
              type="date"
              {...register("couponStartDate")}
              className="border rounded-xl w-full p-2 mt-1"
            />
          </div>
          <div className="flex-1">
            <label className={labelInput}>Ngày hết hạn *</label>
            <input
              type="date"
              {...register("couponExpirationDate", {
                required: "Vui lòng chọn ngày hết hạn",
              })}
              className="border rounded-xl w-full p-2 mt-1"
            />
            {errors.couponExpirationDate && (
              <p className="text-red-500 text-xs">
                {errors.couponExpirationDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Giới hạn lượt dùng + Đơn hàng tối thiểu */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className={labelInput}>Giới hạn lượt dùng</label>
            <input
              type="number"
              {...register("couponUsageLimit")}
              className="border rounded-xl w-full p-2 mt-1"
            />
          </div>

          <div className="flex-1">
            <label className={labelInput}>Đơn hàng tối thiểu (đ)</label>
            <Controller
              name="couponMinOrderAmount"
              control={control}
              render={({ field: { value, onChange } }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  className="border rounded-xl w-full p-2 mt-1"
                  value={formatMoney(value)}
                  onChange={(e) => handleMoneyChange(e, onChange)}
                  placeholder="VD: 200.000"
                />
              )}
            />
          </div>
        </div>

        {/* Giảm tối đa + Trạng thái */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className={labelInput}>Giảm tối đa (đ)</label>
            <Controller
              name="couponMaxDiscountAmount"
              control={control}
              render={({ field: { value, onChange } }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  className="border rounded-xl w-full p-2 mt-1"
                  value={formatMoney(value)}
                  onChange={(e) => handleMoneyChange(e, onChange)}
                  placeholder="VD: 100.000"
                />
              )}
            />
          </div>

          <div className="flex-1">
            <label className={labelInput}>Trạng thái</label>
            <select
              {...register("couponIsActive")}
              className="border rounded-xl w-full p-2 mt-1"
            >
              <option value="true">Hoạt động</option>
              <option value="false">Vô hiệu hóa</option>
            </select>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end mt-3 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded-3xl border hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1 rounded-3xl bg-button-bg-ac hover:bg-button-bg-hv text-white disabled:opacity-50"
          >
            {isSubmitting
              ? "Đang lưu..."
              : initialData
              ? "Cập nhật"
              : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
};
