import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import {
  apiCreateProduct,
  apiUpdateProduct,
  apiCreateProductVariation,
  apiUpdateProductVariation,
  apiDeleteProductVariation,
  apiGetProductCategories,
  apiGetBrands,
} from "../../services/catalog.api";

import { apiGetShopCategories } from "../../services/shop.api";
import { Loading, CloseButton } from "../../components";
import { showAlert, showModal } from "store/app/appSlice";
import path from "ultils/path";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { formatMoney, handleMoneyChange } from "../../ultils/helpers";

// ===========================
// Helpers
// ===========================
const toNumberOrEmpty = (v) => (typeof v === "number" ? v : "");

// Giống fetchUrlAsFile trong ShopInformation:
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

export const CreateProduct = () => {
  const { state } = useLocation();
  const initialProduct = state?.product || null;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current } = useSelector((s) => s.seller);
  const isBlock = current?.shopStatus === "blocked";

  const fetchUrlAsFile = useFetchUrlAsFile();

  // =========================================================
  // OPTIONS (brand / category / categoryShop)
  // =========================================================
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryShops, setCategoryShops] = useState([]);

  useEffect(() => {
    const fetchOptions = async (shopId) => {
      try {
        const [resBrands, resCategories, resCategoryShops] = await Promise.all([
          apiGetBrands(),
          apiGetProductCategories(),
          apiGetShopCategories({ shopId }),
        ]);

        if (resBrands?.success) setBrands(resBrands.brands || []);
        if (resCategories?.success)
          setCategories(resCategories.categories || []);
        if (resCategoryShops?.success)
          setCategoryShops(resCategoryShops.categoryShops || []);
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

  // =========================================================
  // STATE / FORM SẢN PHẨM
  // =========================================================
  // productForVar: phiên bản "product hiện tại trên server"
  const [productForVar, setProductForVar] = useState(initialProduct || null);

  // tab
  const [activeTab, setActiveTab] = useState("product");
  const [thumbLocal, setThumbLocal] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(
    initialProduct?.productThumb || ""
  );
  const thumbOriginalRef = useRef(initialProduct?.productThumb || "");
  const productThumbInputRef = useRef(null);

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
  }, [brands, categories, categoryShops, initialProduct, setValueProduct]);

  const pickProductThumb = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    // clear blob cũ nếu có
    if (thumbPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(thumbPreview);
    }

    const blobUrl = URL.createObjectURL(file);
    setThumbLocal(file);
    setThumbPreview(blobUrl);
  };

  const clearProductThumb = () => {
    if (thumbPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(thumbPreview);
    }
    setThumbLocal(null);
    setThumbPreview(""); // nghĩa là muốn xoá thumbnail
  };

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
      // Map từ format server -> format FE dùng để gửi lại
      // (ở create mới thường sẽ rỗng nên branch này chủ yếu dùng cho edit)
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
  // Danh sách file thực tế cho block media mới (image/video)
  // thứ tự TRÙNG với thứ tự xuất hiện của các block có type image/video trong `blocks`
  const [blockFiles, setBlockFiles] = useState([]);

  // popup thêm block
  const [showBlockCreator, setShowBlockCreator] = useState(false);

  // form tạm để tạo block mới
  const [newBlockType, setNewBlockType] = useState("text"); // "text" | "image" | "video" | "videoUrl"
  const [draftText, setDraftText] = useState(""); // cho text.content
  const [draftImageCaption, setDraftImageCaption] = useState(""); // cho image/video .content
  const [draftImageAlt, setDraftImageAlt] = useState(""); // cho image/video .alt
  const [draftMediaFile, setDraftMediaFile] = useState(null); // cho image/video file
  const [draftVideoUrl, setDraftVideoUrl] = useState(""); // cho videoUrl.url
  const [draftVideoUrlDesc, setDraftVideoUrlDesc] = useState(""); // cho videoUrl.content

  const handleAddBlock = () => {
    const order = blocks.length; // block mới sẽ đứng cuối
    let newBlock = null;
    let newBlockFiles = [...blockFiles];

    if (newBlockType === "text") {
      newBlock = {
        type: "text",
        content: draftText.trim(),
        order,
      };
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

      newBlockFiles.push(draftMediaFile);
    } else if (newBlockType === "videoUrl") {
      newBlock = {
        type: "videoUrl",
        url: draftVideoUrl.trim(),
        content: draftVideoUrlDesc.trim(),
        order,
      };
    } else {
      // fallback
      return;
    }

    setBlocks((prev) => [...prev, newBlock]);
    setBlockFiles(newBlockFiles);

    // clear draft, đóng popup
    setDraftText("");
    setDraftImageCaption("");
    setDraftImageAlt("");
    setDraftMediaFile(null);
    setDraftVideoUrl("");
    setDraftVideoUrlDesc("");
    setNewBlockType("text");
    setShowBlockCreator(false);
  };

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

    // gọi async ngay lập tức
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

  // thêm ảnh mới vào pvImagesList ở index idx
  const addImagesToVariation = (idx, fileList) => {
    if (!fileList || !fileList.length) return;
    const imgs = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!imgs.length) return;

    const curr = watchVarList(`variations.${idx}.pvImagesList`) || [];
    const newEntries = imgs.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setValueVarList(
      `variations.${idx}.pvImagesList`,
      [...curr, ...newEntries],
      {
        shouldDirty: true,
      }
    );
  };

  // xóa 1 ảnh trong pvImagesList ở index idx
  const removeImageFromVariation = (idx, imgIdx) => {
    const curr = watchVarList(`variations.${idx}.pvImagesList`) || [];
    const target = curr[imgIdx];
    if (target?.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(target.preview);
    }
    const filtered = curr.filter((_, i) => i !== imgIdx);
    setValueVarList(`variations.${idx}.pvImagesList`, filtered, {
      shouldDirty: true,
    });
  };

  const handleDropImagesAtIndex = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    addImagesToVariation(idx, e.dataTransfer.files);
  };

  const handleDragOverVar = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // =========================
  // SUBMIT MỘT BIẾN THỂ
  // Gửi toàn bộ state biến thể đó
  // =========================
  const submitOneVariation = async (idx) => {
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

        // backend trả variation mới -> đồng bộ lại form (bao gồm danh sách ảnh từ server)
        if (res.variation) {
          // rebuild lại từ server (giống load lần đầu)
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

  // =========================
  // SUBMIT SẢN PHẨM
  // Gửi full form sản phẩm + trạng thái thumbnail hiện tại
  // =========================
  const onSubmitProduct = async (data) => {
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

      // Product Thumbnail:
      // - Nếu có thumbLocal => append file
      // - Nếu không thumbLocal nhưng thumbPreview === "" => append "" để clear
      if (thumbLocal) {
        fd.append("productThumb", thumbLocal);
      } else if (thumbPreview === "") {
        // user đã xoá thumb
        fd.append("productThumb", "");
      }
      // Nếu thumbPreview === URL gốc thì không append gì -> giữ nguyên

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

  // =========================================================
  // RENDER
  // =========================================================

  const tabCss =
    "flex-1 py-1 px-2 transition-all duration-200 rounded-2xl hover:bg-gray-200";
  const labelInput = "px-2 text-sm";
  const InputCss = "border rounded-xl px-3 py-2 text-base";
  const previewContent = "w-full md:w-[300px] h-auto";

  return (
    <div className="flex flex-col gap-4">
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
        >
          2. Biến thể
        </button>
      </div>

      {/* TAB SẢN PHẨM */}
      {activeTab === "product" && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h2 className="font-bold px-2 text-black">
              {productForVar?._id ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
            </h2>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-3xl border shadow p-4 md:p-6"
            onSubmit={handleSubmitProduct(onSubmitProduct)}
          >
            {/* Tên sản phẩm */}
            <div className="flex flex-col gap-1 col-span-2">
              <label className={labelInput}>Nhập tên sản phẩm</label>
              <input
                className={`${InputCss} ${
                  productErrors.productName ? "border-red-500" : ""
                }`}
                {...registerProduct("productName", {
                  required: "Bạn phải nhập tên sản phẩm",
                })}
                placeholder="vd. iPhone 17 Pro Max 256GB"
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
              <input
                className={`${InputCss}`}
                {...registerProduct("productDescription")}
                placeholder="vd. Pro tối thượng"
              />
            </div>

            {/* Thương hiệu */}
            <div className="flex flex-col gap-1">
              <label className={labelInput}>Thương hiệu</label>
              <select className={`${InputCss}`} {...registerProduct("brandId")}>
                <option value="">Chọn thương hiệu</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.brandName}
                  </option>
                ))}
              </select>
            </div>

            {/* Danh mục sản phẩm */}
            <div className="flex flex-col gap-1">
              <label className={labelInput}>Danh mục sản phẩm</label>
              <select
                className={`${InputCss} ${
                  productErrors.categoryId ? "border-red-500" : ""
                }`}
                {...registerProduct("categoryId", {
                  required: "Bạn phải chọn danh mục sản phẩm",
                })}
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
              >
                <option value="">Chọn danh mục shop</option>
                {categoryShops.map((cs) => (
                  <option key={cs._id} value={cs._id}>
                    {cs.csName || cs.categoryShopName}
                  </option>
                ))}
              </select>
            </div>

            {/* Giảm giá */}
            <div className="flex flex-col gap-1">
              <label className={labelInput}>Giảm giá | sale % (nếu có)</label>
              <input
                type="number"
                className={`${InputCss}`}
                {...registerProduct("productDiscountPercent")}
                placeholder="vd. 10"
              />
            </div>

            {/* Thumbnail sản phẩm kiểu background */}
            <div className="flex flex-col gap-1 col-span-2">
              <label className={labelInput}>Ảnh Thumbnail sản phẩm</label>
              <div className="bg-white rounded-3xl border p-2 md:p-4">
                <div
                  onClick={() => productThumbInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file?.type.startsWith("image/")) {
                      pickProductThumb(file);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="flex flex-col border-2 border-dashed rounded-xl p-4 text-center transition cursor-pointer hover:bg-gray-50 relative"
                >
                  {thumbPreview ? (
                    <div className="mx-auto relative w-[300px] h-full text-sm flex items-center justify-center">
                      <img
                        src={thumbPreview}
                        alt="preview-thumb"
                        className="border rounded-xl w-full h-full object-cover"
                      />
                      <CloseButton
                        className="absolute top-2 right-2 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearProductThumb();
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mx-auto w-[120px] h-[120px] border rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                      Ảnh sản phẩm
                    </div>
                  )}

                  <p className="text-center text-sm text-blue-600 mt-1">
                    Kéo thả ảnh vào đây hoặc
                    <span
                      className="underline cursor-pointer ml-1 text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        productThumbInputRef.current?.click();
                      }}
                    >
                      chọn file
                    </span>
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    ref={productThumbInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type.startsWith("image/")) {
                        pickProductThumb(file);
                      }
                      e.target.value = "";
                    }}
                  />
                </div>

                {/* nút hoàn tác thumbnail */}
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    className="px-4 py-1 rounded-3xl bg-gray-200 hover:bg-gray-300 text-sm"
                    onClick={undoProductThumb}
                    disabled={!thumbDirty}
                  >
                    Hoàn tác ảnh
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className={labelInput}>Thông tin sản phẩm</label>
              <div className=" bg-white rounded-3xl border p-2 md:p-4 flex flex-col gap-2">
                <div className="flex justify-end items-center">
                  <button
                    type="button"
                    className="align-end px-4 py-1  rounded-3xl bg-button-bg hover:bg-button-hv text-black text-xs md:text-sm"
                    onClick={() => setShowBlockCreator(true)}
                  >
                    Thêm khối nội dung
                  </button>
                </div>

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
                            className="self-end text-xs text-red-600 hover:text-red-800 underline"
                            onClick={() => {
                              // Khi xoá block, ta phải:
                              // - xoá block khỏi `blocks`
                              // - nếu block đó là image/video, xoá file tương ứng khỏi blockFiles
                              const blockToDelete = blocks[idx];

                              if (
                                blockToDelete.type === "image" ||
                                blockToDelete.type === "video"
                              ) {
                                setBlocks((old) => {
                                  const next = old.filter((_, i) => i !== idx);

                                  next.forEach((blk, i2) => {
                                    if (
                                      blk.type === "image" ||
                                      blk.type === "video"
                                    ) {
                                    }
                                  });

                                  return next.map((nb, newOrder) => ({
                                    ...nb,
                                    order: newOrder,
                                  }));
                                });
                              } else {
                                // block text / videoUrl -> chỉ cần xoá block thôi
                                setBlocks((old) => {
                                  const next = old.filter((_, i) => i !== idx);
                                  return next.map((nb, newOrder) => ({
                                    ...nb,
                                    order: newOrder,
                                  }));
                                });
                              }
                            }}
                          >
                            Xoá
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

            {showBlockCreator && (
              <div
                className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={() => setShowBlockCreator(false)}
              >
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
                  <CloseButton
                    onClick={() => {
                      setShowBlockCreator(false);
                    }}
                    className="absolute top-2 right-2"
                  />

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
                        <input
                          type="file"
                          accept={
                            newBlockType === "image" ? "image/*" : "video/*"
                          }
                          className="text-xs"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setDraftMediaFile(f);
                            }
                          }}
                        />
                        {draftMediaFile && (
                          <p className="text-[11px] text-gray-600 mt-1 break-all">
                            {draftMediaFile.name}
                          </p>
                        )}
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
                      className="px-4 py-1  bg-gray-200 rounded-3xl hover:bg-gray-300 text-sm"
                      onClick={() => {
                        setShowBlockCreator(false);
                      }}
                    >
                      Hủy
                    </button>

                    <button
                      type="button"
                      className="px-4 py-1  bg-button-bg-ac hover:bg-button-bg-hv text-white rounded-3xl text-sm"
                      onClick={handleAddBlock}
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons submit / hoàn tác form sản phẩm */}
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-1 rounded-3xl bg-gray-200 hover:bg-gray-300 text-sm"
                onClick={handleResetProductForm}
              >
                Hoàn tác toàn bộ
              </button>
              <button
                disabled={isSubmittingProduct || isBlock}
                className="bg-button-bg-ac hover:bg-button-bg-hv text-white text-sm font-medium rounded-3xl px-4 py-1 disabled:opacity-50"
              >
                {productForVar?._id ? "Lưu thay đổi" : "Tạo sản phẩm"}
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
              disabled={isBlock}
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
                    <label className={`${labelInput}`}>Tên biến thể</label>
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
                    <label className={`${labelInput}`}>Kho biến thể</label>
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
                  {/* Giá gốc */}
                  <div className="flex flex-col gap-1">
                    <label className={`${labelInput}`}>Giá gốc</label>
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
                    <label className={`${labelInput}`}>Giá bán</label>
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
                        />
                      )}
                    />
                    {varErrors.variations?.[idx]?.pvPrice && (
                      <p className="px-2 text-[11px] text-red-500">
                        {varErrors.variations[idx].pvPrice.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ảnh biến thể kiểu banner */}
                <div className="flex flex-col gap-1">
                  <label className={`${labelInput}`}>Ảnh biến thể</label>

                  <div
                    className="flex-1 border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer hover:bg-gray-50"
                    onDrop={(e) => handleDropImagesAtIndex(e, idx)}
                    onDragOver={handleDragOverVar}
                    onClick={() =>
                      document.getElementById(`var-images-${idx}`)?.click()
                    }
                  >
                    <div className="flex flex-wrap gap-3 justify-center">
                      {pvImagesList.length > 0 ? (
                        pvImagesList.map((imgObj, pIdx) => (
                          <div
                            key={pIdx}
                            className="relative w-[120px] h-[120px] border rounded-xl overflow-hidden"
                          >
                            <img
                              src={imgObj.preview}
                              alt={`pv-${idx}-${pIdx}`}
                              className="w-full h-full object-cover"
                            />
                            <CloseButton
                              className="absolute top-1 right-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImageFromVariation(idx, pIdx);
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-wrap gap-3 justify-center">
                          {[...Array(2)].map((_, i) => (
                            <div
                              key={i}
                              className="w-[120px] h-[120px] border rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-xs"
                            >
                              Ảnh sản phẩm
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-center text-sm text-blue-600 mt-4">
                      Kéo thả ảnh vào đây hoặc{" "}
                      <span className="underline cursor-pointer">
                        chọn file
                      </span>
                    </p>

                    <input
                      id={`var-images-${idx}`}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        addImagesToVariation(idx, e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </div>
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
                                dispatch(
                                  showAlert({
                                    title: "Xóa thành công",
                                    message: "Biến thể đã được xóa.",
                                    variant: "success",
                                    duration: 1500,
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
                  >
                    Xóa biến thể
                  </button>

                  {/* Lưu / cập nhật biến thể */}
                  <button
                    type="button"
                    disabled={isSubmittingVarList || !productForVar?._id}
                    className="bg-button-bg-ac hover:bg-button-bg-hv text-white rounded-2xl px-4 py-1.5 disabled:opacity-50 text-sm font-medium"
                    onClick={() => submitOneVariation(idx)}
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
