import React, { useCallback, useState, useEffect } from "react";
import {
  InputForm,
  Select,
  Button,
  MarkdownEditor,
  Loading,
  ConfirmModal,
} from "components";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { validate, getBase64 } from "ultils/helpers";
import { toast } from "react-toastify";
import {
  apiCreateProduct,
  apiGetBrands,
  apiGetAllProductCategories,
} from "apis";
import { showModal } from "store/app/appSlice";
import { useNavigate } from "react-router-dom";

const CreateProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [preview, setPreview] = useState(null);
  const [invalidFields, setInvalidFields] = useState([]);
  const [payload, setPayload] = useState({ description: "" });

  const [isConfirmingNext, setIsConfirmingNext] = useState(false); // ✨
  const [createdProductId, setCreatedProductId] = useState(null); // ✨

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    watch,
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      const [res1, res2] = await Promise.all([
        apiGetAllProductCategories(),
        apiGetBrands(),
      ]);

      if (res1.success) setCategories(res1.prodCategories);
      if (res2.success) setBrands(res2.brands);
    };
    fetchData();
  }, []);

  const changeValue = useCallback((e) => {
    setPayload((prev) => ({
      ...prev,
      ...e,
    }));
  }, []);

  useEffect(() => {
    const file = watch("thumb")?.[0];
    if (file) {
      getBase64(file).then((base64) => setPreview(base64));
    }
  }, [watch("thumb")]);

  const handleCreateProduct = async (data) => {
    const invalids = validate(payload, setInvalidFields);
    if (invalids === 0) {
      const formData = new FormData();
      formData.append("productName", data.productName);
      formData.append("categoryId", data.category);
      formData.append("brandId", data.brand);

      // ✅ Loại bỏ thẻ HTML khỏi mô tả
      const stripHtml = (html) => html.replace(/<[^>]*>?/gm, "").trim();
      formData.append("description", stripHtml(payload.description));

      formData.append("thumb", data.thumb[0]);

      dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
      const response = await apiCreateProduct(formData);
      dispatch(showModal({ isShowModal: false, modalChildren: null }));

      if (response.success) {
        toast.success("🎉 Tạo sản phẩm thành công!");
        reset();
        setPayload({ description: "" });
        setPreview(null);
        setCreatedProductId(response.createdProduct._id);
        setIsConfirmingNext(true);
      } else {
        toast.error(response.mes || "❌ Tạo sản phẩm thất bại");
      }
    }
  };

  return (
    <div className="w-full">
      <h1 className="h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b">
        <span>THÊM SẢN PHẨM</span>
      </h1>
      <div className="p-4">
        <form onSubmit={handleSubmit(handleCreateProduct)}>
          <InputForm
            label="Tên sản phẩm"
            register={register}
            errors={errors}
            id="productName"
            validate={{ required: "Không được để trống" }}
            fullWidth
            placeholder="Nhập tên sản phẩm"
          />

          <div className="w-full my-6 flex gap-4">
            <Select
              label="Danh mục"
              options={categories.map((el) => ({
                code: el._id,
                value: el.productCategoryName,
              }))}
              register={register}
              id="category"
              validate={{ required: "Không được để trống" }}
              style="flex-auto"
              errors={errors}
              fullWidth
            />

            <Select
              label="Thương hiệu"
              options={brands.map((el) => ({
                code: el._id,
                value: el.brandName,
              }))}
              register={register}
              id="brand"
              validate={{ required: "Không được để trống" }}
              style="flex-auto"
              errors={errors}
              fullWidth
            />
          </div>

          <MarkdownEditor
            name="description"
            changeValue={changeValue}
            label="Mô tả sản phẩm"
            invalidFields={invalidFields}
            setInvalidFields={setInvalidFields}
          />

          <div className="flex flex-col gap-2 mt-8">
            <label className="font-semibold" htmlFor="thumb">
              Ảnh đại diện sản phẩm
            </label>
            <input
              type="file"
              id="thumb"
              {...register("thumb", { required: "Không được để trống" })}
              accept="image/*"
            />
            {errors.thumb && (
              <small className="text-xs text-red-500">
                {errors.thumb.message}
              </small>
            )}
          </div>

          {preview && (
            <div className="my-4">
              <img
                src={preview}
                alt="thumbnail"
                className="w-[200px] object-contain"
              />
            </div>
          )}

          <div className="my-6">
            <Button type="submit">Thêm sản phẩm</Button>
          </div>
        </form>
      </div>

      {/* ✨ Modal xác nhận chuyển bước tiếp theo */}
      {isConfirmingNext && (
        <ConfirmModal
          title="Tạo sản phẩm thành công"
          message="Bạn có muốn thêm biến thể cho sản phẩm này không?"
          confirmText="➕ Thêm biến thể"
          cancelText="Để sau"
          onConfirm={() => {
            setIsConfirmingNext(false);
            navigate(`/admin/create-variation/${createdProductId}`);
          }}
          onCancel={() => setIsConfirmingNext(false)}
        />
      )}
    </div>
  );
};

export default CreateProducts;
