import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ImBin } from "react-icons/im";
import { AiOutlineHeart } from "react-icons/ai";
import clsx from "clsx";
import withBaseComponent from "hocs/withBaseComponent";
import { getCurrent } from "store/user/asyncActions";
import { apiUpdateWishlist } from "apis/user";
import { formatMoney } from "ultils/helpers";
import { toast } from "react-toastify";
import path from "ultils/path";
import { useNavigate } from "react-router-dom";

const WishlistPage = ({ dispatch, navigate }) => {
  const { current, isLoggedIn } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveWishlist = async (variantId) => {
    if (!isLoggedIn || !current) {
      toast.error("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToProduct = (variant) => {
    const slugCategory = variant.productId?.categoryId?.slug || "san-pham";
    const slug = variant.productId?.slug || "";
    navigate(`/${slugCategory}/${slug}?code=${variant._id}`);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <AiOutlineHeart className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Bạn chưa đăng nhập
          </h2>
          <p className="text-gray-500 mb-4">
            Vui lòng đăng nhập để xem danh sách yêu thích của bạn
          </p>
          <button
            onClick={() => navigate(`/${path.LOGIN}`)}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AiOutlineHeart className="text-2xl text-red-500" />
            <h1 className="text-2xl font-bold text-gray-800">
              Danh sách yêu thích
            </h1>
          </div>
          <p className="text-gray-600">
            {current?.wishlist?.length || 0} sản phẩm trong danh sách yêu thích
          </p>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {current?.wishlist?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {current.wishlist.map((variant) => (
                <div
                  key={variant._id}
                  className="flex gap-4 p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleNavigateToProduct(variant)}
                >
                  {/* Hình ảnh sản phẩm */}
                  <div className="flex-shrink-0">
                    <img
                      src={
                        variant.thumb ||
                        variant.images?.[0] ||
                        variant.productId?.thumb ||
                        "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"
                      }
                      alt={variant.productName || variant.productId?.productName}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {variant.productName || variant.productId?.productName || "Đang tải..."}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Biến thể: {variant._id}
                    </p>
                    {variant.productId?.brandId?.brandName && (
                      <p className="text-sm text-gray-500">
                        Thương hiệu: {variant.productId.brandId.brandName}
                      </p>
                    )}
                  </div>

                  {/* Giá và nút xóa */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-600">
                        {variant.price ? `${formatMoney(variant.price)} VNĐ` : "Liên hệ"}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveWishlist(variant._id);
                      }}
                      disabled={isLoading}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                        isLoading
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                      )}
                    >
                      <ImBin size={16} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AiOutlineHeart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Danh sách yêu thích trống
              </h3>
              <p className="text-gray-500 mb-6">
                Bạn chưa có sản phẩm nào trong danh sách yêu thích
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Mua sắm ngay
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {current?.wishlist?.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Nhấn vào sản phẩm để xem chi tiết
          </div>
        )}
      </div>
    </div>
  );
};

export default withBaseComponent(memo(WishlistPage)); 