// src/components/orders/OrderProgressTimeline.jsx
import React, { useMemo } from "react";
import moment from "moment";
import {
  AiOutlineFileText,
  AiOutlineDollar,
  AiOutlineInbox,
  AiOutlineStar,
} from "react-icons/ai";
import { LuTruck } from "react-icons/lu";

export const OrderProgressTimeline = ({
  statusName,
  timestamps = {},
  className = "",
}) => {
  const steps = useMemo(
    () => [
      {
        key: "placed",
        label: "Đơn Hàng Đã Đặt",
        icon: AiOutlineFileText,
        timeKey: "placedAt",
      },
      {
        key: "payment_ok",
        label: "Xác nhận đơn hàng",
        icon: AiOutlineDollar,
        timeKey: "paymentConfirmedAt",
      },
      {
        key: "to_carrier",
        label: "Đã Giao Cho ĐVVC",
        icon: LuTruck,
        timeKey: "handedToCarrierAt",
      },
      {
        key: "delivered",
        label: "Đã Giao Hàng",
        icon: AiOutlineInbox,
        timeKey: "deliveredAt",
      },
      {
        key: "done",
        label: "Đơn Hàng Đã Hoàn Thành",
        icon: AiOutlineStar,
        timeKey: "completedAt",
      },
    ],
    []
  );

  // 👉 Cập nhật map: thêm Delivered
  const currentIndex = useMemo(() => {
    const map = {
      Pending: 0,
      Confirmed: 1,
      Shipping: 2,
      Delivered: 3,
      Succeeded: 4,
    };
    return map[statusName] ?? 0;
  }, [statusName]);

  const isCancelled = statusName === "Cancelled";
  const cols = steps.length * 2 - 1;

  if (isCancelled) return null;

  return (
    <div className={`w-full px-2 md:px-4 ${className}`}>
      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {/* ICON + CONNECTOR */}
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIndex;
          const isBarDone = idx < currentIndex;
          const circleCls = isDone
            ? "border-green-500 text-green-600"
            : "border-gray-300 text-gray-400";
          const barCls = isBarDone ? "bg-green-500" : "bg-gray-200";

          return (
            <React.Fragment key={`icons-${step.key}`}>
              <div className="flex justify-center overflow-hidden">
                <div
                  className={`relative z-10 w-14 h-14 rounded-full border-4 bg-white flex items-center justify-center ${circleCls}`}
                >
                  <Icon size={22} />
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`h-1 self-center ${barCls} -ml-6 -mr-6`}
                  style={{ width: "calc(100% + 3rem)" }}
                />
              )}
            </React.Fragment>
          );
        })}

        <div className="col-span-full h-3" />

        {/* LABEL + TIME */}
        {steps.map((step, idx) => {
          const time = timestamps?.[step.timeKey]
            ? moment(timestamps[step.timeKey]).format("HH:mm DD-MM-YYYY")
            : "";
          return (
            <React.Fragment key={`labels-${step.key}`}>
              <div className="flex flex-col items-center text-center px-1">
                <div className="text-xs md:text-sm font-medium max-w-[160px] md:max-w-[200px]">
                  {step.label}
                </div>
                <div className="text-[11px] text-gray-400">{time}</div>
              </div>
              {idx < steps.length - 1 && <div />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
