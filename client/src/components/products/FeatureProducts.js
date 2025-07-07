import React, { useState, useEffect, memo } from "react";
import { ProductCard } from "components";
import { apiGetProducts } from "apis";

const FeatureProducts = ({ title = "SẢN PHẨM", query = {} }) => {
  const [products, setProducts] = useState(null);

  const fetchProducts = async () => {
    const response = await apiGetProducts({
      limit: 4,
      ...query, // dùng spread để truyền điều kiện động
    });

    if (response.success) setProducts(response.products);
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(query)]); // query thay đổi thì gọi lại

  return (
    <div className="w-full">
      <h3 className="text-[20px] font-semibold py-[15px]">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-4">
        {products?.map((el) => (
          <ProductCard key={el._id} pid={el._id} image={el.thumb} {...el} />
        ))}
      </div>
    </div>
  );
};

export default memo(FeatureProducts);
