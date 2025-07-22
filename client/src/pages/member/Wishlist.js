import React, { memo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AiFillCloseCircle } from "react-icons/ai";
import clsx from "clsx";
import withBaseComponent from "hocs/withBaseComponent";
import { showWishlist } from "store/app/appSlice";
import { formatMoney } from "ultils/helpers";
import { fetchWishlist, updateCartItem } from "store/user/asyncActions";
import { toast } from "react-toastify";
import {
  apiGetProductVariation,
  apiDeleteWishlistByCondition,
  apiDeleteWishlist,
} from "apis";
import { AiOutlineEye, AiOutlineDelete } from "react-icons/ai";
import { MdAddShoppingCart } from "react-icons/md";
import imageNotFound from "../../assets/image-not-found.jpg";

import { useNavigate } from "react-router-dom";

const Wishlist = ({ dispatch }) => {
  const { current, wishList } = useSelector((s) => s.user);
  const navigate = useNavigate();
  const [variationData, setVariationData] = useState({});
  // Lấy thông tin biến thể
  useEffect(() => {
    const fetchVariations = async () => {
      const newData = {};
      await Promise.all(
        wishList?.map(async (item) => {
          const variationId = item.productVariationId?._id;
          if (variationId && !variationData[variationId]) {
            const res = await apiGetProductVariation(variationId);
            if (res.success) {
              newData[variationId] = res.variation;
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

  const handleAddToCart = (variation) => {
    if (!variation?.stockQuantity || variation.stockQuantity < 1) {
      toast.warning("Sản phẩm hiện đã hết hàng!");
      return;
    }
    dispatch(
      updateCartItem({
        product: variation._id,
        quantity: 1,
        priceAtTime: variation.price,
      })
    );

    toast.success("Đã thêm vào giỏ hàng");
  };

  const handleNavigate = (variation) => {
    const slugCategory = variation.productId.categoryId.slug;
    const slug = variation.slug;
    const pvid = variation._id;
    navigate(`/${slugCategory}/${slug}?code=${pvid}`);
    dispatch(showWishlist());
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={clsx(
        "w-full lg:w-[40vw] lg:max-w-[800px] h-screen bg-gray-50 text-gray-800 flex flex-col relative"
      )}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-50 shadow px-4 py-3 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold">💖 Danh sách yêu thích</h2>
        <span
          onClick={() => dispatch(showWishlist())}
          className="cursor-pointer text-gray-500 hover:text-red-500"
        >
          <AiFillCloseCircle size={24} />
        </span>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {wishList?.length > 0 ? (
          wishList.map((el) => {
            const variationId = el.productVariationId?._id;
            const variation = variationId ? variationData[variationId] : null;

            // Nếu không còn tồn tại, tạo object giả để hiển thị tương tự
            const productName =
              variation?.productId?.productName || "Sản phẩm không còn";
            const productVariationName = variation?.productVariationName || "";
            const price =
              variation?.stockQuantity >= 1
                ? `${formatMoney(variation.price)} VND`
                : variation
                ? "(sản phẩm hiện hết hàng)"
                : "";
            const image =
              variation?.images?.[0] ||
              variation?.productId?.thumb ||
              imageNotFound;

            return (
              <div
                key={el._id}
                className={clsx(
                  "flex gap-3 justify-between items-center border-b p-3",
                  !variation && "bg-red-50"
                )}
              >
                {/* Hình ảnh */}
                <img
                  src={image}
                  alt="thumb"
                  className="w-20 h-20 object-cover rounded-md border"
                />

                {/* Thông tin */}
                <div className="flex-1">
                  <div className="font-semibold text-base text-gray-800">
                    {productName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {productVariationName}
                  </div>
                  <div className="text-red-500 font-semibold mt-1">
                    {price || (
                      <span className="italic text-sm">
                        (Không xác định giá)
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {variation ? (
                      <button
                        onClick={() => handleAddToCart(variation)}
                        className="text-sm border px-3 py-1 rounded text-gray-600 hover:bg-main hover:text-white flex items-center gap-1"
                      >
                        <MdAddShoppingCart size={16} />
                        <span>Thêm vào giỏ hàng</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleRemoveWishlist(el)}
                      className="text-sm border px-3 py-1 rounded text-gray-600 hover:text-red-500 flex items-center gap-1"
                    >
                      <AiOutlineDelete size={16} />
                      <span>Xoá</span>
                    </button>

                    {variation ? (
                      <button
                        onClick={() => handleNavigate(variation)}
                        className="text-sm border px-3 py-1 rounded text-gray-600 hover:bg-blue-100 hover:text-blue-600 flex items-center gap-1"
                      >
                        <AiOutlineEye size={16} />
                        <span>Chi tiết</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center italic text-gray-400 py-6">
            Bạn chưa có sản phẩm nào yêu thích.
          </div>
        )}
      </div>

      {/* Footer lơ lửng (tuỳ chọn, có thể bỏ nếu không cần) */}
      <div className="border-t p-4 shadow-[0_-2px_6px_rgba(0,0,0,0.05)] bg-gray-50 z-10 text-center text-sm text-gray-500 italic">
        Để thêm vào giỏ hàng, hãy chọn sản phẩm yêu thích và đặt hàng ngay!
      </div>
    </div>
  );
};

export default withBaseComponent(memo(Wishlist));
