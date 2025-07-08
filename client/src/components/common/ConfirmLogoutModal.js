// ConfirmLogoutModal.jsx
import React from "react";

const ConfirmLogoutModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 w-80 shadow-lg text-center">
        <h2 className="text-lg font-semibold mb-4">Xác nhận đăng xuất</h2>
        <p className="text-sm mb-6">Bạn có chắc muốn đăng xuất không?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
