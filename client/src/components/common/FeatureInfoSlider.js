import React from "react";

const FeatureInfoSlider = ({ data }) => {
  return (
    <div className="flex flex-col ">
      <h3 className="text-xl font-semibold mb-4">
        Vì sao chọn cửa hàng của chúng tôi?
      </h3>

      <div className="flex flex-wrap gap-4 justify-start p-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="sm:w-[150px] md:w-[150px] lg:w-[250px] p-4 flex flex-col justify-center items-center card-default"
          >
            <div
              className="w-14 h-14 mb-3 flex items-center justify-center rounded-full text-2xl"
              style={{ color: item.color }}
            >
              {item.icon}
            </div>
            <p className="text-base font-medium text-center">{item.title}</p>
            <p className="text-sm text-gray-600 text-center">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureInfoSlider;
