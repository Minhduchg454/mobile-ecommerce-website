import React, { memo } from "react";
import clsx from "clsx";

const InputForm = ({
  label,
  disabled,
  register,
  errors,
  id,
  validate,
  type = "text",
  placeholder,
  fullWidth,
  defaultValue,
  readOnly,
  onChange,
  onKeyUp,
  className, // thêm cho wrapper
  inputClassName, // thêm cho input
}) => {
  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      {label && (
        <label className="font-medium" htmlFor={id}>
          {label + ":"}
        </label>
      )}
      <input
        type={type}
        id={id}
        {...register(id, validate)}
        onChange={onChange}
        onKeyUp={onKeyUp}
        disabled={disabled}
        placeholder={placeholder}
        className={clsx(
          "border p-2 my-auto rounded-xl",
          fullWidth && "w-full",
          inputClassName // áp dụng ở đây
        )}
        defaultValue={defaultValue}
        readOnly={readOnly}
      />
      {errors[id] && (
        <small className="text-xs text-red-500">{errors[id]?.message}</small>
      )}
    </div>
  );
};
export default memo(InputForm);
