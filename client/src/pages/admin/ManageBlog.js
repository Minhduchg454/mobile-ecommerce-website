import { apiDeleteBlog, apiGetBlogs } from "apis/blog";
import { InputForm, Pagination } from "components";
import withBaseComponent from "hocs/withBaseComponent";
import useDebounce from "hooks/useDebounce";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useSearchParams } from "react-router-dom";
import { showModal } from "store/app/appSlice";
import UpdateBlog from "./UpdateBlog";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import clsx from "clsx";

const ManageBlog = ({ dispatch }) => {
  const [params] = useSearchParams();
  const [update, setUpdate] = useState(false);
  const [counts, setCounts] = useState(0);
  const [blogs, setBlogs] = useState();
  const { isShowModal } = useSelector((s) => s.app);
  const {
    register,
    formState: { errors },
    watch,
  } = useForm();

  const fetchBlogs = async (param) => {
    const response = await apiGetBlogs({
      ...param,
      limit: process.env.REACT_APP_LIMIT,
    });
    if (response.success) {
      setCounts(response.counts);
      setBlogs(response.blogs);
    }
  };

  const queryDebounce = useDebounce(watch("q"), 800);
  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    if (queryDebounce) searchParams.q = queryDebounce;
    if (!isShowModal) fetchBlogs(searchParams);
  }, [params, update, queryDebounce, isShowModal]);

  const handleDeleteBolg = async (id) => {
    Swal.fire({
      icon: "warning",
      title: "Xác nhận thao tác",
      text: "Bạn có chắc muốn xóa bài viết này?",
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Quay lại",
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const response = await apiDeleteBlog(id);
        if (response.success) {
          setUpdate(!update);
          toast.success(response.mes);
        } else toast.error(response.mes);
      }
    });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-4">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white shadow p-4 rounded-xl mb-4 flex justify-between items-center">
        <form className="w-full">
          <InputForm
            id="q"
            register={register}
            errors={errors}
            fullWidth
            placeholder="🔍 Tìm kiếm bài viết..."
          />
        </form>
      </div>

      {/* Nội dung bảng */}
      <div className="bg-white rounded-xl shadow p-4">
        <table className="table-auto w-full border-collapse text-sm">
          <thead className="bg-sky-800 text-white uppercase">
            <tr>
              <th className="py-3 px-2 text-center">STT</th>
              <th className="py-3 px-2 text-center">Tiêu đề</th>
              <th className="py-3 px-2 text-center">Thẻ</th>
              <th className="py-3 px-2 text-center">Lượt xem</th>
              <th className="py-3 px-2 text-center">Liked</th>
              <th className="py-3 px-2 text-center">Disliked</th>
              <th className="py-3 px-2 text-center">Ngày đăng</th>
              <th className="py-3 px-2 text-center">Tùy chọn</th>
            </tr>
          </thead>
          <tbody>
            {blogs?.map((el, idx) => (
              <tr
                key={el._id}
                className="border-b hover:bg-sky-50 transition-all"
              >
                <td className="text-center py-3 px-2 font-semibold">
                  {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                    process.env.REACT_APP_LIMIT +
                    idx +
                    1}
                </td>
                <td className="text-center py-3 px-2">{el.title}</td>
                <td className="text-center py-3 px-2">{el.hashtags}</td>
                <td className="text-center py-3 px-2">{el.numberViews}</td>
                <td className="text-center py-3 px-2">{el.likes?.length}</td>
                <td className="text-center py-3 px-2">{el.dislikes?.length}</td>
                <td className="text-center py-3 px-2">
                  {moment(el.createdAt).format("DD/MM/YYYY")}
                </td>
                <td className="text-center py-3 px-2">
                  <div className="flex justify-center gap-2 items-center text-orange-600 text-sm">
                    <span
                      onClick={() =>
                        dispatch(
                          showModal({
                            isShowModal: true,
                            modalChildren: <UpdateBlog {...el} />,
                          })
                        )
                      }
                      className="hover:underline cursor-pointer"
                    >
                      Sửa
                    </span>
                    <span
                      onClick={() => handleDeleteBolg(el._id)}
                      className="hover:underline cursor-pointer"
                    >
                      Xoá
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {blogs?.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có bài viết nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="w-full flex justify-end mt-8">
          <Pagination totalCount={counts} />
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(ManageBlog);
