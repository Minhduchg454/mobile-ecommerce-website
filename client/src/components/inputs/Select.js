import React, { memo } from "react";
import clsx from "clsx";

const Select = ({
  label,
  options = [],
  register,
  errors,
  id,
  validate,
  style,
  fullWidth,
  defaultValue,
}) => {
  return (
    <div className={clsx("flex flex-col gap-2 relative", style)}>
      {label && <label htmlFor={id}>{label}</label>}
      <select
        key={defaultValue || "empty"}
        defaultValue={defaultValue ? String(defaultValue) : ""}
        className={clsx(
          "w-full h-[42px] px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-1 focus:ring-blue-500",
          fullWidth && "w-full",
          style
        )}
        id={id}
        {...register(id, validate)}
      >
        <option value="">---Chọn---</option>
        {options?.map((el) => (
          <option key={el.code} value={el.code}>
            {el.value}
          </option>
        ))}
      </select>
      {errors?.[id] && (
        <small className="text-xs text-red-500">{errors[id]?.message}</small>
      )}
    </div>
  );
};

export default memo(Select);
