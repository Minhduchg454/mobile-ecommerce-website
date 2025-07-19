import React, { memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AiFillCloseCircle } from "react-icons/ai";
import { ImBin } from "react-icons/im";
import clsx from "clsx";
import withBaseComponent from "hocs/withBaseComponent";
import { showWishlist } from "store/app/appSlice";
import { getCurrent } from "store/user/asyncActions";
import { apiUpdateWishlist } from "apis/user";
import { formatMoney } from "ultils/helpers";
import { toast } from "react-toastify";
import path from "ultils/path";
import { useNavigate } from "react-router-dom";

const WishlistModal = ({ dispatch, navigate }) => {
  const { current, isLoggedIn } = useSelector((state) => state.user);

  const handleRemoveWishlist = async (e, variantId) => {
    e.stopPropagation();
    if (!isLoggedIn || !current) {
      toast.error("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    try {
      const res = await apiUpdateWishlist(variantId);
      if (res.success) {
        dispatch(getCurrent());
        toast.success("Đã xóa khỏi danh sách yêu thích!");
      } else {
        toast.error(res.mes || "Có lỗi khi xóa!");
      }
    } catch (err) {
      toast.error("Có lỗi khi xóa!");
    }
  };

  const handleNavigateToProduct = (variant) => {
    const slugCategory = variant.productId?.categoryId?.slug || "san-pham";
    const slug = variant.productId?.slug || "";
    navigate(`/${slugCategory}/${slug}?code=${variant._id}`);
    dispatch(showWishlist());
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={clsx(
        "w-full md:w-[60vw] md:max-w-[800px] h-screen bg-white text-gray-800 flex flex-col relative"
      )}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow px-4 py-3 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold">❤️ Danh sách yêu thích</h2>
        <span
          onClick={() => dispatch(showWishlist())}
          className="cursor-pointer text-gray-500 hover:text-red-500"
        >
          <AiFillCloseCircle size={24} />
        </span>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {current?.wishlist?.length > 0 ? (
          current.wishlist.map((variant) => (
            <div
              key={variant._id}
              className="flex gap-2 justify-between items-center border-b p-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleNavigateToProduct(variant)}
            >
              {/* Hình ảnh */}
              <img
                src={
                  variant.thumb ||
                  variant.images?.[0] ||
                  variant.productId?.thumb ||
                  "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"
                }
                alt={variant.productName}
                className="w-20 h-20 object-cover rounded-md border"
              />

              {/* Thông tin */}
              <div className="flex-1">
                <div className="font-medium text-base text-main">
                  {variant.productName || variant.productId?.productName || "Đang tải..."}
                </div>
                <div className="text-sm text-gray-500">
                  Biến thể ID: {variant._id}
                </div>
              </div>

              {/* Giá & Xoá */}
              <div className="text-right">
                <div className="text-red-500 font-semibold mb-2">
                  {formatMoney(variant.price || 0)} VND
                </div>
                <div
                  onClick={(e) => handleRemoveWishlist(e, variant._id)}
                  className="text-sm text-gray-500 hover:text-red-600 cursor-pointer flex items-center justify-end gap-1"
                >
                  <ImBin size={16} />
                  <span>Xoá</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center italic text-gray-400 py-6">
            Bạn chưa có sản phẩm nào trong danh sách yêu thích.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-4 shadow-[0_-2px_6px_rgba(0,0,0,0.08)] bg-white z-10">
        <div className="text-center text-sm text-gray-600">
          Nhấn vào sản phẩm để xem chi tiết
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(WishlistModal)); 