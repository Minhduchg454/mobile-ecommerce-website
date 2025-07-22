import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import clsx from "clsx";
import { FaChevronLeft, FaChevronRight, FaCheckCircle } from "react-icons/fa";
import { MdOutlineShoppingCart } from "react-icons/md";
import { AiOutlinePhone } from "react-icons/ai";
import path from "ultils/path";
import { FaTruck } from "react-icons/fa";

import {
  apiGetProduct,
  apiGetVariationsByProductId,
  apiGetValuesByVariationId,
  apiGetValuesByProductId,
  apiGetProductVariation,
  apiFilterPreviews,
  apiDeleteWishlistByCondition,
  apiCreateWishlist,
} from "apis";
import { updateCartItem, fetchWishlist } from "../../store/user/asyncActions";
import {
  Breadcrumb,
  SelectQuantity,
  ProductInfomation,
  FeatureProducts,
  ShowSwal,
} from "components";
import { formatMoney, fotmatPrice, renderStarFromNumber } from "ultils/helpers";
import useRole from "hooks/useRole";
import { BsFillSuitHeartFill, BsSuitHeart } from "react-icons/bs";

const ProductDetail1 = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current, isLoggedIn, wishList, address } = useSelector(
    (state) => state.user
  );
  const { isAdmin } = useRole();
  const [product, setProduct] = useState(null);
  const [variations, setVariations] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [specifications, setSpecifications] = useState([]);
  const [currentImage, setCurrentImage] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [brandId, setBrandId] = useState("");
  const [previews, setPreviews] = useState([]);
  const [isWished, setIsWished] = useState(false);
  const pvid = searchParams.get("code");
  const imageList = currentProduct?.images || [];

  const defaultAddress =
    (address && address.find((a) => a.isDefault)) ||
    (address && address.length > 0 && address[0]) ||
    null;

  const displayAddress = defaultAddress
    ? `${defaultAddress.street}, ${defaultAddress.country}`
    : "Chưa có địa chỉ";

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
        setBrandId(resProduct.productData.brandId._id);
      }
      if (resVariations.success) {
        setVariations(resVariations.variations);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy sản phẩm và biến thể:", err);
    }
  };

  const fetchPreviews = useCallback(async (variationId) => {
    try {
      const res = await apiFilterPreviews({ productVariationId: variationId });
      setPreviews(res.success ? res.previews : []);
    } catch (error) {
      console.error("❌ Lỗi khi lấy đánh giá:", error);
      setPreviews([]);
    }
  }, []);

  useEffect(() => {
    fetchAllSpecifications();
  }, [selectedVariantId, product?._id]);

  // Gọi lại cùng logic lấy specifications đã định nghĩa trong useEffect
  const fetchAllSpecifications = async () => {
    if (!selectedVariantId || !product?._id) return;
    try {
      const [resVariation, resProduct] = await Promise.all([
        apiGetValuesByVariationId(selectedVariantId),
        apiGetValuesByProductId(product._id),
      ]);
      let allSpecs = [];
      if (resProduct.success) allSpecs = [...resProduct.values];

      if (resVariation.success) {
        const map = {};
        allSpecs.forEach((s) => {
          const id = s.specificationTypeId?._id;
          if (id) map[id] = s;
        });
        resVariation.values.forEach((s) => {
          const id = s.specificationTypeId?._id;
          if (id) map[id] = s;
        });
        allSpecs = Object.values(map).sort((a, b) => {
          const nameA = a.specificationTypeId?.typeSpecifications || "";
          const nameB = b.specificationTypeId?.typeSpecifications || "";
          return nameA.localeCompare(nameB);
        });
      }
      setSpecifications(allSpecs);
    } catch (err) {
      console.error("❌ Lỗi lấy thông số tổng hợp:", err);
      setSpecifications([]);
    }
  };

  const handleAddToCart = () => {
    if (!currentProduct || !selectedVariantId) return;
    const payload = {
      product: selectedVariantId,
      quantity,
      priceAtTime: currentProduct.price,
    };
    dispatch(updateCartItem(payload))
      .unwrap()
      .then(() => toast.success("Đã thêm vào giỏ hàng!"))
      .catch((err) => {
        console.error("❌ Lỗi khi thêm vào giỏ:", err);
        toast.error("Không thể thêm vào giỏ hàng.");
      });
  };

  const handleBuyNow = () => {
    if (!currentProduct || !selectedVariantId) return;
    const payload = {
      selectedItems: [
        {
          productVariationId: selectedVariantId,
          quantity,
          priceAtTime: currentProduct.price,
        },
      ],
    };
    navigate("/checkout", { state: payload });
  };

  const redirectToLogin = () => {
    ShowSwal({
      icon: "info",
      title: "Bạn chưa đăng nhập",
      text: "Vui lòng đăng nhập để thực hiện thao tác này",
      showCancelButton: true,
      confirmButtonText: "Đăng nhập",
      cancelButtonText: "Để sau",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/${path.LOGIN}`);
      }
    });
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn || !current) return redirectToLogin();

    const newWished = !isWished;

    try {
      if (newWished) {
        // Thêm vào wishlist
        await apiCreateWishlist({
          userId: current._id,
          productVariationId: selectedVariantId,
        });
        toast.success("Đã thêm vào yêu thích!");
      } else {
        // Xoá khỏi wishlist bằng điều kiện
        await apiDeleteWishlistByCondition({
          userId: current._id,
          productVariationId: selectedVariantId,
        });
        toast.info("Đã bỏ khỏi yêu thích!");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật yêu thích");
      console.error(error);
      // Rollback lại trạng thái nếu lỗi
      setIsWished(!newWished);
    }

    // Gọi lại để cập nhật thông tin người dùng
    dispatch(fetchWishlist());
  };

  useEffect(() => {
    const checkIfWished = async () => {
      if (!isLoggedIn || !current || !selectedVariantId) return;

      try {
        const wishlist = wishList || [];

        const found = wishlist.find(
          (item) => item.productVariationId._id === selectedVariantId
        );
        setIsWished(!!found);
      } catch (error) {
        console.error("Lỗi kiểm tra wishlist:", error);
        setIsWished(false);
      }
    };

    checkIfWished();
  }, [selectedVariantId, current, isLoggedIn, wishList]);

  const handleSelectVariant = (variantId) => {
    setSelectedVariantId(variantId);
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("code", variantId);
    setSearchParams(currentParams);
  };

  useEffect(() => {
    if (pvid) {
      apiGetProductVariation(pvid).then((res) => {
        if (res.success) {
          const variant = res.variation;
          setCurrentProduct(variant);
          setSelectedVariantId(variant._id);
          setImageIndex(0);
          fetchProductAndVariations(variant.productId.id);
          fetchPreviews(variant._id);
        }
      });
    }
  }, [pvid]);

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

  const isInStock = currentProduct?.stockQuantity >= 1;
  const disableBuyAction = isAdmin || !isInStock;

  // Kiem tra hien thi
  return (
    <div className="xl:w-main w-full">
      <div className="h-[70px] flex justify-center items-center px-4">
        <div className="w-main pt-4">
          <Breadcrumb
            title={product?.slug || "san-pham"}
            category={product?.categoryId?.productCategoryName || "danh-muc"}
          />

          <h2 className="text-[24px] font-bold">
            {product?.productName || "Không có tiêu đề"}
          </h2>
        </div>
      </div>

      <div className="w-full m-auto px-4 flex flex-col gap-5 mt-4">
        <div className="flex flex-col-reverse md:flex-row gap-5 items-start">
          <div className="lg:basis-[60%] w-full flex flex-col gap-5 items-center rounded-xl">
            {/* Hình ảnh chính */}
            <div className="w-full border shadow-md rounded-xl p-2 bg-[#FFF]">
              <div className="relative p-2 h-[400px] flex justify-center items-center overflow-hidden">
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
                      className="border w-10 h-10 absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow-md flex items-center justify-center z-10"
                    >
                      <FaChevronLeft className="text-gray-700 text-lg" />
                    </button>

                    <button
                      onClick={handleNext}
                      className="border w-10 h-10 absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow-md flex items-center justify-center z-10"
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
                        ? "border-red-400 shadow"
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
              <div className="w-full text-sm border p-4 rounded-xl shadow-md bg-[#FFF]">
                <h4 className="font-bold mb-3">Thông số kỹ thuật:</h4>
                {specifications.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between py-1 border-b-2"
                  >
                    <span>{item.specificationTypeId?.typeSpecifications}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thông tin sản phẩm */}
          <div className="lg:basis-[40%] bg-[#FFF] w-full flex flex-col gap-4 border rounded-xl p-4 shadow-md">
            <div className="flex gap-2 items-center justify-start">
              <h2 className="text-[30px] font-semibold">
                {currentProduct?.price
                  ? `${formatMoney(fotmatPrice(currentProduct.price))} VNĐ`
                  : "Đang cập nhật"}
              </h2>
              {isLoggedIn && (
                <button
                  disabled={isAdmin}
                  onClick={handleToggleWishlist}
                  className={clsx(
                    "flex items-center justify-center rounded-full transition-all mt-1 p-[1px]",
                    isAdmin
                      ? "hidden"
                      : isWished
                      ? " border-red-100 hover:bg-red-200"
                      : " border-red-300 hover:bg-pink-600"
                  )}
                  style={{ width: "36px", height: "36px" }}
                >
                  {isWished ? (
                    <BsFillSuitHeartFill className="text-red-500 text-2xl" />
                  ) : (
                    <BsSuitHeart className="text-red-300 text-2xl" />
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {(renderStarFromNumber(currentProduct?.rating) || []).map(
                (star, idx) => (
                  <span key={idx}>{star}</span>
                )
              )}
              <span className="text-sm italic  text-blue-400">
                Đã bán {currentProduct?.sold || 0}
              </span>
              <span className="text-sm italic text-blue-400">
                Kho: {currentProduct?.stockQuantity || 0}
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

            {!isInStock && (
              <p className="text-sm text-red-600 font-medium">
                Sản phẩm đang chọn tạm hết hàng
              </p>
            )}
            <div className="flex gap-2">
              <button
                disabled={disableBuyAction}
                onClick={handleAddToCart}
                className={clsx(
                  "rounded-xl p-2 flex flex-col justify-center items-center basis-[40%] w-full border font-semibold transition duration-200 ease-in-out shadow-sm",
                  disableBuyAction
                    ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border-[#00AFFF] text-[#00AFFF] bg-white hover:bg-[#00AFFF] hover:text-white"
                )}
              >
                <MdOutlineShoppingCart size={24} />
                <p className="text-sm">Thêm vào giỏ hàng</p>
              </button>

              <button
                disabled={disableBuyAction}
                onClick={handleBuyNow}
                className={clsx(
                  "flex justify-center items-center rounded-xl w-full basis-[60%] font-semibold py-2 transition duration-200 ease-in-out shadow-md",
                  disableBuyAction
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#00AFFF] hover:bg-blue-700 text-white"
                )}
              >
                Mua ngay
              </button>
            </div>
            {isAdmin && (
              <p className="text-sm text-red-600 italic mt-1">
                Chức năng mua hàng chỉ khả dụng khi đăng nhập bằng tài khoản
                khách hàng.
              </p>
            )}

            {/* Cam kết mua hàng */}
            <div className="mt-4 border border-blue-500 bg-blue-100 rounded-xl p-2">
              <h4 className="text-md font-semibold mb-2 flex items-center gap-1 text-red-600">
                <FaCheckCircle className="text-red-600" size={23} />
                Cam kết khi mua hàng
              </h4>

              <ol className="flex flex-col gap-2 text-sm text-gray-700">
                {[
                  "Hàng chính hãng 100%",
                  "Giao hàng toàn quốc",
                  "Đổi trả trong 7 ngày nếu lỗi",
                  "Hỗ trợ kỹ thuật trọn đời",
                ].map((text, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="min-w-[15px] h-[15px] flex items-center justify-center bg-blue-500 text-white rounded-full text-xs font-bold shadow-sm">
                      {index + 1}
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Thong tin van chuyen */}
            <div className="border border-green-500 bg-green-50 rounded-xl p-2">
              <h4 className="text-md text-green-600 font font-semibold flex items-center gap-2">
                <FaTruck className="text-green-600" size={23} />
                Thông tin vận chuyển
              </h4>

              <div className="mb-1 text-sm">
                <span className="text-black">Giao đến:</span>
                {"  "}
                <span className="text-gray-900">{displayAddress}</span>{" "}
                <button
                  onClick={() => navigate(`/${path.MEMBER}/${path.ADDRESS}`)}
                  className="text-blue-500 underline ml-2 hover:text-blue-700 text-xs"
                >
                  Thay đổi
                </button>
              </div>

              <div className="text-black text-sm">
                <span>Giao từ </span>
                <strong>
                  18h - 20h, hôm nay ({new Date().toLocaleDateString("vi-VN")})
                </strong>
                : <span className="text-green-600 font-semibold">Miễn phí</span>
              </div>
            </div>

            {/* Giao hàng dự kiến */}
            <div className="">
              <div className="flex justify-start items-center gap-1">
                <AiOutlinePhone size={14} />
                <p className="text-sm">
                  Gọi đặt mua qua{" "}
                  <span className="text-[#00AFFF]">0909 567 999</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mô tả và đánh giá */}
        {product && (
          <div className="mt-4 bg-[#FFF] rounded-xl">
            <ProductInfomation
              totalRatings={currentProduct?.totalRating}
              ratings={previews} // ← là danh sách review từ API lọc
              nameProduct={product.productName}
              pid={currentProduct._id}
              rerender={() => {
                if (selectedVariantId) {
                  fetchAllSpecifications();
                  fetchPreviews(selectedVariantId); // ← Gọi lại khi đánh giá thay đổi
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Sản phẩm khác */}
      <div className="w-main mx-auto p-4 ">
        <FeatureProducts
          title="Những thiết bị liên quan"
          sort="newest"
          query={{ brandId: brandId }}
          limit={5}
        />
      </div>
    </div>
  );
};

export default ProductDetail1;
