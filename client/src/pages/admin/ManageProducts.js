import React, { useCallback, useEffect, useState } from "react";
import { CustomizeVarriants, InputForm, Pagination } from "components";
import { useForm } from "react-hook-form";
import { apiGetProducts, apiDeleteProduct } from "apis/product";
import {
  useSearchParams,
  createSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import useDebounce from "hooks/useDebounce";
import CreateProducts from "./CreateProducts";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { BiEdit, BiCustomize } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import CreateVariation from "./CreateVariation";

const ManageProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const {
    register,
    formState: { errors },
    watch,
  } = useForm();
  const [products, setProducts] = useState(null);
  const [counts, setCounts] = useState(0);
  const [editProduct, setEditProduct] = useState(null);
  const [update, setUpdate] = useState(false);
  const [customizeVarriant, setCustomizeVarriant] = useState(null);
  const [currentProductForVariant, setCurrentProductForVariant] =
    useState(null);

  const render = useCallback(() => {
    setUpdate(!update);
  });

  const fetchProducts = async (params) => {
    const response = await apiGetProducts({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    });
    if (response.success) {
      setCounts(response.total);
      setProducts(response.products);
    }
  };

  const queryDebounce = useDebounce(watch("q"), 800);

  useEffect(() => {
    if (queryDebounce) {
      navigate({
        pathname: location.pathname,
        search: createSearchParams({ q: queryDebounce }).toString(),
      });
    } else {
      navigate({
        pathname: location.pathname,
      });
    }
  }, [queryDebounce]);

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    fetchProducts(searchParams);
  }, [params, update]);

  const handleDeleteProduct = (pid) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Thao tác này sẽ xoá sản phẩm khỏi hệ thống.",
      icon: "warning",
      showCancelButton: true,
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const response = await apiDeleteProduct(pid);
        if (response.success) toast.success(response.mes);
        else toast.error(response.mes);
        render();
      }
    });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-4 relative">
      {editProduct && (
        <div className="absolute inset-0 min-h-screen bg-gray-100 z-50">
          <CreateProducts
            editProduct={editProduct}
            render={render}
            setEditProduct={setEditProduct}
          />
        </div>
      )}

      {currentProductForVariant && (
        <div className="absolute inset-0 min-h-screen bg-gray-100 z-50 overflow-y-auto">
          <CreateVariation
            productId={currentProductForVariant._id}
            productName={currentProductForVariant.productName}
            onDone={() => {
              setCurrentProductForVariant(null);
              render();
            }}
          />
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow p-4 rounded mb-4">
        <form className="w-full">
          <InputForm
            id="q"
            register={register}
            errors={errors}
            fullWidth
            placeholder="🔍 Tìm kiếm sản phẩm..."
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="bg-sky-800 text-white text-sm uppercase">
              <th className="py-3 px-2">STT</th>
              <th className="py-3 px-2">Ảnh</th>
              <th className="py-3 px-2">Tên sản phẩm</th>
              <th className="py-3 px-2">Hãng</th>
              <th className="py-3 px-2">Danh mục</th>
              <th className="py-3 px-2">Giá thấp nhất</th>
              <th className="py-3 px-2">Đã bán</th>
              <th className="py-3 px-2">Đánh giá</th>
              <th className="py-3 px-2">Tổng đánh giá</th>
              <th className="py-3 px-2">Tuỳ chọn</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((el, idx) => (
              <tr
                key={el._id}
                className="border-b hover:bg-sky-50 transition-all"
              >
                <td className="text-center py-3 px-2 text-sm font-medium">
                  {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                    process.env.REACT_APP_LIMIT +
                    idx +
                    1}
                </td>
                <td className="text-center py-3 px-2">
                  <img
                    src={el.thumb}
                    alt="thumb"
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="text-center py-3 px-2">{el.productName}</td>
                <td className="text-center py-3 px-2">
                  {el.brandId?.brandName}
                </td>
                <td className="text-center py-3 px-2">
                  {el.categoryId?.productCategoryName}
                </td>
                <td className="text-center py-3 px-2 text-green-700 font-semibold">
                  {el.minPrice.toLocaleString()}₫
                </td>
                <td className="text-center py-3 px-2">{el.totalSold}</td>
                <td className="text-center py-3 px-2">{el.rating}</td>
                <td className="text-center py-3 px-2">{el.totalRating}</td>
                <td className="text-center py-3 px-2">
                  <div className="flex justify-center gap-2 items-center">
                    <span
                      onClick={() => setEditProduct(el)}
                      className="text-blue-500 hover:text-orange-500 cursor-pointer"
                      title="Sửa sản phẩm"
                    >
                      <BiEdit size={20} />
                    </span>
                    <span
                      onClick={() => setCurrentProductForVariant(el)}
                      className="text-green-600 hover:text-orange-500 cursor-pointer"
                      title="Quản lý biến thể"
                    >
                      <BiCustomize size={20} />
                    </span>
                    <span
                      onClick={() => handleDeleteProduct(el._id)}
                      className="text-red-600 hover:text-orange-500 cursor-pointer"
                      title="Xoá sản phẩm"
                    >
                      <RiDeleteBin6Line size={20} />
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có sản phẩm nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="w-full flex justify-end mt-8">
        <Pagination totalCount={counts} />
      </div>
    </div>
  );
};

export default ManageProducts;
