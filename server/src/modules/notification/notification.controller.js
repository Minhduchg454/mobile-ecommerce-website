const notificationService = require("./notification.service");
// [Suy luận] Giả sử req.user chứa thông tin người dùng đã xác thực (như _id)

// 1. Controller lấy danh sách thông báo
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      const err = new Error("Chưa xác thực người dùng.");
      err.status = 401;
      throw err;
    }

    const result = await notificationService.getNotifications(
      userId,
      req.query
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 2. Controller đánh dấu một/nhiều thông báo là đã đọc
exports.markAsRead = async (req, res, next) => {
  try {
    const { notificationIds, userId } = req.body;
    if (!userId) {
      const err = new Error("Chưa xác thực người dùng.");
      err.status = 401;
      throw err;
    }

    const result = await notificationService.markAsRead(
      userId,
      notificationIds
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 3. Controller đánh dấu TẤT CẢ thông báo là đã đọc
exports.markAllAsRead = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      const err = new Error("Chưa xác thực người dùng.");
      err.status = 401;
      throw err;
    }

    const result = await notificationService.markAllAsRead(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      const err = new Error("Chưa xác thực người dùng.");
      err.status = 401;
      throw err;
    }
    const result = await notificationService.deleteAll(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.createNotificationTest = async (req, res, next) => {
  try {
    const notificationData = req.body;
    const result = await notificationService.createNotificationAndEmit(
      notificationData,
      req.app
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
