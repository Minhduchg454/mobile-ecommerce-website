import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

const variants = {
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
};

const CustomToast = ({
  type = "info",
  message = "",
  buttonLabel,
  onButtonClick,
}) => {
  return (
    <div className={clsx("p-3 rounded shadow", variants[type])}>
      <p className="text-sm font-medium">{message}</p>
      {buttonLabel && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="mt-2 px-3 py-1 bg-main text-white rounded hover:bg-red-600 text-sm"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

CustomToast.propTypes = {
  type: PropTypes.oneOf(["success", "error", "info", "warning"]),
  message: PropTypes.string.isRequired,
  buttonLabel: PropTypes.string,
  onButtonClick: PropTypes.func,
};

export default CustomToast;
