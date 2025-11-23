import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { apiGetProducts, apiGetShops } from "../../services/catalog.api";
import { MdShoppingCart, MdAccessTimeFilled } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import { HorizontalScroller, ProductCard } from "../../components";
import { ShopCategoryList } from "../../features";
import clsx from "clsx";
import path from "ultils/path";
import noPhoto from "../../assets/image-not-found.png";
import defaultBackground from "../../assets/default.jpg";

import { apiStartConversation } from "../../services/chat.api";

import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { showAlert } from "store/app/appSlice";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import { openChatBox } from "../../store/chat/chatSlice";

export const ShopPage = () => {
  const dispatch = useDispatch();
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const homeRef = useRef(null);
  const bestRef = useRef(null);
  const categoriesRef = useRef(null);
  const localNavRef = useRef(null);
  const { current } = useSelector((state) => state.user);

  const headerHeight = 58; // chiều cao header toàn trang
  const extraGap = 60; // khoảng đệm nhỏ phía dưới nav

  const [stickyOffset, setStickyOffset] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const buttonDatas = [
    { label: "Giới thiệu", ref: homeRef },
    { label: "Bán chạy", ref: bestRef },
    { label: "Danh mục", ref: categoriesRef },
  ];
  const [button, setButton] = useState(buttonDatas[0]);

  const fetchShop = async (id) => {
    try {
      setLoadingShop(true);
      const resShop = await apiGetShops({ shopId: id });
      if (resShop?.success) setShop(resShop.shops?.[0] || null);
    } finally {
      setLoadingShop(false);
    }
  };

  const fetchProducts = async (id) => {
    try {
      setLoadingProducts(true);
      const resProducts = await apiGetProducts({ shopId: id, limit: 24 });
      if (resProducts?.success) setProducts(resProducts.products || []);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (!shopId) return;
    fetchShop(shopId);
    fetchProducts(shopId);
  }, [shopId]);

  // format ngày
  const formattedDate = (createdAt) => {
    const d = new Date(createdAt);
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString("vi-VN", { year: "numeric", month: "short" });
  };

  const hasBg = Boolean(shop?.shopBackground);

  // Tính toán chiều cao tự động
  useEffect(() => {
    const calcHeights = () => {
      const localNavH = localNavRef.current?.offsetHeight || 0;
      const totalOffset = headerHeight + localNavH;
      setStickyOffset(totalOffset);
      //Lay chieu cao toan bo vung viewPort - chieu cao da xac dinh
      setContentHeight(window.innerHeight - (totalOffset + extraGap));
    };
    calcHeights();
    window.addEventListener("resize", calcHeights);
    const ro = new ResizeObserver(calcHeights);
    if (localNavRef.current) ro.observe(localNavRef.current);

    return () => {
      window.removeEventListener("resize", calcHeights);
      ro.disconnect();
    };
  }, []);

  // scroll mượt
  const scrollTo = (item) => {
    setButton(item);
    item.ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const redirectToLogin = () => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: () => {
        navigate(`/${path.LOGIN}`);
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
            duration: 2500,
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
    <div className="w-full flex flex-col animate-fadeIn">
      {/* --- HEADER SHOP --- */}
      <section
        ref={homeRef}
        style={{
          scrollMarginTop: stickyOffset,
          backgroundImage: hasBg
            ? `url(${shop?.shopBackground})`
            : `url(${defaultBackground})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        className={clsx("mb-3 h-full lg:h-[150px]  bg-black/20  text-white")}
      >
        <div className="bg-black/5 h-full">
          <div className="w-full h-full  lg:w-main mx-auto  flex justify-between items-center gap-5 p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-[60px] w-[60px] md:h-[70px] md:w-[70px] rounded-full border border-black cursor-pointer bg-white">
                <img
                  onClick={() => {
                    navigate(`/${path.SHOP}/${shop._id}`);
                  }}
                  src={shop?.shopLogo || noPhoto}
                  alt={shop?.shopName || "shop"}
                  className="h-full w-full object-contain rounded-full"
                />

                {shop?.shopIsOfficial && (
                  <div className="w-full absolute bottom-0 right-1/2 translate-x-1/2 border rounded-lg bg-red-600 text-white text-[7px] md:text-[10px] text-center">
                    Shop Mall
                  </div>
                )}
              </div>

              <div className="flex flex-col mb-2">
                <span className="font-bold truncate text-lg md:text-xl">
                  {shop?.shopName ||
                    (loadingShop ? "Đang tải..." : "Không có tên")}
                </span>
                <span className="hidden md:block">{shop?.shopDescription}</span>
                <span className="md:hidden flex items-center gap-1 text-sm">
                  Tham gia:{" "}
                  <span className="">{formattedDate(shop?.shopCreateAt)}</span>
                </span>
                <button
                  onClick={() =>
                    handleStartConversation(shop?._id, current?._id)
                  }
                  className="w-fit text-xs md:text-sm rounded-3xl px-2 py-0.5 border button-action flex gap-1 text-black mt-0.5"
                >
                  <IoChatbubbleEllipsesOutline size={20} />
                  Chat ngay
                </button>
              </div>
            </div>

            <div className="flex justify-start items-center text-xs md:text-base gap-2 md:gap-6">
              <div className="flex flex-col justify-between items-start">
                <span className="flex items-center gap-1 mb-4">
                  <AiFillStar size={20} />
                  Đánh giá:{" "}
                  <span className="font-bold">
                    {shop?.shopRateAvg ?? 0} / 5
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <FaBoxOpen size={20} />
                  Sản phẩm:{" "}
                  <span className="font-bold">
                    {shop?.shopProductCount ?? 0}
                  </span>
                </span>
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="flex items-center gap-1 mb-4">
                  <MdShoppingCart size={20} />
                  Đã bán:{" "}
                  <span className="font-bold">{shop?.shopSoldCount ?? 0}</span>
                </span>

                {shop?.shopCreateAt && (
                  <span className="flex items-center gap-1">
                    <MdAccessTimeFilled size={20} />
                    Tham gia:{" "}
                    <span className="font-bold ">
                      {formattedDate(shop?.shopCreateAt)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- NAV LOCAL --- */}
      <div
        ref={localNavRef}
        className="mx-auto rounded-[32px] sticky z-20 flex justify-center items-center glass shadow-sm p-1"
        style={{ top: headerHeight }}
      >
        {buttonDatas.map((item, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(item)}
            className={clsx(
              "relative px-3 py-1 rounded-2xl text-sm md:text-base font-medium transition-all duration-300",
              button.label === item.label
                ? "text-text-ac bg-blue-100 shadow-sm"
                : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* --- BANNER --- */}
      <section className="w-full lg:w-main mx-auto my-3 mb-2 lg:mb-5">
        {shop?.shopBanner.map((banner, idx) => (
          <div key={idx} className="flex justify-center items-center">
            <img src={banner} alt="" />
          </div>
        ))}
      </section>

      {/* --- BEST SOLD --- */}
      <section
        ref={bestRef}
        style={{ scrollMarginTop: stickyOffset }}
        className="w-full lg:w-main mx-auto px-2 lg:px-0 mb-2 lg:mb-5"
      >
        <h2 className="font-bold text-base md:text-xl">
          Sản phẩm bán chạy nhất
        </h2>
        {loadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-[220px] bg-gray-200/70 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <HorizontalScroller
            isLeft={false}
            items={products}
            keyExtractor={(p) => p._id}
            renderItem={(p) => (
              <ProductCard
                totalSold={p.productSoldCount}
                productMinOriginalPrice={p.productMinOriginalPrice}
                productMinPrice={p.productMinPrice}
                variationId={p.variationId}
                rating={p.productRateAvg}
                productName={p.productName}
                thumb={p.productThumb}
                slugCategory={p.categoryId?.categorySlug}
                slug={p.productSlug}
                shopId={p.shopId?._id}
                shopName={p.shopId?.shopName}
                shopSlug={p.shopId?.shopSlug}
                shopLogo={p.shopId?.shopLogo}
                shopOfficial={p.shopId?.shopIsOfficial}
                productIsOnSale={p.productIsOnSale}
                productDiscountPercent={p.productDiscountPercent}
              />
            )}
          />
        )}
      </section>

      {/* --- DANH MỤC SHOP --- */}
      <section
        ref={categoriesRef}
        className="w-full lg:w-main mx-auto px-2 lg:px-0  mb-2 lg:mb-5"
        style={{ scrollMarginTop: stickyOffset }}
      >
        <h2 className="font-bold text-base md:text-xl mb-2">Danh mục shop</h2>
        <div className="mx-0 lg:-mx-4" style={{ height: `${contentHeight}px` }}>
          {shopId && <ShopCategoryList shopId={shopId} />}
        </div>
      </section>
    </div>
  );
};
