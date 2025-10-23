import { useEffect, useState } from "react";
import {
  useSearchParams,
  useNavigate,
  useParams,
  useLocation,
  Link,
} from "react-router-dom";
import { OrderItemCard } from "./orderItemCard";
import { CloseButton } from "../../components";

import { AddressFormModal } from "../../features";
import { apiGetAddresses } from "../../services/user.api";
import path from "ultils/path";
import { useSelector, useDispatch } from "react-redux";
import { showAlert } from "store/app/appSlice";
import { formatMoney } from "ultils/helpers";
import { APP_INFO } from "../../ultils/contants";
import { MdLocationOn } from "react-icons/md";
import { FaTicketAlt, FaMoneyCheckAlt } from "react-icons/fa";

// utils/checkout.js
const groupByShop = (items = []) => {
  const byShop = new Map();

  for (const it of items) {
    const shopObj = it.product.shopId;
    const shopKey = shopObj?._id || String(shopObj);
    if (!byShop.has(shopKey)) {
      byShop.set(shopKey, {
        shopId: shopObj, // giữ nguyên object để hiển thị tên/logo
        items: new Map(), // key theo productVariationId để gộp
      });
    }

    const group = byShop.get(shopKey);
    //console.log("2. Group", group);
    const varKey = it.productVariation._id; // gộp theo biến thể
    if (!group.items.has(varKey)) {
      group.items.set(varKey, { ...it });
    } else {
      const exist = group.items.get(varKey);
      group.items.set(varKey, {
        ...exist,
        quantity: exist.quantity + (it.quantity || 0),
      });
    }
    //console.log("3. Group varkey", group.items.get(varKey));
  }

  // Xuất ra mảng dễ render + tính subtotal
  const result = [];
  for (const { shopId, items } of byShop.values()) {
    const flat = Array.from(items.values());
    //s: gia tri tong ban dau =0, x phan tu hien tai
    //Cong don moi lan de ra ket qua
    const shopSubtotal = flat.reduce(
      (s, x) => s + (x.productVariation.pvPrice || 0) * (x.quantity || 0),
      0
    );
    result.push({ shopId, items: flat, shopSubtotal });
  }
  console.log("4. Result", result);
  return result;
};

