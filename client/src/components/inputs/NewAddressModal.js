import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { apiCreateAddress, apiUpdateAddress } from "../../apis"; // nếu có update
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchAddresses } from "../../store/user/asyncActions"; // Sửa lại cho đúng đường dẫn

const NewAddressModal = ({
  currentUserId,
  onClose,
  onAddressAdded,
  defaultValues,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();

  // ✅ Reset lại form khi defaultValues thay đổi
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else {
      reset(); // nếu không có thì xóa sạch form
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, userId: currentUserId };

      // Nếu có defaultValues -> đang sửa → gọi API cập nhật
      if (defaultValues?._id) {
        const res = await apiUpdateAddress(defaultValues._id, payload);
        if (res.success) {
          dispatch(fetchAddresses());
          toast.success("Cập nhật địa chỉ thành công");
          onAddressAdded();
          onClose();
          reset();
        } else {
          toast.error("Cập nhật thất bại");
        }
      } else {
        // Thêm mới
        const res = await apiCreateAddress(payload);
        if (res.success) {
          dispatch(fetchAddresses());
          toast.success("Đã thêm địa chỉ mới");
          onAddressAdded();
          onClose();
          reset();
        } else {
          toast.error("Không thể thêm địa chỉ");
        }
      }
    } catch (error) {
      toast.error("Lỗi khi gửi yêu cầu");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md p-6 relative">
        <h2 className="text-xl font-semibold mb-4">
          {defaultValues ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("street", { required: "Không được để trống" })}
            placeholder="Địa chỉ (số nhà, đường...)"
            className="input w-full p-2 border rounded-xl"
          />
          {errors.street && (
            <p className="text-red-500 text-sm">{errors.street.message}</p>
          )}

          <input
            {...register("ward", { required: "Không được để trống" })}
            placeholder="Phường/Xã"
            className="input w-full p-2 border rounded-xl"
          />
          {errors.ward && (
            <p className="text-red-500 text-sm">{errors.ward.message}</p>
          )}

          <input
            {...register("district", { required: "Không được để trống" })}
            placeholder="Quận/Huyện"
            className="input w-full p-2 border rounded-xl"
          />
          {errors.district && (
            <p className="text-red-500 text-sm">{errors.district.message}</p>
          )}

          <input
            {...register("country", { required: "Không được để trống" })}
            placeholder="Tỉnh/Thành phố"
            className="input w-full p-2 border rounded-xl"
          />
          {errors.country && (
            <p className="text-red-500 text-sm">{errors.country.message}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="mr-2">
              Hủy
            </button>
            <button
              type="submit"
              className="btn bg-main text-white p-2 rounded-xl"
            >
              {defaultValues ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAddressModal;
