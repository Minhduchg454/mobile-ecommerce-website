import {
  apiGetUserOrders,
  apiCancelOrder,
  apiCreatePreview,
  apiFilterPreviews,
  apiGetOrderCountsByStatus,
} from "apis";
import { InputForm, Pagination, VoteOption } from "components";
import withBaseComponent from "hocs/withBaseComponent";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createSearchParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import path from "../../ultils/path";
import { showModal } from "../../store/app/appSlice";
import { toast } from "react-toastify";
import { ORDER_STATUSES } from "ultils/contants";

import { useDispatch, useSelector } from "react-redux";

const tabs = [
  { label: "Tất cả", value: "" },
  { label: "Chờ xác nhận", value: "Pending" },
  { label: "Chờ lấy hàng", value: "Confirmed" },
  { label: "Vận chuyển", value: "Shipping" },
  { label: "Hoàn thành", value: "Succeeded" },
  { label: "Đã hủy", value: "Cancelled" },
];

const History = ({ navigate, location }) => {
  const [orders, setOrders] = useState(null);
  const [counts, setCounts] = useState(0);
  const [params] = useSearchParams();
  const { isLoggedIn, current } = useSelector((state) => state.user);
  const [countsByStatus, setCountsByStatus] = useState({});

  const dispatch = useDispatch();
  const REVIEW_EXPIRE_DAYS = 3;
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      status: "",
      _id: "",
    },
  });

  const status = watch("status");

  const fetchPOrders = async (params) => {
    const response = await apiGetUserOrders({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    });

    if (response.success) {
      setOrders(response.orders);
      setCounts(response.counts || response.orders?.length || 0);
    }
  };

  const fetchCountsByStatus = async () => {
    try {
      const res = await apiGetOrderCountsByStatus({ userId: current._id });

      if (res.success) {
        console.log("Ket qua nhan duoc", res.counts);
        setCountsByStatus(res.counts || {});
      }
    } catch (err) {
      console.error("Failed to fetch counts by status:", err);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Xác nhận hủy đơn hàng?",
      text: "Sau khi hủy, đơn hàng sẽ không thể phục hồi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hủy đơn",
      cancelButtonText: "Đóng",
    });

    if (result.isConfirmed) {
      try {
        await apiCancelOrder(orderId);
        Swal.fire("Đã hủy!", "Đơn hàng đã được hủy.", "success");
        fetchPOrders();
      } catch (error) {
        Swal.fire("Lỗi!", "Không thể hủy đơn hàng.", "error");
        console.error(error);
      }
    }
  };

  //Gửi đánh giá
  const handleSubmitVoteOption = async ({ comment, score, pvid, orderId }) => {
    if (!comment || !pvid || !score) {
      alert("Vui lòng chọn sao và nhập nhận xét!");
      return;
    }
    const res = await apiCreatePreview({
      userId: current._id,
      productVariationId: pvid,
      previewComment: comment,
      previewRating: score,
      orderId: orderId,
    });
    if (res.success) {
      toast.success("Đánh giá thành công");
    } else {
      toast.error("Đánh giá thất bại, vui lòng thử lại sau");
    }
    dispatch(showModal({ isShowModal: false, modalChildren: null }));
  };

  const handleVoteNow = async (productName, pvid, deliveryDate, orderId) => {
    if (!isLoggedIn) {
      const rs = await Swal.fire({
        text: "Vui lòng đăng nhập để đánh giá",
        cancelButtonText: "Hủy",
        confirmButtonText: "Đăng nhập",
        title: "Oops!",
        showCancelButton: true,
      });
      if (rs.isConfirmed) navigate(`/${path.LOGIN}`);
      return;
    }

    const res = await apiFilterPreviews({
      productVariationId: pvid,
      orderId: orderId,
      userId: current._id,
    });

    const preview =
      res?.success && res.previews?.length > 0 ? res.previews[0] : null;

    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <VoteOption
            nameProduct={productName}
            pvid={pvid}
            deliveryDate={deliveryDate}
            handleSubmitVoteOption={handleSubmitVoteOption}
            orderId={orderId}
            expireDays={REVIEW_EXPIRE_DAYS}
            oldPreview={preview}
          />
        ),
      })
    );
  };

  useEffect(() => {
    const pr = Object.fromEntries([...params]);
    fetchPOrders(pr);
    fetchCountsByStatus();
    setValue("status", pr.status || "");
  }, [params]);

  return (
    <div className="w-full relative px-4">
      {/* Bộ lọc tìm kiếm + trạng thái */}
      <div className="sticky top-0 z-10 bg-white shadow-md p-3 rounded-xl flex flex-col">
        {/* Thanh tìm kiếm */}
        <div className="w-full flex">
          <div className="w-full">
            <InputForm
              id="_id"
              register={register}
              errors={errors}
              fullWidth
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
        </div>

        {/* Tabs trạng thái đơn hàng */}
        <div className="flex flex-wrap items-center gap-4 mt-2">
          {tabs.map((tab) => {
            const hiddenCountTabs = ["", "Succeeded", "Cancelled"];
            const shouldShowCount =
              tab.value &&
              !hiddenCountTabs.includes(tab.value) &&
              countsByStatus[tab.value];

            return (
              <button
                key={tab.value}
                onClick={() => {
                  setValue("_id", "");
                  navigate({
                    pathname: location.pathname,
                    search: createSearchParams({
                      status: tab.value,
                    }).toString(),
                  });
                }}
                className={`py-2 px-3 border-b-2 transition-all duration-200 ${
                  (status || "") === tab.value
                    ? "border-orange-500 text-orange-600 font-semibold"
                    : "border-transparent text-gray-700 hover:text-orange-500"
                }`}
              >
                <span>
                  {tab.label}{" "}
                  {shouldShowCount && (
                    <span className="text-orange-500 font-semibold">
                      ({countsByStatus[tab.value]})
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      <div className="space-y-6 mt-3">
        {orders?.length > 0 ? (
          orders.map((el) => (
            <div
              key={el._id}
              className="bg-white rounded-xl shadow-md border p-5 space-y-4"
            >
              {/* Header đơn hàng */}
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-lg text-sky-800">
                  Mã đơn hàng #{el._id}
                </span>
                <span className="text-gray-500">
                  {(() => {
                    const statusInfo = ORDER_STATUSES[el.status];
                    return statusInfo ? (
                      <span
                        className={`px-2 py-1 text-sm rounded-full font-medium ${statusInfo.bg} ${statusInfo.text}`}
                      >
                        {statusInfo.label}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-sm rounded-full font-medium bg-gray-100 text-gray-600">
                        Không xác định
                      </span>
                    );
                  })()}
                </span>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="flex flex-col gap-3">
                {el.items?.map((item) => {
                  const variation = item.productVariationId;
                  const product = variation?.productId;
                  const priceFormatted = item.price?.toLocaleString() + " đ";

                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 border rounded-md p-3 bg-white shadow-sm"
                    >
                      <img
                        src={variation?.images?.[0]}
                        alt="thumb"
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold text-base text-gray-900">
                          {product?.productName || "Tên sản phẩm"}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          Phân loại hàng: {variation?.productVariationName}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="text-red-500  text-base">
                          {priceFormatted}
                        </div>
                        {el.status === "Succeeded" && (
                          <div className="mt-1 text-right">
                            <button
                              className={`text-sm rounded-xl px-2 py-1 transition ${
                                el.deliveryDate &&
                                moment().diff(
                                  moment(el.deliveryDate),
                                  "days"
                                ) <= REVIEW_EXPIRE_DAYS
                                  ? "bg-orange-400 hover:bg-orange-600 text-white hover:scale-103"
                                  : "bg-gray-400 hover:bg-gray-500 text-white"
                              }`}
                              onClick={() =>
                                handleVoteNow(
                                  item.productVariationId?.productId
                                    ?.productName,
                                  item.productVariationId?._id,
                                  el.deliveryDate,
                                  el._id
                                )
                              }
                            >
                              {el.deliveryDate &&
                              moment().diff(moment(el.deliveryDate), "days") <=
                                REVIEW_EXPIRE_DAYS
                                ? "Đánh giá ngay"
                                : "Xem đánh giá"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer đơn hàng */}
              <div className="flex flex-col border-t-2 text-sm ">
                <div className="flex justify-between items-center py-2">
                  <div className="text-sm">
                    <div>
                      Ngày mua:{" "}
                      {moment(el.createdAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                    {el.deliveryDate && (
                      <div>
                        Ngày nhận hàng:{" "}
                        {moment(el.deliveryDate).format("DD/MM/YYYY HH:mm")}
                      </div>
                    )}
                    <div>
                      <span>{`Địa chỉ nhận hàng: ${el.shippingAddress}`}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">{`Tổng tiền: `}</span>
                    <span className="font-semibold  text-red-500 text-xl">
                      {el.totalPrice?.toLocaleString()}₫
                    </span>
                  </div>
                </div>
                {/* Hành động */}
                <div className="border-t-2 pt-2">
                  {el.status === "Pending" && (
                    <div className="flex justify-end items-center">
                      <button
                        className="border rounded-xl px-4 py-2 text-white bg-red-500"
                        onClick={() => handleCancelOrder(el._id)}
                      >
                        Hủy đơn
                      </button>
                    </div>
                  )}
                  {/* {el.status === "Succeeded" && (
                    <div className="flex justify-end items-center">
                      <button
                        className="border rounded-xl p-2 text-white bg-orange-400"
                        onClick={() => {}}
                      >
                        Đánh giá
                      </button>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400 text-lg italic">
            Không có đơn hàng nào phù hợp
          </div>
        )}
      </div>

      {/* Phân trang */}
      <div className="w-full flex justify-end my-8">
        <Pagination totalCount={counts} />
      </div>
    </div>
  );
};

export default withBaseComponent(History);
