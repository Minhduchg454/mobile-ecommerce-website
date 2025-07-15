import React from "react";
import CustomSlider1 from "./CustomSlider1"; // Đường dẫn tùy bạn

const FeatureInfoSlider = ({ data }) => {
  return (
    <div className="flex flex-col">
      <h3 className="text-xl font-semibold mb-4">
        Cửa hàng FONE tạo nên mọi sự khác biệt
      </h3>

      <CustomSlider1
        items={data}
        itemWidth={250}
        renderItem={(item) => (
          <div className="h-[200px] flex flex-col justify-center items-center card-default p-2">
            <div
              className="w-[120px] h-[120px] flex items-center justify-center rounded-full text-6xl"
              style={{ color: item.color }}
            >
              {item.icon}
            </div>
            <p className="text-base font-medium text-center">{item.title}</p>
            <p className="text-sm text-gray-600 text-center">
              {item.description}
            </p>
          </div>
        )}
      />
    </div>
  );
};

export default FeatureInfoSlider;
