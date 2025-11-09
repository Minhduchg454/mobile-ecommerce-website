import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AiFillCloseCircle } from "react-icons/ai";
import { ImBin } from "react-icons/im";
import clsx from "clsx";
import Button from "components/buttons/Button";
import withBaseComponent from "hocs/withBaseComponent";
import { showCart } from "store/app/appSlice";
import { apiGetProductVariation } from "apis";
import { updateCartItem, removeCartItem } from "store/user/asyncActions";
import { formatMoney } from "ultils/helpers";
import { toast } from "react-toastify";
import path from "ultils/path";
import { FaCheck } from "react-icons/fa";
import { ShowSwal } from "../../components";
import imageNotFound from "../../assets/image-not-found.png";

const Cart = ({ dispatch, navigate }) => {
  const { current, currentCart } = useSelector((state) => state.user);
  const [variationData, setVariationData] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchVariations = async () => {
      const newData = {};
      await Promise.all(
        currentCart?.map(async (item) => {
          if (!variationData[item.productVariationId]) {
            const res = await apiGetProductVariation(item.productVariationId);
            newData[item.productVariationId] =
              res.success && res.variation ? res.variation : null;
          }
        })
      );
      setVariationData((prev) => ({ ...prev, ...newData }));
    };

    if (currentCart?.length) fetchVariations();
  }, [currentCart]);

  const validSelectableIds = currentCart
    ?.filter(
      (el) =>
        variationData[el.productVariationId] &&
        variationData[el.productVariationId].stockQuantity > 0
    )
    .map((el) => el.productVariationId);

  const isAllSelected =
    validSelectableIds?.length > 0 &&
    validSelectableIds.every((id) => selectedItems.includes(id));

  const toggleSelectAll = () => {
    if (selectedItems.length === validSelectableIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(validSelectableIds);
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
    if (quantity < 1) {
      removeCart(pid);
      return;
    }
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

  const sortedCart = [...currentCart].sort((a, b) => {
    const aVariation = variationData[a.productVariationId];
    const bVariation = variationData[b.productVariationId];
    const aInvalid = !aVariation || aVariation.stockQuantity < 1;
    const bInvalid = !bVariation || bVariation.stockQuantity < 1;
    return bInvalid - aInvalid;
  });

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full md:w-[60vw] md:max-w-[800px] h-screen bg-white text-gray-800 flex flex-col relative"
    >
      <div className="sticky top-0 z-20 bg-white shadow px-4 py-3 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold">🛒 Giỏ hàng của bạn</h2>
        <span
          onClick={() => dispatch(showCart())}
          className="cursor-pointer text-gray-500 hover:text-red-500"
        >
          <AiFillCloseCircle size={24} />
        </span>
      </div>

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

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {currentCart?.length > 0 ? (
          sortedCart.map((el) => {
            const variation = variationData[el.productVariationId];
            const isDeleted = variation === null;
            const isOutOfStock = variation?.stockQuantity < 1;
            const isDisabled = isDeleted || isOutOfStock;
            const isChecked = selectedItems.includes(el.productVariationId);

            return (
              <div
                key={el.productVariationId}
                className={clsx(
                  "flex gap-2 justify-between items-center border-b p-2",
                  isDisabled && "opacity-60"
                )}
              >
                <div className="w-5">
                  {!isDisabled && (
                    <div
                      onClick={() => toggleSelectItem(el.productVariationId)}
                      className={clsx(
                        "h-5 w-5 border rounded flex items-center justify-center cursor-pointer",
                        isChecked ? "bg-main text-white" : "bg-white"
                      )}
                    >
                      {isChecked && (
                        <span className="text-xs font-bold">✓</span>
                      )}
                    </div>
                  )}
                </div>

                <img
                  src={
                    isDeleted
                      ? imageNotFound
                      : variation?.images?.[0] || variation?.productId?.thumb
                  }
                  alt="thumb"
                  className="w-20 h-20 object-cover rounded-md border"
                />

                <div className="flex-1">
                  <div className="font-medium text-base text-main">
                    {isDeleted
                      ? "Sản phẩm đã bị xoá"
                      : `${variation?.productId?.productName} - ${variation?.productVariationName}`}
                    {(isDeleted || isOutOfStock) && (
                      <span className="ml-2 text-red-500 text-xs font-semibold">
                        {isDeleted ? "(Đã xoá)" : "(Hết hàng)"}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Biến thể ID: {el.productVariationId}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        !isDeleted &&
                        updateQuantity(el.productVariationId, el.quantity - 1)
                      }
                      disabled={isDeleted}
                      className="w-6 h-6 border rounded hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{el.quantity}</span>
                    <button
                      onClick={() =>
                        !isDeleted &&
                        updateQuantity(el.productVariationId, el.quantity + 1)
                      }
                      disabled={isDeleted || isOutOfStock}
                      className="w-6 h-6 border rounded hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  {isDeleted ? (
                    <div className="text-red-500 font-semibold text-sm mb-2">
                      (Sản phẩm không tồn tại)
                    </div>
                  ) : isOutOfStock ? (
                    <div className="text-red-500 font-semibold mt-1">
                      <p>(Sản phẩm hiện hết hàng)</p>
                    </div>
                  ) : (
                    <div className="text-red-500 font-semibold mb-2">
                      {formatMoney(el.priceAtTime * el.quantity)} VND
                    </div>
                  )}

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

      {/*footer  */}
      <div className="border-t p-4 shadow-xl bg-white z-10">
        <div className="flex justify-between font-semibold mb-1">
          <div cl>
            <p>Tổng cộng :</p>
            {selectedItems.length > 0 && (
              <p className="text-sm text-gray-500 ml-1">
                ({selectedItems.length} sản phẩm)
              </p>
            )}
          </div>

          <span className="text-2xl text-red-500 mr-[90px]">
            {formatMoney(total)} VND
          </span>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              if (!current?._id) {
                ShowSwal({
                  title: "Cần đăng nhập",
                  text: "Vui lòng đăng nhập để tiếp tục thanh toán.",
                  icon: "warning",
                  confirmText: "Đăng nhập",
                  showCancelButton: true,
                  cancelText: "Hủy",
                  variant: "danger",
                }).then((result) => {
                  if (result.isConfirmed) {
                    dispatch(showCart());
                    navigate(`/${path.LOGIN}`);
                  }
                });
                return;
              }

              const validSelectedItems = currentCart.filter(
                (el) =>
                  selectedItems.includes(el.productVariationId) &&
                  variationData[el.productVariationId] &&
                  variationData[el.productVariationId].stockQuantity > 0
              );

              if (validSelectedItems.length === 0) {
                ShowSwal({
                  title: "Không thể thanh toán",
                  text: "Chỉ những sản phẩm còn hàng mới được thanh toán. Vui lòng kiểm tra lại lựa chọn của bạn.",
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
                  selectedItems: validSelectedItems,
                },
              });
            }}
            className="w-fit p-2 bg-main py-3 rounded-xl text-white hover:bg-blue-500"
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(Cart));