export const CheckOut1 = ({ items }) => {
  const { current } = useSelector((s) => s.user);
  const userId = current?._id || current?.userId;
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isShowAddrreses, setIsShowAddrreses] = useState(false);
  const [isShowVoucherModal, setIsShowVoucherModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchAddresses = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await apiGetAddresses({ userId, sort: "default_first" });
      const list = res?.addresses || [];
      setAddresses(list);
      const defaultAddress = list.find((a) => a.addressIsDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (list.length > 0) {
        setSelectedAddress(list[0]);
      }
    } catch (e) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không tải được danh sách địa chỉ",
          variant: "danger",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchAddresses();
  }, [userId]);

  const groups = groupByShop(items);

  if (!groups.length) return <p>Giỏ hàng trống.</p>;

  const card = "bg-white rounded-3xl border p-2 md:p-4  ";

  return (
    <div className="relative md:w-main w-full mx-auto p-2 md:p-4">
      {/*header */}
      <div className={`mb-4 px-2 md:px-4`}>
        <h2 className="text-lg md:text-xl font-bold">Thanh toán đơn hàng</h2>
      </div>
      {/* Địa chỉ nhận hàng */}
      <div
        className={`${card} mb-4 flex items-center justify-between text-sm md:text-base`}
      >
        <div className="text-black">
          <div className="flex justify-start items-center gap-2 mb-2">
            <MdLocationOn size={20} />
            <h3 className="font-bold text-sm md:text-base">
              Địa chỉ nhận hàng:
            </h3>
          </div>
          <div className="px-2">
            <div className="flex gap-2 text-sm md:text-base ">
              <div className="">
                {selectedAddress?.addressUserName}{" "}
                <span className="font-normal">
                  {"| "}
                  {selectedAddress?.addressNumberPhone}
                </span>
              </div>
              {selectedAddress?.addressIsDefault && (
                <span className="flex items-center justify-center ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Mặc định
                </span>
              )}
            </div>

            <div className="text-black text-sm md:text-base">
              {selectedAddress?.addressStreet}
            </div>
            <div className="text-black text-sm md:text-base">
              {selectedAddress?.addressWard}, {selectedAddress?.addressDistrict}
              , {selectedAddress?.addressCity},{" "}
              {selectedAddress?.addressCountry}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsShowAddrreses(true)}
          className="text-text-ac hover:underline"
        >
          Thay đổi
        </button>
      </div>
      {isShowAddrreses && (
        <div className="fixed inset-0 z-[20] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white backdrop-blur rounded-3xl shadow-xl w-full max-w-xl p-4">
            <h3 className="text-lg font-semibold text-center mb-3 ">
              Chọn địa chỉ giao hàng
            </h3>
            <CloseButton
              onClick={() => setIsShowAddrreses(false)}
              className="top-3 right-3"
            />
            <div className="overflow-auto h-[180px] mb-2">
              {addresses.map((addresses, idx) => (
                <div
                  key={idx}
                  className={[
                    "w-full text-left border rounded-3xl p-3 text-sm mb-3 bg-options-bg transition",
                    "focus:outline-none focus:ring-2 focus:ring-blue-400",
                    selectedAddress === addresses
                      ? "border-2 border-blue-600"
                      : "",
                  ].join(" ")}
                  onClick={() => {
                    setSelectedAddress(addresses);
                    setIsShowAddrreses(false);
                  }}
                >
                  <div className="flex gap-2 text-sm md:text-base">
                    <div className="font-bold">
                      {addresses.addressUserName}{" "}
                      <span className="font-normal">
                        {"| "}
                        {addresses.addressNumberPhone}
                      </span>
                    </div>
                    {addresses.addressIsDefault && (
                      <span className="flex items-center justify-center ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <div className="text-black text-sm md:text-base">
                    {addresses?.addressStreet}
                  </div>
                  <div className="text-black text-sm md:text-base">
                    {addresses?.addressWard}, {addresses?.addressDistrict},{" "}
                    {addresses?.addressCity}, {addresses?.addressCountry}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full flex justify-center items-center">
              <button
                onClick={() => {
                  setShowModal(true);
                }}
                className="rounded-3xl bg-button-bg hover:bg-button-hv border px-2 py-1"
              >
                Thêm địa chỉ mới
              </button>
            </div>
          </div>
        </div>
      )}
      <AddressFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        userId={userId}
        initialAddress={null} // null = tạo mới; object = sửa
        onSuccess={fetchAddresses} // sau khi lưu/xoá thì refresh
        titleCreate="Thêm địa chỉ mới"
        titleEdit="Cập nhật địa chỉ"
      />

      {/* Danh sách sản phẩm */}
      {groups.map((g) => (
        <div key={g.shopId._id} className={`${card} mb-4 p-2 md:p-4`}>
          {/* Header shop */}
          <div className="flex items-center gap-3 mb-2">
            {g.shopId.shopLogo && (
              <img
                src={g.shopId.shopLogo}
                alt={g.shopId.shopName}
                className="w-8 h-8 md:w-11 md:h-11 rounded-full object-cover border"
              />
            )}
            <div className="font-semibold text-base">
              {g.shopId.shopName || "Cửa hàng"}
              {g.shopId.shopOfficial && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-600 text-white ">
                  shop mall
                </span>
              )}
            </div>
          </div>

          {/* Danh sách item của shop */}
          <table className="min-w-full table-auto text-sm md:text-base mb-2 px-2">
            <thead className="">
              <tr className="text-center">
                <th className="py-2 text-left">Sản phẩm</th>
                <th className="p-2">Phân loại</th>
                <th className="p-2">Đơn giá</th>
                <th className="p-2">Số lượng</th>
                <th className="p-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {g.items.map((it) => {
                const pv = it.productVariation || {};
                const p = it.product || {};
                const currentPrice = it.priceAtTime || pv.pvPrice;
                return (
                  <tr className="border-b-2" key={pv._id}>
                    {/* Ảnh sản phẩm */}
                    <td className="p-2 text-left flex items-center gap-2">
                      <div className="flex gap-2">
                        <img
                          src={pv.pvImages?.[0]}
                          alt={pv.pvName}
                          className="w-16 h-16 rounded-lg object-cover border"
                        />
                        <p className="">{p.productName}</p>
                      </div>
                    </td>
                    <td className="text-center">{pv.pvName}</td>
                    <td className="text-center">
                      {formatMoney(currentPrice)}đ
                    </td>
                    <td className="text-center">{it.quantity}</td>
                    <td className="text-right">
                      {formatMoney(currentPrice * it.quantity)}đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Voucher Shop */}
          <div className="w-full mb-2 pb-2 border-b-2 text-sm md:text-base flex justify-between">
            <p>Voucher shop</p>
            <div className="flex gap-2">
              <p>100K</p>
              <button className="text-text-ac hover:underline">
                Chọn voucher
              </button>
            </div>
          </div>
          {/* Tổng tiền sản phẩm */}
          <div className="mt-3 flex items-center justify-end gap-2">
            <span className="">Tổng số tiền:</span>
            <span className="font-bold text-main">
              {formatMoney(g.shopSubtotal)}đ
            </span>
          </div>
        </div>
      ))}

      {/* Voucher hệ thống */}
      <div
        className={`${card} mb-4 md:p-4 p-2 text-sm md:text-base  flex justify-between`}
      >
        <div className="flex gap-2 justify-start items-center">
          <FaTicketAlt size={20} />
          <p className="font-bold">Voucher {APP_INFO.NAME}</p>
        </div>

        <div className="flex gap-2">
          <p>100K</p>
          <button className="text-text-ac hover:underline">Chọn voucher</button>
        </div>
      </div>

      {/* Phương thức thanh toán */}
      <div className={`${card} mb-4 md:p-4 p-2 text-sm md:text-base`}>
        {/* Tiêu đề */}
        <div className="flex gap-2 justify-start items-center mb-2">
          <FaMoneyCheckAlt size={20} />
          <p className="font-bold">Phương thức thanh toán</p>
        </div>
        {/* Phương thức */}
        <div className="flex px-2 mb-2 border-b-2"></div>
        {/* Tổng tiền */}
        <div className="flex justify-end items-center ">
          <table className="lg:w-[400px] w-full text-sm md:text-base p-2">
            <tbody>
              <tr>
                <td className="text-left">Tổng tiền hàng:</td>
                <td className="text-right">0đ</td>
              </tr>
              <tr>
                <td className="text-left">Tổng tiền phí vận chuyển:</td>
                <td className="text-right">0đ</td>
              </tr>
              <tr>
                <td className="text-left">Tổng cộng voucher giảm giá:</td>
                <td className="text-right">0đ</td>
              </tr>
              <tr>
                <td className="text-left">Tổng thanh toán:</td>
                <td className="text-right text-main text-lg md:text-xl">0đ</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center gap-3 border-t-2 border-dashed">
          <div>
            <p>
              Nếu đồng ý thanh toán, bạn chấp nhận các
              <span className="text-gray-400"> điều khoản {APP_INFO.NAME}</span>
            </p>
          </div>
          <div>
            <button
              onClick={() => navigate(`/${path.HOME}`)}
              className="mt-2 mr-4 px-6 py-2 bg-button-bg text-black rounded-md hover:bg-button-hv"
            >
              Hủy
            </button>
            <button
              onClick={{}}
              className="mt-2 px-6 py-2 bg-button-bg-ac text-white rounded-md hover:bg-button-bg-hv"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
