import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  apiGetCurrentUserBalanceByFor,
  apiGetPaymentAccounts,
  apiDeletePaymentAccount,
  apiGetTransactions,
} from "../../services/user.api";
import { showAlert } from "store/app/appSlice";
import { showModal } from "store/app/appSlice";
import { formatMoney } from "../../ultils/helpers";
import {
  BiPlus,
  BiTrendingUp,
  BiTrendingDown,
  BiHistory,
} from "react-icons/bi";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { PaymentAccountForm } from "./PaymentAccountForm";
import { BalanceWithdrawForm } from "./BalanceForm";
import { Pagination } from "../../components";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";

export const UserBalance = ({ balanceFor }) => {
  const dispatch = useDispatch();
  const { current } = useSelector((s) => s.user);

  const [balance, setBalance] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tranPage, setTranPage] = useState(1);
  const [tranCount, setTranCount] = useState(0);
  const tranLimit = 6;

  const istrue = current?.roles?.includes(balanceFor);
  const userId = current?._id;

  const fetchData = useCallback(async () => {
    if (!istrue || !userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [balanceRes, paymentRes, tranRes] = await Promise.all([
        apiGetCurrentUserBalanceByFor({ userId, balanceFor }),
        apiGetPaymentAccounts({ userId, paFor: balanceFor }),
        apiGetTransactions({
          userId,
          tranBalanceFor: balanceFor,
          page: tranPage,
          limit: tranLimit,
        }),
      ]);

      if (balanceRes?.success) setBalance(balanceRes.balance);

      if (paymentRes?.success) setPaymentMethods(paymentRes.accounts || []);
      if (tranRes?.success) {
        setTransactions(tranRes?.transactions || []);
        setTranCount(tranRes?.totalCount);
      }
    } catch (err) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không tải được dữ liệu",
          variant: "danger",
        })
      );
    } finally {
      setLoading(false);
    }
  }, [userId, balanceFor, istrue, dispatch, tranPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // Mở form thêm/sửa phương thức
  const openPaymentForm = (account = null) => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <PaymentAccountForm
            userId={userId}
            initialAccount={account}
            paFor={balanceFor}
            onSuccess={() => {
              dispatch(showModal({ isShowModal: false }));
              fetchData();
            }}
            onClose={() => dispatch(showModal({ isShowModal: false }))}
          />
        ),
      })
    );
  };

  // Mở form rút tiền với tài khoản ĐƯỢC CHỌN
  const openWithdrawForm = (selectedAccount) => {
    if (!balance || balance.balanceCurrent <= 0) {
      dispatch(
        showAlert({
          title: "Không đủ số dư",
          message: "Số dư hiện tại không đủ để rút",
          variant: "warning",
        })
      );
      return;
    }

    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <BalanceWithdrawForm
            userId={userId}
            balanceFor={balanceFor}
            currentBalance={balance.balanceCurrent}
            selectedAccount={selectedAccount} // ← chính xác tài khoản người dùng bấm
            onSuccess={() => {
              dispatch(showModal({ isShowModal: false }));
              fetchData();
            }}
            onClose={() => dispatch(showModal({ isShowModal: false }))}
          />
        ),
      })
    );
  };

  // Xóa phương thức
  const handleDelete = (accountId) => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: async () => {
        try {
          const res = await apiDeletePaymentAccount(userId, accountId);
          if (res?.success) {
            dispatch(
              showAlert({
                title: "Thành công",
                message: "Xóa thành công",
                variant: "success",
                showConfirmButton: false,
                duration: 1500,
              })
            );
            fetchData();
          } else {
            dispatch(
              showAlert({
                title: "Lỗi",
                message: res?.message || "Đã có lỗi xảy ra, vui lòng thử lại",
                variant: "danger",
              })
            );
          }
        } catch (err) {
          dispatch(
            showAlert({
              title: "Lỗi",
              message: err || "Xóa thất bại",
              variant: "danger",
            })
          );
        }
      },
    });
    dispatch(
      showAlert({
        id,
        title: "Xác nhận xóa",
        message: "Bạn có chắc chắn muốn xóa phương thức thanh toán này?",
        variant: "danger",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      })
    );
  };

  if (!istrue) return null;

  return (
    <div className="w-full ">
      {/* Số dư */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-button-bg-ac rounded-3xl p-2 md:p-4 shadow-sm mb-2 md:mb-4">
        <p className="text-sm text-gray-600">Số dư</p>
        {loading ? (
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mt-2"></div>
        ) : (
          <p className="text-base md:text-xl font-extrabold text-button-bg-ac">
            {formatMoney(balance?.balanceCurrent || 0)}đ
          </p>
        )}
      </div>

      {/* Danh sách phương thức + Rút tiền riêng từng cái */}
      <div className="mb-2 md:mb-4">
        <h3 className="px-2 md:px-4 font-bold text-sm md:text-base mb-1">
          Rút tiền về tài khoản
        </h3>
        <div className="space-y-3 bg-white rounded-3xl border p-2 md:p-4 shadow-sm">
          {loading ? (
            <p className="text-gray-500 text-center my-2 md:py-4">
              Đang tải phương thức...
            </p>
          ) : paymentMethods.length === 0 ? (
            <p className="text-gray-500 text-center px-2 md:py-4">
              Bạn chưa thêm phương thức thanh toán nào
            </p>
          ) : (
            paymentMethods.map((acc) => (
              <div
                onClick={() => openWithdrawForm(acc)}
                key={acc._id}
                className={`flex flex-row items-center justify-between gap-3 p-1 md:p-2 rounded-2xl border hover:bg-button-bg "border-gray-200 bg-gray-50`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {acc.bankId?.bankLogo ? (
                    <img
                      src={acc.bankId.bankLogo}
                      alt={acc.bankId.bankName}
                      className="w-10 h-10 rounded-lg object-contain bg-white shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center text-white font-bold">
                      {acc.paType === "VNpay"
                        ? "VNpay"
                        : acc.paType === "ZALOPAY"
                        ? "Z"
                        : "B"}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold flex justify-start items-center">
                      {acc.paBeneficiaryName}
                      {acc.paIsDefault && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Mặc định
                        </span>
                      )}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {acc.paType === "BANK"
                        ? `${acc.bankId?.bankName || "Ngân hàng"} • ${
                            acc.paAccountNumber
                          }`
                        : `${acc.paType} • ${acc.paAccountNumber}`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPaymentForm(acc);
                    }}
                    className="p-2  rounded-lg transition hover:text-button-bg-ac"
                  >
                    <AiOutlineEdit size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(acc._id);
                    }}
                    className="p-2  rounded-lg transition hover:text-button-bg-ac"
                  >
                    <AiOutlineDelete size={20} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Thêm phương thức */}
          <button
            onClick={() => openPaymentForm(null)}
            className="mx-auto mt-2 md:mt-4 px-3 py-1 border border-dashed border-gray-500 bg-white rounded-2xl text-black  hover:text-button-bg-ac hover:border-button-bg-ac transition flex items-center justify-center gap-2 text-sm"
          >
            <BiPlus size={20} />
            Thêm phương thức thanh toán
          </button>
        </div>
      </div>

      {/* Danh sach lich su giao dich */}
      <div className="mb-2 md:mb-4">
        <h3 className="px-2 md:px-4 font-bold text-sm md:text-base mb-1 flex items-center gap-2">
          Lịch sử giao dịch
        </h3>

        <div className="flex flex-col bg-white rounded-3xl border p-2 md:p-4 shadow-sm min-h-[200px]">
          <div className="flex-1">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex justify-between items-center"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="h-3 w-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {transactions.map((t) => {
                  const isIncome = t.tranAction === "in";
                  return (
                    <div
                      key={t._id}
                      className="flex items-center justify-between  bg-white border p-2 rounded-3xl"
                    >
                      {/* Bên trái: Icon + Mô tả + Ngày giờ */}
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* Icon Box */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isIncome
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {isIncome ? (
                            <BiTrendingUp size={20} />
                          ) : (
                            <BiTrendingDown size={20} />
                          )}
                        </div>

                        {/* Nội dung text */}
                        <div className="flex flex-col min-w-0">
                          <p
                            className="text-sm font-medium text-gray-800 truncate pr-2"
                            title={t.tranDescriptions}
                          >
                            {t.tranDescriptions || "Giao dịch hệ thống"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(t.createdAt).toLocaleString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Bên phải: Số tiền + Số dư lúc đó */}
                      <div className="text-right flex-shrink-0 pl-2">
                        <p
                          className={`text-sm md:text-base font-bold ${
                            isIncome ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatMoney(t.tranAmount)}đ
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                          Số dư: {formatMoney(t.tranBalanceAfter)}đ
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <div className="bg-gray-100 p-4 rounded-full mb-3">
                  <BiHistory size={30} />
                </div>
                <p className="text-sm">Chưa có giao dịch nào phát sinh</p>
              </div>
            )}
          </div>

          {tranCount > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={tranPage}
                totalCount={tranCount}
                limit={tranLimit}
                onPageChange={setTranPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
