import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { InputForm, Button, Loading } from "components";
import { getBase64 } from "ultils/helpers";
import {
  apiCreateProductVariation,
  apiGetProduct,
  apiGetSpecifications,
  apiCreateValueOfSpec,
} from "apis"; // <-- ✅ Thêm ở đây
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { showModal } from "store/app/appSlice";

const CreateVariation = () => {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const [previews, setPreviews] = useState([]);
  const [productName, setProductName] = useState("");
  const [specifications, setSpecifications] = useState([]);
  const [specValues, setSpecValues] = useState({});

  useEffect(() => {
    const fetchSpecifications = async () => {
      const res = await apiGetSpecifications();
      if (res.success) setSpecifications(res.specifications);
    };
    fetchSpecifications();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      const res = await apiGetProduct(productId);
      if (res.success) {
        setProductName(res.productData.productName);
      } else {
        toast.error("Không thể lấy thông tin sản phẩm");
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const files = watch("images");
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      Promise.all(fileArray.map((file) => getBase64(file))).then(setPreviews);
    } else {
      setPreviews([]);
    }
  }, [watch("images")]);

  const onSubmit = async (data) => {
    if (!productId) return toast.error("Không tìm thấy productId!");

    const formData = new FormData();
    formData.append("productVariationName", data.productVariationName);
    formData.append("price", data.price);
    formData.append("stockQuantity", data.stockQuantity);
    formData.append("productId", productId);
    for (let file of data.images) {
      formData.append("images", file);
    }

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
    const res = await apiCreateProductVariation(formData);
    dispatch(showModal({ isShowModal: false, modalChildren: null }));

    if (res.success) {
      toast.success("✅ Tạo biến thể thành công");
      reset();
      setPreviews([]);

      const variationId = res.createdVariation._id;

      // ✅ Chuẩn hóa dữ liệu cấu hình
      const specPayload = Object.entries(specValues)
        .filter(([, value]) => value?.trim() !== "")
        .map(([specId, value]) => ({
          productVariationId: variationId,
          specificationTypeId: specId,
          value: value.trim(),
        }));

      console.log("📦 Thông số gửi lên server:", specPayload); // 👁 Debug

      try {
        await Promise.all(
          specPayload.map((item) => apiCreateValueOfSpec(item))
        );
        toast.success("✅ Gắn thông số kỹ thuật thành công");
      } catch (err) {
        toast.error("❌ Gắn thông số kỹ thuật thất bại");
        console.error("❌ Lỗi gửi cấu hình:", err);
      }
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold px-4 py-4 border-b">
        TẠO BIẾN THỂ
        {productName && (
          <span className="text-lg block text-gray-600 mt-1">
            Cho sản phẩm:{" "}
            <span className="text-main font-semibold">{productName}</span>
          </span>
        )}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        <InputForm
          label="Tên biến thể"
          id="productVariationName"
          register={register}
          errors={errors}
          validate={{ required: "Không được để trống" }}
          placeholder="VD: Black 16/256"
        />
        <InputForm
          label="Giá bán"
          id="price"
          type="number"
          register={register}
          errors={errors}
          validate={{ required: "Không được để trống" }}
          placeholder="VD: 25000000"
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
          <label className="font-semibold block mb-1">Hình ảnh</label>
          <input
            type="file"
            multiple
            accept="image/*"
            {...register("images", { required: "Vui lòng chọn ảnh" })}
          />
          {errors.images && (
            <small className="text-red-500 text-xs">
              {errors.images.message}
            </small>
          )}

          {previews.length > 0 && (
            <div className="flex gap-4 mt-4 flex-wrap">
              {previews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`preview-${idx}`}
                  className="w-[100px] h-[100px] object-cover rounded shadow"
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">Thông số kỹ thuật</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {specifications.map((spec) => (
              <div key={spec._id} className="flex flex-col">
                <label className="font-medium text-sm mb-1">
                  {`${spec.typeSpecifications}  (${spec.unitOfMeasure || ""})`}
                </label>
                <input
                  type="text"
                  className="border border-gray-300 p-2 rounded text-sm"
                  placeholder={`Nhập giá trị cho ${spec.typeSpecifications}`}
                  value={specValues[spec._id] || ""}
                  onChange={(e) =>
                    setSpecValues((prev) => ({
                      ...prev,
                      [spec._id]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <Button type="submit">Thêm biến thể</Button>
      </form>
    </div>
  );
};

export default CreateVariation;
