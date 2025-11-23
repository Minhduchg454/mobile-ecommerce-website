import React, { useState } from "react";
import { AiOutlineCopy, AiOutlineCheck } from "react-icons/ai";

export const CopyText = ({
  text,
  className = "",
  size = 15,
  showCheck = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center gap-1 align-middle h-[20px] ${className}`}
    >
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full hover:bg-gray-100 transition text-gray-600 flex items-center justify-center"
        title="Sao chép"
      >
        {copied && showCheck ? (
          <AiOutlineCheck size={size} />
        ) : (
          <AiOutlineCopy size={size} />
        )}
      </button>

      {copied && (
        <span className="text-xs leading-none text-gray-500">Đã sao chép</span>
      )}
    </div>
  );
};
