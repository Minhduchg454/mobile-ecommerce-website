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
  apiUpdateProduct,
} from "apis";
import { showModal } from "store/app/appSlice";
import { useNavigate } from "react-router-dom";

const CreateProducts = ({
  editProduct = null,
  render = () => {},
  onDone = () => {},
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [preview, setPreview] = useState(null);
  const [invalidFields, setInvalidFields] = useState([]);
  const [payload, setPayload] = useState({ description: "" });
  const [isConfirmingNext, setIsConfirmingNext] = useState(false);
  const [createdProductId, setCreatedProductId] = useState(null);

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    setValue,
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

      // ✅ Nếu là sửa thì gán lại dữ liệu vào form
      if (editProduct) {
        reset({
          productName: editProduct.productName,
          category: editProduct.categoryId?._id,
          brand: editProduct.brandId?._id,
        });
        setPayload({ description: editProduct.description || "" });
        setPreview(editProduct.thumb); // nếu thumb là URL đã upload sẵn
      }
    };

    fetchData();
  }, []);

  // 🔁 Nếu là edit, pre-fill dữ liệu
  useEffect(() => {
    if (editProduct) {
      setValue("productName", editProduct.productName);
      setValue("category", editProduct.categoryId?._id);
      setValue("brand", editProduct.brandId?._id);
      setPayload({ description: editProduct.description });
      setPreview(editProduct.thumb);
    }
  }, [editProduct, setValue]);

  const changeValue = useCallback((e) => {
    setPayload((prev) => ({ ...prev, ...e }));
  }, []);

  useEffect(() => {
    const file = watch("thumb")?.[0];
    if (file) getBase64(file).then((base64) => setPreview(base64));
  }, [watch("thumb")]);

  const handleCreateOrUpdate = async (data) => {
    const invalids = validate(payload, setInvalidFields);
    if (invalids > 0) return;

    const formData = new FormData();
    formData.append("productName", data.productName);
    formData.append("categoryId", data.category);
    formData.append("brandId", data.brand);

    const stripHtml = (html) => html.replace(/<[^>]*>?/gm, "").trim();
    formData.append("description", stripHtml(payload.description));

    if (data.thumb?.[0]) {
      formData.append("thumb", data.thumb[0]);
    }

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

    let response;
    if (editProduct) {
      // 🛠 Gọi API cập nhật nếu có editProduct
      response = await apiUpdateProduct(formData, editProduct._id);
    } else {
      // 🛠 Gọi API tạo mới
      response = await apiCreateProduct(formData);
    }

    dispatch(showModal({ isShowModal: false, modalChildren: null }));

    if (response.success) {
      toast.success(
        editProduct ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!"
      );
      onDone();
      reset();
      setPayload({ description: "" });
      setPreview(null);
      render(); // Gọi reload lại danh sách

      // Nếu tạo mới thì hỏi thêm biến thể
      if (!editProduct) {
        setCreatedProductId(response.createdProduct._id);
        setIsConfirmingNext(true);
        onDone();
      } else {
        // Nếu sửa thì tự đóng modal (nếu bạn đang đặt nó trong modal)
      }
    } else {
      toast.error(response.mes || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="w-full">
      {editProduct && (
        <h1 className="h-[75px] flex justify-between items-center text-xl font-bold px-4 border-b">
          <span>{`Cập nhật sản phẩm: ${editProduct.productName}`}</span>
        </h1>
      )}

      <div className="p-4">
        <form onSubmit={handleSubmit(handleCreateOrUpdate)}>
          <InputForm
            label="Tên sản phẩm"
            register={register}
            errors={errors}
            id="productName"
            validate={{ required: "Không được để trống" }}
            fullWidth
            placeholder="Nhập tên sản phẩm"
          />

          <div className="w-full my-6 flex gap-4 overflow-visible">
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
              defaultValue={editProduct?.categoryId?._id}
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
              defaultValue={editProduct?.brandId?._id}
            />
          </div>

          <MarkdownEditor
            name="description"
            changeValue={changeValue}
            label="Mô tả sản phẩm"
            invalidFields={invalidFields}
            setInvalidFields={setInvalidFields}
            value={payload.description}
            height={300}
          />

          <div className="flex flex-col gap-2 mt-8">
            <label className="font-semibold" htmlFor="thumb">
              Ảnh đại diện sản phẩm
            </label>
            <input
              type="file"
              id="thumb"
              {...register("thumb", {
                required: editProduct ? false : "Không được để trống",
              })}
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

          <div className="my-6 rounded-xl">
            <Button className="rounded-xl" type="submit">
              {editProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
            </Button>
          </div>
        </form>
      </div>

      {!editProduct && isConfirmingNext && (
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
