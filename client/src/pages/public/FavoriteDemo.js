import React from "react";
import useWishlist from "../../hooks/useWishlist";
import ProductCard from "../../components/products/ProductCard";
import Wishlist from "../../components/products/Wishlist";

// Demo dữ liệu sản phẩm
const products = [
  {
    id: 1,
    name: "iPhone 15",
    image: "/database_imgs/iphone-15-hong.jpg",
    variations: [
      { id: "v1", price: 20000000, color: "Đen" },
      { id: "v2", price: 19500000, color: "Hồng" },
    ],
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    image: "/database_imgs/samsung-galaxy-s24-plus.jpg",
    variations: [
      { id: "v1", price: 18000000, color: "Tím" },
      { id: "v2", price: 17500000, color: "Đen" },
    ],
  },
  {
    id: 3,
    name: "Xiaomi 14T Pro",
    image: "/database_imgs/xiaomi-14t-pro.jpg",
    variations: [
      { id: "v1", price: 15000000, color: "Xám" },
      { id: "v2", price: 14500000, color: "Xanh" },
    ],
  },
];

export default function FavoriteDemo() {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Danh sách sản phẩm</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToWishlist={addToWishlist} />
        ))}
      </div>
      <h2 className="text-xl font-bold mb-4">Yêu thích của bạn</h2>
      <Wishlist wishlist={wishlist} onRemove={removeFromWishlist} />
    </div>
  );
} 