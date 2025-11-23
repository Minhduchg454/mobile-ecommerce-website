import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { CloseButton } from "../../components";
import { VoucherSelectModal } from "../../features";
import { AddressFormModal } from "../../features";
import {
  apiGetAddresses,
  apiGetPaymentAccounts,
} from "../../services/user.api";
import { apiCreateVNPayPayment } from "../../services/payment.api";
import { apiCreateOrder } from "../../services/order.api";
import path from "ultils/path";
import { useSelector, useDispatch } from "react-redux";
import { showAlert } from "store/app/appSlice";
import {
  formatMoney,
  calculateFinalPrice,
  calculateShippingCost,
} from "ultils/helpers";
import { APP_INFO, bankInfo } from "../../ultils/contants";
import { MdLocationOn } from "react-icons/md";
import { FaTicketAlt, FaMoneyCheckAlt } from "react-icons/fa";
import { showModal } from "store/app/appSlice";
import { FaCheck } from "react-icons/fa";

/**
 * Mẫu test vnpay
 * ngan hang: NCB
 * so the: 9704198526191432198
 * ten chu the: NGUYEN VAN A
 * ngay phat hanh: 07/15
 * opt: 123456
 */

// utils/checkout.js
const groupByShop = (items = []) => {
  const byShop = new Map();

  for (const it of items) {
    const shopObj = it.product.shopId;
    const shopKey = shopObj?._id || String(shopObj);
    if (!byShop.has(shopKey)) {
      byShop.set(shopKey, {
        shopId: shopObj,
        items: new Map(),
      });
    }

    const group = byShop.get(shopKey);

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
  }

  // Xuất ra mảng dễ render + tính subtotal
  const result = [];
  for (const { shopId, items } of byShop.values()) {
    const flat = Array.from(items.values());
    const shopSubtotal = flat.reduce((s, x) => {
      // Tính toán giá cuối cùng (đã giảm) cho Tổng phụ của shop
      const basePrice = x.productVariation?.pvPrice ?? 0;
      const discountPercent = x.product?.productDiscountPercent ?? 0;
      const finalPrice = calculateFinalPrice(basePrice, discountPercent);
      // shopSubtotal là tổng tiền hàng sau khi đã áp dụng giảm giá sản phẩm
      return s + finalPrice * (x.quantity ?? 0);
    }, 0);

    result.push({ shopId, items: flat, shopSubtotal });
  }

  return result;
};

