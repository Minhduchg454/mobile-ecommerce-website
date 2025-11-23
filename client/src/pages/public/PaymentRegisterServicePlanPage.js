// src/pages/shop/RegisterShopResultPage.jsx
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  apiCreateSubscription,
  apiCancelSubscription,
} from "../../services/shop.api";
import { fetchSellerCurrent } from "store/seller/asynsActions";
import { getCurrent } from "store/user/asyncActions";
import { showAlert } from "store/app/appSlice";
import path from "ultils/path";

export const RegisterServicePlanPage = () => {
  const [params] = useSearchParams();
  const status = params.get("status");

  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current } = useSelector((s) => s.user);
  const currentId = current?._id;
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // 1. Kiểm tra điều kiện đầu tiên để chạy logic
    if (status !== "success" && status !== "pending") return;

    // Ngăn logic chạy lại nếu đã hoàn tất xử lý trong phiên này
    if (isProcessingRef.current) return;

    // Lấy payload và kiểm tra
    const raw = sessionStorage.getItem("registerSevicePlanPayload");
    if (!raw) return;

    isProcessingRef.current = true; // Đánh dấu đang xử lý

    const run = async () => {
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch (e) {
        console.error("Parse error", e);
        // Xóa cờ xử lý nếu có lỗi parse
        isProcessingRef.current = false;
        return;
      }

      const { shopId, selectedPlan, shopsubscribesId } = payload;
      if (!selectedPlan) {
        isProcessingRef.current = false;
        return;
      }

      setProcessing(true);
      try {
        // 1. Xử lý hủy gói cũ (nếu có)
        if (shopsubscribesId) {
          const res = await apiCancelSubscription(shopsubscribesId);
          if (!res?.success) {
            // Cảnh báo nhưng vẫn tiếp tục tạo gói mới
            dispatch(
              showAlert({
                title: "Cảnh báo",
                message: res?.message || "Không thể hủy gói hiện tại",
                variant: "warning",
              })
            );
          }
        }

        // 2. Tính toán ngày hết hạn
        const servicePrice = Number(selectedPlan.servicePrice || 0);
        const billingCycle = selectedPlan.serviceBillingCycle || "monthly";

        const expDate = (() => {
          const now = new Date();
          const exp = new Date(now);
          if (billingCycle === "yearly") exp.setFullYear(exp.getFullYear() + 1);
          else exp.setMonth(exp.getMonth() + 1);
          return exp.toISOString();
        })();

        // 3. Tạo subscription mới
        const subPayload = {
          shopId,
          serviceId: selectedPlan._id,
          subPrice: servicePrice,
          subExpirationDate: expDate,
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

        // 4. Refresh + cleanup
        if (currentId) {
          dispatch(fetchSellerCurrent(currentId));
        }
        dispatch(getCurrent());
        sessionStorage.removeItem("registerSevicePlanPayload");
        setDone(true);
      } catch (e) {
        console.error(e);
        dispatch(
          showAlert({
            title: "Lỗi",
            message: e?.message || "Đăng ký gói thất bại",
            variant: "danger",
          })
        );
      } finally {
        setProcessing(false);
      }
    };

    run();
  }, [status, dispatch, currentId]);

  // === XÁC ĐỊNH TRẠNG THÁI RENDER ===
  let content;

  if (status === "fail") {
    content = (
      <div className="min-h-[300px] lg:mx-auto lg:w-[800px] bg-white m-4 rounded-3xl p-4 shadow-md flex flex-col justify-center items-center text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Thanh toán thất bại
        </h1>
        <p className="mb-4">
          Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-3xl border hover:bg-gray-100"
        >
          Quay lại đăng ký gói
        </button>
      </div>
    );
  } else if (processing || (!done && status !== "fail")) {
    content = (
      <div className="min-h-[300px] lg:mx-auto lg:w-[800px] bg-white m-4 rounded-3xl p-4 shadow-md flex flex-col justify-center items-center text-center">
        <p className="text-lg font-semibold mb-2">
          Đang hoàn tất đăng ký gói...
        </p>
        <p className="text-sm text-gray-500">
          Vui lòng không đóng trình duyệt trong khi hệ thống xử lý.
        </p>
      </div>
    );
  } else if (done) {
    content = (
      <div className="min-h-[300px] lg:mx-auto lg:w-[800px] bg-white m-4 rounded-3xl p-4 shadow-md flex flex-col justify-center items-center text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-2">
          Đăng ký gói thành công
        </h1>
        <div className="mb-4">
          <p>Gói dịch vụ của bạn đã được kích hoạt.</p>
          <p>Bạn có thể bắt đầu quản lý shop ngay bây giờ.</p>
        </div>
        <button
          onClick={() =>
            navigate(`/${path.SELLER}/${current?._id}/${path.S_DASHBOARD}`)
          }
          className="px-4 py-1 rounded-3xl bg-button-bg-ac text-white hover:bg-button-bg-hv"
        >
          Quản lý shop
        </button>
      </div>
    );
  } else {
    content = (
      <div className="min-h-[300px] lg:mx-auto lg:w-[800px] bg-white m-4 rounded-3xl p-4 shadow-md flex flex-col justify-center items-center text-center">
        <p>Không xác định được trạng thái thanh toán.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-4 py-1 rounded-3xl border"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="h-[60vh] flex flex-col justify-center items-center">
      {content}
    </div>
  );
};
