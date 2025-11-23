const mongoose = require("mongoose");
const Notification = require("./entities/notification.model");

// Hàm tạo thông báo mới VÀ gửi qua Socket.IO
exports.createNotificationAndEmit = async (data, app) => {
  const { recipientId, recipientRole, title, message, type } = data;

  if (!recipientId || !recipientRole || !title || !message || !type) {
    const err = new Error("Thiếu thông tin bắt buộc để tạo thông báo.");
    err.status = 400;
    throw err;
  }

  if (!["admin", "customer", "shop"].includes(recipientRole)) {
    const err = new Error("Vai trò người nhận không hợp lệ.");
    err.status = 400;
    throw err;
  }

  // --- 1. LƯU VÀO DB ---
  const notification = await Notification.create(data);
  const recipientIdString = notification.recipientId.toString();

  // --- 2. GỬI THÔNG BÁO TỨC THÌ QUA SOCKET.IO ---
  if (app) {
    const io = app.get("socketio");

    if (io) {
      io.to(recipientIdString).emit("new_notification", {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        type: notification.type,
      });
      io.to(recipientIdString).emit("update_unread_count");
    } else {
      console.warn(
        "[Chưa xác minh] Socket.IO instance không được tìm thấy trên app object."
      );
    }
  } else {
    console.warn(
      "[Chưa xác minh] Không nhận được app instance để gửi thông báo Socket.IO."
    );
  }

  return {
    success: true,
    message: "Tạo thông báo thành công và đã cố gắng gửi tức thì",
    notification,
  };
};

// Hàm lấy danh sách thông báo cho người dùng
// services/notification.service.js (hoặc tương tự)
exports.getNotifications = async (userId, query = {}) => {
  const { page = 1, limit = 10 } = query;

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNumber - 1) * limitNumber;

  const filter = { recipientId: userId };

  // Sắp xếp: 1. chưa đọc lên đầu, 2. thời gian mới nhất
  const sortOption = {
    isRead: 1, // false trước, true sau
    createdAt: -1, // mới nhất trước
  };

  const totalCount = await Notification.countDocuments(filter);

  const notifications = await Notification.find(filter)
    .populate({
      path: "sourceId",
    })
    .sort(sortOption)
    .skip(skip)
    .limit(limitNumber);

  const unreadCount = await Notification.countDocuments({
    recipientId: userId,
    isRead: false,
  });

  return {
    success: true,
    notifications,
    totalCount,
    unreadCount,
    currentPage: pageNumber,
    limit: limitNumber,
  };
};

// Hàm đánh dấu một hoặc nhiều thông báo là đã đọc
exports.markAsRead = async (userId, notificationIds) => {
  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    const err = new Error("Cần cung cấp ít nhất một ID thông báo để cập nhật.");
    err.status = 400;
    throw err;
  }

  const result = await Notification.updateMany(
    {
      _id: { $in: notificationIds },
      recipientId: userId,
      isRead: false,
    },
    { $set: { isRead: true } }
  );

  return {
    success: true,
    message: `Đã đánh dấu ${result.modifiedCount} thông báo là đã đọc.`,
  };
};

// Hàm đánh dấu TẤT CẢ thông báo là đã đọc
exports.markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    {
      recipientId: userId,
      isRead: false,
    },
    { $set: { isRead: true } }
  );

  return {
    success: true,
    message: `Đã đánh dấu tất cả (${result.modifiedCount}) thông báo chưa đọc là đã đọc.`,
  };
};

exports.deleteAll = async (userId) => {
  const result = await Notification.deleteMany({
    recipientId: userId,
  });
  return {
    success: true,
    message: `Đã xóa tất cả (${result.deletedCount}) thông báo.`,
    deletedCount: result.deletedCount,
  };
};
