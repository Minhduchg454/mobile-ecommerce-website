import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  apiCreateProductCategory,
  apiGetAllProductCategories,
  apiUpdateProductCategory,
  apiDeleteProductCategory,
} from "apis";
import { getBase64 } from "ultils/helpers";
import { InputForm, Button, Loading } from "components";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { showModal } from "store/app/appSlice";
import Swal from "sweetalert2";

const ManageProductCategory = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editElm, setEditElm] = useState(null);
  const [update, setUpdate] = useState(false);

  const render = useCallback(() => setUpdate((prev) => !prev), []);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await apiGetAllProductCategories();
      if (res.success) setCategories(res.prodCategories);
    };
    fetchCategories();
  }, [update]);

  // Load ảnh xem trước khi người dùng chọn ảnh
  useEffect(() => {
    const file = watch("thumb")?.[0];
    if (file) getBase64(file).then((base64) => setPreview(base64));
  }, [watch("thumb")]);

  // Set giá trị vào form khi sửa
  useEffect(() => {
    if (editElm) {
      reset({ productCategoryName: editElm.productCategoryName });
      setPreview(editElm.thumb);
    } else {
      reset();
      setPreview(null);
    }
  }, [editElm, reset]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("productCategoryName", data.productCategoryName);
    if (data.thumb?.[0]) {
      formData.append("thumb", data.thumb[0]);
    }

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

    let response;
    if (editElm) {
      response = await apiUpdateProductCategory(editElm._id, formData);
    } else {
      response = await apiCreateProductCategory(formData);
    }

    dispatch(showModal({ isShowModal: false, modalChildren: null }));

    if (response.success) {
      toast.success(
        editElm ? "✅ Cập nhật thành công!" : "✅ Tạo danh mục thành công!"
      );
      setEditElm(null);
      reset({ productCategoryName: "", thumb: null }); // ← Thêm dòng này
      setPreview(null);
      document.getElementById("thumb").value = "";
      render();
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc muốn xoá danh mục này?",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await apiDeleteProductCategory(id);
        if (res.success) {
          toast.success("✅ Đã xoá danh mục");
          render();
        } else {
          toast.error(res.mes || "❌ Xoá thất bại");
        }
      }
    });
  };

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen space-y-8">
      {/* Form thêm / sửa */}
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-6">
          {editElm ? "✏️ Chỉnh sửa danh mục" : "➕ Thêm danh mục sản phẩm"}
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputForm
            label="Tên danh mục"
            id="productCategoryName"
            register={register}
            errors={errors}
            validate={{ required: "Không được để trống" }}
            fullWidth
            placeholder="Nhập tên danh mục"
          />
          <div className="flex flex-col gap-2">
            <label className="font-semibold" htmlFor="thumb">
              Ảnh danh mục
            </label>
            <input
              type="file"
              id="thumb"
              {...register("thumb", {
                required: editElm ? false : "Không được để trống",
              })}
              accept="image/*"
            />
            {errors.thumb && (
              <small className="text-xs text-red-500">
                {errors.thumb.message}
              </small>
            )}
          </div>

          {preview && (
            <div className="my-4">
              <img
                src={preview}
                alt="preview"
                className="w-[200px] object-contain rounded"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button type="submit" className="rounded-xl">
              {editElm ? "Cập nhật danh mục" : "Thêm danh mục"}
            </Button>
            {editElm && (
              <button
                type="button"
                className="rounded-xl bg-gray-500 hover:bg-gray-600 px-4 py-2 text-white"
                onClick={() => {
                  setEditElm(null);
                  reset({ productCategoryName: "", thumb: null });
                  setPreview(null);
                  document.getElementById("thumb").value = "";
                }}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Danh sách */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4">📋 Danh sách danh mục</h2>
        <table className="table-auto w-full border-collapse">
          <thead className="bg-title-table text-white text-sm uppercase">
            <tr>
              <th className="py-3 px-2">STT</th>
              <th className="py-3 px-2 text-left">Tên danh mục</th>
              <th className="py-3 px-2">Ảnh</th>
              <th className="py-3 px-2">Tùy chọn</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((el, idx) => (
              <tr
                key={el._id}
                className="border-b hover:bg-sky-50 transition-all text-sm"
              >
                <td className="text-center py-3 px-2">{idx + 1}</td>
                <td className="py-3 px-2">{el.productCategoryName}</td>
                <td className="text-center py-3 px-2">
                  <img
                    src={el.thumb}
                    alt="thumb"
                    className="w-16 h-16 object-cover mx-auto rounded"
                  />
                </td>
                <td className="text-center py-3 px-2">
                  <div className="flex justify-center gap-2 text-orange-600">
                    <span
                      onClick={() => setEditElm(el)}
                      className="hover:underline cursor-pointer text-blue-600"
                    >
                      Sửa
                    </span>
                    <span
                      onClick={() => handleDelete(el._id)}
                      className="hover:underline cursor-pointer"
                    >
                      Xoá
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {categories?.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProductCategory;
