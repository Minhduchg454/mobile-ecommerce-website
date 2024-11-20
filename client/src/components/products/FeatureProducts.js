import React, { useState, useEffect, memo } from "react"
import { ProductCard } from "components"
import { apiGetProducts } from "apis"

const FeatureProducts = () => {
  const [products, setProducts] = useState(null)

  const fetchProducts = async () => {
    const response = await apiGetProducts({ limit: 9, sort: "-totalRatings" })
    if (response.success) setProducts(response.products)
  }
  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="w-full">
      <h3 className="text-[20px] font-semibold py-[15px] border-b-2 border-main">
        SẢN PHẨM NỔI BẬT
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        {products?.map((el) => (
          <ProductCard key={el._id} pid={el._id} image={el.thumb} {...el} />
        ))}
      </div>
    </div>
  )
}

export default memo(FeatureProducts)
