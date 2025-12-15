import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import {
  apiGetProductVariation,
  apiGetProductVariations,
  apiGetProduct,
} from "../../services/catalog.api";
import {
  apiCreateWishlist,
  apiDeleteWishlistByCondition,
} from "../../services/shopping.api";
import { apiGetPreviews } from "../../services/preview.api";
import { apiGetShops } from "../../services/shop.api";
import {
  Breadcrumb,
  ImageBrowser,
  SelectQuantity,
  ProductInfomation,
} from "../../components";
import { RecommentList } from "../../features";
import { MdOutlineShoppingCart } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { apiStartConversation } from "../../services/chat.api";
import { toast } from "react-toastify";
import { formatMoney, renderStarFromNumber } from "../../ultils/helpers";
import path from "../../ultils/path";
import "react-image-gallery/styles/css/image-gallery.css";
import clsx from "clsx";
import { AiFillStar } from "react-icons/ai";
import { calculateFinalPrice } from "../../ultils/helpers";
import { MdAccessTimeFilled, MdShoppingCart } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { updateCartItem, fetchWishlist } from "../../store/user/asyncActions";
import { showAlert } from "store/app/appSlice";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import { persistor } from "store/redux";
import { BsFillSuitHeartFill, BsSuitHeart } from "react-icons/bs";
import { openChatBox } from "../../store/chat/chatSlice";

