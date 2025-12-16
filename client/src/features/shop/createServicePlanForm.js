// createServicePlanForm.jsx
import React, { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  apiCreateServicePlan,
  apiUpdateServicePlan,
} from "../../services/shop.api";
import { CloseButton } from "../../components";
import { showAlert } from "store/app/appSlice";
import { formatMoney, handleMoneyChange } from "ultils/helpers";

const FEATURE_KEYS = [
  {
    key: "MAX_PRODUCTS",
    label: "Số sản phẩm tối đa",
    type: "number",
    unit: "sản phẩm",
  },
  { key: "SUPPORT", label: "Hỗ trợ ưu tiên", type: "string" },
  { key: "ANALYTICS", label: "Báo cáo thống kê nâng cao", type: "boolean" },
  { key: "ADS_BOOST", label: "Tăng hiển thị quảng cáo", type: "boolean" },
  { key: "MULTI_CATEGORY", label: "Tạo danh mục con", type: "boolean" },
  { key: "DISCOUNT", label: "Giảm giá khi gia hạn", type: "number", unit: "%" },
];

export const CreateServicePlanForm = ({
  onClose,
  initialData = null,
  onCloseSuccess,
  titleCreate = "Thêm gói dịch vụ",
  titleEdit = "Cập nhật gói dịch vụ",
}) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      serviceName: "",
      serviceDescription: "",
      serviceBillingCycle: "monthly",
      servicePrice: 0,
      serviceColor: "#3B82F6",
      serviceFeatures: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "serviceFeatures",
  });

  const featureValues = watch("serviceFeatures") || [];

  // set dùng để disable các key đã chọn
  const usedKeys = new Set(
    featureValues.map((f) => f?.key).filter((k) => k && k.length > 0)
  );

  // Fill form khi sửa
  useEffect(() => {
    if (initialData) {
      reset({
        serviceName: initialData.serviceName || "",
        serviceDescription: initialData.serviceDescription || "",
        serviceBillingCycle: initialData.serviceBillingCycle || "monthly",
        servicePrice: initialData.servicePrice || 0,
        serviceColor: initialData.serviceColor || "#3B82F6",
        serviceFeatures: initialData.serviceFeatures || [],
      });
    } else {
      reset({
        serviceName: "",
        serviceDescription: "",
        serviceBillingCycle: "monthly",
        servicePrice: 0,
        serviceColor: "#3B82F6",
        serviceFeatures: [],
      });
    }
  }, [initialData, reset]);

  // Khi chọn key trong select -> tự fill label/type/unit theo FEATURE_KEYS
  const handleFeatureKeyChange = (index, key) => {
    const meta = FEATURE_KEYS.find((f) => f.key === key);

    if (meta) {
      setValue(`serviceFeatures.${index}.label`, meta.label);
      setValue(`serviceFeatures.${index}.type`, meta.type || "string");
      setValue(`serviceFeatures.${index}.unit`, meta.unit || "");
    } else {
      // nếu không có trong FEATURE_KEYS (trường hợp hiếm, fallback)
      setValue(`serviceFeatures.${index}.label`, "");
      setValue(`serviceFeatures.${index}.type`, "string");
      setValue(`serviceFeatures.${index}.unit`, "");
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        serviceName: data.serviceName.trim(),
        serviceFeatures: (data.serviceFeatures || []).map((f) => {
          const meta = FEATURE_KEYS.find((m) => m.key === f.key);

          const key = meta?.key || String(f.key || "").trim();
          const label = meta?.label || String(f.label || "").trim();
          const type = meta?.type || f.type || "string";
          const unit =
            meta && Object.prototype.hasOwnProperty.call(meta, "unit")
              ? meta.unit
              : f.unit || "";

          return {
            key,
            label,
            value:
              f.value === null || f.value === undefined
                ? ""
                : String(f.value).trim(),
            type,
            unit,
          };
        }),
      };

      let res;
      if (initialData) {
        res = await apiUpdateServicePlan(payload, initialData._id);
      } else {
        res = await apiCreateServicePlan(payload);
      }

      if (res?.success) {
        dispatch(
          showAlert({
            title: "Thành công",
            message: res.message || "Thao tác thành công",
            variant: "success",
            duration: 1500,
            showConfirmButton: false,
          })
        );
        onCloseSuccess?.(res.plan);
        onClose?.();
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res?.message || "Không thể lưu gói dịch vụ",
            variant: "danger",
          })
        );
      }
    } catch (err) {
      console.error("CreateServicePlanForm error:", err);
      dispatch(
        showAlert({
          title: "Lỗi",
          message: err?.message || "Thao tác thất bại",
          variant: "danger",
        })
      );
    }
  };

  const labelCls = "text-sm px-2 mb-1";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mx-auto relative bg-white border p-3 md:p-4 rounded-3xl shadow-md w-full md:w-[90vh]"
    >
      <CloseButton onClick={onClose} className="absolute top-2 right-2" />
      <h2 className="text-lg font-bold mb-4 text-center">
        {initialData ? titleEdit : titleCreate}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col text-sm">
        <div className="flex flex-col md:flex-row gap-4 items-start justify-center">
          <div className="w-full ">
            {/* Tên gói */}
            <div className="mb-2">
              <label className={labelCls}>Tên gói dịch vụ *</label>
              <input
                {...register("serviceName", {
                  required: "Vui lòng nhập tên gói",
                })}
                className="border rounded-xl w-full p-2 mb-1"
                placeholder="Ví dụ: Gói Cơ Bản"
              />
              {errors.serviceName && (
                <p className="text-red-500 text-xs">
                  {errors.serviceName.message}
                </p>
              )}
            </div>

            {/* Mô tả */}
            <div className="mb-2">
              <label className={labelCls}>Mô tả</label>
              <textarea
                {...register("serviceDescription")}
                className="border rounded-xl w-full p-2 mb-1"
                placeholder="Mô tả quyền lợi, phù hợp cho đối tượng nào..."
                rows={2}
              />
            </div>

            {/* Chu kỳ + Giá + Màu */}
            <div className="flex flex-col md:flex-row gap-2 mb-2">
              <div className="flex-1">
                <label className={labelCls}>Chu kỳ thanh toán *</label>
                <select
                  {...register("serviceBillingCycle", { required: true })}
                  className="border rounded-xl w-full p-2"
                >
                  <option value="monthly">Theo tháng</option>
                  <option value="yearly">Theo năm</option>
                </select>
              </div>

              <div className="flex-1">
                <label className={labelCls}>Giá gói (đ) *</label>

                {/* DÙNG CONTROLLER + formatMoney */}
                <Controller
                  name="servicePrice"
                  control={control}
                  rules={{
                    required: "Vui lòng nhập giá gói",
                    min: { value: 0, message: "Giá phải >= 0" },
                  }}
                  render={({ field: { value, onChange } }) => (
                    <input
                      type="text"
                      inputMode="numeric"
                      className="border rounded-xl w-full p-2"
                      value={formatMoney(value)}
                      onChange={(e) => handleMoneyChange(e, onChange)}
                      placeholder="VD: 100.000"
                    />
                  )}
                />

                {errors.servicePrice && (
                  <p className="text-red-500 text-xs">
                    {errors.servicePrice.message}
                  </p>
                )}
              </div>
            </div>
            {/* Color */}
            <div className="flex-1 mb-2">
              <label className={labelCls}>Màu đại diện</label>
              <div className="flex justify-start items-center gap-4 ">
                <input
                  type="color"
                  {...register("serviceColor")}
                  className="w-full h-7 rounded-full border p-0.5"
                />
              </div>
            </div>
          </div>

          {/* SERVICE FEATURES */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls}>Quyền lợi / Tính năng</label>
              <button
                type="button"
                onClick={() =>
                  append({
                    key: "",
                    label: "",
                    value: "",
                    type: "string",
                    unit: "",
                  })
                }
                className="text-xs px-3 py-1 rounded-2xl border bg-white hover:bg-gray-100"
              >
                + Thêm quyền lợi
              </button>
            </div>

            {fields.length === 0 ? (
              <p className="text-xs text-gray-500 px-2 italic">
                Chưa có quyền lợi nào. Bạn có thể thêm các dòng như: &quot;Số
                sản phẩm tối đa&quot;, &quot;Hỗ trợ ưu tiên&quot;, ...
              </p>
            ) : (
              <div className="flex flex-col gap-4 mt-1 h-[350px] overflow-y-auto">
                {fields.map((field, index) => {
                  const currentKey = featureValues?.[index]?.key;

                  return (
                    <div
                      key={field.id}
                      className="border rounded-3xl p-2 flex flex-col gap-1 bg-gray-50"
                    >
                      {/* Hàng 1: Chọn key + label hiển thị */}
                      <div className="flex gap-">
                        <div className="flex-1">
                          <label className="text-[11px] px-1">
                            Quyền lợi *
                          </label>
                          <select
                            {...register(`serviceFeatures.${index}.key`, {
                              required: true,
                              onChange: (e) =>
                                handleFeatureKeyChange(index, e.target.value),
                            })}
                            className="border rounded-xl w-full p-1.5 text-xs"
                          >
                            <option value="">-- Chọn quyền lợi --</option>
                            {FEATURE_KEYS.map((fk) => {
                              const isUsed =
                                usedKeys.has(fk.key) && fk.key !== currentKey;
                              return (
                                <option
                                  key={fk.key}
                                  value={fk.key}
                                  disabled={isUsed}
                                >
                                  {fk.label}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="text-[11px] px-1">
                            Label hiển thị
                          </label>
                          <input
                            {...register(`serviceFeatures.${index}.label`)}
                            className="border rounded-xl w-full p-1.5 text-xs bg-gray-100"
                            readOnly
                            placeholder="Tự động theo quyền lợi"
                          />
                        </div>
                      </div>

                      {/* Hàng 2: Value + unit + type (readonly) */}
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1">
                          <label className="text-[11px] px-1">Giá trị *</label>
                          <input
                            {...register(`serviceFeatures.${index}.value`, {
                              required: true,
                            })}
                            className="border rounded-xl w-full p-1.5 text-xs"
                            placeholder="VD: 100 / Có / Không / Không giới hạn"
                          />
                        </div>
                        <div className="w-28">
                          <label className="text-[11px] px-1">Đơn vị</label>
                          <input
                            {...register(`serviceFeatures.${index}.unit`)}
                            className="border rounded-xl w-full p-1.5 text-xs bg-gray-100"
                            readOnly
                            placeholder="Tự động (nếu có)"
                          />
                        </div>
                        <div className="w-28">
                          <label className="text-[11px] px-1">Loại</label>
                          <select
                            {...register(`serviceFeatures.${index}.type`)}
                            className="border rounded-xl w-full p-1.5 text-xs bg-gray-100"
                            disabled
                          >
                            <option value="string">Chuỗi</option>
                            <option value="number">Số</option>
                            <option value="boolean">Boolean</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end mt-1">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-[11px] px-2 py-1 rounded-2xl border bg-white hover:bg-gray-100"
                        >
                          Xoá dòng
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end mt-3 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded-3xl border hover:bg-gray-100"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1 rounded-3xl bg-button-bg-ac hover:bg-button-bg-hv text-white disabled:opacity-50"
          >
            {isSubmitting
              ? "Đang lưu..."
              : initialData
              ? "Cập nhật"
              : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
};
