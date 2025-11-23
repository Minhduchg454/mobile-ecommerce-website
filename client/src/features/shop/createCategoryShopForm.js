// CreateCategoryShopForm.jsx (refactor)
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  apiCreateShopCategory,
  apiUpdateShopCategory,
} from "../../services/shop.api";
import { Loading, CloseButton } from "../../components";
import { showAlert, showModal } from "store/app/appSlice";
import { useEffect } from "react";

export const CreateCategoryShopForm = ({
  category, // { _id, csName } hoặc undefined/null nếu tạo mới
  shopId, // string bắt buộc
  onSuccess, // (newOrUpdatedCategory) => void
  onCancel, // () => void
}) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { csName: category?.csName || "" },
  });

  // Khi mở popup để edit category khác -> reset form theo props mới
  useEffect(() => {
    reset({ csName: category?.csName || "" });
  }, [category, reset]);

  const onSubmit = async (data) => {
    // payload gửi kèm shopId
    const payload = { ...data, shopId };

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
    let res;
    if (category?._id) {
      // Edit
      res = await apiUpdateShopCategory(payload, category._id);
    } else {
      // Create
      res = await apiCreateShopCategory(payload);
    }
    dispatch(showModal({ isShowModal: false }));

    if (res?.success) {
      dispatch(
        showAlert({
          title: "Thành công",
          message: category
            ? "Cập nhật danh mục shop thành công"
            : "Tạo danh mục thành công",
          variant: "success",
          duration: 1500,
          showConfirmButton: false,
          showCancelButton: false,
        })
      );

      // Gọi callback ra cha:
      // - đóng popup
      // - reload list ngoài
      onSuccess?.(res.categoryShop || null);

      // Nếu là tạo mới và bạn muốn để form trống tiếp (trong popup không đóng),
      // bạn có thể reset(); nhưng ở flow hiện tại ta sẽ đóng popup trong onSuccess.
    } else {
      dispatch(
        showAlert({
          title: "Thất bại",
          message: res?.message || "Có lỗi xảy ra vui lòng thử lại",
          variant: "danger",
          duration: 2000,
          showCancelButton: false,
        })
      );
    }
  };

  return (
    <form
      onClick={(e) => {
        e.stopPropagation(); // chặn không cho nổi bọt ra overlay
      }}
      onSubmit={handleSubmit(onSubmit)}
      className="relative p-4 bg-white rounded-3xl border w-[90vw] max-w-[400px]"
    >
      <p className="font-bold text-black mb-2">
        {category?._id ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
      </p>
      <CloseButton
        className="absolute top-2 right-2"
        onClick={() => onCancel?.()}
      />

      <input
        {...register("csName", { required: true })}
        className="border rounded-xl p-2 w-full text-sm"
        placeholder="Nhập tên danh mục"
        disabled={isSubmitting}
      />

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={() => {
            // nếu đang tạo mới -> chỉ reset lại input
            // nếu đang edit -> hủy = đóng popup
            if (category?._id) {
              onCancel?.();
            } else {
              reset({ csName: "" });
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
