// components/ProductCard.jsx
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
        </div>
      </a>
    </div>
  );
}

export default ProductCard;
