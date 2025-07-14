import React, { useCallback, useEffect, useState } from "react";
import { InputForm, Pagination, ShowSwal } from "components";
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
import { toast } from "react-toastify";
import { BiEdit, BiCustomize } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import CreateVariation from "./CreateVariation";
import clsx from "clsx";
import { useOutletContext } from "react-router-dom";

const ManageProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const [products, setProducts] = useState(null);
  const [counts, setCounts] = useState(0);
  const [editProduct, setEditProduct] = useState(null);
  const [update, setUpdate] = useState(false);
  const [currentProductForVariant, setCurrentProductForVariant] =
    useState(null);

  const { contentRef } = useOutletContext();

  const render = useCallback(() => {
    setUpdate(!update);
  }, [update]);

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
    ShowSwal({
      title: "Bạn có chắc chắn?",
      text: "Thao tác này sẽ xoá sản phẩm khỏi hệ thống.",
      icon: "warning",
      showCancelButton: true,
      variant: "danger",
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const response = await apiDeleteProduct(pid);
        if (response.success) toast.success(response.mes);
        else toast.error(response.mes);
        render();
      }
    });
  };

  useEffect(() => {
    if (editProduct || currentProductForVariant) {
      contentRef?.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [editProduct, currentProductForVariant]);

  return (
    <div className={clsx("w-full bg-gray-50 min-h-screen p-4", editProduct)}>
      {/* Header tìm kiếm */}
      <div className="sticky top-0 z-10 bg-white shadow p-4 rounded-xl mb-4 flex justify-between items-center">
        <form className="w-full" onSubmit={(e) => e.preventDefault()}>
          <InputForm
            id="q"
            register={register}
            errors={errors}
            fullWidth
            placeholder="🔍 Tìm kiếm sản phẩm..."
            isHideLabel
            onChange={(e) => setValue("q", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
        </form>
      </div>

      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm  shadow-md">
          <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full">
            {/* Nút đóng luôn cố định */}
            <button
              onClick={() => setEditProduct(null)}
              className="absolute top-2 right-3 z-10 text-gray-600 hover:text-black text-xl font-bold"
            >
              ✖
            </button>

            {/* Nội dung có thể cuộn */}
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <CreateProducts
                editProduct={editProduct}
                render={render}
                setEditProduct={setEditProduct}
                onDone={() => setEditProduct(null)}
              />
            </div>
          </div>
        </div>
      )}

      {currentProductForVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm  shadow-md">
          <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full">
            {/* Nút đóng luôn cố định */}
            <button
              onClick={() => setCurrentProductForVariant(null)}
              className="absolute top-2 right-3 z-10 text-gray-600 hover:text-black text-xl font-bold"
            >
              ✖
            </button>

            {/* Nội dung có thể cuộn */}
            <div className="p-6 max-h-[90vh] overflow-y-auto ">
              <CreateVariation
                productId={currentProductForVariant._id}
                productName={currentProductForVariant.productName}
                onDone={() => {
                  setCurrentProductForVariant(null);
                  render();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bảng sản phẩm */}
      <div className="bg-white rounded-xl shadow p-4">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-title-table text-white text-sm uppercase">
            <tr>
              <th className="py-3 px-2">STT</th>
              <th className="py-3 px-2">Ảnh</th>
              <th className="py-3 px-2">Tên sản phẩm</th>
              <th className="py-3 px-2">Hãng</th>
              <th className="py-3 px-2">Danh mục</th>
              <th className="py-3 px-2">Giá thấp nhất</th>
              <th className="py-3 px-2">Đã bán</th>
              <th className="py-3 px-2">Đánh giá</th>
              <th className="py-3 px-2">Tổng đánh giá</th>
              <th className="py-3 px-2">Tùy chọn</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((el, idx) => (
              <tr
                key={el._id}
                className="border-b hover:bg-sky-50 transition-all text-sm"
              >
                <td className="text-center py-3 px-2">
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
                  <div className="flex justify-center gap-2 items-center text-orange-600">
                    <span
                      onClick={() => {
                        setCurrentProductForVariant(null); // Tắt biến thể nếu đang mở
                        setEditProduct(el);
                      }}
                      className="hover:underline cursor-pointer text-blue-500"
                    >
                      Sửa
                    </span>
                    <span
                      onClick={() => {
                        setEditProduct(null); // Tắt sửa nếu đang mở
                        setCurrentProductForVariant(el);
                      }}
                      className="hover:underline cursor-pointer text-yellow-400"
                    >
                      Biến thể
                    </span>
                    <span
                      onClick={() => handleDeleteProduct(el._id)}
                      className="hover:underline cursor-pointer"
                    >
                      Xoá
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

        {/* Phân trang */}
        <div className="w-full flex justify-end mt-8">
          <Pagination totalCount={counts} />
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
