import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { calculateFinalPrice } from "../../ultils/helpers";
import { CreateBrandForm } from "./createBrandForm";

import {
  apiCreateProduct,
  apiUpdateProduct,
  apiCreateProductVariation,
  apiUpdateProductVariation,
  apiDeleteProductVariation,
  apiGetProductCategories,
  apiGetBrands,
  apiGetThemes,
} from "../../services/catalog.api";

import { apiGetShopCategories } from "../../services/shop.api";
import { Loading, CloseButton, ImageUploader } from "../../components";
import { showAlert, showModal } from "store/app/appSlice";
import path from "ultils/path";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import {
  formatMoney,
  handleMoneyChange,
  getServiceFeatureValue,
} from "../../ultils/helpers";

// ===========================
// Helpers
// ===========================
const toNumberOrEmpty = (v) => (typeof v === "number" ? v : "");

// biến URL ảnh từ server thành File + blob preview
const useFetchUrlAsFile = () => {
  const fetchUrlAsFile = useCallback(async (url, indexHint = 0) => {
    const res = await fetch(url);
    const blob = await res.blob();

    // cố gắng đặt tên file từ URL server
    const filenameFromUrl = (() => {
      try {
        const u = new URL(url);
        const pathname = u.pathname;
        const last = pathname.split("/").pop() || `img-${indexHint}.jpg`;
        return last;
      } catch {
        return `img-${indexHint}.jpg`;
      }
    })();

    const file = new File([blob], filenameFromUrl, {
      type: blob.type || "image/jpeg",
    });

    return file;
  }, []);

  return fetchUrlAsFile;
};

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

