// ServicePlansManage.jsx
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  apiGetServicePlans,
  apiDeleteServicePlan,
} from "../../services/shop.api";
import { showAlert, showModal } from "store/app/appSlice";
import { CreateServicePlanForm } from "./createServicePlanForm";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import noData from "../../assets/data-No.png";
import { Loading } from "../../components";
import { useSearchParams } from "react-router-dom";
import moment from "moment";
import { formatMoney } from "ultils/helpers";

export const ServicePlansManage = () => {
  const dispatch = useDispatch();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = searchParams.get("s") || "";
  const sortParam = searchParams.get("sort") || "newest";

  const [isShowSort, setIsShowSort] = useState(false);

  const sortOptions = [
    { label: "Mới nhất", sort: "newest" },
    { label: "Cũ nhất", sort: "oldest" },
    { label: "Tên A-Z", sort: "name_asc" },
    { label: "Tên Z-A", sort: "name_desc" },
    { label: "Giá thấp đến cao", sort: "price_asc" },
    { label: "Giá cao đến thấp", sort: "price_desc" },
    { label: "Theo tháng", sort: "billingCycle_monthly" },
    { label: "Theo năm", sort: "billingCycle_yearly" },
  ];

  const currentSort =
    sortOptions.find((opt) => opt.sort === sortParam) || sortOptions[0];

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const query = {
        sort: sortParam,
      };
      if (searchKeyword) query.s = searchKeyword;

      const res = await apiGetServicePlans(query);
      if (res?.success) {
        setPlans(res.plans || []);
        setCount(res.plans?.length || 0);
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
  }, [searchKeyword, sortParam]);

  const handleDelete = (plan) => {
    const alertId = nextAlertId();

    registerHandlers(alertId, {
      onConfirm: async () => {
        dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
        const res = await apiDeleteServicePlan(plan._id);
        dispatch(showModal({ isShowModal: false }));

        if (res?.success) {
          dispatch(
            showAlert({
              title: "Đã xoá gói",
              message: plan.serviceName,
              variant: "success",
              duration: 1500,
              showConfirmButton: false,
              showCancelButton: false,
            })
          );
          fetchPlans();
        } else {
          dispatch(
            showAlert({
              title: "Xoá thất bại",
              message:
                res?.message || "Không thể xoá gói dịch vụ. Vui lòng thử lại.",
              variant: "danger",
              duration: 1500,
              showCancelButton: false,
              showConfirmButton: false,
            })
          );
        }
      },
    });

    dispatch(
      showAlert({
        id: alertId,
        title: "Xác nhận xoá gói dịch vụ?",
        message: plan.serviceName,
        variant: "danger",
        showCancelButton: true,
        confirmText: "Xoá",
        cancelText: "Hủy",
      })
    );
  };

  const handleCreatePlan = () => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <CreateServicePlanForm
            initialData={null}
            onClose={() => dispatch(showModal({ isShowModal: false }))}
            onCloseSuccess={() => fetchPlans()}
          />
        ),
      })
    );
  };

  const handleEditPlan = (plan) => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <CreateServicePlanForm
            initialData={plan}
            onClose={() => dispatch(showModal({ isShowModal: false }))}
            onCloseSuccess={() => fetchPlans()}
          />
        ),
      })
    );
  };

  const titleCls = "font-bold mb-1";
  const buttonAction =
    "text-xs md:text-sm whitespace-nowrap border px-2 py-1 rounded-3xl flex items-center gap-1 text-black bg-button-bg hover:bg-button-hv";

  const renderPlanItem = (plan) => {
    const cycleLabel =
      plan.serviceBillingCycle === "monthly"
        ? "Theo tháng"
        : plan.serviceBillingCycle === "yearly"
        ? "Theo năm"
        : plan.serviceBillingCycle;

    return (
      <div
        key={plan._id}
        className="flex items-center justify-between p-3 md:p-4 rounded-3xl  bg-white border shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {/* Màu gói */}
            <span
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: plan.serviceColor || "#ffffff" }}
            ></span>
            <p className="font-semibold text-sm md:text-base">
              {plan.serviceName}
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
              {cycleLabel}
            </span>
          </div>

          {plan.serviceDescription && (
            <p className="text-xs md:text-sm">{plan.serviceDescription}</p>
          )}

          <div className="text-sm">
            Giá:{" "}
            <span className="font-semibold">
              {formatMoney(plan.servicePrice)}đ
            </span>
          </div>

          <div className="text-sm">Quyền lợi:</div>
          {/* Quyền lợi */}
          {Array.isArray(plan.serviceFeatures) &&
            plan.serviceFeatures.length > 0 && (
              <ul className="list-disc pl-4 space-y-1 text-xs">
                {plan.serviceFeatures.map((f) => (
                  <li key={f.key}>
                    <span className="font-medium">{f.label}: </span>
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
          <div className="text-sm ">
            Người đăng ký: {plan.serviceSubscriberCount || 0}
          </div>
          <div className="text-[11px] text-gray-500 italic">
            Ngày tạo: {moment(plan.createdAt).format("DD/MM/YYYY")}
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <button className={buttonAction} onClick={() => handleEditPlan(plan)}>
            <AiOutlineEdit size={16} />
            Sửa
          </button>
          <button className={buttonAction} onClick={() => handleDelete(plan)}>
            <AiOutlineDelete size={16} />
            Xoá
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-sm text-gray-600">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-4">
      {/* HEADER BAR */}
      <div className="bg-app-bg/60 backdrop-blur-sm rounded-3xl px-3 py-2 md:px-4 sticky top-[50px] z-10 flex justify-between items-center gap-2">
        <h1 className={titleCls}>{count} gói dịch vụ</h1>

        <div className="flex items-center gap-2">
          {/* SORT */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsShowSort((v) => !v)}
              className="glass shadow-md md:px-2 py-1 px-1 border rounded-2xl text-description flex items-center gap-1"
              aria-haspopup="listbox"
              aria-expanded={isShowSort}
            >
              Sắp xếp: <span className="font-bold">{currentSort.label}</span>
              {isShowSort ? (
                <MdKeyboardArrowUp size={18} className="ml-1" />
              ) : (
                <MdKeyboardArrowDown size={18} className="ml-1" />
              )}
            </button>

            {isShowSort && (
              <div
                role="listbox"
                className="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-md border rounded-xl shadow-lg p-1 z-20"
              >
                {sortOptions.map((opt) => {
                  const isActive = opt.sort === sortParam;
                  return (
                    <button
                      key={opt.sort}
                      onClick={() => {
                        setSearchParams((prev) => {
                          const params = new URLSearchParams(prev);
                          params.set("sort", opt.sort);
                          return params;
                        });
                        setIsShowSort(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-action ${
                        isActive ? "bg-white/20 font-bold" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleCreatePlan}
            className="bg-button-bg-ac hover:bg-button-bg-hv px-4 py-1 whitespace-nowrap rounded-3xl text-white shadow-md text-sm"
          >
            Thêm gói dịch vụ
          </button>
        </div>
      </div>

      {/* BODY */}
      {plans.length > 0 ? (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {plans.map((p) => renderPlanItem(p))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center w-full h-[500px]">
          <img src={noData} alt="Không có dữ liệu" className="w-36 h-36 mb-2" />
          <p className="text-gray-600">Chưa có gói dịch vụ nào</p>
        </div>
      )}
    </div>
  );
};
