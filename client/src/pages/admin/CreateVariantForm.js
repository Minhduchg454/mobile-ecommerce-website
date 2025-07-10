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
  const [specifications, setSpecifications] = useState([]);
  const [specValues, setSpecValues] = useState({});

  // Load danh sách thông số kỹ thuật
  useEffect(() => {
    const fetchSpecifications = async () => {
      const res = await apiGetSpecifications();
      if (res.success) setSpecifications(res.specifications);
    };
    fetchSpecifications();
  }, []);

  // Nếu sửa thì set form
  useEffect(() => {
    const initEditData = async () => {
      if (editVariant) {
        setValue("productVariationName", editVariant.productVariationName);
        setValue("price", editVariant.price);
        setValue("stockQuantity", editVariant.stockQuantity);

        // Gọi API lấy thông số kỹ thuật theo variationId
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
        } catch (error) {
          console.error("Lỗi khi load thông số kỹ thuật:", error);
          toast.error("Không thể load thông số kỹ thuật");
        }
      } else {
        reset();
        setSpecValues({});
        setPreviews([]);
      }
    };

    initEditData();
  }, [editVariant]);

  // Preview ảnh
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
    const formData = new FormData();
    formData.append("productVariationName", data.productVariationName);
    formData.append("price", data.price);
    formData.append("stockQuantity", data.stockQuantity);
    console.log("productId đang truyền:", productId);
    if (!productId) {
      toast.error("Thiếu productId khi tạo biến thể!");
      return;
    }
    formData.append("productId", productId);

    for (let file of data.images || []) {
      formData.append("images", file);
    }

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

    let res;
    if (editVariant) {
      console.log(editVariant._id, formData);
      res = await apiUpdateProductVariation(editVariant._id, formData);
    } else {
      res = await apiCreateProductVariation(formData);
    }

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    dispatch(showModal({ isShowModal: false }));

    if (res.success) {
      toast.success(
        editVariant ? "Cập nhật thành công" : "Tạo biến thể thành công"
      );
      reset();
      setPreviews([]);

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

      onDone(); // reload và reset editVariant
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
        {editVariant && (
          <div>
            <label className="block font-medium mb-1">ID sản phẩm</label>
            <input
              type="text"
              value={productId || "Không có id của sản phẩm"}
              readOnly
              className="border border-gray-300 p-2 rounded w-full text-sm bg-gray-100"
            />
          </div>
        )}
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
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
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
      </div>

      {/* Thông số kỹ thuật */}
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
              setSpecValues({});
              onDone(); // Quay về trạng thái thêm mới
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
