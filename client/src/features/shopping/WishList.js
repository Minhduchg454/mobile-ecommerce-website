import React, { memo, useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ImBin } from "react-icons/im";
import { useNavigate } from "react-router-dom";

import { apiGetProductVariation } from "../../services/catalog.api";
import { formatMoney } from "ultils/helpers";
import { toast } from "react-toastify";
import path from "ultils/path";
import { SelectQuantity } from "../../components";
import { showAlert } from "store/app/appSlice";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import emptyWishList from "../../assets/empty-wishlist.png";
import imageNotFound from "../../assets/image-not-found.png";
import { fetchWishlist, updateCartItem } from "store/user/asyncActions";
import {
  apiDeleteWishlist,
  apiDeleteWishlistByCondition,
  apiDeleteAllWishlistByCustomerId,
} from "../../services/shopping.api";
import clsx from "clsx";
import { AiOutlineEye, AiOutlineDelete } from "react-icons/ai";
import { MdAddShoppingCart } from "react-icons/md";

export const WishList = () => {
  const { current, wishList } = useSelector((s) => s.user);
  const navigate = useNavigate();
  const [variationData, setVariationData] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchVariations = async () => {
      const newData = {};
      await Promise.all(
        wishList?.map(async (item) => {
          const pvId = item.pvId._id;
          if (pvId && !variationData[pvId]) {
            const res = await apiGetProductVariation(pvId);
            if (res.success) {
              newData[pvId] = res.productVariation;
            }
          }
        })
      );
      setVariationData((prev) => ({ ...prev, ...newData }));
    };

    if (wishList?.length) fetchVariations();
  }, [wishList]);

  const handleRemoveWishlist = async (wishListItem) => {
    const wishlistId = wishListItem?._id;
    if (!wishlistId) return toast.error("Không tìm thấy ID để xoá");

    const res = await apiDeleteWishlist(wishlistId);

    if (res.success) {
      toast.success("Đã xóa sản phẩm khỏi yêu thích");
      dispatch(fetchWishlist());
    } else {
      toast.error("Xoá thất bại");
    }
  };

  const handleRemoveAll = () => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: async () => {
        const res = await apiDeleteAllWishlistByCustomerId({
          customerId: current._id,
        });
        if (res.success) {
          toast.success("Đã xóa toàn bộ danh sách yêu thích");
          dispatch(fetchWishlist());
        } else {
          const err = res.message;
          toast.error(err);
        }
      },
      onCancel: () => {},
      onClose: () => {},
    });

    dispatch(
      showAlert({
        id,
        title: `Bạn muốn bỏ tất cả sản phẩm khỏi yêu thích`,
        variant: "danger",
        showCancelButton: true,
        confirmText: "Có",
        cancelText: "Không",
      })
    );
  };

  const handleAddToCart = (productVariation) => {
    if (
      !productVariation?.pvStockQuantity ||
      productVariation.pvStockQuantity < 1
    ) {
      toast.warning("Sản phẩm hiện đã hết hàng!");
      return;
    }
    dispatch(
      updateCartItem({
        pvId: productVariation._id,
        cartItemQuantity: 1,
        priceAtTime: productVariation.pvPrice,
        add: true,
        maxItemQuantity: productVariation.pvStockQuantity,
      })
    );
    toast.success("Đã thêm sản phẩm vào giỏ hàng");
  };

  const isOut = (item) => {
    const pvId = item?.pvId?._id;
    const pv = variationData[pvId];
    return !pv || (pv.pvStockQuantity ?? 0) < 1;
  };

  // danh sách đã đảo + sort: còn hàng trước, hết hàng sau
  const sortedWishlist = useMemo(() => {
    if (!wishList?.length) return [];
    return wishList
      .slice() // không mutate redux state
      .reverse() // mới nhất lên đầu
      .sort((a, b) => (isOut(a) ? 1 : 0) - (isOut(b) ? 1 : 0));
  }, [wishList, variationData]);

  const buttonAction =
    "text-xs md:text-sm whitespace-nowrap border px-2 py-1 rounded-3xl flex items-center gap-1 text-black bg-button-bg hover:bg-button-hv";
  return (
    <div className="xl:mx-auto xl:w-main p-2 md:p-4 ">
      {/*header */}
      <div className={`mb-4 px-2 md:px-4 flex justify-between items-center`}>
        <h2 className="text-lg md:text-xl font-bold">Danh sách yêu thích</h2>
        {wishList?.length > 0 && (
          <button
            onClick={handleRemoveAll}
            className="bg-white/70 backdrop-blur-md  border px-2 py-1 rounded-3xl hover:bg-button-hv"
          >
            Xóa tất cả
          </button>
        )}
      </div>
      {wishList?.length > 0 ? (
        sortedWishlist.map((it) => {
          const pvId = it.pvId._id;
          const productVariation = pvId ? variationData[pvId] : null;
          const isOutStock = productVariation?.pvStockQuantity < 1;
          const productName =
            productVariation?.productId.productName || "Sản phẩm không còn";
          const pvPrice = !isOutStock
            ? `${formatMoney(productVariation?.pvPrice)}đ`
            : productVariation
            ? "Sản phẩm tạm hết hàng"
            : "";
          const image = productVariation?.pvImages?.[0] || imageNotFound;
          return (
            <div
              key={it._id}
              className={clsx(
                "bg-white rounded-3xl p-3 mb-4 md:p-4 flex justify-between items-center gap-3  border border-gray-300",
                !productVariation && "bg-red-50"
              )}
            >
              <button
                className="flex justify-center items-start gap-3 "
                onClick={() => navigate(`/${path.PRODUCTS}/${pvId}`)}
              >
                {/* Hình ảnh */}
                <img
                  src={image}
                  alt="thumb"
                  className="w-20 h-20 object-cover rounded-md border my-auto"
                />

                {/* Thông tin */}
                <div className="flex flex-col justify-center items-start">
                  <div
                    className={`text-sm md:text-base text-left font-semibold  line-clamp-1 ${
                      isOutStock ? "text-gray-300" : "text-black"
                    }`}
                  >
                    {productName}
                  </div>
                  <div
                    className={`text-xs md:text-sm ${
                      isOutStock ? "text-gray-300" : "text-black"
                    }`}
                  >
                    {productVariation?.pvName}
                  </div>
                  <div
                    className={`text-xs md:text-sm ${
                      isOutStock ? "text-gray-300" : "text-black"
                    }`}
                  >
                    Kho: {productVariation?.pvStockQuantity}
                  </div>
                  <div
                    className={`font-bold  text-sm md:text-base ${
                      isOutStock ? "text-gray-300" : "text-main"
                    }`}
                  >
                    {pvPrice || (
                      <span className="italic text-sm">
                        (Không xác định giá)
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Cụm chức năng */}
              <div className="flex flex-col md:flex-row gap-2 justify-center items-end">
                {productVariation ? (
                  <button
                    onClick={() => handleAddToCart(productVariation)}
                    className={`${buttonAction} `}
                  >
                    <MdAddShoppingCart size={16} />
                    <span>Thêm vào giỏ</span>
                  </button>
                ) : null}

                <button
                  onClick={() => handleRemoveWishlist(it)}
                  className={`${buttonAction}  `}
                >
                  <AiOutlineDelete size={16} />
                  <span>Bỏ yêu thích</span>
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center w-full h-[500px]">
          <img src={emptyWishList} alt="" className="w-36 h-36 mb-2" />
          <p className="text-center italic text-gray-400 mb-2">
            Danh sách yêu thích của bạn còn trống.
          </p>
          <button
            onClick={() => navigate(`/`)}
            className="bg-button-bg-ac hover:bg-button-bg-hv rounded-3xl px-2 py-1 text-white text-sm md:text-base"
          >
            Thêm vào ngay
          </button>
        </div>
      )}
    </div>
  );
};
