import { apiGetOrders, apiGetUserOrders } from "apis";
import { CustomSelect, InputForm, Pagination } from "components";
import withBaseComponent from "hocs/withBaseComponent";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createSearchParams, useSearchParams } from "react-router-dom";
import { statusOrders } from "ultils/contants";

const History = ({ navigate, location }) => {
  const [orders, setOrders] = useState(null);
  const [counts, setCounts] = useState(0);
  const [params] = useSearchParams();
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm();
  const q = watch("q");
  const status = watch("status");
  const fetchPOrders = async (params) => {
    const response = await apiGetUserOrders({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    });
    if (response.success) {
      setOrders(response.orders);
      setCounts(response.counts);
    }
  };
  useEffect(() => {
    const pr = Object.fromEntries([...params]);
    fetchPOrders(pr);
  }, [params]);

  const handleSearchStatus = ({ value }) => {
    navigate({
      pathname: location.pathname,
      search: createSearchParams({ status: value }).toString(),
    });
  };

  return (
    <div className="w-full relative px-4">
      {/* Bộ lọc tìm kiếm + trạng thái */}
      <div className="w-full mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Thanh tìm kiếm */}
        {/* Thanh tìm kiếm */}
        <div className="flex-1">
          <InputForm
            id="q"
            register={register}
            errors={errors}
            fullWidth
            placeholder="🔍 Tìm kiếm đơn hàng..."
          />
        </div>

        {/* Bộ lọc trạng thái */}
        <div className="w-full md:w-[300px] md:ml-auto">
          <CustomSelect
            options={statusOrders}
            value={status}
            onChange={(val) => handleSearchStatus(val)}
            placeholder="--Chọn trạng thái đơn hàng--"
          />
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      <div className="space-y-6">
        {orders?.map((el, idx) => (
          <div
            key={el._id}
            className="bg-white rounded-lg shadow-md border p-5 space-y-4"
          >
            {/* Thông tin đơn hàng */}
            <div className="flex justify-between items-center border-b pb-3">
              <span className="font-semibold text-lg text-sky-800">
                Đơn hàng #
                {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                  process.env.REACT_APP_LIMIT +
                  idx +
                  1}
              </span>
              <span className="text-sm italic text-gray-500">
                Ngày mua: {moment(el.createdAt).format("DD/MM/YYYY")}
              </span>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {el.products?.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-3 items-center bg-gray-50 rounded-md p-3 border"
                >
                  <img
                    src={item.thumbnail}
                    alt="thumb"
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium text-sm text-gray-800 truncate">
                      {item.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      Số lượng:{" "}
                      <span className="text-main font-semibold">
                        {item.quantity}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng tiền + Trạng thái */}
            <div className="flex justify-between items-center pt-3 border-t text-sm">
              <span className="text-gray-700">
                <span className="font-semibold">Tổng tiền:</span>{" "}
                <span className="text-red-500 font-bold text-base">
                  {el.total} 💲
                </span>
              </span>
              <span className="text-gray-700">
                <span className="font-semibold">Trạng thái:</span>{" "}
                <span className="italic">{el.status}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      <div className="w-full flex justify-end my-8">
        <Pagination totalCount={counts} />
      </div>
    </div>
  );
};

export default withBaseComponent(History);
