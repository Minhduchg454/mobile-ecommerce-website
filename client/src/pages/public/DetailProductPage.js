import { useEffect, useRef, useState } from "react";
import {
  useSearchParams,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  apiGetProductVariation,
  apiGetProductVariations,
  apiGetProduct,
} from "../../services/catalog.api";
import { apiGetShops } from "../../services/shop.api";
import {
  Breadcrumb,
  ShowSwal,
  ImageBrowser,
  SelectQuantity,
  ProductInfomation,
} from "../../components";
import { RecommentList } from "../../features";
import { MdOutlineShoppingCart } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { formatMoney } from "../../ultils/helpers";
import path from "../../ultils/path";
import "react-image-gallery/styles/css/image-gallery.css";
import clsx from "clsx";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsSuitHeart } from "react-icons/bs";
import { MdAccessTimeFilled, MdShoppingCart } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";

const renderProductDescription = (blocks = []) => {
  if (!blocks.length) {
    return (
      <p className="text-gray-500 italic text-sm px-1 md:px-4">
        Chưa có mô tả cho sản phẩm này.
      </p>
    );
  }

  // Sắp xếp theo order nếu có
  const sortedBlocks = [...blocks].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return sortedBlocks.map((block, idx) => {
    switch (block.type) {
      case "text":
        return (
          <p
            key={idx}
            className="text-gray-800 text-description leading-relaxed mb-1 whitespace-pre-wrap px-1 md:px-4"
          >
            {block.content}
          </p>
        );

      case "image":
        return (
          <div
            key={idx}
            className="my-3 flex flex-col items-center px-1 md:px-4"
          >
            <img
              src={block.url}
              alt={block.alt || "image"}
              className="max-w-full h-[200px] md:h-[550px] rounded-2xl object-contain shadow-sm"
            />
            {block.content && (
              <p className="text-sm text-gray-600 italic mt-1">
                {block.content}
              </p>
            )}
          </div>
        );

      case "video":
        return (
          <div
            key={idx}
            className="my-3 flex flex-col items-center px-1 md:px-4"
          >
            <video
              src={block.url}
              controls
              className="max-w-full h-[200px] md:h-[500px] rounded-xl shadow-md"
            />
            {block.content && (
              <p className="text-sm text-gray-600 italic mt-1">
                {block.content}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  });
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <p className="flex items-center gap-2 text-sm md:text-base">
    <Icon className="text-gray-600" size={18} />
    <span className="text-black">{label}:</span>
    <span className="font-bold">{value ?? "—"}</span>
  </p>
);

/**
 *
 * DETAIL PRODUCT PAGE
 */
export const DetailProductPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current, isLoggedIn, wishList, address } = useSelector(
    (state) => state.user
  );
  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);
  const [variations, setVariations] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [brandId, setBrandId] = useState("");
  const { pvId } = useParams();
  const scrollRef = useRef(null); // Tạo ref cho div cuộn
  const { pathname, search } = useLocation();

  //Lay thong tin bien the duoc truyen tu url và lay thong tin cua cac bien the cung productId
  useEffect(() => {
    if (pvId) {
      apiGetProductVariation(pvId).then((res) => {
        if (res.success) {
          const variant = res.productVariation;
          setCurrentProduct(variant);
          setSelectedVariantId(variant._id);
          setImageIndex(0);
          fetchProductAndVariations(variant.productId);
        }
      });
    }
  }, [pvId]);

  //Lay thong tin product va cac bien the cua product
  const fetchProductAndVariations = async (productId) => {
    try {
      const [resProduct, resVariations] = await Promise.all([
        //Truy van qua params
        apiGetProduct(productId),
        //truy van qua query ?productId
        apiGetProductVariations({ pId: productId }),
      ]);
      if (resProduct.success) {
        fetchShop(resProduct.product.shopId._id);
        setProduct(resProduct.product);
        setBrandId(resProduct.product.brandId._id);
      }
      if (resVariations.success) {
        setVariations(resVariations.productVariations);
      }
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm và biến thể:", err);
    }
  };

  const fetchShop = async (shopId) => {
    try {
      const resShop = await apiGetShops({ shopId });
      if (resShop.success) {
        setShop(resShop.shops[0]);
      }
    } catch (err) {
      console.error("Lỗi khi thông tin shop:", err);
    }
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

  const handleSelectVariant = (variantId) => {
    setSelectedVariantId(variantId);
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("pvId", variantId);
    setSearchParams(currentParams);
  };

  const handleChangeQuantity = (type) => {
    if (type === "plus") setQuantity((prev) => prev + 1);
    else if (type === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
  };
  const formattedDate = (createtAt) => {
    const date = new Date(createtAt);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("vi-VN", { year: "numeric", month: "short" });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn div lên đầu
    }
  }, [pathname, search]); // Theo dõi pathname và search để phát hiện thay đổi route

  const textTitle = "text-sm md:text-lg";

  return (
    <div
      key={pathname + search}
      className="w-full  md:w-main mx-auto px-2 pt-1 md:pt-2 "
    >
      {/* Cụm điều khiển */}
      <div className="sticky top-[58px] flex flex-col justify-start items-start mb-4 z-10">
        <div className="md:px-2 py-1 px-1 rounded-2xl glass shadow-md border">
          <Breadcrumb
            title={product?.slug || "san-pham"}
            category={product?.categoryId?.productCategoryName || "danh-muc"}
            productName={product?.productName || ""}
          />
        </div>
      </div>

      {/* Ảnh và mua sắm */}
      <div className="w-full grid grid-cols-1 md:grid-cols-[60%_40%]  mb-6">
        {/* Bên trái */}
        <div className="rounded-3xl flex flex-col mb-4 md:mb-0">
          <div className="w-full h-[400px] md:h-[500px]">
            <ImageBrowser
              images={currentProduct?.pvImages || []}
              initialIndex={0}
              showThumbnails={true}
              loop={true}
              className="glass shadow-md"
            />
          </div>
        </div>
        {/* bên phải */}
        <div className="ml-0 md:ml-5 glass rounded-3xl flex justify-between flex-col p-4 shadow-md">
          <div>
            {" "}
            <div className="mb-4 ">
              <h2 className="text-lg md:text-xl mb-1 font-bold">
                {product?.productName || "Không có tiêu đề"}
              </h2>
              <div className="flex justify-start items-center gap-4">
                <p className="flex gap-1 items-center text-sm">
                  <AiOutlineStar size={18} />
                  {product?.productRateAvg}
                </p>
                <p className="text-sm">
                  Kho: {currentProduct?.pvStockQuantity}
                </p>
                <p className="text-sm">Đã bán: {product?.productSoldCount}</p>
              </div>
            </div>
            {/* Giá */}
            <p className="text-lg md:text-xl text-red-600 font-bold mb-5">
              {currentProduct?.pvPrice
                ? `${formatMoney(currentProduct.pvPrice)}đ`
                : "Đang cập nhật"}
            </p>
            {/* Chọn loại */}
            <div className="mb-4">
              <p className={`${textTitle} mb-2`}>
                Phân loại.{" "}
                <span className="text-gray-400">Chọn loại phù hợp với bạn</span>
              </p>
              <div className="flex flex-wrap gap-2 ">
                {variations.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSelectVariant(variant._id);
                      setCurrentProduct(variant);
                    }}
                    className={clsx(
                      " border py-0.5 px-2 rounded-3xl",
                      `${textTitle}`,
                      selectedVariantId === variant._id
                        ? "border-button-bd-ac border-[3px]"
                        : "border-black "
                    )}
                  >
                    {variant.pvName}
                  </button>
                ))}
              </div>
            </div>
            {/* Chọn số lượng */}
            <div className="mb-5">
              <p className={`${textTitle} mb-2`}>
                Số lượng.{" "}
                <span className="text-gray-400 ">
                  Bạn cần bao nhiêu sản phẩm
                </span>
              </p>
              <SelectQuantity
                quantity={quantity}
                handleChangeQuantity={handleChangeQuantity}
              />
            </div>
          </div>

          <div>
            {/* Mua ngay */}
            <button
              className="w-full mb-2 border rounded-3xl bg-button-bg-ac  hover:bg-button-bg-hv px-2 py-1 text-title text-center text-white"
              onClick={() => {}}
            >
              Mua
            </button>
            {/* Thêm vào danh sách yêu thích, giỏ hàng */}
            <div className="flex justify-center items-center gap-3">
              <button
                className="flex flex-1 justify-center items-center border border-gray-500 rounded-3xl px-2 py-1 gap-2 hover:bg-button-hv hover:border-none"
                onClick={() => {}}
              >
                <MdOutlineShoppingCart size={20} />
                <p className="text-sm md:text-lg ">Thêm vào giỏ hàng</p>
              </button>
              <button
                className="flex justify-center items-center border  border-gray-500 rounded-3xl px-2 py-1 gap-2 hover:bg-button-hv hover:border-none"
                onClick={() => {}}
              >
                <BsSuitHeart size={20} />
                <p className="text-sm md:text-lg ">Yêu thích</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thong tin shop */}
      <div className="w-full flex justify-between mx-auto glass rounded-3xl p-2 md:p-3 mb-5 shadow-md">
        {/* Logo, truy cap */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {shop?.shopLogo ? (
              <img
                onClick={() => {
                  navigate(`/${path.SHOP}/${shop._id}`);
                }}
                src={shop.shopLogo}
                alt={shop.shopName}
                className="h-[40px] w-[40px] md:h-[60px] md:w-[60px] rounded-full object-cover border cursor-pointer border-gray-300"
              />
            ) : (
              <div className="text-sm md:text-lg h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                {shop?.shopName}
              </div>
            )}
            {shop?.shopOfficial && (
              <div className="border rounded-lg line-clamp-1 absolute -bottom-2 right-1/2 translate-x-1/2 bg-red-600 text-white py-0.5 px-1 text-[10px]">
                Mall
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex flex-col justify-center items-start mb-1">
              <span className="font-semibold truncate text-base md:text-lg">
                {shop?.shopName}
              </span>
            </div>
            <div>
              <button
                onClick={() => navigate(`/${path.SHOP}/${shop?._id}`)}
                className="text-description rounded-2xl px-2 py-1 border button-action"
              >
                Xem shop
              </button>
            </div>
          </div>
        </div>

        {/* Thông tin chung + icon */}
        <div className="sm:flex gap-6 hidden mr-0 md:mr-[50px]">
          <div className="flex flex-col gap-2 mr-0 md:mr-[40px]">
            <InfoRow
              icon={AiFillStar}
              label="Đánh giá"
              value={shop?.shopRateAvg ?? 0}
            />
            <InfoRow
              icon={FaBoxOpen /* hoặc MdInventory2 */}
              label="Số sản phẩm"
              value={shop?.shopProductCount ?? 0}
            />
          </div>

          <div className="flex flex-col gap-2">
            <InfoRow
              icon={MdAccessTimeFilled}
              label="Tham gia"
              value={formattedDate(shop?.shopCreateAt)}
            />
            <InfoRow
              icon={MdShoppingCart}
              label="Lượt bán"
              value={shop?.shopSoldCount ?? 0}
            />
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col justify-between mx-auto glass rounded-3xl p-2 md:p-4 mb-6 shadow-md">
        <div className="mb-3">
          <p className="w-full rounded-2xl border-none bg-button-bg/60 text-sm md:text-lg  py-0.5 px-3 mb-2">
            Điểm nổi bật
          </p>
          <p className="text-description px-1 md:px-4">
            {product?.productDescription}
          </p>
        </div>

        <div className="mb-3">
          <p className="w-full rounded-2xl border-none bg-button-bg/60 text-sm md:text-lg  py-0.5 px-3 mb-2">
            Mô tả sản phẩm
          </p>
          {renderProductDescription(product?.productContentBlocks)}
        </div>
      </div>
      {/* Đánhg giá sản phẩm */}
      <div className="mb-5">
        {product && (
          <div className="mt-4 bg-[#FFF] rounded-3xl">
            <ProductInfomation
              totalRatings={[]}
              ratings={[]}
              nameProduct={product.productName}
              pid={currentProduct._id}
              rerender={() => {}}
            />
          </div>
        )}
      </div>
      <p className="text-title">Dành cho bạn</p>
      {brandId && product?._id && (
        <RecommentList brandId={brandId} excludeProductId={product._id} />
      )}
    </div>
  );
};
