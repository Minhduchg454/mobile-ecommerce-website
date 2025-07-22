import { apiDeleteOrderByAdmin, apiGetOrders, apiUpdateOrder } from "apis";
import { Button, Pagination, InputForm } from "components";
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
  const { register, watch, setValue } = useForm();
  const [orders, setOrders] = useState();
  const [counts, setCounts] = useState(0);
  const [update, setUpdate] = useState(false);
  const [editOrder, setEditOrder] = useState();
  const [queries, setQueries] = useState({ q: "" });

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
    if (queryDecounce) {
      navigate({
        pathname: location.pathname,
        search: createSearchParams({ q: queryDecounce }).toString(),
      });
    } else {
      navigate({
        pathname: location.pathname,
      });
    }
  }, [queryDecounce]);

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    fetchOrders(searchParams);
  }, [params, update]);

  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure remove this order",
      icon: "warning",
      showCancelButton: true,
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const response = await apiDeleteOrderByAdmin(id);
        if (response.success) toast.success(response.mes);
        else toast.error(response.mes);
        render();
      }
    });
  };

  const handleUpdate = async () => {
    console.log("Kich hoat");
    const response = await apiUpdateOrder(editOrder._id, {
      status: watch("status"),
    });

    if (response.success) {
      toast.success(response.mes);
      setUpdate(!update);
      setEditOrder(null);
    } else toast.error(response.mes);
  };

  return (
    <div className={clsx("w-full min-h-screen p-4", editOrder && "pl-16")}>
      {/* Thanh header cố định */}
      <div className="sticky top-0 z-10 shadow p-4 rounded-xl mb-4 flex justify-between items-center bg-[#FFF]">
        <form className="w-full">
          <InputForm
            id="q"
            label=""
            placeholder="🔍 Tìm kiếm đơn hàng theo mã đơn hàng ..."
            fullWidth
            defaultValue={queries.q}
            register={(name, options) => ({
              name,
              onChange: (e) => setQueries({ ...queries, q: e.target.value }),
              ...options,
            })}
            errors={{}}
            validate={{}}
          />
        </form>
      </div>

      {/* Nội dung */}
      <div className="bg-white rounded-xl shadow p-4">
        <table className="table-auto w-full border-collapse text-sm">
          <thead className="bg-title-table text-white uppercase">
            <tr>
              <th className="py-3 px-2">STT</th>
              <th className="py-3 px-2">Mã đơn hàng</th>
              <th className="py-3 px-2">Khách hàng</th>
              <th className="py-3 px-2">Tổng tiền</th>
              <th className="py-3 px-2">Trạng thái</th>
              <th className="py-3 px-2">Ngày mua</th>
              <th className="py-3 px-2">Địa chỉ</th>
              <th className="py-3 px-2">Thanh toán</th>
              <th className="py-3 px-2">Tùy chọn</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((el, idx) => (
              <tr
                key={el._id}
                className="border-b hover:bg-sky-50 transition-all"
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
                <td className="text-center py-3 px-2 font-bold text-red-500">
                  {formatMoney(el.totalPrice) + " đ"}
                </td>

                {/* Trạng thái */}
                <td className="text-center py-3 px-2">
                  {editOrder?._id === el._id ? (
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
                  {moment(el.orderDate).format("DD/MM/YYYY")}
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
                  <div className="flex justify-center gap-2 items-center text-orange-600 text-sm">
                    {editOrder?._id === el._id ? (
                      <span
                        onClick={handleUpdate}
                        className="hover:underline cursor-pointer"
                      >
                        Lưu
                      </span>
                    ) : (
                      <span
                        onClick={() => {
                          setEditOrder(el);
                          setValue("status", el.status);
                        }}
                        className="hover:underline cursor-pointer"
                      >
                        Sửa
                      </span>
                    )}
                    {editOrder && (
                      <span
                        onClick={() => setEditOrder(null)}
                        className="hover:underline cursor-pointer text-blue-600"
                      >
                        Hủy
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
