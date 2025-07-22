// File: CreateProducts.jsx
import React, { useCallback, useState, useEffect } from "react";
import {
  InputForm,
  Select,
  Button,
  MarkdownEditor,
  Loading,
  ConfirmModal,
  SpecificationSelector,
  CustomMarkdownEditor,
} from "components";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { validate, getBase64 } from "ultils/helpers";
import { toast } from "react-toastify";
import {
  apiCreateProduct,
  apiUpdateProduct,
  apiGetAllProductCategories,
  apiGetBrands,
  apiGetSpecifications,
  apiCreateValueOfSpecForProduct,
  apiGetValuesByProductId,
  apiUpdateValueOfSpecForProduct,
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

  const [allSpecifications, setAllSpecifications] = useState([]);
  const [selectedSpecIds, setSelectedSpecIds] = useState([]);
  const [specValues, setSpecValues] = useState({});
  const [existingSpecValueMap, setExistingSpecValueMap] = useState({});

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
      const [res1, res2, res3] = await Promise.all([
        apiGetAllProductCategories(),
        apiGetBrands(),
        apiGetSpecifications(),
      ]);

      if (res1.success) setCategories(res1.prodCategories);
      if (res2.success) setBrands(res2.brands);
      if (res3.success) setAllSpecifications(res3.specifications);

      if (editProduct) {
        reset({
          productName: editProduct.productName,
          category: editProduct.categoryId?._id,
          brand: editProduct.brandId?._id,
        });
        setPayload({ description: editProduct.description || "" });
        setPreview(editProduct.thumb);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (editProduct) {
      apiGetValuesByProductId(editProduct._id).then((res) => {
        if (res.success) {
          const values = {};
          const selected = [];
          const existingMap = {};

          res.values.forEach((item) => {
            const specId = item.specificationTypeId?._id;
            if (specId) {
              selected.push(specId);
              values[specId] = item.value;
              existingMap[specId] = item._id;
            }
          });

          setSelectedSpecIds(selected);
          setSpecValues(values);
          setExistingSpecValueMap(existingMap);
        }
      });
    }
  }, [editProduct]);

  useEffect(() => {
    const file = watch("thumb")?.[0];
    if (file) getBase64(file).then((base64) => setPreview(base64));
  }, [watch("thumb")]);

  const changeValue = useCallback((e) => {
    setPayload((prev) => ({ ...prev, ...e }));
  }, []);

  const handleCreateOrUpdate = async (data) => {
    const invalids = validate(payload, setInvalidFields);
    if (invalids > 0) return;

    const formData = new FormData();
    formData.append("productName", data.productName);
    formData.append("categoryId", data.category);
    formData.append("brandId", data.brand);
    formData.append(
      "description",
      payload.description.replace(/<[^>]*>?/gm, "").trim()
    );

    if (data.thumb?.[0]) {
      formData.append("thumb", data.thumb[0]);
    }

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

    let response;
    if (editProduct) {
      response = await apiUpdateProduct(formData, editProduct._id);
    } else {
      response = await apiCreateProduct(formData);
    }

    dispatch(showModal({ isShowModal: false, modalChildren: null }));

    if (response.success) {
      const productId = editProduct
        ? editProduct._id
        : response.createdProduct._id;

      for (const specId of selectedSpecIds) {
        const value = specValues[specId];
        if (!value) continue;

        if (existingSpecValueMap[specId]) {
          await apiUpdateValueOfSpecForProduct(existingSpecValueMap[specId], {
            productId,
            specificationTypeId: specId,
            value,
          });
        } else {
          await apiCreateValueOfSpecForProduct({
            productId,
            specificationTypeId: specId,
            value,
          });
        }
      }

      toast.success(
        editProduct ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!"
      );
      onDone();
      reset();
      setPayload({ description: "" });
      setPreview(null);
      render();

      if (!editProduct) {
        setCreatedProductId(productId);
        setIsConfirmingNext(true);
      }
    } else {
      toast.error(response.mes || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="w-full m-auto border bg-white shadow-md rounded-xl">
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

          <CustomMarkdownEditor
            name="description"
            label="Mô tả sản phẩm"
            value={payload.description}
            changeValue={changeValue}
            invalidFields={invalidFields}
            setInvalidFields={setInvalidFields}
            height={100}
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

          <div className="my-3">
            <SpecificationSelector
              specifications={allSpecifications}
              selectedSpecIds={selectedSpecIds}
              specValues={specValues}
              onToggleSpec={(specId) => {
                setSelectedSpecIds((prev) =>
                  prev.includes(specId)
                    ? prev.filter((id) => id !== specId)
                    : [...prev, specId]
                );
              }}
              onChangeValue={(specId, value) => {
                setSpecValues((prev) => ({ ...prev, [specId]: value }));
              }}
              onRemoveSpec={(specId) => {
                setSelectedSpecIds((prev) =>
                  prev.filter((id) => id !== specId)
                );
                setSpecValues((prev) => {
                  const updated = { ...prev };
                  delete updated[specId];
                  return updated;
                });
              }}
            />
          </div>

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
