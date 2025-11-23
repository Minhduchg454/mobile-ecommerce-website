import React, { memo, useState } from "react";
import avatarDefault from "assets/avatarDefault.png"; // Đổi tên biến import để tránh xung đột
import moment from "moment";
import { renderStarFromNumber } from "ultils/helpers";
import { CloseButton } from "../../components";
import { FaPlay } from "react-icons/fa";

const Comment = ({
  avatar = avatarDefault, // Sử dụng giá trị mặc định đã import
  name = "Anonymous",
  updatedAt,
  comment,
  star,
  images,
  videos,
  variantName,
}) => {
  // State để kiểm soát việc mở/đóng và lưu trữ dữ liệu zoom
  const [isZoomIn, setIsZoomIn] = useState(false);
  const [zoomData, setZoomData] = useState({ url: null, type: null });

  // Hợp nhất logic BẬT/TẮT khi click vào thumbnail
  const handleToggleZoom = (url, type) => {
    // Nếu nội dung đang được zoom là nội dung hiện tại, thì tắt zoom (thu nhỏ)
    if (isZoomIn && zoomData.url === url && zoomData.type === type) {
      setIsZoomIn(false);
      setZoomData({ url: null, type: null });
    } else {
      // Nếu không, bật zoom và đặt dữ liệu mới
      setIsZoomIn(true);
      setZoomData({ url, type });
    }
  };

  const handleCloseZoom = () => {
    setIsZoomIn(false);
    setZoomData({ url: null, type: null });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4">
        <div className="flex-none">
          <img
            src={avatar}
            alt="avatar"
            className="w-[25px] h-[25px] object-cover rounded-full"
          />
        </div>
        <div className="flex flex-col flex-auto">
          <div className="flex flex-col justify-center items-start">
            <h3 className="font-semibold">{name}</h3>
            <span className="text-xs">
              {moment(updatedAt)?.fromNow()} | Phân loại: {variantName}
            </span>
          </div>
          <div className="flex flex-col gap-2 p-4 text-sm mt-2 border border-gray-300 py-2 bg-gray-100 rounded-xl">
            <span className=" flex items-center gap-1">
              <span className="font-semibold">Đánh giá:</span>
              <span className="flex items-center gap-1">
                {renderStarFromNumber(star)?.map((el, index) => (
                  <span key={index}>{el}</span>
                ))}
              </span>
            </span>
            <span className=" flex gap-1">
              <span className="font-semibold">Bình luận:</span>
              <span className="flex items-center gap-1">{comment}</span>
            </span>
            <div className="flex gap-2">
              {/* Video */}
              {videos && (
                <div
                  onClick={() => handleToggleZoom(videos, "video")} // Dùng hàm Bật/Tắt
                  className={`relative w-[80px] h-[80px] flex justify-center items-center overflow-hidden rounded-xl border-2 cursor-pointer hover:opacity-70 transition-all
                ${
                  isZoomIn &&
                  zoomData.url === videos &&
                  zoomData.type === "video"
                    ? "border-blue-500 shadow-lg"
                    : "border-gray-300"
                }`}
                >
                  <video
                    src={videos}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white">
                    <FaPlay className="text-2xl mb-1" />
                    <p className="text-xs">Video</p>
                  </div>
                </div>
              )}
              {/* Ảnh */}
              {images?.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Ảnh ${idx}`}
                  onClick={() => handleToggleZoom(url, "img")} // Dùng hàm Bật/Tắt
                  className={`w-[80px] h-[80px] object-contain rounded-xl border-2 cursor-pointer hover:opacity-70 transition-all
                ${
                  isZoomIn && zoomData.url === url && zoomData.type === "img"
                    ? "border-blue-500 shadow-lg"
                    : "border-gray-300"
                }`}
                />
              ))}
            </div>
            {isZoomIn && zoomData.url && (
              // Container này giờ không còn xử lý đóng khi click khoảng trống nữa
              <div
                // Loại bỏ onClick={handleCloseZoom} ở đây
                className="flex justify-center items-center mt-4 border border-gray-400 rounded-xl bg-white p-2 max-h-[500px] relative group" // Loại bỏ cursor-pointer
              >
                {zoomData.type === "img" ? (
                  <img
                    src={zoomData.url}
                    alt="Zoomed Content"
                    // Không cần e.stopPropagation() vì container không có hàm đóng
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video
                    controls
                    src={zoomData.url}
                    // Không cần e.stopPropagation() vì container không có hàm đóng
                    className="max-w-full max-h-full object-contain"
                    autoPlay
                  ></video>
                )}
                {/* Nút đóng/thu nhỏ hiển thị trên góc phải của nội dung được zoom */}
                <CloseButton
                  className="absolute top-2 right-2"
                  // Chỉ gọi hàm đóng
                  onClick={handleCloseZoom}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phần tử phóng to được hiển thị bên dưới */}
    </div>
  );
};

export default memo(Comment);