export const renderProductDescription = (blocks = []) => {
  if (!blocks?.length) {
    return (
      <p className="text-gray-500 italic text-sm px-1 md:px-4">
        Chưa có mô tả cho sản phẩm này.
      </p>
    );
  }

  const sorted = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const getYouTubeEmbed = (url) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
      return u.searchParams.get("v");
    } catch {
      return null;
    }
  };

  return sorted.map((block, idx) => {
    switch (block.type) {
      case "text":
        return (
          <p
            key={idx}
            className="text-gray-800 leading-relaxed mb-1 whitespace-pre-wrap px-1 md:px-4 text-justify"
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
              className="max-w-full rounded-2xl object-contain shadow-sm"
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
              className="max-w-full rounded-xl shadow-md"
            />
            {block.content && (
              <p className="text-sm text-gray-600 italic mt-1">
                {block.content}
              </p>
            )}
          </div>
        );

      case "videoUrl": {
        const id = getYouTubeEmbed(block.url);
        if (!id) return null;
        const embed = `https://www.youtube.com/embed/${id}`;
        return (
          <div
            key={idx}
            className="my-3 flex flex-col items-center px-1 md:px-4 w-full"
          >
            <div className="w-full aspect-video rounded-xl overflow-hidden shadow">
              <iframe
                src={embed}
                title={block.content || "YouTube video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                loading="lazy"
              />
            </div>
            {block.content && (
              <p className="text-sm text-gray-600 italic mt-1">
                {block.content}
              </p>
            )}
          </div>
        );
      }

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
  const { current, isLoggedIn, wishList } = useSelector((state) => state.user);
  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);
  const [variations, setVariations] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [brandId, setBrandId] = useState("");
  const { pvId } = useParams();
  const topRef = useRef(null);
  const [isWished, setIsWished] = useState(false);
  const isAdmin = Boolean(current?.roles?.includes("admin"));

  // THÊM STATE CHO PHÂN TRANG VÀ DATA ĐÁNH GIÁ ĐÃ PHÂN TRANG
  const [allReviews, setAllReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const reviewLimit = 2;
  const [reviewTotalCount, setReviewTotalCount] = useState(0);
  const [reviewSort, setReviewSort] = useState({});

  const isLogin = isLoggedIn || false;
  useEffect(() => {
    if (pvId) {
      apiGetProductVariation(pvId).then((res) => {
        if (res.success) {
          const variant = res.productVariation;
          setCurrentProduct(variant);
          setSelectedVariantId(variant._id);
          fetchProductAndVariations(variant.productId._id);
        }
      });
    }
  }, [pvId]);

  // Lay thong tin product va cac bien the cua product
  const fetchProductAndVariations = async (productId) => {
    try {
      const [resProduct, resVariations] = await Promise.all([
        apiGetProduct(productId),
        apiGetProductVariations({ pId: productId }),
      ]);
      let allVariations = [];
      if (resProduct.success) {
        fetchShop(resProduct?.product?.shopId?._id);
        setProduct(resProduct?.product);
        setBrandId(resProduct?.product?.brandId?._id);
      }
      if (resVariations.success) {
        allVariations = resVariations.productVariations;
        setVariations(allVariations);
      }
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm và biến thể:", err);
    }
  };

  // HÀM MỚI: Chỉ lấy đánh giá cho TẤT CẢ biến thể trong một lần gọi và có phân trang
  const fetchAllReviews = async () => {
    if (!product?._id || !variations.length) return;

    // 1. Lấy mảng pvId từ tất cả biến thể
    const allPvIds = variations.map((v) => v._id);

    try {
      // 2. Gọi API một lần duy nhất với mảng pvId và tham số phân trang
      const res = await apiGetPreviews({
        pvId: allPvIds,
        isDeleted: false,
        page: reviewPage,
        limit: reviewLimit,
        ...reviewSort,
      });

      if (res.success && res.previews) {
        const reviewsWithPvName = res.previews.map((review) => {
          // Tìm biến thể tương ứng để lấy tên pvName
          const relatedVariant = variations.find((v) => v._id === review.pvId);
          return {
            ...review,
            pvName: relatedVariant
              ? relatedVariant.pvName
              : "[Chưa xác minh] Không xác định",
          };
        });
        setAllReviews(reviewsWithPvName);
        setReviewTotalCount(res.totalCount);
      } else {
        setAllReviews([]);
        setReviewTotalCount(0);
      }
    } catch (err) {
      console.error("Lỗi khi lấy đánh giá:", err);
    }
  };

  // TÁCH EFFECT để gọi fetchAllReviews khi variations hoặc reviewPage thay đổi
  useEffect(() => {
    if (product?._id && variations.length > 0) {
      fetchAllReviews();
    }
  }, [product, variations, reviewPage, reviewSort]);

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

  const handleSelectVariant = (variantId) => {
    setSelectedVariantId(variantId);
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("pvId", variantId);
    setSearchParams(currentParams);
    setReviewPage(1);
  };

  const handleChangeQuantity = (type) => {
    if (type === "plus" && quantity < currentProduct.pvStockQuantity) {
      setQuantity((prev) => prev + 1);
    } else if (type === "minus" && quantity > 1)
      setQuantity((prev) => prev - 1);
  };

  const formattedDate = (createtAt) => {
    const date = new Date(createtAt);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("vi-VN", { year: "numeric", month: "short" });
  };

  const redirectToLogin = () => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: () => {
        navigate(`/${path.LOGIN}`);
        persistor.purge();
      },
      onCancel: () => {},
      onClose: () => {},
    });
    dispatch(
      showAlert({
        id,
        title: "Bạn chưa đăng nhập",
        message: "Vui lòng đăng nhập để thực hiện thao tác này",
        variant: "danger",
        showCancelButton: true,
        confirmText: "Đăng nhập",
        cancelText: "Huỷ",
      })
    );
    return;
  };

  const handleBuyNow = () => {
    if (!isLogin) {
      return redirectToLogin();
    }

    if (!product || !currentProduct || !selectedVariantId) return;
    const payload = {
      selectedItems: [
        {
          product: product,
          productVariation: currentProduct,
          quantity,
        },
      ],
    };
    sessionStorage.setItem("checkoutPayload", JSON.stringify(payload));
    navigate(`/${path.CHECKOUT}`);
  };

  const handleAddToCart = () => {
    if (!isInStock) {
      dispatch(
        showAlert({
          title: "Thất bại",
          message:
            "Phân loại tạm hết hàng, vui lòng chọn phân loại hoặc sản phẩm khác",
          variant: "danger",
          duration: 2500,
        })
      );
    }

    if (disableAction) return;
    if (!currentProduct || !selectedVariantId) return;
    const payload = {
      pvId: selectedVariantId,
      cartItemQuantity: quantity,
      priceAtTime: calculateFinalPrice(
        currentProduct?.pvPrice,
        product?.productDiscountPercent
      ),
      add: true,
      maxItemQuantity: currentProduct.pvStockQuantity,
    };

    dispatch(updateCartItem(payload))
      .unwrap()
      .catch((err) => {
        console.error("Lỗi khi thêm vào giỏ:", err);
        toast.error("Không thể thêm vào giỏ hàng.");
      });

    dispatch(
      showAlert({
        title: "Thành công",
        message: "Đã thêm sản phẩm vào giỏ hàng",
        variant: "danger",
        showCancelButton: false,
        showConfirmButton: false,
        duration: 1500,
      })
    );
  };

  const handleToggleWishlist = async () => {
    if (!isLogin) {
      return redirectToLogin();
    }

    const newWished = !isWished;
    try {
      if (newWished) {
        // Thêm vào wishlist
        await apiCreateWishlist({
          customerId: current._id,
          pvId: selectedVariantId,
        });
        dispatch(
          showAlert({
            title: "Thành công",
            message: "Đã thêm sản phẩm vào yêu thích",
            variant: "danger",
            showCancelButton: false,
            showConfirmButton: false,
            duration: 1500,
          })
        );
      } else {
        await apiDeleteWishlistByCondition({
          customerId: current._id,
          pvId: selectedVariantId,
        });
        dispatch(
          showAlert({
            title: "Thành công",
            message: "Đã xóa sản phẩm khỏi yêu thích",
            variant: "danger",
            showCancelButton: false,
            showConfirmButton: false,
            duration: 1500,
          })
        );
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật yêu thích");
      console.error(error);
      setIsWished(!newWished);
    }
    dispatch(fetchWishlist());
  };

  useEffect(() => {
    const checkIfWished = async () => {
      if (!isLoggedIn || !current || !selectedVariantId) return;

      try {
        const wishlist = wishList || [];

        const found = wishlist.find(
          (item) => item.pvId._id === selectedVariantId
        );
        setIsWished(found);
      } catch (error) {
        console.error("Lỗi kiểm tra wishlist:", error);
        setIsWished(false);
      }
    };

    checkIfWished();
  }, [selectedVariantId, current, isLoggedIn, wishList]);

  //Kiem tra
  const isInStock = currentProduct?.pvStockQuantity >= 1;
  const maxQuantity = quantity > currentProduct?.pvStockQuantity;
  const disableAction = !isInStock || maxQuantity || isAdmin;
  const isSale =
    product?.productIsOnSale && product?.productDiscountPercent > 0;

  const finalPrice = calculateFinalPrice(
    currentProduct?.pvPrice,
    product?.productDiscountPercent || 0
  );

  //css
  const textTitle = "text-sm md:text-lg";
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ ehavior: "smooth", block: "start" });
    }
  }, [pvId, selectedVariantId]);

  const handleStartConversation = async (shopId, userId) => {
    if (!userId) {
      redirectToLogin();
      return;
    }

    try {
      const senderId = userId;
      const senderModel = "User";
      const receiverId = shopId;
      const receiverModel = "Shop";

      const res = await apiStartConversation({
        senderId,
        senderModel,
        receiverId,
        receiverModel,
      });
      if (!res?.success) {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res?.message || "Vui lòng thử lại",
            variant: "danger",
            showCancelButton: false,
            duration: 3000,
          })
        );
        return;
      }
      const conversationId = res.conversation?._id;
      dispatch(openChatBox(conversationId));
    } catch (err) {
      console.error("Lỗi khi tạo hội thoại:", err);
      dispatch(
        showAlert({
          title: "Lỗi",
          message: err || "Vui lòng thử lại",
          variant: "danger",
          showCancelButton: false,
          duration: 2500,
        })
      );
    }
  };

  return (
    <div className="w-full xl:w-main mx-auto px-2 pt-1 md:pt-2 animate-fadeIn">
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
      <div
        style={{ scrollMarginTop: "120px" }}
        ref={topRef}
        className="w-full grid grid-cols-1 lg:grid-cols-[60%_40%]  mb-6"
      >
        {/* Bên trái */}
        <div className="w-full h-[400px] lg:h-[500px]">
          <ImageBrowser
            images={currentProduct?.pvImages || []}
            initialIndex={0}
            showThumbnails={true}
            loop={true}
            className="bg-white shadow-md"
          />
        </div>

        {/* bên phải */}
        <div className="bg-white ml-0 md:ml-5 rounded-3xl flex justify-between flex-col p-4 shadow-md">
          <div>
            {" "}
            <div className="mb-4 ">
              <h2 className="text-lg md:text-xl font-bold">
                {isSale && (
                  <span className="mr-1 rounded-3xl bg-red-500 text-white text-xs px-2 py-1 align-middle">
                    Sale {product?.productDiscountPercent}%
                  </span>
                )}
                <span className="align-middle">
                  {product?.productName || "Không có tiêu đề"}
                </span>
              </h2>
              {product?.brandId && (
                <p>Thương hiệu: {product?.brandId?.brandName}</p>
              )}

              <div className="flex justify-start items-center gap-4 mt-1">
                <p className="flex gap-1 items-center text-sm">
                  {currentProduct?.pvRateAvg !== undefined &&
                  currentProduct?.pvRateAvg !== null
                    ? Number(currentProduct.pvRateAvg).toFixed(1)
                    : ""}
                  {renderStarFromNumber(
                    currentProduct?.pvRateAvg || 0,
                    "black"
                  )}
                </p>
                <p className="text-sm">
                  Kho: {currentProduct?.pvStockQuantity}
                </p>
                <p className="text-sm">Đã bán: {currentProduct?.pvSoldCount}</p>
              </div>
            </div>
            {/* Giá */}
            <div className="mb-5">
              <span className="text-lg md:text-xl text-red-600 font-bold">
                {currentProduct?.pvPrice
                  ? `${formatMoney(finalPrice)}đ`
                  : "Đang cập nhật"}
              </span>
              {currentProduct?.pvOriginalPrice && (
                <span className="pl-2 text-gray-400 line-through text-xs md:text-sm">
                  {formatMoney(currentProduct.pvOriginalPrice)} đ
                </span>
              )}
            </div>
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
                      " border py-0.5 px-2 rounded-3xl text-xs md:text-sm",

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
            {quantity === currentProduct?.pvStockQuantity && (
              <p className="text-sm text-red-600 font-medium">
                Đạt số lượng tối đa sản phẩm.
              </p>
            )}
            {!isInStock && (
              <p className="text-sm text-red-600 font-medium">
                Sản phẩm tạm hết hàng.
              </p>
            )}
          </div>

          <div>
            {/* Mua ngay */}
            <button
              disabled={disableAction || isAdmin}
              className={`w-full mb-2 border rounded-3xl px-2 py-1 text-title text-center text-white transition
      ${
        isAdmin
          ? "bg-gray-400 cursor-not-allowed opacity-50"
          : "bg-button-bg-ac hover:bg-button-bg-hv cursor-pointer"
      }`}
              onClick={() => handleBuyNow()}
            >
              Mua
            </button>

            {/* Thêm vào danh sách yêu thích, giỏ hàng */}
            <div className="flex justify-center items-center gap-3">
              {/* Giỏ hàng */}
              <button
                className={`flex flex-1 justify-center items-center border border-gray-500 rounded-3xl px-2 py-1 gap-2 transition
        ${
          isAdmin
            ? "opacity-50 cursor-not-allowed bg-gray-100"
            : "hover:bg-button-hv hover:border-none cursor-pointer"
        }`}
                onClick={() => handleAddToCart()}
              >
                <MdOutlineShoppingCart size={20} />
                <p className="text-sm md:text-lg ">Thêm vào giỏ hàng</p>
              </button>

              {/* Yêu thích */}
              <button
                disabled={isAdmin}
                className={`flex justify-center items-center border border-gray-500 rounded-3xl px-2 py-1 gap-2 transition
        ${isWished ? "text-main" : ""}
        ${
          isAdmin
            ? "opacity-50 cursor-not-allowed bg-gray-100"
            : "hover:bg-button-hv hover:border-none"
        }`}
                onClick={handleToggleWishlist}
              >
                {isWished ? (
                  <BsFillSuitHeartFill size={20} />
                ) : (
                  <BsSuitHeart size={20} />
                )}
                <p className="text-sm md:text-lg ">Yêu thích</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thong tin shop */}
      <div className="bg-white  w-full flex justify-between mx-auto  rounded-3xl p-2 md:p-3 mb-5 shadow-md">
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
                className="h-[40px] w-[40px] md:h-[60px] md:w-[60px] rounded-full object-contain border cursor-pointer border-gray-300"
              />
            ) : (
              <div className="text-sm md:text-lg h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                {shop?.shopName}
              </div>
            )}
            {shop?.shopIsOfficial && (
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
            <div className="flex gap-2">
              <button
                onClick={() => handleStartConversation(shop?._id, current?._id)}
                className="text-description rounded-2xl px-2 py-1 border button-action flex gap-1"
              >
                <IoChatbubbleEllipsesOutline size={20} />
                Chat ngay
              </button>
              <button
                onClick={() => navigate(`/${path.SHOP}/${shop?._id}`)}
                className="text-description rounded-2xl px-2 py-1 border button-action flex gap-1"
              >
                <HiOutlineBuildingStorefront size={20} />
                Xem shop
              </button>
            </div>
          </div>
        </div>

        {/* Thông tin chung + icon */}
        <div className=" sm:flex gap-6 hidden mr-0 md:mr-[50px]">
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
      {/* Thong tin san pham */}
      <div className="bg-white w-full flex flex-col justify-between mx-auto rounded-3xl p-2 md:p-4 mb-6 shadow-md">
        {product?.productDescription && (
          <div className="mb-3">
            <p className="w-full rounded-2xl border-none bg-button-bg/60 text-sm md:text-lg  py-0.5 px-3 mb-2">
              Điểm nổi bật
            </p>
            <p className="text-description px-1 md:px-4">
              {product?.productDescription}
            </p>
          </div>
        )}

        <div className="mb-3">
          <p className="w-full rounded-2xl border-none bg-button-bg/60 text-sm md:text-lg  py-0.5 px-3 mb-2">
            Mô tả sản phẩm
          </p>
          {renderProductDescription(product?.productContentBlocks)}
        </div>
      </div>
      {/* Đánh giá sản phẩm */}
      <div className="mb-5">
        {product && (
          <div className="">
            <ProductInfomation
              previews={allReviews}
              productRateAvg={product?.productRateAvg}
              productRateCount={product?.productRateCount}
              reviewPage={reviewPage}
              reviewLimit={reviewLimit}
              reviewTotalCount={reviewTotalCount}
              onPageChange={setReviewPage}
              nameProduct={product?.productName}
              reviewSort={reviewSort}
              setReviewSort={setReviewSort}
            />
          </div>
        )}
      </div>
      {/* Gợi ý */}
      <p className="text-title">Dành cho bạn</p>
      {brandId && product?._id && (
        <RecommentList brandId={brandId} excludeProductId={product._id} />
      )}
      {!brandId && product?._id && product?.categoryId?._id && (
        <RecommentList
          brandId={brandId}
          categoryId={product?.categoryId?._id}
          excludeProductId={product._id}
        />
      )}
    </div>
  );
};
