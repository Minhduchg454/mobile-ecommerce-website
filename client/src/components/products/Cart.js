import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AiFillCloseCircle } from "react-icons/ai";
import { ImBin } from "react-icons/im";
import clsx from "clsx";
import Button from "components/buttons/Button";
import withBaseComponent from "hocs/withBaseComponent";
import { showCart } from "store/app/appSlice";
import { apiRemoveCart, apiUpdateCart, apiGetProductVariation } from "apis";
import {
  getCurrent,
  updateCartItem,
  removeCartItem,
} from "store/user/asyncActions";
import { formatMoney } from "ultils/helpers";
import { toast } from "react-toastify";
import path from "ultils/path";
import { FaCheck } from "react-icons/fa";
import { ShowSwal } from "../../components";

const Cart = ({ dispatch, navigate }) => {
  const { currentCart } = useSelector((state) => state.user);
  const [variationData, setVariationData] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);

  // Lấy thông tin biến thể
  useEffect(() => {
    const fetchVariations = async () => {
      const newData = {};
      await Promise.all(
        currentCart?.map(async (item) => {
          if (!variationData[item.productVariationId]) {
            const res = await apiGetProductVariation(item.productVariationId);
            if (res.success) {
              newData[item.productVariationId] = res.variation;
            }
          }
        })
      );
      setVariationData((prev) => ({ ...prev, ...newData }));
    };

    if (currentCart?.length) fetchVariations();
  }, [currentCart]);

  // Chọn tất cả
  const isAllSelected =
    currentCart?.length > 0 && selectedItems.length === currentCart.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentCart.map((el) => el.productVariationId));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const removeCart = (pid) => {
    dispatch(removeCartItem(pid))
      .unwrap()
      .catch((err) => toast.error(err));
  };

  const updateQuantity = (pid, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ product: pid, quantity }))
      .unwrap()
      .catch((err) => toast.error(err));
  };

  const total = currentCart?.reduce((sum, el) => {
    if (selectedItems.includes(el.productVariationId)) {
      return sum + el.priceAtTime * el.quantity;
    }
    return sum;
  }, 0);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={clsx(
        "w-full md:w-[60vw] md:max-w-[800px] h-screen bg-white text-gray-800 flex flex-col relative"
      )}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow px-4 py-3 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold">🛒 Giỏ hàng của bạn</h2>
        <span
          onClick={() => dispatch(showCart())}
          className="cursor-pointer text-gray-500 hover:text-red-500"
        >
          <AiFillCloseCircle size={24} />
        </span>
      </div>

      {/* Chọn tất cả */}
      {currentCart?.length > 0 && (
        <div className="px-4 py-2 border-b flex items-center gap-2">
          <div
            onClick={toggleSelectAll}
            className={clsx(
              "h-5 w-5 border rounded flex items-center justify-center cursor-pointer",
              isAllSelected ? "bg-main text-white" : "bg-white"
            )}
          >
            {isAllSelected && <FaCheck size={10} />}
          </div>
          <span className="text-sm">Chọn tất cả</span>
        </div>
      )}

      {/* Danh sách sản phẩm */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {currentCart?.length > 0 ? (
          currentCart.map((el) => {
            const variation = variationData[el.productVariationId];
            const isChecked = selectedItems.includes(el.productVariationId);

            return (
              <div
                key={el.productVariationId}
                className="flex gap-2 justify-between items-center border-b p-2"
              >
                {/* Checkbox */}
                <div
                  onClick={() => toggleSelectItem(el.productVariationId)}
                  className={clsx(
                    "h-5 w-5 border rounded flex items-center justify-center cursor-pointer",
                    isChecked ? "bg-main text-white" : "bg-white"
                  )}
                >
                  {isChecked && <span className="text-xs font-bold">✓</span>}
                </div>

                {/* Hình ảnh */}
                <img
                  src={
                    variation?.images?.[0] ||
                    variation?.productId?.thumb ||
                    "/fallback.jpg"
                  }
                  alt="thumb"
                  className="w-20 h-20 object-cover rounded-md border"
                />

                {/* Thông tin */}
                <div className="flex-1">
                  <div className="font-medium text-base text-main">
                    {variation?.productId?.brandId?.brandName
                      ? `${variation.productId.brandId.brandName} - `
                      : ""}
                    {variation?.productVariationName || "Đang tải..."}
                  </div>
                  <div className="text-sm text-gray-500">
                    Biến thể ID: {el.productVariationId}
                  </div>

                  {/* Số lượng */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQuantity(el.productVariationId, el.quantity - 1)
                      }
                      className="w-6 h-6 border rounded hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{el.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(el.productVariationId, el.quantity + 1)
                      }
                      className="w-6 h-6 border rounded hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Giá & Xoá */}
                <div className="text-right">
                  <div className="text-red-500 font-semibold mb-2">
                    {formatMoney(el.priceAtTime * el.quantity)} VND
                  </div>
                  <div
                    onClick={() => removeCart(el.productVariationId)}
                    className="text-sm text-gray-500 hover:text-red-600 cursor-pointer flex items-center justify-end gap-1"
                  >
                    <ImBin size={16} />
                    <span>Xoá</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center italic text-gray-400 py-6">
            Giỏ hàng hiện đang trống.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-4 shadow-[0_-2px_6px_rgba(0,0,0,0.08)] bg-white z-10">
        <div className="flex justify-between font-semibold mb-1">
          <span>Tổng cộng:</span>
          <span>{formatMoney(total)} VND</span>
        </div>
        <span className="text-xs italic text-gray-500 mb-2 block">
          (Chưa bao gồm VAT)
        </span>
        <button
          onClick={() => {
            if (selectedItems.length === 0) {
              ShowSwal({
                title: "Chưa chọn sản phẩm",
                text: "Vui lòng chọn ít nhất một sản phẩm để thanh toán.",
                icon: "warning",
                confirmText: "Đóng",
                showCancelButton: false,
                variant: "danger",
              });
              return;
            }

            dispatch(showCart());
            navigate(`/${path.CHECKOUT}`, {
              state: {
                selectedItems: currentCart.filter((el) =>
                  selectedItems.includes(el.productVariationId)
                ),
              },
            });
          }}
          className="w-fit p-2 bg-main py-3 rounded-xl text-white hover:bg-blue-500"
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(Cart));
