import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  apiGetAddressesByUser,
  apiDeleteAddress,
  apiSetDefaultAddress,
} from "../../apis";
import { NewAddressModal } from "../../components";
import { FaEdit, FaTrash } from "react-icons/fa";
import { fetchAddresses } from "../../store/user/asyncActions"; // Sửa lại cho đúng đường dẫn

const PersonalAddress = () => {
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.user);
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const loadAddresses = async () => {
    const res = await apiGetAddressesByUser({ userId: current._id });
    if (res.success) setAddresses(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      const res = await apiDeleteAddress(id);
      if (res?.success) {
        dispatch(fetchAddresses());
        loadAddresses();
      } else {
        alert("Xóa thất bại!");
      }
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleSetDefault = async (addressId) => {
    const res = await apiSetDefaultAddress({
      addressId,
      userId: current._id,
    });
    if (res?.success) {
      dispatch(fetchAddresses());
      loadAddresses();
    } else {
      alert("Thiết lập mặc định thất bại!");
    }
  };

  useEffect(() => {
    if (current?._id) loadAddresses();
  }, [current]);

  return (
    <div className="p-4">
      <div className="sticky top-0 z-10 flex justify-start items-center mb-4">
        <button
          onClick={() => {
            setEditingAddress(null);
            setShowModal(true);
          }}
          className="btn bg-main text-white rounded-xl p-2"
        >
          Thêm địa chỉ mới
        </button>
      </div>

      <ul className="space-y-4">
        {addresses.map((addr) => (
          <li
            key={addr._id}
            className="p-4 bg-white shadow-md border rounded-xl relative"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{`Đc: ${addr.street}`}</p>
                <p>
                  {`Tx/tt ${addr.ward}, quận/huyện ${addr.district}, tp ${addr.country}`}
                </p>
                {addr.isDefault && (
                  <span className="text-sm text-red-600 border border-red-500 px-2 py-1 rounded inline-block mt-2">
                    Mặc định
                  </span>
                )}
              </div>

              <div className="space-x-3">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleEdit(addr)}
                >
                  Sửa
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(addr._id)}
                >
                  Xóa
                </button>
              </div>
            </div>

            {!addr.isDefault && (
              <button
                className="mt-3 px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleSetDefault(addr._id)}
              >
                Thiết lập mặc định
              </button>
            )}
          </li>
        ))}
      </ul>

      {showModal && (
        <NewAddressModal
          currentUserId={current._id}
          onClose={() => setShowModal(false)}
          onAddressAdded={loadAddresses}
          defaultValues={editingAddress}
        />
      )}
    </div>
  );
};

export default PersonalAddress;
