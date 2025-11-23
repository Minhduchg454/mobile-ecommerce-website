import path from "./path";
import icons from "./icons";
import {
  MdVerifiedUser,
  MdLocalShipping,
  MdPayment,
  MdSupportAgent,
  MdOutlineDiscount,
  MdReplayCircleFilled,
  MdSecurity,
  MdShoppingCartCheckout,
  MdStarRate,
  MdOutlineCancel,
} from "react-icons/md";

import { IoMdCheckmark } from "react-icons/io";
import { IoLockClosedOutline } from "react-icons/io5";
import { LuFileClock } from "react-icons/lu";

export const bankInfo = {
  bankName: "Vietinbank",
  accountName: "NGUYEN HUU DUC",
  accountNumber: "103874068274",
};

export const sorts = [
  { value: "-minPrice", text: "Giá cao → thấp" },
  { value: "minPrice", text: "Giá thấp → cao" },
  { value: "-totalSold", text: "Bán chạy" },
  { value: "-rating", text: "Đánh giá cao" },
  { value: "nameAsc", text: "Tên A → Z" },
  { value: "nameDesc", text: "Tên Z → A" },
  { value: "newest", text: "Mới nhất" },
  { value: "oldest", text: "Cũ nhất" },
];

export const voteOptions = [
  {
    id: 1,
    text: "Rất tệ",
  },
  {
    id: 2,
    text: "Tệ",
  },
  {
    id: 3,
    text: "Thường",
  },

  {
    id: 4,
    text: "Tốt",
  },
  {
    id: 5,
    text: "Rất tốt",
  },
];

export const roles = [
  {
    code: 1945,
    value: "Admin",
  },
  {
    code: 1979,
    value: "User",
  },
];
export const blockStatus = [
  {
    code: true,
    value: "Blocked",
  },
  {
    code: false,
    value: "Active",
  },
];
export const statusOrders = [
  {
    label: "Đã hủy",
    value: "Cancalled",
  },
  {
    label: "Đã giao",
    value: "Succeed",
  },
];

export const priceRanges = [
  {
    id: "1",
    value: "0-500000",
    text: "Dưới 500K",
  },
  {
    id: "2",
    value: "500000-1000000",
    text: "500K - 1 triệu",
  },
  {
    id: "3",
    value: "1000000-2000000",
    text: "1 - 2 triệu",
  },
  {
    id: "4",
    value: "2000000-10000000",
    text: "2 - 10 triệu",
  },
  {
    id: "5",
    value: "10000000-20000000",
    text: "10 - 20 triệu",
  },
  {
    id: "6",
    value: "20000000-9999999999",
    text: "Trên 20 triệu",
  },
];

export const infoCards = [
  {
    id: 1,
    icon: <MdVerifiedUser />,
    title: "Người mua an tâm",
    description: "Được hoàn tiền 100% nếu hàng không đúng mô tả hoặc lỗi.",
    color: "#00b14f",
  },
  {
    id: 2,
    icon: <MdSecurity />,
    title: "Bảo vệ người bán",
    description: "Hệ thống chống gian lận và quản lý đơn hàng tự động.",
    color: "#ff9500",
  },
  {
    id: 3,
    icon: <MdLocalShipping />,
    title: "Vận chuyển toàn quốc",
    description: "Kết nối hơn 10 đối tác giao hàng uy tín trên toàn quốc.",
    color: "#007aff",
  },
  {
    id: 4,
    icon: <MdPayment />,
    title: "Thanh toán an toàn",
    description: "Hỗ trợ ví điện tử, thẻ ngân hàng, và COD linh hoạt.",
    color: "#34c759",
  },
  {
    id: 5,
    icon: <MdOutlineDiscount />,
    title: "Ưu đãi toàn sàn",
    description: "Săn sale 0đ, freeship, voucher khủng mỗi ngày.",
    color: "#af52de",
  },
  {
    id: 6,
    icon: <MdReplayCircleFilled />,
    title: "Đổi trả dễ dàng",
    description: "Hỗ trợ trả hàng trong 7 ngày nếu không hài lòng.",
    color: "#ff3b30",
  },
  {
    id: 7,
    icon: <MdSupportAgent />,
    title: "Hỗ trợ 24/7",
    description: "Trung tâm trợ giúp và chatbot hoạt động suốt ngày đêm.",
    color: "#5856d6",
  },
  {
    id: 8,
    icon: <MdShoppingCartCheckout />,
    title: "Mua sắm tiện lợi",
    description: "Giao diện thân thiện, theo dõi đơn hàng dễ dàng.",
    color: "#00c7be",
  },
  {
    id: 9,
    icon: <MdStarRate />,
    title: "Đánh giá minh bạch",
    description: "Hệ thống sao và bình luận giúp người mua chọn đúng sản phẩm.",
    color: "#ffd60a",
  },
];

