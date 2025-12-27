import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import defaultAvatar from "assets/avatarDefault.png";
import moment from "moment";
import { apiUpdateShop, apiDeleteShop } from "../../services/shop.api";
import { showAlert, showModal } from "store/app/appSlice";
import { setSeller, clearSeller } from "store/seller/sellerSlice";
import { logout } from "store/user/userSlice";
import { clearChatData } from "store/chat/chatSlice";
import { Loading, ImageUploader } from "../../components";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import { SubscriptionsServicePlan } from "../shop/subscriptionsServicePlanModal";
import { APP_INFO } from "../../ultils/contants";
import { useNavigate } from "react-router-dom";

const STATUS_LABELS = {
  pending: "Đang chờ duyệt",
  approved: "Đã được duyệt",
  blocked: "Đã bị khóa",
};

export const ShopInformation = () => {
  const dispatch = useDispatch();
  const { current } = useSelector((s) => s.seller);

  const navigate = useNavigate();
  // Lấy thông tin gói dịch vụ từ Redux store
  const activeSubscription = current?.activeSubscription;
  const servicePlan = current?.currentService;

  // ===== LOGIC VÀ STATE KHÁC GIỮ NGUYÊN =====

  // ===== LOGO PREVIEW =====
  const [previewLogo, setPreviewLogo] = useState(null);

  // ===== BACKGROUND STATE =====
  const [bgLocal, setBgLocal] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const bgOriginalUrlRef = useRef("");

  // loading khi submit background
  const [bgSubmitting, setBgSubmitting] = useState(false);

  // ===== BANNER STATE =====
  const [bannerList, setBannerList] = useState([]);
  const bannerOriginalRef = useRef([]);
  const [bannerSubmitting, setBannerSubmitting] = useState(false);

  // === FORM 1: Logo ===
  const {
    setValue: setLogoValue,
    watch: watchLogo,
    handleSubmit: handleLogoSubmit,
    formState: { isDirty: logoDirty, isSubmitting: logoSubmitting },
    reset: resetLogo,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      shopLogo: null,
    },
  });

  // === FORM 2: Info (shopName / shopDescription) ===
  const {
    register: registerInfo,
    handleSubmit: handleInfoSubmit,
    reset: resetInfo,
    formState: {
      errors: infoErrors,
      isDirty: infoDirty,
      isSubmitting: infoInfoSubmitting,
    },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      shopName: "",
      shopDescription: "",
    },
  });

  // ==========================================================
  // helper: chuyển URL ảnh từ server -> File blob
  // ==========================================================
  const fetchUrlAsFile = useCallback(async (url, indexHint = 0) => {
    const res = await fetch(url);
    const blob = await res.blob();

    const filenameFromUrl = (() => {
      try {
        const u = new URL(url);
        const pathname = u.pathname;
        const last = pathname.split("/").pop() || `banner-${indexHint}.jpg`;
        return last;
      } catch {
        return `banner-${indexHint}.jpg`;
      }
    })();

    const file = new File([blob], filenameFromUrl, {
      type: blob.type || "image/jpeg",
    });
    return file;
  }, []);

  // ==========================================================
  // Khi current thay đổi: (Đã loại bỏ fetchSubscription())
  // ==========================================================
  useEffect(() => {
    if (!current) return;
    // Đã loại bỏ: fetchSubscription();

    // reset form Info
    resetInfo({
      shopName: current.shopName || "",
      shopDescription: current.shopDescription || "",
    });

    // reset logo form
    resetLogo();
    setPreviewLogo(null);

    // BACKGROUND
    const originalBgUrl = current.shopBackground || "";
    bgOriginalUrlRef.current = originalBgUrl;
    setBgLocal(null);
    setBgPreview(originalBgUrl); // có thể là "" nếu không có nền

    // BANNER
    const serverBanners = Array.isArray(current.shopBanner)
      ? current.shopBanner
      : [];

    (async () => {
      const files = [];
      for (let i = 0; i < serverBanners.length; i++) {
        const url = serverBanners[i];
        try {
          const file = await fetchUrlAsFile(url, i);
          files.push({ file });
        } catch (err) {
          console.warn("Không fetch được banner URL:", url, err);
        }
      }

      setBannerList((old) => {
        // Thu hồi blob cũ
        old.forEach((b) => {
          if (b.preview?.startsWith("blob:")) {
            URL.revokeObjectURL(b.preview);
          }
        });

        // Tạo preview MỚI từ File
        const withPreviews = files.map(({ file }) => ({
          file,
          preview: URL.createObjectURL(file),
        }));

        // Snapshot chỉ lưu File, KHÔNG lưu preview
        bannerOriginalRef.current = files; // [{ file }]
        return withPreviews;
      });
    })();
  }, [current, resetInfo, resetLogo, fetchUrlAsFile]);

  // ==========================================================
  // Preview Logo update
  // ==========================================================
  const wLogo = watchLogo("shopLogo");
  useEffect(() => {
    if (!wLogo) {
      setPreviewLogo(null);
      return;
    }
    const url = URL.createObjectURL(wLogo);
    setPreviewLogo(url);
    return () => URL.revokeObjectURL(url);
  }, [wLogo]);

  // ==========================================================
  // API helper chung
  // ==========================================================

  // Đã loại bỏ fetchSubscription vì đã có dữ liệu trong Redux

  const handleSubscription = (servicePlan, subscriptionId) => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <SubscriptionsServicePlan
            onClose={() =>
              dispatch(showModal({ isShowModal: false, modalChildren: null }))
            }
            shopId={current._id}
            subscriptionId={subscriptionId}
            currentService={servicePlan}
          />
        ),
      })
    );
  };

  const updateShop = async (fd, fieldLabel) => {
    if (!current?._id) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Thiếu ID shop",
          variant: "danger",
        })
      );
      return false;
    }

    try {
      const res = await apiUpdateShop(fd, current._id);

      if (res?.success && res?.shop) {
        console.log("Cập nhật shop thành công:", res.shop);
        dispatch(setSeller(res.shop));

        dispatch(
          showAlert({
            title: "Thành công",
            message: `Cập nhật ${fieldLabel} thành công`,
            variant: "success",
            duration: 1500,
            showConfirmButton: false,
          })
        );
        return true;
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res?.message || "Cập nhật thất bại",
            variant: "danger",
          })
        );
      }
    } catch (err) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không thể cập nhật",
          variant: "danger",
        })
      );
      console.error(err);
    }
    return false;
  };

  // ==========================================================
  // Submit Logo / Info
  // ==========================================================
  const onLogoSubmit = async (data) => {
    const fd = new FormData();
    if (data.shopLogo) fd.append("shopLogo", data.shopLogo);
    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
    const ok = await updateShop(fd, "logo");
    dispatch(showModal({ isShowModal: false }));
    if (ok) {
      resetLogo();
      setPreviewLogo(null);
    }
  };

  const onInfoSubmit = async (data) => {
    const fd = new FormData();
    fd.append("shopName", data.shopName.trim());
    fd.append("shopDescription", data.shopDescription.trim());

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
    const ok = await updateShop(fd, "thông tin");
    dispatch(showModal({ isShowModal: false }));
    if (ok) {
      resetInfo({
        shopName: data.shopName.trim(),
        shopDescription: data.shopDescription.trim(),
      });
    }
  };

  const sameBannerState = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const fa = a[i]?.file;
      const fb = b[i]?.file;
      if (!fa || !fb) return false;
      if (fa.name !== fb.name || fa.size !== fb.size || fa.type !== fb.type) {
        return false;
      }
    }
    return true;
  };
  const bannerDirty = !sameBannerState(bannerList, bannerOriginalRef.current);

  const bgDirty = (() => {
    if (bgLocal) return true;
    const original = bgOriginalUrlRef.current || "";
    if (!bgLocal && bgPreview === "") {
      // muốn xoá
      return original !== ""; // chỉ dirty nếu ban đầu có ảnh
    }
    // giữ nguyên
    return bgPreview !== original;
  })();

  const handleUndoBackground = () => {
    // quay lại trạng thái gốc
    if (bgPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(bgPreview);
    }
    setBgLocal(null);
    setBgPreview(bgOriginalUrlRef.current || "");
  };

  const handleSaveBackground = async () => {
    setBgSubmitting(true);
    const fd = new FormData();

    // Trường hợp 1: có bgLocal (ảnh mới)
    if (bgLocal) {
      fd.append("shopBackground", bgLocal);
    } else if (bgPreview === "") {
      fd.append("shopBackground", "");
    }

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
    const ok = await updateShop(fd, "ảnh nền");
    dispatch(showModal({ isShowModal: false }));
    if (ok) {
      bgOriginalUrlRef.current = bgPreview;
      setBgLocal(null);
    }
    setBgSubmitting(false);
  };

  const handleUndoBanner = () => {
    bannerList.forEach((b) => {
      if (b.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(b.preview);
      }
    });

    // tạo lại preview MỚI từ File trong snapshot
    const cloned = bannerOriginalRef.current.map((orig) => ({
      file: orig.file,
      preview: URL.createObjectURL(orig.file),
    }));

    setBannerList(cloned);
  };

  if (!current) {
    return (
      <div className="p-6 text-center text-gray-600">
        Bạn chưa có cửa hàng để chỉnh sửa.
      </div>
    );
  }

  const handleDeleteShop = (shop) => {
    const alertId = nextAlertId();

    registerHandlers(alertId, {
      onConfirm: async () => {
        try {
          dispatch(
            showModal({ isShowModal: true, modalChildren: <Loading /> })
          );

          dispatch(showModal({ isShowModal: false }));
          const res = await apiDeleteShop({}, shop._id);
          if (res?.success) {
            dispatch(
              showAlert({
                title: "Đã xoá cửa hàng",
                message: shop.shopName,
                variant: "success",
                duration: 1500,
                showConfirmButton: false,
                showCancelButton: false,
              })
            );
            dispatch(logout());
            dispatch(clearSeller());
            dispatch(clearChatData());
            navigate(`/`);
          } else {
            dispatch(
              showAlert({
                title: "Xoá thất bại",
                message:
                  res?.message || "Không thể xoá shop. Vui lòng thử lại.",
                variant: "danger",
                showCancelButton: false,
              })
            );
          }
        } catch (err) {
          console.error("delete shop error:", err);
          dispatch(showModal({ isShowModal: false }));
          dispatch(
            showAlert({
              title: "Lỗi",
              message: err?.message || "Không thể xoá shop",
              variant: "danger",
              duration: 3500,
            })
          );
        }
      },
    });

    dispatch(
      showAlert({
        id: alertId,
        title: "Xác nhận xoá cửa hàng",
        message: (
          <div className="text-center">
            <ul className="text-left text-sm list-disc pl-4 space-y-1">
              <li>
                Sau khi xác nhận xóa, bạn sẽ không thể khôi phục lại cửa hàng
                này.
              </li>
              <li>Toàn bộ sản phẩm và đơn hàng liên quan sẽ bị ảnh hưởng.</li>
              <li>
                Việc xóa sẽ không thực hiện được nếu bạn còn đơn hàng chưa hoàn
                tất.
              </li>
              <li>
                Sau khi xoá tài khoản, {APP_INFO.NAME} có thể lưu trữ một số dữ
                liệu của bạn theo quy định tại Chính sách bảo mật của
                {APP_INFO.NAME} và quy định pháp luật có liên quan.
              </li>
              <li>
                Việc xoá tài khoản không đồng nghĩa với việc loại bỏ tất cả
                trách nhiệm và nghĩa vụ liên quan của bạn trên tài khoản đã xóa.
              </li>
            </ul>
          </div>
        ),
        variant: "danger",
        showCancelButton: true,
        confirmText: "Xoá",
        cancelText: "Hủy",
      })
    );
  };

  // ===================== RENDER UI =====================
  const sectionCls = "bg-white p-3 md:p-4 rounded-3xl mb-4";
  const titleCls = "px-3 md:px-4 font-bold mb-1";
  const labelCls = "text-sm md:text-base text-gray-700";
  const inputCls =
    "rounded-lg bg-button-bg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 transition";
  const btnCls = (disabled) =>
    `px-4 py-1.5 rounded-xl text-sm font-medium transition text-white ${
      disabled
        ? "bg-blue-400/50 cursor-not-allowed"
        : "bg-button-bg-ac hover:bg-button-bg-hv"
    }`;
  const inputRow =
    "text-sm md:text-base flex justify-between items-center gap-3 pb-2 border-b border-gray-200 mt-1";

  return (
    <div className="space-y-6 p-2 md:p-4">
      {/* === 1. LOGO === */}
      <form onSubmit={handleLogoSubmit(onLogoSubmit)}>
        <div className="flex flex-col items-center">
          <img
            src={previewLogo || current.shopLogo || defaultAvatar}
            alt="logo"
            className="w-28 h-28 object-cover rounded-full border border-gray-300 shadow-md"
          />
          <label
            htmlFor="shopLogo"
            className="mt-3 cursor-pointer text-sm text-blue-600 hover:underline"
          >
            Chọn ảnh
          </label>
          <input
            type="file"
            id="shopLogo"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setLogoValue("shopLogo", file, { shouldDirty: true });
              }
            }}
          />
        </div>

        {logoDirty && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
              onClick={() => {
                resetLogo();
                setPreviewLogo(null);
              }}
            >
              Hoàn tác
            </button>
            <button
              type="submit"
              disabled={!logoDirty || logoSubmitting}
              className={btnCls(!logoDirty || logoSubmitting)}
            >
              {logoSubmitting ? "Đang lưu..." : "Lưu logo"}
            </button>
          </div>
        )}
      </form>

      {/* === 2. THÔNG TIN CỬA HÀNG === */}
      <form onSubmit={handleInfoSubmit(onInfoSubmit)}>
        <h1 className={titleCls}>Thông tin cửa hàng</h1>

        <div className={sectionCls}>
          <div className="space-y-4">
            <div className={inputRow}>
              <label className={labelCls} htmlFor="shopName">
                Tên cửa hàng
              </label>
              <input
                id="shopName"
                type="text"
                className={`${inputCls} max-w-[65%] text-right`}
                placeholder="Nhập tên hiển thị"
                {...registerInfo("shopName", {
                  required: "Vui lòng nhập tên cửa hàng",
                  maxLength: { value: 100, message: "Tối đa 100 ký tự" },
                })}
              />
            </div>
            {infoErrors.shopName && (
              <p className="text-red-600 text-sm text-justify">
                {infoErrors.shopName.message}
              </p>
            )}

            <div className={inputRow}>
              <label className={labelCls} htmlFor="shopDescription">
                Mô tả
              </label>
              <textarea
                id="shopDescription"
                rows={2}
                className={`${inputCls} resize-x text-right max-w-[80%] min-w-[50%]`}
                placeholder="Giới thiệu ngắn về cửa hàng..."
                {...registerInfo("shopDescription", {
                  maxLength: { value: 500, message: "Tối đa 500 ký tự" },
                })}
              />
            </div>
            {infoErrors.shopDescription && (
              <p className="text-red-600 text-sm text-right">
                {infoErrors.shopDescription.message}
              </p>
            )}

            <div className={inputRow}>
              <p>Trạng thái</p>
              {STATUS_LABELS[current.shopStatus] || "Không xác định"}
            </div>
            <div className={inputRow}>
              <p>Sản phẩm</p>
              {current.shopProductCount ?? 0}
            </div>
            <div className={inputRow}>
              <p>Đã bán</p>
              {current.shopSoldCount ?? 0}
            </div>
            <div className={`${inputRow} border-none`}>
              <p>Đánh giá</p>
              {current.shopRateAvg ?? 0}/5
            </div>
          </div>

          {infoDirty && (
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => resetInfo()}
                className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
              >
                Hoàn tác
              </button>
              <button
                type="submit"
                disabled={!infoDirty || infoInfoSubmitting}
                className={btnCls(!infoDirty || infoInfoSubmitting)}
              >
                {infoInfoSubmitting ? "Đang lưu..." : "Lưu thông tin"}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* ====== Gói dịch vụ ==== */}
      <div>
        <h1 className={titleCls}>Gói dịch vụ</h1>
        <div className={sectionCls}>
          <div className={`${inputRow}`}>
            <p>Tên gói</p>
            <button
              onClick={() =>
                handleSubscription(servicePlan, activeSubscription?._id)
              }
              className="bg-button-bg py-0.5 px-1 rounded-xl"
            >
              {servicePlan?.serviceName || "Chưa đăng ký"}
            </button>
          </div>
          {activeSubscription && (
            <>
              {activeSubscription.subStartDate && (
                <div className={`${inputRow} `}>
                  <p>Ngày đăng ký</p>
                  {moment(activeSubscription.subStartDate).format("DD/MM/YYYY")}
                </div>
              )}
              {activeSubscription.subExpirationDate && (
                <div className={`${inputRow} `}>
                  <p>Ngày hết hạn</p>
                  {moment(activeSubscription.subExpirationDate).format(
                    "DD/MM/YYYY"
                  )}
                </div>
              )}

              <div className={`${inputRow} border-b-0`}>
                <p>Trạng thái gói</p>
                <p className="">
                  {activeSubscription.subStatus === "active"
                    ? "Đang hoạt động"
                    : activeSubscription.subStatus === "expired"
                    ? "Đã hết hạn"
                    : activeSubscription.subStatus === "canceled"
                    ? "Đã hủy"
                    : "Không xác định"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* === 3. ẢNH NỀN GIAN HÀNG === */}
      <div>
        <h1 className={titleCls}>Ảnh nền gian hàng</h1>
        <div className={sectionCls}>
          <ImageUploader
            multiple={false}
            value={bgLocal} // File | null
            previews={bgPreview} // string | ""
            onChange={(file) => {
              // file là File | null
              if (file) {
                if (bgPreview?.startsWith("blob:")) {
                  URL.revokeObjectURL(bgPreview);
                }
                const blobUrl = URL.createObjectURL(file);
                setBgLocal(file);
                setBgPreview(blobUrl);
              } else {
                if (bgPreview?.startsWith("blob:")) {
                  URL.revokeObjectURL(bgPreview);
                }
                setBgLocal(null);
                setBgPreview("");
              }
            }}
            label="ảnh nền"
          />

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
              onClick={handleUndoBackground}
              disabled={!bgDirty}
            >
              Hoàn tác
            </button>
            <button
              type="button"
              disabled={!bgDirty || bgSubmitting}
              className={btnCls(!bgDirty || bgSubmitting)}
              onClick={handleSaveBackground}
            >
              {bgSubmitting ? "Đang lưu..." : "Lưu ảnh nền"}
            </button>
          </div>
        </div>
      </div>

      {/* === 4. BANNER CỬA HÀNG === */}
      <div>
        <h1 className={titleCls}>Banner cửa hàng</h1>

        <div className={sectionCls}>
          <ImageUploader
            multiple
            value={bannerList.map((b) => b.file)} // File[] để gửi
            previews={bannerList.map((b) => b.preview)} // URL để hiển thị
            onChange={(files) => {
              const newEntries = Array.isArray(files)
                ? files.map((file) => ({
                    file,
                    preview: URL.createObjectURL(file),
                  }))
                : [];

              // Thu hồi blob cũ
              bannerList.forEach((b) => {
                if (b.preview?.startsWith("blob:")) {
                  URL.revokeObjectURL(b.preview);
                }
              });

              setBannerList(newEntries);
            }}
            label="banner cửa hàng"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
              onClick={handleUndoBanner}
              disabled={!bannerDirty}
            >
              Hoàn tác
            </button>

            <button
              type="button"
              className={btnCls(!bannerDirty || bannerSubmitting)}
              disabled={!bannerDirty || bannerSubmitting}
              onClick={async () => {
                setBannerSubmitting(true);
                const fd = new FormData();

                // Nếu bannerList rỗng thì gửi request rỗng
                // server sẽ tự kiểm tra và clear nếu cần

                if (bannerList.length > 0) {
                  bannerList.forEach((b) => {
                    fd.append("shopBanner", b.file);
                  });
                } else {
                  fd.append("shopBanner", "[]");
                }

                dispatch(
                  showModal({ isShowModal: true, modalChildren: <Loading /> })
                );
                const ok = await updateShop(fd, "banner");
                dispatch(showModal({ isShowModal: false }));
                if (ok) {
                  bannerOriginalRef.current = bannerList.map((b) => ({
                    file: b.file,
                  }));
                }
                setBannerSubmitting(false);
              }}
            >
              {bannerSubmitting ? "Đang lưu..." : "Thay thế banner"}
            </button>
          </div>
        </div>
      </div>
      <div>
        <h1 className={titleCls}>Tài khoản</h1>

        <div className={sectionCls}>
          <div className={`${inputRow} border-none pb-0`}>
            <p>Yêu cầu xóa cửa hàng</p>
            <button
              onClick={() => handleDeleteShop(current)}
              className="px-4 py-1.5 rounded-xl bg-button-bg  hover:bg-button-hv text-sm text-red-500"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
