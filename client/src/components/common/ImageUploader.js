import React, { useRef } from "react";
import { CloseButton } from "../../components";

/**
 * @param {boolean} multiple - true: nhiều file, false: 1 file
 * @param {File[] | File | null} value - danh sách file hiện tại (File objects)
 * @param {string[] | string} previews - URL để hiển thị (server URL hoặc blob URL)
 * @param {(files: File[] | File | null) => void} onChange
 * @param {string} label - Nhãn hiển thị, ví dụ: "Tải ảnh"
 * @param {string} acceptType - Loại file chấp nhận, Mặc định là 'image/*'. Ví dụ: 'video/*' hoặc 'image/*, video/*'
 */
export const ImageUploader = ({
  multiple = false,
  value = [],
  previews = [],
  onChange,
  label = "Tải ảnh",
  acceptType = "image/*",
}) => {
  const inputRef = useRef(null);

  const previewUrls = Array.isArray(previews)
    ? previews
    : previews
    ? [previews]
    : [];

  const getFileType = (url, fileObject) => {
    // 1. Kiểm tra từ File Object (tải lên mới)
    if (fileObject) {
      if (typeof fileObject.type === "string") {
        return fileObject.type.startsWith("video/") ? "video" : "image";
      }
    }
    // 2. Kiểm tra từ URL (dữ liệu cũ/blob URL)
    if (typeof url === "string") {
      // [Suy luận] Kiểm tra phần mở rộng cho các URL phổ biến
      if (url.match(/\.(mp4|mov|avi|wmv|flv|webm)(\?|$)/i)) return "video";
    }
    return "image"; // Mặc định là ảnh
  };

  const handleFiles = (files) => {
    if (!files?.length) return;

    const acceptedMainTypes = acceptType
      .split(",")
      .map((t) => t.trim().split("/")[0]);

    const list = Array.from(files).filter((f) => {
      const fileMainType = f.type.split("/")[0];
      return acceptedMainTypes.includes(fileMainType);
    });

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
      className="flex flex-col justify-between border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
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
        // Nếu chỉ có 1 file thì căn giữa
        previewUrls.length === 1 ? (
          <div className="flex justify-center">
            <div className="relative aspect-video rounded-lg overflow-hidden border max-w-md w-full">
              {getFileType(previewUrls[0], multiple ? null : value) ===
              "video" ? (
                <video
                  src={previewUrls[0]}
                  controls
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={previewUrls[0]}
                  alt="preview"
                  className="w-full h-full object-contain"
                />
              )}

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
            {previewUrls.map((src, idx) => {
              // [Suy luận] Lấy file object tương ứng từ mảng value
              const fileObject = Array.isArray(value) ? value[idx] : null;
              const isVideo = getFileType(src, fileObject) === "video";

              return (
                <div
                  key={idx}
                  className="relative aspect-video rounded-lg overflow-hidden border"
                >
                  {/* 🚨 SỬA ĐỔI: Phân biệt hiển thị Video/Ảnh cho multiple files */}
                  {isVideo ? (
                    <video
                      src={src}
                      controls
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <img
                      src={src}
                      alt="preview"
                      className="w-full h-full object-contain"
                    />
                  )}

                  <CloseButton
                    className="absolute top-2 right-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                  />
                </div>
              );
            })}
          </div>
        )
      ) : multiple ? (
        // Không có file + mode multiple
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center text-gray-500 text-sm bg-white"
            >
              Chưa có {label}
            </div>
          ))}
        </div>
      ) : (
        // Không có file + single
        <div className="flex justify-center">
          <div className="aspect-video max-w-md w-full flex items-center justify-center text-gray-500 text-sm border border-dashed rounded-xl bg-white">
            Chưa có {label}
          </div>
        </div>
      )}

      {/* Text hướng dẫn */}
      <p className="mt-auto text-center text-sm text-blue-600 ">
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
        accept={acceptType}
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
