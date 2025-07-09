import { apiDeleteOrderByAdmin, apiGetOrders, apiUpdateStatus } from "apis";
import { Button, InputForm, Pagination } from "components";
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
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm();
  const [orders, setOrders] = useState();
  const [counts, setCounts] = useState(0);
  const [update, setUpdate] = useState(false);
  const [editOrder, setEditOrder] = useState();
  const fetchOrders = async (params) => {
    const response = await apiGetOrders({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    });
    if (response.success) {
      setCounts(response.counts);
      setOrders(response.orders);
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
    const response = await apiUpdateStatus(editOrder._id, {
      status: watch("status"),
    });
    if (response.success) {
      toast.success(response.mes);
      setUpdate(!update);
      setEditOrder(null);
    } else toast.error(response.mes);
  };

  return (
    <div
      className={clsx(
        "w-full bg-gray-50 min-h-screen p-4",
        editOrder && "pl-16"
      )}
    >
      {/* Thanh header cố định */}
      <div className="sticky top-0 z-10 bg-white shadow p-4 rounded-xl mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-sky-800">
          QUẢN LÝ ĐƠN HÀNG
        </h1>
        {editOrder && (
          <div className="flex gap-3 items-center">
            <Button type="button" handleOnClick={handleUpdate}>
              Xác nhận
            </Button>
            <Button
              type="button"
              style="bg-gray-200"
              handleOnClick={() => setEditOrder(null)}
            >
              Hủy
            </Button>
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div className="bg-white rounded-xl shadow p-4">
        <table className="table-auto w-full border-collapse text-sm">
          <thead className="bg-sky-800 text-white uppercase">
            <tr>
              <th className="py-3 px-2">STT</th>
              <th className="py-3 px-2">Người mua</th>
              <th className="py-3 px-2">Sản phẩm</th>
              <th className="py-3 px-2">Tổng tiền</th>
              <th className="py-3 px-2">Trạng thái</th>
              <th className="py-3 px-2">Ngày mua</th>
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
                <td className="text-center py-3 px-2">
                  {el.orderBy?.firstname + " " + el.orderBy?.lastname}
                </td>
                <td className="text-left py-3 px-2">
                  <div className="flex flex-col gap-2 max-w-[400px] mx-auto">
                    {el.products?.map((n) => (
                      <div
                        key={n._id}
                        className="flex gap-2 items-center border-b pb-2"
                      >
                        <img
                          src={n.thumbnail}
                          alt={n.title}
                          className="w-10 h-10 object-cover border rounded"
                        />
                        <div className="flex flex-col text-xs text-gray-700">
                          <span className="font-semibold text-sky-800">
                            {n.title}
                          </span>
                          <span>Màu: {n.color}</span>
                          <span>{formatMoney(n.price)}</span>
                          <span>Số lượng: {n.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="text-center py-3 px-2 font-bold text-red-500">
                  {formatMoney(el.total * 23500) + " VND"}
                </td>
                <td className="text-center py-3 px-2">
                  {editOrder?._id === el._id ? (
                    <select
                      {...register("status")}
                      className="border border-gray-300 rounded-md py-1 px-2 text-sm w-[120px]"
                    >
                      <option value="Cancelled">Cancelled</option>
                      <option value="Succeed">Succeed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  ) : (
                    <span
                      className={clsx(
                        "px-2 py-1 rounded-md text-xs font-medium",
                        el.status === "Pending" &&
                          "bg-yellow-100 text-yellow-800",
                        el.status === "Succeed" &&
                          "bg-green-100 text-green-800",
                        el.status === "Cancelled" && "bg-red-100 text-red-800"
                      )}
                    >
                      {el.status}
                    </span>
                  )}
                </td>
                <td className="text-center py-3 px-2">
                  {moment(el.createdAt).format("DD/MM/YYYY")}
                </td>
                <td className="text-center py-3 px-2">
                  <div className="flex justify-center gap-2 items-center text-orange-600 text-sm">
                    {editOrder?._id === el._id ? (
                      <span
                        onClick={() => setEditOrder(null)}
                        className="hover:underline cursor-pointer"
                      >
                        Về
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
                    <span
                      onClick={() => handleDeleteProduct(el._id)}
                      className="hover:underline cursor-pointer"
                    >
                      Xoá
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr>
                <td
                  colSpan="7"
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
