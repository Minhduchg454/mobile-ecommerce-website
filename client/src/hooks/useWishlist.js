import { useState } from "react";

export default function useWishlist() {
  const [wishlist, setWishlist] = useState([]);

  const addToWishlist = (product) => {
    if (!wishlist.find((item) => item.id === product.id)) {
      setWishlist([...wishlist, product]);
    }
  };

  const removeFromWishlist = (id) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  return { wishlist, addToWishlist, removeFromWishlist };
} 