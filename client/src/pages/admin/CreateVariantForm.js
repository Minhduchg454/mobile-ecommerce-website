import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InputForm, Button, Loading } from "components";
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
    watch,
    formState: { errors },
  } = useForm();

  const [previews, setPreviews] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [specValues, setSpecValues] = useState({});
  const [coupons, setCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState("");

  // Lấy danh sách khuyến mãi
  useEffect(() => {
    const fetchCoupons = async () => {
      const res = await apiGetAllCoupons();
      if (res.success) setCoupons(res.coupons);
    };
    fetchCoupons();
  }, []);

  // Lấy thông số kỹ thuật
  useEffect(() => {
    const fetchSpecifications = async () => {
      const res = await apiGetSpecifications();
      if (res.success) setSpecifications(res.specifications);
    };
    fetchSpecifications();
  }, []);

  // Load dữ liệu khi sửa
  useEffect(() => {
    const initEditData = async () => {
      if (editVariant) {
        setValue("productVariationName", editVariant.productVariationName);
        setValue("price", editVariant.price);
        setValue("stockQuantity", editVariant.stockQuantity);

        // Load ảnh cũ
        if (editVariant.images && Array.isArray(editVariant.images)) {
          const urls = editVariant.images.map(
            (img) =>
              img?.url || `${process.env.REACT_APP_SERVER_URL}/images/${img}`
          );
          setOldImages(urls);
        }

        // Load thông số kỹ thuật
        try {
          const res = await apiGetValuesByVariationId(editVariant._id);
          if (res.success) {
            const mapped = {};
            res.values.forEach((item) => {
              const specId = item.specificationTypeId._id;
              mapped[specId] = item.value;
            });
            setSpecValues(mapped);
          }
        } catch (err) {
          toast.error("Không thể load thông số kỹ thuật");
          console.error(err);
        }
      } else {
        reset();
        setOldImages([]);
        setPreviews([]);
        setSpecValues({});
        setSelectedCouponId("");
      }
    };

    initEditData();
  }, [editVariant, setValue, reset]);

  // Load ảnh mới nếu có chọn
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

    // Nếu có ảnh mới thì gửi lên
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

      // Gửi thông số kỹ thuật
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
        console.error(err);
      }

      // Gắn khuyến mãi
      if (selectedCouponId) {
        try {
          await apiCreateCouponProductVariation({
            variationId,
            couponId: selectedCouponId,
          });
          toast.success("Gắn khuyến mãi thành công");
        } catch (err) {
          toast.error("Không thể gắn khuyến mãi");
          console.error(err);
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
        <InputForm
          label="Số lượng kho"
          id="stockQuantity"
          type="number"
          register={register}
          errors={errors}
          validate={{ required: "Không được để trống" }}
          placeholder="VD: 10"
        />
        <div>
          <label className="block font-medium mb-1">Ảnh</label>
          <input
            type="file"
            multiple
            accept="image/*"
            {...register("images", editVariant ? {} : { required: "Chọn ảnh" })}
          />
          {errors.images && (
            <p className="text-sm text-red-500">{errors.images.message}</p>
          )}

          {(oldImages.length > 0 || previews.length > 0) && (
            <div className="flex flex-wrap gap-3 mt-3">
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
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Thông số kỹ thuật</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {specifications.map((spec) => (
            <div key={spec._id}>
              <label className="text-sm font-medium mb-1 block">
                {spec.typeSpecifications} ({spec.unitOfMeasure || ""})
              </label>
              <input
                type="text"
                value={specValues[spec._id] || ""}
                onChange={(e) =>
                  setSpecValues((prev) => ({
                    ...prev,
                    [spec._id]: e.target.value,
                  }))
                }
                className="border border-gray-300 p-2 rounded w-full text-sm"
                placeholder={`Nhập ${spec.typeSpecifications}`}
              />
            </div>
          ))}
        </div>
      </div>

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
