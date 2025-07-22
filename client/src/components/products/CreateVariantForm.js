import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { InputForm, Button, Loading, SpecificationSelector } from "components";
import { toast } from "react-toastify";
import { getBase64 } from "ultils/helpers";
import {
  apiCreateProductVariation,
  apiUpdateProductVariation,
  apiCreateValueOfSpec,
  apiGetSpecifications,
  apiGetValuesByVariationId,
  apiGetAllCoupons,
  apiCreateCouponProductVariation,
} from "apis";
import { useDispatch } from "react-redux";
import { showModal } from "store/app/appSlice";

const CreateVariantForm = ({ productId, editVariant, onDone }) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm();

  //const stockQuantity = useWatch({ control, name: "stockQuantity" });

  const [previews, setPreviews] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [specValues, setSpecValues] = useState({});
  const [selectedSpecIds, setSelectedSpecIds] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState("");

  useEffect(() => {
    apiGetAllCoupons().then((res) => {
      if (res.success) setCoupons(res.coupons);
    });

    apiGetSpecifications().then((res) => {
      if (res.success) setSpecifications(res.specifications);
    });
  }, []);

  useEffect(() => {
    const initEditData = async () => {
      if (editVariant) {
        setValue("productVariationName", editVariant.productVariationName);
        setValue("price", editVariant.price);
        setValue("stockQuantity", editVariant.stockQuantity);

        if (editVariant.images && Array.isArray(editVariant.images)) {
          const urls = editVariant.images
            .filter((img) => typeof img === "string" && img.startsWith("http"))
            .map((img) => img.trim());
          setOldImages(urls);
        }

        try {
          const res = await apiGetValuesByVariationId(editVariant._id);
          if (res.success) {
            const mapped = {};
            res.values.forEach((item) => {
              const specId = item.specificationTypeId._id;
              mapped[specId] = item.value;
            });
            setSpecValues(mapped);
            setSelectedSpecIds(Object.keys(mapped));
          }
        } catch (err) {
          toast.error("Không thể load thông số kỹ thuật");
        }
      } else {
        reset();
        setOldImages([]);
        setPreviews([]);
        setSpecValues({});
        setSelectedSpecIds([]);
        setSelectedCouponId("");
      }
    };
    initEditData();
  }, [editVariant, reset, setValue]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "images") {
        const files = value.images;
        if (files && files.length > 0) {
          const fileArray = Array.from(files);
          Promise.all(fileArray.map((file) => getBase64(file))).then(
            (base64s) => {
              setPreviews(base64s);
            }
          );
        } else {
          setPreviews([]);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleToggleSpec = (specId) => {
    setSelectedSpecIds((prev) =>
      prev.includes(specId)
        ? prev.filter((id) => id !== specId)
        : [...prev, specId]
    );
  };

  const handleChangeSpecValue = (specId, value) => {
    setSpecValues((prev) => ({
      ...prev,
      [specId]: value,
    }));
  };

  const handleRemoveSpec = (specId) => {
    setSelectedSpecIds((prev) => prev.filter((id) => id !== specId));
    setSpecValues((prev) => {
      const updated = { ...prev };
      delete updated[specId];
      return updated;
    });
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("productVariationName", data.productVariationName);
    formData.append("price", data.price);
    formData.append("stockQuantity", data.stockQuantity);
    if (!productId) {
      toast.error("Thiếu productId khi tạo biến thể!");
      return;
    }
    formData.append("productId", productId);

    if (data.images && data.images.length > 0) {
      for (let file of data.images) {
        formData.append("images", file);
      }
    }

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

    let res;
    if (editVariant) {
      res = await apiUpdateProductVariation(editVariant._id, formData);
    } else {
      res = await apiCreateProductVariation(formData);
    }

    dispatch(showModal({ isShowModal: false }));

    if (res.success) {
      toast.success(
        editVariant ? "Cập nhật thành công" : "Tạo biến thể thành công"
      );
      reset();
      setPreviews([]);
      setOldImages([]);

      const variationId = editVariant
        ? editVariant._id
        : res.createdVariation._id;

      const specPayload = Object.entries(specValues)
        .filter(([, value]) => value?.trim() !== "")
        .map(([specId, value]) => ({
          productVariationId: variationId,
          specificationTypeId: specId,
          value: value.trim(),
        }));

      try {
        await Promise.all(specPayload.map(apiCreateValueOfSpec));
        toast.success("Gắn thông số kỹ thuật thành công");
      } catch (err) {
        toast.error("Gắn thông số kỹ thuật thất bại");
      }

      if (selectedCouponId) {
        try {
          await apiCreateCouponProductVariation({
            variationId,
            couponId: selectedCouponId,
          });
          toast.success("Gắn khuyến mãi thành công");
        } catch (err) {
          toast.error("Không thể gắn khuyến mãi");
        }
      }

      onDone();
    } else {
      toast.error(res.message || "Lỗi khi xử lý biến thể");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-4 rounded shadow mb-8"
    >
      <h2 className="text-lg font-bold mb-4">
        {editVariant ? "✏️ Chỉnh sửa biến thể" : "➕ Tạo biến thể mới"}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <InputForm
          label="Tên biến thể"
          id="productVariationName"
          register={register}
          errors={errors}
          validate={{ required: "Không được để trống" }}
          placeholder="VD: Black 8/256"
        />
        <InputForm
          label="Giá bán"
          id="price"
          type="number"
          register={register}
          errors={errors}
          validate={{ required: "Không được để trống" }}
          placeholder="VD: 15000000"
        />
        {editVariant ? (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Số lượng kho
            </label>
            <input
              type="number"
              value={editVariant.stockQuantity}
              readOnly
              className="border border-gray-300 bg-gray-100 p-2 rounded-xl w-full text-sm cursor-not-allowed"
            />
            <p className="text-xs text-blue-500 mt-1">
              * Vào phần Serial để thay đổi số lượng
            </p>
          </div>
        ) : (
          <InputForm
            label="Số lượng kho"
            id="stockQuantity"
            type="number"
            register={register}
            errors={errors}
            validate={{ required: "Không được để trống" }}
            placeholder="VD: 3"
          />
        )}
      </div>

      {/* Thông số kỹ thuật */}
      <div className="mt-6">
        <SpecificationSelector
          specifications={specifications}
          selectedSpecIds={selectedSpecIds}
          specValues={specValues}
          onToggleSpec={handleToggleSpec}
          onChangeValue={handleChangeSpecValue}
          onRemoveSpec={handleRemoveSpec}
          title="Thông số kỹ thuật"
        />
      </div>

      {/* Khuyến mãi */}
      <div className="mt-6">
        <label className="text-sm font-medium mb-1 block">
          Chọn mã khuyến mãi
        </label>
        <select
          value={selectedCouponId}
          onChange={(e) => setSelectedCouponId(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full text-sm"
        >
          <option value="">-- Không áp dụng mã --</option>
          {coupons.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code} - Giảm {c.discount}% (HSD:{" "}
              {c.expiry ? new Date(c.expiry).toLocaleDateString() : "Không"})
            </option>
          ))}
        </select>
      </div>

      {/* Ảnh sản phẩm */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Ảnh sản phẩm</h3>
        <div>
          <input
            type="file"
            multiple
            accept="image/*"
            {...register("images", editVariant ? {} : { required: "Chọn ảnh" })}
          />
          {errors.images && (
            <p className="text-sm text-red-500">{errors.images.message}</p>
          )}
        </div>
        {(oldImages.length > 0 || previews.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {oldImages.map((src, idx) => (
              <img
                key={`old-${idx}`}
                src={src}
                alt={`old-preview-${idx}`}
                className="w-[100px] h-[100px] object-cover rounded shadow"
              />
            ))}
            {previews.map((src, idx) => (
              <img
                key={`new-${idx}`}
                src={src}
                alt={`new-preview-${idx}`}
                className="w-[100px] h-[100px] object-cover rounded shadow"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button type="submit">
          {editVariant ? "Cập nhật" : "Thêm biến thể"}
        </Button>
        {editVariant && (
          <button
            type="button"
            onClick={() => {
              reset();
              setPreviews([]);
              setOldImages([]);
              setSpecValues({});
              setSelectedSpecIds([]);
              onDone();
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
          >
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
};

export default CreateVariantForm;