export const CheckOut1 = ({ items }) => {
  const { current } = useSelector((s) => s.user);
  const userId = current?._id || current?.userId;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [addressesUser, setAddressesUser] = useState([]);
  // State lưu địa chỉ Shop: Map<shopId, addressObject>
  const [addressesShop, setAddressesShop] = useState({});
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isShowAddrreses, setIsShowAddrreses] = useState(false);
  const [paymentAccountMethods, setPaymentAccountMethods] = useState([]);
  const [shopVouchers, setShopVouchers] = useState({});
  const [shopShippingFees, setShopShippingFees] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const topRef = useRef(null);

  const groups = groupByShop(items);

  // HÀM GET SHIP FEE
  const getShipFee = (shopId) => {
    // 1. Lấy phí đã cache (nếu có)
    if (shopShippingFees[shopId] !== undefined) {
      return Math.max(0, Number(shopShippingFees[shopId]));
    }

    // 2. Kiểm tra địa chỉ Khách hàng
    if (!selectedAddress) {
      return 0;
    }

    // 3. Lấy địa chỉ Shop từ state đã fetch
    const shopAddressFrom = addressesShop[shopId];

    if (!shopAddressFrom) {
      return 0;
    }

    // 4. Tính toán phí vận chuyển thực tế
    const calculatedFee = calculateShippingCost(
      shopAddressFrom,
      selectedAddress
    );

    // 5. Cache kết quả (dùng setState để cache, việc này sẽ kích hoạt useMemo)
    setShopShippingFees((prev) => ({
      ...prev,
      [shopId]: calculatedFee,
    }));

    return calculatedFee;
  };

  //Fetch phuong thuc thanh toan
  const fetchPaymentAccount = async () => {
    if (!userId) return;
    try {
      const res = await apiGetPaymentAccounts({ userId, paFor: "customer" });
      if (res?.success) setPaymentAccountMethods(res.accounts || []);
    } catch (err) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không tải được dữ liệu",
          variant: "danger",
        })
      );
    }
  };

  // HÀM FETCH ĐỊA CHỈ
  const fetchAddresses = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // --- 1. Fetch địa chỉ Khách hàng ---
      const resUser = await apiGetAddresses({
        userId,
        sort: "default_first",
        addressFor: "customer",
      });
      const listUser = resUser?.addresses || [];
      setAddressesUser(listUser);

      const defaultAddress = listUser.find((a) => a.addressIsDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (listUser.length > 0) {
        setSelectedAddress(listUser[0]);
      }

      // --- 2. Fetch địa chỉ Shop ---
      const shopAddressesMap = {};
      const shopIds = groups.map((g) => g.shopId._id);

      for (const sId of shopIds) {
        const resShop = await apiGetAddresses({
          userId: sId,
          addressFor: "shop",
          limit: 1,
        });

        const shopAddrList = resShop?.addresses || [];
        if (shopAddrList.length > 0) {
          shopAddressesMap[sId] = shopAddrList[0];
        }
      }
      setAddressesShop(shopAddressesMap);
    } catch (e) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không tải được dữ liệu địa chỉ",
          variant: "danger",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && groups.length > 0) {
      fetchPaymentAccount();
      fetchAddresses();
    }
  }, [userId, items.length]);

  useEffect(() => {
    setShopShippingFees({});
  }, [selectedAddress]);

  const isFreeShip = (cp) => {
    const code = String(cp?.couponCode || "").toUpperCase();
    return code.startsWith("FREESHIP");
  };
  const withAppliedAmount = (cp, orderTotal) => {
    const total = Number(orderTotal || 0);
    let discount = 0;

    if (cp.couponDiscountType === "percentage") {
      discount = (total * Number(cp.couponDiscount || 0)) / 100;
    } else if (cp.couponDiscountType === "fixed_amount") {
      discount = Number(cp.couponDiscount || 0);
    }

    const cap =
      cp.couponMaxDiscountAmount ?? cp.couponmaxDiscountAmount ?? null;
    if (typeof cap === "number") discount = Math.min(discount, cap);

    return Math.max(0, Math.min(discount, total));
  };

  const perShop = useMemo(() => {
    return groups.map((g) => {
      const sid = g.shopId._id;
      const shopSubtotal = Number(g.shopSubtotal || 0);

      // Lấy phí vận chuyển. Nếu chưa có trong cache, hàm này sẽ tính và cache
      const shipFee = getShipFee(sid);

      // Voucher SHOP (áp dụng trên shopSubtotal đã giảm)
      const shopVs = shopVouchers[sid] || [];
      const shopItemDiscount = shopVs.reduce(
        (s, v) => s + withAppliedAmount(v, shopSubtotal),
        0
      );

      // Voucher HỆ THỐNG (áp dụng trên shopSubtotal đã giảm)
      const sysVs = shopVouchers["Admin"] || [];
      const sysNormal = sysVs.filter((v) => !isFreeShip(v)); // giảm hàng
      const sysFreeShip = sysVs.filter(isFreeShip); // freeship

      // Giảm hàng hệ thống
      const sysItemDiscount = sysNormal.reduce(
        (s, v) => s + withAppliedAmount(v, shopSubtotal),
        0
      );

      // Freeship hệ thống (cộng, clamp <= shipFee)
      const shipDiscountPerShop = Math.min(
        shipFee,
        sysFreeShip.reduce((s, v) => s + Number(v?.appliedAmount || 0), 0)
      );

      // Tổng từng shop
      const lineTotal = Math.max(
        0,
        shopSubtotal +
          shipFee -
          shopItemDiscount -
          sysItemDiscount -
          shipDiscountPerShop
      );

      // Voucher đã tính appliedAmount
      const shopVouchersApplied = shopVs.map((v) => ({
        couponId: v._id,
        couponCode: v.couponCode,
        createdByType: "Shop",
        couponDiscountType: v.couponDiscountType || "",
        appliedAmount: withAppliedAmount(v, shopSubtotal),
      }));

      // Hai nhóm voucher hệ thống riêng biệt
      const systemProductVouchersApplied = sysNormal.map((v) => ({
        couponId: v._id,
        couponCode: v.couponCode,
        createdByType: "Admin",
        couponDiscountType: v.couponDiscountType || "",
        appliedAmount: withAppliedAmount(v, shopSubtotal),
      }));

      const systemFreeShipVoucherApplied = sysFreeShip.map((v) => ({
        couponId: v._id,
        couponCode: v.couponCode,
        createdByType: "Admin",
        couponDiscountType: "shipping",
        appliedAmount: Math.min(shipFee, Number(v?.appliedAmount || 0)),
      }));

      return {
        sid,
        shopSubtotal,
        shipFee,
        shopItemDiscount,
        sysItemDiscount,
        shipDiscountPerShop,
        lineTotal,
        items: g.items.map((it) => {
          const basePrice = it.productVariation?.pvPrice ?? 0;
          const discountPercent = it.product?.productDiscountPercent ?? 0;
          const finalPrice = calculateFinalPrice(basePrice, discountPercent);

          return {
            productVariationId: it.productVariation?._id,
            quantity: Number(it.quantity || 0),
            unitPrice: finalPrice,
          };
        }),
        shopVouchersApplied,
        systemProductVouchersApplied,
        systemFreeShipVoucherApplied,
      };
    });
  }, [groups, shopVouchers, selectedAddress, addressesShop, shopShippingFees]);
  const summary = useMemo(() => {
    const totalBefore = perShop.reduce((s, x) => s + x.shopSubtotal, 0);
    const shipAmount = perShop.reduce((s, x) => s + x.shipFee, 0);
    const shipDiscount = perShop.reduce((s, x) => s + x.shipDiscountPerShop, 0);
    const shopDiscountTotal = perShop.reduce(
      (s, x) => s + x.shopItemDiscount,
      0
    );
    const systemDiscount = perShop.reduce((s, x) => s + x.sysItemDiscount, 0);
    const finalTotal = perShop.reduce((s, x) => s + x.lineTotal, 0);

    return {
      totalBefore,
      shipAmount,
      shipDiscount,
      shopDiscountTotal,
      systemDiscount,
      finalTotal,
    };
  }, [perShop]);

  const card = "bg-white rounded-3xl border p-2 md:p-4  ";
  const paymethods = [
    { name: "COD", description: "Thanh toán khi nhận hàng" },
    { name: "QR", description: "Thanh toán quét mã Qr" },
    { name: "VNpay", description: "Thanh toán qua VNpay" },
    { name: "BANK", description: "Thẻ ngân hàng" },
  ];

  const notePrefix = `${APP_INFO.NAME}`;
  const userName = `${current?.userFirstName}`;
  const amount = formatMoney(summary.finalTotal);
  const dateStr = new Date().toLocaleDateString("vi-VN");

  const transferContent = `${userName} thanh toan ${amount} ${dateStr} den cua hang ${notePrefix}`;

  const groupsWithVouchers = useMemo(() => {
    return perShop.map((x) => ({
      shopId: x.sid,
      items: x.items,
      shopSubtotal: x.shopSubtotal,
      shippingFee: x.shipFee,
      shippingDiscount: x.shipDiscountPerShop,
      shopDiscount: x.shopItemDiscount,
      systemDiscount: x.sysItemDiscount,
      shopVouchers: x.shopVouchersApplied,
      systemVouchers: x.systemProductVouchersApplied,
      systemFreeShipVouchers: x.systemFreeShipVoucherApplied,
    }));
  }, [perShop]);

  const handlePay = async () => {
    if (summary.finalTotal <= 0) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Tổng thanh toán không hợp lệ",
          variant: "danger",
        })
      );
      return;
    }

    if (!selectedAddress) {
      dispatch(
        showAlert({
          title: "Chưa có địa chỉ",
          message: "Vui lòng chọn hoặc thêm địa chỉ giao hàng.",
          variant: "warning",
        })
      );
      return;
    }

    const orderProducts = groups.flatMap((group) =>
      group.items
        .map((item) => {
          const pv = item.productVariation || {};
          const p = item.product || {};
          const pvId = pv._id;
          const quantity = Number(item.quantity || 0);
          if (!pvId || quantity < 1) return null;

          // Tính toán giá cuối cùng (đã giảm) để gửi đi
          const basePrice = item.priceAtTime ?? pv.pvPrice ?? 0;
          const productDiscountPercent = p.productDiscountPercent ?? 0;
          const finalPrice = calculateFinalPrice(
            basePrice,
            productDiscountPercent
          );
          const parsedPrice = Number(finalPrice);
          return {
            productVariationId: pvId,
            quantity,
            price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
          };
        })
        .filter(Boolean)
    );

    if (!orderProducts.length) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không có sản phẩm hợp lệ để tạo đơn hàng.",
          variant: "danger",
        })
      );
      return;
    }

    const finalAmount = Math.max(
      0,
      Math.round(Number(summary.finalTotal || 0))
    );

    const payload = {
      customerId: userId,
      addressId: selectedAddress._id,
      addressSnapshot: {
        name: selectedAddress.addressUserName,
        phone: selectedAddress.addressNumberPhone,
        fullAddress: [
          selectedAddress.addressStreet,
          selectedAddress.addressWard,
          selectedAddress.addressDistrict,
          selectedAddress.addressCity,
          selectedAddress.addressCountry,
        ]
          .filter(Boolean)
          .join(", "),
      },
      paymentMethod,
      orderStatus: "Pending",
      orderTotals: {
        totalBefore: Number(summary.totalBefore || 0),
        shipAmount: Number(summary.shipAmount || 0),
        shipDiscount: Number(summary.shipDiscount || 0),
        shopDiscountTotal: Number(summary.shopDiscountTotal || 0),
        systemDiscount: Number(summary.systemDiscount || 0),
        finalTotal: finalAmount,
      },
      groups: groupsWithVouchers,
    };

    if (
      paymentMethod === "QR" ||
      paymentMethod === "COD" ||
      paymentMethod === "BANK"
    ) {
      if (paymentMethod === "BANK") {
        if (selectedBank === "") {
          dispatch(
            showAlert({
              title: "Lỗi",
              message: "Chọn ngân hàng để thanh toán",
              variant: "danger",
              duration: 1500,
            })
          );
          return;
        }
      }

      try {
        setLoading(true);
        const response = await apiCreateOrder(payload);
        if (!response?.success) {
          dispatch(
            showAlert({
              title: "Lỗi",
              message: response?.message,
              variant: "danger",
            })
          );
          return;
        }

        sessionStorage.removeItem("checkoutPayload");
        navigate({
          pathname: `/${path.CHECKOUT}/result`,
          search: `?status=success&paymentMethod=${paymentMethod}&amount=${finalAmount}`,
        });
      } catch (error) {
        console.error(error);
        dispatch(
          showAlert({
            title: "Lỗi",
            message:
              error?.message || "Không thể tạo đơn. Vui lòng thử lại sau.",
            variant: "danger",
          })
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (paymentMethod === "VNpay") {
      try {
        setLoading(true);
        const response = await apiCreateOrder(payload);

        if (!response?.success) {
          dispatch(
            showAlert({
              title: "Lỗi",
              message:
                response?.message ||
                "Không thể tạo đơn VNpay. Vui lòng thử lại sau.",
              variant: "danger",
            })
          );
          return;
        }

        sessionStorage.removeItem("checkoutPayload");
        const res = await apiCreateVNPayPayment({
          amount: Math.round(Number(summary.finalTotal || 0)),
          bankCode: "NCB",
          orderInfo: `Thanh toan don hang #${APP_INFO.NAME}`,
          returnPath: "/checkout/result",
        });
        const url = res?.paymentUrl;
        if (!url) throw new Error("Không nhận được paymentUrl");
        window.location.href = url;
      } catch (e) {
        console.error(e);
        dispatch(
          showAlert({
            title: "Lỗi",
            message: "Không tạo được thanh toán VNPay",
            variant: "danger",
          })
        );
      }
      return;
    }

    dispatch(
      showAlert({
        title: "Chọn phương thức",
        message: "Vui lòng chọn phương thức thanh toán.",
        variant: "warning",
        showConfirmButton: false,
        duration: 1500,
      })
    );
  };
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ ehavior: "smooth", block: "start" });
    }
  }, [items]);

  return (
    <div className="relative xl:mx-auto xl:w-main  p-2 md:p-4">
      {/*header */}
      <div
        style={{ scrollMarginTop: "120px" }}
        ref={topRef}
        className={`mb-4 px-2 md:px-4`}
      >
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
              <div className="font-bold">
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
        <div
          onClick={() => setIsShowAddrreses(false)}
          className="fixed inset-0 z-[10] bg-white/60   flex w-full items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white backdrop-blur rounded-3xl min-h-[300px] shadow-md border w-full max-w-xl p-4"
          >
            <h3 className="text-lg font-semibold text-center mb-3 ">
              Chọn địa chỉ giao hàng
            </h3>
            <CloseButton
              onClick={() => setIsShowAddrreses(false)}
              className="top-3 right-3"
            />
            <div className="overflow-auto h-full mb-2">
              {addressesUser.map((addresses, idx) => (
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
                  dispatch(
                    showModal({
                      isShowModal: true,
                      modalChildren: (
                        <AddressFormModal
                          onClose={() =>
                            dispatch(
                              showModal({
                                isShowModal: false,
                                modalChildren: null,
                              })
                            )
                          }
                          userId={userId}
                          initialAddress={null}
                          onSuccess={fetchAddresses}
                          titleCreate="Thêm địa chỉ mới"
                          titleEdit="Cập nhật địa chỉ"
                        />
                      ),
                    })
                  );
                }}
                className="rounded-3xl bg-button-bg hover:bg-button-hv border px-2 py-1"
              >
                Thêm địa chỉ mới
              </button>
            </div>
          </div>
        </div>
      )}

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

                // Tính toán giá cho hiển thị
                const basePrice = it.priceAtTime || pv.pvPrice || 0;
                const productDiscountPercent = p.productDiscountPercent ?? 0;
                const finalPrice = calculateFinalPrice(
                  basePrice,
                  productDiscountPercent
                );
                const isOnSale = productDiscountPercent > 0;

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
                        <p className="">
                          {isOnSale && (
                            <span className="mr-1 rounded-3xl border bg-red-500 text-white text-[8px] px-1 py-1 align-middle">
                              Sale {p.productDiscountPercent}%
                            </span>
                          )}
                          {p.productName}
                        </p>
                      </div>
                    </td>
                    <td className="text-center">{pv.pvName}</td>
                    {/* Hiển thị Đơn giá */}
                    <td className="text-center">
                      <div className="flex flex-col items-center">
                        {isOnSale && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatMoney(basePrice)}đ
                          </span>
                        )}
                        <span className="font-medium text-red-500">
                          {formatMoney(finalPrice)}đ
                        </span>
                      </div>
                    </td>
                    <td className="text-center">{it.quantity}</td>
                    {/* Hiển thị Thành tiền */}
                    <td className="text-right">
                      {formatMoney(finalPrice * it.quantity)}đ
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
              {shopVouchers[g.shopId._id] &&
                shopVouchers[g.shopId._id].map((v) => (
                  <p
                    key={v._id}
                    className={`text-sm  border-black border-[1px] border-dashed p-0.5 flex items-center justify-center rounded ${v.color}`}
                  >
                    {formatMoney(v?.appliedAmount)}đ
                  </p>
                ))}
              <button
                onClick={() =>
                  dispatch(
                    showModal({
                      isShowModal: true,
                      modalChildren: (
                        <VoucherSelectModal
                          orderTotal={g.shopSubtotal}
                          createdById={g.shopId._id}
                          initialSelected={shopVouchers[g.shopId._id] || []}
                          onSelectVoucher={(selectedArr) => {
                            setShopVouchers((prev) => ({
                              ...prev,
                              [g.shopId._id]: selectedArr,
                            }));
                          }}
                        />
                      ),
                    })
                  )
                }
                className="text-text-ac hover:underline"
              >
                Chọn voucher
              </button>
            </div>
          </div>

          <div className="w-full mb-2 pb-2 border-b-2 text-sm md:text-base flex justify-between">
            <p>Chi phí vận chuyển</p>
            <p>{formatMoney(getShipFee(g.shopId._id))}đ</p>
          </div>
          {/* Tổng tiền sản phẩm */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="">Tổng tiền hàng:</span>
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
          {shopVouchers["Admin"] &&
            shopVouchers["Admin"].map((v) => (
              <p
                key={v._id}
                className={`text-sm  border-black border-[1px] border-dashed p-0.5 flex items-center justify-center rounded ${v.color}`}
              >
                {formatMoney(v.appliedAmount)}đ
              </p>
            ))}
          <button
            className="text-text-ac hover:underline"
            onClick={() =>
              dispatch(
                showModal({
                  isShowModal: true,
                  modalChildren: (
                    <VoucherSelectModal
                      orderTotal={summary.totalBefore}
                      initialSelected={shopVouchers["Admin"] || []}
                      onSelectVoucher={(selectedArr) => {
                        setShopVouchers((prev) => ({
                          ...prev,
                          ["Admin"]: selectedArr,
                        }));
                      }}
                    />
                  ),
                })
              )
            }
          >
            Chọn voucher
          </button>
        </div>
      </div>

      {/* Phương thức thanh toán */}
      <div className={`${card} mb-4 md:p-4 p-2 text-sm md:text-base`}>
        {/* Tiêu đề */}
        <div className="mb-2 py-2 md:py-4 border-b-2">
          <div className="flex gap-2 justify-start items-center mb-2">
            <FaMoneyCheckAlt size={20} />
            <p className="font-bold">Phương thức thanh toán</p>
          </div>
          <div className="flex gap-2">
            {paymethods.map((pm) => (
              <button
                key={pm.name}
                onClick={() => setPaymentMethod(pm.name)}
                className={`w-full text-center mb-2 px-2 py-1 border rounded-2xl hover:bg-options-bg transition ${
                  paymentMethod === pm.name
                    ? "border-2 border-button-bg-ac"
                    : ""
                }`}
              >
                {pm.description}
              </button>
            ))}
          </div>
          {paymentMethod === "COD" && (
            <p className="text-black text-sm md:text-base pt-2">
              Thanh toán khi nhận hàng (COD). Vui lòng chuẩn bị đủ số tiền khi
              nhận hàng.
            </p>
          )}
          {paymentMethod === "QR" && (
            <div className="flex flex-col items-center gap-4 mt-4 p-4 border rounded-xl bg-gray-50">
              <p className="text-gray-700 text-md font-medium">
                Quét mã để chuyển khoản ngân hàng:
              </p>

              <img
                src={`https://img.vietqr.io/image/ICB-${
                  bankInfo.accountNumber
                }-compact2.jpg?amount=${
                  summary.finalTotal
                }&addInfo=${encodeURIComponent(transferContent)}`}
                alt="QR VietQR"
                className="w-52 h-52 object-contain"
              />

              <div className="text-sm text-center text-gray-600">
                <p>
                  <strong>Ngân hàng:</strong> {bankInfo.bankName}
                </p>
                <p>
                  <strong>Chủ tài khoản:</strong> {bankInfo.accountName}
                </p>
                <p>
                  <strong>Số tài khoản:</strong> {bankInfo.accountNumber}
                </p>
                <p>
                  <strong>Nội dung chuyển khoản:</strong> {transferContent}
                </p>
                <p className="text-orange-600 italic text-sm">
                  Sau khi chuyển khoản, nhấn "Thanh toán" để hoàn tất đơn hàng.
                </p>
              </div>
            </div>
          )}
          {paymentMethod === "VNpay" && (
            <p className="text-black text-sm md:text-base pt-2">
              Thanh toán qua VNpay. Bạn sẽ được chuyển hướng đến trang VNpay để
            </p>
          )}
          {paymentMethod === "BANK" && (
            <div className="text-black text-sm md:text-base pt-2">
              <p className="mb-1">Chọn ngân hàng:</p>
              {paymentAccountMethods.length === 0 ? (
                <p className="text-gray-500 text-center my-2 md:py-4">
                  Bạn chưa thêm thẻ ngân hàng nào
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {paymentAccountMethods.map((acc) => (
                    <div
                      onClick={() => setSelectedBank(acc._id)}
                      key={acc._id}
                      className={`flex flex-row items-center justify-between gap-3 p-1 md:p-2 rounded-2xl border hover:bg-button-bg "border-gray-200 bg-gray-50`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {acc.bankId?.bankLogo ? (
                          <img
                            src={acc.bankId.bankLogo}
                            alt={acc.bankId.bankName}
                            className="w-10 h-10 rounded-lg object-contain bg-white shadow"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center text-white font-bold">
                            {acc.paType === "VNpay"
                              ? "VNpay"
                              : acc.paType === "ZALOPAY"
                              ? "Z"
                              : "B"}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold flex justify-start items-center">
                            {acc.paBeneficiaryName}
                            {acc.paIsDefault && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                Mặc định
                              </span>
                            )}
                          </p>
                          <p className="text-xs md:text-sm text-gray-600">
                            {acc.paType === "BANK"
                              ? `${acc.bankId?.bankName || "Ngân hàng"} • ${
                                  acc.paAccountNumber
                                }`
                              : `${acc.paType} • ${acc.paAccountNumber}`}
                          </p>
                        </div>
                      </div>
                      <div className="relative h-5 w-5 border border-black rounded-full">
                        <FaCheck
                          className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-black  w-3 h-3
                       ${selectedBank === acc._id ? "opacity-100" : "opacity-0"}
                       `}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Tổng tiền */}
        <div className="mb-2 py-2 md:py-4 flex justify-end items-center ">
          <table className="lg:w-[400px] w-full text-sm md:text-base p-2">
            <tbody>
              <tr>
                <td className="text-left">Tổng tiền hàng:</td>
                <td className="text-right">
                  {formatMoney(summary.totalBefore)}đ
                </td>
              </tr>
              <tr>
                <td className="text-left">Phí vận chuyển:</td>
                <td className="text-right">
                  {formatMoney(summary.shipAmount)}đ
                </td>
              </tr>
              <tr>
                <td className="text-left">Ưu đãi phí vận chuyển:</td>
                <td className="text-right">
                  - {formatMoney(summary.shipDiscount)}đ
                </td>
              </tr>
              <tr>
                <td className="text-left">Tổng giảm từ voucher shop:</td>
                <td className="text-right">
                  - {formatMoney(summary.shopDiscountTotal)}đ
                </td>
              </tr>
              <tr>
                <td className="text-left">Tổng giảm từ voucher hệ thống:</td>
                <td className="text-right">
                  - {formatMoney(summary.systemDiscount)}đ
                </td>
              </tr>
              {/* Nếu có phí ship, thêm 1-2 dòng ở đây trước khi tính tổng cuối */}
              <tr>
                <td className="text-left font-semibold">Tổng thanh toán:</td>
                <td className="text-right text-main text-lg md:text-xl font-bold">
                  {formatMoney(summary.finalTotal)}đ
                </td>
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
              onClick={handlePay}
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
