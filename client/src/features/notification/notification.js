import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showAlert } from "store/app/appSlice";
import {
  apiMarkAllRead,
  apiMarkRead,
  apiDeleteAllNotification,
} from "../../services/notification.api";
import noNoti from "../../assets/noNoti.png";
import moment from "moment";
import { FaCheck } from "react-icons/fa";
import {
  fetchNotifications,
  fetchUnreadCount,
} from "../../store/notification/asynsAction";
import { getSocket } from "../../ultils/socket";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import path from "ultils/path";
import { FiBox } from "react-icons/fi"; // sản phẩm
import { HiOutlineClipboardList } from "react-icons/hi"; // đơn hàng
import { HiOutlineBuildingStorefront } from "react-icons/hi2"; // shop
import { HiOutlineUserCircle } from "react-icons/hi2"; // hệ thống

const typeConfig = {
  ORDER_STATUS_UPDATE: {
    icon: <HiOutlineClipboardList size={30} className="text-purple-600" />,
    color: "border-purple-500 bg-purple-50",
    getLink: (sourceId, userId) =>
      `/${path.CUSTOMER}/${userId}/${path.C_ORDER}/${sourceId}`,
  },
  ORDER_CREATED: {
    icon: <HiOutlineClipboardList size={30} className="text-yellow-400" />,
    color: "border-indigo-500 bg-indigo-50",
    getLink: (sourceId, userId) =>
      `/${path.CUSTOMER}/${userId}/${path.C_ORDER}/${sourceId}`,
  },
  ORDER_CANCELLED: {
    icon: <HiOutlineClipboardList size={30} className="text-red-600" />,
    color: "border-indigo-500 bg-indigo-50",
    getLink: (sourceId, userId) =>
      `/${path.CUSTOMER}/${userId}/${path.C_ORDER}/${sourceId}`,
  },

  // SHOP
  PRODUCT_STATUS_UPDATE: {
    icon: <FiBox size={30} className="text-blue-600 " />,
    color: "border-blue-500 bg-blue-50",
    getLink: (sourceId, userId) =>
      `/${path.SELLER}/${userId}/${path.S_MANAGE_PRODUCTS}`,
  },
  PRODUCT_CREATED: {
    icon: <FiBox size={30} className="text-green-600" />,
    color: "border-green-500 bg-green-50",
    getLink: (sourceId, userId) =>
      `/${path.SELLER}/${userId}/${path.S_MANAGE_PRODUCTS}`,
  },

  SHOP_ORDER_CREATED: {
    icon: <HiOutlineClipboardList size={30} className="text-yellow-400" />,
    color: "border-indigo-500 bg-indigo-50",
    getLink: (sourceId, userId) =>
      `/${path.SELLER}/${userId}/${path.S_ORDER}/${sourceId}`,
  },

  SHOP_STATUS_UPDATE: {
    icon: <HiOutlineBuildingStorefront size={30} className="text-orange-600" />,
    color: "border-orange-500 bg-orange-50",
    getLink: (sourceId, userId) =>
      `/${path.SELLER}/${userId}/${path.S_DASHBOARD}`,
  },

  SHOP_CREATED: {
    icon: <HiOutlineBuildingStorefront size={30} className="text-amber-400" />,
    color: "border-teal-500 bg-teal-50",
    getLink: (sourceId, userId) =>
      `/${path.SELLER}/${userId}/${path.S_DASHBOARD}`,
  },

  BRAND_STATUS_UPDATE: {
    icon: <HiOutlineBuildingStorefront size={30} className="text-teal-600" />,
    color: "border-orange-500 bg-orange-50",
    getLink: (sourceId, userId) =>
      `/${path.SELLER}/${userId}/${path.S_MANAGE_PRODUCTS}`,
  },

  //ADMIN
  BRAND_CREATE: {
    icon: <HiOutlineBuildingStorefront size={30} className="text-teal-600" />,
    color: "border-teal-500 bg-teal-50",
    getLink: (sourceId, userId) =>
      `/${path.ADMIN}/${userId}/${path.A_MANAGE_BRANDS}`,
  },

  // HỆ THỐNG / MẶC ĐỊNH
  SYSTEM: {
    icon: <HiOutlineUserCircle size={30} className="text-gray-600" />,
    color: "border-gray-400 bg-gray-50",
    getLink: () => "/notifications",
  },
};

