import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { apiUpdateBalance } from "../../services/user.api";
import { showAlert } from "../../store/app/appSlice";
import { CloseButton } from "../../components";
import { formatMoney } from "../../ultils/helpers";

export const BalanceWithdrawForm = ({
  onClose,
  userId,
  balanceFor = "customer",
  currentBalance = 0,
  selectedAccount = null,
  onSuccess,
}) => {
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      amount: 0,
    },
  });

  const amount = watch("amount");

  const handleMoneyChange = (e, onChange) => {
    const raw = e.target.value.replace(/\D/g, "");
    onChange(raw === "" ? 0 : Number(raw));
  };

  const onSubmit = async (data) => {
    const withdrawAmount = Number(data.amount);

    // 1. Validate cơ bản
    if (withdrawAmount <= 0) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Số tiền phải lớn hơn 0",
          variant: "danger",
        })
      );
      return;
    }

    if (withdrawAmount > currentBalance) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Số tiền rút vượt quá số dư hiện tại",
          variant: "danger",
        })
      );
      return;
    }

    if (!selectedAccount) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Vui lòng chọn phương thức thanh toán",
          variant: "danger",
        })
      );
      return;
    }

    try {
      // 2. Chuẩn bị thông tin mô tả giao dịch
      const bankName =
        selectedAccount.bankId?.bankName || selectedAccount.paType; // Vd: Vietcombank hoặc MOMO
      const accNum = selectedAccount.paAccountNumber;
      const description = `Rút tiền về ${bankName} - ${accNum}`;

      // 3. Payload đầy đủ cho Transaction System
      const payload = {
        balanceFor,
        amount: -withdrawAmount, // Số âm để trừ tiền

        // --- THÔNG TIN TRANSACTION ---
        tranType: "withdraw",
        tranDescriptions: description,
        tranRelatedId: selectedAccount._id, // ID tài khoản thụ hưởng để truy vết
        tranRelatedModel: "PaymentAccount",
      };

      const res = await apiUpdateBalance(payload, userId);

      if (res?.success) {
        dispatch(
          showAlert({
            title: "Rút tiền thành công!",
            message: `Đã chuyển ${formatMoney(
              withdrawAmount
            )}đ về tài khoản thụ hưởng`,
            variant: "success",
            duration: 3000,
          })
        );
        onSuccess?.();
        onClose?.();
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res?.message || "Có lỗi xảy ra, vui lòng thử lại",
            variant: "danger",
          })
        );
      }
    } catch (err) {
      const msg = err?.message || "Rút tiền thất bại. Vui lòng thử lại.";
      dispatch(
        showAlert({
          title: "Rút tiền thất bại",
          message: msg,
          variant: "danger",
        })
      );
    }
  };

  const labelInput = "text-sm px-2";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative border bg-white p-4 rounded-3xl shadow-md w-full max-w-md mx-auto"
    >
      <CloseButton onClick={onClose} className="absolute top-2 right-2" />

      <h2 className="text-lg font-bold text-center mb-5">
        Rút tiền về tài khoản
      </h2>

      {/* Thông tin tài khoản nhận tiền */}
      {selectedAccount && (
        <div className="bg-gray-50 border rounded-2xl p-2 md:p-4 mb-3 text-sm">
          <p className="font-medium text-gray-700">Chuyển đến:</p>
          <p className="font-semibold mt-1">
            {selectedAccount.paBeneficiaryName}
          </p>
          <p className="text-gray-600">
            {selectedAccount.bankId?.bankName || selectedAccount.paType} •{" "}
            {selectedAccount.paAccountNumber}
            {selectedAccount.paIsDefault && (
              <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                Mặc định
              </span>
            )}
          </p>
        </div>
      )}

      {/* Số dư hiện tại */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 md:p-4 mb-3">
        <p className="text-sm text-gray-600">Số dư khả dụng</p>
        <p className="text-base md:text-xl font-bold text-button-bg-ac">
          {formatMoney(currentBalance)}đ
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div>
          <label className={labelInput}>Số tiền rút (đ) *</label>

          <Controller
            name="amount"
            control={control}
            rules={{
              required: "Vui lòng nhập số tiền",
              min: { value: 10000, message: "Số tiền rút tối thiểu 10.000đ" },
              max: {
                value: currentBalance,
                message: `Không được vượt quá số dư (${formatMoney(
                  currentBalance
                )}đ)`,
              },
            }}
            render={({ field: { value, onChange } }) => (
              <input
                type="text"
                inputMode="numeric"
                className="border rounded-xl w-full p-2 md:p-3 mt-1 text-lg font-medium"
                value={value > 0 ? formatMoney(value) : ""}
                onChange={(e) => handleMoneyChange(e, onChange)}
                placeholder="0"
              />
            )}
          />

          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div className="mt-2 flex justify-end gap-3 text-base md:text-sm">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border rounded-xl hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting || !amount || amount <= 0 || amount > currentBalance
            }
            className="px-3 py-1 bg-button-bg-ac hover:bg-button-bg-hv text-white rounded-xl font-medium disabled:opacity-50 transition"
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận rút tiền"}
          </button>
        </div>
      </form>
    </div>
  );
};
