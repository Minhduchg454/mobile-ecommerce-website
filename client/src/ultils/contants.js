import path from "./path";
import icons from "./icons";
import {
  MdAutorenew,
  MdPayment,
  MdTagFaces,
  MdLocalShipping,
  MdLocalOffer,
} from "react-icons/md";
import { AiOutlineDashboard } from "react-icons/ai";
import {
  MdGroups,
  MdCategory,
  MdStore,
  MdInventory,
  MdOutlineLibraryBooks,
  MdOutlineLocalShipping,
  MdSecurity,
  MdSupportAgent,
  MdStarRate,
  MdBatteryChargingFull,
  MdPhonelinkSetup,
} from "react-icons/md";
import { RiBillLine } from "react-icons/ri";
import { FaTrademark } from "react-icons/fa"; // cho thương hiệu

export const navigation = [
  {
    id: 1,
    value: "TRANG CHỦ",
    path: `/${path.HOME}`,
  },
  {
    id: 2,
    value: "SẢN PHẨM",
    path: `/${path.PRODUCTS}`,
  },
  {
    id: 3,
    value: "DỊCH VỤ",
    path: `/${path.OUR_SERVICES}`,
  },
  {
    id: 4,
    value: "HỖ TRỢ",
    path: `/${path.FAQ}`,
  },
];
const { RiTruckFill, BsShieldShaded, BsReplyFill, FaTty, AiFillGift } = icons;
export const productExtraInfomation = [
  {
    id: "1",
    title: "Guarantee",
    sub: "Quality Checked",
    icon: <BsShieldShaded />,
  },
  {
    id: "2",
    title: "Free Shipping",
    sub: "Free On All Products",
    icon: <RiTruckFill />,
  },
  {
    id: "3",
    title: "Special Gift Cards",
    sub: "Special Gift Cards",
    icon: <AiFillGift />,
  },
  {
    id: "4",
    title: "Free Return",
    sub: "Within 7 Days",
    icon: <BsReplyFill />,
  },
  {
    id: "5",
    title: "Consultancy",
    sub: "Lifetime 24/7/356",
    icon: <FaTty />,
  },
];

export const productInfoTabs = [
  {
    id: 1,
    name: "DISCRIPTION",
    content: `Technology: GSM / HSPA / LTE
        Dimensions: 153.8 x 75.5 x 7.6 mm
        Weight: 154 g
        Display: IPS LCD 5.5 inches
        Resolution: 720 x 1280
        OS: Android OS, v6.0 (Marshmallow)
        Chipset: Octa-core
        CPU: Octa-core
        Internal: 32 GB, 4 GB RAM
        Camera: 13MB - 20 MP`,
  },
  {
    id: 2,
    name: "WARRANTY",
    content: `WARRANTY INFORMATION
        LIMITED WARRANTIES
        Limited Warranties are non-transferable. The following Limited Warranties are given to the original retail purchaser of the following Ashley Furniture Industries, Inc.Products:
        
        Frames Used In Upholstered and Leather Products
        Limited Lifetime Warranty
        A Limited Lifetime Warranty applies to all frames used in sofas, couches, love seats, upholstered chairs, ottomans, sectionals, and sleepers. Ashley Furniture Industries,Inc. warrants these components to you, the original retail purchaser, to be free from material manufacturing defects.`,
  },
  {
    id: 3,
    name: "DELIVERY",
    content: `PURCHASING & DELIVERY
        Before you make your purchase, it’s helpful to know the measurements of the area you plan to place the furniture. You should also measure any doorways and hallways through which the furniture will pass to get to its final destination.
        Picking up at the store
        Shopify Shop requires that all products are properly inspected BEFORE you take it home to insure there are no surprises. Our team is happy to open all packages and will assist in the inspection process. We will then reseal packages for safe transport. We encourage all customers to bring furniture pads or blankets to protect the items during transport as well as rope or tie downs. Shopify Shop will not be responsible for damage that occurs after leaving the store or during transit. It is the purchaser’s responsibility to make sure the correct items are picked up and in good condition.
        Delivery
        Customers are able to pick the next available delivery day that best fits their schedule. However, to route stops as efficiently as possible, Shopify Shop will provide the time frame. Customers will not be able to choose a time. You will be notified in advance of your scheduled time frame. Please make sure that a responsible adult (18 years or older) will be home at that time.
        In preparation for your delivery, please remove existing furniture, pictures, mirrors, accessories, etc. to prevent damages. Also insure that the area where you would like your furniture placed is clear of any old furniture and any other items that may obstruct the passageway of the delivery team. Shopify Shop will deliver, assemble, and set-up your new furniture purchase and remove all packing materials from your home. Our delivery crews are not permitted to move your existing furniture or other household items. Delivery personnel will attempt to deliver the purchased items in a safe and controlled manner but will not attempt to place furniture if they feel it will result in damage to the product or your home. Delivery personnel are unable to remove doors, hoist furniture or carry furniture up more than 3 flights of stairs. An elevator must be available for deliveries to the 4th floor and above.`,
  },
  {
    id: 4,
    name: "PAYMENT",
    content: `
        Customers are able to pick the next available delivery day that best fits their schedule. However, to route stops as efficiently as possible, Shopify Shop will provide the time frame. Customers will not be able to choose a time. You will be notified in advance of your scheduled time frame. Please make sure that a responsible adult (18 years or older) will be home at that time.
        In preparation for your delivery, please remove existing furniture, pictures, mirrors, accessories, etc. to prevent damages. Also insure that the area where you would like your furniture placed is clear of any old furniture and any other items that may obstruct the passageway of the delivery team. Shopify Shop will deliver, assemble, and set-up your new furniture purchase and remove all packing materials from your home. Our delivery crews are not permitted to move your existing furniture or other household items. Delivery personnel will attempt to deliver the purchased items in a safe and controlled manner but will not attempt to place furniture if they feel it will result in damage to the product or your home. Delivery personnel are unable to remove doors, hoist furniture or carry furniture up more than 3 flights of stairs. An elevator must be available for deliveries to the 4th floor and above.`,
  },
];

