import { formatMoney } from "../../ultils/helpers";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { CloseButton } from "../../components";
import { apiGetServicePlans } from "../../services/shop.api";
import { apiCreateVNPayPayment } from "../../services/payment.api";
import { bankInfo, APP_INFO } from "../../ultils/contants";
import { showAlert, showModal } from "store/app/appSlice";
import { IoMdCheckmark } from "react-icons/io";
import path from "ultils/path";

/**
 * Mẫu test vnpay
 * ngan hang:  NCB
 * so the: 	9704198526191432198
 * ten chu the:  NGUYEN VAN A
 * ngay phat hanh:  07/15
 * opt: 123456
 */

export const SubscriptionsServicePlan = ({
  onClose,
  currentService,
  shopId,
  subscriptionId,
}) => {
  const dispatch = useDispatch();
  const { current: currentUser } = useSelector((s) => s.user);

  const [loading, setLoading] = useState(false);
  // Dùng step thay cho showSevicePlan. Bắt đầu từ 'info' nếu có gói cũ, 'plan' nếu đăng ký mới.
  const [step, setStep] = useState(currentService ? "info" : "plan");
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  const paymethods = [
    { name: "QR", description: "Thanh toán quét mã QR" },
    { name: "VNpay", description: "Thanh toán qua VNPay" },
  ];

  // ================== FETCH PLANS ==================
  // Thay thế hàm fetchPlans hiện tại bằng hàm này:
  const fetchPlans = async () => {
    setLoading(true);

    // 1. KIỂM TRA CACHE
    const cachedPlans = sessionStorage.getItem("servicePlansCache");
    if (cachedPlans) {
      try {
        const plansData = JSON.parse(cachedPlans);
        if (plansData.length > 0) {
          // Tái sử dụng dữ liệu nếu hợp lệ
          setPlans(plansData);
          setLoading(false);

          return; // Dừng lại, không gọi API
        }
      } catch (e) {
        console.error("Error parsing cached plans, fetching new data.");
        sessionStorage.removeItem("servicePlansCache"); // Xóa cache lỗi
      }
    }

    // 2. GỌI API NẾU KHÔNG CÓ CACHE HOẶC CACHE LỖI
    try {
      const res = await apiGetServicePlans({ sort: "oldest" });
      if (res?.success) {
        setPlans(res.plans || []);
        // 3. LƯU VÀO CACHE CHO CÁC LẦN TẢI SAU
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

  // ================== QR CODE INFO ==================
  const notePrefix = `${APP_INFO?.NAME || "SHOPAPP"}`;
  const userName =
    currentUser?.userFirstName ||
    currentUser?.userLastName ||
    currentUser?.userEmail ||
    "Khách hàng";

  const qrAmount = selectedPlan ? Number(selectedPlan.servicePrice || 0) : 0;
  const transferContent = selectedPlan
    ? `${userName} thanh toan goi ${selectedPlan.serviceName} cho shop ${shopId}`
    : `${userName} thanh toan phi dich vu`;

  // ================== RENDER ITEM (Phần logic được giữ nguyên) ==================
  const renderItem = (plan) => {
    return (
      <>
        <div className="flex gap-1 items-center">
          <span
            className="w-3 h-3 rounded-full border"
            style={{ backgroundColor: plan.serviceColor || "#ffffff" }}
          ></span>
          <h1 className="text-base font-semibold">{plan.serviceName}</h1>
        </div>

        <p className="text-sm font-medium mb-1">
          {formatMoney(plan.servicePrice)}đ/
          {plan.serviceBillingCycle === "monthly" ? "tháng" : "năm"}
        </p>
        <p className="text-xs text-gray-700 mb-1">{plan.serviceDescription}</p>
        <div className="text-xs text-gray-700">
          {Array.isArray(plan.serviceFeatures) &&
            plan.serviceFeatures.length > 0 && (
              <ul className="list-disc pl-3 text-xs">
                {plan.serviceFeatures.map((f) => (
                  <li key={f.key}>
                    <span className="">{f.label}: </span>
                    <span>
                      {f.type === "boolean"
                        ? String(f.value).toLowerCase() === "true" ||
                          String(f.value) === "1"
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
      </>
    );
  };

  // ================== STEP NAVIGATION LOGIC (Giữ nguyên) ==================
  const handleNextStep = () => {
    if (step === "info") {
      setStep("plan");
    } else if (step === "plan") {
      if (!selectedPlan) {
        dispatch(
          showAlert({
            title: "Chưa chọn gói",
            message: "Vui lòng chọn một gói dịch vụ để tiếp tục.",
            variant: "danger",
          })
        );
        return;
      }
      setStep("payment");
    } else if (step === "payment") {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (step === "plan") {
      if (currentService) {
        setStep("info");
      } else {
        onClose();
      }
    } else if (step === "payment") {
      setStep("plan");
    }
  };

  // ================== SUBMIT (Logic được giữ nguyên) ==================
  const handleSubmit = async () => {
    if (!selectedPlan || !paymentMethod) return;

    const payloadForResult = {
      shopsubscribesId: subscriptionId || null,
      selectedPlan,
      shopId,
      type: "shop_subscription",
    };

    sessionStorage.setItem(
      "registerSevicePlanPayload",
      JSON.stringify(payloadForResult)
    );

    if (paymentMethod === "QR") {
      window.location.href = `/${path.REGISTER_SERVICE_PLAN}/result?status=success&paymentMethod=QR&flow=subscription`;
      return;
    }

    if (paymentMethod === "VNpay") {
      try {
        setLoading(true);

        const resPayment = await apiCreateVNPayPayment({
          amount: Math.round(Number(selectedPlan.servicePrice || 0)),
          bankCode: "NCB",
          orderInfo: `Thanh toan goi dich vu shop: ${shopId}`,
          returnPath: `/${path.REGISTER_SERVICE_PLAN}/result`,
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

  // ================== UI STATE VARIABLES ==================
  const isFirstStep = step === "info" || (!currentService && step === "plan");
  const isLastStep = step === "payment";
  const canGoNext = isLastStep
    ? !!paymentMethod
    : !!selectedPlan || step === "info";

  let title = "Thông tin gói hiện tại";
  if (step === "plan") title = "Chọn gói";
  if (step === "payment") title = "Thanh toán";

  const showSevicePlan = step === "plan";
  const showPaymentContent = step === "payment";

  // === LOGIC LỌC BỎ GÓI HIỆN TẠI ===
  const availablePlans = useMemo(() => {
    if (!currentService) return plans;
    // Nếu có gói hiện tại, lọc bỏ gói đó khỏi danh sách lựa chọn
    return plans.filter((plan) => plan._id !== currentService._id);
  }, [plans, currentService]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      // Giữ nguyên w-[60vh] h-auto theo giao diện ban đầu
      className="bg-white border rounded-3xl p-2 md:p-4 relative w-[60vh] h-auto flex flex-col gap-2"
    >
      <CloseButton onClick={onClose} className="top-2 right-2" />
      <p className="text-lg font-bold text-center">{title}</p>
      {/* Content */}
      <div className="w-full flex-1 flex flex-col items-center justify-start py-2 overflow-y-auto max-h-[70vh]">
        {/* === Hiển thị thông tin gói hiện tại (step 'info') === */}
        {step === "info" && (
          <div className="flex flex-col w-full px-2">
            <div className="flex flex-col">
              {currentService ? (
                <div className="p-2 border rounded-xl">
                  {renderItem(currentService)}
                </div>
              ) : (
                <div className="text-center text-sm">
                  <p>Không có thông tin gói đăng ký</p>
                  <p>Vui lòng chọn gói để duy trì cửa hàng</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === Hiển thị danh sách gói (step 'plan') === */}
        {showSevicePlan && (
          <div className="h-[400px] overflow-y-auto w-full px-2">
            {/* === THÔNG BÁO KHI KHÔNG CÓ GÓI HIỆN TẠI (STARTING FRESH) === */}
            {!currentService && (
              <div className="text-center text-sm mb-4 p-2">
                <p className="font-medium text-red-600">
                  Vui lòng chọn một gói dịch vụ để duy trì cửa hàng của bạn.
                </p>
              </div>
            )}

            <div className="flex flex-col items-center gap-4 text-black w-full ">
              {/* === SỬ DỤNG availablePlans ĐÃ ĐƯỢC LỌC === */}
              {availablePlans.map((plan) => {
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
                                  : "border-gray-200 bg-white hover:bg-gray-50"
                              }
                            `}
                  >
                    <div className="flex-1 pr-4">{renderItem(plan)}</div>

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

              {/* === THÔNG BÁO KHI KHÔNG CÓ GÓI NÀO ĐỂ CHỌN === */}
              {!plans?.length && !loading && (
                <p className="text-sm text-gray-500 italic">
                  Hiện chưa có gói dịch vụ nào được cấu hình.
                </p>
              )}
              {currentService && availablePlans.length === 0 && !loading && (
                <p className="text-sm text-gray-500 italic">
                  Bạn đang sử dụng gói dịch vụ cao nhất hoặc không có gói nào
                  khác để nâng cấp.
                </p>
              )}
              {loading && (
                <p className="text-sm text-gray-500 italic">
                  Đang tải gói dịch vụ...
                </p>
              )}
            </div>
          </div>
        )}

        {/* === Hiển thị thanh toán (step 'payment') === */}
        {showPaymentContent && (
          <div className="flex flex-col items-center gap-4 text-center w-full px-2">
            {/* === GHI CHÚ HỦY GÓI CŨ (NẾU CÓ) === */}
            {currentService && (
              <div className="border border-yellow-400 bg-yellow-50 text-yellow-700 text-xs px-3 py-2 rounded-xl w-full text-left font-medium">
                <p>
                  ⚠️ Việc thanh toán gói dịch vụ mới sẽ dẫn đến việc hủy bỏ gói
                  hiện tại của bạn ({currentService?.serviceName}).
                </p>
              </div>
            )}

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
                    className={`flex-1 text-center mb-2 px-2 py-1 border rounded-2xl hover:bg-gray-100 transition text-sm
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
              <div className="flex flex-col items-center gap-2 p-4 border rounded-xl bg-gray-50 w-full">
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
                    <strong>Nội dung:</strong> {transferContent}
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

      {/* Action button: 2 nút (Thoát/Quay lại và Tiếp theo/Thanh toán) */}
      <div className="flex gap-1 justify-end items-center ">
        {/* Nút 1: Thoát / Quay lại */}
        <button
          onClick={isFirstStep ? onClose : handlePrevStep}
          disabled={loading}
          className="px-3 py-1 text-sm bg-button-bg hover:bg-button-hv rounded-3xl disabled:opacity-50"
        >
          {isFirstStep ? "Thoát" : "Quay lại"}
        </button>

        {/* Nút 2: Tiếp theo / Thanh toán */}
        <button
          onClick={handleNextStep}
          disabled={loading || !canGoNext}
          className="px-3 py-1 text-sm bg-button-bg-ac hover:bg-button-bg-hv rounded-3xl text-white disabled:opacity-50"
        >
          {loading
            ? "Đang xử lý..."
            : isLastStep
            ? "Thanh toán"
            : step === "info"
            ? currentService
              ? "Nâng cấp"
              : "Đăng ký"
            : "Tiếp theo"}
        </button>
      </div>
    </div>
  );
};
