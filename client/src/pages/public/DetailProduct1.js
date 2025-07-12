import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  apiGetProduct,
  apiGetProducts,
  apiGetVariationsByProductId,
  apiGetValuesByVariationId,
  apiGetProductVariation,
} from "apis";
import {
  Breadcrumb,
  Button,
  SelectQuantity,
  ProductInfomation,
  CustomSlider1,
  ProductCard,
} from "components";
import Slider from "react-slick";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import clsx from "clsx";
import { formatMoney, fotmatPrice, renderStarFromNumber } from "ultils/helpers";
import { useSelector } from "react-redux";

const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  centerMode: true,
  centerPadding: "0px",
};

const ProductDetail1 = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { current } = useSelector((state) => state.user);

  const [product, setProduct] = useState(null);
  const [variations, setVariations] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [specifications, setSpecifications] = useState([]);
  const [currentImage, setCurrentImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const pvid = searchParams.get("code");

  useEffect(() => {
    if (pvid) {
      apiGetProductVariation(pvid).then((res) => {
        if (res.success) {
          const variant = res.variation;
          setCurrentProduct(variant);
          setSelectedVariantId(variant._id);
          setCurrentImage(variant.images?.[0] || "");
          fetchProductAndVariations(variant.productId.id);
        }
      });
    }
  }, [pvid]);

  const fetchProductAndVariations = async (productId) => {
    try {
      const [resProduct, resVariations] = await Promise.all([
        apiGetProduct(productId),
        apiGetVariationsByProductId(productId),
      ]);

      if (resProduct.success) {
        setProduct(resProduct.productData);
        fetchRelatedProducts(resProduct.productData.categoryId?._id);
      }

      if (resVariations.success) {
        setVariations(resVariations.variations);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy sản phẩm và biến thể:", err);
    }
  };

  const fetchRelatedProducts = async (catId) => {
    try {
      const res = await apiGetProducts({ categoryId: catId });
      if (res.success) setRelatedProducts(res.products);
    } catch (error) {
      console.error("❌ Lỗi lấy sản phẩm liên quan:", error);
    }
  };

  const fetchSpecifications = useCallback(async (variantId) => {
    try {
      const res = await apiGetValuesByVariationId(variantId);
      setSpecifications(res.success ? res.values : []);
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông số:", error);
      setSpecifications([]);
    }
  }, []);

  useEffect(() => {
    if (selectedVariantId) {
      const variant = variations.find((v) => v._id === selectedVariantId);
      if (variant) {
        setCurrentProduct(variant);
        setCurrentImage(variant.images?.[0] || "");
        fetchSpecifications(selectedVariantId);
      }
    }
  }, [selectedVariantId, variations, fetchSpecifications]);

  const handleSelectVariant = (variantId) => {
    setSelectedVariantId(variantId);
    // Cập nhật lại URL
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("code", variantId);
    setSearchParams(currentParams); // cập nhật code mới vào URL
  };

  const handleChangeQuantity = (type) => {
    if (type === "plus") setQuantity((prev) => prev + 1);
    else if (type === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleClickImage = (e, img) => {
    e.stopPropagation();
    setCurrentImage(img);
  };

  return (
    <div className="w-full">
      {/* Breadcrumb + title */}
      <div className="h-[81px] flex justify-center items-center border-b border-gray-200">
        <div className="w-main">
          <Breadcrumb
            title={product?.slug || "san-pham"}
            category={product?.categoryId?.slug || "danh-muc"}
          />
          <h2 className="text-[24px] font-bold mt-2">
            {product?.productName || "Không có tiêu đề"}
          </h2>
        </div>
      </div>

      {/* Nội dung chi tiết */}
      <div className="bg-white w-main m-auto px-4 flex flex-col gap-8 mt-4">
        {/* Khung chia 2 bên */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Trái: Hình ảnh + cấu hình */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {/* Ảnh chính */}
            <div className="w-full aspect-[4/3] md:h-[400px] flex justify-center items-center border bg-gray-50 overflow-hidden">
              {currentImage ? (
                <Zoom>
                  <img
                    src={currentImage}
                    alt="product"
                    className="object-contain max-h-full max-w-full w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/fallback.jpg";
                    }}
                  />
                </Zoom>
              ) : (
                <span className="text-gray-400 text-sm">Không có ảnh</span>
              )}
            </div>

            {/* Slider ảnh nhỏ */}
            <div className="w-full flex justify-center overflow-x-auto">
              <Slider {...settings} className="w-[300px]">
                {currentProduct?.images?.map((img, idx) => (
                  <div key={idx} className="px-1">
                    <img
                      onClick={(e) => handleClickImage(e, img)}
                      src={img}
                      alt="thumb"
                      className="w-[50px] h-[50px] object-cover border rounded-md cursor-pointer"
                    />
                  </div>
                ))}
              </Slider>
            </div>

            {/* Cấu hình sản phẩm */}
            {specifications.length > 0 && (
              <div className="text-sm border p-3 rounded-md">
                <h4 className="font-bold mb-3">Cấu hình sản phẩm:</h4>
                {specifications.map((item) => (
                  <div key={item._id} className="flex justify-between py-1">
                    <span>{item.specificationTypeId?.typeSpecifications}</span>
                    <span>
                      {item.value}
                      {item.specificationTypeId?.unitOfMeasure &&
                        ` ${item.specificationTypeId.unitOfMeasure}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phải: Thông tin sản phẩm */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <h2 className="text-[30px] font-semibold">
              {currentProduct?.price
                ? `${formatMoney(fotmatPrice(currentProduct.price))} VNĐ`
                : "Đang cập nhật"}
            </h2>

            <div className="flex items-center gap-2">
              {(renderStarFromNumber(currentProduct?.rating) || []).map(
                (star, idx) => (
                  <span key={idx}>{star}</span>
                )
              )}
              <span className="text-sm italic text-main">
                Đã bán {currentProduct?.sold || 0}
              </span>
            </div>

            {/* Chọn loại biến thể */}
            <div>
              <h4 className="font-semibold mb-1">Chọn loại:</h4>
              <div className="flex gap-3 flex-wrap">
                {variations.map((v) => (
                  <div
                    key={v._id}
                    onClick={() => handleSelectVariant(v._id)}
                    className={clsx(
                      "p-2 border rounded-md cursor-pointer min-w-[100px]",
                      selectedVariantId === v._id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-400"
                    )}
                  >
                    <div className="text-sm font-medium">
                      {v.productVariationName || "Biến thể"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatMoney(v.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chọn số lượng */}
            <div className="flex items-center gap-4">
              <span>Số lượng:</span>
              <SelectQuantity
                quantity={quantity}
                handleChangeQuantity={handleChangeQuantity}
              />
            </div>

            <Button fw>Thêm vào giỏ hàng</Button>
          </div>
        </div>

        {/* Đánh giá + mô tả */}
        {product && (
          <div className="mt-6">
            <ProductInfomation
              totalRatings={product.totalRating}
              ratings={product.rating}
              nameProduct={product.productName}
              pid={product._id}
              rerender={() => {
                if (selectedVariantId) fetchSpecifications(selectedVariantId);
              }}
            />
          </div>
        )}
      </div>

      {/* Sản phẩm khác */}
      <div className="w-main mx-auto mt-10">
        <h3 className="font-semibold text-xl border-b border-main pb-2 mb-4">
          Sản phẩm khác
        </h3>
        <CustomSlider1
          items={relatedProducts}
          itemWidth={250}
          renderItem={(el) => (
            <ProductCard
              pid={el._id}
              thumb={el.thumb}
              slugCategory={el.categoryId?.slug}
              slug={el.slug}
              {...el}
            />
          )}
        />
      </div>
    </div>
  );
};

export default ProductDetail1;
