import {
  apiDeleteOrderByAdmin,
  apiGetOrders,
  apiUpdateOrder,
  apiGetOrderById,
} from "apis";
import { CloseButton, Pagination, InputForm, OrderSummary } from "components";
import useDebounce from "hooks/useDebounce";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { formatMoney } from "ultils/helpers";
import clsx from "clsx";

const ManageOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [orders, setOrders] = useState();
  const [counts, setCounts] = useState(0);
  const [update, setUpdate] = useState(false);
  const [queries, setQueries] = useState({ q: "" });
  const [editingId, setEditingId] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      _id: "",
      status: "",
    },
  });

  const statusCounts = {
    Pending: orders?.filter((o) => o.status === "Pending").length || 0,
    Succeeded: orders?.filter((o) => o.status === "Succeeded").length || 0,
    Cancelled: orders?.filter((o) => o.status === "Cancelled").length || 0,
  };

  const handleShowDetail = async (orderId) => {
    const response = await apiGetOrderById(orderId);
    if (response.status === "success") {
      setSelectedOrder(response.data.order);
      setShowDetail(true);
    } else {
      toast.error("Không lấy được thông tin chi tiết đơn hàng");
    }
  };

  const fetchOrders = async (params) => {
    const response = await apiGetOrders({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    });
    console.log(response);
    if (response.success) {
      setCounts(response.count);
      setOrders(response.data);
    }
  };
  const render = useCallback(() => {
    setUpdate(!update);
  }, [update]);
  const queryDecounce = useDebounce(watch("q"), 800);

  useEffect(() => {
    const pr = Object.fromEntries([...params]);
    fetchOrders(pr);
    setValue("status", pr.status || "");
  }, [params]);

  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: "Xác nhận?",
      text: "Bạn có muốn xóa đơn hàng này",
      icon: "warning",
      showCancelButton: true,
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const response = await apiDeleteOrderByAdmin(id);
        if (response.success) {
          toast.success("Đơn hàng được xóa thành công");
        } else {
          toast.error("Đã có lỗi xảy ra, không thể xóa");
        }
        render();
      }
    });
  };

  const handleUpdate = async (id) => {
    const response = await apiUpdateOrder(id, {
      status: watch("status"),
    });

    if (response.success) {
      toast.success(response.mes);
      setUpdate(!update);
      setEditingId(null);
    } else toast.error(response.mes);
  };
  return (
    <div className={clsx("w-full min-h-screen p-4")}>
      {/* Thanh header cố định */}
      <div className="sticky top-0 z-10 shadow p-4 rounded-xl mb-4 flex justify-between gap-4 items-center bg-[#FFF]">
        <div className="w-full">
          <InputForm
            id="_id"
            register={register}
            errors={errors}
            fullWidth
            inputClassName="bg-[#E5E7EB]"
            placeholder="🔍 Tìm kiếm theo mã đơn hàng"
            onChange={(e) => {
              const _id = e.target.value;
              setValue("_id", _id);
              navigate({
                pathname: location.pathname,
                search: createSearchParams({
                  status: "",
                  _id: _id.trim(),
                }).toString(),
              });
            }}
          />
        </div>
        <div className="w-[200px]">
          <select
            {...register("status")}
            className="w-full border p-2 rounded-xl text-sm"
            onChange={(e) => {
              const status = e.target.value;
              setValue("status", status);
              navigate({
                pathname: location.pathname,
                search: createSearchParams({
                  _id: watch("_id"),
                  status,
                }).toString(),
              });
            }}
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Succeeded">Thành công</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {showDetail && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm transition"
          onClick={() => {
            setShowDetail(false);
            setSelectedOrder(null);
          }}
        >
          <div
            className="relative bg-[#F5F5F7] rounded-xl shadow-xl max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()} // Ngăn sự kiện lan xuống div cha
          >
            <CloseButton
              onClick={() => {
                setShowDetail(false);
                setSelectedOrder(null);
              }}
              className="top-2 right-2"
            />
            <div className="p-6 max-h-[90vh] overflow-y-auto border shadow-md rounded-xl">
              <OrderSummary order={selectedOrder} />
            </div>
          </div>
        </div>
      )}

      {/* Nội dung */}
      <div className="bg-white rounded-xl shadow p-4 overflow-y-auto">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="bg-green-100 text-green-800 p-2 rounded-xl text-sm">
            Đơn thành công: {statusCounts.Succeeded}
          </div>
          <div className="bg-yellow-100 text-yellow-800 p-2 rounded-xl text-sm">
            Đơn chờ duyệt: {statusCounts.Pending}
          </div>
          <div className="bg-red-100 text-red-800 px-4 p-2 rounded-xl text-sm">
            Đơn Đã hủy: {statusCounts.Cancelled}
          </div>
        </div>
        <table className="table-auto w-full border-collapse text-sm">
          <thead className="bg-title-table text-white uppercase">
            <tr>
              <th className="py-3 px-2">STT</th>
              <th className="py-3 px-2">Mã đơn hàng</th>
              <th className="py-3 px-2">Khách hàng</th>
              <th className="py-3 px-2">Tổng tiền</th>
              <th className="py-3 px-2">Trạng thái</th>
              <th className="py-3 px-2">Ngày mua</th>
              <th className="py-3 px-2">Địa chỉ giao hàng</th>
              <th className="py-3 px-2">Thanh toán</th>
              <th className="py-3 px-2">Tùy chọn</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((el, idx) => (
              <tr
                key={el._id}
                className={clsx(
                  "border-b transition-all",
                  editingId === el._id ? "bg-yellow-50" : "hover:bg-sky-50"
                )}
              >
                <td className="text-center py-3 px-2 font-semibold">
                  {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                    process.env.REACT_APP_LIMIT +
                    idx +
                    1}
                </td>

                {/* Mã đơn hàng */}
                <td className="text-center py-3 px-2">{el._id || "Ẩn danh"}</td>

                {/* Cột sản phẩm (hiện không có dữ liệu cụ thể) */}
                <td className="text-left py-3 px-2">
                  {el.customerId._id.firstName || "Ẩn danh"}
                </td>

                {/* Tổng tiền */}
                <td className="text-center py-3 px-2  text-green-700 font-semibold">
                  {formatMoney(el.totalPrice) + " đ"}
                </td>

                {/* Trạng thái */}
                <td className="text-center py-3 px-2">
                  {editingId === el._id ? (
                    <select
                      {...register("status")}
                      className="border border-gray-300 rounded-md py-1 px-2 text-sm w-[120px]"
                    >
                      <option value="Cancelled">Cancelled</option>
                      <option value="Succeeded">Succeeded</option>
                      <option value="Pending">Pending</option>
                    </select>
                  ) : (
                    <span
                      className={clsx(
                        "px-2 py-1 rounded-md text-xs font-medium",
                        el.status === "Pending" &&
                          "bg-yellow-100 text-yellow-800",
                        el.status === "Succeeded" &&
                          "bg-green-100 text-green-800",
                        el.status === "Cancelled" && "bg-red-100 text-red-800"
                      )}
                    >
                      {el.status}
                    </span>
                  )}
                </td>

                {/* Ngày mua */}
                <td className="text-center py-3 px-2">
                  {moment(el.orderDate).format("DD/MM/YYYY HH:mm")}
                </td>

                {/* Địa chỉ giao hàng */}
                <td className="text-left py-3 px-2">
                  {el.shippingAddress || "Không có"}
                </td>

                {/* Hình thức thanh toán */}
                <td className="text-center py-3 px-2">
                  {el.paymentMethod || "Không xác định"}
                </td>

                {/* Hành động */}
                <td className="text-center py-3 px-2">
                  <div className="flex justify-center gap-2 items-center text-blue-500 text-sm">
                    {editingId === el._id ? (
                      <>
                        <span
                          onClick={() => handleUpdate(el._id)}
                          className="hover:underline cursor-pointer"
                        >
                          Lưu
                        </span>
                        <span
                          onClick={() => setEditingId(null)}
                          className="hover:underline cursor-pointer text-red-500"
                        >
                          Hủy
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          onClick={() => {
                            setEditingId(el._id);
                            setValue("status", el.status);
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          Sửa
                        </span>
                        <span
                          onClick={() => handleDeleteProduct(el._id)}
                          className="hover:underline cursor-pointer text-red-500"
                        >
                          Xóa
                        </span>
                      </>
                    )}

                    {editingId !== el._id && (
                      <span
                        onClick={() => handleShowDetail(el._id)}
                        className="hover:underline cursor-pointer text-green-500"
                      >
                        Chi tiết
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="w-full flex justify-end mt-8">
          <Pagination totalCount={counts} />
        </div>
      </div>
    </div>
  );
};

export default ManageOrder;
