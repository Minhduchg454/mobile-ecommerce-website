import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  apiGetUsers,
  apiDeleteUser,
  apiUpdateUser,
} from "../../services/user.api";

import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import noData from "../../assets/data-No.png";
import { showAlert, showModal } from "store/app/appSlice";
import { useSearchParams } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import defaultAvatar from "assets/avatarDefault.png";
import { Loading } from "../../components";

import { AiOutlineDelete } from "react-icons/ai";
import { IoLockClosedOutline, IoLockOpenOutline } from "react-icons/io5";

export const UserManage = ({ status }) => {
  const dispatch = useDispatch();
  const { current } = useSelector((s) => s.user);

  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isShowSort, setIsShowSort] = useState(false);
  const [isShowStatus, setIsShowStatus] = useState(false);

  const statusParam = searchParams.get("status") || "";
  const sortKeyParam = searchParams.get("sortKey") || "createdAt";
  const sortDirParam = searchParams.get("sortDir") || "-1";
  const searchKeyword = searchParams.get("s") || "";
  const userId = current?._id || "";

  const statusOptions = [
    { label: "Hoạt động", value: "active" },
    { label: "Đã bị khóa", value: "block" },
  ];

  const sortOptions = [
    { label: "Mới nhất", sortKey: "createdAt", sortDir: "-1" },
    { label: "Cũ nhất", sortKey: "createdAt", sortDir: "1" },
    { label: "Nam", sortKey: "gender", sortDir: "male" },
    { label: "Nữ", sortKey: "gender", sortDir: "female" },
    { label: "Khác", sortKey: "gender", sortDir: "other" },
  ];

  const currentStatus =
    statusOptions.find((opt) => opt.value === statusParam) || statusOptions[0];

  const currentSort =
    sortOptions.find(
      (opt) => opt.sortKey === sortKeyParam && opt.sortDir === sortDirParam
    ) || sortOptions[0];

  // ============= FETCH USERS ============
  const fetchUsers = async () => {
    try {
      const query = { s: searchKeyword || undefined };

      if (sortKeyParam === "createdAt") {
        query.sort = sortDirParam === "-1" ? "-createdAt" : "createdAt";
      } else if (sortKeyParam === "gender") {
        query.gender = sortDirParam;
      }

      if (status) {
        query.statusName = status;
      } else if (statusParam) query.statusName = statusParam;

      const res = await apiGetUsers(query);
      if (res?.success) {
        setUsers(res?.users || []);
        setCount(res?.users?.length || 0);
      } else {
        dispatch(
          showAlert({
            title: "Không thể tải danh sách",
            message: res?.message || "Vui lòng thử lại sau",
            variant: "danger",
          })
        );
        setUsers([]);
        setCount(0);
      }
    } catch (err) {
      console.error("Lỗi khi lấy user:", err);
      setUsers([]);
      setCount(0);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchKeyword, sortKeyParam, sortDirParam, statusParam]);

  // ============= HANDLERS ============
  const handleBlockUser = (user) => {
    const nextStatusName =
      user?.userStatusId?.userStatusName === "active" ? "block" : "active";

    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: async () => {
        dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

        const res = await apiUpdateUser(
          {
            statusName: nextStatusName,
          },
          user._id
        );
        dispatch(showModal({ isShowModal: false }));

        if (res?.success) {
          fetchUsers();
          dispatch(
            showAlert({
              title:
                nextStatusName === "block"
                  ? "Khóa tài khoản thành công"
                  : "Mở khóa tài khoản thành công",
              message:
                nextStatusName === "block"
                  ? "Tài khoản đã bị khóa."
                  : "Tài khoản đã được mở khóa.",
              variant: "success",
              duration: 1500,
              showCancelButton: false,
              showConfirmButton: false,
            })
          );
        } else {
          dispatch(
            showAlert({
              title: "Cập nhật thất bại",
              message: `Vui lòng thử lại, ${res?.message || ""}`,
              variant: "danger",
            })
          );
        }
      },
    });

    dispatch(
      showAlert({
        id,
        title:
          nextStatusName === "block"
            ? "Bạn có chắc chắn muốn khóa tài khoản này?"
            : "Bạn có chắc chắn muốn mở khóa tài khoản này?",
        variant: "danger",
        showCancelButton: true,
        confirmText: "Có",
        cancelText: "Không",
      })
    );
  };

  const handleDeleteUser = (user) => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: async () => {
        dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
        const res = await apiDeleteUser({ isAdmin: true }, user._id);
        dispatch(showModal({ isShowModal: false }));

        if (res?.success) {
          fetchUsers();
          dispatch(
            showAlert({
              title: "Xóa thành công",
              message: "Tài khoản đã được xoá",
              variant: "success",
              duration: 1500,
              showCancelButton: false,
              showConfirmButton: false,
            })
          );
        } else {
          dispatch(
            showAlert({
              title: "Xóa thất bại",
              message: `Vui lòng thử lại, ${res?.message || ""}`,
              variant: "danger",
            })
          );
        }
      },
    });

    dispatch(
      showAlert({
        id,
        title: "Bạn có chắc chắn muốn xóa tài khoản này?",
        variant: "danger",
        showCancelButton: true,
        confirmText: "Có",
        cancelText: "Không",
      })
    );
  };

  // layout grid
  const gridCols =
    "grid grid-cols-[60px,1.1fr,0.5fr,0.7fr,1.4fr,1fr,1fr,0.9fr,1fr] gap-3 items-center";
  const actionButton =
    "w-[100px] px-2 py-1 rounded-2xl border bg-button-bg hover:bg-button-hv inline-flex items-center justify-center gap-1 text-xs md:text-sm";

  // ============= RENDER =============
  return (
    <div className="w-full relative">
      {/* HEADER BAR */}
      <div className="bg-app-bg/60 backdrop-blur-sm rounded-3xl px-3 py-2 md:px-4 sticky top-[50px] z-10 flex justify-between items-center mb-2 md:mb-4">
        <h1 className="font-bold mb-1">{count} tài khoản</h1>
        <div className="flex items-center justify-end gap-2 ">
          {!status && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsShowStatus((v) => !v)}
                className="glass shadow-md md:px-2 py-1 px-1 border rounded-2xl text-description flex items-center gap-1 text-sm bg-white"
                aria-haspopup="listbox"
                aria-expanded={isShowStatus}
              >
                Trạng thái:{" "}
                <span className="font-bold">{currentStatus.label}</span>
                {isShowStatus ? (
                  <MdKeyboardArrowUp size={18} className="ml-1" />
                ) : (
                  <MdKeyboardArrowDown size={18} className="ml-1" />
                )}
              </button>

              {isShowStatus && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-md border rounded-xl shadow-lg p-1 z-20"
                >
                  {statusOptions.map((opt) => {
                    const isActive = opt.value === statusParam;
                    return (
                      <button
                        key={opt.value || "all"}
                        onClick={() => {
                          setSearchParams((prev) => {
                            const params = new URLSearchParams(prev);
                            if (opt.value) params.set("status", opt.value);
                            else params.delete("status");
                            return params;
                          });
                          setIsShowStatus(false);
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
          )}

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
                  const isActive =
                    opt.sortKey === sortKeyParam &&
                    opt.sortDir === sortDirParam;

                  return (
                    <button
                      key={`${opt.sortKey}:${opt.sortDir}`}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        setSearchParams((prev) => {
                          const params = new URLSearchParams(prev);
                          params.set("sortKey", opt.sortKey);
                          params.set("sortDir", opt.sortDir);
                          return params;
                        });
                        setIsShowSort(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-action ${
                        isActive ? "bg-gray-100 font-bold" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      {users.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div
            className={`${gridCols} text-xs md:text-sm px-2 py-1 md:px-3 bg-button-hv rounded-3xl border shadow-sm`}
          >
            <div className="text-center">Ảnh</div>
            <div className="text-left">Tên</div>
            <div className="text-left">Giới tính</div>
            <div className="text-left">Ngày sinh</div>
            <div className="text-left">Email</div>
            <div className="text-left">Số điện thoại</div>
            <div className="text-left">Vai trò</div>
            <div className="text-left">Trạng thái</div>
            <div className="text-center">Thao tác</div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-4">
            {users.map((user) => {
              const isSelf = user._id === userId;

              return (
                <div
                  key={user._id}
                  className={`bg-white rounded-3xl p-2 md:p-3 ${gridCols} animate-fadeIn`}
                >
                  <div className="flex justify-center">
                    <img
                      src={user?.userAvatar || defaultAvatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                      }}
                    />
                  </div>

                  <div className="text-sm font-medium">
                    {user?.userLastName} {user?.userFirstName}{" "}
                    {isSelf ? "(tôi)" : ""}
                  </div>

                  <div className="text-sm">
                    {user?.userGender === "male"
                      ? "Nam"
                      : user?.userGender === "female"
                      ? "Nữ"
                      : "Khác"}
                  </div>

                  <div className="text-xs md:text-sm text-gray-700">
                    {user?.userDateOfBirth
                      ? new Date(user.userDateOfBirth).toLocaleDateString(
                          "vi-VN"
                        )
                      : "-"}
                  </div>

                  <div className="text-xs md:text-sm truncate max-w-[180px]">
                    {user?.userEmail || "-"}
                  </div>

                  <div className="text-xs md:text-sm">
                    {user?.userMobile || "-"}
                  </div>

                  <div className="text-xs md:text-sm">
                    {user?.roles.map((r) => (
                      <p key={r}>
                        {r === "admin"
                          ? "Quản trị"
                          : r === "shop"
                          ? "Người bán"
                          : "Khách hàng"}
                      </p>
                    ))}
                  </div>

                  <div className="text-xs md:text-sm">
                    {user?.userStatusId?.userStatusName === "active" ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">
                        Khóa
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 items-end justify-center text-sm md:text-base">
                    <button
                      type="button"
                      onClick={() => !isSelf && handleBlockUser(user)}
                      disabled={isSelf}
                      className={`${actionButton} ${
                        isSelf
                          ? "opacity-50 cursor-not-allowed pointer-events-none"
                          : ""
                      }`}
                    >
                      {user?.userStatusId?.userStatusName === "active" ? (
                        <>
                          <IoLockClosedOutline /> Khóa
                        </>
                      ) : (
                        <>
                          <IoLockOpenOutline /> Mở khóa
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => !isSelf && handleDeleteUser(user)}
                      disabled={isSelf}
                      className={`${actionButton} ${
                        isSelf
                          ? "opacity-50 cursor-not-allowed pointer-events-none"
                          : ""
                      }`}
                    >
                      <AiOutlineDelete /> Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 h-[500px] bg-white rounded-3xl animate-fadeIn">
          <img
            src={noData}
            alt="No Data"
            className="w-32 h-32 mb-4 opacity-50"
          />
          <p className="text-black">Không có tài khoản nào</p>
        </div>
      )}
    </div>
  );
};
