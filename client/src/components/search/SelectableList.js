import React from "react";

const SelectableList = ({
  title,
  items,
  selectedId,
  onSelect,
  labelField = "productCategoryName", // Mặc định danh mục
  valueField = "_id",
}) => {
  return (
    <div className="flex flex-col gap-2 max-w-[200px]">
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="px-3 py-2 rounded border text-sm bg-white shadow-sm"
      >
        <option value="">-- Chọn {title.toLowerCase()} --</option>
        {(items || []).map((item) => (
          <option key={item[valueField]} value={item[valueField]}>
            {item[labelField]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectableList;
