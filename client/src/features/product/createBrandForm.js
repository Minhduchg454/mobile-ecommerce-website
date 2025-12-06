// createBrandForm.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { apiCreateBrand, apiUpdateBrand } from "../../services/catalog.api";
import { Loading, CloseButton, ImageUploader } from "../../components";
import { showAlert, showModal } from "store/app/appSlice";
import noPhoto from "../../assets/image-not-found.png";

export const CreateBrandForm = ({
  brand,
  onSuccess,
  onCancel,
  isAdmin = false,
  shopId,
}) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      brandName: brand?.brandName || "",
      brandWebsite: brand?.brandWebsite || "",
      brandDescription: brand?.brandDescription || "",
      brandStatus: brand?.brandStatus || "approved",
      brandReviewReason: brand?.brandReviewReason || "",
    },
  });

  // Lấy giá trị status hiện tại để xử lý UI (hiện ô lý do từ chối)
  const currentStatus = watch("brandStatus");

  // state cho ảnh
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(brand?.brandLogo || "");

  useEffect(() => {
    reset({
      brandName: brand?.brandName || "",
      brandWebsite: brand?.brandWebsite || "",
      brandDescription: brand?.brandDescription || "",
      brandStatus: brand?.brandStatus || "approved",
      brandReviewReason: brand?.brandReviewReason || "",
    });

    setThumbFile(null);
    setThumbPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return brand?.brandLogo || "";
    });
  }, [brand, reset]);

  useEffect(() => {
    return () => {
      if (thumbPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbPreview);
      }
    };
  }, [thumbPreview]);

  const onSubmit = async (data) => {
    const name = data.brandName?.trim();
    if (!name) {
      return dispatch(
        showAlert({
          title: "Thiếu tên thương hiệu",
          message: "Vui lòng nhập tên thương hiệu",
          variant: "danger",
          duration: 1500,
        })
      );
    }

    const fd = new FormData();
    fd.append("brandName", name);

    if (data.brandWebsite) fd.append("brandWebsite", data.brandWebsite.trim());
    if (data.brandDescription)
      fd.append("brandDescription", data.brandDescription.trim());

    // --- LOGIC MỚI CHO ADMIN ---
    if (isAdmin) {
      // Admin có quyền gửi status lên để update
      fd.append("brandStatus", data.brandStatus);
      fd.append("isAdmin", isAdmin);
      // Nếu từ chối, gửi kèm lý do
      if (data.brandStatus === "rejected" && data.brandReviewReason) {
        fd.append("brandReviewReason", data.brandReviewReason.trim());
      }
    } else if (shopId) {
      fd.append("brandRequestedById", shopId);
    }

    if (thumbFile) {
      fd.append("brandLogo", thumbFile);
    } else {
      if (!brand?._id) {
        const response = await fetch(noPhoto);
        const blob = await response.blob();
        const file = new File([blob], "no-photo.jpg", { type: blob.type });
        fd.append("brandLogo", file);
      }
    }

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

    let res;
    try {
      if (brand?._id) {
        res = await apiUpdateBrand(fd, brand._id);
      } else {
        res = await apiCreateBrand(fd);
      }
    } catch (err) {
      res = null;
      console.error(err);
    }

    dispatch(showModal({ isShowModal: false }));

    if (res?.success) {
      let successMsg = "Tạo thương hiệu thành công";
      if (brand?._id) {
        successMsg = "Cập nhật thương hiệu thành công";
      } else if (!isAdmin) {
        successMsg = "Gửi yêu cầu đăng ký thương hiệu thành công";
      }

      dispatch(
        showAlert({
          title: "Thành công",
          message: successMsg,
          variant: "success",
          duration: 1500,
          showConfirmButton: false,
          showCancelButton: false,
        })
      );
      onSuccess?.();
    } else {
      dispatch(
        showAlert({
          title: "Thất bại",
          message: res?.message || "Có lỗi xảy ra, vui lòng thử lại",
          variant: "danger",
          showCancelButton: true,
        })
      );
    }
  };

  let formTitle = "Thêm thương hiệu";
  if (brand?._id) formTitle = "Chỉnh sửa thương hiệu";
  else if (!isAdmin) formTitle = "Đăng ký thương hiệu mới";

  return (
    <form
      onClick={(e) => {
        e.stopPropagation();
      }}
      onSubmit={handleSubmit(onSubmit)}
      // Tăng width lên max-w-[800px] để chứa đủ 2 cột
      className="relative p-6 bg-white rounded-3xl border w-[95vw] max-w-[800px] shadow-xl"
    >
      <CloseButton
        className="absolute top-3 right-3"
        onClick={() => onCancel?.()}
      />

      <p className="text-xl font-bold mb-6 text-center text-gray-800">
        {formTitle}
      </p>

      {!isAdmin && (
        <p className="text-center text-xs text-gray-500 mb-6 italic">
          Trong thời gian chờ phê duyệt, vui lòng để sản phẩm không thương hiệu
          và chờ thông báo mới để cập nhật.
        </p>
      )}

      {/* Grid Layout 2 Cột */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- CỘT TRÁI: Thông tin chung --- */}
        <div className="flex flex-col gap-4">
          {/* Tên thương hiệu */}
          <div>
            <label className="block text-sm font-medium mb-1 px-1">
              Tên thương hiệu <span className="text-red-500">*</span>
            </label>
            <input
              {...register("brandName", { required: true })}
              className="border border-gray-300 rounded-xl p-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Nhập tên thương hiệu"
              disabled={isSubmitting}
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium mb-1 px-1">
              Website (Tùy chọn)
            </label>
            <input
              {...register("brandWebsite")}
              className="border border-gray-300 rounded-xl p-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
          </div>

          {/* Mô tả */}
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium mb-1 px-1">
              Mô tả (Tùy chọn)
            </label>
            <textarea
              {...register("brandDescription")}
              className="border border-gray-300 rounded-xl p-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none flex-1 transition-all h-full min-h-[120px]"
              placeholder="Giới thiệu ngắn về thương hiệu..."
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* --- CỘT PHẢI: Hình ảnh & Admin --- */}
        <div className="flex flex-col gap-4">
          {/* Ảnh thương hiệu */}
          <div>
            <label className="block text-sm font-medium mb-1 px-1">
              Logo thương hiệu
            </label>
            <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
              <ImageUploader
                multiple={false}
                value={thumbFile}
                previews={thumbPreview}
                label="ảnh thương hiệu"
                onChange={(file) => {
                  if (thumbPreview?.startsWith("blob:")) {
                    URL.revokeObjectURL(thumbPreview);
                  }
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setThumbFile(file);
                    setThumbPreview(url);
                  } else {
                    setThumbFile(null);
                    setThumbPreview("");
                  }
                }}
              />
            </div>
          </div>

          {/* Phần dành cho ADMIN */}
          {isAdmin && (
            <div className="p-4 bg-blue-50/50 rounded-xl border border-dashed border-blue-300 flex-1">
              <p className="text-xs font-bold text-blue-600 mb-3 uppercase flex items-center gap-1">
                ⚙️ Dành cho quản trị viên
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700">
                    Trạng thái duyệt
                  </label>
                  <select
                    {...register("brandStatus")}
                    className="border border-gray-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={isSubmitting}
                  >
                    <option value="pending">Đang chờ duyệt</option>
                    <option value="approved">Đã phê duyệt</option>
                    <option value="rejected">Từ chối / Không duyệt</option>
                    <option value="blocked">Khóa (Block)</option>
                  </select>
                </div>

                {/* Nếu chọn Từ chối -> Hiện ô nhập lý do */}
                {currentStatus === "rejected" && (
                  <div className="animate-fade-in-up">
                    <label className="block text-xs font-semibold mb-1 text-red-600">
                      Lý do từ chối
                    </label>
                    <textarea
                      {...register("brandReviewReason", {
                        required: currentStatus === "rejected",
                      })}
                      rows={3}
                      className="border border-red-300 bg-red-50 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      placeholder="Nhập lý do từ chối để gửi cho shop..."
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={() => {
            if (brand?._id) {
              onCancel?.();
            } else {
              reset({
                brandName: "",
                brandWebsite: "",
                brandDescription: "",
                brandStatus: "approved",
                brandReviewReason: "",
              });
              if (thumbPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(thumbPreview);
              }
              setThumbFile(null);
              setThumbPreview("");
            }
          }}
          className="px-6 py-2.5 bg-gray-100 rounded-full hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
          disabled={isSubmitting}
        >
          {brand?._id ? "Hủy bỏ" : "Làm mới"}
        </button>

        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:shadow-lg hover:from-blue-700 hover:to-blue-800 text-sm font-medium disabled:opacity-50 transition-all transform active:scale-95"
          disabled={isSubmitting}
        >
          {brand?._id
            ? "Cập nhật thương hiệu"
            : isAdmin
            ? "Tạo mới"
            : "Gửi đăng ký"}
        </button>
      </div>
    </form>
  );
};
