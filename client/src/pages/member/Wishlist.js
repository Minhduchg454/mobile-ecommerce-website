import React, { memo } from "react";
import { useSelector } from "react-redux";
import { AiFillCloseCircle } from "react-icons/ai";
import clsx from "clsx";
import withBaseComponent from "hocs/withBaseComponent";
import { showWishlist } from "store/app/appSlice";
import { Product } from "components";

const Wishlist = ({ dispatch }) => {
  const { current } = useSelector((s) => s.user);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={clsx(
        "w-full md:w-[40vw] md:max-w-[800px] h-screen bg-gray-50 text-gray-800 flex flex-col relative"
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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {current?.wishlist?.length > 0 ? (
          current.wishlist.map((el) => (
            <div key={el._id} className="bg-white rounded-md shadow p-3">
              <Product pid={el._id} className="bg-white" productData={el} />
            </div>
          ))
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
