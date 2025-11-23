// controllers/chatController.js
const chatService = require("./chat.service");

exports.startConversation = async (req, res, next) => {
  try {
    const { senderId, senderModel, receiverId, receiverModel } = req.body;
    if (senderId.toString() === receiverId?.toString()) {
      return res.status(400).json({
        success: false,
        message: "Không thể chat với chính mình",
      });
    }

    const result = await chatService.getOrCreateConversation(
      senderId,
      senderModel,
      receiverId,
      receiverModel
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const {
      conver_id,
      message_content,
      message_type = "text",
      userId,
    } = req.body;

    if (!userId || !conver_id || !message_content) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const senderId = userId;

    const result = await chatService.sendMessage(
      conver_id,
      senderId,
      message_content,
      message_type,
      req.app
    );

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { conver_id } = req.params;
    const { page } = req.params;
    const result = await chatService.getMessages(conver_id, page);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getMyConversations = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await chatService.getMyConversations(userId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { conver_id } = req.params;
    const { userId } = req.body;
    const io = req.app.get("socketio");

    await chatService.markConversationAsRead(conver_id, userId, io);

    res
      .status(201)
      .json({ success: true, message: "Đánh dấu đã đọc thành công" });
  } catch (err) {
    next(err);
  }
};

exports.deleteConversation = async (req, res, next) => {
  try {
    const { conver_id, userId } = req.body;

    if (!conver_id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu conver_id",
      });
    }

    const result = await chatService.deleteConversation(
      conver_id,
      userId,
      req.app
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.hideConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const { conver_id } = req.params;

    if (!conver_id || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu conver_id, userId" });
    }

    await chatService.hideConversation(conver_id, userId);

    res.json({ success: true, message: "Đã ẩn cuộc trò chuyện" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
