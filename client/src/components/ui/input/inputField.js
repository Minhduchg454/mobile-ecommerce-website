// InputField.jsx
import clsx from "clsx";

export const InputField1 = ({
  type = "text", // mặc định là text
  placeholder = "Nhập dữ liệu", // placeholder mặc định
  value = "", // mặc định là rỗng
  onChange = () => {}, // hàm mặc định (tránh crash)
  name = "",
  className,
  error,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={clsx(
          "px-3 py-2 border rounded-md outline-none",
          error ? "border-red-500" : "border-gray-300",
          className
        )}
        {...props}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
