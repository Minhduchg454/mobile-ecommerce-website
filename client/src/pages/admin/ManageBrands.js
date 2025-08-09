import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  apiCreateBrand,
  apiGetBrands,
  apiUpdateBrand,
  apiDeleteBrand,
} from "apis";
import { InputForm, Button, Loading } from "components";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { showModal } from "store/app/appSlice";
import { ShowSwal } from "../../components";

const ManageBrands = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { brandName: "" },
  });

  const [brands, setBrands] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [update, setUpdate] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const render = useCallback(() => setUpdate((prev) => !prev), []);

  useEffect(() => {
    const fetchBrands = async () => {
      const res = await apiGetBrands({ sort: "newest" });
      if (res.success) setBrands(res.brands);
    };
    fetchBrands();
  }, [update]);

  const onSubmit = async (data) => {
    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
    const res = await apiCreateBrand(data);
    dispatch(showModal({ isShowModal: false, modalChildren: null }));

    if (res.success) {
      toast.success("Thêm thương hiệu thành công!");
      reset();
      setShowForm(false);
      render();
    } else {
      toast.error(res.mes || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id) => {
    const result = await ShowSwal({
      title: "Xác nhận",
      text: "Bạn có chắc muốn xoá thương hiệu này?",
      icon: "warning",
      variant: "danger",
      showCancelButton: true,
      confirmText: "Xoá",
      cancelText: "Huỷ",
    });

    if (result.isConfirmed) {
      const res = await apiDeleteBrand(id);
      if (res.success) {
        toast.success("Đã xoá thương hiệu");
        render();
      } else {
        toast.error(res.message || "Xoá thất bại");
      }
    }
  };

  return (
    <div className="w-full p-4  min-h-screen space-y-8">
      {/* Nút hiển thị form */}
      <div className="sticky top-0 z-10 bg-main w-fit text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        <button
          onClick={() => {
            reset();
            setShowForm((prev) => !prev);
          }}
        >
          {showForm ? "Đóng biểu mẫu" : "➕ Thêm thương hiệu"}
        </button>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ${
          showForm ? "max-h-[2000px] mt-4" : "max-h-0"
        }`}
      >
        {showForm && (
          <div className="bg-white rounded-xl shadow p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <InputForm
                label="Tên thương hiệu"
                id="brandName"
                register={register}
                errors={errors}
                validate={{ required: "Không được để trống" }}
                fullWidth
                placeholder="Nhập tên thương hiệu"
              />
              <div className="flex items-center gap-4">
                <Button type="submit" className="rounded-xl">
                  Thêm mới
                </Button>
                <button
                  type="button"
                  className="rounded-xl bg-gray-500 hover:bg-gray-600 px-4 py-2 text-white"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      {/* Danh sách thương hiệu */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-title-table text-white text-sm uppercase">
            <tr>
              <th className="py-3 px-2 text-left">STT</th>
              <th className="py-3 px-2 text-left">Tên thương hiệu</th>
              <th className="py-3 px-2 text-right">Tùy chọn</th>
            </tr>
          </thead>
          <tbody>
            {brands?.map((el, idx) =>
              editingRowId === el._id ? (
                <tr key={el._id} className="border-b bg-yellow-50 text-sm">
                  <td className="text-left py-3 px-2">{idx + 1}</td>
                  <td className="py-3 px-2">
                    <input
                      value={editingData.brandName}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          brandName: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="text-right py-3 px-2">
                    <div className="flex justify-end gap-2 text-green-700">
                      <span
                        onClick={async () => {
                          const res = await apiUpdateBrand(el._id, editingData);
                          if (res.success) {
                            toast.success("Cập nhật thương hiệu thành công");
                            setEditingRowId(null);
                            setEditingData({});
                            render();
                          } else {
                            toast.error("Cập nhật thất bại");
                          }
                        }}
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
                  <td className="py-3 px-2">{el.brandName}</td>
                  <td className="text-right py-3 px-2">
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
            {brands?.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có thương hiệu nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBrands;
