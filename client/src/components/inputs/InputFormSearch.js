import React, { memo } from "react";
import clsx from "clsx";

const InputFormSearch = ({
  label,
  disabled,
  register,
  errors,
  id,
  validate,
  type = "text",
  placeholder,
  defaultValue,
  readOnly,
  wrapperStyle,
  style,
  icon,
  iconPosition = "left",
  onIconClick,
}) => {
  return (
    <div className={clsx("relative w-full", wrapperStyle)}>
      {/* Label nếu có */}
      {label && (
        <label htmlFor={id} className="font-medium mb-1 block">
          {label}
        </label>
      )}

      {/* Ô input + icon */}
      <div className="relative w-full">
        {/* Icon bên trái */}
        {icon && iconPosition === "left" && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute inset-y-0 left-3 flex items-center justify-center text-gray-500"
          >
            {icon}
          </button>
        )}

        <input
          type={type}
          id={id}
          {...register(id, validate)}
          disabled={disabled}
          placeholder={placeholder}
          className={clsx(
            "w-full bg-gray-100 p-3 rounded-xl text-sm border-none focus:outline-none",
            icon && iconPosition === "left" && "pl-10",
            icon && iconPosition === "right" && "pr-10",
            style
          )}
          defaultValue={defaultValue}
          readOnly={readOnly}
        />

        {/* Icon bên phải */}
        {icon && iconPosition === "right" && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-500"
          >
            {icon}
          </button>
        )}
      </div>

      {/* Lỗi nếu có */}
      {errors?.[id] && (
        <small className="text-xs text-red-500 mt-1 block">
          {errors[id]?.message}
        </small>
      )}
    </div>
  );
};

export default memo(InputFormSearch);
