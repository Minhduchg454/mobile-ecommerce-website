// src/components/ui/Button.jsx
import clsx from "clsx";

export const ButtonCustom = ({
  type = "button", // mặc định là button
  children = "Nút bấm", // text mặc định
  className,
  disabled = false,
  onClick = () => {},
  variant = "primary", // primary | secondary | danger
  iconLeft, // icon nằm bên trái
  iconRight, // icon nằm bên phải
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors duration-200";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary:
      "bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(baseStyle, variants[variant], className)}
      {...props}
    >
      {iconLeft && <span className="w-5 h-5">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className="w-5 h-5">{iconRight}</span>}
    </button>
  );
};
