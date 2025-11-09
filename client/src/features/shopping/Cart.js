import React, { memo, useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ImBin } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import { removeCartItem, updateCartItem } from "../../store/user/asyncActions";
import { apiGetProductVariation } from "../../services/catalog.api";
import { formatMoney } from "ultils/helpers";
import { toast } from "react-toastify";
import path from "ultils/path";
import { SelectQuantity } from "../../components";
import { showAlert } from "store/app/appSlice";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import emptyCart from "../../assets/empty-cartwebp.png";

const groupByShop = (items = []) => {
  const byShop = new Map();
  for (const it of items) {
    const shopObj = it.product?.shopId;
    if (!shopObj) continue;
    const shopKey = shopObj?._id || String(shopObj);
    if (!byShop.has(shopKey)) {
      byShop.set(shopKey, { shopId: shopObj, items: new Map() });
    }
    const group = byShop.get(shopKey);
    const varKey = it.productVariation?._id;
    if (!varKey) continue;

    if (!group.items.has(varKey)) group.items.set(varKey, { ...it });
    else {
      const exist = group.items.get(varKey);
      group.items.set(varKey, {
        ...exist,
        quantity: (exist.quantity || 0) + (it.quantity || 0),
      });
    }
  }

  const result = [];
  for (const { shopId, items } of byShop.values()) {
    const flat = Array.from(items.values());
    const shopSubtotal = flat.reduce(
      (s, x) => s + (x.productVariation?.pvPrice ?? 0) * (x.quantity ?? 0),
      0
    );
    result.push({ shopId, items: flat, shopSubtotal });
  }
  return result;
};

// ngoài component
const CartCols = () => (
  <colgroup>
    <col style={{ width: "38%" }} /> {/* Sản phẩm */}
    <col style={{ width: "14%" }} /> {/* Phân loại */}
    <col style={{ width: "12%" }} /> {/* Đơn giá */}
    <col style={{ width: "12%" }} /> {/* Số lượng */}
    <col style={{ width: "12%" }} /> {/* Thành tiền */}
    <col style={{ width: "8%" }} /> {/* Thao tác */}
  </colgroup>
);

