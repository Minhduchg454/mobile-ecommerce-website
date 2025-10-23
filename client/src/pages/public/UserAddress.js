import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiGetAddresses, apiDeleteAddress } from "../../services/user.api";
import { FaEdit, FaTrash } from "react-icons/fa";
import { showAlert } from "store/app/appSlice";
import { AddressFormModal } from "../../features";

export const UserAddress = () => {
  const dispatch = useDispatch();
  const { current } = useSelector((s) => s.user);
  const userId = current?._id || current?.userId;

  const title = "px-3 md:px-4 font-bold mb-1";
  const addressRow =
    "pb-2 mt-2 border-b border-gray-200 flex flex-col gap-1 md:gap-0 md:flex-row md:items-center md:justify-between";

  // =============== STATE ===============
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };
  const openEdit = (addr) => {
    setEditing(addr);
    setShowModal(true);
  };

  // =============== DATA ===============
  const fetchAddresses = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await apiGetAddresses({ userId, sort: "default_first" });
      setAddresses(res?.addresses || []);
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
  const handleDelete = async (addr) => {
    if (!window.confirm("Xoá địa chỉ này?")) return;
    try {
      await apiDeleteAddress(addr._id, userId);
      dispatch(
        showAlert({
          title: "Đã xoá",
          message: "Xoá địa chỉ thành công",
          variant: "success",
          duration: 1200,
        })
      );
      await fetchAddresses();
    } catch (e) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: e?.response?.data?.message || "Xoá địa chỉ thất bại",
          variant: "danger",
        })
      );
    }
  };

  // =============== RENDER ===============
  return (
    <div className="w-full relative">
      <h1 className={title}>Địa chỉ nhận hàng</h1>

      <div className="glass p-3 md:p-4 rounded-3xl mb-4">
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

                <div className="flex items-center gap-2 mt-2 md:mt-0 text-sm md:text-base">
                  <button
                    onClick={() => openEdit(addr)}
                    className="px-3 py-1 rounded-2xl border bg-button-bg hover:bg-gray-200 inline-flex items-center gap-2"
                  >
                    <FaEdit /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(addr)}
                    className="px-3 py-1 rounded-2xl border bg-button-bg hover:bg-gray-200 inline-flex items-center gap-2"
                  >
                    <FaTrash /> Xoá
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={openCreate}
          className="px-3 py-1 bg-button-bg border rounded-3xl"
        >
          Thêm địa chỉ
        </button>
      </div>

      <AddressFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        userId={userId}
        initialAddress={editing} // null = tạo mới; object = sửa
        onSuccess={fetchAddresses} // sau khi lưu/xoá thì refresh
        titleCreate="Thêm địa chỉ mới"
        titleEdit="Cập nhật địa chỉ"
      />
    </div>
  );
};
