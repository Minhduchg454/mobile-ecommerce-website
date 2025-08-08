import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  apiCreateCoupon,
  apiGetAllCoupons,
  apiUpdateCoupon,
  apiDeleteCoupon,
} from "apis";
import { InputForm, Button, Loading, ShowSwal } from "components";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { showModal } from "store/app/appSlice";
import { formatVnDate, formatVnCurrency } from "../../ultils/helpers";
import { useSelector } from "react-redux";

const ManageCoupons = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { current } = useSelector((state) => state.user);
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [update, setUpdate] = useState(false);

  const render = useCallback(() => setUpdate((prev) => !prev), []);

  useEffect(() => {
    const fetchCoupons = async () => {
      const res = await apiGetAllCoupons();
      if (res.success) setCoupons(res.coupons);
    };
    fetchCoupons();
  }, [update]);

  const onSubmit = async (data) => {
    // Chuyển chuỗi thành boolean
    data.isActive = data.isActive === "true";
    if (!current?._id) return toast.error("Không xác định được người dùng");
    data.userId = current._id;

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
    const response = await apiCreateCoupon(data);
    dispatch(showModal({ isShowModal: false, modalChildren: null }));

    if (response.success) {
      toast.success("Tạo mã giảm giá thành công!");
      reset({ isActive: "true" });
      setShowForm(false);
      render();
    }
  };

  const handleDelete = (id) => {
    ShowSwal({
      title: "Xác nhận",
      text: "Bạn có chắc muốn xoá mã giảm giá này?",
      showCancelButton: true,
      variant: "danger",
      icon: "warning",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await apiDeleteCoupon(id);
        if (res.success) {
          toast.success("Đã xoá mã giảm giá");
          render();
        } else {
          toast.error(res.mes || "Xoá thất bại");
        }
      }
    });
  };
  useEffect(() => {
    if (showForm) {
      reset({
        couponCode: "",
        description: "",
        discount: "",
        discountType: "",
        maxDiscountAmount: "",
        startDate: "",
        expirationDate: "",
        miniOrderAmount: "",
        usageLimit: "",
        isActive: "true",
      });
    }
  }, [showForm, reset]);

  return (
    <div className="w-full p-4  min-h-screen space-y-8">
      {/* Nút hiển thị form */}
      <div className="sticky top-0 z-10 w-fit bg-main text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        <button
          onClick={() => {
            reset({ isActive: true });
            setShowForm((prev) => !prev);
          }}
        >
          {showForm ? "Đóng biểu mẫu" : "➕ Thêm mã giảm giá"}
        </button>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ${
          showForm ? "max-h-[2000px] mt-4" : "max-h-0"
        }`}
      >
        {/* Form thêm mới */}
        {showForm && (
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-xl font-bold mb-6">➕ Thêm mã giảm giá</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <InputForm
                label="Mã giảm giá"
                id="couponCode"
                register={register}
                errors={errors}
                validate={{ required: "Không được để trống" }}
                fullWidth
                placeholder="Nhập mã giảm giá"
              />
              <InputForm
                label="Mô tả"
                id="description"
                register={register}
                errors={errors}
                validate={{ required: "Không được để trống" }}
                fullWidth
                placeholder="Nhập mô tả"
              />
              <InputForm
                label="Giá trị giảm"
                id="discount"
                register={register}
                errors={errors}
                validate={{
                  required: "Không được để trống",
                  min: { value: 0, message: "Phải >= 0" },
                }}
                type="number"
                fullWidth
                placeholder="Nhập giá trị giảm"
              />
              <div className="flex flex-col gap-2">
                <label className="font-semibold" htmlFor="discountType">
                  Loại giảm giá
                </label>
                <select
                  id="discountType"
                  {...register("discountType", {
                    required: "Không được để trống",
                  })}
                  className="border rounded px-3 py-2"
                >
                  <option value="">--Chọn loại giảm giá--</option>
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed_amount">Số tiền cố định</option>
                </select>
                {errors.discountType && (
                  <small className="text-xs text-red-500">
                    {errors.discountType.message}
                  </small>
                )}
              </div>

              <InputForm
                label="Giảm tối đa (nếu có)"
                id="maxDiscountAmount"
                register={register}
                errors={errors}
                validate={{
                  min: { value: 0, message: "Phải >= 0" },
                }}
                type="number"
                fullWidth
                placeholder="Nhập số tiền giảm tối đa"
              />

              <InputForm
                label="Ngày bắt đầu"
                id="startDate"
                register={register}
                errors={errors}
                validate={{ required: "Không được để trống" }}
                type="date"
                fullWidth
              />
              <InputForm
                label="Ngày hết hạn"
                id="expirationDate"
                register={register}
                errors={errors}
                validate={{ required: "Không được để trống" }}
                type="date"
                fullWidth
              />
              <InputForm
                label="Đơn hàng tối thiểu"
                id="miniOrderAmount"
                register={register}
                errors={errors}
                validate={{
                  required: "Không được để trống",
                  min: { value: 0, message: "Phải >= 0" },
                }}
                type="number"
                fullWidth
                placeholder="Nhập giá trị tối thiểu đơn hàng"
              />
              <InputForm
                label="Giới hạn sử dụng"
                id="usageLimit"
                register={register}
                errors={errors}
                validate={{
                  required: "Không được để trống",
                  min: { value: 1, message: "Phải >= 1" },
                }}
                type="number"
                fullWidth
                placeholder="Nhập số lần sử dụng tối đa"
              />
              <div className="flex flex-col gap-2">
                <label htmlFor="isActive" className="font-semibold">
                  Kích hoạt mã giảm giá
                </label>
                <select
                  id="isActive"
                  {...register("isActive", { required: "Không được để trống" })}
                  className="border rounded px-3 py-2"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Ngưng</option>
                </select>
                {errors.isActive && (
                  <small className="text-xs text-red-500">
                    {errors.isActive.message}
                  </small>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Button type="submit" className="rounded-xl">
                  Thêm mã giảm giá
                </Button>
                <button
                  type="button"
                  className="rounded-xl bg-gray-500 hover:bg-gray-600 px-4 py-2 text-white"
                  onClick={() => {
                    setShowForm(false);
                    reset({ isActive: true });
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Danh sách mã giảm giá */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <table className="table-auto w-full border-collapse ">
          <thead className="bg-title-table text-white text-sm uppercase">
            <tr>
              <th className="py-3 px-2">STT</th>
              <th className="py-3 px-2 text-left">Mã</th>
              <th className="py-3 px-2">Mô tả</th>
              <th className="py-3 px-2">Giảm</th>
              <th className="py-3 px-2">Loại</th>
              <th className="py-3 px-2">Giảm tối đa</th>
              <th className="py-3 px-2">Bắt đầu</th>
              <th className="py-3 px-2">Hết hạn</th>
              <th className="py-3 px-2">Tối thiểu</th>
              <th className="py-3 px-2">Giới hạn</th>
              <th className="py-3 px-2">Trạng thái</th>
              <th className="py-3 px-2">Tùy chọn</th>
            </tr>
          </thead>
          <tbody>
            {coupons?.map((el, idx) =>
              editingRowId === el._id ? (
                <tr key={el._id} className="border-b bg-yellow-50 text-sm">
                  <td className="text-center py-3 px-2">{idx + 1}</td>
                  <td className="py-3 px-2">
                    <input
                      value={editingData.couponCode}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          couponCode: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      value={editingData.description}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>

                  <td className="py-3 px-2 text-center">
                    <input
                      type="number"
                      value={editingData.discount}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          discount: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 w-20 text-center"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <select
                      value={editingData.discountType}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          discountType: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed_amount">VNĐ</option>
                    </select>
                  </td>

                  <td className="py-3 px-2 text-center">
                    <input
                      type="number"
                      value={editingData.maxDiscountAmount || ""}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          maxDiscountAmount: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 w-24 text-center"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <input
                      type="date"
                      value={editingData.startDate?.split("T")[0]}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <input
                      type="date"
                      value={editingData.expirationDate?.split("T")[0]}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          expirationDate: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <input
                      type="number"
                      value={editingData.miniOrderAmount}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          miniOrderAmount: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 w-24 text-center"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <input
                      type="number"
                      value={editingData.usageLimit}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          usageLimit: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 w-20 text-center"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <select
                      value={editingData.isActive ? "true" : "false"}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          isActive: e.target.value === "true",
                        }))
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Ngưng</option>
                    </select>
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="flex justify-center gap-2 text-green-700">
                      <span
                        onClick={async () => {
                          const res = await apiUpdateCoupon(
                            el._id,
                            editingData
                          );
                          if (res.success) {
                            toast.success("Cập nhật thành công");
                            setEditingRowId(null);
                            setEditingData({});
                            render();
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
                  <td className="text-center py-3 px-2">{idx + 1}</td>
                  <td className="py-3 px-2">{el.couponCode}</td>
                  <td className="py-3 px-2">{el.description}</td>
                  <td className="py-3 px-2 text-center">
                    {el.discountType === "percentage"
                      ? `${el.discount}%`
                      : formatVnCurrency(el.discount)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {el.discountType === "percentage" ? "%" : "VNĐ"}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {el.maxDiscountAmount
                      ? formatVnCurrency(el.maxDiscountAmount)
                      : "-"}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {formatVnDate(el.startDate)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {formatVnDate(el.expirationDate)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {formatVnCurrency(el.miniOrderAmount)}
                  </td>
                  <td className="py-3 px-2 text-center">{el.usageLimit}</td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        el.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {el.isActive ? "Hoạt động" : "Ngưng"}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="flex justify-center gap-2 text-orange-600">
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
            {coupons?.length === 0 && (
              <tr>
                <td
                  colSpan="11"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có mã giảm giá nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCoupons;
