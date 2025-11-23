const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    conver_id: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    // senderInfo: {
    //   id: Schema.Types.ObjectId,
    //   model: { type: String, enum: ["User", "Shop", "Admin"] },
    //   name: String,
    //   avatar: String,
    // },
    message_senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message_content: {
      type: String,
      required: true,
      trim: true,
    },
    message_type: {
      type: String,
      enum: ["text", "image", "file", "order", "system"],
      default: "text",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conver_id: 1, createdAt: -1 });
messageSchema.index({ conver_id: 1, _id: 1 }); // để so sánh đã đọc

module.exports = model("Message", messageSchema);
