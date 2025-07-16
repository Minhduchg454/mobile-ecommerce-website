import React from "react";

const SpecificationSelector = ({
  specifications,
  selectedSpecIds,
  specValues,
  onToggleSpec,
  onChangeValue,
  onRemoveSpec,
  title = "Chọn thông số kỹ thuật",
}) => {
  return (
    <>
      {/* Chọn thông số */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="grid md:grid-cols-3 gap-2">
          {specifications.map((spec) => (
            <label
              key={spec._id}
              className="flex items-center space-x-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedSpecIds.includes(spec._id)}
                onChange={() => onToggleSpec(spec._id)}
              />
              <span>
                {spec.typeSpecifications}
                {spec.unitOfMeasure ? ` (${spec.unitOfMeasure})` : ""}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Nhập giá trị thông số đã chọn */}
      {selectedSpecIds.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Giá trị thông số</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {selectedSpecIds.map((specId) => {
              const spec = specifications.find((s) => s._id === specId);
              return (
                <div key={specId} className="relative">
                  <label className="text-sm font-medium block mb-1">
                    {spec?.typeSpecifications}
                    {spec?.unitOfMeasure && ` (${spec.unitOfMeasure})`}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={specValues[specId] || ""}
                      onChange={(e) => onChangeValue(specId, e.target.value)}
                      className="border border-gray-300 p-2 rounded w-full text-sm pr-8"
                      placeholder={`Nhập ${spec?.typeSpecifications}`}
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveSpec(specId)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"
                      title="Xóa thông số này"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default SpecificationSelector;
