import React, { useState } from "react";
import { CloseButton, Loading } from "../../components";
import { showModal } from "store/app/appSlice";
import { useDispatch } from "react-redux";

export const ReasonModal = ({
  title,
  itemName,
  actionName,
  onSubmit,
  onCancel,
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert(`Vui lòng nhập lý do để ${actionName.toLowerCase()} ${itemName}.`);
      return;
    }

    setIsSubmitting(true);
    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

    try {
      await onSubmit(reason.trim());
      // onSubmit sẽ tự đóng modal và cập nhật trạng thái
    } catch (error) {
      // Lỗi sẽ được xử lý ở ShopManage (nơi gọi onSubmit)
    } finally {
      setIsSubmitting(false);
      // Modal Loading sẽ được đóng bởi onSuccess hoặc onError trong ShopManage
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="relative p-2 md:p-4 bg-white/60 backdrop-blur-sm rounded-3xl border w-[90vw] max-w-[480px]"
    >
      <p className="text-lg text-center font-bold mb-4 line-clamp-1">{title}</p>
      <CloseButton
        className="absolute top-3 right-3"
        onClick={onCancel}
        disabled={isSubmitting}
      />

      <div className="text-sm mb-4">
        <textarea
          rows="4"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={`Nhập lý do chi tiết tại sao ${actionName.toLowerCase()}...`}
          className="w-full p-3 border rounded-xl focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-gray-200 rounded-3xl hover:bg-gray-300 text-sm"
          disabled={isSubmitting}
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className={`px-3 py-1 text-white rounded-3xl text-sm shadow-md transition ${
            isSubmitting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
          }`}
          disabled={isSubmitting}
        >
          Xác nhận {actionName}
        </button>
      </div>
    </div>
  );
};