const ProductBlockCreator = ({
  blocksCount,
  onAddBlock,
  onClose,
  isSubmitDisabled,
}) => {
  const [newBlockType, setNewBlockType] = useState("text"); // "text" | "image" | "video" | "videoUrl"
  const [draftText, setDraftText] = useState(""); // cho text.content
  const [draftImageCaption, setDraftImageCaption] = useState(""); // cho image/video .content
  const [draftImageAlt, setDraftImageAlt] = useState(""); // cho image/video .alt
  const [draftMediaFile, setDraftMediaFile] = useState(null); // cho image/video file
  const [draftVideoUrl, setDraftVideoUrl] = useState(""); // cho videoUrl.url
  const [draftVideoUrlDesc, setDraftVideoUrlDesc] = useState(""); // cho videoUrl.content

  const handleAddBlock = () => {
    const order = blocksCount;
    let newBlock = null;
    let newBlockFile = null;

    if (newBlockType === "text") {
      if (!draftText.trim()) return;
      newBlock = { type: "text", content: draftText.trim(), order };
    } else if (newBlockType === "image" || newBlockType === "video") {
      if (!draftMediaFile) return;

      const objectUrl = URL.createObjectURL(draftMediaFile);

      newBlock = {
        type: newBlockType,
        content: draftImageCaption.trim(),
        alt: draftImageAlt.trim(),
        order,
        previewUrl: objectUrl,
      };
      newBlockFile = draftMediaFile;
    } else if (newBlockType === "videoUrl") {
      if (!draftVideoUrl.trim()) return;
      newBlock = {
        type: "videoUrl",
        url: draftVideoUrl.trim(),
        content: draftVideoUrlDesc.trim(),
        alt: "",
        order,
      };
    } else {
      return;
    }

    // Gửi data và file về component cha
    onAddBlock(newBlock, newBlockFile);
  };

  // Logic kiểm tra nút Thêm có bị disable không
  const isAddButtonDisabled =
    isSubmitDisabled ||
    (newBlockType === "text" && !draftText.trim()) ||
    ((newBlockType === "image" || newBlockType === "video") &&
      !draftMediaFile) ||
    (newBlockType === "videoUrl" && !draftVideoUrl.trim());

  return (
    <div
      className=" bg-white border rounded-2xl shadow-lg p-4 w-[90vw] max-w-[700px] text-sm relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Chọn loại block */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Loại khối
        </label>
        <select
          className="border rounded-xl px-3 py-2 w-full text-xs md:text-sm"
          value={newBlockType}
          onChange={(e) => {
            const v = e.target.value;
            setNewBlockType(v);
            // reset drafts
            setDraftText("");
            setDraftImageCaption("");
            setDraftImageAlt("");
            setDraftMediaFile(null);
            setDraftVideoUrl("");
            setDraftVideoUrlDesc("");
          }}
        >
          <option value="text">Đoạn văn bản</option>
          <option value="image">Hình ảnh (upload file)</option>
          <option value="video">Video (upload file)</option>
          <option value="videoUrl">Video link (YouTube,...)</option>
        </select>
      </div>
      <CloseButton onClick={onClose} className="absolute top-2 right-2" />

      {/* Form theo loại */}
      {newBlockType === "text" && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nội dung văn bản
          </label>
          <textarea
            className="border rounded-xl px-3 py-2 w-full text-sm"
            rows={4}
            placeholder="Nhập mô tả..."
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
          />
        </div>
      )}

      {(newBlockType === "image" || newBlockType === "video") && (
        <>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Chú thích / mô tả hiển thị
            </label>
            <input
              className="border rounded-xl px-3 py-2 w-full text-sm"
              placeholder="Ví dụ: Mặt trước sản phẩm"
              value={draftImageCaption}
              onChange={(e) => setDraftImageCaption(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Alt (mô tả ảnh cho SEO / hỗ trợ truy cập)
            </label>
            <input
              className="border rounded-xl px-3 py-2 w-full text-sm"
              placeholder="Ví dụ: Ảnh chụp iPhone màu xanh"
              value={draftImageAlt}
              onChange={(e) => setDraftImageAlt(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              File {newBlockType === "image" ? "ảnh" : "video"}
            </label>
            <ImageUploader
              multiple={false}
              value={draftMediaFile}
              previews={
                draftMediaFile ? URL.createObjectURL(draftMediaFile) : null
              }
              onChange={(file) => {
                if (draftMediaFile?.previewUrl?.startsWith("blob:")) {
                  URL.revokeObjectURL(draftMediaFile.previewUrl);
                }
                setDraftMediaFile(file);
              }}
              label="ảnh"
            />
          </div>
        </>
      )}

      {newBlockType === "videoUrl" && (
        <>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              URL video
            </label>
            <input
              className="border rounded-xl px-3 py-2 w-full text-sm"
              placeholder="https://youtu.be/..."
              value={draftVideoUrl}
              onChange={(e) => setDraftVideoUrl(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Mô tả / ghi chú
            </label>
            <input
              className="border rounded-xl px-3 py-2 w-full text-sm"
              placeholder="Giới thiệu tổng quan..."
              value={draftVideoUrlDesc}
              onChange={(e) => setDraftVideoUrlDesc(e.target.value)}
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          className="px-4 py-1 bg-gray-200 rounded-3xl hover:bg-gray-300 text-sm"
          onClick={onClose}
        >
          Hủy
        </button>

        <button
          type="button"
          className="px-4 py-1 bg-button-bg-ac hover:bg-button-bg-hv text-white rounded-3xl text-sm"
          onClick={handleAddBlock}
          disabled={isAddButtonDisabled}
        >
          Thêm
        </button>
      </div>
    </div>
  );
};

export const CreateProduct = () => {
  const { state } = useLocation();
  const initialProduct = state?.product || null;
  const initialThemes = initialProduct?.productThemes?.map((t) => t._id) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current } = useSelector((s) => s.seller);

  const servicePlan = current?.activeSubscription;
  const isShopBlocked = current?.shopStatus === "blocked";
  const isNoAddress = !current?.address;
  const productCount = current?.shopProductCount || 0;
  const isEditing = !!initialProduct;

  const MAX_PRODUCTS = getServiceFeatureValue(servicePlan, "MAX_PRODUCTS", 0);
  const isOperationDisabled =
    isShopBlocked ||
    !servicePlan ||
    servicePlan.subStatus !== "active" ||
    isNoAddress;
  const isCreateLimited = !isEditing && productCount >= MAX_PRODUCTS;
  const isProductSubmitDisabled = isOperationDisabled || isCreateLimited;

  const fetchUrlAsFile = useFetchUrlAsFile();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryShops, setCategoryShops] = useState([]);
  const [themes, setThemes] = useState([]);
  const [selectedThemeIds, setSelectedThemeIds] = useState([]);
  useEffect(() => {
    const fetchOptions = async (shopId) => {
      try {
        const [resBrands, resCategories, resCategoryShops, resThemes] =
          await Promise.all([
            apiGetBrands(),
            apiGetProductCategories(),
            apiGetShopCategories({ shopId }),
            apiGetThemes(),
          ]);

        if (resBrands?.success) setBrands(resBrands.brands || []);
        if (resCategories?.success)
          setCategories(resCategories.categories || []);
        if (resCategoryShops?.success)
          setCategoryShops(resCategoryShops.categoryShops || []);
        if (resThemes?.success) setThemes(resThemes?.themes || []);
      } catch (err) {
        dispatch(
          showAlert({
            title: "Không thể tải dữ liệu",
            message: String(err),
            variant: "danger",
            duration: 1500,
          })
        );
      }
    };

    if (current?._id) fetchOptions(current._id);
  }, [current?._id, dispatch]);

  const handleSelectTheme = (themeId) => {
    if (isProductSubmitDisabled) return;

    setSelectedThemeIds((prevIds) => {
      const idString = String(themeId);
      if (prevIds.includes(idString)) {
        // Đã chọn -> Bỏ chọn (Lọc ra khỏi mảng)
        return prevIds.filter((id) => id !== idString);
      } else {
        // Chưa chọn -> Thêm vào mảng
        return [...prevIds, idString];
      }
    });
  };

  // STATE / FORM SẢN PHẨM

  // productForVar: phiên bản "product hiện tại trên server"
  const [productForVar, setProductForVar] = useState(initialProduct || null);

  // tab
  const [activeTab, setActiveTab] = useState("product");
  const [thumbLocal, setThumbLocal] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(
    initialProduct?.productThumb || ""
  );
  const thumbOriginalRef = useRef(initialProduct?.productThumb || "");

  // FORM sản phẩm (text fields / số / select)
  const {
    register: registerProduct,
    handleSubmit: handleSubmitProduct,
    reset: resetProductForm,
    watch: watchProduct,
    setValue: setValueProduct,
    formState: { isSubmitting: isSubmittingProduct, errors: productErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      productName: initialProduct?.productName || "",
      productDescription: initialProduct?.productDescription || "",
      productDiscountPercent: toNumberOrEmpty(
        initialProduct?.productDiscountPercent
      ),
      productIsOnSale: initialProduct?.productIsOnSale || false,
      brandId: initialProduct?.brandId?._id || "",
      categoryId: initialProduct?.categoryId?._id || "",
      categoryShopId: initialProduct?.categoryShopId?._id || "",
      productContentBlocks: initialProduct?.productContentBlocks || [],
    },
  });

  // Theo dõi giá trị giảm giá sản phẩm cha
  const productDiscountPercent = watchProduct("productDiscountPercent");

  // [ĐÃ XÓA] Logic useMemo productFinalPriceEstimate đã được loại bỏ theo yêu cầu

  // Nếu initialProduct đổi thì sync lại form + thumbnail states
  useEffect(() => {
    resetProductForm({
      productName: initialProduct?.productName || "",
      productDescription: initialProduct?.productDescription || "",
      productDiscountPercent: toNumberOrEmpty(
        initialProduct?.productDiscountPercent
      ),
      productIsOnSale: initialProduct?.productIsOnSale || false,
      brandId: initialProduct?.brandId?._id || "",
      categoryId: initialProduct?.categoryId?._id || "",
      categoryShopId: initialProduct?.categoryShopId?._id || "",
      productContentBlocks: initialProduct?.productContentBlocks || [],
    });

    setProductForVar(initialProduct || null);

    // thumbnail
    thumbOriginalRef.current = initialProduct?.productThumb || "";
    setThumbLocal(null);
    setThumbPreview(initialProduct?.productThumb || "");
    if (initialProduct?.productThemes?.length > 0) {
      const initialThemeIds = initialProduct.productThemes.map((t) => t._id);
      setSelectedThemeIds(initialThemeIds);
    } else {
      setSelectedThemeIds([]);
    }
  }, [initialProduct, resetProductForm]);

  // Khi options load xong thì set lại select nếu có dữ liệu server
  useEffect(() => {
    if (!initialProduct) return;
    if (brands.length > 0 && initialProduct?.brandId?._id) {
      setValueProduct("brandId", initialProduct.brandId._id, {
        shouldDirty: false,
      });
    }
    if (categories.length > 0 && initialProduct?.categoryId?._id) {
      setValueProduct("categoryId", initialProduct.categoryId._id, {
        shouldDirty: false,
      });
    }
    if (categoryShops.length > 0 && initialProduct?.categoryShopId?._id) {
      setValueProduct("categoryShopId", initialProduct.categoryShopId._id, {
        shouldDirty: false,
      });
    }
  }, [
    brands,
    categories,
    categoryShops,
    themes,
    initialProduct,
    setValueProduct,
  ]);

  const undoProductThumb = () => {
    if (thumbPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(thumbPreview);
    }
    setThumbLocal(null);
    setThumbPreview(thumbOriginalRef.current || "");
  };

  const thumbDirty = (() => {
    if (thumbLocal) return true;
    const original = thumbOriginalRef.current || "";
    if (!thumbLocal && thumbPreview === "") {
      return original !== ""; // chỉ dirty nếu ban đầu có ảnh mà giờ xoá
    }
    return thumbPreview !== original;
  })();

  // Khối mô tả chi tiết sản phẩm
  const [blocks, setBlocks] = useState(
    initialProduct?.productContentBlocks?.map((b, idx) => {
      if (b.type === "text") {
        return {
          type: "text",
          content: b.content || "",
          order: b.order ?? idx,
        };
      }
      if (b.type === "videoUrl") {
        return {
          type: "videoUrl",
          url: b.url || "",
          content: b.content || "",
          alt: b.alt || "",
          order: b.order ?? idx,
        };
      }
      if (b.type === "image" || b.type === "video") {
        return {
          type: b.type,
          content: b.content || "",
          alt: b.alt || "",
          url: b.url || "",
          order: b.order ?? idx,
        };
      }
      return {
        type: "text",
        content: b.content || "",
        order: b.order ?? idx,
      };
    }) || []
  );

  //----------------Blocks----------------
  const [blockFiles, setBlockFiles] = useState([]);

  // 1. Hàm xử lý dữ liệu trả về từ Modal và cập nhật state
  const handleBlockAdd = useCallback(
    (newBlock, newBlockFile) => {
      setBlocks((prevBlocks) => {
        // Khi tạo block media mới, URL blob đã được tạo trong modal
        return [...prevBlocks, newBlock];
      });

      if (newBlockFile) {
        setBlockFiles((prevFiles) => [...prevFiles, newBlockFile]);
      }
      dispatch(showModal({ isShowModal: false })); // Đóng modal sau khi thêm
    },
    [setBlocks, setBlockFiles, dispatch]
  );

  // 2. Hàm mở Modal
  const openBlockCreatorModal = useCallback(() => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          // Component mới
          <ProductBlockCreator
            blocksCount={blocks.length}
            onAddBlock={handleBlockAdd}
            onClose={() => dispatch(showModal({ isShowModal: false }))}
            isSubmitDisabled={isProductSubmitDisabled}
          />
        ),
        // Cho phép hiển thị toàn màn hình nếu cần, hoặc mặc định sẽ căn giữa
      })
    );
  }, [blocks.length, handleBlockAdd, isProductSubmitDisabled, dispatch]);

  // Reset form sản phẩm về productForVar + undo thumbnail
  const handleResetProductForm = () => {
    resetProductForm({
      productName: productForVar?.productName || "",
      productDescription: productForVar?.productDescription || "",
      productStockQuantity: toNumberOrEmpty(
        productForVar?.productStockQuantity
      ),
      productDiscountPercent: toNumberOrEmpty(
        productForVar?.productDiscountPercent
      ),
      productIsOnSale: productForVar?.productIsOnSale || false,
      brandId: productForVar?.brandId?._id || "",
      categoryId: productForVar?.categoryId?._id || "",
      categoryShopId: productForVar?.categoryShopId?._id || "",
      productContentBlocks: productForVar?.productContentBlocks || [],
    });
    setProductForVar(initialProduct || null);
    if (initialProduct?.productThemes?.length > 0) {
      const initialThemeIds = initialProduct.productThemes.map((t) => t._id);
      setSelectedThemeIds(initialThemeIds);
    } else {
      setSelectedThemeIds([]);
    }
    // undo thumbnail
    undoProductThumb();
  };

  const buildVariationFromServer = async (v, indexBase = 0) => {
    // lấy tất cả ảnh từ server, convert sang { file, preview }
    let list = [];
    if (Array.isArray(v.pvImages) && v.pvImages.length > 0) {
      for (let i = 0; i < v.pvImages.length; i++) {
        const url = v.pvImages[i];
        try {
          const file = await fetchUrlAsFile(url, i);
          const blobUrl = URL.createObjectURL(file);
          list.push({ file, preview: blobUrl });
        } catch (err) {
          console.warn("Không fetch được ảnh pvImages:", url, err);
        }
      }
    }

    return {
      _id: v._id,
      pvName: v.pvName || "",
      pvOriginalPrice: v.pvOriginalPrice?.toString() || "",
      pvPrice: v.pvPrice?.toString() || "",
      pvStockQuantity: v.pvStockQuantity?.toString() || "",
      pvImagesList: list, // mảng banner-style
    };
  };

  // khởi tạo default variations
  const [initialVariationsLoaded, setInitialVariationsLoaded] = useState(false);

  const {
    control,
    watch: watchVarList,
    setValue: setValueVarList,
    trigger,
    formState: { isSubmitting: isSubmittingVarList, errors: varErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      variations: [
        {
          _id: null,
          pvName: "",
          pvOriginalPrice: "",
          pvPrice: "",
          pvStockQuantity: "",
          pvImagesList: [],
        },
      ],
    },
  });

  const { fields, prepend, remove, replace } = useFieldArray({
    control,
    name: "variations",
  });

  // Load variations từ initialProduct vào form biến thể
  useEffect(() => {
    const loadVariations = async () => {
      if (!initialProduct?.variations) {
        // không có biến thể => 1 biến thể trống như default
        replace([
          {
            _id: null,
            pvName: "",
            pvOriginalPrice: "",
            pvPrice: "",
            pvStockQuantity: "",
            pvImagesList: [],
          },
        ]);
        setInitialVariationsLoaded(true);
        return;
      }

      const tmp = [];
      for (let i = 0; i < initialProduct.variations.length; i++) {
        const v = initialProduct.variations[i];
        const built = await buildVariationFromServer(v, i);
        tmp.push(built);
      }
      replace(
        tmp.length
          ? tmp
          : [
              {
                _id: null,
                pvName: "",
                pvOriginalPrice: "",
                pvPrice: "",
                pvStockQuantity: "",
                pvImagesList: [],
              },
            ]
      );
      setInitialVariationsLoaded(true);
    };

    // gọi async ngay lập lập tức
    loadVariations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProduct]);

  // refs để focus ô tên biến thể mới
  const variationNameRefs = useRef([]);
  useEffect(() => {
    if (fields.length > 0 && variationNameRefs.current[0]) {
      variationNameRefs.current[0]?.focus();
    }
  }, [fields.length]);

  const submitOneVariation = async (idx) => {
    // Check nếu bị khóa (áp dụng cho cả tạo và sửa biến thể)
    if (isOperationDisabled) {
      dispatch(
        showAlert({
          title: "Thao tác bị chặn",
          message: isShopBlocked
            ? "Shop đang bị khóa"
            : "Vui lòng đăng ký gói dịch vụ để tiếp tục.",
          variant: "danger",
        })
      );
      return;
    }

    // validate các trường required của biến thể idx
    const isValid = await trigger(`variations.${idx}`);
    if (!isValid) {
      dispatch(
        showAlert({
          title: "Thiếu thông tin",
          message: "Vui lòng điền đầy đủ các trường bắt buộc.",
          variant: "warning",
          duration: 2000,
        })
      );
      return;
    }

    if (!productForVar?._id) {
      dispatch(
        showAlert({
          title: "Chưa có sản phẩm",
          message: "Vui lòng lưu sản phẩm trước.",
          variant: "warning",
        })
      );
      return;
    }

    const v = watchVarList(`variations.${idx}`);

    // Tạo FormData cho toàn bộ biến thể
    const fd = new FormData();
    fd.append("productId", productForVar._id);
    if (v.pvName) fd.append("pvName", v.pvName);
    if (v.pvOriginalPrice) fd.append("pvOriginalPrice", v.pvOriginalPrice);
    if (v.pvPrice) fd.append("pvPrice", v.pvPrice);
    if (v.pvStockQuantity) fd.append("pvStockQuantity", v.pvStockQuantity);

    const list = v.pvImagesList || [];
    if (list.length > 0) {
      list.forEach((imgObj) => {
        if (imgObj?.file instanceof File) {
          fd.append("pvImages", imgObj.file);
        }
      });
    } else {
      // Nếu không còn ảnh, gửi "rỗng" để server clear
      fd.append("pvImages", "[]");
    }

    try {
      dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
      const res = v._id
        ? await apiUpdateProductVariation(fd, v._id)
        : await apiCreateProductVariation(fd);
      dispatch(showModal({ isShowModal: false }));

      if (res?.success) {
        dispatch(
          showAlert({
            title: v._id
              ? "Cập nhật biến thể thành công"
              : "Tạo biến thể thành công",
            variant: "success",
            duration: 1500,
            showConfirmButton: false,
          })
        );
        if (res.variation) {
          if (productForVar) {
            setProductForVar((prev) => {
              const newVars = (prev?.variations || []).filter(
                (v) => v._id !== res.variation._id
              );
              return {
                ...prev,
                variations: v._id
                  ? newVars.map((v) =>
                      v._id === res.variation._id ? res.variation : v
                    )
                  : [...newVars, res.variation],
              };
            });
          }

          const reloadVar = await buildVariationFromServer(res.variation, idx);
          setValueVarList(`variations.${idx}`, reloadVar, {
            shouldDirty: false,
          });
        }
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res?.message,
            variant: "danger",
          })
        );
      }
    } catch (err) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: String(err),
          variant: "danger",
        })
      );
    }
  };

  const onSubmitProduct = async (data) => {
    if (isProductSubmitDisabled) {
      // Check lại giới hạn khi submit
      const reason = isShopBlocked
        ? "Shop đang bị khóa"
        : !servicePlan || servicePlan.subStatus !== "active"
        ? "Vui lòng đăng ký gói dịch vụ để tiếp tục."
        : isCreateLimited
        ? `Đã đạt giới hạn ${MAX_PRODUCTS} sản phẩm theo gói hiện tại.`
        : "Lỗi không xác định.";

      dispatch(
        showAlert({
          title: isEditing ? "Thao tác bị chặn" : "Không thể tạo sản phẩm",
          message: reason,
          variant: "danger",
        })
      );
      return;
    }

    try {
      const fd = new FormData();
      if (current?._id) fd.append("shopId", current._id);

      if (data.productName) fd.append("productName", data.productName);
      if (data.productDescription)
        fd.append("productDescription", data.productDescription);

      if (
        data.productDiscountPercent !== "" &&
        data.productDiscountPercent != null
      ) {
        fd.append(
          "productDiscountPercent",
          String(data.productDiscountPercent)
        );
        fd.append("productIsOnSale", "true");
      } else {
        fd.append("productIsOnSale", "false");
      }

      fd.append("blocks", JSON.stringify(blocks));
      blockFiles.forEach((f) => {
        fd.append("blockFiles", f);
      });

      if (data.brandId) fd.append("brandId", data.brandId);
      if (data.categoryId) fd.append("categoryId", data.categoryId);
      if (data.categoryShopId) fd.append("categoryShopId", data.categoryShopId);
      const themesToSubmit = selectedThemeIds;
      if (themesToSubmit.length > 0) {
        themesToSubmit.forEach((id) => {
          if (id) fd.append("themeId", id); // Backend sẽ nhận một mảng các themeId
        });
      } else if (isEditing) {
        // Nếu sửa: người dùng bỏ chọn hết -> gửi rỗng để xóa liên kết cũ
        fd.append("themeId", "");
      }

      // Product Thumbnail:
      // - Nếu có thumbLocal => append file
      // - Nếu không thumbLocal nhưng thumbPreview === "" => append "" để clear
      if (thumbLocal) {
        fd.append("productThumb", thumbLocal);
      } else if (thumbPreview === "") {
        // user đã xoá thumb
        fd.append("productThumb", "");
      }

      dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
      let res;
      if (productForVar?._id) {
        res = await apiUpdateProduct(fd, productForVar._id);
      } else {
        res = await apiCreateProduct(fd);
      }
      dispatch(showModal({ isShowModal: false }));

      if (res?.success) {
        dispatch(
          showAlert({
            title: productForVar?._id
              ? "Cập nhật thành công"
              : "Tạo sản phẩm thành công",
            variant: "success",
            duration: 1500,
            showConfirmButton: false,
          })
        );

        if (!productForVar?._id && res.product?._id) {
          // chuyển sang trạng thái "đã có sản phẩm"
          setProductForVar(res.product);

          // cập nhật lại thumbnail gốc
          thumbOriginalRef.current = res.product?.productThumb || "";
          setThumbLocal(null);
          setThumbPreview(res.product?.productThumb || "");

          // điều hướng cùng logic cũ
          navigate(`/${path.SELLER}/${current._id}/${path.S_CREATE_PRODUCT}`, {
            state: { product: res.product },
          });
        } else if (res.product?._id) {
          // cập nhật productForVar nếu đã có
          setProductForVar(res.product);

          // cập nhật lại thumbnail gốc
          thumbOriginalRef.current = res.product?.productThumb || "";
          setThumbLocal(null);
          setThumbPreview(res.product?.productThumb || "");
        }
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res?.message,
            variant: "danger",
          })
        );
      }
    } catch (err) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: String(err),
          variant: "danger",
        })
      );
    }
  };

  const handleRequestCreateBrand = () => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <CreateBrandForm
            shopId={current._id}
            brand={null}
            onCancel={() => dispatch(showModal({ isShowModal: false }))}
            onSuccess={() => {
              dispatch(showModal({ isShowModal: false }));
            }}
          />
        ),
      })
    );
  };

  const tabCss =
    "flex-1 py-1 px-2 transition-all duration-200 rounded-2xl hover:bg-gray-200";
  const labelInput = "px-2 text-sm";
  const InputCss = "border rounded-xl px-3 py-2 text-base";
  const previewContent = "w-full md:w-[300px] h-auto";

  return (
    <div className="flex flex-col gap-4">
      {/* CẢNH BÁO TRẠNG THÁI */}
      {isShopBlocked && (
        <div className="flex gap-2 justify-center items-center border border-red-400 bg-red-50 text-xs md:text-sm rounded-3xl px-3 py-2">
          <AiOutlineExclamationCircle size={16} className="text-red-500" />
          <span className="font-medium">
            Shop đang bị khóa. Mọi thao tác đều bị chặn.
          </span>
        </div>
      )}
      {!isShopBlocked &&
        (!servicePlan || servicePlan.subStatus !== "active") && (
          <div className="flex gap-2 justify-center items-center border border-yellow-400 bg-yellow-50 text-xs md:text-sm rounded-3xl px-3 py-2">
            <AiOutlineExclamationCircle size={16} className="text-yellow-500" />
            <span className="font-medium">
              Shop chưa có gói dịch vụ hoặc gói đã hết hạn/bị hủy. Mọi thao tác
              đều bị chặn.
            </span>
          </div>
        )}
      {isCreateLimited && (
        <div className="flex gap-2 justify-center items-center border border-orange-400 bg-orange-50 text-xs md:text-sm rounded-3xl px-3 py-2">
          <AiOutlineExclamationCircle size={16} className="text-orange-500" />
          <span className="font-medium">
            Đã đạt giới hạn {MAX_PRODUCTS} sản phẩm theo gói hiện tại. Vui lòng
            nâng cấp gói hoặc xóa bớt sản phẩm để tạo mới.
          </span>
        </div>
      )}
      {isNoAddress && (
        <div className="flex gap-2 justify-center items-center border border-orange-400 bg-orange-50 text-xs md:text-sm rounded-3xl px-3 py-2">
          <AiOutlineExclamationCircle size={16} className="text-orange-500" />
          <span className="font-medium">
            Không có địa chỉ giao hàng. Vui lòng thêm địa chỉ để tạo mới sản
            phẩm
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-button-hv text-black rounded-3xl p-1 border flex overflow-hidden">
        <button
          className={`${tabCss} ${
            activeTab === "product"
              ? "bg-white font-bold text-button-bg-ac"
              : ""
          }`}
          onClick={() => setActiveTab("product")}
        >
          1. Sản phẩm
        </button>
        <button
          className={`${tabCss} ${
            activeTab === "variation"
              ? "bg-white font-bold text-button-bg-ac"
              : ""
          }`}
          onClick={() => setActiveTab("variation")}
          disabled={!productForVar?._id}
        >
          2. Biến thể
        </button>
      </div>

      {/* TAB SẢN PHẨM */}
      {activeTab === "product" && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h2 className="font-bold px-2 text-black">
              {isEditing ? "Chỉnh sửa sản phẩm" : `Tạo sản phẩm mới `}
            </h2>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-3xl border shadow p-4 md:p-6"
            onSubmit={handleSubmitProduct(onSubmitProduct)}
          >
            {/* Tên sản phẩm */}
            <div className="flex flex-col gap-1 col-span-2">
              <div>
                <label className={labelInput}>
                  Nhập tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <div className="px-2 text-[11px] text-gray-500 p-1">
                  Cấu trúc tối ưu: **[Loại Sản Phẩm Chính] [Thương Hiệu] [Tên
                  Model/Series] [Thông số Phụ]**
                </div>
              </div>

              <input
                className={`${InputCss} ${
                  productErrors.productName ? "border-red-500" : ""
                }`}
                {...registerProduct("productName", {
                  required: "Bạn phải nhập tên sản phẩm",
                })}
                placeholder="VD: Điện thoại iPhone 16 Pro Max 256GB Titan Đen"
                disabled={isProductSubmitDisabled}
              />
              {productErrors.productName && (
                <p className="px-2 text-[11px] text-red-500">
                  {productErrors.productName.message}
                </p>
              )}
            </div>

            {/* Mô tả nhanh */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className={labelInput}>Mô tả nhanh</label>
              <textarea
                className={`${InputCss}`}
                {...registerProduct("productDescription")}
                placeholder="vd. Pro tối thượng"
                disabled={isProductSubmitDisabled}
                rows={3}
              />
            </div>

            {/* Thương hiệu */}
            <div className="flex flex-col gap-1">
              <label className={labelInput}>Thương hiệu</label>
              <select
                className={`${InputCss}`}
                {...registerProduct("brandId")}
                disabled={isProductSubmitDisabled}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "ADD_NEW_BRAND") {
                    e.target.value = "";
                    handleRequestCreateBrand();
                  }
                }}
              >
                <option value="">Chọn thương hiệu</option>

                {/* Danh sách thương hiệu thật */}
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.brandName}
                  </option>
                ))}
                <option
                  value="ADD_NEW_BRAND"
                  className="font-medium text-blue-600 bg-blue-50"
                >
                  Thêm thương hiệu mới
                </option>
              </select>
            </div>

            {/* Danh mục sản phẩm */}
            <div className="flex flex-col gap-1">
              <label className={labelInput}>
                Danh mục sản phẩm <span className="text-red-500">*</span>
              </label>
              <select
                className={`${InputCss} ${
                  productErrors.categoryId ? "border-red-500" : ""
                }`}
                {...registerProduct("categoryId", {
                  required: "Bạn phải chọn danh mục sản phẩm",
                })}
                disabled={isProductSubmitDisabled}
              >
                <option value="">Chọn danh mục chung</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
              {productErrors.categoryId && (
                <p className="px-2 text-[11px] text-red-500">
                  {productErrors.categoryId.message}
                </p>
              )}
            </div>

            {/* Danh mục shop */}
            <div className="flex flex-col gap-1">
              <label className={labelInput}>Danh mục shop</label>

              <select
                className={`${InputCss}`}
                {...registerProduct("categoryShopId")}
                disabled={isProductSubmitDisabled}
                onChange={(e) => {
                  const value = e.target.value;
                  // Khi người dùng chọn dòng "Thêm danh mục mới"
                  if (value === "ADD_NEW_CATEGORY_SHOP") {
                    e.target.value = "";
                    navigate(
                      `/${path.SELLER}/${current._id}/${path.S_MANAGE_CATEGORIES}`
                    );
                  }
                }}
              >
                <option value="">Chọn danh mục shop</option>
                {categoryShops.map((cs) => (
                  <option key={cs._id} value={cs._id}>
                    {cs.csName || cs.categoryShopName}
                  </option>
                ))}

                {/* Dòng đặc biệt: Thêm danh mục mới */}
                <option
                  value="ADD_NEW_CATEGORY_SHOP"
                  className="font-medium text-blue-600 bg-blue-50"
                >
                  Thêm danh mục shop mới
                </option>
              </select>
            </div>

            {/* Giảm giá */}
            <div className="flex flex-col  gap-1">
              <label className={labelInput}>Giảm giá | sale % (nếu có)</label>
              <input
                type="number"
                className={`${InputCss}`}
                {...registerProduct("productDiscountPercent")}
                placeholder="vd. 10"
                disabled={isProductSubmitDisabled}
              />
            </div>

            {/* Chủ đề sản phẩm */}
            <div className="flex flex-col gap-2 col-span-2">
              <label className={labelInput}>Chủ đề sản phẩm (chọn nhiều)</label>
              <div
                className={`flex flex-wrap gap-2 p-3 border rounded-xl ${
                  isProductSubmitDisabled ? "bg-gray-100" : "bg-white"
                }`}
              >
                {themes.length > 0 ? (
                  themes.map((t) => {
                    const isSelected = selectedThemeIds.includes(String(t._id));
                    return (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => handleSelectTheme(t._id)}
                        disabled={isProductSubmitDisabled}
                        className={`
                        
                                          px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200 text-black
                                          ${
                                            isSelected
                                              ? "  border-button-bg-ac shadow-md scale-105 text-button-bg-ac"
                                              : " hover:bg-blue-50 hover:border-blue-300"
                                          }
                                          ${
                                            isProductSubmitDisabled
                                              ? "opacity-70 cursor-not-allowed"
                                              : ""
                                          }
                                      `}
                      >
                        {t.themeName}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm">Không có chủ đề nào.</p>
                )}
              </div>
            </div>

            {/* Thumbnail sản phẩm kiểu background */}
            <div className="flex flex-col gap-1 col-span-2">
              <label className={labelInput}>Ảnh Thumbnail sản phẩm</label>
              <div className="bg-white rounded-3xl border p-2 md:p-4">
                <ImageUploader
                  multiple={false}
                  value={thumbLocal} // File | null
                  previews={thumbPreview} // string | null
                  onChange={(file) => {
                    // Xử lý khi người dùng chọn ảnh mới
                    if (file) {
                      if (thumbPreview?.startsWith("blob:")) {
                        URL.revokeObjectURL(thumbPreview);
                      }
                      const blobUrl = URL.createObjectURL(file);
                      setThumbLocal(file);
                      setThumbPreview(blobUrl);
                    } else {
                      // Xóa ảnh
                      if (thumbPreview?.startsWith("blob:")) {
                        URL.revokeObjectURL(thumbPreview);
                      }
                      setThumbLocal(null);
                      setThumbPreview("");
                    }
                  }}
                  label="thumbnail"
                  // Không có disabled → vẫn hoạt động bình thường
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    className="px-4 py-1 rounded-3xl bg-gray-200 hover:bg-gray-300 text-sm"
                    onClick={undoProductThumb}
                    disabled={!thumbDirty || isProductSubmitDisabled}
                  >
                    Hoàn tác ảnh
                  </button>
                </div>
              </div>
            </div>

            {/* Render block items */}
            <div className="col-span-2 flex flex-col gap-1">
              <label className={labelInput}>Thông tin sản phẩm</label>
              <div className=" bg-white rounded-3xl border p-2 md:p-4 flex flex-col gap-2">
                {blocks.length === 0 ? (
                  <div className="text-center text-xs text-gray-500 italic">
                    Chưa có nội dung mô tả chi tiết
                  </div>
                ) : (
                  <ul className="flex flex-col gap-4 text-sm">
                    {blocks
                      .slice()
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((b, idx) => (
                        <li
                          key={idx}
                          className="border rounded-xl px-3 py-2 flex flex-col gap-1 bg-gray-50"
                        >
                          <div className="text-[11px] text-gray-500 flex justify-between">
                            <span className="font-medium">
                              #{idx + 1} • {b.type}
                            </span>
                            <span>order: {b.order ?? idx}</span>
                          </div>

                          {b.type === "text" && (
                            <div className="text-sm text-black whitespace-pre-line">
                              {b.content}
                            </div>
                          )}

                          {b.type === "image" && (
                            <div className="text-sm flex flex-col items-center">
                              <div className={`${previewContent}`}>
                                <img
                                  src={b.previewUrl || b.url}
                                  alt={b.alt || "image"}
                                  className="max-w-full rounded-2xl object-contain shadow-sm"
                                />
                              </div>

                              <p className="text-sm text-black mt-1">
                                {b.content}
                              </p>
                            </div>
                          )}

                          {b.type === "video" && (
                            <div className="text-sm flex flex-col items-center justify-center">
                              <div className={`${previewContent}`}>
                                <video
                                  src={b.url}
                                  controls
                                  className="max-w-full rounded-xl shadow-md"
                                />
                              </div>

                              {b.content && (
                                <p className="text-sm text-black mt-1">
                                  {b.content}
                                </p>
                              )}
                            </div>
                          )}

                          {b.type === "videoUrl" &&
                            (() => {
                              const id = getYouTubeEmbed(b.url);
                              if (!id) return null;
                              const embed = `https://www.youtube.com/embed/${id}`;
                              return (
                                <div
                                  className={`text-sm flex flex-col items-center justify-center`}
                                >
                                  <div
                                    className={`aspect-video rounded-xl overflow-hidden shadow ${previewContent}`}
                                  >
                                    <iframe
                                      src={embed}
                                      title={b.content || "YouTube video"}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      className="w-full h-full"
                                      loading="lazy"
                                    />
                                  </div>
                                  {b.content && (
                                    <p className="text-sm mt-1">{b.content}</p>
                                  )}
                                </div>
                              );
                            })()}

                          {/* nút xoá block */}
                          <button
                            type="button"
                            className="self-end text-xs text-red-600 hover:text-red-800 underline disabled:opacity-50"
                            onClick={() => {
                              const blockToDelete = blocks[idx];

                              if (
                                (blockToDelete.type === "image" ||
                                  blockToDelete.type === "video") &&
                                blockToDelete.previewUrl?.startsWith("blob:")
                              ) {
                                URL.revokeObjectURL(blockToDelete.previewUrl);
                              } // 2. XÓA BLOCK VÀ SẮP XẾP LẠI ORDER

                              setBlocks((oldBlocks) => {
                                const nextBlocks = oldBlocks.filter(
                                  (_, i) => i !== idx
                                ); // Sắp xếp lại order cho các block còn lại

                                return nextBlocks.map((nb, newOrder) => ({
                                  ...nb,
                                  order: newOrder,
                                }));
                              }); // 3. ĐỒNG BỘ XÓA FILE KHỎI blockFiles

                              if (
                                blockToDelete.type === "image" ||
                                blockToDelete.type === "video"
                              ) {
                                // Chỉ cập nhật blockFiles nếu block bị xóa là block media MỚI (có file local)
                                if (
                                  blockToDelete.previewUrl?.startsWith("blob:")
                                ) {
                                  setBlockFiles((oldFiles) => {
                                    // Tìm vị trí tương đối của file bị xóa trong mảng oldFiles
                                    let mediaFileIndex = -1;
                                    let fileCounter = 0; // Lặp qua tất cả blocks để tìm vị trí index của blockToDelete
                                    for (let i = 0; i < blocks.length; i++) {
                                      const isMedia =
                                        blocks[i].type === "image" ||
                                        blocks[i].type === "video";
                                      const isLocalFile =
                                        blocks[i].previewUrl?.startsWith(
                                          "blob:"
                                        );
                                      if (isMedia && isLocalFile) {
                                        if (i === idx) {
                                          mediaFileIndex = fileCounter;
                                          break;
                                        }
                                        fileCounter++;
                                      }
                                    }

                                    if (mediaFileIndex !== -1) {
                                      // Xóa file tại vị trí tìm được
                                      return oldFiles.filter(
                                        (_, fileIdx) =>
                                          fileIdx !== mediaFileIndex
                                      );
                                    }
                                    return oldFiles;
                                  });
                                }
                              }
                            }}
                            disabled={isProductSubmitDisabled}
                          >
                            Xoá
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex justify-center items-center col-span-2">
              <button
                type="button"
                className="align-end px-2 py-1  rounded-3xl bg-button-bg hover:bg-button-hv text-black text-xs disabled:opacity-50"
                onClick={openBlockCreatorModal}
                disabled={isProductSubmitDisabled}
              >
                + Thêm khối nội dung
              </button>
            </div>

            {/* Buttons submit / hoàn tác form sản phẩm */}
            <div className="md:col-span-2 flex justify-end gap-2 ">
              <button
                type="button"
                className="px-4 py-1 rounded-3xl bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-50"
                onClick={handleResetProductForm}
                disabled={isProductSubmitDisabled}
              >
                Hoàn tác toàn bộ
              </button>
              <button
                disabled={isSubmittingProduct || isProductSubmitDisabled}
                className="bg-button-bg-ac hover:bg-button-bg-hv text-white text-sm font-medium rounded-3xl px-4 py-1 disabled:opacity-50"
                title={
                  isShopBlocked
                    ? "Shop đang bị khóa"
                    : !servicePlan || servicePlan.subStatus !== "active"
                    ? "Gói dịch vụ không hợp lệ"
                    : isCreateLimited
                    ? `Đã đạt giới hạn ${MAX_PRODUCTS} sản phẩm`
                    : isEditing
                    ? "Lưu thay đổi"
                    : "Tạo sản phẩm"
                }
              >
                {isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB BIẾN THỂ */}
      {activeTab === "variation" && initialVariationsLoaded && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start px-2">
            <h2 className="font-bold px-2 text-black">Biến thể sản phẩm</h2>
            <button
              type="button"
              disabled={isOperationDisabled} // Áp dụng cho tạo biến thể mới
              className="px-3 py-1 rounded-2xl bg-button-bg-ac hover:bg-button-bg-hv text-white disabled:opacity-50"
              onClick={() => {
                prepend(
                  {
                    _id: null,
                    pvName: "",
                    pvOriginalPrice: "",
                    pvPrice: "",
                    pvStockQuantity: "",
                    pvImagesList: [],
                  },
                  { shouldFocus: false }
                );
              }}
              title={
                isOperationDisabled
                  ? "Gói dịch vụ không hợp lệ hoặc shop bị khóa"
                  : "Thêm biến thể"
              }
            >
              Thêm biến thể
            </button>
          </div>

          {!productForVar?._id && (
            <div className="flex gap-2 justify-center items-center border border-yellow-400 bg-yellow-50 text-xs md:text-sm rounded-3xl px-2 py-1 ">
              <AiOutlineExclamationCircle
                size={16}
                className="text-yellow-500"
              />
              <span>Hãy tạo sản phẩm trước khi thêm biến thể</span>
            </div>
          )}

          {fields.map((field, idx) => {
            const currentVar = watchVarList(`variations.${idx}`);
            const pvImagesList = currentVar?.pvImagesList || [];

            // Lấy giá trị pvPrice (đã được formatMoney loại bỏ)
            const pvPriceValue = Number(currentVar.pvPrice) || 0;
            const discountPercent = Number(productDiscountPercent) || 0;
            const isVarOnSale = discountPercent > 0;
            const finalPrice = calculateFinalPrice(
              pvPriceValue,
              discountPercent
            );

            return (
              <div
                key={field.id}
                className="bg-white rounded-3xl border shadow p-4 md:p-6 flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="text-sm font-medium text-gray-700">
                    Biến thể #{idx + 1}
                    {currentVar._id && (
                      <span className="text-xs text-gray-500 ml-2">
                        ID: {currentVar._id}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tên biến thể */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className={`${labelInput}`}>
                      Tên biến thể <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name={`variations.${idx}.pvName`}
                      rules={{ required: "Tên biến thể là bắt buộc" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          ref={(el) => (variationNameRefs.current[idx] = el)}
                          className={`${InputCss} ${
                            varErrors.variations?.[idx]?.pvName
                              ? "border-red-500"
                              : ""
                          }`}
                          placeholder="vd. Xanh đậm, Bạc, Cam vũ trụ..."
                          disabled={isOperationDisabled}
                        />
                      )}
                    />
                    {varErrors.variations?.[idx]?.pvName && (
                      <p className="px-2 text-[11px] text-red-500">
                        {varErrors.variations[idx].pvName.message}
                      </p>
                    )}
                  </div>

                  {/* Kho */}
                  <div className="flex flex-col gap-1">
                    <label className={`${labelInput}`}>
                      Kho biến thể <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name={`variations.${idx}.pvStockQuantity`}
                      rules={{
                        required: "Kho là bắt buộc",
                        min: { value: 0, message: "Kho không được âm" },
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          className={`${InputCss} ${
                            varErrors.variations?.[idx]?.pvStockQuantity
                              ? "border-red-500"
                              : ""
                          }`}
                          placeholder="vd. 10"
                          disabled={isOperationDisabled}
                        />
                      )}
                    />
                    {varErrors.variations?.[idx]?.pvStockQuantity && (
                      <p className="px-2 text-[11px] text-red-500">
                        {varErrors.variations[idx].pvStockQuantity.message}
                      </p>
                    )}
                  </div>

                  {/* Giá gốc */}
                  <div className="flex flex-col gap-1">
                    <label className={`${labelInput}`}>
                      Giá gốc (đ) <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name={`variations.${idx}.pvOriginalPrice`}
                      rules={{
                        required: "Giá gốc là bắt buộc",
                        min: { value: 0, message: "Giá không được âm" },
                      }}
                      render={({ field: { value, onChange } }) => (
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`${InputCss} ${
                            varErrors.variations?.[idx]?.pvOriginalPrice
                              ? "border-red-500"
                              : ""
                          }`}
                          value={formatMoney(value)}
                          onChange={(e) => handleMoneyChange(e, onChange)}
                          placeholder="vd. 39.900.000"
                          disabled={isOperationDisabled}
                        />
                      )}
                    />
                    {varErrors.variations?.[idx]?.pvOriginalPrice && (
                      <p className="px-2 text-[11px] text-red-500">
                        {varErrors.variations[idx].pvOriginalPrice.message}
                      </p>
                    )}
                  </div>

                  {/* Giá bán */}
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className={`${labelInput}`}>
                      Giá bán (đ) <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name={`variations.${idx}.pvPrice`}
                      rules={{
                        required: "Giá bán là bắt buộc",
                        min: { value: 0, message: "Giá không được âm" },
                      }}
                      render={({ field: { value, onChange } }) => (
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`${InputCss} ${
                            varErrors.variations?.[idx]?.pvPrice
                              ? "border-red-500"
                              : ""
                          }`}
                          value={formatMoney(value)}
                          onChange={(e) => handleMoneyChange(e, onChange)}
                          placeholder="vd. 38.900.000"
                          disabled={isOperationDisabled}
                        />
                      )}
                    />
                    {varErrors.variations?.[idx]?.pvPrice && (
                      <p className="px-2 text-[11px] text-red-500">
                        {varErrors.variations[idx].pvPrice.message}
                      </p>
                    )}
                    {/* Hiển thị giá cuối cùng của biến thể */}
                    {isVarOnSale && pvPriceValue > 0 && (
                      <div className="px-2 text-sm text-gray-700 mt-1 flex items-baseline gap-2">
                        <span className="text-red-500 font-bold">
                          GIÁ CUỐI: {formatMoney(finalPrice)}đ
                        </span>
                        <span className="text-xs text-gray-500">
                          (Sale {discountPercent}%)
                        </span>
                      </div>
                    )}
                    {isVarOnSale && pvPriceValue === 0 && (
                      <div className="px-2 text-xs text-gray-500 mt-1">
                        Vui lòng nhập Giá bán để tính Giá cuối cùng (Sale{" "}
                        {discountPercent}%)
                      </div>
                    )}
                  </div>
                </div>

                {/* Ảnh biến thể kiểu banner */}
                <div className="flex flex-col gap-1">
                  <label className={labelInput}>Ảnh biến thể</label>
                  <ImageUploader
                    multiple={true}
                    value={pvImagesList.map((img) => img.file)} // [File]
                    previews={pvImagesList.map((img) => img.preview)} // [string]
                    onChange={(newFiles) => {
                      // Xóa blob cũ
                      pvImagesList.forEach((img) => {
                        if (img.preview?.startsWith("blob:")) {
                          URL.revokeObjectURL(img.preview);
                        }
                      });

                      // Tạo blob mới
                      const newEntries = newFiles.map((file) => ({
                        file,
                        preview: URL.createObjectURL(file),
                      }));

                      setValueVarList(
                        `variations.${idx}.pvImagesList`,
                        newEntries,
                        {
                          shouldDirty: true,
                        }
                      );
                    }}
                    label="ảnh"
                  />
                </div>

                {/* Actions cho biến thể */}
                <div className="flex justify-end gap-2">
                  {/* Xoá biến thể */}
                  <button
                    type="button"
                    className="bg-button-bg hover:bg-button-hv text-black rounded-2xl px-4 py-1.5 disabled:opacity-50 text-sm font-medium"
                    onClick={() => {
                      if (currentVar._id) {
                        const id = nextAlertId();
                        registerHandlers(id, {
                          onConfirm: async () => {
                            try {
                              dispatch(
                                showModal({
                                  isShowModal: true,
                                  modalChildren: <Loading />,
                                })
                              );
                              const res = await apiDeleteProductVariation(
                                currentVar._id
                              );
                              dispatch(showModal({ isShowModal: false }));
                              if (res?.success) {
                                pvImagesList.forEach((imgObj) => {
                                  if (
                                    imgObj.preview &&
                                    imgObj.preview.startsWith("blob:")
                                  ) {
                                    URL.revokeObjectURL(imgObj.preview);
                                  }
                                });

                                remove(idx);
                                // Cập nhật lại productForVar sau khi xóa biến thể
                                setProductForVar((prev) => ({
                                  ...prev,
                                  variations: (prev?.variations || []).filter(
                                    (v) => v._id !== currentVar._id
                                  ),
                                }));
                                dispatch(
                                  showAlert({
                                    title: "Xóa thành công",
                                    message: "Biến thể đã được xóa.",
                                    variant: "success",
                                    duration: 1500,
                                    showConfirmButton: false,
                                  })
                                );
                              }
                            } catch (err) {
                              dispatch(
                                showAlert({
                                  title: "Lỗi",
                                  message: String(err),
                                  variant: "danger",
                                })
                              );
                            }
                          },
                        });

                        dispatch(
                          showAlert({
                            id,
                            title: "Xóa biến thể?",
                            message: `Bạn có chắc muốn xóa biến thể "${currentVar.pvName}"?`,
                            variant: "danger",
                            showCancelButton: true,
                            confirmText: "Xóa",
                            cancelText: "Hủy",
                          })
                        );
                      } else {
                        // biến thể local chưa tạo -> chỉ remove trong UI
                        pvImagesList.forEach((imgObj) => {
                          if (
                            imgObj.preview &&
                            imgObj.preview.startsWith("blob:")
                          ) {
                            URL.revokeObjectURL(imgObj.preview);
                          }
                        });
                        remove(idx);
                      }
                    }}
                    disabled={isOperationDisabled}
                    title={
                      isOperationDisabled
                        ? "Gói dịch vụ không hợp lệ hoặc shop bị khóa"
                        : "Xóa biến thể"
                    }
                  >
                    Xóa biến thể
                  </button>

                  {/* Lưu / cập nhật biến thể */}
                  <button
                    type="button"
                    disabled={
                      isSubmittingVarList ||
                      !productForVar?._id ||
                      isOperationDisabled
                    }
                    className="bg-button-bg-ac hover:bg-button-bg-hv text-white rounded-2xl px-4 py-1.5 disabled:opacity-50 text-sm font-medium"
                    onClick={() => submitOneVariation(idx)}
                    title={
                      !productForVar?._id
                        ? "Vui lòng lưu sản phẩm trước"
                        : isOperationDisabled
                        ? "Gói dịch vụ không hợp lệ hoặc shop bị khóa"
                        : currentVar._id
                        ? "Cập nhật biến thể"
                        : "Tạo biến thể"
                    }
                  >
                    {currentVar._id ? "Cập nhật biến thể" : "Tạo biến thể"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
