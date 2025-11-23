const Conversation = require("./entities/conversation.model");
const Participant = require("./entities/participant.model");
const Message = require("./entities/message.model");
const mongoose = require("mongoose");

exports.getOrCreateConversation = async (
  senderId, //Nguoi gui, nguoi muon tro chuyen
  senderModel,
  receiverId,
  receiverModel
) => {
  const sId = new mongoose.Types.ObjectId(senderId);
  const rId = new mongoose.Types.ObjectId(receiverId);

  const existing = await Participant.aggregate([
    {
      $match: {
        isDeleted: false,
        $or: [
          { userId: sId, userModel: senderModel },
          { userId: rId, userModel: receiverModel },
        ],
      },
    },
    {
      $group: {
        _id: "$conver_id",
        participants: {
          $push: { userId: "$userId", userModel: "$userModel" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: 2,
      },
    },
  ]);

  // Kiểm tra kỹ lại logic match (phòng trường hợp trùng ID giữa 2 bảng)
  const foundConver = existing.find((c) => {
    const hasSender = c.participants.some(
      (p) =>
        p.userId.toString() === sId.toString() && p.userModel === senderModel
    );
    const hasReceiver = c.participants.some(
      (p) =>
        p.userId.toString() === rId.toString() && p.userModel === receiverModel
    );
    return hasSender && hasReceiver;
  });

  if (foundConver) {
    const conversation = await Conversation.findById(foundConver._id);

    await Participant.updateOne(
      { conver_id: foundConver._id, userId: sId },
      {
        $set: {
          isHidden: false,
          isDeleted: false,
        },
      }
    );

    return {
      success: true,
      message: "Đã tìm thấy cuộc hội thoại cũ",
      conversation: conversation,
    };
  }

  // 2. Nếu chưa có -> Tạo mới
  const conversation = await Conversation.create({});

  // Lưu participant kèm theo userModel
  await Participant.create([
    {
      conver_id: conversation._id,
      userId: sId,
      userModel: senderModel,
      updatedAt: new Date(),
    },
    {
      conver_id: conversation._id,
      userId: rId,
      userModel: receiverModel,
      updatedAt: new Date(),
    },
  ]);

  return {
    success: true,
    message: "Tạo cuộc hội thoại thành công",
    conversation,
  };
};

// services/chatService.js

// services/chatService.js
exports.sendMessage = async (
  conver_id,
  senderId,
  content,
  type = "text",
  app
) => {
  const message = await Message.create({
    conver_id,
    message_senderId: senderId,
    message_content: content,
    message_type: type,
  });

  await Conversation.findByIdAndUpdate(conver_id, {
    conver_lastMessageId: message._id,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate(
      "message_senderId",
      "userFirstName userLastName userAvatar shopName shopLogo"
    )
    .lean();

  await Participant.updateMany(
    { conver_id: conver_id },
    { $set: { isHidden: false, isDeleted: false } }
  );

  if (app) {
    const io = app.get("socketio");

    // 1. Gửi tin nhắn cho cả room (hiển thị realtime)
    io.to(conver_id.toString()).emit("new_message", {
      ...populatedMessage,
      conver_id: conver_id.toString(),
    });

    // 2. Lấy danh sách participant
    const participants = await Participant.find({ conver_id }).select("userId");

    // 3. Gửi cập nhật preview + unread count cho từng người
    participants.forEach((p) => {
      const userIdStr = p.userId.toString();
      const isSender = userIdStr === senderId.toString();

      io.to(userIdStr).emit("conversation_updated", {
        conver_id: conver_id.toString(),
        lastMessage: populatedMessage,
        unreadCount: isSender ? 0 : null,
        isSender,
      });
    });
  }

  return {
    success: true,
    message: "Gửi tin nhắn thành công",
    populatedMessage,
  };
};

exports.markAsRead = async (conver_id, userId) => {
  const lastMessage = await Message.findOne({ conver_id }).sort({ _id: -1 });
  const update = lastMessage
    ? { lastReadMessageId: lastMessage._id }
    : { lastReadMessageId: null };
  await Participant.findOneAndUpdate({ conver_id, userId }, update);
};

exports.getUnreadCount = async (conver_id, userId) => {
  const participant = await Participant.findOne({ conver_id, userId });
  if (!participant || !participant.lastReadMessageId) {
    return await Message.countDocuments({ conver_id });
  }
  return await Message.countDocuments({
    conver_id,
    _id: { $gt: participant.lastReadMessageId },
  });
};

exports.getMessages = async (conver_id, page = 1, limit = 30) => {
  const messages = await Message.find({ conver_id, isDeleted: false })
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("message_senderId", "userFirstName userLastName userAvatar")
    .lean();

  return {
    success: true,
    message: "Lấy tin nhắn thành công",
    messages: messages.reverse(),
  };
};

exports.getMyConversations = async (userId) => {
  const participants = await Participant.find({
    userId,
    isDeleted: false,
    isHidden: false,
  })
    .sort({ updatedAt: -1 })
    .populate({
      path: "conver_id",
      populate: {
        path: "conver_lastMessageId",
        populate: {
          path: "message_senderId",
          select: "userFirstName userLastName userAvatar shopName shopLogo",
        },
      },
    })
    .lean();

  const result = await Promise.all(
    participants.map(async (p) => {
      if (!p.conver_id) return null;

      const unread = await exports.getUnreadCount(p.conver_id._id, userId);

      // Tìm người kia (Đối phương)
      const otherParticipant = await Participant.findOne({
        conver_id: p.conver_id._id,
        userId: { $ne: userId },
      }).populate({
        path: "userId",
        select: "userFirstName userLastName userAvatar shopName shopLogo",
      });

      let finalOtherUser = null;
      if (otherParticipant && otherParticipant.userId) {
        const raw = otherParticipant.userId;
        finalOtherUser = {
          _id: raw._id,
          role: otherParticipant.userModel,
          userName:
            raw.shopName ||
            `${raw.userLastName || ""} ${raw.userFirstName || ""}`.trim(),
          userAvatar: raw.shopLogo || raw.userAvatar,
        };
      }

      return {
        conversation: p.conver_id,
        otherUser: finalOtherUser,
        unreadCount: unread,
      };
    })
  );

  return {
    success: true,
    message: "Lấy hội thoại thành công",
    conversation: result.filter((r) => r !== null),
  };
};

exports.markConversationAsRead = async (conver_id, userId, io = null) => {
  const lastMessage = await Message.findOne({ conver_id }).sort({
    createdAt: -1,
  });

  await Participant.findOneAndUpdate(
    { conver_id, userId },
    {
      lastReadMessageId: lastMessage?._id || null,
      updatedAt: new Date(),
    }
  );

  // Trong markConversationAsRead
  if (io) {
    io.to(conver_id.toString()).emit("message_read", {
      conver_id: conver_id.toString(),
      readerId: userId,
    });

    // PHẢI GỬI lastMessage ĐI CÙNG để client cập nhật preview!
    const latestMsg = await Message.findOne({ conver_id })
      .sort({ createdAt: -1 })
      .lean();

    io.to(userId.toString()).emit("conversation_updated", {
      conver_id: conver_id.toString(),
      lastMessage: latestMsg, // BẮT BUỘC CÓ
      unreadCount: 0,
    });
  }
};

exports.deleteConversation = async (conver_id, userId, app) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Kiểm tra user có tham gia cuộc trò chuyện này không
    const participant = await Participant.findOne({
      conver_id,
      userId,
      isDeleted: false,
    });

    if (!participant) {
      throw new Error("Bạn không tham gia cuộc trò chuyện này");
    }

    // 2. XÓA THẬT: Message → Participant → Conversation
    await Message.deleteMany({ conver_id }).session(session);
    await Participant.deleteMany({ conver_id }).session(session);
    await Conversation.findByIdAndDelete(conver_id).session(session);

    await session.commitTransaction();

    // 3. Realtime: thông báo cho tất cả người còn lại trong cuộc trò chuyện (nếu có)
    if (app) {
      const io = app.get("socketio");

      // Gửi cho tất cả người từng tham gia (trừ người xóa - vì họ đã xóa rồi)
      const remainingParticipants = await Participant.find({
        conver_id,
        userId: { $ne: userId },
      }).select("userId");

      // Thông báo realtime: "cuộc trò chuyện này đã bị xóa"
      io.to(conver_id.toString()).emit("conversation_deleted", {
        conver_id,
        deletedBy: userId,
      });

      // Gửi riêng cho từng user còn lại để họ xóa khỏi danh sách
      remainingParticipants.forEach((p) => {
        io.to(p.userId.toString()).emit("conversation_deleted", {
          conver_id,
          deletedBy: userId,
        });
      });

      console.log(`Conversation ${conver_id} đã bị xóa bởi ${userId}`);
    }

    return {
      success: true,
      message: "Xóa cuộc trò chuyện thành công",
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

exports.hideConversation = async (conver_id, userId) => {
  const result = await Participant.updateOne(
    { conver_id, userId },
    { isHidden: true, updatedAt: new Date() }
  );

  if (result.modifiedCount === 0) {
    throw new Error("Không tìm thấy cuộc trò chuyện hoặc đã ẩn rồi");
  }

  return {
    success: true,
    message: "Đã ẩn cuộc trò chuyện thành công",
  };
};
