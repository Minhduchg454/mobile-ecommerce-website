import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  apiCreatePaymentAccount,
  apiUpdatePaymentAccount,
  apiGetBank,
} from "../../services/user.api";
import { CloseButton } from "../../components";
import { showAlert } from "store/app/appSlice";
import { FaCheck } from "react-icons/fa";

export const PaymentAccountForm = ({
  onClose,
  userId,
  initialAccount = null,
  onSuccess,
  titleCreate = "Thêm tài khoản ngân hàng", // Đổi title mặc định cho phù hợp
  titleEdit = "Cập nhật tài khoản ngân hàng",
  paFor = "customer",
}) => {
  const dispatch = useDispatch();
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  // Xác định xem đang ở chế độ Sửa hay Thêm mới
  const isEditMode = !!initialAccount?._id;

  const {
    register,
    handleSubmit,
    // watch, // Không cần watch nữa vì chỉ có 1 loại
    // setValue, // Không cần setValue để reset field nữa
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      paType: "BANK", // Luôn mặc định là BANK
      paBeneficiaryName: "",
      paAccountNumber: "",
      bankId: "",
      paIsDefault: false,
    },
    values: initialAccount
      ? {
          paType: "BANK",
          paBeneficiaryName: initialAccount.paBeneficiaryName || "",
          paAccountNumber: initialAccount.paAccountNumber || "",
          bankId: initialAccount.bankId?._id || initialAccount.bankId || "",
          paIsDefault: !!initialAccount.paIsDefault,
        }
      : undefined,
  });

  // Load danh sách ngân hàng
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setLoadingBanks(true);
        const res = await apiGetBank();
        if (res?.success) {
          setBanks(res.banks || []);
        }
      } catch (err) {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: "Không tải được danh sách ngân hàng",
            variant: "danger",
          })
        );
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchBanks();
  }, [dispatch]);

  const handleClose = () => onClose?.();

  const onSubmit = async (data) => {
    if (!userId) {
      dispatch(
        showAlert({ title: "Lỗi", message: "Thiếu User ID", variant: "danger" })
      );
      return;
    }

    try {
      let savedAccount = null;

      // Payload cơ bản (Cưỡng chế paType là BANK)
      const payload = {
        ...data,
        paType: "BANK",
        paFor,
        userId,
        // bankId giữ nguyên từ data
      };

      if (isEditMode) {
        const res = await apiUpdatePaymentAccount(
          {
            paIsDefault: data.paIsDefault,
            userId,
            ...data,
          },
          initialAccount._id
        );

        savedAccount = res?.account || initialAccount;
        if (res?.success) {
          dispatch(
            showAlert({
              title: "Thành công",
              message: "Cập nhật trạng thái thành công",
              variant: "success",
              duration: 1500,
              showConfirmButton: false,
            })
          );
        } else {
          throw new Error(res?.message);
        }
      } else {
        // --- CREATE MODE ---
        const res = await apiCreatePaymentAccount(payload);
        savedAccount = res?.account || null;
        if (res?.success) {
          dispatch(
            showAlert({
              title: "Thành công",
              message: "Thêm tài khoản thành công",
              variant: "success",
              duration: 1500,
              showConfirmButton: false,
            })
          );
          reset();
        } else {
          throw new Error(res?.message);
        }
      }

      onSuccess?.(savedAccount);
      handleClose();
    } catch (e) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: e?.response?.data?.message || e?.message || "Thất bại",
          variant: "danger",
        })
      );
    }
  };

  const labelInput = "text-sm px-2 font-medium";
  const disabledStyle =
    "bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0 border-gray-200";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative border bg-white p-4 md:p-6 rounded-3xl shadow-xl w-full md:w-[500px]"
    >
      <CloseButton onClick={onClose} className="absolute top-3 right-3" />
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
        {isEditMode ? titleEdit : titleCreate}
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 text-sm"
      >
        {/* Đã xóa phần chọn Loại thanh toán (Select paType).
          Code sẽ tự động gửi paType = "BANK" khi submit.
        */}

        {/* Ngân hàng - Luôn hiển thị */}
        <div>
          <label className={labelInput}>
            Ngân hàng {isEditMode ? "(Cố định)" : "*"}
          </label>
          <select
            {...register("bankId", {
              required: !isEditMode && "Vui lòng chọn ngân hàng",
            })}
            disabled={isEditMode} // KHÓA KHI EDIT
            className={`border rounded-xl w-full p-2 mt-1 outline-none transition-all ${
              isEditMode
                ? disabledStyle
                : "focus:border-blue-500 focus:shadow-md"
            }`}
          >
            <option value="">
              {loadingBanks ? "Đang tải..." : "Chọn ngân hàng"}
            </option>
            {banks.map((bank) => (
              <option key={bank._id} value={bank._id}>
                {bank.bankName} ({bank.bankCode})
              </option>
            ))}
          </select>
          {errors.bankId && !isEditMode && (
            <p className="text-red-500 text-xs mt-1 px-2">
              {errors.bankId.message}
            </p>
          )}
        </div>

        {/* Tên thụ hưởng */}
        <div>
          <label className={labelInput}>
            Tên chủ tài khoản {isEditMode ? "(Cố định)" : "*"}
          </label>
          <input
            {...register("paBeneficiaryName", {
              required: !isEditMode && "Vui lòng nhập tên",
            })}
            disabled={isEditMode} // KHÓA KHI EDIT
            className={`border rounded-xl w-full p-2.5 mt-1 outline-none transition-all ${
              isEditMode
                ? disabledStyle
                : "focus:border-blue-500 focus:shadow-md"
            }`}
            placeholder="VD: NGUYEN VAN A"
          />
          {errors.paBeneficiaryName && !isEditMode && (
            <p className="text-red-500 text-xs mt-1 px-2">
              {errors.paBeneficiaryName.message}
            </p>
          )}
        </div>

        {/* Số tài khoản */}
        <div>
          <label className={labelInput}>
            Số tài khoản {isEditMode ? "(Cố định)" : "*"}
          </label>
          <input
            {...register("paAccountNumber", {
              required: !isEditMode && "Vui lòng nhập số tài khoản",
            })}
            disabled={isEditMode} // KHÓA KHI EDIT
            className={`border rounded-xl w-full p-2.5 mt-1 outline-none transition-all ${
              isEditMode
                ? disabledStyle
                : "focus:border-blue-500 focus:shadow-md"
            }`}
            placeholder="VD: 1234567890"
          />
          {errors.paAccountNumber && !isEditMode && (
            <p className="text-red-500 text-xs mt-1 px-2">
              {errors.paAccountNumber.message}
            </p>
          )}
        </div>

        {/* Đặt làm mặc định */}
        <div className="flex items-center px-2 py-2 bg-white rounded-xl mt-1">
          <label className="flex items-center gap-3 cursor-pointer text-sm w-full select-none">
            <span className="relative flex items-center">
              <input
                type="checkbox"
                {...register("paIsDefault")}
                className="peer appearance-none w-5 h-5 border-2 border-gray-400 rounded checked:bg-blue-600 checked:border-blue-600 transition-colors"
              />
              <FaCheck className="absolute text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5 top-1 left-[3px] pointer-events-none" />
            </span>
            <span className="font-medium text-gray-700">
              Đặt làm tài khoản mặc định
            </span>
          </label>
        </div>

        {isEditMode && (
          <p className="text-xs text-gray-400 italic text-center px-4">
            (*) Thông tin tài khoản không thể chỉnh sửa. Nếu có sai sót, vui
            lòng xóa và tạo mới.
          </p>
        )}

        {/* Nút hành động */}
        <div className="flex justify-end mt-4 gap-3 text-sm">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-gray-600"
          >
            Đóng
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!isEditMode && !isValid)}
            className="px-6 py-2 rounded-full bg-button-bg-ac hover:bg-button-bg-hv text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 transition-all"
          >
            {isSubmitting
              ? "Đang xử lý..."
              : isEditMode
              ? "Lưu thay đổi"
              : "Thêm mới"}
          </button>
        </div>
      </form>
    </div>
  );
};