export const Notification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { notifications, loading, unreadCount } = useSelector(
    (state) => state.notification
  );
  const { current } = useSelector((state) => state.user);
  const disable = unreadCount === 0;

  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isChoose, setIsChoose] = useState(false);

  // Tải thông báo
  useEffect(() => {
    if (current?._id) {
      dispatch(fetchNotifications());
    }
  }, [current, dispatch]);

  // Realtime
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
    };

    socket.on("new_notification", handleUpdate);
    socket.on("update_unread_count", handleUpdate);

    return () => {
      socket.off("new_notification", handleUpdate);
      socket.off("update_unread_count", handleUpdate);
    };
  }, [dispatch]);

  const handleDeleteAllNotifications = async () => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: async () => {
        const res = await apiDeleteAllNotification({ userId: current._id });
        if (!res?.success) {
          dispatch(
            showAlert({
              title: "Lỗi",
              message: res?.message || "Vui lòng thử lại",
              variant: "danger",
              showConfirmButton: false,
            })
          );
        }
        dispatch(fetchNotifications());
        dispatch(fetchUnreadCount());
      },
      onCancel: () => {},
      onClose: () => {},
    });

    dispatch(
      showAlert({
        id,
        title: "Bạn có chắc chắn muốn xóa tất cả thông báo không",
        variant: "danger",
        showCancelButton: true,
        confirmText: "Có",
        cancelText: "Không",
      })
    );
  };

  const handleNotificationClick = async (notification) => {
    if (isChoose) {
      toggleSelectNotification(notification._id);
      return;
    }

    if (!notification.isRead) {
      try {
        await apiMarkRead({
          notificationIds: [notification._id],
          userId: current._id,
        });
      } catch (error) {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: "Không thể đánh dấu đã đọc",
            variant: "danger",
            duration: 1500,
          })
        );
      }
    }

    const config = typeConfig[notification.type] || typeConfig.SYSTEM;
    const link = notification.sourceId
      ? config.getLink(notification.sourceId._id, current._id)
      : config.getLink();

    navigate(link);
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
  };

  const toggleSelectNotification = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
    );
  };

  const handleMarkRead = async () => {
    if (selectedNotifications.length === 0) return;
    try {
      const res = await apiMarkRead({
        userId: current._id,
        notificationIds: selectedNotifications,
      });

      if (!res?.success) throw new Error(res?.message);

      dispatch(
        showAlert({
          title: "Thành công",
          message: `Đã đánh dấu ${selectedNotifications.length} thông báo`,
          variant: "success",
          duration: 1500,
          showConfirmButton: false,
        })
      );
      setSelectedNotifications([]);
      setIsChoose(false);
      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
    } catch (error) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: error.message || "Không thể đánh dấu đã đọc",
          variant: "danger",
          duration: 1500,
        })
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await apiMarkAllRead({ userId: current._id });
      if (!res?.success) throw new Error(res?.message);

      dispatch(
        showAlert({
          title: "Thành công",
          message: "Tất cả thông báo đã được đánh dấu là đã đọc",
          variant: "success",
          duration: 1500,
          showConfirmButton: false,
        })
      );

      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
    } catch (error) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không thể đánh dấu tất cả",
          variant: "danger",
          duration: 1500,
        })
      );
    }
  };

  return (
    <div className="xl:mx-auto xl:w-main p-2 md:p-4">
      <div className="mb-4 px-2 md:px-4 flex justify-between items-center text-sm">
        <h2 className="text-lg md:text-xl font-bold">Thông báo</h2>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteAllNotifications}
            className="bg-white border px-2 py-1 rounded-3xl text-sm"
          >
            Xóa tất cả
          </button>
          {isChoose && selectedNotifications.length > 0 && (
            <button
              onClick={handleMarkRead}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-3xl text-sm"
            >
              Đánh dấu đã đọc ({selectedNotifications.length})
            </button>
          )}
          {!disable && (
            <button
              onClick={() => {
                setIsChoose(!isChoose);
                if (isChoose) setSelectedNotifications([]);
              }}
              className="bg-white border px-2 py-1 rounded-3xl text-sm"
            >
              {isChoose ? "Thoát" : "Chọn"}
            </button>
          )}

          <button
            disabled={disable}
            onClick={handleMarkAllRead}
            className="bg-button-bg-ac hover:bg-button-bg-hv border px-2 py-1 rounded-3xl text-white text-sm  disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:gap-4">
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => {
            const config = typeConfig[n.type] || typeConfig.SYSTEM;
            const isSelected = selectedNotifications.includes(n._id);

            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`rounded-3xl border flex p-2 md:p-4 cursor-pointer transition-all relative ${
                  !n.isRead ? "bg-blue-100 border-button-bg-ac" : "bg-white"
                } ${isChoose ? "pl-8" : ""}`}
              >
                {/* ICON */}
                <div className="mr-3 flex items-center">{config.icon}</div>

                {/* NỘI DUNG */}
                <div className="flex flex-col flex-1">
                  <p className="font-semibold text-base">{n.title}</p>
                  <p className="text-sm">{n.message}</p>

                  <p className="text-xs text-gray-400">
                    {moment(n.createdAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>

                {/* CHECKBOX */}
                {isChoose && (
                  <div className="relative w-5 h-5 border-[1px] border-black rounded-full">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectNotification(n._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="peer appearance-none"
                    />
                    <FaCheck className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-black opacity-0 peer-checked:opacity-100 text-xs" />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center w-full h-[500px] mb-4">
            <img
              src={noNoti}
              alt="Không có dữ liệu"
              className="w-36 h-36 mb-2"
            />
            <p className="text-center italic text-gray-400 mb-2">
              Không có thông báo mới
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-button-bg-ac hover:bg-button-bg-hv rounded-3xl px-3 py-1 text-white text-sm md:text-base"
            >
              Trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Notification);
