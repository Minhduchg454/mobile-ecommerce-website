// createCategoryForm.jsx

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  apiCreateCategory,
  apiUpdateCategory,
} from "../../services/catalog.api";
import { Loading, CloseButton, ImageUploader } from "../../components";
import { showAlert, showModal } from "store/app/appSlice";
import noPhoto from "../../assets/image-not-found.png";

export const CreateCategoryForm = ({ category, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      categoryName: category?.categoryName || "",
    },
  });

  // state cho ảnh
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(
    category?.categoryThumb || ""
  );

  // ⚠️ TRẠNG THÁI MỚI: Theo dõi xem người dùng có cố tình xóa ảnh hay không
  const [isThumbCleared, setIsThumbCleared] = useState(false);

  useEffect(() => {
    reset({ categoryName: category?.categoryName || "" });
    setThumbFile(null);
    setIsThumbCleared(false); // Reset cờ
    setThumbPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return category?.categoryThumb || "";
    });
  }, [category, reset]);

  // cleanup blob khi unmount
  useEffect(() => {
    return () => {
      if (thumbPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbPreview);
      }
    };
  }, [thumbPreview]);

  const onSubmit = async (data) => {
    const name = data.categoryName?.trim();
    if (!name) {
      return dispatch(
        showAlert({
          title: "Thiếu tên danh mục",
          message: "Vui lòng nhập tên danh mục",
          variant: "danger",
          duration: 1500,
        })
      );
    }

    const fd = new FormData();
    fd.append("categoryName", name);

    // =======================================================
    // 🎯 LOGIC XỬ LÝ ẢNH (BẮT BUỘC CHO TẠO MỚI, TÙY CHỌN CHO CẬP NHẬT)
    // =======================================================

    // 1. Nếu là TẠO MỚI VÀ KHÔNG CÓ FILE -> Dùng ảnh mặc định
    if (!category?._id && !thumbFile) {
      const response = await fetch(noPhoto);
      const blob = await response.blob();
      const file = new File([blob], "no-photo.jpg", { type: blob.type });
      fd.append("categoryThumb", file);
    }
    // 2. Nếu CÓ FILE MỚI (Cả tạo và sửa đều gửi file mới này)
    else if (thumbFile) {
      fd.append("categoryThumb", thumbFile);
    }
    // 3. Nếu KHÔNG CÓ FILE và KHÔNG CÓ PREVIEW (Cập nhật và xóa ảnh)
    else if (category?._id && !thumbPreview) {
      // Đây là trường hợp người dùng xóa ảnh trong chế độ sửa (đã set thumbPreview="")
      // Gửi chuỗi rỗng để server xóa ảnh (hoặc update URL thành rỗng)
      fd.append("categoryThumb", "");
    }
    // 4. Nếu KHÔNG CÓ FILE và CÓ PREVIEW (Cập nhật và giữ nguyên ảnh cũ) -> KHÔNG APPEND GÌ

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

    let res;
    try {
      if (category?._id) {
        // Edit
        res = await apiUpdateCategory(fd, category._id);
      } else {
        // Create
        res = await apiCreateCategory(fd);
      }
    } catch (err) {
      res = null;
      console.error(err);
    }

    dispatch(showModal({ isShowModal: false }));

    if (res?.success) {
      dispatch(
        showAlert({
          title: "Thành công",
          message: category?._id
            ? "Cập nhật danh mục thành công"
            : "Tạo danh mục thành công",
          variant: "success",
          duration: 1500,
          showConfirmButton: false,
          showCancelButton: false,
        })
      );

      // cho cha tự reload list + đóng modal
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

  const handleImageChange = (file) => {
    if (thumbPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(thumbPreview);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setThumbFile(file);
      setThumbPreview(url);
      setIsThumbCleared(false);
    } else {
      setThumbFile(null);
      // Nếu đã từng có ảnh gốc (category?._id), việc xóa này sẽ gửi "" lên server
      setThumbPreview("");
      setIsThumbCleared(true);
    }
  };

  return (
    <form
      onClick={(e) => {
        e.stopPropagation();
      }}
      onSubmit={handleSubmit(onSubmit)}
      className="relative p-4 bg-white rounded-3xl border w-[90vw] max-w-[420px]"
    >
      <p className="text-lg font-bold mb-4 text-center">
        {category?._id ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
      </p>

      <CloseButton
        className="absolute top-2 right-2"
        onClick={() => onCancel?.()}
      />

      {/* Tên danh mục */}
      <div className="mb-3">
        <label className="block text-sm mb-1 px-2">Tên danh mục</label>
        <input
          {...register("categoryName", { required: true })}
          className="border rounded-xl p-2 w-full text-sm"
          placeholder="Nhập tên danh mục"
          disabled={isSubmitting}
        />
      </div>

      {/* Ảnh danh mục */}
      <div className="mb-3">
        <label className="block text-sm mb-1 px-2">Ảnh danh mục</label>
        <ImageUploader
          multiple={false}
          value={thumbFile}
          previews={thumbPreview}
          label="ảnh danh mục"
          onChange={handleImageChange}
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={() => {
            if (category?._id) {
              // edit: hủy = đóng popup
              onCancel?.();
            } else {
              // create: reset form + xóa ảnh
              reset({ categoryName: "" });
              handleImageChange(null); // Reset ảnh
            }
          }}
          className="px-3 py-1.5 bg-gray-200 rounded-3xl hover:bg-gray-300 text-sm"
          disabled={isSubmitting}
        >
          {category?._id ? "Hủy" : "Hoàn tác"}
        </button>

        <button
          type="submit"
          className="px-3 py-1.5 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 text-sm disabled:opacity-50"
          disabled={isSubmitting}
        >
          {category?._id ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
};
