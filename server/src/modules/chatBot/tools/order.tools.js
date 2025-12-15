// tools/order.tools.js
const orderService = require("../../order/order.service");
const { ResultTypeEnum } = require("../typeEnum/resultTypeEnum");

const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(amount)
    .replace("₫", "đ");

// Hàm chuyển đổi YYYY-MM-DD sang DD/MM/YYYY
const formatDateVN = (dateString) => {
  if (!dateString) return "";
  try {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};

const STATUS_ORDER = ["Pending", "Confirmed", "Shipping", "Delivered"];

// 1. Định nghĩa BADGE (Thay thế cho statusColorMap và orderStatusMap cũ)
const STATUS_BADGE = {
  Pending: {
    label: "Chờ xác nhận",
    text: "text-yellow-700",
  },
  Confirmed: {
    label: "Chờ lấy hàng",
    text: "text-blue-700",
  },
  Shipping: {
    label: "Vận chuyển",
    text: "text-sky-700",
  },
  Delivered: {
    label: "Đã giao",
    text: "text-cyan-700",
  },
  Succeeded: {
    label: "Hoàn thành",
    text: "text-emerald-700",
  },
  Cancelled: {
    label: "Đã hủy",
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
<span class="${badge.text} font-bold">
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

    let response = "";

    if (activeCust.length) {
      response += "**Đơn hàng của bạn**\n";
      response += groupAndSort(activeCust);
    }

    if (isShop && activeShop.length) {
      response += "\n\n**Đơn hàng cửa hàng**\n";
      response += groupAndSort(activeShop, "[Shop] ");
    }

    const sampleOrder = activeCust[0] || activeShop[0];
    const exampleId = sampleOrder ? sampleOrder._id : "mã_đơn_hàng";

    response += `\n\n **Gõ mã đơn** \n(ví dụ: #${exampleId}) để xem chi tiết.`;

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

// tools/order.tools.js

exports.get_revenue_stats = async ({ from, to } = {}) => {
  const current = global.current || {};
  const isAdmin = current.roles?.includes("admin");

  if (!isAdmin) {
    return {
      type: ResultTypeEnum.TEXT,
      text: "Bạn không có quyền xem thống kê doanh thu.",
    };
  }

  try {
    // Gọi service với tham số from, to (Service của bạn đã hỗ trợ sẵn logic này)
    const res = await orderService.getOrderDashboardStats({ from, to });
    if (!res.success) throw new Error("Lỗi lấy thống kê");

    const s = res.data.summary;
    const byStatus = res.data.byStatus || [];

    // Tạo tiêu đề báo cáo dựa trên tham số
    let timeLabel = "(Toàn thời gian)";
    if (from && to) {
      timeLabel = `(Từ ${formatDateVN(from)} đến ${formatDateVN(to)})`;
    } else if (from) {
      timeLabel = `(Từ ${formatDateVN(from)})`;
    }

    let statusReport = "";
    if (byStatus.length > 0) {
      byStatus.forEach((status) => {
        const statusLabel = STATUS_BADGE[status._id]?.label || status._id;
        const revenue = formatMoney(status.revenue);
        const count = status.count;
        statusReport += `${statusLabel}: ${count} đơn (${revenue})\n`;
      });
    } else {
      statusReport += "\n_Không có dữ liệu trong khoảng thời gian này._";
    }

    return {
      type: ResultTypeEnum.TEXT,
      text: `
**Thống kê doanh thu \n${timeLabel}**
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
