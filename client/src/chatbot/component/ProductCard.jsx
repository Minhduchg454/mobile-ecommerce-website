function ProductCard({ product }) {
  return (
    <div className="border rounded-lg shadow-sm hover:shadow-lg overflow-hidden bg-white">
      <a
        href={`http://localhost:3000/${product.link}`}
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-3 space-y-1">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-red-600 font-bold">{product.price}</p>
          <p className="text-xs text-gray-500">{product.category}</p>

          {/* Hiển thị mô tả nếu có */}
          {product.description && (
            <p className="text-xs text-gray-700 italic">
              {product.description}
            </p>
          )}

          {/* Hiển thị thông số kỹ thuật */}
          {Array.isArray(product.specifications) &&
            product.specifications.length > 0 && (
              <ul className="mt-2 text-xs text-gray-700 space-y-0.5">
                {product.specifications.map((spec, index) => (
                  <li key={index}>
                    <span className="font-medium">{spec.name}:</span>{" "}
                    {spec.value}
                  </li>
                ))}
              </ul>
            )}

          {/* Hiển thị sao đánh giá */}
          {product.rating && (
            <div className="flex items-center text-yellow-500 text-xs">
              {/* Hiện 5 sao dựa trên rating */}
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>
                  {i < Math.round(product.rating) ? "★" : "☆"}
                </span>
              ))}
              <span className="ml-1 text-gray-500">
                ({product.totalRating})
              </span>
            </div>
          )}
        </div>
      </a>
    </div>
  );
}

export default ProductCard;
