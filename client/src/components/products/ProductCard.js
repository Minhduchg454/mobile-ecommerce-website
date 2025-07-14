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
import { getCurrent } from "store/user/asyncActions";

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
  const { current, isLoggedIn } = useSelector((state) => state.user);

  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    setIsWished(current?.wishlist?.some((item) => item._id === pvid));
  }, [current, pvid]);

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

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isLoggedIn || !current) return redirectToLogin();

    if (onAddToCart) {
      onAddToCart();
    } else {
      toast.success("Đã thêm vào giỏ hàng!");
    }
    dispatch(getCurrent());
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    if (!isLoggedIn || !current) return redirectToLogin();

    const newWished = !isWished;
    setIsWished(newWished);

    if (onToggleWishlist) {
      onToggleWishlist();
    } else {
      toast.success(
        newWished ? "Đã thêm vào yêu thích!" : "Đã bỏ khỏi yêu thích!"
      );
    }
    dispatch(getCurrent());
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
          onClick={handleAddToCart}
          className="w-2/3 flex items-center justify-center bg-blue-100 text-blue-700 rounded-md py-1 hover:bg-blue-200 transition-all"
        >
          <BsFillCartPlusFill className="mr-1 text-blue-700" />
          Giỏ hàng
        </button>

        {/* Yêu thích */}
        <button
          onClick={handleToggleWishlist}
          className="w-1/3 flex items-center justify-center border border-red-500 rounded-md py-1 hover:bg-pink-600 transition-all"
        >
          {isWished ? (
            <BsFillSuitHeartFill className="text-red-500" />
          ) : (
            <BsSuitHeart className="text-pink-300" />
          )}
        </button>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(ProductCard));
