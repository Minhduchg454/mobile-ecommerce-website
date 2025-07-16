import React, { useEffect, useState } from "react";
import {
  apiGetVariationsByProductId,
  apiDeleteProductVariation,
  apiGetProduct,
} from "apis";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import { SpecificProductManager, CreateVariantForm } from "../../components";

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
  const [showForm, setShowForm] = useState(false);
  const [showSerialManager, setShowSerialManager] = useState(false);
  const [selectedVariationId, setSelectedVariationId] = useState(null);

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
    } catch {
      setProductName("Không rõ");
    }
  };

  useEffect(() => {
    if (!showForm) setEditVariant(null);
  }, [showForm]);

  useEffect(() => {
    if (productId) {
      fetchVariants();
      if (!propProductName) fetchProductName();
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
    <div className="p-4 bg-white min-h-screen mb-3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Biến thể sản phẩm:{" "}
          <span className="text-main">{productName || "Không rõ"}</span>
        </h1>
      </div>

      {/* Nút toggle form */}
      <div className="mb-4">
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-main text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showForm ? "Đóng biểu mẫu" : "➕ Thêm biến thể"}
        </button>

        {/* Form có hiệu ứng trượt */}
        <div
          className={`overflow-hidden transition-all duration-500 ${
            showForm ? "max-h-[2000px] mt-4" : "max-h-0"
          }`}
        >
          {showForm && (
            <div className="bg-white border p-4 rounded shadow">
              <CreateVariantForm
                productId={productId}
                editVariant={editVariant}
                onDone={() => {
                  setEditVariant(null);
                  fetchVariants();
                  setShowForm(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

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
                  onClick={() => {
                    setEditVariant(v);
                    setShowForm(true);
                  }}
                  className="text-blue-600 mr-4"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(v._id)}
                  className="text-red-600 mr-4"
                >
                  Xoá
                </button>
                <button
                  onClick={() => {
                    setSelectedVariationId(v._id);
                    setShowSerialManager(true);
                  }}
                  className="text-green-600 mr-4"
                >
                  Serial
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
      {showSerialManager && selectedVariationId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow max-h-[90vh] overflow-y-auto p-2 w-fit max-w-2xl">
            <SpecificProductManager
              variationId={selectedVariationId}
              onClose={() => {
                setShowSerialManager(false);
                setSelectedVariationId(null);
                fetchVariants(); // cập nhật lại kho nếu có thay đổi
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateVariation;
