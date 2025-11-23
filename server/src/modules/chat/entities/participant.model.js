const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const participantSchema = new Schema(
  {
    conver_id: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "userModel",
    },
    userModel: {
      type: String,
      required: true,
      enum: ["User", "Shop"],
      default: "User",
    },

    lastReadMessageId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isHidden: { type: Boolean, default: false },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

participantSchema.index({ conver_id: 1, userId: 1 }, { unique: true });

participantSchema.index({ userId: 1, updatedAt: -1 });

module.exports = model("Participant", participantSchema);
