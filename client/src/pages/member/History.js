import { apiGetUserOrders, apiCancelOrder, apiCreatePreview } from "apis";
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

import { useDispatch, useSelector } from "react-redux";

const tabs = [
  { label: "Tất cả", value: "" },
  { label: "Chờ xác nhận", value: "Pending" },
  { label: "Hoàn thành", value: "Succeeded" },
  { label: "Đã hủy", value: "Cancelled" },
];

const ORDER_STATUS_DISPLAY = {
  Pending: {
    label: "Chờ xác nhận",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  Succeeded: {
    label: "Hoàn thành",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  Cancelled: {
    label: "Đã hủy",
    color: "text-red-600",
    bg: "bg-red-100",
  },
  // fallback
  default: {
    label: "Không xác định",
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
};

const History = ({ navigate, location }) => {
  const [orders, setOrders] = useState(null);
  const [counts, setCounts] = useState(0);
  const [params] = useSearchParams();
  const { isLoggedIn, current } = useSelector((state) => state.user);
  const dispatch = useDispatch();

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
  const handleSubmitVoteOption = async ({ comment, score, pvid }) => {
    if (!comment || !pvid || !score) {
      alert("Vui lòng chọn sao và nhập nhận xét!");
      return;
    }
    const res = await apiCreatePreview({
      userId: current._id,
      productVariationId: pvid,
      previewComment: comment,
      previewRating: score,
    });
    if (res.success) {
      toast.success("Đánh giá thành công");
    } else {
      toast.error("Đánh giá thất bại, vui lòng thử lại sau");
    }
    dispatch(showModal({ isShowModal: false, modalChildren: null }));
  };

  const handleVoteNow = (productName, pvid) => {
    if (!isLoggedIn) {
      Swal.fire({
        text: "Vui lòng đăng nhập để đánh giá",
        cancelButtonText: "Hủy",
        confirmButtonText: "Đăng nhập",
        title: "Oops!",
        showCancelButton: true,
      }).then((rs) => {
        if (rs.isConfirmed) navigate(`/${path.LOGIN}`);
      });
      return;
    }

    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <VoteOption
            nameProduct={productName}
            pvid={pvid}
            handleSubmitVoteOption={handleSubmitVoteOption}
          />
        ),
      })
    );
  };

  useEffect(() => {
    const pr = Object.fromEntries([...params]);
    fetchPOrders(pr);
    setValue("status", pr.status || "");
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
                setValue("_id", _id); // <- cập nhật form state
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
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setValue("_id", ""); // reset form input
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
              {tab.label}
            </button>
          ))}
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
                  <span className="text-xs">Trạng thái:</span>{" "}
                  {(() => {
                    const statusInfo =
                      ORDER_STATUS_DISPLAY[el.status] ||
                      ORDER_STATUS_DISPLAY.default;
                    return (
                      <span
                        className={`px-2 py-1 text-sm rounded-full font-medium ${statusInfo.bg} ${statusInfo.color}`}
                      >
                        {statusInfo.label}
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
                        {el.status === "Succeeded" &&
                          //So ngay troi qua tu ngay mua
                          moment().diff(moment(el.createdAt), "days") <= 3 && (
                            <div className="mt-1 text-right">
                              <button
                                className="text-sm text-white bg-orange-400 hover:bg-orange-600 hover:scale-103 rounded-xl px-2 py-1 transition"
                                onClick={() =>
                                  handleVoteNow(
                                    item.productVariationId?.productId
                                      ?.productName,
                                    item.productVariationId?._id
                                  )
                                }
                              >
                                Đánh giá ngay
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
                  <div className="text-sm italic text-gray-500">
                    Ngày mua: {moment(el.createdAt).format("DD/MM/YYYY")}
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
                        className="border rounded-xl p-2 text-white bg-red-500"
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
