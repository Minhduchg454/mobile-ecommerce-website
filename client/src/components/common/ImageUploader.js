import React, { useRef } from "react";
import { CloseButton } from "../../components";

/**
 * @param {boolean} multiple - true: nhiều ảnh, false: 1 ảnh
 * @param {File[] | File | null} value - danh sách file hiện tại (cha muốn dùng thì dùng, không bắt buộc)
 * @param {string[] | string} previews - URL để hiển thị (server URL hoặc blob URL do cha tạo)
 * @param {(files: File[] | File | null) => void} onChange
 *        - multiple = false => onChange(File | null)
 *        - multiple = true  => onChange(File[] hoặc [] nếu xoá hết)
 */
export const ImageUploader = ({
  multiple = false,
  value = [],
  previews = [],
  onChange,
  label = "Tải ảnh",
}) => {
  const inputRef = useRef(null);

  const previewUrls = Array.isArray(previews)
    ? previews
    : previews
    ? [previews]
    : [];

  const handleFiles = (files) => {
    if (!files?.length) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    // Không tạo blob ở đây, cha sẽ xử lý
    if (multiple) onChange?.(list);
    else onChange?.(list[0]);
  };

  const handleRemove = (index) => {
    if (multiple) {
      const remainingFiles = Array.isArray(value)
        ? value.filter((_, i) => i !== index)
        : [];
      onChange?.(remainingFiles);
    } else {
      onChange?.(null);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
      onClick={() => inputRef.current?.click()}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFiles(e.dataTransfer.files);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Vùng preview */}
      {previewUrls.length > 0 ? (
        // Nếu chỉ có 1 ảnh thì căn giữa, còn nhiều ảnh thì dùng grid như cũ
        previewUrls.length === 1 ? (
          <div className="flex justify-center">
            <div className="relative aspect-video rounded-lg overflow-hidden border max-w-md w-full">
              <img
                src={previewUrls[0]}
                alt="preview"
                className="w-full h-full object-contain"
              />
              <CloseButton
                className="absolute top-2 right-2 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(0);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {previewUrls.map((src, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-lg overflow-hidden border"
              >
                <img
                  src={src}
                  alt="preview"
                  className="w-full h-full object-contain"
                />
                <CloseButton
                  className="absolute top-2 right-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                />
              </div>
            ))}
          </div>
        )
      ) : multiple ? (
        // Không có ảnh + mode multiple => 2 khung "Chưa có banner" như cũ
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center text-gray-500 text-sm bg-white"
            >
              Chưa có banner
            </div>
          ))}
        </div>
      ) : (
        // Không có ảnh + single => 1 khung "Chưa có ảnh"
        <div className="aspect-video max-w-md w-full flex items-center justify-center text-gray-500 text-sm border border-dashed rounded-xl bg-white">
          Chưa có ảnh
        </div>
      )}

      {/* Text hướng dẫn */}
      <p className="text-center text-sm text-blue-600 mt-2">
        Kéo thả {multiple ? "nhiều" : "một"} {label} vào đây hoặc
        <span
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="underline cursor-pointer ml-1"
        >
          chọn file
        </span>
      </p>

      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};
