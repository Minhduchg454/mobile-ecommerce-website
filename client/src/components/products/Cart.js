import React, { memo } from "react";
import { useSelector } from "react-redux";
import { AiFillCloseCircle } from "react-icons/ai";
import { ImBin } from "react-icons/im";
import clsx from "clsx";
import Button from "components/buttons/Button";
import withBaseComponent from "hocs/withBaseComponent";
import { showCart } from "store/app/appSlice";
import { apiRemoveCart, apiUpdateCart } from "apis";
import { getCurrent } from "store/user/asyncActions";
import { formatMoney } from "ultils/helpers";
import { toast } from "react-toastify";
import path from "ultils/path";

const Cart = ({ dispatch, navigate }) => {
  const { currentCart } = useSelector((state) => state.user);

  const removeCart = async (pid, color) => {
    const response = await apiRemoveCart(pid, color);
    if (response.success) dispatch(getCurrent());
    else toast.error(response.mes);
  };

  const updateQuantity = async (pid, color, quantity) => {
    if (quantity < 1) return;

    const response = await apiUpdateCart({ product: pid, color, quantity });
    if (response.success) dispatch(getCurrent());
    else toast.error(response.mes);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={clsx(
        "w-full md:w-[40vw] md:max-w-[800px] h-screen bg-white text-gray-800 flex flex-col relative"
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

      {/* Tiêu đề bảng */}
      <div className="grid grid-cols-6 font-semibold text-sm text-gray-600 px-4 py-2 border-b bg-gray-50 sticky top-[58px] z-10">
        <span className="text-center">STT</span>
        <span className="col-span-2">Sản phẩm</span>
        <span className="text-center">Số lượng</span>
        <span className="text-center">Giá</span>
        <span className="text-center">Xoá</span>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {currentCart?.length > 0 ? (
          currentCart.map((el, idx) => (
            <div
              key={el._id}
              className="grid grid-cols-6 border-b pb-2 gap-2 text-sm items-center"
            >
              <span className="text-center">{idx + 1}</span>

              {/* Sản phẩm */}
              <div className="col-span-2 flex gap-2">
                <img
                  src={el.thumbnail}
                  alt="thumb"
                  className="w-14 h-16 object-cover rounded"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-main">{el.title}</span>
                  <span className="text-xs text-gray-500">{`Màu: ${el.color}`}</span>
                </div>
              </div>

              {/* Số lượng */}
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(el.product?._id, el.color, el.quantity - 1)
                  }
                  className="w-6 h-6 border rounded hover:bg-gray-200"
                >
                  -
                </button>
                <span className="w-6 text-center">{el.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(el.product?._id, el.color, el.quantity + 1)
                  }
                  className="w-6 h-6 border rounded hover:bg-gray-200"
                >
                  +
                </button>
              </div>

              {/* Giá */}
              <span className="text-center">
                {formatMoney(el.price * el.quantity)} VND
              </span>

              {/* Xoá */}
              <div className="flex justify-center items-center">
                <span
                  onClick={() => removeCart(el.product?._id, el.color)}
                  className="cursor-pointer hover:text-red-600"
                  title="Xoá"
                >
                  <ImBin size={16} />
                </span>
              </div>
            </div>
          ))
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
          <span>
            {formatMoney(
              currentCart?.reduce((sum, el) => sum + el.price * el.quantity, 0)
            ) + " VND"}
          </span>
        </div>
        <span className="text-xs italic text-gray-500 mb-2 block">
          (Chưa bao gồm VAT)
        </span>
        <Button
          handleOnClick={() => {
            dispatch(showCart());
            navigate(`/${path.CHECKOUT}`);
            // navigate(`/${path.MEMBER}/${path.DETAIL_CART}`);
          }}
          style="w-full bg-main py-3 rounded-md"
        >
          Thanh toán
        </Button>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(Cart));
