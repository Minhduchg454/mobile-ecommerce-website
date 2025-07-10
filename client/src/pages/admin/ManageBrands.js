import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  apiCreateBrand,
  apiGetBrands,
  apiUpdateBrand,
  apiDeleteBrand,
} from "apis";
import { InputForm, Button, Loading } from "components";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { showModal } from "store/app/appSlice";

const ManageBrands = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { brandName: "" },
  });

  const [brands, setBrands] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [update, setUpdate] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const render = useCallback(() => setUpdate((prev) => !prev), []);

  useEffect(() => {
    const fetchBrands = async () => {
      const res = await apiGetBrands();
      if (res.success) setBrands(res.brands);
    };
    fetchBrands();
  }, [update]);

  const onSubmit = async (data) => {
    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
    const res = await apiCreateBrand(data);
    dispatch(showModal({ isShowModal: false, modalChildren: null }));

    if (res.success) {
      toast.success("Thêm thương hiệu thành công!");
      reset();
      setShowForm(false);
      render();
    } else {
      toast.error(res.mes || "❌ Có lỗi xảy ra!");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc muốn xoá thương hiệu này?",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await apiDeleteBrand(id);
        if (res.success) {
          toast.success("Đã xoá thương hiệu");
          render();
        } else {
          toast.error(res.mes || "❌ Xoá thất bại");
        }
      }
    });
  };

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen space-y-8">
      {/* Nút hiển thị form */}
      <div className="w-fit px-4 py-2 rounded-md text-white flex items-center justify-center bg-main font-semibold my-2">
        <button
          onClick={() => {
            reset();
            setShowForm((prev) => !prev);
          }}
        >
          {showForm ? "Đóng biểu mẫu" : "➕ Thêm thương hiệu"}
        </button>
      </div>

      {/* Form thêm mới */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-xl font-bold mb-6">➕ Thêm thương hiệu</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputForm
              label="Tên thương hiệu"
              id="brandName"
              register={register}
              errors={errors}
              validate={{ required: "Không được để trống" }}
              fullWidth
              placeholder="Nhập tên thương hiệu"
            />
            <div className="flex items-center gap-4">
              <Button type="submit" className="rounded-xl">
                Thêm mới
              </Button>
              <button
                type="button"
                className="rounded-xl bg-gray-500 hover:bg-gray-600 px-4 py-2 text-white"
                onClick={() => {
                  setShowForm(false);
                  reset();
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách thương hiệu */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4">📋 Danh sách thương hiệu</h2>
        <table className="table-auto w-full border-collapse">
          <thead className="bg-title-table text-white text-sm uppercase">
            <tr>
              <th className="py-3 px-2">STT</th>
              <th className="py-3 px-2 text-left">Tên thương hiệu</th>
              <th className="py-3 px-2 text-center">Tùy chọn</th>
            </tr>
          </thead>
          <tbody>
            {brands?.map((el, idx) =>
              editingRowId === el._id ? (
                <tr key={el._id} className="border-b bg-yellow-50 text-sm">
                  <td className="text-center py-3 px-2">{idx + 1}</td>
                  <td className="py-3 px-2">
                    <input
                      value={editingData.brandName}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          brandName: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="flex justify-center gap-2 text-green-700">
                      <span
                        onClick={async () => {
                          const res = await apiUpdateBrand(el._id, editingData);
                          if (res.success) {
                            toast.success("Cập nhật thành công");
                            setEditingRowId(null);
                            setEditingData({});
                            render();
                          } else {
                            toast.error("Cập nhật thất bại");
                          }
                        }}
                        className="hover:underline cursor-pointer font-medium"
                      >
                        Lưu
                      </span>
                      <span
                        onClick={() => {
                          setEditingRowId(null);
                          setEditingData({});
                        }}
                        className="hover:underline cursor-pointer text-red-600"
                      >
                        Hủy
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr
                  key={el._id}
                  className="border-b hover:bg-sky-50 transition-all text-sm"
                >
                  <td className="text-center py-3 px-2">{idx + 1}</td>
                  <td className="py-3 px-2">{el.brandName}</td>
                  <td className="text-center py-3 px-2">
                    <div className="flex justify-center gap-2 text-orange-600">
                      <span
                        onClick={() => {
                          setEditingRowId(el._id);
                          setEditingData(el);
                        }}
                        className="hover:underline cursor-pointer text-blue-600"
                      >
                        Sửa
                      </span>
                      <span
                        onClick={() => handleDelete(el._id)}
                        className="hover:underline cursor-pointer"
                      >
                        Xoá
                      </span>
                    </div>
                  </td>
                </tr>
              )
            )}
            {brands?.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có thương hiệu nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBrands;

// import React, { useState, useEffect, useCallback } from "react";
// import { useForm } from "react-hook-form";
// import {
//   apiCreateBrand,
//   apiGetBrands,
//   apiUpdateBrand,
//   apiDeleteBrand,
// } from "apis";
// import { InputForm, Button, Loading } from "components";
// import { toast } from "react-toastify";
// import Swal from "sweetalert2";
// import { useDispatch } from "react-redux";
// import { showModal } from "store/app/appSlice";

// const ManageBrands = () => {
//   const dispatch = useDispatch();
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm({
//     defaultValues: { brandName: "" },
//   });

//   const [brands, setBrands] = useState([]);
//   const [editElm, setEditElm] = useState(null);
//   const [update, setUpdate] = useState(false);

//   const render = useCallback(() => setUpdate((prev) => !prev), []);

//   useEffect(() => {
//     const fetchBrands = async () => {
//       const res = await apiGetBrands();
//       if (res.success) setBrands(res.brands);
//     };
//     fetchBrands();
//   }, [update]);

//   useEffect(() => {
//     if (editElm) {
//       reset({ brandName: editElm.brandName });
//     } else {
//       reset({ brandName: "" });
//     }
//   }, [editElm, reset]);

//   const onSubmit = async (data) => {
//     dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

//     let response;
//     if (editElm) {
//       response = await apiUpdateBrand(editElm._id, data);
//     } else {
//       response = await apiCreateBrand(data);
//     }

//     dispatch(showModal({ isShowModal: false, modalChildren: null }));

//     if (response.success) {
//       toast.success(
//         editElm
//           ? "Cập nhật thương hiệu thành công!"
//           : "Thêm thương hiệu thành công!"
//       );
//       setEditElm(null);
//       render();
//     } else {
//       toast.error(response.mes || "❌ Có lỗi xảy ra!");
//     }
//   };

//   const handleDelete = (id) => {
//     Swal.fire({
//       title: "Xác nhận",
//       text: "Bạn có chắc muốn xoá thương hiệu này?",
//       showCancelButton: true,
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         const res = await apiDeleteBrand(id);
//         if (res.success) {
//           toast.success("Đã xoá thương hiệu");
//           render();
//         } else {
//           toast.error(res.mes || "❌ Xoá thất bại");
//         }
//       }
//     });
//   };

//   return (
//     <div className="w-full p-4 bg-gray-50 min-h-screen space-y-8">
//       {/* Form thêm / sửa */}
//       <div className="bg-white rounded-xl shadow p-6">
//         <h1 className="text-xl font-bold mb-6">
//           {editElm ? "✏️ Chỉnh sửa thương hiệu" : "➕ Thêm thương hiệu"}
//         </h1>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <InputForm
//             label="Tên thương hiệu"
//             id="brandName"
//             register={register}
//             errors={errors}
//             validate={{ required: "Không được để trống" }}
//             fullWidth
//             placeholder="Nhập tên thương hiệu"
//           />
//           <div className="flex items-center gap-4">
//             <Button type="submit" className="rounded-xl">
//               {editElm ? "Cập nhật" : "Thêm mới"}
//             </Button>
//             {editElm && (
//               <button
//                 type="button"
//                 onClick={() => setEditElm(null)}
//                 className="rounded-xl bg-gray-500 hover:bg-gray-600 text-white px-4 py-2"
//               >
//                 Hủy
//               </button>
//             )}
//           </div>
//         </form>
//       </div>

//       {/* Danh sách */}
//       <div className="bg-white rounded-xl shadow p-6">
//         <h2 className="text-lg font-bold mb-4">📋 Danh sách thương hiệu</h2>
//         <table className="table-auto w-full border-collapse">
//           <thead className="bg-title-table text-white text-sm uppercase">
//             <tr>
//               <th className="py-3 px-2">STT</th>
//               <th className="py-3 px-2 text-left">Tên thương hiệu</th>
//               <th className="py-3 px-2">Tùy chọn</th>
//             </tr>
//           </thead>
//           <tbody>
//             {brands?.map((el, idx) => (
//               <tr
//                 key={el._id}
//                 className="border-b hover:bg-sky-50 transition-all text-sm"
//               >
//                 <td className="text-center py-3 px-2">{idx + 1}</td>
//                 <td className="py-3 px-2">{el.brandName}</td>
//                 <td className="text-center py-3 px-2">
//                   <div className="flex justify-center gap-2 text-orange-600">
//                     <span
//                       onClick={() => setEditElm(el)}
//                       className="hover:underline cursor-pointer text-blue-600"
//                     >
//                       Sửa
//                     </span>
//                     <span
//                       onClick={() => handleDelete(el._id)}
//                       className="hover:underline cursor-pointer"
//                     >
//                       Xoá
//                     </span>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//             {brands?.length === 0 && (
//               <tr>
//                 <td
//                   colSpan="3"
//                   className="text-center py-6 text-gray-500 italic"
//                 >
//                   Không có thương hiệu nào.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ManageBrands;
