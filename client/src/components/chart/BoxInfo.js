import React from "react";

const BoxInfo = ({
  text,
  icon,
  number,
  className,
  showTimeSelector = false,
  timeType,
  onChangeTimeType,
  timeOptions = [],
  selectClassName = "",
  numberClassName = "",
}) => {
  return (
    <div
      className={`p-4 border shadow rounded-xl flex flex-col justify-between h-full ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{text}</span>
        {icon}
      </div>

      {/* Number */}
      <div
        className={`text-2xl font-bold break-words whitespace-normal ${numberClassName}`}
      >
        {number}
      </div>

      {/* Select */}
      {showTimeSelector && (
        <select
          className={`border-none p-1 rounded-xl text-sm text-white hover:text-black mt-2 ${selectClassName}`}
          value={timeType}
          onChange={(e) => onChangeTimeType?.(e.target.value)}
        >
          {timeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default BoxInfo;
