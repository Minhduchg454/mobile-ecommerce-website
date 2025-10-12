import ReactDOM from "react-dom";

import React, { useEffect, useRef } from "react";

function Portal({ children }) {
  const elRef = useRef(document.createElement("div")); // Tái sử dụng div

  useEffect(() => {
    const el = elRef.current;
    document.body.appendChild(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  return ReactDOM.createPortal(children, elRef.current);
}

export default Portal;

export const GlassAlert = ({
  open,
  title = "Thông báo",
  message = "",
  onConfirm,
  onCancel,
  onClose,
  confirmText = "Đồng ý",
  cancelText = "Huỷ",
  showConfirmButton = true,
  showCancelButton = false,
  variant = "default", // default | success | danger
}) => {
  if (!open) return null;

  const variantColor =
    {
      default: "bg-button-bg-ac hover:bg-blue-700",
      success: "bg-green-600 hover:bg-green-700",
      danger: "bg-red-600 hover:bg-red-700",
    }[variant] || "bg-blue-600 hover:bg-blue-700";

  return (
    <Portal>
      <div className="fixed inset-0  bg-black/20 flex items-center justify-center z-50">
        <div className="bg-white/60 backdrop-blur-sm border rounded-2xl shadow-lg p-5 w-[min(80vw,350px)]">
          <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
          {message && (
            <p className="text-sm text-gray-700 mb-4 text-center">{message}</p>
          )}
          <div className="w-full flex justify-end gap-2">
            {showCancelButton && (
              <button
                onClick={onCancel || onClose}
                className="w-full
                 px-4 py-1 bg-button-bg hover:bg-gray-300 rounded-2xl text-black shadow-md"
              >
                {cancelText}
              </button>
            )}
            {showConfirmButton && (
              <button
                onClick={onConfirm || onClose}
                className={`w-full px-4 py-1 ${variantColor} text-white rounded-2xl shadow-sm`}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};
