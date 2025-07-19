import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCurrent } from "store/user/asyncActions";
import { apiUpdateWishlist } from "apis/user";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const FavoriteProductDemo = () => {
  const { current, isLoggedIn } = useSelector((state) => state.user);
  const [loadingId, setLoadingId] = useState("");
  const dispatch = useDispatch();

  // Xóa biến thể khỏi wishlist
  const handleRemoveWishlist = async (e, variantId) => {
    e.stopPropagation();
    if (!isLoggedIn || !current) {
      Swal.fire({
        icon: "info",
        title: "Bạn chưa đăng nhập",
        text: "Vui lòng đăng nhập để thao tác",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Để sau",
      });
      return;
    }
    setLoadingId(variantId);
    try {
      const res = await apiUpdateWishlist(variantId); // API này sẽ xóa nếu đã có trong wishlist
      if (res.success) {
        dispatch(getCurrent());
        toast.success(res.mes || "Đã xóa khỏi yêu thích!");
      } else {
        toast.error(res.mes || "Có lỗi khi xóa!");
      }
    } catch (err) {
      toast.error("Có lỗi khi xóa!");
    } finally {
      setLoadingId("");
    }
  };

  return (
    <div className="w-full py-8 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      <div className="w-main mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm yêu thích</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Danh sách các sản phẩm bạn đã thêm vào yêu thích. Nhấn vào <span className="inline-block align-middle"><AiOutlineDelete className="inline text-red-400" /></span> để xóa khỏi danh sách.
          </p>
        </div>
        {current?.wishlist?.length === 0 ? (
          <div className="flex justify-center py-16 text-gray-400 italic text-lg">Bạn chưa có sản phẩm nào yêu thích.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
            {current.wishlist.map((variant) => (
              <div
                key={variant._id}
                className="relative bg-white rounded-xl shadow-lg overflow-hidden group transition-transform hover:scale-105 duration-300"
              >
                {/* Nút xóa */}
                <button
                  className={`absolute top-3 right-3 z-10 rounded-full p-2 bg-white/80 shadow-md border border-red-200 transition hover:bg-red-100 ${loadingId === variant._id ? "opacity-60 pointer-events-none" : ""}`}
                  onClick={(e) => handleRemoveWishlist(e, variant._id)}
                  disabled={loadingId === variant._id}
                  aria-label="Xóa khỏi yêu thích"
                >
                  <AiOutlineDelete className="text-red-500 text-2xl transition" />
                </button>
                {/* Ảnh sản phẩm */}
                <div className="w-full h-56 flex items-center justify-center bg-gradient-to-t from-blue-100 to-white">
                  <img
                    src={variant.thumb || variant.images?.[0] || "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"}
                    alt={variant.productName}
                    className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105 duration-300"
                  />
                </div>
                {/* Nội dung */}
                <div className="p-4 flex flex-col gap-2">
                  <span className="font-semibold text-gray-800 line-clamp-2 min-h-[40px]">{variant.productName}</span>
                  <span className="text-main font-bold text-lg">{variant.price?.toLocaleString()} VNĐ</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteProductDemo; 