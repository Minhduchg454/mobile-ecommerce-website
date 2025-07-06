import React, { useCallback, useEffect, useRef, useState } from "react";
import { createSearchParams, useParams } from "react-router-dom";
import {
  apiGetProduct,
  apiGetProducts,
  apiUpdateCart,
  apiGetVariationsByProductId,
} from "apis";
import {
  Breadcrumb,
  Button,
  SelectQuantity,
  ProductInfomation,
  CustomSlider,
} from "components";
import Slider from "react-slick";
import { GlassMagnifier } from "react-image-magnifiers";
import { formatMoney, fotmatPrice, renderStarFromNumber } from "ultils/helpers";
import DOMPurify from "dompurify";
import clsx from "clsx";
import { useSelector } from "react-redux";
import withBaseComponent from "hocs/withBaseComponent";
import { getCurrent } from "store/user/asyncActions";
import { toast } from "react-toastify";
import path from "ultils/path";
import Swal from "sweetalert2";
import { Description } from "@mui/icons-material";

//Cau hinh hieu ung chuyen dong
const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
};

const ProductDetail1 = ({
  isQuickView,
  data,
  location,
  dispatch,
  navigate,
}) => {
  const titleRef = useRef(); // Cuộn trang tới phần tử
  const params = useParams(); // Lấy param từ URL
  const { current } = useSelector((state) => state.user); // Lấy thông tin người dùng hiện tại

  const [product, setProduct] = useState(null);
  const [variations, setVariations] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productId, setProductId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  // Lấy productId và category từ props hoặc params
  useEffect(() => {
    if (data) {
      setProductId(data.pid);
      setCategoryId(data.categoryId._id);
    } else if (params?.pid) {
      setProductId(params.pid);
      setCategoryId(null);
    }
  }, [data, params]);

  // Lấy danh sách sản phẩm cùng danh mục
  const fetchRelatedProducts = async (categoryId) => {
    try {
      const response = await apiGetProducts({ categoryId });
      if (response.success) setRelatedProducts(response.products);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm liên quan:", error);
    }
  };

  // Lấy biến thể của sản phẩm
  const fetchProductVariations = async (pid) => {
    try {
      const response = await apiGetVariationsByProductId(pid);
      if (response.success) setVariations(response.variations);
    } catch (error) {
      console.error("Lỗi khi lấy biến thể:", error);
    }
  };

  // Lấy chi tiết sản phẩm
  const fetchProductData = async () => {
    try {
      const response = await apiGetProduct(productId);
      if (response.success) {
        const productData = response.productData;
        setProduct(productData);
        setCategoryId(productData.categoryId?._id);
        setCurrentImage(productData.thumb || "");

        // Gọi API khác song song
        fetchProductVariations(productData._id);
        fetchRelatedProducts(productData.categoryId);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
    }
  };

  // Trigger khi productId sẵn sàng
  useEffect(() => {
    if (productId) {
      fetchProductData();
      titleRef.current?.scrollIntoView({ block: "center" });
    }
  }, [productId]);

  // Kiểm tra dữ liệu
  useEffect(() => {
    console.log("🔎 Related Products:", relatedProducts);
    console.log("🔎 Variations:", variations);
  }, [relatedProducts, variations]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <div ref={titleRef} className="text-center">
        <h1 className="text-2xl font-bold mb-4">Product Detail Page</h1>
        <p className="text-lg">
          Product ID:{" "}
          <span className="text-red-500 font-semibold">{productId}</span>
        </p>
        <p className="text-lg mt-2">
          Category ID:{" "}
          <span className="text-blue-500 font-semibold">{categoryId}</span>
        </p>
      </div>
    </div>
  );
};

export default ProductDetail1;
