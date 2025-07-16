import React, { useEffect, useState } from "react";
import {
  apiGetSpecificProductsByVariationId,
  apiCreateSpecificProduct,
  apiDeleteSpecificProduct,
  apiUpdateProductVariation, // thêm dòng này
} from "apis";
import { toast } from "react-toastify";

const SpecificProductManager = ({ variationId, onClose }) => {
  const [serieNumbers, setSerieNumbers] = useState([]);
  const [newSerial, setNewSerial] = useState("");

  const fetchSerials = async (updateStock = false) => {
    try {
      const res = await apiGetSpecificProductsByVariationId(variationId);
      if (res.success) {
        const list = res.specificProducts.map((item) => ({
          id: item._id,
          value: item.numberOfSeri,
        }));
        setSerieNumbers(list);

        if (updateStock) {
          await apiUpdateProductVariation(variationId, {
            stockQuantity: list.length,
          });
        }
      }
    } catch (err) {
      toast.error("Không thể tải số serial");
    }
  };

  useEffect(() => {
    if (variationId) fetchSerials();
  }, [variationId]);

  const handleAdd = async () => {
    if (!newSerial.trim()) return;
    try {
      const res = await apiCreateSpecificProduct({
        productVariationId: variationId,
        numberOfSeri: newSerial.trim(),
      });
      if (res.success) {
        toast.success("Thêm serial thành công");
        setNewSerial("");
        await fetchSerials(true); // cập nhật lại số lượng kho
      }
    } catch (err) {
      toast.error("Thêm serial thất bại");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDeleteSpecificProduct(id);
      toast.success("Xoá serial thành công");
      await fetchSerials(true); // cập nhật lại số lượng kho
    } catch (err) {
      toast.error("Xoá serial thất bại");
    }
  };

  return (
    <div className="p-3 bg-white rounded-xl shadow w-[300px] max-w-xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Quản lý số serial</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={newSerial}
          onChange={(e) => setNewSerial(e.target.value)}
          placeholder="Nhập số serial mới"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Thêm
        </button>
      </div>

      <div className="space-y-2">
        {serieNumbers.map((item, idx) => (
          <div key={item.id} className="flex justify-between items-center">
            <span>
              #{idx + 1}: {item.value}
            </span>
            <button
              className="text-red-600 text-sm hover:underline"
              onClick={() => handleDelete(item.id)}
            >
              ❌ Xoá
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={onClose}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default SpecificProductManager;
