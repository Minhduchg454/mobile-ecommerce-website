// CloseButton.jsx
import React from "react";

const CloseButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`absolute p-1 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-500 hover:text-white text-gray-800 shadow transition ${className}`}
    >
      ×
    </button>
  );
};
export default CloseButton;
