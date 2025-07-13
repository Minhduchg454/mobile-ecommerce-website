import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import clsx from "clsx";
import { formatMoney, fotmatPrice, renderStarFromNumber } from "ultils/helpers";
import { useSelector } from "react-redux";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ProductDetail1 = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { current } = useSelector((state) => state.user);

  const [product, setProduct] = useState(null);
  const [variations, setVariations] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [specifications, setSpecifications] = useState([]);
  const [currentImage, setCurrentImage] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const pvid = searchParams.get("code");

  const imageList = currentProduct?.images || [];

  useEffect(() => {
    if (imageList.length > 0) {
      setCurrentImage(imageList[imageIndex] || "");
    }
  }, [imageIndex, imageList]);

  useEffect(() => {
    if (pvid) {
      apiGetProductVariation(pvid).then((res) => {
        if (res.success) {
          const variant = res.variation;
          setCurrentProduct(variant);
          setSelectedVariantId(variant._id);
          setImageIndex(0);
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
        setImageIndex(0);
        fetchSpecifications(selectedVariantId);
      }
    }
  }, [selectedVariantId, variations, fetchSpecifications]);

  const handleSelectVariant = (variantId) => {
    setSelectedVariantId(variantId);
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("code", variantId);
    setSearchParams(currentParams);
  };

  const handleChangeQuantity = (type) => {
    if (type === "plus") setQuantity((prev) => prev + 1);
    else if (type === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleClickImage = (e, img) => {
    e.stopPropagation();
    const index = imageList.indexOf(img);
    if (index !== -1) {
      setImageIndex(index);
    }
  };

  const handlePrev = () => {
    setImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="xl:w-main w-full">
      <div className="h-[70px] flex justify-center items-center px-4">
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

      <div className="w-full m-auto px-4 flex flex-col gap-5 mt-4">
        <div className="flex flex-col-reverse md:flex-row gap-5 items-start">
          <div className="lg:basis-[70%] w-full flex flex-col gap-5 items-center">
            {/* Hình ảnh chính */}
            <div className="w-full border shadow-md rounded-xl p-2">
              <div className="relative p-2 h-[400px] flex justify-center items-center bg-white overflow-hidden">
                {imageList.length > 0 ? (
                  <>
                    <Zoom>
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentImage}
                          src={currentImage}
                          alt="product"
                          className="object-contain max-h-[380px] max-w-full"
                          initial={{ opacity: 0, x: 100 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.2 }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/fallback.jpg";
                          }}
                        />
                      </AnimatePresence>
                    </Zoom>

                    {/* Mũi tên */}
                    <button
                      onClick={handlePrev}
                      className="w-10 h-10 absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow flex items-center justify-center z-10"
                    >
                      <FaChevronLeft className="text-gray-700 text-lg" />
                    </button>

                    <button
                      onClick={handleNext}
                      className="w-10 h-10 absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow flex items-center justify-center z-10"
                    >
                      <FaChevronRight className="text-gray-700 text-lg" />
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 text-sm">Không có ảnh</span>
                )}
              </div>

              {/* Ảnh nhỏ bên dưới */}
              <div className="w-full flex justify-center items-center gap-2 mt-3 flex-wrap">
                {imageList.map((img, idx) => (
                  <img
                    key={idx}
                    onClick={(e) => handleClickImage(e, img)}
                    src={img}
                    alt={`thumb-${idx}`}
                    className={clsx(
                      "w-[50px] h-[50px] object-cover border p-1 rounded-md cursor-pointer",
                      currentImage === img
                        ? "border-red-500 shadow"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/fallback.jpg";
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Cấu hình sản phẩm */}
            {specifications.length > 0 && (
              <div className="w-full text-sm border p-2 rounded-xl shadow-sm">
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

          {/* Thông tin sản phẩm */}
          <div className="lg:basis-[30%] w-full flex flex-col gap-4 border rounded-xl p-4 shadow-md">
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

            <div>
              <h4 className="font-semibold mb-1">Chọn loại:</h4>
              <div className="flex gap-4 flex-wrap">
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

            <div className="flex items-center gap-4">
              <span>Số lượng:</span>
              <SelectQuantity
                quantity={quantity}
                handleChangeQuantity={handleChangeQuantity}
              />
            </div>

            <Button className="w-full">Thêm vào giỏ hàng</Button>
          </div>
        </div>

        {/* Mô tả và đánh giá */}
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
      <div className="w-main mx-auto mt-10 px-4">
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

/* 

  const handleClickImage = (e, img) => {
    e.stopPropagation();
    setCurrentImage(img);
  };

            <div className="w-full border shadow-md rounded-xl p-2">
              <div className="relative  p-2 h-[400px] flex justify-center items-center bg-white overflow-hidden">
                {currentImage ? (
                  <Zoom>
                    <img
                      src={currentImage}
                      alt="product"
                      className="object-contain w-auto max-h-[380px]"
                      style={{ objectFit: "contain" }}
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

             
              <div className="w-full flex justify-center items-center overflow-x-auto">
                <Slider {...settings} className="w-[300px]">
                  {currentProduct?.images?.map((img, idx) => (
                    <div key={idx} className="px-1">
                      <img
                        onClick={(e) => handleClickImage(e, img)}
                        src={img}
                        alt="thumb"
                        className="w-[50px] h-[50px] object-cover border p-1 rounded-md cursor-pointer"
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            </div>


*/
