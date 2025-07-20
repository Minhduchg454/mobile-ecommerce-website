import React, { memo, useState, useEffect } from "react";
import withBaseComponent from "hocs/withBaseComponent";
import { renderStarFromNumber, formatMoney } from "ultils/helpers";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  BsFillCartPlusFill,
  BsFillSuitHeartFill,
  BsSuitHeart,
} from "react-icons/bs";
import Swal from "sweetalert2";
import path from "ultils/path";
import { useNavigate } from "react-router-dom";
import { updateCartItem, fetchWishlist } from "store/user/asyncActions";
import useRole from "hooks/useRole";
import { apiCreateWishlist, apiDeleteWishlistByCondition } from "../../apis";
import clsx from "clsx";

const ProductCard = ({
  totalSold,
  price,
  rating,
  productName,
  thumb,
  pvid, // chính là _id của biến thể (variant)
  slugCategory,
  slug,
  onAddToCart,
  onToggleWishlist,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, isLoggedIn, wishList } = useSelector((state) => state.user);
  const { isAdmin } = useRole();
  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    const found = wishList?.some((item) => {
      const variation = item.productVariationId;
      return variation && variation._id === pvid;
    });
    setIsWished(found);
  }, [wishList, pvid]);

  const redirectToLogin = () => {
    Swal.fire({
      icon: "info",
      title: "Bạn chưa đăng nhập",
      text: "Vui lòng đăng nhập để thực hiện thao tác này",
      showCancelButton: true,
      confirmButtonText: "Đăng nhập",
      cancelButtonText: "Để sau",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/${path.LOGIN}`);
      }
    });
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    // Gọi Redux để thêm vào giỏ hàng
    dispatch(
      updateCartItem({
        product: pvid,
        quantity: 1,
        priceAtTime: price,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Đã thêm vào giỏ hàng");
      })
      .catch((err) => {
        toast.error(err || "Có lỗi khi thêm vào giỏ hàng");
      });
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn || !current) return redirectToLogin();

    const newWished = !isWished;
    setIsWished(newWished);

    try {
      if (newWished) {
        // Thêm vào wishlist
        await apiCreateWishlist({
          userId: current._id,
          productVariationId: pvid,
        });
        toast.success("Đã thêm vào yêu thích");
      } else {
        // Xoá khỏi wishlist bằng điều kiện
        await apiDeleteWishlistByCondition({
          userId: current._id,
          productVariationId: pvid,
        });
        toast.info("Đã bỏ khỏi yêu thích");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật yêu thích");
      console.error(error);
      setIsWished(!newWished);
    }

    // Gọi lại để cập nhật thông tin người dùng
    dispatch(fetchWishlist());
  };

  const handleNavigate = () => {
    navigate(`/${slugCategory}/${slug}?code=${pvid}`);
  };

  return (
    <div
      onClick={handleNavigate}
      className="card-default cursor-pointer w-[230px] h-[350px] p-3 flex flex-col justify-between items-center overflow-hidden"
    >
      {/* Ảnh sản phẩm */}
      <div className="w-full h-[200px] flex justify-center items-center">
        <img
          src={
            thumb ||
            "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"
          }
          alt="product"
          className="max-h-full w-auto object-contain"
        />
      </div>

      {/* Nội dung sản phẩm */}
      <div className="flex flex-col justify-start items-center text-xs w-full mt-2">
        <span className="line-clamp-2 capitalize text-sm font-medium text-center">
          {productName?.toLowerCase()}
        </span>
        <span className="flex h-4 items-center gap-1 text-yellow-500 mt-1">
          {renderStarFromNumber(rating, 14)?.map((el, index) => (
            <span key={index}>{el}</span>
          ))}
          <span className="text-gray-500 ml-2">{`Đã bán ${totalSold}`}</span>
        </span>
        <span className="text-main font-semibold mt-1">
          {price ? `${formatMoney(price)} VNĐ` : "Liên hệ"}
        </span>
      </div>
      {/* Nút hành động */}
      <div className="flex w-full mt-2 gap-2">
        {/* Thêm giỏ hàng */}
        <button
          disabled={isAdmin}
          onClick={handleAddToCart}
          className={clsx(
            "flex items-center justify-center rounded-md py-1 font-semibold transition-all duration-200 ease-in-out",
            isAdmin
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200",
            isLoggedIn && !isAdmin ? "w-2/3" : "w-full"
          )}
        >
          <BsFillCartPlusFill
            className={clsx(
              "mr-1",
              isAdmin ? "text-gray-500" : "text-blue-700"
            )}
          />
          Giỏ hàng
        </button>

        {/* Yêu thích */}
        {isLoggedIn && !isAdmin && (
          <button
            disabled={isAdmin}
            onClick={handleToggleWishlist}
            className={clsx(
              "w-1/3 flex items-center justify-center border rounded-md py-1 transition-all",
              isAdmin
                ? "border-gray-500 cursor-not-allowed"
                : isWished
                ? "bg-red-100 border-2 border-red-500 hover:bg-red-200"
                : "border-red-300 hover:bg-pink-600"
            )}
          >
            {isWished ? (
              <BsFillSuitHeartFill className="text-red-500" />
            ) : (
              <BsSuitHeart className="text-red-300" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default withBaseComponent(memo(ProductCard));
