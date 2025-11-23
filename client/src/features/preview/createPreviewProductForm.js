import React, { useRef, useEffect, useState, useCallback } from "react";
import { voteOptions } from "ultils/contants";
import { AiFillStar } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { showModal, showAlert } from "store/app/appSlice";
import moment from "moment";
import { useMemo } from "react";
import { apiCreatePreview, apiUpdatePreview } from "../../services/preview.api";
import { CloseButton, ImageUploader, Loading } from "../../components";
import { renderStarFromNumber } from "../../ultils/helpers";

export const CreatePreviewProductForm = ({
  orderId,
  pvId,
  customerId,
  deliveryDate,
  expireDays = 3,
  oldPreview,
  onClose,
  isEdited,
}) => {
  const modalRef = useRef();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // State
  const [comment, setComment] = useState("");
  const [score, setScore] = useState(null);
  const [chosenScore, setChosenScore] = useState(null);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  // 1. Logic kiểm tra hết hạn đánh giá
  const isExpired = useMemo(() => {
    if (!deliveryDate) return true;
    const diffDays = moment().diff(moment(deliveryDate), "days");
    return diffDays > expireDays;
  }, [deliveryDate, expireDays, deliveryDate]);

  const isReadOnly = isExpired || isEdited;

  const imagePreviewUrls = useMemo(() => {
    const oldImageUrls = oldPreview?.previewImages || [];
    const newImageUrls = images.map((file) => URL.createObjectURL(file));

    if (oldPreview && images.length === 0) {
      return oldImageUrls;
    }
    return newImageUrls;
  }, [images, oldPreview]);

  const videoPreviewUrl = useMemo(() => {
    if (video) return URL.createObjectURL(video);
    if (oldPreview && !video) return oldPreview.previewVideos;
    return null;
  }, [video, oldPreview]);

  // 3. Logic setup khi mở form hoặc có dữ liệu cũ
  useEffect(() => {
    if (oldPreview) {
      setComment(oldPreview.previewComment || "");
      setScore(oldPreview.previewRate || null);
      setChosenScore(oldPreview.previewRate || null);
    }
    modalRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [oldPreview]);

  // 4. Hàm đóng modal (giữ nguyên)
  const handleClose = useCallback(() => {
    images.forEach((file) => URL.revokeObjectURL(file));
    if (video) URL.revokeObjectURL(video);
    dispatch(showModal({ isShowModal: false }));
    onClose && onClose();
  }, [dispatch, images, video, onClose]);

  useEffect(() => {
    return () => {
      images.forEach((file) => URL.revokeObjectURL(file));
      if (video) URL.revokeObjectURL(video);
    };
  }, [images, video]);

  // 5. Hàm gửi đánh giá (giữ nguyên)
  const handleSubmit = async () => {
    if (!score || score < 1 || score > 5) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Vui lòng chọn số sao đánh giá.",
          durartion: 1500,
        })
      );
      return;
    }

    const formData = new FormData();
    formData.append("previewComment", comment || "");
    formData.append("previewRate", score);
    formData.append("customerId", customerId);
    formData.append("pvId", pvId);
    formData.append("orderId", orderId);

    // Thêm Files mới
    images.forEach((file) => {
      formData.append("previewImages", file);
    });
    if (video) {
      formData.append("previewVideos", video);
    }

    let response;
    try {
      setIsLoading(true);
      if (oldPreview) {
        // Cập nhật: Server sẽ xử lý việc đặt isEdited = true
        if (images.length === 0 && oldPreview.previewImages?.length) {
          oldPreview.previewImages.forEach((url) =>
            formData.append("oldPreviewImages", url)
          );
        }
        if (!video && oldPreview.previewVideos) {
          formData.append("oldPreviewVideos", oldPreview.previewVideos);
        }

        response = await apiUpdatePreview(formData, oldPreview._id);
      } else {
        // Tạo mới
        response = await apiCreatePreview(formData);
      }

      if (response?.success) {
        dispatch(
          showAlert({
            title: "Thành công",
            message: response.message,
            variant: "success",
            showConfirmButton: false,
            durartion: 1500,
          })
        );
        handleClose();
      } else {
        // ... (xử lý lỗi)
        const message =
          response?.message ||
          (oldPreview ? "Cập nhật đánh giá thất bại" : "Tạo đánh giá thất bại");
        dispatch(
          showAlert({ title: "Lỗi", variant: "danger", message: message })
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (oldPreview ? "Cập nhật đánh giá thất bại" : "Tạo đánh giá thất bại");
      dispatch(
        showAlert({ title: "Lỗi", variant: "danger", message: message })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Giao diện
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      ref={modalRef}
      className="bg-white border shadow-md w-[700px] p-6 flex-col gap-2 flex items-center justify-center rounded-3xl relative"
    >
      <CloseButton className="absolute top-2 right-2" onClick={handleClose} />
      <h2 className="text-center text-medium text-xl font-semibold">{`Đánh giá sản phẩm `}</h2>
      {isReadOnly && (
        <div className="w-full text-center text-xs text-gray-500 ">
          {isEdited
            ? "Bạn chỉ được chỉnh sửa đánh giá một lần. Hiện đang ở chế độ xem."
            : `Đã hết hạn đánh giá (giới hạn ${expireDays} ngày sau khi nhận hàng). Hiện đang ở chế độ xem.`}
        </div>
      )}

      {/* Vùng hiển thị nội dung/ảnh cũ (Chế độ xem hoặc Chỉnh sửa) */}
      {oldPreview && (isReadOnly || (!isReadOnly && oldPreview)) ? (
        <div className="w-full p-3 text-black border rounded-xl bg-gray-50">
          <div className="mb-1 flex gap-1 justify-start items-center">
            Đánh giá:{" "}
            <strong className="flex">
              {renderStarFromNumber(oldPreview.previewRate)}
            </strong>
          </div>
          <div className="mb-1">Nội dung: {oldPreview.previewComment}</div>

          {(oldPreview.previewImages?.length > 0 ||
            oldPreview.previewVideos) && (
            <p className="mb-3">Hình ảnh/Video đã gửi:</p>
          )}
          <div className="flex justify-start items-center flex-wrap gap-2">
            {oldPreview.previewVideos && (
              <div className="w-[120px] h-[120px] flex justify-center items-center overflow-hidden rounded-xl border">
                <video
                  controls
                  src={oldPreview.previewVideos}
                  className="w-full h-full object-contain"
                ></video>
              </div>
            )}
            {oldPreview.previewImages?.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Ảnh ${idx}`}
                className="w-[120px] h-[120px] object-contain rounded-xl border"
              />
            ))}
          </div>
        </div>
      ) : (
        // Nếu không có oldPreview và đang ở chế độ chỉnh sửa (tạo mới)
        !isReadOnly && (
          <div className="w-full p-3 text-gray-500 italic border rounded-xl bg-gray-50">
            Bạn đang thực hiện đánh giá lần đầu tiên cho sản phẩm này.
          </div>
        )
      )}

      {/* Vùng đánh giá/Chỉnh sửa (CHỈ HIỂN THỊ KHI CÒN HẠN VÀ CHƯA SỬA LẦN NÀO) */}
      {!isReadOnly && (
        <>
          {/* Input Comment */}
          <textarea
            className="form-textarea rounded-xl w-full placeholder:text-md placeholder:text-gray-500 text-md"
            placeholder="Nhập nội dung đánh giá của bạn..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>

          {/* Chọn sao */}
          <div className="w-full flex flex-col gap-2 text-md">
            <p className="font-medium">
              Bạn cảm thấy sản phẩm này như thế nào?
            </p>
            <div className="flex justify-center gap-4 items-center">
              {voteOptions.map((el) => (
                <div
                  className={`w-[100px] cursor-pointer p-1 flex items-center justify-center flex-col gap-1 transition-colors rounded-full`}
                  key={el.id}
                  onClick={() => setScore(el.id)}
                >
                  <AiFillStar
                    color={Number(score) >= el.id ? "orange" : "gray"}
                    size={24}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Image Uploader */}
          <div className="w-full ">
            <h3 className="font-medium mb-3">Thêm ảnh/video (Tùy chọn)</h3>
            <div className="grid grid-cols-2 gap-4">
              <ImageUploader
                label="Ảnh"
                multiple={true}
                value={images}
                previews={imagePreviewUrls}
                onChange={setImages}
              />
              <ImageUploader
                label="Video"
                multiple={false}
                value={video}
                previews={videoPreviewUrl}
                onChange={setVideo}
                acceptType="video/*"
              />
            </div>
          </div>

          {/* Nút gửi */}
          <div className="w-full flex justify-end gap-3 border-t pt-4 mt-2 text-sm">
            <button
              onClick={handleClose}
              className="w-[80px] rounded-xl px-3 py-1 text-gray-700 bg-button-bg hover:bg-button-hv  transition"
            >
              Thoát
            </button>
            <button
              onClick={handleSubmit}
              disabled={!score}
              className={`min-w-[80px]  rounded-xl px-3 py-1 text-white transition
                        ${
                          score
                            ? "bg-button-bg-ac hover:bg-button-bg-hv"
                            : "bg-gray-400 cursor-not-allowed"
                        }
                    `}
            >
              {oldPreview ? "Cập nhật" : "Gửi"}
            </button>
          </div>
        </>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-20">
          <Loading />
        </div>
      )}
    </div>
  );
};
