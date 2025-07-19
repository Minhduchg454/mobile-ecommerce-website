import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { apiUpdateWishlist, apiRemoveFromWishlist } from "apis/user";
import { getCurrent } from "store/user/asyncActions";
import { HeartIcon, WishlistItem } from "components";
import { formatMoney } from "ultils/helpers";

const WishlistDemo = () => {
  const dispatch = useDispatch();
  const { current, isLoggedIn } = useSelector((state) => state.user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock products for demo
  const mockProducts = [
    {
      _id: "product1",
      productName: "iPhone 15 Pro Max",
      thumb: "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png",
      minPrice: 25000000,
      categoryId: { slug: "smartphone" },
      slug: "iphone-15-pro-max"
    },
    {
      _id: "product2", 
      productName: "Samsung Galaxy S24 Ultra",
      thumb: "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png",
      minPrice: 22000000,
      categoryId: { slug: "smartphone" },
      slug: "samsung-galaxy-s24-ultra"
    },
    {
      _id: "product3",
      productName: "MacBook Pro M3",
      thumb: "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png", 
      minPrice: 45000000,
      categoryId: { slug: "laptop" },
      slug: "macbook-pro-m3"
    }
  ];

  useEffect(() => {
    setProducts(mockProducts);
  }, []);

  const handleToggleWishlist = async (productId) => {
    if (!isLoggedIn || !current) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này!");
      return;
    }

    setLoading(true);
    try {
      const response = await apiUpdateWishlist(productId);
      if (response.success) {
        toast.success(response.mes);
        dispatch(getCurrent());
      } else {
        toast.error(response.mes || "Có lỗi khi thực hiện thao tác!");
      }
    } catch (error) {
      toast.error("Có lỗi khi thực hiện thao tác!");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    setLoading(true);
    try {
      const response = await apiRemoveFromWishlist(productId);
      if (response.success) {
        toast.success("Đã xóa khỏi danh sách yêu thích!");
        dispatch(getCurrent());
      } else {
        toast.error(response.mes || "Có lỗi khi xóa sản phẩm!");
      }
    } catch (error) {
      toast.error("Có lỗi khi xóa sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    toast.info(`Chuyển đến trang chi tiết: ${product.productName}`);
  };

  const isProductWished = (productId) => {
    return current?.wishlist?.some((item) => item._id === productId);
  };

  return (
    <div className="w-full p-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🧪 Demo Tính năng Wishlist
        </h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Hướng dẫn test:
          </h2>
          <ul className="text-blue-700 space-y-1">
            <li>• Click vào icon trái tim để thêm/xóa sản phẩm khỏi wishlist</li>
            <li>• Icon sẽ thay đổi màu khi sản phẩm được thêm vào wishlist</li>
            <li>• Danh sách wishlist hiển thị bên dưới</li>
            <li>• Click vào sản phẩm trong wishlist để xem chi tiết</li>
            <li>• Sử dụng nút xóa để loại bỏ sản phẩm khỏi wishlist</li>
          </ul>
        </div>
      </div>

      {/* Danh sách sản phẩm demo */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📱 Sản phẩm demo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md border p-4 hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={product.thumb}
                  alt={product.productName}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <button
                  onClick={() => handleToggleWishlist(product._id)}
                  disabled={loading}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <HeartIcon
                    isWished={isProductWished(product._id)}
                    size={20}
                    disabled={loading}
                  />
                </button>
              </div>
              
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {product.productName}
              </h3>
              <p className="text-red-600 font-bold text-lg mb-2">
                {formatMoney(product.minPrice)} VNĐ
              </p>
              <p className="text-gray-500 text-sm">
                Danh mục: {product.categoryId.slug}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Danh sách wishlist */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          💖 Danh sách yêu thích ({current?.wishlist?.length || 0} sản phẩm)
        </h2>
        
        {!isLoggedIn ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">
              Vui lòng đăng nhập để xem danh sách yêu thích của bạn!
            </p>
          </div>
        ) : current?.wishlist?.length > 0 ? (
          <div className="space-y-4">
            {current.wishlist.map((product) => (
              <WishlistItem
                key={product._id}
                product={product}
                onRemove={handleRemoveFromWishlist}
                onClick={handleProductClick}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">💔</div>
            <p className="text-gray-600 text-lg mb-2">
              Bạn chưa có sản phẩm nào yêu thích
            </p>
            <p className="text-gray-500">
              Hãy thêm sản phẩm vào danh sách yêu thích bằng cách click vào icon trái tim!
            </p>
          </div>
        )}
      </div>

      {/* Thông tin debug */}
      {isLoggedIn && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            🔍 Debug Info
          </h3>
          <div className="text-sm text-gray-600">
            <p>User ID: {current?._id}</p>
            <p>Wishlist count: {current?.wishlist?.length || 0}</p>
            <p>Wishlist items: {JSON.stringify(current?.wishlist?.map(item => item._id))}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistDemo; 