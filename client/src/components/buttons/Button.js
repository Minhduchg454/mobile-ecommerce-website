// Button.js
import React, { memo } from "react";
import { CgSpinner } from "react-icons/cg";
import clsx from "clsx";

const Button = ({
  children,
  handleOnClick,
  className = "",
  fw,
  type = "button",
  disabled,
}) => {
  const hasFlexClass = className.includes("flex");

  return (
    <button
      type={type}
      className={clsx(
        "px-4 py-2 rounded-md font-semibold my-2",
        fw ? "w-full" : "w-fit",
        !className.includes("bg-") && "bg-main",
        !className.includes("text-") && "text-white",
        !hasFlexClass && "flex items-center justify-center",
        className
      )}
      onClick={() => {
        handleOnClick && handleOnClick();
      }}
      disabled={disabled}
    >
      {disabled && (
        <span className="animate-spin mr-2">
          <CgSpinner size={18} />
        </span>
      )}
      {children}
    </button>
  );
};

export default memo(Button);
