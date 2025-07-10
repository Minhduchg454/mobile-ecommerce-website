import React, { useCallback, useEffect, useRef, useState } from "react";
import { createSearchParams, useParams } from "react-router-dom";
import {
  apiGetProduct,
  apiGetProducts,
  apiGetVariationsByProductId,
  apiGetValuesByVariationId,
} from "apis";
import {
  Breadcrumb,
  Button,
  SelectQuantity,
  ProductInfomation,
  CustomSlider,
} from "components";
import Slider from "react-slick";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { formatMoney, fotmatPrice, renderStarFromNumber } from "ultils/helpers";
import DOMPurify from "dompurify";
import clsx from "clsx";
import { useSelector } from "react-redux";
import withBaseComponent from "hocs/withBaseComponent";
import { getCurrent } from "store/user/asyncActions";
import { toast } from "react-toastify";
import path from "ultils/path";
import Swal from "sweetalert2";

const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  centerMode: true,
  centerPadding: "0px",
};

const ProductDetail1 = ({
  isQuickView,
  data,
  location,
  dispatch,
  navigate,
}) => {
  const titleRef = useRef();
  const params = useParams();
  const { current } = useSelector((state) => state.user);
  const [update, setUpdate] = useState(false);
  const [product, setProduct] = useState(null);
  const [variations, setVariations] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [productId, setProductId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [specifications, setSpecifications] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [currentProduct, setCurrentProduct] = useState({
    productVariationName: "",
    price: "",
    stockQuantity: 0,
    sold: 0,
    thumb: "",
    images: [],
    productId: "",
    rating: 0,
    totalRating: 0,
  });

  // Gán productId và categoryId khi data hoặc params thay đổi
  useEffect(() => {
    if (data) {
      setProductId(data.pid);
      setCategoryId(data.categoryId?._id);
    } else if (params?.pid) {
      setProductId(params.pid);
    }
  }, [data, params]);

  // Lấy danh sách sản phẩm liên quan
  const fetchRelatedProducts = useCallback(async (catId) => {
    try {
      const response = await apiGetProducts({ categoryId: catId });
      if (response.success) setRelatedProducts(response.products);
    } catch (error) {
      console.error("❌ Lỗi khi lấy sản phẩm liên quan:", error);
    }
  }, []);

  // Lấy biến thể sản phẩm
  const fetchProductVariations = useCallback(async (pid) => {
    try {
      const response = await apiGetVariationsByProductId(pid);
      if (response.success) setVariations(response.variations);
    } catch (error) {
      console.error("❌ Lỗi khi lấy biến thể:", error);
    }
  }, []);

  //Lấy thống số theo biến thể sản phẩm
  const fetchSpecificationsByVariant = useCallback(async (variantId) => {
    try {
      const response = await apiGetValuesByVariationId(variantId);
      if (response.success) {
        setSpecifications(response.values);
      } else {
        setSpecifications([]); // Không có thông số nào
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông số cấu hình:", error);
      setSpecifications([]);
    }
  }, []);

  // Lấy chi tiết sản phẩm
  const fetchProductData = useCallback(async () => {
    try {
      const response = await apiGetProduct(productId);
      if (response.success) {
        const productData = response.productData;
        setProduct(productData);
        setCategoryId(productData.categoryId?._id);

        // Gọi song song
        fetchProductVariations(productData._id);
        fetchRelatedProducts(productData.categoryId?._id);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu sản phẩm:", error);
    }
  }, [productId, fetchProductVariations, fetchRelatedProducts]);

  // Gọi khi productId sẵn sàng
  useEffect(() => {
    if (productId) {
      fetchProductData();
      titleRef.current?.scrollIntoView({ block: "center" });
    }
  }, [productId, update, fetchProductData]);

  //Chon bien the tu prouct, lay bien the co gia nho nhat
  useEffect(() => {
    if (variations.length > 0) {
      const lowestPriceVariant = variations.reduce((prev, current) =>
        current.price < prev.price ? current : prev
      );
      setSelectedVariantId(lowestPriceVariant._id);
      setCurrentProduct(lowestPriceVariant);
      setCurrentImage(lowestPriceVariant.images[0] || "");
    }
  }, [variations]);

  //Cap nhat bien the khi nguoi dung chon
  useEffect(() => {
    if (selectedVariantId) {
      const found = variations.find((v) => v._id === selectedVariantId);
      if (found) {
        setCurrentProduct(found);
        setCurrentImage(found.images[0] || "");
        fetchSpecificationsByVariant(selectedVariantId);
      }
    }
  }, [selectedVariantId, variations, fetchSpecificationsByVariant]);

  const handleSelectVariant = (variantId) => {
    setSelectedVariantId(variantId);
  };

  const rerender = useCallback(() => setUpdate(!update), [update]);

  //Cap nhat so luong
  const handleQuantity = useCallback((number) => {
    //Khong phai so hoac so nho hon 1 thi tra ve, nguoc lai cap nhat number
    if (!Number(number) || Number(number) < 1) return;
    setQuantity(number);
  }, []);

  //Tang giam so luong bang nut + -
  const handleChangeQuantity = useCallback(
    (flag) => {
      if (flag === "minus" && quantity === 1) return;
      setQuantity((prev) => (flag === "plus" ? +prev + 1 : +prev - 1));
    },
    [quantity]
  );

  const handleClickImage = (e, el) => {
    e.stopPropagation();
    setCurrentImage(el);
  };

  const handleAddToCart = async () => {};

  // Debug log
  // useEffect(() => {
  //   console.log("🔍 Sản phẩm:", product);
  //   console.log("🔍 Biến thể:", variations);
  //   console.log("🔍 Liên quan:", relatedProducts);
  //   console.log("🔍 Biến thể hiện được chọn:", currentProduct);
  // }, [product, variations, relatedProducts, currentProduct]);

  return (
    <div className={clsx("w-full")}>
      {!isQuickView && (
        <div className="h-[81px] flex justify-center items-center">
          <div ref={titleRef} className="w-main">
            <Breadcrumb
              title={product?.slug || "Sản phẩm"}
              category={product?.categoryId?.slug || "Danh mục"}
            />
            <h3 className="font-semibold">
              {product?.productName || "Không có tiêu đề"}
            </h3>
          </div>
        </div>
      )}
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "bg-white m-auto mt-4 flex",
          isQuickView
            ? "max-w-[900px] gap-16 p-8 max-h-[80vh] overflow-y-auto"
            : "w-main"
        )}
      >
        <div
          className={clsx("flex flex-col gap-4 w-2/5", isQuickView && "w-1/2")}
        >
          <div className="card-default w-full h-[458px] border flex items-center justify-center overflow-hidden bg-gray-50 p-2">
            {currentImage || currentProduct.images[0] ? (
              <Zoom>
                <img
                  src={currentImage || currentProduct.images[0]}
                  alt="Ảnh sản phẩm"
                  className="w-full h-full object-contain"
                />
              </Zoom>
            ) : (
              <span className="text-gray-400 text-sm italic">
                Không có hình ảnh
              </span>
            )}
          </div>
          <div className="w-full flex justify-center">
            <div className="w-[300px]">
              <Slider className="image-slider" {...settings}>
                {(currentProduct.images || []).map((el, i) => (
                  <div
                    key={i}
                    className="px-1 flex justify-center items-center"
                  >
                    <img
                      onClick={(e) => handleClickImage(e, el)}
                      src={el}
                      alt="sub-product"
                      className="w-[50px] h-[50px] object-cover border rounded-md cursor-pointer"
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
          {!isQuickView && specifications.length > 0 && (
            <div className="text-sm text-gray-700 w-full border rounded-xl border-gray-300 p-3 mt-3">
              <h4 className="mb-3 font-bold text-lg">Cấu hình sản phẩm:</h4>
              <div className="w-full divide-y divide-gray-300">
                {specifications.map((item) => (
                  <div key={item._id} className="flex justify-between py-2">
                    <span className="text-gray-600 font-medium w-1/3">
                      {item.specificationTypeId?.typeSpecifications}
                    </span>
                    <span className="text-gray-900 w-2/3 text-right">
                      {item.value}
                      {item.specificationTypeId?.unitOfMeasure &&
                        ` ${item.specificationTypeId.unitOfMeasure}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div
          className={clsx(
            "w-2/5 pr-[24px] flex flex-col gap-4 pl-[150px]",
            isQuickView && "w-1/2"
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[30px] font-semibold">
              {currentProduct.price
                ? `${formatMoney(fotmatPrice(currentProduct.price))} VNĐ`
                : "Đang cập nhật giá"}
            </h2>
            <span className="text-sm text-main">{`Kho: ${
              currentProduct?.stockQuantity ?? "?"
            }`}</span>
          </div>

          <div className="flex items-center gap-1">
            {(renderStarFromNumber(currentProduct?.rating) || []).map(
              (el, idx) => (
                <span key={idx}>{el}</span>
              )
            )}
            <span className="text-sm text-main italic">
              {`(Đã bán: ${currentProduct?.sold ?? 0} sản phẩm)`}
            </span>
          </div>

          <ul className="list-square text-sm text-gray-500 pl-0">
            {Array.isArray(product?.description) &&
              product.description.length > 1 &&
              product.description.map((el, i) => (
                <li className="leading-6" key={i}>
                  {el}
                </li>
              ))}
          </ul>
          {typeof product?.description === "string" && (
            <div
              className="text-sm text-gray-500 mb-1 pl-0"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(product.description),
              }}
            ></div>
          )}
          <div className="my-1 flex flex-col items-start gap-4">
            <span className="font-bold whitespace-nowrap">Loại:</span>
            <div className="flex flex-row flex-wrap gap-4 w-full">
              {variations.map((variant) => (
                <div
                  key={variant._id}
                  onClick={() => handleSelectVariant(variant._id)}
                  className={clsx(
                    "flex items-center gap-3 p-3 border rounded-md cursor-pointer min-w-[100px] transition-all duration-200",
                    selectedVariantId === variant._id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-400"
                  )}
                >
                  <div className="flex flex-col text-sm leading-5">
                    <span className="font-medium text-gray-800">
                      {variant.productVariationName || "Không màu"}
                    </span>
                    <span className="text-gray-600">
                      {variant.price
                        ? formatMoney(fotmatPrice(variant.price))
                        : "Đang cập nhật"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Số lượng: </span>
              <SelectQuantity
                quantity={quantity}
                handleQuantity={handleQuantity}
                handleChangeQuantity={handleChangeQuantity}
              />
            </div>
            <Button handleOnClick={handleAddToCart} fw>
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </div>

      {!isQuickView && (
        <div className="w-main m-auto mt-8">
          <ProductInfomation
            totalRatings={product?.totalRating}
            ratings={product?.rating}
            nameProduct={product?.productName || "Sản phẩm"}
            pid={product?._id}
            rerender={rerender}
          />
        </div>
      )}

      {!isQuickView && (
        <>
          <div className="w-main m-auto mt-4">
            <h3 className="text-[20px] font-semibold py-[15px] border-b-2 border-main">
              SẢN PHẨM KHÁC
            </h3>
            <CustomSlider normal={true} products={relatedProducts || []} />
          </div>
          <div className="h-[60px] w-full"></div>
        </>
      )}
    </div>
  );
};

export default ProductDetail1;
