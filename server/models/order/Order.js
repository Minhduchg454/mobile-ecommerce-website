// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    totalPrice: {
      type: Number, // NumberDouble
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now, // Tự động điền ngày hiện tại khi tạo
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Confirmed", "Shipping", "Succeeded", "Cancelled"],
      default: "Pending",
    },
    // Mối quan hệ với Address (Order "Gắn với" Address)
    // Mỗi Order sẽ tham chiếu đến một Address cụ thể đã được tạo.
    // shippingAddress: {
    //   // Đặt tên rõ ràng hơn là shippingAddress
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Address",
    //   required: true,
    // },
    shippingAddress: {
      type: String,
      required: true,
    },

    // Mối quan hệ với ShippingProvider (Order "Gắn với" ShippingProvider)
    shippingProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingProvider",
      required: false,
    },
    // Bạn có thể muốn thêm trường để lưu trữ người dùng tạo đơn hàng
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    }, // sài tạm
    // paymentId: {
    //   type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Order
    //   ref: "Payment", // Tên model mà chúng ta đang tham chiếu
    //   required: true,
    // },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    toJSON: { virtuals: true }, // Cho phép virtuals xuất hiện khi chuyển đổi sang JSON
    toObject: { virtuals: true }, // Cho phép virtuals xuất hiện khi chuyển đổi sang Object
  }
);

// Định nghĩa virtual field 'orderDetails'
// Mongoose sẽ tìm các OrderDetail có orderId trùng với _id của Order này
orderSchema.virtual("orderDetails", {
  ref: "OrderDetail", // Model để populate
  localField: "_id", // Trường trong Order (model hiện tại)
  foreignField: "orderId", // Trường trong OrderDetail (model được populate)
  justOne: false, // False vì một Order có nhiều OrderDetail
});

// Thêm middleware để đảm bảo các ID tham chiếu tồn tại trước khi lưu
orderSchema.pre("save", async function (next) {
  //   const Address = mongoose.models.Address || mongoose.model("Address");
  const ShippingProvider =
    mongoose.models.ShippingProvider || mongoose.model("ShippingProvider");
  const Customer = mongoose.models.Customer || mongoose.model("Customer");

  try {
    // const addressExists = await Address.findById(this.shippingAddress);
    // if (!addressExists) {
    //   throw new Error("Địa chỉ giao hàng không tồn tại.");
    // }

    const shippingProviderExists = await ShippingProvider.findById(
      this.shippingProviderId
    );
    if (this.shippingProviderId) {
      const shippingProviderExists = await ShippingProvider.findById(
        this.shippingProviderId
      );
      if (!shippingProviderExists) {
        throw new Error("Nhà cung cấp vận chuyển không tồn tại.");
      }
    }

    const customerExists = await Customer.findById(this.customerId);
    if (!customerExists) {
      throw new Error("Khách hàng không tồn tại.");
    }

    next();
  } catch (error) {
    next(error); // Chuyển lỗi đến middleware xử lý lỗi của Express
  }
});

module.exports = mongoose.model("Order", orderSchema);
