import React, { useEffect, useState } from "react";
import { apiGetVariationsByProductId, apiDeleteProductVariation } from "apis";
import CreateVariant from "../../pages/admin/CreateVariation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Button from "../buttons/Button";

const CustomizeVarriants = ({
  customizeVarriant,
  render,
  setCustomizeVarriant,
}) => {
  const [variants, setVariants] = useState([]);
  const [editVariant, setEditVariant] = useState(null);

  const fetchVariants = async () => {
    const res = await apiGetVariationsByProductId(customizeVarriant._id);
    if (res.success) setVariants(res.variants);
  };

  useEffect(() => {
    fetchVariants();
  }, []);

  const handleDelete = (vid) => {
    Swal.fire({
      title: "Bạn có chắc muốn xoá biến thể?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const res = await apiDeleteProductVariation(vid);
        if (res.success) {
          toast.success("Đã xoá!");
          fetchVariants();
          render();
        } else toast.error("Lỗi xoá!");
      }
    });
  };

  return (
    <div className="p-4 bg-white shadow rounded w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Biến thể của: {customizeVarriant.productName}
        </h2>
        <Button onClick={() => setEditVariant(null)}>➕ Thêm biến thể</Button>
      </div>

      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Tên biến thể</th>
            <th className="p-2">Giá</th>
            <th className="p-2">Kho</th>
            <th className="p-2">Tuỳ chọn</th>
          </tr>
        </thead>
        <tbody>
          {variants?.map((variant) => (
            <tr key={variant._id} className="border-t">
              <td className="p-2">{variant.variantName}</td>
              <td className="p-2">{variant.price.toLocaleString()}₫</td>
              <td className="p-2">{variant.stock}</td>
              <td className="p-2">
                <span
                  onClick={() => setEditVariant(variant)}
                  className="text-blue-500 hover:text-orange-500 cursor-pointer mr-3"
                >
                  Sửa
                </span>
                <span
                  onClick={() => handleDelete(variant._id)}
                  className="text-red-500 hover:text-orange-500 cursor-pointer"
                >
                  Xoá
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Component tạo/sửa biến thể */}
      <div className="mt-6">
        <CreateVariant
          productId={customizeVarriant._id}
          editVariant={editVariant}
          onDone={() => {
            setEditVariant(null);
            fetchVariants();
            render();
          }}
        />
      </div>

      <div className="mt-4 text-right">
        <Button onClick={() => setCustomizeVarriant(null)}>⬅ Quay lại</Button>
      </div>
    </div>
  );
};

export default CustomizeVarriants;
