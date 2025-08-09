import React, { useState, useEffect, useCallback } from "react";
import {
  apiCreateProductCategory,
  apiGetAllProductCategories,
  apiUpdateProductCategory,
  apiDeleteProductCategory,
} from "apis";
import { getBase64 } from "ultils/helpers";
import { InputForm, Button, Loading, ShowSwal } from "components";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { showModal } from "store/app/appSlice";

const ManageProductCategory = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm();

  const [categories, setCategories] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [preview, setPreview] = useState(null);
  const [update, setUpdate] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const render = useCallback(() => setUpdate((prev) => !prev), []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiGetAllProductCategories({ sort: "newest" });
      if (res.success) setCategories(res.prodCategories);
    };
    fetchData();
  }, [update]);

  useEffect(() => {
    const file = watch("thumb")?.[0];
    if (file) getBase64(file).then((base64) => setPreview(base64));
  }, [watch("thumb")]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("productCategoryName", data.productCategoryName);
    formData.append("thumb", data.thumb[0]);

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
    const res = await apiCreateProductCategory(formData);
    dispatch(showModal({ isShowModal: false, modalChildren: null }));

    if (res.success) {
      toast.success("Tạo danh mục thành công!");
      reset();
      setPreview(null);
      document.getElementById("thumb").value = "";
      setShowForm(false);
      render();
    } else {
      toast.error(res.mes || "Có lỗi xảy ra");
    }
  };

  const handleDelete = (id) => {
    ShowSwal({
      title: "Xác nhận",
      text: "Bạn có chắc muốn xoá danh mục này?",
      showCancelButton: true,
      variant: "danger",
      icon: "warning",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await apiDeleteProductCategory(id);
        if (res.success) {
          toast.success("Xoá danh mục thành công");
          render();
        } else {
          toast.error(res.message || "Xoá thất bại");
        }
      }
    });
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append(
      "productCategoryName",
      editingData.productCategoryName || ""
    );
    if (editingData.thumb instanceof File) {
      formData.append("thumb", editingData.thumb);
    }

    const res = await apiUpdateProductCategory(editingRowId, formData);
    if (res.success) {
      toast.success("Cập nhật thành công");
      setEditingRowId(null);
      setEditingData({});
      render();
    } else {
      toast.error(res.mes || "Cập nhật thất bại");
    }
  };

  return (
    <div className="w-full p-4 min-h-screen space-y-8">
      {/* Nút hiển thị form */}
      <div className="sticky top-0 z-10 w-fit bg-main text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        <button
          onClick={() => {
            reset();
            setPreview(null);
            setShowForm((prev) => !prev);
          }}
        >
          {showForm ? "Đóng biểu mẫu" : "➕ Thêm danh mục"}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 ${
          showForm ? "max-h-[2000px] mt-4" : "max-h-0"
        }`}
      >
        {/* Form thêm danh mục */}
        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
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
                    required: "Không được để trống",
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
                  Thêm danh mục
                </Button>
                <button
                  type="button"
                  className="rounded-xl bg-gray-500 hover:bg-gray-600 px-4 py-2 text-white"
                  onClick={() => {
                    reset();
                    setPreview(null);
                    setShowForm(false);
                    document.getElementById("thumb").value = "";
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Danh sách danh mục */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-title-table text-white text-sm uppercase">
            <tr>
              <th className="py-3 px-2 text-left">STT</th>
              <th className="py-3 px-2 text-left">Tên danh mục</th>
              <th className="py-3 px-2">Ảnh</th>
              <th className="py-3 px-2 text-right">Tùy chọn</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((el, idx) =>
              editingRowId === el._id ? (
                <tr key={el._id} className="border-b bg-yellow-50 text-sm">
                  <td className="text-left py-3 px-2">{idx + 1}</td>
                  <td className="py-3 px-2">
                    <input
                      value={editingData.productCategoryName}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          productCategoryName: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="text-center py-3 px-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          getBase64(file).then((base64) =>
                            setEditingData((prev) => ({
                              ...prev,
                              thumb: file,
                              preview: base64,
                            }))
                          );
                        }
                      }}
                    />
                    {editingData?.preview && (
                      <img
                        src={editingData.preview}
                        alt="preview"
                        className="w-16 h-16 mx-auto rounded mt-2 object-cover"
                      />
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="flex justify-end gap-2 text-green-700">
                      <span
                        onClick={handleUpdate}
                        className="hover:underline cursor-pointer font-medium"
                      >
                        Lưu
                      </span>
                      <span
                        onClick={() => {
                          setEditingRowId(null);
                          setEditingData({});
                        }}
                        className="hover:underline cursor-pointer text-red-600"
                      >
                        Hủy
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr
                  key={el._id}
                  className="border-b hover:bg-sky-50 transition-all text-sm"
                >
                  <td className="text-left py-3 px-2">{idx + 1}</td>
                  <td className="py-3 px-2">{el.productCategoryName}</td>
                  <td className="text-center py-3 px-2">
                    <img
                      src={el.thumb}
                      alt="thumb"
                      className="w-16 h-16 object-cover mx-auto rounded"
                    />
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="flex justify-end gap-2 text-orange-600">
                      <span
                        onClick={() => {
                          setEditingRowId(el._id);
                          setEditingData(el);
                        }}
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
              )
            )}
            {categories.length === 0 && (
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
