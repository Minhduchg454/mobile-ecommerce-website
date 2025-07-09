import React from "react";
import CustomSelect from "../inputs/CustomSelect"; // đường dẫn thích hợp

const SelectableList = ({
  title,
  items,
  selectedId,
  onSelect,
  labelField = "productCategoryName",
  valueField = "_id",
}) => {
  const options = items?.map((item) => ({
    value: item[valueField],
    label: item[labelField],
  }));

  const selectedOption =
    options?.find((opt) => opt.value === selectedId) || null;

  return (
    <div className="max-w-[250px]">
      <CustomSelect
        label={title}
        options={options}
        value={selectedOption}
        onChange={(val) => onSelect(val?.value)}
        wrapClassname="w-full"
        placeholder={`-- Chọn ${title.toLowerCase()} --`}
      />
    </div>
  );
};

export default SelectableList;
