import React from "react";

const SelectableList = ({ title, items, selectedId, onSelect }) => {
  return (
    <div className="flex flex-col gap-2 max-w-[200px]">
      <label className="font-semibold text-sm">{title}</label>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="px-3 py-2 rounded border text-sm bg-white shadow-sm"
      >
        <option value="">-- Chọn {title.toLowerCase()} --</option>
        {(items || []).map((item) => (
          <option key={item._id} value={item._id}>
            {item.productCategoryName || item.brandName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectableList;