export const colors = [
  "Đen",
  "Nâu",
  "Xám",
  "Trắng",
  "Hồng",
  "Vàng",
  "Cam",
  "Tím",
  "Xanh lá",
  "Xanh dương",
];

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
export const adminSidebar = [
  {
    id: 1,
    type: "SINGLE",
    text: "Thống kê",
    path: `/${path.ADMIN}/${path.DASHBOARD}`,
    icon: <AiOutlineDashboard size={20} />,
  },
  {
    id: 2,
    type: "SINGLE",
    text: "Quản lý đơn hàng",
    path: `/${path.ADMIN}/${path.MANAGE_ORDER}`,
    icon: <MdOutlineLocalShipping size={20} />,
  },
  {
    id: 3,
    type: "SINGLE",
    text: "Quản lý tài khoản",
    path: `/${path.ADMIN}/${path.MANAGE_USER}`,
    icon: <MdGroups size={20} />,
  },
  {
    id: 4,
    type: "SINGLE",
    text: "Quản lý thương hiệu",
    icon: <FaTrademark size={20} />,
    path: `/${path.ADMIN}/${path.MANAGE_BRANDS}`,
  },
  {
    id: 5,
    type: "SINGLE",
    text: "Quản lý danh mục",
    path: `/${path.ADMIN}/${path.MANAGE_PRODUCTS_CATEGORIES}`,
    icon: <MdCategory size={20} />,
  },
  {
    id: 6,
    type: "SINGLE",
    text: "Quản lý khuyến mãi",
    path: `/${path.ADMIN}/${path.MANAGE_COUPONS}`,
    icon: <MdLocalOffer size={20} />,
  },

  {
    id: 7,
    type: "PARENT",
    text: "Quản lý sản phẩm",
    icon: <MdInventory size={20} />,
    submenu: [
      {
        text: "Thêm sản phẩm",
        path: `/${path.ADMIN}/${path.CREATE_PRODUCTS}`,
      },
      {
        text: "Quản lý kho hàng",
        path: `/${path.ADMIN}/${path.MANAGE_PRODUCTS}`,
      },
    ],
  },
];

export const memberSidebar = [
  {
    id: 1,
    type: "SINGLE",
    text: "Thông tin cá nhân",
    path: `/${path.MEMBER}/${path.PERSONAL}`,
    icon: <AiOutlineDashboard size={20} />,
  },
  {
    id: 2,
    type: "SINGLE",
    text: "Lịch sử mua hàng",
    path: `/${path.MEMBER}/${path.HISTORY}`,
    icon: <RiBillLine size={20} />,
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
    icon: <MdAutorenew />,
    title: "Đổi trả dễ dàng",
    description: "Đổi thiết bị trong 7 ngày nếu có lỗi.",
    color: "#007aff",
  },
  {
    icon: <MdPayment />,
    title: "Trả góp 0%",
    description: "Thanh toán linh hoạt, không lãi suất.",
    color: "#34c759",
  },
  {
    icon: <MdTagFaces />,
    title: "Cá nhân hoá miễn phí",
    description: "Khắc tên, biểu tượng, không tính phí.",
    color: "#af52de",
  },
  {
    icon: <MdLocalShipping />,
    title: "Giao hàng nhanh",
    description: "Giao trong ngày tại TP.Cần Thơ.",
    color: "#ff9500",
  },
  {
    icon: <MdSecurity />,
    title: "Bảo hành chính hãng",
    description: "Tất cả sản phẩm được bảo hành 12–24 tháng.",
    color: "#ff3b30",
  },
  {
    icon: <MdSupportAgent />,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn.",
    color: "#5856d6",
  },
  {
    icon: <MdStarRate />,
    title: "Sản phẩm uy tín",
    description: "Chỉ bán hàng chính hãng từ Apple, Samsung, Dell,...",
    color: "#ffd60a",
  },
  {
    icon: <MdBatteryChargingFull />,
    title: "Phụ kiện bền bỉ",
    description: "Cáp sạc, tai nghe chất lượng cao, bảo vệ thiết bị tối đa.",
    color: "#00c7be",
  },
  {
    icon: <MdPhonelinkSetup />,
    title: "Cài đặt miễn phí",
    description: "Cài ứng dụng, sao lưu dữ liệu miễn phí tại cửa hàng.",
    color: "#5ac8fa",
  },
];
