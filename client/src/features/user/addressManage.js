import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiGetAddresses, apiDeleteAddress } from "../../services/user.api";
import { showAlert } from "store/app/appSlice";
import { AddressFormModal } from "./AddressFormModal";
import { showModal } from "store/app/appSlice";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

export const AddressManage = ({ role }) => {
  const dispatch = useDispatch();
  const { current } = useSelector((s) => s.user);
  const [count, setCount] = useState(0);
  const userId = current?._id || current?.userId;
  const addressFor = role || "customer";
  const title = "font-bold mb-1";
  const addressRow =
    "pb-2 mt-2  flex flex-col gap-1 md:gap-0 md:flex-row md:items-center md:justify-between";

  // =============== STATE ===============
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const shouldShowAddButton = useMemo(() => {
    if (addressFor !== "shop") {
      return true;
    }

    return count === 0;
  }, [addressFor, count]);

  const fetchAddresses = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await apiGetAddresses({
        userId,
        sort: "default_first",
        addressFor,
      });
      setAddresses(res?.addresses || []);
      setCount(res?.addresses?.length || 0);
    } catch (e) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không tải được danh sách địa chỉ",
          variant: "danger",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  // =============== DELETE ===============
  const handleDelete = (addr) => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: async () => {
        const res = await apiDeleteAddress(addr._id, userId);
        if (res.success) {
          dispatch(
            showAlert({
              title: "Đã xoá",
              message: "Xoá địa chỉ thành công",
              variant: "success",
              duration: 1500,
              showConfirmButton: false,
            })
          );
          await fetchAddresses();
        } else {
          dispatch(
            showAlert({
              title: "Lỗi",
              message: `Xoá địa chỉ thất bại, ${res?.message || ""}`,
              variant: "danger",
            })
          );
        }
      },
      onCancel: () => {},
      onClose: () => {},
    });

    dispatch(
      showAlert({
        id,
        title: "Bạn có chắc chắn muốn xóa địa chỉ này không",
        variant: "danger",
        showCancelButton: true,
        confirmText: "Có",
        cancelText: "Không",
      })
    );
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
            userId={userId}
            initialAddress={initial}
            onSuccess={fetchAddresses}
            titleCreate="Thêm địa chỉ mới"
            titleEdit="Cập nhật địa chỉ"
            addressFor={addressFor}
          />
        ),
      })
    );
  };

  // =============== RENDER ===============
  return (
    <div className="w-full relative animate-fadeIn">
      <div className="bg-app-bg/60 backdrop-blur-sm rounded-3xl px-3 py-2 md:px-4 sticky top-[50px] z-10 flex justify-between items-center">
        <h1 className={title}>
          {count}{" "}
          {addressFor === "customer" ? "địa chỉ nhận hàng" : "địa chỉ lấy hàng"}
        </h1>

        {shouldShowAddButton && (
          <button
            onClick={() => openAddressModal(null)}
            className="px-3 py-1 bg-button-bg-ac hover:bg-button-bg-hv border rounded-3xl text-white text-sm"
          >
            Thêm địa chỉ
          </button>
        )}
      </div>

      <div className="bg-white p-3 md:p-4 rounded-3xl mb-4 border">
        {loading ? (
          <p className="text-gray-600">Đang tải địa chỉ…</p>
        ) : addresses.length === 0 ? (
          <p className="text-gray-600">Chưa có địa chỉ nào.</p>
        ) : (
          <ul className="space-y-3">
            {addresses.map((addr) => (
              <li key={addr._id} className={`${addressRow}`}>
                <div className="text-black">
                  <div className="flex gap-2 text-sm md:text-base">
                    <div className="font-bold">
                      {addr.addressUserName}{" "}
                      <span className="font-normal">
                        {"| "}
                        {addr.addressNumberPhone}
                      </span>
                    </div>
                    {addr.addressIsDefault && (
                      <span className="flex items-center justify-center ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Mặc định
                      </span>
                    )}
                  </div>

                  <div className="text-black text-sm md:text-base">
                    {addr.addressStreet}
                  </div>
                  <div className="text-black text-sm md:text-base">
                    {addr.addressWard}, {addr.addressDistrict},{" "}
                    {addr.addressCity}, {addr.addressCountry}
                  </div>
                </div>

                {/* Chức năng Sửa và Xoá giữ nguyên */}
                <div className="flex items-center gap-2 mt-2 md:mt-0 text-sm md:text-base">
                  <button
                    onClick={() => openAddressModal(addr)}
                    className="px-3 py-1 rounded-2xl border bg-button-bg hover:bg-gray-200 inline-flex items-center gap-2"
                  >
                    <AiOutlineEdit /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(addr)}
                    className="px-3 py-1 rounded-2xl border bg-button-bg hover:bg-gray-200 inline-flex items-center gap-2"
                  >
                    <AiOutlineDelete /> Xoá
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