export const STATUS_BADGE = {
  Pending: {
    label: "Chờ xác nhận",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    action: [
      { label: "Xác nhận", value: "Confirmed" },
      { label: "Hủy Đơn", value: "Cancelled" },
    ],
  },
  Confirmed: {
    label: "Chờ lấy hàng",
    bg: "bg-blue-100",
    text: "text-blue-700",
    action: [
      { label: "Giao đơn hàng", value: "Shipping" },
      { label: "Hủy Đơn", value: "Cancelled" },
    ],
  },
  Shipping: {
    label: "Vận chuyển",
    bg: "bg-sky-100",
    text: "text-sky-700",
    action: [{ label: "Đã giao hàng", value: "Delivered" }],
  },
  Delivered: {
    label: "Đã giao",
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    action: [],
  },
  Succeeded: {
    label: "Hoàn thành",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    action: [],
  },
  Cancelled: {
    label: "Đã hủy",
    bg: "bg-gray-200",
    text: "text-gray-700",
    action: [],
  },
};

export const ORDER_STATUSES = {
  Pending: {
    label: "Chờ xác nhận",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  Confirmed: {
    label: "Chờ lấy hàng",
    bg: "bg-blue-100",
    text: "text-blue-800",
  },
  Shipping: {
    label: "Đang giao",
    bg: "bg-indigo-100",
    text: "text-indigo-800",
  },
  Succeeded: {
    label: "Thành công",
    bg: "bg-green-100",
    text: "text-green-800",
  },
  Cancelled: {
    label: "Đã hủy",
    bg: "bg-red-100",
    text: "text-red-800",
  },
};

export const STATUS_LABELS = {
  pending: {
    label: "Đang chờ duyệt",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    note: "Cửa hàng đang chờ phê duyệt. Có thể tạo sản phẩm nhưng chưa được hiển thị trên trang chủ. Không được tạo đơn hàng",
    icon: LuFileClock,
  },
  approved: {
    label: "Đã được duyệt",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    note: "",
    icon: IoMdCheckmark,
  },
  blocked: {
    label: "Đã bị khóa",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    note: "Cửa hàng đã bị tạm khóa. Không thể đăng hoặc chỉnh sửa sản phẩm, sản phẩm cũng không hiển thị cho khách hàng. Có thể hoàn tất các đơn đã giao",
    icon: IoLockClosedOutline,
  },
};

export const BRAND_STATUS_LABELS = {
  pending: {
    label: "Đang chờ duyệt",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    icon: LuFileClock,
  },
  approved: {
    label: "Đã được duyệt",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    icon: IoMdCheckmark,
  },
  blocked: {
    label: "Đã bị khóa",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    icon: IoLockClosedOutline,
  },
  rejected: {
    label: "Không được duyệt",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    icon: MdOutlineCancel,
  },
};

export const canTransition = (current, next) => {
  const transitions = {
    Pending: ["Confirmed", "Cancelled"], // Chờ duyệt → Có thể xác nhận hoặc hủy
    Confirmed: ["Shipping", "Cancelled"], // Đã xác nhận → Có thể giao hoặc hủy
    Shipping: ["Succeeded", "Cancelled"], // Đang giao → Có thể hoàn tất hoặc hủy
    Succeeded: [], // Đã hoàn tất → không được đổi
    Cancelled: [], // Đã hủy → không được đổi
  };
  return transitions[current]?.includes(next);
};

export const APP_INFO = {
  NAME: "GoCart",
  SLOGAN: "Sàn giao dịch điện tử thông minh",
  EMAIL: "support@gocart.vn",
  PHONE: "0589 378 927",
  COPYRIGHT: `© ${new Date().getFullYear()} GoCart. All rights reserved.`,
  ADDRESS:
    "Đại học Cần Thơ, đường 3/2, phường Xuân Khánh, quận Ninh Kiều, TPCT",
};

// config/locations.js
// utils/constants.js
export const locations = {
  "An Giang": {
    center: { lat: 10.38, lng: 105.42 }, // Long Xuyên
    districts: [
      "Long Xuyên",
      "Châu Đốc",
      "Châu Phú",
      "Tân Châu",
      "Châu Thành",
      "Chợ Mới",
      "Tịnh Biên",
      "Tri Tôn",
      "An Phú",
      "Thoại Sơn",
      "Phú Tân",
    ],
  },
  "Bà Rịa - Vũng Tàu": {
    center: { lat: 10.54, lng: 107.13 }, // Vũng Tàu
    districts: [
      "Vũng Tàu",
      "Bà Rịa",
      "Châu Đức",
      "Xuyên Mộc",
      "Long Điền",
      "Đất Đỏ",
      "Phú Mỹ",
      "Côn Đảo",
    ],
  },
  "Bắc Giang": {
    center: { lat: 21.3, lng: 106.2 }, // Bắc Giang
    districts: [
      "Bắc Giang",
      "Hiệp Hòa",
      "Lạng Giang",
      "Lục Nam",
      "Lục Ngạn",
      "Sơn Động",
      "Tân Yên",
      "Việt Yên",
      "Yên Dũng",
      "Yên Thế",
    ],
  },
  "Bắc Kạn": {
    center: { lat: 22.55, lng: 105.8333 }, // Bắc Kạn
    districts: [
      "Bắc Kạn",
      "Pác Nặm",
      "Ba Bể",
      "Ngân Sơn",
      "Bạch Thông",
      "Chợ Đồn",
      "Chợ Mới",
      "Na Rì",
    ],
  },
  "Bạc Liêu": {
    center: { lat: 9.3, lng: 105.7333 }, // Bạc Liêu
    districts: [
      "Bạc Liêu",
      "Hồng Dân",
      "Phước Long",
      "Vĩnh Lợi",
      "Giá Rai",
      "Đông Hải",
      "Hòa Bình",
    ],
  },
  "Bắc Ninh": {
    center: { lat: 21.1833, lng: 106.0667 }, // Bắc Ninh
    districts: [
      "Bắc Ninh",
      "Yên Phong",
      "Quế Võ",
      "Tiên Du",
      "Từ Sơn",
      "Thuận Thành",
      "Gia Bình",
      "Lương Tài",
    ],
  },
  "Bến Tre": {
    center: { lat: 10.2333, lng: 106.3667 }, // Bến Tre
    districts: [
      "Bến Tre",
      "Châu Thành",
      "Chợ Lách",
      "Mỏ Cày Nam",
      "Giồng Trôm",
      "Bình Đại",
      "Ba Tri",
      "Thạnh Phú",
      "Mỏ Cày Bắc",
    ],
  },
  "Bình Định": {
    center: { lat: 14.3, lng: 108.9833 }, // Quy Nhơn
    districts: [
      "Quy Nhơn",
      "An Lão",
      "Hoài Nhơn",
      "Hoài Ân",
      "Phù Mỹ",
      "Vĩnh Thạnh",
      "Tây Sơn",
      "Phù Cát",
      "An Nhơn",
      "Tuy Phước",
      "Vân Canh",
    ],
  },
  "Bình Dương": {
    center: { lat: 11.3333, lng: 106.6667 }, // Thủ Dầu Một
    districts: [
      "Thủ Dầu Một",
      "Bàu Bàng",
      "Dầu Tiếng",
      "Bến Cát",
      "Phú Giáo",
      "Tân Uyên",
      "Dĩ An",
      "Thuận An",
      "Bắc Tân Uyên",
    ],
  },
  "Bình Phước": {
    center: { lat: 11.75, lng: 106.7167 }, // Đồng Xoài
    districts: [
      "Đồng Xoài",
      "Bình Long",
      "Chơn Thành",
      "Phước Long",
      "Đồng Phú",
      "Bù Gia Mập",
      "Lộc Ninh",
      "Bù Đốp",
      "Hớn Quản",
      "Bù Đăng",
      "Phú Riềng",
    ],
  },
  "Bình Thuận": {
    center: { lat: 10.9333, lng: 108.1 }, // Phan Thiết
    districts: [
      "Phan Thiết",
      "La Gi",
      "Tuy Phong",
      "Bắc Bình",
      "Hàm Thuận Bắc",
      "Hàm Thuận Nam",
      "Tánh Linh",
      "Đức Linh",
      "Hàm Tân",
      "Phú Quý",
    ],
  },
  "Cà Mau": {
    center: { lat: 9.1833, lng: 105.15 }, // Cà Mau
    districts: [
      "Cà Mau",
      "U Minh",
      "Thới Bình",
      "Trần Văn Thời",
      "Cái Nước",
      "Đầm Dơi",
      "Năm Căn",
      "Phú Tân",
      "Ngọc Hiển",
    ],
  },
  "Cần Thơ": {
    center: { lat: 10.0454, lng: 105.7469 }, // Ninh Kiều
    districts: [
      "Ninh Kiều",
      "Bình Thủy",
      "Cái Răng",
      "Thốt Nốt",
      "Ô Môn",
      "Phong Điền",
      "Cờ Đỏ",
      "Vĩnh Thạnh",
      "Thới Lai",
    ],
  },
  "Cao Bằng": {
    center: { lat: 22.6667, lng: 106.2667 }, // Cao Bằng
    districts: [
      "Cao Bằng",
      "Bảo Lâm",
      "Bảo Lạc",
      "Hà Quảng",
      "Trùng Khánh",
      "Hạ Lang",
      "Quảng Hòa",
      "Hòa An",
      "Nguyên Bình",
      "Thạch An",
    ],
  },
  "Đà Nẵng": {
    center: { lat: 16.0667, lng: 108.2167 }, // Hải Châu
    districts: [
      "Hải Châu",
      "Thanh Khê",
      "Sơn Trà",
      "Ngũ Hành Sơn",
      "Liên Chiểu",
      "Cẩm Lệ",
      "Hòa Vang",
      "Hoàng Sa",
    ],
  },
  "Đắk Lắk": {
    center: { lat: 12.6833, lng: 108.05 }, // Buôn Ma Thuột
    districts: [
      "Buôn Ma Thuột",
      "Buôn Hồ",
      "Ea H'leo",
      "Ea Súp",
      "Buôn Đôn",
      "Cư M'gar",
      "Krông Búk",
      "Krông Năng",
      "Ea Kar",
      "M'Đrắk",
      "Krông Bông",
      "Krông Pắc",
      "Krông A Na",
      "Lắk",
      "Cư Kuin",
    ],
  },
  "Đắk Nông": {
    center: { lat: 12.25, lng: 107.8 }, // Gia Nghĩa
    districts: [
      "Gia Nghĩa",
      "Đăk Glong",
      "Cư Jút",
      "Đắk Mil",
      "Krông Nô",
      "Đắk Song",
      "Đắk R'Lấp",
      "Tuy Đức",
    ],
  },
  "Điện Biên": {
    center: { lat: 21.3833, lng: 103.0167 }, // Điện Biên Phủ
    districts: [
      "Điện Biên Phủ",
      "Mường Lay",
      "Mường Nhé",
      "Mường Chà",
      "Tủa Chùa",
      "Tuần Giáo",
      "Điện Biên",
      "Điện Biên Đông",
      "Mường Ảng",
      "Nậm Pồ",
    ],
  },
  "Đồng Nai": {
    center: { lat: 10.95, lng: 107.0 }, // Biên Hòa
    districts: [
      "Biên Hòa",
      "Long Khánh",
      "Tân Phú",
      "Vĩnh Cửu",
      "Định Quán",
      "Trảng Bom",
      "Thống Nhất",
      "Cẩm Mỹ",
      "Long Thành",
      "Xuân Lộc",
      "Nhơn Trạch",
    ],
  },
  "Đồng Tháp": {
    center: { lat: 10.3833, lng: 105.6333 }, // Cao Lãnh
    districts: [
      "Cao Lãnh",
      "Sa Đéc",
      "Hồng Ngự",
      "Tân Hồng",
      "Hồng Ngự (H)",
      "Tam Nông",
      "Tháp Mười",
      "Cao Lãnh (H)",
      "Thanh Bình",
      "Lấp Vò",
      "Lai Vung",
      "Châu Thành",
    ],
  },
  "Gia Lai": {
    center: { lat: 13.9833, lng: 108.0 }, // Pleiku
    districts: [
      "Pleiku",
      "An Khê",
      "Ayun Pa",
      "K'Bang",
      "Đắk Đoa",
      "Chư Păh",
      "Ia Grai",
      "Mang Yang",
      "Kông Chro",
      "Đức Cơ",
      "Chư Prông",
      "Chư Sê",
      "Đắk Pơ",
      "Ia Pa",
      "Krông Pa",
      "Phú Thiện",
      "Chư Pưh",
    ],
  },
  "Hà Giang": {
    center: { lat: 22.8, lng: 104.95 }, // Hà Giang
    districts: [
      "Hà Giang",
      "Đồng Văn",
      "Mèo Vạc",
      "Yên Minh",
      "Quản Bạ",
      "Vị Xuyên",
      "Bắc Mê",
      "Hoàng Su Phì",
      "Xín Mần",
      "Bắc Quang",
      "Quang Bình",
    ],
  },
  "Hà Nam": {
    center: { lat: 20.4, lng: 106.0833 }, // Phủ Lý
    districts: [
      "Phủ Lý",
      "Duy Tiên",
      "Kim Bảng",
      "Thanh Liêm",
      "Bình Lục",
      "Lý Nhân",
    ],
  },
  "Hà Nội": {
    center: { lat: 21.0333, lng: 105.85 }, // Hoàn Kiếm
    districts: [
      "Ba Đình",
      "Hoàn Kiếm",
      "Hai Bà Trưng",
      "Đống Đa",
      "Tây Hồ",
      "Cầu Giấy",
      "Thanh Xuân",
      "Hoàng Mai",
      "Long Biên",
      "Hà Đông",
      "Nam Từ Liêm",
      "Bắc Từ Liêm",
      "Thanh Trì",
      "Gia Lâm",
      "Đông Anh",
      "Sóc Sơn",
      "Mê Linh",
      "Ba Vì",
      "Phúc Thọ",
      "Đan Phượng",
      "Hoài Đức",
      "Quốc Oai",
      "Thạch Thất",
      "Chương Mỹ",
      "Thanh Oai",
      "Thường Tín",
      "Phú Xuyên",
      "Ứng Hòa",
      "Mỹ Đức",
      "Sơn Tây",
    ],
  },
  "Hà Tĩnh": {
    center: { lat: 18.3333, lng: 105.6667 }, // Hà Tĩnh
    districts: [
      "Hà Tĩnh",
      "Hồng Lĩnh",
      "Hương Sơn",
      "Đức Thọ",
      "Vũ Quang",
      "Nghi Xuân",
      "Can Lộc",
      "Hương Khê",
      "Thạch Hà",
      "Cẩm Xuyên",
      "Kỳ Anh",
      "Lộc Hà",
      "Kỳ Anh (Thị xã)",
    ],
  },
  "Hải Dương": {
    center: { lat: 20.9167, lng: 106.3167 }, // Hải Dương
    districts: [
      "Hải Dương",
      "Chí Linh",
      "Nam Sách",
      "Kinh Môn",
      "Kim Thành",
      "Thanh Hà",
      "Cẩm Giàng",
      "Bình Giang",
      "Gia Lộc",
      "Tứ Kỳ",
      "Ninh Giang",
      "Thanh Miện",
    ],
  },
  "Hải Phòng": {
    center: { lat: 20.85, lng: 106.6833 }, // Hồng Bàng
    districts: [
      "Hồng Bàng",
      "Lê Chân",
      "Ngô Quyền",
      "Kiến An",
      "Hải An",
      "Đồ Sơn",
      "Dương Kinh",
      "An Dương",
      "An Lão",
      "Kiến Thụy",
      "Tiên Lãng",
      "Vĩnh Bảo",
      "Cát Hải",
      "Thủy Nguyên",
      "Bạch Long Vĩ",
    ],
  },
  "Hậu Giang": {
    center: { lat: 9.7833, lng: 105.5 }, // Vị Thanh
    districts: [
      "Vị Thanh",
      "Ngã Bảy",
      "Châu Thành A",
      "Châu Thành",
      "Phụng Hiệp",
      "Vị Thủy",
      "Long Mỹ",
      "Long Mỹ (H)",
    ],
  },
  "Hòa Bình": {
    center: { lat: 20.8167, lng: 105.3333 }, // Hòa Bình
    districts: [
      "Hòa Bình",
      "Đà Bắc",
      "Kỳ Sơn",
      "Lương Sơn",
      "Kim Bôi",
      "Cao Phong",
      "Tân Lạc",
      "Mai Châu",
      "Lạc Sơn",
      "Yên Thủy",
      "Lạc Thủy",
    ],
  },
  "Hưng Yên": {
    center: { lat: 20.65, lng: 106.05 }, // Hưng Yên
    districts: [
      "Hưng Yên",
      "Văn Lâm",
      "Văn Giang",
      "Yên Mỹ",
      "Mỹ Hào",
      "Ân Thi",
      "Khoái Châu",
      "Kim Động",
      "Tiên Lữ",
      "Phù Cừ",
    ],
  },
  "Khánh Hòa": {
    center: { lat: 12.25, lng: 109.2 }, // Nha Trang
    districts: [
      "Nha Trang",
      "Cam Ranh",
      "Cam Lâm",
      "Vạn Ninh",
      "Ninh Hòa",
      "Khánh Vĩnh",
      "Diên Khánh",
      "Khánh Sơn",
      "Trường Sa",
    ],
  },
  "Kiên Giang": {
    center: { lat: 10.0167, lng: 105.0833 }, // Rạch Giá
    districts: [
      "Rạch Giá",
      "Hà Tiên",
      "Kiên Lương",
      "Hòn Đất",
      "Tân Hiệp",
      "Châu Thành",
      "Giồng Riềng",
      "Gò Quao",
      "An Biên",
      "An Minh",
      "Vĩnh Thuận",
      "Phú Quốc",
      "Kiên Hải",
      "U Minh Thượng",
      "Giang Thành",
    ],
  },
  "Kon Tum": {
    center: { lat: 14.35, lng: 108.0 }, // Kon Tum
    districts: [
      "Kon Tum",
      "Đắk Glei",
      "Ngọc Hồi",
      "Đắk Tô",
      "Kon Plông",
      "Kon Rẫy",
      "Đắk Hà",
      "Sa Thầy",
      "Tu Mơ Rông",
      "Ia H'Drai",
    ],
  },
  "Lai Châu": {
    center: { lat: 22.25, lng: 103.5167 }, // Lai Châu
    districts: [
      "Lai Châu",
      "Tam Đường",
      "Mường Tè",
      "Sìn Hồ",
      "Phong Thổ",
      "Than Uyên",
      "Tân Uyên",
      "Nậm Nhùn",
    ],
  },
  "Lâm Đồng": {
    center: { lat: 11.55, lng: 108.4333 }, // Đà Lạt
    districts: [
      "Đà Lạt",
      "Bảo Lộc",
      "Đam Rông",
      "Lạc Dương",
      "Lâm Hà",
      "Đơn Dương",
      "Đức Trọng",
      "Di Linh",
      "Bảo Lâm",
      "Đạ Huoai",
      "Đạ Tẻh",
      "Cát Tiên",
    ],
  },
  "Lạng Sơn": {
    center: { lat: 21.85, lng: 106.7667 }, // Lạng Sơn
    districts: [
      "Lạng Sơn",
      "Tràng Định",
      "Bình Gia",
      "Văn Lãng",
      "Cao Lộc",
      "Văn Quan",
      "Bắc Sơn",
      "Hữu Lũng",
      "Chi Lăng",
      "Lộc Bình",
      "Đình Lập",
    ],
  },
  "Lào Cai": {
    center: { lat: 22.5, lng: 104.0 }, // Lào Cai
    districts: [
      "Lào Cai",
      "Bát Xát",
      "Mường Khương",
      "Si Ma Cai",
      "Bắc Hà",
      "Bảo Thắng",
      "Bảo Yên",
      "Sa Pa",
      "Văn Bàn",
    ],
  },
  "Long An": {
    center: { lat: 10.5333, lng: 106.4 }, // Tân An
    districts: [
      "Tân An",
      "Kiến Tường",
      "Tân Hưng",
      "Vĩnh Hưng",
      "Mộc Hóa",
      "Tân Thạnh",
      "Thạnh Hóa",
      "Đức Huệ",
      "Đức Hòa",
      "Bến Lức",
      "Thủ Thừa",
      "Tân Trụ",
      "Cần Đước",
      "Cần Giuộc",
      "Châu Thành",
    ],
  },
  "Nam Định": {
    center: { lat: 20.4167, lng: 106.1667 }, // Nam Định
    districts: [
      "Nam Định",
      "Mỹ Lộc",
      "Vụ Bản",
      "Ý Yên",
      "Nghĩa Hưng",
      "Nam Trực",
      "Trực Ninh",
      "Xuân Trường",
      "Giao Thủy",
      "Hải Hậu",
    ],
  },
  "Nghệ An": {
    center: { lat: 18.6667, lng: 105.6667 }, // Vinh
    districts: [
      "Vinh",
      "Cửa Lò",
      "Thái Hòa",
      "Quế Phong",
      "Quỳ Châu",
      "Kỳ Sơn",
      "Tương Dương",
      "Nghĩa Đàn",
      "Quỳ Hợp",
      "Quỳnh Lưu",
      "Con Cuông",
      "Tân Kỳ",
      "Anh Sơn",
      "Diễn Châu",
      "Yên Thành",
      "Đô Lương",
      "Thanh Chương",
      "Nghi Lộc",
      "Nam Đàn",
      "Hưng Nguyên",
      "Hoàng Mai",
    ],
  },
  "Ninh Bình": {
    center: { lat: 20.25, lng: 105.9667 }, // Ninh Bình
    districts: [
      "Ninh Bình",
      "Tam Điệp",
      "Nho Quan",
      "Gia Viễn",
      "Hoa Lư",
      "Yên Khánh",
      "Kim Sơn",
      "Yên Mô",
    ],
  },
  "Ninh Thuận": {
    center: { lat: 11.5667, lng: 108.9833 }, // Phan Rang - Tháp Chàm
    districts: [
      "Phan Rang - Tháp Chàm",
      "Bác Ái",
      "Ninh Sơn",
      "Ninh Hải",
      "Ninh Phước",
      "Thuận Bắc",
      "Thuận Nam",
    ],
  },
  "Phú Thọ": {
    center: { lat: 21.3, lng: 105.2 }, // Việt Trì
    districts: [
      "Việt Trì",
      "Phú Thọ",
      "Đoan Hùng",
      "Hạ Hòa",
      "Thanh Ba",
      "Phù Ninh",
      "Yên Lập",
      "Cẩm Khê",
      "Tam Nông",
      "Lâm Thao",
      "Thanh Sơn",
      "Thanh Thủy",
      "Tân Sơn",
    ],
  },
  "Phú Yên": {
    center: { lat: 13.0833, lng: 109.3 }, // Tuy Hòa
    districts: [
      "Tuy Hòa",
      "Sông Cầu",
      "Đồng Xuân",
      "Tuy An",
      "Sơn Hòa",
      "Sông Hinh",
      "Tây Hòa",
      "Phú Hòa",
      "Đông Hòa",
    ],
  },
  "Quảng Bình": {
    center: { lat: 17.4667, lng: 106.6167 }, // Đồng Hới
    districts: [
      "Đồng Hới",
      "Minh Hóa",
      "Tuyên Hóa",
      "Quảng Trạch",
      "Bố Trạch",
      "Quảng Ninh",
      "Lệ Thủy",
      "Ba Đồn",
    ],
  },
  "Quảng Nam": {
    center: { lat: 15.5833, lng: 107.8 }, // Tam Kỳ
    districts: [
      "Tam Kỳ",
      "Hội An",
      "Tây Giang",
      "Đông Giang",
      "Đại Lộc",
      "Điện Bàn",
      "Duy Xuyên",
      "Quế Sơn",
      "Nam Giang",
      "Phước Sơn",
      "Hiệp Đức",
      "Thăng Bình",
      "Tiên Phước",
      "Bắc Trà My",
      "Nam Trà My",
      "Núi Thành",
      "Phú Ninh",
      "Nông Sơn",
    ],
  },
  "Quảng Ngãi": {
    center: { lat: 15.1167, lng: 108.8 }, // Quảng Ngãi
    districts: [
      "Quảng Ngãi",
      "Bình Sơn",
      "Trà Bồng",
      "Sơn Tịnh",
      "Tư Nghĩa",
      "Sơn Hà",
      "Sơn Tây",
      "Minh Long",
      "Nghĩa Hành",
      "Mộ Đức",
      "Đức Phổ",
      "Ba Tơ",
      "Lý Sơn",
    ],
  },
  "Quảng Ninh": {
    center: { lat: 21.0, lng: 107.3 }, // Hạ Long
    districts: [
      "Hạ Long",
      "Móng Cái",
      "Cẩm Phả",
      "Uông Bí",
      "Bình Liêu",
      "Tiên Yên",
      "Đầm Hà",
      "Hải Hà",
      "Ba Chẽ",
      "Vân Đồn",
      "Đông Triều",
      "Quảng Yên",
      "Cô Tô",
      "Hoành Bồ",
    ],
  },
  "Quảng Trị": {
    center: { lat: 16.8, lng: 107.2 }, // Đông Hà
    districts: [
      "Đông Hà",
      "Quảng Trị",
      "Vĩnh Linh",
      "Hướng Hóa",
      "Gio Linh",
      "Đa Krông",
      "Cam Lộ",
      "Triệu Phong",
      "Hải Lăng",
      "Cồn Cỏ",
    ],
  },
  "Sóc Trăng": {
    center: { lat: 9.6, lng: 105.9833 }, // Sóc Trăng
    districts: [
      "Sóc Trăng",
      "Châu Thành",
      "Kế Sách",
      "Mỹ Tú",
      "Cù Lao Dung",
      "Long Phú",
      "Mỹ Xuyên",
      "Ngã Năm",
      "Thạnh Trị",
      "Vĩnh Châu",
      "Trần Đề",
    ],
  },
  "Sơn La": {
    center: { lat: 21.3333, lng: 103.9167 }, // Sơn La
    districts: [
      "Sơn La",
      "Quỳnh Nhai",
      "Thuận Châu",
      "Mường La",
      "Bắc Yên",
      "Phù Yên",
      "Mộc Châu",
      "Yên Châu",
      "Mai Sơn",
      "Sông Mã",
      "Sốp Cộp",
      "Vân Hồ",
    ],
  },
  "Tây Ninh": {
    center: { lat: 11.3167, lng: 106.1 }, // Tây Ninh
    districts: [
      "Tây Ninh",
      "Tân Biên",
      "Tân Châu",
      "Dương Minh Châu",
      "Châu Thành",
      "Hòa Thành",
      "Gò Dầu",
      "Bến Cầu",
      "Trảng Bàng",
    ],
  },
  "Thái Bình": {
    center: { lat: 20.45, lng: 106.3333 }, // Thái Bình
    districts: [
      "Thái Bình",
      "Quỳnh Phụ",
      "Hưng Hà",
      "Đông Hưng",
      "Thái Thụy",
      "Tiền Hải",
      "Kiến Xương",
      "Vũ Thư",
    ],
  },
  "Thái Nguyên": {
    center: { lat: 21.45, lng: 105.8333 }, // Thái Nguyên
    districts: [
      "Thái Nguyên",
      "Sông Công",
      "Định Hóa",
      "Phú Lương",
      "Đồng Hỷ",
      "Võ Nhai",
      "Đại Từ",
      "Phổ Yên",
      "Phú Bình",
    ],
  },
  "Thanh Hóa": {
    center: { lat: 19.8, lng: 105.7667 }, // Thanh Hóa
    districts: [
      "Thanh Hóa",
      "Bỉm Sơn",
      "Sầm Sơn",
      "Mường Lát",
      "Quan Hóa",
      "Bá Thước",
      "Quan Sơn",
      "Lang Chánh",
      "Ngọc Lặc",
      "Cẩm Thủy",
      "Thạch Thành",
      "Hà Trung",
      "Vĩnh Lộc",
      "Yên Định",
      "Thọ Xuân",
      "Thường Xuân",
      "Triệu Sơn",
      "Thiệu Hóa",
      "Hoằng Hóa",
      "Hậu Lộc",
      "Nga Sơn",
      "Đông Sơn",
      "Quảng Xương",
      "Nông Cống",
      "Tĩnh Gia",
      "Nghi Sơn",
    ],
  },
  "Thừa Thiên Huế": {
    center: { lat: 16.4667, lng: 107.5833 }, // Huế
    districts: [
      "Huế",
      "Phong Điền",
      "Quảng Điền",
      "Phú Vang",
      "Hương Thủy",
      "Hương Trà",
      "A Lưới",
      "Phú Lộc",
      "Nam Đông",
    ],
  },
  "Tiền Giang": {
    center: { lat: 10.3667, lng: 106.3 }, // Mỹ Tho
    districts: [
      "Mỹ Tho",
      "Gò Công",
      "Cai Lậy",
      "Tân Phước",
      "Cái Bè",
      "Cai Lậy (H)",
      "Châu Thành",
      "Chợ Gạo",
      "Gò Công Tây",
      "Gò Công Đông",
      "Tân Phú Đông",
    ],
  },
  "Trà Vinh": {
    center: { lat: 9.9333, lng: 106.3333 }, // Trà Vinh
    districts: [
      "Trà Vinh",
      "Càng Long",
      "Cầu Kè",
      "Tiểu Cần",
      "Châu Thành",
      "Cầu Ngang",
      "Trà Cú",
      "Duyên Hải",
      "Duyên Hải (H)",
    ],
  },
  "Tuyên Quang": {
    center: { lat: 21.8167, lng: 105.2 }, // Tuyên Quang
    districts: [
      "Tuyên Quang",
      "Lâm Bình",
      "Nà Hang",
      "Chiêm Hóa",
      "Hàm Yên",
      "Yên Sơn",
      "Sơn Dương",
    ],
  },
  "Vĩnh Long": {
    center: { lat: 10.25, lng: 105.9833 }, // Vĩnh Long
    districts: [
      "Vĩnh Long",
      "Long Hồ",
      "Mang Thít",
      "Vũng Liêm",
      "Tam Bình",
      "Bình Minh",
      "Trà Ôn",
      "Bình Tân",
    ],
  },
  "Vĩnh Phúc": {
    center: { lat: 21.3167, lng: 105.6 }, // Vĩnh Yên
    districts: [
      "Vĩnh Yên",
      "Phúc Yên",
      "Lập Thạch",
      "Tam Dương",
      "Tam Đảo",
      "Bình Xuyên",
      "Yên Lạc",
      "Vĩnh Tường",
      "Sông Lô",
    ],
  },
  "Yên Bái": {
    center: { lat: 21.7, lng: 104.9 }, // Yên Bái
    districts: [
      "Yên Bái",
      "Nghĩa Lộ",
      "Lục Yên",
      "Văn Yên",
      "Mù Cang Chải",
      "Trấn Yên",
      "Trạm Tấu",
      "Văn Chấn",
      "Yên Bình",
    ],
  },
  "Hồ Chí Minh": {
    center: { lat: 10.8231, lng: 106.6297 }, // Quận 1
    districts: [
      "Quận 1",
      "Quận 3",
      "Quận 4",
      "Quận 5",
      "Quận 6",
      "Quận 7",
      "Quận 8",
      "Quận 10",
      "Quận 11",
      "Quận 12",
      "Bình Tân",
      "Bình Thạnh",
      "Gò Vấp",
      "Phú Nhuận",
      "Tân Bình",
      "Tân Phú",
      "Thành phố Thủ Đức",
      "Bình Chánh",
      "Cần Giờ",
      "Củ Chi",
      "Hóc Môn",
      "Nhà Bè",
    ],
  },
};
