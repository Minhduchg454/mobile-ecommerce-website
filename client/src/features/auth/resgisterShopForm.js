// src/pages/shop/RegisterShopForm.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiGetServicePlans } from "../../services/shop.api";
import { apiCreateVNPayPayment } from "../../services/payment.api";
import { AddressFormModal } from "../../features/user/AddressFormModal";
import { FaCheck } from "react-icons/fa";
import { IoMdCheckmark } from "react-icons/io";
import { showAlert, showModal } from "store/app/appSlice";
import { useNavigate } from "react-router-dom";
import path from "ultils/path";
import { formatMoney } from "../../ultils/helpers";
import { APP_INFO } from "../../ultils/contants";

/**
 * Mẫu test vnpay
 * ngan hang:  NCB
 * so the: 	9704198526191432198
 * ten chu the:  NGUYEN VAN A
 * ngay phat hanh:  07/15
 * opt: 123456
 */

export const RegisterShopForm = () => {
  const { current } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null); // Đổi: lưu toàn bộ object plan
  const [pickupAddress, setPickupAddress] = useState(null); // Vẫn giữ UI, nhưng không gửi đi

  const [step, setStep] = useState("info");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  const [formData, setFormData] = useState({
    userId: current?._id,
    shopName: "",
    shopDescription: "",
    shopIsOffical: false,
  });

  const paymethods = [
    { name: "QR", description: "Thanh toán quét mã QR" },
    { name: "VNpay", description: "Thanh toán qua VNPay" },
  ];

  const bankInfo = {
    bankName: "Vietinbank",
    accountName: "NGUYEN HUU DUC",
    accountNumber: "103874068274",
  };

  // ================== FETCH PLANS ==================
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await apiGetServicePlans({ sort: "oldest" });
      if (res?.success) {
        setPlans(res.plans || []);
        // Cache plans để dùng ở ResultPage
        sessionStorage.setItem(
          "servicePlansCache",
          JSON.stringify(res.plans || [])
        );
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
    ],
    []
  );

  const currentIndex = steps.findIndex((s) => s.key === step);

  // ================== Payment helper (QR) ==================
  const notePrefix = `${APP_INFO.NAME}`;
  const userName =
    current?.userFirstName ||
    current?.userLastName ||
    current?.userEmail ||
    "Khách hàng";

  const qrAmount = selectedPlan ? Number(selectedPlan.servicePrice || 0) : 0;
  const transferContent = selectedPlan
    ? `${userName} thanh toan goi ${selectedPlan.serviceName} cho ${notePrefix}`
    : `${userName} thanh toan phi dich vu ${notePrefix}`;

  // ================== RULE: Step có được Next không ==================
  const canGoNext = useMemo(() => {
    if (step === "info") {
      return formData.shopName?.trim().length > 0;
    }
    if (step === "servicePlan") {
      return !!selectedPlan;
    }
    if (step === "payment") {
      return !!paymentMethod && !!selectedPlan;
    }
    return false;
  }, [step, formData.shopName, selectedPlan, paymentMethod]);

  const validateStep = () => {
    if (step === "info" && !formData.shopName?.trim()) {
      dispatch(
        showAlert({
          title: "Thiếu thông tin",
          message: "Vui lòng nhập Tên cửa hàng.",
          variant: "danger",
        })
      );
      return false;
    }

    if (step === "servicePlan" && !selectedPlan) {
      dispatch(
        showAlert({
          title: "Chưa chọn gói",
          message: "Vui lòng chọn một gói dịch vụ để tiếp tục.",
          variant: "danger",
        })
      );
      return false;
    }

    if (step === "payment") {
      if (!paymentMethod) {
        dispatch(
          showAlert({
            title: "Chưa chọn phương thức",
            message: "Vui lòng chọn phương thức thanh toán.",
            variant: "warning",
          })
        );
        return false;
      }
      if (!selectedPlan) {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: "Không tìm thấy gói dịch vụ đã chọn.",
            variant: "danger",
          })
        );
        return false;
      }
    }

    return true;
  };

  const nextStep = async () => {
    if (!validateStep()) return;

    if (step === "payment") {
      return handleSubmit();
    }

    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].key);
    }
  };

  const prevStep = () => {
    if (currentIndex > 0) {
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

  // ================== SUBMIT (Tạo shop + subscription + payment) ==================
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

    if (!paymentMethod) {
      dispatch(
        showAlert({
          title: "Chưa chọn phương thức",
          message: "Vui lòng chọn phương thức thanh toán.",
          variant: "warning",
        })
      );
      return;
    }

    // Lưu payload: gửi toàn bộ plan + formData, KHÔNG gửi pickupAddress
    const payloadForResult = {
      formData,
      selectedPlan, // Gửi nguyên object plan
      paymentMethod,
      type: "shop_register",
    };

    sessionStorage.setItem(
      "registerShopPayload",
      JSON.stringify(payloadForResult)
    );

    if (paymentMethod === "QR") {
      navigate(`/${path.REGISTER_SHOP}/result?status=pending&paymentMethod=QR`);
      return;
    }

    if (paymentMethod === "VNpay") {
      try {
        setLoading(true);

        const resPayment = await apiCreateVNPayPayment({
          amount: Math.round(Number(selectedPlan.servicePrice || 0)),
          bankCode: "NCB",
          orderInfo: `Thanh toan goi dich vu shop`,
          returnPath: `/${path.REGISTER_SHOP}/result`,
        });

        const url = resPayment?.paymentUrl;
        if (!url) throw new Error("Không nhận được paymentUrl");
        window.location.href = url;
      } catch (e) {
        console.error(e);
        dispatch(
          showAlert({
            title: "Lỗi",
            message: "Không tạo được thanh toán VNPay",
            variant: "danger",
          })
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // ================== UI ==================
  const cols = steps.length * 2 - 1;

  return (
    <div className="h-[calc(100vh-100px)] m-2 md:m-4 flex flex-col justify-center items-center animate-fadeIn">
      <div className="relative w-full h-[600px] md:w-[800px] bg-white rounded-3xl p-4 flex flex-col items-center justify-between shadow-md">
        {/* Thanh tiến trình */}
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

        {/* Nội dung chính */}
        <div className="w-full flex-1 overflow-y-auto flex flex-col items-center justify-start py-2 md:py-4">
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

              {/* Địa chỉ lấy hàng - chỉ để UI, không bắt buộc, không gửi đi */}
              <div>
                <div className="flex gap-2 items-center justify-start">
                  <p className="text-sm px-2">Địa chỉ lấy hàng</p>
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
                    (Tùy chọn) Bạn có thể thêm địa chỉ lấy hàng.
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
                    className="peer appearance-none w-4 h-4 border border-black rounded-sm"
                  />
                  <FaCheck className="absolute text-black opacity-0 peer-checked:opacity-100 w-3 h-3" />
                </span>
                <span>Đăng ký là shop Mall (chính hãng)</span>
              </label>
            </form>
          )}

          {/* STEP 2: Service Plan */}
          {step === "servicePlan" && (
            <div className="overflow-y-auto flex flex-col items-center gap-4 text-black w-full md:w-[600px]">
              {plans.map((plan) => {
                const isActive = selectedPlan?._id === plan._id;

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
                      <div className="flex gap-1 items-center">
                        <span
                          className="w-3 h-3 rounded-full border"
                          style={{
                            backgroundColor: plan.serviceColor || "#ffffff",
                          }}
                        ></span>
                        <h1 className="text-base font-semibold">
                          {plan.serviceName}
                        </h1>
                      </div>
                      <p className="text-sm font-medium mb-1">
                        {formatMoney(plan.servicePrice)}đ/
                        {plan.serviceBillingCycle === "monthly"
                          ? "tháng"
                          : "năm"}
                      </p>
                      <p className="text-xs text-gray-700 mb-1">
                        {plan.serviceDescription}
                      </p>
                      <div className="text-xs text-gray-700">
                        {Array.isArray(plan.serviceFeatures) &&
                          plan.serviceFeatures.length > 0 && (
                            <ul className="list-disc pl-3 text-xs">
                              {plan.serviceFeatures.map((f) => (
                                <li key={f.key}>
                                  <span className="">{f.label}: </span>
                                  <span>
                                    {f.type === "boolean"
                                      ? String(f.value).toLowerCase() ===
                                          "true" || String(f.value) === "1"
                                        ? "Có"
                                        : "Không"
                                      : f.unit
                                      ? `${f.value} ${f.unit}`
                                      : f.value}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                      {/* Quyền lợi */}
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
                        checked={isActive}
                        onChange={() => setSelectedPlan(plan)}
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

          {/* STEP 3: Payment */}
          {step === "payment" && (
            <div className="flex flex-col items-center gap-4 text-center w-full md:w-[500px]">
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

              <div className="w-full text-left">
                <p className="text-sm font-medium mb-2">
                  Chọn phương thức thanh toán:
                </p>
                <div className="flex gap-2">
                  {paymethods.map((pm) => (
                    <button
                      key={pm.name}
                      type="button"
                      onClick={() => setPaymentMethod(pm.name)}
                      className={`flex-1 text-center mb-2 px-2 py-1 border rounded-2xl hover:bg-gray-50 transition text-sm
                        ${
                          paymentMethod === pm.name
                            ? "border-2 border-button-bg-ac"
                            : ""
                        }`}
                    >
                      {pm.description}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === "QR" && (
                <div className="flex flex-col items-center gap-2  p-4 border rounded-xl bg-gray-50 w-full">
                  <p className="text-gray-700 text-sm font-medium">
                    Quét mã để chuyển khoản ngân hàng:
                  </p>

                  <img
                    src={`https://img.vietqr.io/image/ICB-${
                      bankInfo.accountNumber
                    }-compact2.jpg?amount=${qrAmount}&addInfo=${encodeURIComponent(
                      transferContent
                    )}`}
                    alt="QR VietQR"
                    className="w-40 h-40 md:w-52 md:h-52 object-contain"
                  />

                  <div className="text-xs md:text-sm text-center text-gray-600">
                    <p>
                      <strong>Ngân hàng:</strong> {bankInfo.bankName}
                    </p>
                    <p>
                      <strong>Chủ tài khoản:</strong> {bankInfo.accountName}
                    </p>
                    <p>
                      <strong>Số tài khoản:</strong> {bankInfo.accountNumber}
                    </p>
                    <p>
                      <strong>Nội dung chuyển khoản:</strong> {transferContent}
                    </p>
                    <p className="text-orange-600 italic text-xs mt-1">
                      Sau khi chuyển khoản, nhấn{" "}
                      <span className="font-semibold">"Thanh toán"</span> để
                      hoàn tất.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === "VNpay" && (
                <p className="text-xs md:text-sm text-gray-600 mt-2">
                  Bạn sẽ được chuyển hướng đến cổng VNPay để thanh toán.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Nút điều hướng */}
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
      </div>
    </div>
  );
};
