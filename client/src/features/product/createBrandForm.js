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
      className="relative p-4 bg-white rounded-3xl border w-[90vw] max-w-[500px]"
    >
      <p className="text-lg font-bold mb-4 text-center">{formTitle}</p>

      {!isAdmin && (
        <p className="text-justify text-xs  text-gray-400 mb-3">
          Trong thời gian chờ phê duyệt, vui lòng để sản phẩm không thương hiệu
          và chờ thông báo mới để cập nhật
        </p>
      )}

      <CloseButton
        className="absolute top-2 right-2"
        onClick={() => onCancel?.()}
      />

      {/* Tên thương hiệu */}
      <div className="mb-3">
        <label className="block text-sm mb-1 px-2">
          Tên thương hiệu <span className="text-red-500">*</span>
        </label>
        <input
          {...register("brandName", { required: true })}
          className="border rounded-xl p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tên thương hiệu"
          disabled={isSubmitting}
        />
      </div>

      {/* Website */}
      <div className="mb-3">
        <label className="block text-sm mb-1 px-2">Website (Tùy chọn)</label>
        <input
          {...register("brandWebsite")}
          className="border rounded-xl p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com"
          disabled={isSubmitting}
        />
      </div>

      {/* Mô tả */}
      <div className="mb-3">
        <label className="block text-sm mb-1 px-2">Mô tả (Tùy chọn)</label>
        <textarea
          {...register("brandDescription")}
          rows={3}
          className="border rounded-xl p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Giới thiệu ngắn về thương hiệu..."
          disabled={isSubmitting}
        />
      </div>

      {/* --- KHU VỰC CỦA ADMIN --- */}

      {/* Ảnh thương hiệu */}
      <div className="mb-3">
        <label className="block text-sm mb-1 px-2">Logo thương hiệu</label>
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
        <p className="mt-1 text-[11px] text-gray-500 px-2 italic">
          * Hỗ trợ kéo thả hoặc chọn file. Nếu tạo mới không chọn ảnh, hệ thống
          sẽ dùng ảnh mặc định.
        </p>
      </div>

      {isAdmin && (
        <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
            Dành cho quản trị viên
          </p>

          <label className="block text-sm mb-1">Trạng thái duyệt</label>
          <select
            {...register("brandStatus")}
            className="border rounded-xl p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            disabled={isSubmitting}
          >
            <option value="pending">Đang chờ duyệt</option>
            <option value="approved">Đã phê duyệt</option>
            <option value="rejected">Từ chối / Không duyệt</option>
            <option value="blocked">Khóa (Block)</option>
          </select>

          {/* Nếu chọn Từ chối -> Hiện ô nhập lý do */}
          {currentStatus === "rejected" && (
            <div className="animate-fade-in mt-2">
              <label className="block text-sm mb-1 text-red-600">
                Lý do từ chối
              </label>
              <textarea
                {...register("brandReviewReason", {
                  required: currentStatus === "rejected",
                })}
                rows={2}
                className="border border-red-300 bg-red-50 rounded-xl p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Nhập lý do từ chối để gửi cho shop..."
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
      )}
      {/* ------------------------- */}

      <div className="flex justify-end gap-2 mt-4">
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
          className="px-4 py-2 bg-gray-200 rounded-3xl hover:bg-gray-300 text-sm font-medium"
          disabled={isSubmitting}
        >
          {brand?._id ? "Hủy bỏ" : "Làm mới"}
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 text-sm font-medium disabled:opacity-50 shadow-md"
          disabled={isSubmitting}
        >
          {brand?._id ? "Cập nhật" : isAdmin ? "Tạo mới" : "Gửi đăng ký"}
        </button>
      </div>
    </form>
  );
};
