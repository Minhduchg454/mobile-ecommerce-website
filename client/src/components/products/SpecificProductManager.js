import React, { useEffect, useState } from "react";
import {
  apiGetSpecificProductsByVariationId,
  apiCreateSpecificProduct,
  apiDeleteSpecificProduct,
  apiUpdateProductVariation, // thêm dòng này
  apiGetProductVariation,
} from "apis";
import { toast } from "react-toastify";

const SpecificProductManager = ({ variationId, onClose }) => {
  const [serieNumbers, setSerieNumbers] = useState([]);
  const [newSerial, setNewSerial] = useState("");
  const [initialStock, setInitialStock] = useState(0);

  const fetchInitialStock = async () => {
    try {
      const res = await apiGetProductVariation(variationId);
      if (res.success && res.variation.stockQuantity !== undefined) {
        setInitialStock(res.variation.stockQuantity);
      }
    } catch {}
  };

  const fetchSerials = async (updateStock = false) => {
    try {
      const res = await apiGetSpecificProductsByVariationId(variationId);
      if (res.success) {
        const list = res.specificProducts.map((item) => ({
          id: item._id,
          value: item.numberOfSeri,
        }));
        setSerieNumbers(list);

        if (updateStock && list.length > 0) {
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

  useEffect(() => {
    if (variationId) {
      fetchSerials();
      fetchInitialStock();
    }
  }, [variationId]);

  return (
    <div className="relative p-3 bg-white rounded-xl shadow w-[300px] max-w-xl mx-auto">
      {/* Nút đóng ở góc phải trên */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-500 hover:text-white text-gray-800 shadow transition"
        title="Đóng"
      >
        ×
      </button>

      <h3 className="text-lg font-semibold mb-4">Quản lý số serial</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={newSerial}
          onChange={(e) => setNewSerial(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
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
      {serieNumbers.length > 0 && serieNumbers.length < initialStock && (
        <div className="text-orange-500 text-sm mt-2">
          <p>⚠️ Bạn đã nhập {serieNumbers.length} serial.</p>
          <p> Số lượng kho ban đầu là {initialStock}.</p>
          <p>Hệ thống sẽ cập nhật số lượng mới theo số serial đã nhập.</p>
        </div>
      )}
    </div>
  );
};

export default SpecificProductManager;
