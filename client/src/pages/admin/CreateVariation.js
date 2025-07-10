import React, { useEffect, useState } from "react";
import {
  apiGetVariationsByProductId,
  apiDeleteProductVariation,
  apiGetProduct,
} from "apis";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CreateVariantForm from "./CreateVariantForm";
import { useParams } from "react-router-dom";

const CreateVariation = ({
  productId: propProductId,
  productName: propProductName,
  onDone,
}) => {
  const { productId: paramProductId } = useParams();
  const productId = paramProductId || propProductId;

  const [variants, setVariants] = useState([]);
  const [editVariant, setEditVariant] = useState(null);
  const [productName, setProductName] = useState(propProductName || "");

  const fetchVariants = async () => {
    const res = await apiGetVariationsByProductId(productId);
    if (res.success) setVariants(res.variations);
  };

  const fetchProductName = async () => {
    try {
      const res = await apiGetProduct(productId);
      if (res.success && res.productData?.productName) {
        setProductName(res.productData.productName);
      } else {
        setProductName("Không rõ");
      }
    } catch (err) {
      setProductName("Không rõ");
    }
  };

  useEffect(() => {
    if (productId) {
      fetchVariants();
      if (!propProductName) fetchProductName(); // chỉ gọi nếu không truyền prop
    }
  }, [productId]);

  if (!productId) {
    toast.error("Thiếu productId khi tạo biến thể!");
    return <p className="text-red-500 p-4">Không tìm thấy ID sản phẩm</p>;
  }

  const handleDelete = (id) => {
    Swal.fire({
      title: "Bạn có chắc muốn xoá biến thể?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await apiDeleteProductVariation(id);
        if (res.success) {
          toast.success("Đã xoá!");
          fetchVariants();
        } else {
          toast.error("Lỗi xoá!");
        }
      }
    });
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Biến thể sản phẩm:{" "}
          <span className="text-main">{productName || "Không rõ"}</span>
        </h1>
        {onDone && (
          <button
            onClick={onDone}
            className="px-4 py-2 text-white bg-gray-600 rounded"
          >
            ⬅ Quay lại
          </button>
        )}
      </div>

      <CreateVariantForm
        productId={productId}
        editVariant={editVariant}
        onDone={() => {
          setEditVariant(null);
          fetchVariants();
        }}
      />

      <h2 className="text-xl font-semibold mt-8 mb-4">Danh sách biến thể</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Tên biến thể</th>
            <th className="p-2">Giá</th>
            <th className="p-2">Kho</th>
            <th className="p-2">Tuỳ chọn</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v._id} className="border-t">
              <td className="p-2">{v.productVariationName}</td>
              <td className="p-2">{v.price.toLocaleString()}₫</td>
              <td className="p-2">{v.stockQuantity}</td>
              <td className="p-2">
                <button
                  onClick={() => setEditVariant(v)}
                  className="text-blue-600 mr-4"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(v._id)}
                  className="text-red-600"
                >
                  Xoá
                </button>
              </td>
            </tr>
          ))}
          {variants.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center italic py-4 text-gray-500">
                Chưa có biến thể nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CreateVariation;
