// createBrandForm.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { apiCreateBrand, apiUpdateBrand } from "../../services/catalog.api";
import { Loading, CloseButton, ImageUploader } from "../../components";
import { showAlert, showModal } from "store/app/appSlice";
import noPhoto from "../../assets/image-not-found.png";

export const CreateBrandForm = ({ brand, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      brandName: brand?.brandName || "",
    },
  });

  // state cho ảnh
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(brand?.brandLogo || "");

  useEffect(() => {
    // reset form khi đổi brand (edit brand khác)
    reset({ brandName: brand?.brandName || "" });

    // reset ảnh
    setThumbFile(null);
    setThumbPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return brand?.brandLogo || "";
    });
  }, [brand, reset]);

  // cleanup blob khi unmount
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

    // Nếu có file mới -> gửi lên
    if (thumbFile) {
      fd.append("brandLogo", thumbFile);
    } else {
      // Không chọn ảnh:
      // - Nếu đang edit và đã có brandThumb -> không gửi gì, backend giữ ảnh cũ
      // - Nếu đang tạo mới -> gửi ảnh mặc định noPhoto
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
        // Edit
        res = await apiUpdateBrand(fd, brand._id);
      } else {
        // Create
        res = await apiCreateBrand(fd);
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
          message: brand?._id
            ? "Cập nhật thương hiệu thành công"
            : "Tạo thương hiệu thành công",
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

  return (
    <form
      onClick={(e) => {
        e.stopPropagation();
      }}
      onSubmit={handleSubmit(onSubmit)}
      className="relative p-4 bg-white rounded-3xl border w-[90vw] max-w-[420px]"
    >
      <p className="text-lg font-bold mb-4 text-center">
        {brand?._id ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}
      </p>

      <CloseButton
        className="absolute top-2 right-2"
        onClick={() => onCancel?.()}
      />

      {/* Tên thương hiệu */}
      <div className="mb-3">
        <label className="block text-sm mb-1 px-2">Tên thương hiệu</label>
        <input
          {...register("brandName", { required: true })}
          className="border rounded-xl p-2 w-full text-sm"
          placeholder="Nhập tên thương hiệu"
          disabled={isSubmitting}
        />
      </div>

      {/* Ảnh thương hiệu */}
      <div className="mb-3">
        <label className="block text-sm mb-1 px-2">Ảnh thương hiệu</label>
        <ImageUploader
          multiple={false}
          value={thumbFile}
          previews={thumbPreview}
          label="ảnh thương hiệu"
          onChange={(file) => {
            // file: File | null
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
        <p className="mt-1 text-[11px] text-gray-500 px-2">
          Hỗ trợ kéo thả hoặc chọn file. Nếu không chọn ảnh khi tạo mới, hệ
          thống sẽ dùng ảnh mặc định.
        </p>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={() => {
            if (brand?._id) {
              // edit: hủy = đóng popup
              onCancel?.();
            } else {
              // create: reset form + xóa ảnh
              reset({ brandName: "" });
              if (thumbPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(thumbPreview);
              }
              setThumbFile(null);
              setThumbPreview("");
            }
          }}
          className="px-3 py-1.5 bg-gray-200 rounded-3xl hover:bg-gray-300 text-sm"
          disabled={isSubmitting}
        >
          {brand?._id ? "Hủy" : "Hoàn tác"}
        </button>

        <button
          type="submit"
          className="px-3 py-1.5 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 text-sm disabled:opacity-50"
          disabled={isSubmitting}
        >
          {brand?._id ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
};
