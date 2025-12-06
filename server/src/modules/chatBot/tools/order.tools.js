// tools/order.tools.js
const orderService = require("../../order/order.service");
const { ResultTypeEnum } = require("../typeEnum/resultTypeEnum");

const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(amount)
    .replace("₫", "đ");

const STATUS_ORDER = ["Pending", "Confirmed", "Shipping", "Delivered"];

// 1. Định nghĩa BADGE (Thay thế cho statusColorMap và orderStatusMap cũ)
const STATUS_BADGE = {
  Pending: {
    label: "Chờ xác nhận",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  Confirmed: {
    label: "Chờ lấy hàng",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  Shipping: {
    label: "Vận chuyển",
    bg: "bg-sky-100",
    text: "text-sky-700",
  },
  Delivered: {
    label: "Đã giao",
    bg: "bg-cyan-100",
    text: "text-cyan-700",
  },
  Succeeded: {
    label: "Hoàn thành",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  Cancelled: {
    label: "Đã hủy",
    bg: "bg-gray-200",
    text: "text-gray-700",
  },
};

exports.check_order_status = async ({ orderId } = {}) => {
  const current = global.current || {};
  const userId = current._id;
  const roles = current.roles || [];

  if (!userId) {
    return {
      type: ResultTypeEnum.TEXT,
      text: "Vui lòng đăng nhập để kiểm tra đơn hàng.",
    };
  }

  const isAdmin = roles.includes("admin");
  const isShop = roles.includes("shop");

  if (orderId) {
    return exports.get_order_detail({ orderId });
  }

  try {
    const customerOrders = await orderService.getOrdersByUserId(
      { customerId: userId },
      { sort: "-createdAt" }
    );

    const shopOrders = isShop
      ? await orderService.getOrdersByUserId(
          { shopId: userId },
          { sort: "-createdAt" }
        )
      : { success: true, data: [] };

    const custData = (customerOrders.success && customerOrders.data) || [];
    const shopData = (shopOrders.success && shopOrders.data) || [];

    const filterActiveStatus = (orders) =>
      orders.filter((o) =>
        STATUS_ORDER.includes(o.orderStatusId?.orderStatusName)
      );

    const activeCust = filterActiveStatus(custData);
    const activeShop = filterActiveStatus(shopData);

    if (!activeCust.length && !activeShop.length) {
      return {
        type: ResultTypeEnum.TEXT,
        text: "Bạn không có đơn hàng đang xử lý.",
      };
    }

    // --- HÀM GROUP VÀ RENDER HTML VỚI BADGE ---
    const groupAndSort = (orders, prefix = "") => {
      const groups = {};

      // Phân loại đơn hàng
      orders.forEach((o) => {
        const statusEn = o.orderStatusId?.orderStatusName;
        if (!STATUS_ORDER.includes(statusEn)) return;

        // Lấy thông tin Badge tương ứng
        const badge = STATUS_BADGE[statusEn];
        if (!badge) return;

        if (!groups[statusEn]) groups[statusEn] = { badge, list: [] };
        groups[statusEn].list.push(o);
      });

      let text = "";

      STATUS_ORDER.forEach((statusEn) => {
        if (!groups[statusEn]) return;
        const { badge, list } = groups[statusEn];

        const badgeHtml = `
<span class="${badge.bg} ${badge.text} ">
  ${badge.label} (${list.length})
</span>`;

        const items = list
          .map((o) => `${prefix}#${o._id} - ${formatMoney(o.orderTotalPrice)}`)
          .join("\n");

        text += `${badgeHtml}${items}`;
      });

      return text.trim();
    };
    // -------------------------------------------

    // TẠO PHẢN HỒI
    let response = "";

    if (activeCust.length) {
      response += "**Đơn hàng của bạn**\n";
      response += groupAndSort(activeCust);
    }

    if (isShop && activeShop.length) {
      response += "\n\n**Đơn hàng cửa hàng**\n";
      response += groupAndSort(activeShop, "[Shop] ");
    }

    response +=
      "\n\n Gõ mã đơn (ví dụ: #69199047806fa0f502e1473d) để xem chi tiết.";

    return {
      type: ResultTypeEnum.TEXT,
      text: response.trim(),
    };
  } catch (err) {
    console.error("check_order_status error:", err);
    return {
      type: ResultTypeEnum.TEXT,
      text: "Lỗi hệ thống khi kiểm tra đơn hàng.",
    };
  }
};

exports.get_order_detail = async ({ orderId }) => {
  const current = global.current || {};
  const userId = current._id;

  if (!userId) {
    return {
      type: ResultTypeEnum.TEXT,
      text: "Vui lòng đăng nhập để tra cứu đơn hàng",
    };
  }

  if (!orderId) {
    return {
      type: ResultTypeEnum.TEXT,
      text: "Vui lòng cung cấp mã đơn hàng.",
    };
  }

  try {
    const res = await orderService.getOrderById(orderId);
    const order = res.success && res.data[0];

    if (!order) {
      return {
        type: ResultTypeEnum.TEXT,
        text: "Không tìm thấy đơn hàng này hoặc bạn không có quyền xem.",
      };
    }

    return {
      type: ResultTypeEnum.DISPLAY,
      displayType: ResultTypeEnum.DISPLAY_ORDER_DETAIL,
      information: `Chi tiết đơn hàng #${order._id}`,
      data: [order],
    };
  } catch (err) {
    console.error("get_order_detail error:", err);
    return {
      type: ResultTypeEnum.TEXT,
      text: "Lỗi hệ thống khi xem chi tiết đơn.",
    };
  }
};

exports.get_revenue_stats = async () => {
  const current = global.current || {};
  const isAdmin = current.roles?.includes("admin");

  if (!isAdmin) {
    return {
      type: ResultTypeEnum.TEXT,
      text: "Bạn không có quyền xem thống kê doanh thu.",
    };
  }

  try {
    const res = await orderService.getOrderDashboardStats({});
    if (!res.success) throw new Error("Lỗi lấy thống kê");

    const s = res.data.summary;
    const byStatus = res.data.byStatus || [];

    let statusReport = "";
    if (byStatus.length > 0) {
      byStatus.forEach((status) => {
        const statusLabel = STATUS_BADGE[status._id]?.label || status._id;

        const revenue = formatMoney(status.revenue);
        const count = status.count;
        statusReport += `${statusLabel}: ${count} đơn (${revenue})\n`;
      });
    } else {
      statusReport += "\n_Không có dữ liệu chi tiết._";
    }

    return {
      type: ResultTypeEnum.TEXT,
      text: `
**Thống kê doanh thu (toàn hệ thống)**
Tổng doanh thu: ${formatMoney(s.totalRevenue)}  
Tổng đơn hàng: ${s.totalOrders}

**Chi tiết theo trạng thái**:
${statusReport}
      `.trim(),
    };
  } catch (err) {
    console.error("get_revenue_stats error:", err);
    return {
      type: ResultTypeEnum.TEXT,
      text: "Lỗi hệ thống khi lấy thống kê.",
    };
  }
};
