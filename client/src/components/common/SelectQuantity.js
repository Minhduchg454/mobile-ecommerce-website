import React, { memo } from "react";

const SelectQuantity = ({ quantity, handleQuantity, handleChangeQuantity }) => {
  return (
    <div className="flex border border-gray-300 rounded-md overflow-hidden w-fit">
      {/* Nút "-" */}
      <button
        onClick={() => handleChangeQuantity("minus")}
        className="w-10 text-gray-500 border-r border-gray-300 text-xl hover:bg-gray-100"
      >
        –
      </button>

      {/* Input số */}
      <input
        type="text"
        value={quantity}
        onChange={(e) => handleQuantity(e.target.value)}
        className="w-12 text-center outline-none text-gray-800"
      />

      {/* Nút "+" */}
      <button
        onClick={() => handleChangeQuantity("plus")}
        className="w-10 text-gray-500 border-l border-gray-300 text-xl hover:bg-gray-100"
      >
        +
      </button>
    </div>
  );
};

export default memo(SelectQuantity);
