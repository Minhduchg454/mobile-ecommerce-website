import ReactDOM from "react-dom";

import React, { useEffect, useRef } from "react";

function Portal({ children }) {
  const elRef = useRef(document.createElement("div"));

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
  zIndexClass = "z-[10000]",
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
      {/* Overlay — thêm onClick để đóng khi ấn ngoài */}
      <div
        className={`fixed inset-0 ${zIndexClass} bg-black/10  flex items-center justify-center transition duration-300 ease-in-out`}
        onClick={onClose}
      >
        {/* Nội dung alert */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white/60 backdrop-blur-sm border  rounded-2xl shadow-md p-5 w-[min(85vw,380px)] "
        >
          <h3 className="text-black text-lg font-semibold mb-2 text-center">
            {title}
          </h3>

          {message && (
            <div className="text-base text-black mb-4 text-center whitespace-pre-line">
              {message}
            </div>
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
                className={`w-full px-4 py-1 ${variantColor} text-white rounded-2xl shadow-sm transition`}
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