export const Carts = () => {
  const { currentCart } = useSelector((state) => state.user);
  const [cartDetails, setCartDetails] = useState([]);
  const [selectedPvIds, setSelectedPvIds] = useState(new Set()); // lưu pvId đã chọn
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // tải chi tiết biến thể -> mảng { product, productVariation, quantity }
  useEffect(() => {
    if (!currentCart?.length) {
      setCartDetails([]);
      setSelectedPvIds(new Set());
      return;
    }
    const fetchData = async () => {
      const results = await Promise.allSettled(
        currentCart.map((item) => apiGetProductVariation(item.pvId))
      );
      const formatted = results.reduce((acc, res, idx) => {
        const cartItem = currentCart[idx];
        if (
          res.status === "fulfilled" &&
          res.value?.success &&
          res.value?.productVariation
        ) {
          const pv = res.value.productVariation;
          acc.push({
            product: pv.productId,
            productVariation: pv,
            quantity: cartItem.cartItemQuantity,
          });
        }
        return acc;
      }, []);
      setCartDetails(formatted);
    };
    fetchData();
  }, [currentCart]);

  const inStockDetails = useMemo(
    () =>
      [...cartDetails]
        .filter(
          (it) =>
            it.productVariation &&
            (it.productVariation.pvStockQuantity ?? 0) > 0
        )
        .reverse(), // đảo thứ tự toàn bộ phần tử
    [cartDetails]
  );

  const groups = useMemo(() => groupByShop(inStockDetails), [inStockDetails]);

  const allPvIds = useMemo(
    () => inStockDetails.map((it) => it.productVariation._id),
    [inStockDetails]
  );

  const totalPrice = useMemo(() => {
    if (!groups.length) return 0;

    let sum = 0;
    for (const g of groups) {
      for (const it of g.items) {
        const pvId = it.productVariation?._id;
        if (pvId && selectedPvIds.has(pvId)) {
          const price = it?.priceAtTime ?? it?.productVariation?.pvPrice ?? 0;
          sum += price * (it?.quantity ?? 0);
        }
      }
    }
    return sum;
  }, [groups, selectedPvIds]);

  const outOfStockItems = useMemo(
    () =>
      cartDetails.filter(
        (it) =>
          !it.productVariation || (it.productVariation.pvStockQuantity ?? 0) < 1
      ),
    [cartDetails]
  );

  // ====== Handlers chọn / bỏ chọn ======
  const toggleItem = (pvId) => {
    setSelectedPvIds((prev) => {
      const next = new Set(prev);
      if (next.has(pvId)) next.delete(pvId);
      else next.add(pvId);
      return next;
    });
  };

  const toggleShop = (pvIdsOfShop) => {
    setSelectedPvIds((prev) => {
      const next = new Set(prev);
      const allIn = pvIdsOfShop.every((id) => next.has(id));
      if (allIn) {
        pvIdsOfShop.forEach((id) => next.delete(id));
      } else {
        pvIdsOfShop.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const allChecked =
    allPvIds.length > 0 && allPvIds.every((id) => selectedPvIds.has(id));
  const toggleAll = () => {
    setSelectedPvIds((prev) => {
      if (allChecked) return new Set(); // bỏ chọn hết
      return new Set(allPvIds); // chọn hết
    });
  };

  // xóa 1 item
  const removeOne = (pvId) => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: () => {
        dispatch(removeCartItem(pvId))
          .unwrap()
          .catch((err) => toast.error(err));
        setSelectedPvIds((prev) => {
          const next = new Set(prev);
          next.delete(pvId);
          return next;
        });
      },
      onCancel: () => {},
      onClose: () => {},
    });

    dispatch(
      showAlert({
        id,
        title: "Bạn có chắc chắn muốn xóa sản phẩm này",
        variant: "danger",
        showCancelButton: true,
        confirmText: "Có",
        cancelText: "Không",
      })
    );
  };

  // xóa các item đã chọn
  const removeSelected = () => {
    const count = selectedPvIds.size;
    if (count === 0) {
      dispatch(
        showAlert({
          title: `Vui lòng chọn sản phẩm`,
          variant: "danger",
          showCancelButton: false,
          showConfirmButton: false,
          duration: 1500,
        })
      );
      return;
    }

    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: async () => {
        const ids = Array.from(selectedPvIds);

        const results = await Promise.allSettled(
          ids.map((pvId) => dispatch(removeCartItem(pvId)).unwrap())
        );

        const ok = results.filter((r) => r.status === "fulfilled").length;
        const fail = results.length - ok;

        setSelectedPvIds(new Set());
        if (fail > 0)
          toast.error(`Không thể xóa ${fail} sản phẩm. Vui lòng thử lại.`);
      },
      onCancel: () => {},
      onClose: () => {},
    });

    dispatch(
      showAlert({
        id,
        title: `Bạn muốn bỏ ${count} sản phẩm `,
        variant: "danger",
        showCancelButton: true,
        confirmText: "Có",
        cancelText: "Không",
      })
    );
  };

  // Checkout: gửi mảng {product, productVariation, quantity} đã chọn (nếu chưa chọn thì gửi tất)
  const handleBuyNow = () => {
    const selected =
      selectedPvIds.size > 0
        ? cartDetails.filter((it) => selectedPvIds.has(it.productVariation._id))
        : [];

    if (!selected.length) {
      dispatch(
        showAlert({
          title: `Vui lòng chọn sản phẩm để thanh toán`,
          variant: "danger",
          showCancelButton: false,
          showConfirmButton: false,
          duration: 1500,
        })
      );
      return;
    }

    const payload = {
      selectedItems: selected.map((it) => ({
        product: it.product,
        productVariation: it.productVariation,
        quantity: it.quantity,
      })),
    };

    // tuỳ luồng của bạn: sessionStorage hoặc navigate state
    sessionStorage.setItem("checkoutPayload", JSON.stringify(payload));
    navigate(`/${path.CHECKOUT}`);
  };

  const updateQuantity = (pvId, cartItemQuantity, maxItemQuantity) => {
    if (cartItemQuantity < 1) {
      removeOne(pvId);
      return;
    }
    dispatch(updateCartItem({ pvId, cartItemQuantity, maxItemQuantity }))
      .unwrap()
      .catch((err) => toast.error(err));
  };

  //css
  const card = "bg-white rounded-3xl border  p-2 md:p-4";
  const checkout =
    "cursor-pointer checked:text-black checked:after:content-['✔'] checked:after:text-[18px]";

  return (
    <div className="relative xl:mx-auto xl:w-main p-2 md:p-4">
      {/* Header */}
      <div className="mb-4 px-2 md:px-4">
        <h2 className="text-lg md:text-xl font-bold">Giỏ hàng</h2>
      </div>

      {groups?.length > 0 ? (
        groups.map((g) => {
          const shopPvIds = g.items.map((it) => it.productVariation._id);
          const shopChecked =
            shopPvIds.length > 0 &&
            shopPvIds.every((id) => selectedPvIds.has(id));
          const shopIndeterminate =
            shopPvIds.some((id) => selectedPvIds.has(id)) && !shopChecked;

          return (
            <div key={g.shopId._id} className={`${card} mb-4`}>
              {/* Header shop */}
              <div className="flex items-center gap-3 mb-2">
                <label className="w-4 h-4 rounded  border border-black flex justify-center items-center">
                  <input
                    type="checkbox"
                    checked={shopChecked}
                    onChange={() => toggleShop(shopPvIds)}
                    ref={(el) => el && (el.indeterminate = shopIndeterminate)}
                    className={`${checkout}`}
                    aria-label="Chọn shop"
                  />
                </label>

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
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-600 text-white">
                      shop mall
                    </span>
                  )}
                </div>
              </div>

              {/* Danh sách item */}
              <table className="min-w-full table-fixed text-sm md:text-base mb-2">
                <CartCols />
                <thead>
                  <tr className="text-center">
                    <th className="text-left">Sản phẩm</th>
                    <th className="px-2">Phân loại</th>
                    <th className="px-2">Đơn giá</th>
                    <th className="px-2">Số lượng</th>
                    <th className="px-2 text-center">Thành tiền</th>
                    <th className="pl-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((it) => {
                    const pv = it.productVariation || {};
                    const p = it.product || {};
                    const currentPrice = it.priceAtTime ?? pv.pvPrice ?? 0;
                    const isDeleted = pv === null;
                    const isOutOfStock = pv.pvStockQuantity < 1;
                    const maxItemQuantity = pv.pvStockQuantity;
                    const isDisabled = isDeleted || isOutOfStock;
                    const pvId = pv._id;
                    const itemChecked = pvId && selectedPvIds.has(pvId);

                    return (
                      <tr className="border-b-2" key={pvId}>
                        <td className="text-left">
                          <div className="flex items-center justify-start gap-2">
                            <label className="w-4 h-4 rounded  border border-black flex justify-center items-center">
                              <input
                                type="checkbox"
                                checked={!!itemChecked}
                                onChange={() => toggleItem(pvId)}
                                className={`${checkout}`}
                                aria-label="Chọn sản phẩm"
                              />
                            </label>

                            <button
                              className="flex gap-2 justify-center items-center"
                              onClick={() =>
                                navigate(`/${path.PRODUCTS}/${pvId}`)
                              }
                            >
                              <img
                                src={pv.pvImages?.[0]}
                                alt={pv.pvName}
                                className="my-2 md:my-4 w-14 h-14 rounded-lg object-cover border"
                              />
                              <div className="text-left">
                                <p className="font-medium line-clamp-1">
                                  {p.productName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Kho: {pv.pvStockQuantity}
                                </p>
                              </div>
                            </button>
                          </div>
                        </td>
                        <td className="text-center">{pv.pvName}</td>
                        <td className="text-center">
                          {formatMoney(currentPrice)}đ
                        </td>
                        <td className="text-center relative">
                          <div className="flex justify-center items-center">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  pvId,
                                  it.quantity - 1,
                                  maxItemQuantity
                                )
                              }
                              disabled={isDeleted}
                              className="w-6 h-6 border rounded hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-6 text-center">
                              {it.quantity}
                            </span>
                            <button
                              onClick={() => {
                                if (it.quantity < pv.pvStockQuantity)
                                  updateQuantity(
                                    pvId,
                                    it.quantity + 1,
                                    maxItemQuantity
                                  );
                              }}
                              disabled={isDeleted || isOutOfStock}
                              className="w-6 h-6 border rounded hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          {it.quantity === pv.pvStockQuantity && (
                            <p className="text-xs text-main mt-2">
                              Đạt số lượng tối đa{" "}
                            </p>
                          )}
                        </td>
                        <td className="text-center ">
                          {formatMoney(currentPrice * it.quantity)}đ
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => removeOne(pvId)}
                            className="inline-flex items-center gap-1 text-text-ac hover:underline"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center w-full h-[500px]">
          <img src={emptyCart} alt="" className="w-36 h-36 mb-2" />
          <p className="text-center italic text-gray-400 mb-2">
            Giỏ hàng của bạn còn trống.
          </p>
          <button
            onClick={() => navigate(`/`)}
            className="bg-button-bg-ac hover:bg-button-bg-hv rounded-3xl px-2 py-1 text-white text-sm md:text-base"
          >
            Mua ngay
          </button>
        </div>
      )}

      {outOfStockItems.length > 0 && (
        <div className={`${card} mb-4`}>
          <div className="mb-2 font-semibold">Sản phẩm đã hết hàng</div>
          <table className="min-w-full table-fixed text-sm md:text-base">
            <CartCols />
            <thead>
              <tr className="text-center text-gray-400">
                <th className="text-left">Sản phẩm</th>
                <th className="px-2">Phân loại</th>
                <th className="px-2">Đơn giá</th>
                <th className="px-2">Số lượng</th>
                <th className="px-2 text-center">Thành tiền</th>
                <th className="pl-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {outOfStockItems.map((it) => {
                const pv = it.productVariation || {};
                const p = it.product || {};
                const pvId = pv?._id;
                const currentPrice = it?.priceAtTime ?? pv?.pvPrice ?? 0;

                return (
                  <tr key={pvId} className="opacity-60">
                    <td className="text-left">
                      <div className="flex items-center justify-start gap-2">
                        {/* checkbox bị vô hiệu để tránh chọn mua */}
                        <label className="w-4 h-4 rounded  border flex justify-center items-center">
                          <input
                            type="checkbox"
                            disabled
                            className="cursor-not-allowed"
                            aria-label="Hết hàng"
                          />
                        </label>

                        <button
                          className="flex gap-2 justify-center items-center"
                          onClick={() =>
                            pvId && navigate(`/${path.PRODUCTS}/${pvId}`)
                          }
                        >
                          <img
                            src={pv?.pvImages?.[0]}
                            alt={pv?.pvName}
                            className="my-2 md:my-4 w-14 h-14 rounded-lg object-cover border"
                          />
                          <div className="text-left">
                            <p className="font-medium line-clamp-1">
                              {p?.productName || "Sản phẩm"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {pv?.pvSlug}
                            </p>
                          </div>
                        </button>
                      </div>
                    </td>

                    <td className="text-center">{pv?.pvName}</td>

                    <td className="text-center">
                      {formatMoney(currentPrice)}đ
                    </td>

                    {/* Số lượng: hiển thị badge 'Hết hàng' */}
                    <td className="text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-xs">
                        Hết hàng
                      </span>
                    </td>

                    <td className="text-center">
                      {formatMoney(currentPrice * (it?.quantity ?? 0))}đ
                    </td>

                    {/* Vẫn cho phép xóa */}
                    <td className="text-right">
                      <button
                        onClick={() => pvId && removeOne(pvId)}
                        className="inline-flex items-center gap-1 text-text-ac hover:underline"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {groups?.length > 0 && (
        // footer
        <div
          className={`z-20 sticky bottom-4  rounded-3xl border border-gray-300 shadow-lg  bg-white p-2 md:p-4 `}
        >
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex gap-3">
              <label className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-black flex justify-center items-center">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className={`${checkout}`}
                  />
                </div>
                <span>Chọn tất cả</span>
              </label>
              <button
                onClick={removeSelected}
                className="px-3 py-1 rounded-3xl border hover:bg-gray-100 shadow-md"
              >
                Xóa
              </button>
            </div>

            <div className="flex items-center gap-3">
              <p>
                Tổng cộng ({selectedPvIds.size} sp){": "}
                <span className="text-xl text-main font-bold">
                  {formatMoney(totalPrice)}đ
                </span>
              </p>

              <button
                onClick={handleBuyNow}
                className="px-3 py-1 bg-button-bg-ac hover:bg-button-bg-hv rounded-3xl text-white"
              >
                Mua hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
