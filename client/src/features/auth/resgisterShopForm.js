// src/pages/shop/RegisterShopForm.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiRegisterShop } from "../../services/auth.api";
import {
  apiGetServicePlans,
  apiCreateSubscription,
} from "../../services/shop.api";
import { AddressFormModal } from "../../features/user/AddressFormModal";
import { FaCheck } from "react-icons/fa";
import { showAlert, showModal } from "store/app/appSlice";
import { fetchSellerCurrent } from "store/seller/asynsActions";
import { getCurrent } from "store/user/asyncActions";
import { useNavigate } from "react-router-dom";
import path from "ultils/path";
import { formatMoney } from "../../ultils/helpers";
import { IoMdCheckmark } from "react-icons/io";

export const RegisterShopForm = () => {
  const { current } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [selectedServicePlan, setSelectedServicePlan] = useState(""); // id gói được chọn
  const [pickupAddress, setPickupAddress] = useState(null);

  const [step, setStep] = useState("info");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    userId: current?._id,
    shopName: "",
    shopDescription: "",
    shopIsOffical: false,
  });

  // ================== FETCH PLANS ==================
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await apiGetServicePlans({ sort: "oldest" });
      if (res?.success) {
        setPlans(res.plans || []);
      } else {
        setPlans([]);
        dispatch(
          showAlert({
            title: "Không thể tải danh sách gói",
            message: res?.message || "Vui lòng thử lại sau",
            variant: "danger",
            duration: 1500,
          })
        );
      }
    } catch (err) {
      console.error("fetchPlans error:", err);
      setPlans([]);
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không thể tải danh sách gói dịch vụ",
          variant: "danger",
          duration: 1500,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // ================== STEPS ==================
  const steps = useMemo(
    () => [
      { key: "info", label: "Thông tin shop" },
      { key: "servicePlan", label: "Phí dịch vụ" },
      { key: "payment", label: "Thanh toán" },
      { key: "success", label: "Hoàn tất" },
    ],
    []
  );

  const currentIndex = steps.findIndex((s) => s.key === step);

  // Gói đang chọn (object)
  const selectedPlan = useMemo(
    () => plans.find((p) => p._id === selectedServicePlan),
    [plans, selectedServicePlan]
  );

  // ================== RULE: Step có được Next không ==================
  const canGoNext = useMemo(() => {
    if (step === "info") {
      const hasName = formData.shopName?.trim().length > 0;
      //const hasAddress = !!pickupAddress;
      const hasAddress = true;
      return hasName && hasAddress;
    }

    if (step === "servicePlan") {
      return !!selectedServicePlan;
    }

    if (step === "payment") {
      // Cho phép bấm "Thanh toán" (chặn ở validateStep / handleSubmit nếu thiếu)
      return true;
    }

    return false;
  }, [step, formData.shopName, pickupAddress, selectedServicePlan]);

  const validateStep = () => {
    if (step === "info") {
      if (!formData.shopName?.trim()) {
        dispatch(
          showAlert({
            title: "Thiếu thông tin",
            message: "Vui lòng nhập Tên cửa hàng.",
            variant: "danger",
          })
        );
        return false;
      }
      // if (!pickupAddress) {
      //   dispatch(
      //     showAlert({
      //       title: "Thiếu thông tin",
      //       message: "Vui lòng thêm Địa chỉ lấy hàng cho shop.",
      //       variant: "danger",
      //     })
      //   );
      //   return false;
      // }
    }

    if (step === "servicePlan" && !selectedServicePlan) {
      dispatch(
        showAlert({
          title: "Chưa chọn gói",
          message: "Vui lòng chọn một gói dịch vụ để tiếp tục.",
          variant: "danger",
        })
      );
      return false;
    }

    return true;
  };

  const nextStep = async () => {
    if (!validateStep()) return;

    // Từ servicePlan → sang payment
    if (step === "servicePlan") {
      setStep("payment");
      return;
    }

    // Ở bước payment, bấm "Thanh toán" → submit (tạo shop + subscription)
    if (step === "payment") {
      return handleSubmit();
    }

    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].key);
    }
  };

  const prevStep = () => {
    if (currentIndex > 0 && step !== "success") {
      setStep(steps[currentIndex - 1].key);
    }
  };

  // ================== HANDLE FORM ==================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddressModal = (initial) => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <AddressFormModal
            onClose={() =>
              dispatch(showModal({ isShowModal: false, modalChildren: null }))
            }
            userId={current._id}
            initialAddress={initial}
            onSuccess={(savedAddress) => {
              if (savedAddress) {
                setPickupAddress(savedAddress);
              }
            }}
            titleCreate="Thêm địa chỉ mới"
            titleEdit="Cập nhật địa chỉ"
            addressFor={"shop"}
          />
        ),
      })
    );
  };

  // Helper tính ngày hết hạn subscription
  const calcExpirationDate = (plan) => {
    const now = new Date();
    const exp = new Date(now);
    if (plan.serviceBillingCycle === "yearly") {
      exp.setFullYear(exp.getFullYear() + 1);
    } else {
      // mặc định monthly
      exp.setMonth(exp.getMonth() + 1);
    }
    return exp.toISOString();
  };

  // ================== SUBMIT (Tạo shop + đăng ký gói) ==================
  const handleSubmit = async () => {
    if (!selectedPlan) {
      dispatch(
        showAlert({
          title: "Chưa chọn gói",
          message: "Vui lòng quay lại bước trước và chọn gói dịch vụ.",
          variant: "danger",
        })
      );
      return;
    }

    setLoading(true);
    try {
      // 1. Tạo shop
      const shopPayload = {
        ...formData,
        userId: current?._id,
        pickupAddressId: pickupAddress?._id || null,
      };

      const resShop = await apiRegisterShop(shopPayload);

      if (!resShop?.success || !resShop.shop) {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: resShop?.message || "Không thể đăng ký shop",
            variant: "danger",
          })
        );
        return;
      }

      const shop = resShop.shop;

      // 2. Tạo subscription cho shop vừa tạo (mặc định thanh toán OK)
      try {
        const subPayload = {
          shopId: shop._id,
          serviceId: selectedPlan._id,
          subPrice: selectedPlan.servicePrice,
          subExpirationDate: calcExpirationDate(selectedPlan),
          subAutoRenew: true,
        };

        const resSub = await apiCreateSubscription(subPayload);

        if (!resSub?.success) {
          dispatch(
            showAlert({
              title: "Cảnh báo",
              message:
                resSub?.message ||
                "Shop đã tạo nhưng đăng ký gói dịch vụ bị lỗi. Vui lòng liên hệ hỗ trợ.",
              variant: "warning",
            })
          );
        }
      } catch (subErr) {
        console.error("Create subscription error:", subErr);
        dispatch(
          showAlert({
            title: "Cảnh báo",
            message:
              "Shop đã tạo nhưng đăng ký gói dịch vụ bị lỗi. Vui lòng liên hệ hỗ trợ.",
            variant: "warning",
          })
        );
      }

      // 3. Refresh redux & chuyển step success
      setStep("success");
      dispatch(fetchSellerCurrent(current._id));
      dispatch(getCurrent());
    } catch (err) {
      console.error(err);
      dispatch(
        showAlert({
          title: "Lỗi",
          message: err?.message || "Đăng ký thất bại",
          variant: "danger",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // ================== UI ==================
  const cols = steps.length * 2 - 1;

  return (
    <div className="h-[calc(100vh-100px)] m-2 md:m-4 flex flex-col justify-center items-center animate-fadeIn">
      <div className="relative w-full h-[600px] md:w-[800px] bg-white rounded-3xl p-4 flex flex-col items-center justify-between shadow-md">
        {/* === Thanh tiến trình === */}
        <div className="w-full flex flex-col items-center justify-center px-4 border-b py-2 h-[100px] my-auto">
          <div
            className="grid gap-0"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {steps.map((s, idx) => {
              const isDone = idx <= currentIndex;
              const isBarDone = idx < currentIndex;
              const circleCls = isDone
                ? "bg-green-500 text-green-600"
                : "bg-gray-300 text-gray-400";
              const barCls = isBarDone ? "bg-green-500" : "bg-gray-200";

              return (
                <React.Fragment key={`icons-${s.key}`}>
                  <div className="flex justify-center overflow-hidden">
                    <div
                      className={`relative z-10 w-3 h-3 rounded-full flex items-center justify-center ${circleCls}`}
                    ></div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      className={`h-1 self-center ${barCls} -ml-4 -mr-4`}
                      style={{ width: "calc(100% + 2rem)" }}
                    />
                  )}
                </React.Fragment>
              );
            })}

            <div className="col-span-full h-2" />

            {steps.map((s, idx) => (
              <React.Fragment key={`labels-${s.key}`}>
                <div className="flex flex-col items-center text-center px-1 whitespace-nowrap">
                  <div className="text-xs md:text-sm font-medium max-w-[160px]">
                    {s.label}
                  </div>
                </div>
                {idx < steps.length - 1 && <div />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* === Nội dung chính === */}
        <div className="w-full h-[400px] flex flex-col items-center justify-start py-2 md:py-4">
          {/* STEP 1: Info */}
          {step === "info" && (
            <form className="flex flex-col w-full md:w-[500px] gap-4">
              <label className="flex flex-col">
                <span className="text-sm px-2">
                  Tên cửa hàng <span className="text-red-500">*</span>
                </span>
                <input
                  name="shopName"
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={handleChange}
                  className="border rounded-2xl p-2"
                  placeholder="Nhập tên shop..."
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm px-2">Mô tả cửa hàng</span>
                <textarea
                  name="shopDescription"
                  value={formData.shopDescription}
                  onChange={handleChange}
                  className="border rounded-2xl p-2"
                  rows={3}
                  placeholder="Mô tả ngắn gọn..."
                />
              </label>

              {/* Địa chỉ lấy hàng */}
              <div>
                <div className="flex gap-2 items-center justify-start">
                  <p className="text-sm px-2">
                    Địa chỉ lấy hàng <span className="text-red-500">*</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => openAddressModal(pickupAddress || null)}
                    className="text-button-bg-ac hover:underline text-sm"
                  >
                    {pickupAddress ? "Sửa địa chỉ" : "Thêm địa chỉ"}
                  </button>
                </div>

                {pickupAddress ? (
                  <div className="px-2 mt-2 text-xs md:text-sm text-gray-700">
                    <p className="font-medium">
                      {pickupAddress.addressUserName} |{" "}
                      {pickupAddress.addressNumberPhone}
                    </p>
                    <p>
                      {[
                        pickupAddress.addressStreet,
                        pickupAddress.addressWard,
                        pickupAddress.addressDistrict,
                        pickupAddress.addressCity,
                        pickupAddress.addressCountry,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                ) : (
                  <p className="px-2 mt-1 text-xs text-gray-400">
                    Bạn chưa thêm địa chỉ lấy hàng cho shop.
                  </p>
                )}
              </div>

              <div className="flex items-center text-sm gap-2">
                <p className="px-2">Số điện thoại:</p>
                <p>{current?.userMobile || ""}</p>
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <span className="relative inline-flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="shopIsOffical"
                    checked={formData.shopIsOffical}
                    onChange={handleChange}
                    className="peer appearance-none w-4 h-4 border border-black rounded-sm "
                  />
                  <FaCheck className="absolute text-black opacity-0 peer-checked:opacity-100 w-3 h-3" />
                </span>
                <span>Đăng ký là shop Mall (chính hãng)</span>
              </label>
            </form>
          )}

          {/* STEP 3: Service Plan */}
          {step === "servicePlan" && (
            <div className="overflow-y-auto flex flex-col items-center gap-4 text-black w-full md:w-[600px]">
              {plans.map((plan) => {
                const isActive = selectedServicePlan === plan._id;

                return (
                  <label
                    key={plan._id}
                    htmlFor={`plan-${plan._id}`}
                    className={`
                      flex justify-between items-center w-full rounded-3xl p-3 md:p-4 shadow-md border-2 cursor-pointer transition
                      ${
                        isActive
                          ? "border-button-bg-ac bg-blue-50/40"
                          : "border-gray-200 bg-white"
                      }
                    `}
                  >
                    <div className="flex-1 pr-4">
                      <h1 className="text-base font-semibold">
                        {plan.serviceName}
                      </h1>
                      <p className="text-sm font-medium">
                        {formatMoney(plan.servicePrice)}đ/
                        {plan.serviceBillingCycle === "monthly"
                          ? "tháng"
                          : "năm"}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        {plan.serviceDescription}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`
                          w-6 h-6 rounded-full border flex items-center justify-center
                          ${
                            isActive
                              ? "bg-button-bg-ac border-button-bg-ac"
                              : "border-gray-300 bg-white"
                          }
                        `}
                      >
                        {isActive && (
                          <IoMdCheckmark className="w-4 h-4 text-white pointer-events-none" />
                        )}
                      </span>

                      <input
                        id={`plan-${plan._id}`}
                        type="radio"
                        name="servicePlan"
                        value={plan._id}
                        checked={isActive}
                        onChange={() => setSelectedServicePlan(plan._id)}
                        className="sr-only"
                      />
                    </div>
                  </label>
                );
              })}

              {!plans?.length && (
                <p className="text-sm text-gray-500 italic">
                  Hiện chưa có gói dịch vụ nào được cấu hình.
                </p>
              )}
            </div>
          )}

          {/* STEP 4: Payment */}
          {step === "payment" && (
            <div className="flex flex-col items-center gap-4 text-center w-full md:w-[500px]">
              <h2 className="text-base md:text-lg font-semibold">
                Thanh toán phí dịch vụ
              </h2>

              {selectedPlan ? (
                <div className="border rounded-3xl px-4 py-3 w-full text-left bg-gray-50">
                  <p className="text-sm font-semibold">
                    Gói: {selectedPlan.serviceName}
                  </p>
                  <p className="text-sm">
                    Phí:{" "}
                    <span className="font-bold text-red-500">
                      {formatMoney(selectedPlan.servicePrice)}đ
                    </span>{" "}
                    /
                    {selectedPlan.serviceBillingCycle === "monthly"
                      ? "tháng"
                      : "năm"}
                  </p>
                  {selectedPlan.serviceDescription && (
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedPlan.serviceDescription}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-red-500">
                  Bạn chưa chọn gói. Vui lòng quay lại bước trước.
                </p>
              )}

              <p className="text-xs md:text-sm text-gray-600">
                Hệ thống sẽ xử lý thanh toán cho gói bạn đã chọn. (Hiện tại đang
                ở chế độ thử nghiệm, thanh toán được coi như
                <span className="font-semibold"> thành công</span> sau khi bạn
                bấm <span className="font-semibold">“Thanh toán”</span>.)
              </p>

              <div className="w-32 h-32 border-2 border-dashed rounded-2xl flex items-center justify-center text-[10px] text-gray-400">
                Đang xử lý thanh toán...
              </div>
            </div>
          )}

          {/* STEP 5: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-green-600 font-bold text-lg">
                Đăng ký thành công!
              </h2>
              {selectedPlan && (
                <p className="text-gray-600 text-sm">
                  Bạn đã đăng ký gói{" "}
                  <span className="font-semibold">
                    {selectedPlan.serviceName}
                  </span>
                  . Hạn dùng sẽ được tính theo chu kỳ{" "}
                  {selectedPlan.serviceBillingCycle === "monthly"
                    ? "tháng"
                    : "năm"}
                  .
                </p>
              )}
              <p className="text-gray-500 text-sm">
                Shop của bạn đã được tạo. Bạn có thể bắt đầu thêm sản phẩm.
              </p>
              <button
                onClick={() =>
                  navigate(
                    `/${path.SELLER}/${current?._id}/${path.S_DASHBOARD}`
                  )
                }
                className="rounded-full px-3 py-1 bg-button-bg-ac hover:bg-button-bg-hv text-white text-sm"
              >
                Quản lý shop
              </button>
            </div>
          )}
        </div>

        {/* === Nút điều hướng === */}
        {step !== "success" && (
          <div className="sticky bottom-0 w-full flex justify-end gap-2 text-sm bg-white pt-3">
            <button
              onClick={prevStep}
              disabled={currentIndex === 0 || loading}
              className="px-4 py-1 rounded-3xl border hover:bg-gray-100 disabled:opacity-50"
            >
              Quay lại
            </button>
            <button
              onClick={nextStep}
              disabled={loading || !canGoNext}
              className="px-4 py-1 rounded-3xl bg-button-bg-ac text-white hover:bg-button-bg-hv disabled:opacity-50"
            >
              {loading
                ? "Đang xử lý..."
                : step === "payment"
                ? "Thanh toán"
                : "Tiếp theo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
