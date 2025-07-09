import React, { useCallback, useEffect, useState } from "react";
import { apiGetUsers, apiUpdateUser, apiDeleteUser } from "apis/user";
import { roles as staticRoles, blockStatus } from "ultils/contants";
import { InputField, Pagination, InputForm, Select, Button } from "components";
import useDebounce from "hooks/useDebounce";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import clsx from "clsx";

const ManageUser = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const [users, setUsers] = useState([]);
  const [queries, setQueries] = useState({ q: "" });
  const [update, setUpdate] = useState(false);
  const [editElm, setEditElm] = useState(null);
  const [params] = useSearchParams();

  const fetchUsers = async (params) => {
    const response = await apiGetUsers({ ...params });
    if (response.success) setUsers(response.users);
  };

  const render = useCallback(() => setUpdate((prev) => !prev), []);

  const queriesDebounce = useDebounce(queries.q, 800);

  useEffect(() => {
    const search = Object.fromEntries([...params]);
    if (queriesDebounce) search.q = queriesDebounce;
    fetchUsers(search);
  }, [queriesDebounce, params, update]);

  const handleUpdate = async (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile: data.mobile,
      roleId: data.roleId,
      isBlocked: data.isBlocked,
    };
    const response = await apiUpdateUser(payload, editElm._id);
    if (response.success) {
      toast.success(response.mes);
      setEditElm(null);
      render();
    } else toast.error(response.mes);
  };

  const handleDeleteUser = (uid) => {
    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc muốn xoá tài khoản này?",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await apiDeleteUser(uid);
        if (response.success) {
          toast.success(response.mes);
          render();
        } else toast.error(response.mes);
      }
    });
  };

  const roleOptions = staticRoles.map((role) => ({
    code: role._id,
    value: role.roleName,
  }));

  return (
    <div
      className={clsx("w-full bg-gray-50 min-h-screen p-4", editElm && "pl-16")}
    >
      {/* Tìm kiếm */}
      <div className="sticky top-0 z-10 bg-white shadow p-4 rounded-xl mb-4">
        <form className="w-full">
          <InputForm
            id="q"
            label=""
            placeholder="🔍 Tìm kiếm tài khoản theo email, tên, ..."
            fullWidth
            defaultValue={queries.q}
            register={(name, options) => ({
              name,
              onChange: (e) => setQueries({ ...queries, q: e.target.value }),
              ...options,
            })}
            errors={{}}
            validate={{}}
          />
        </form>
      </div>

      {/* Danh sách người dùng */}
      <div className="bg-white rounded-xl shadow p-4">
        <form onSubmit={handleSubmit(handleUpdate)}>
          {editElm && (
            <div className="mb-4">
              <Button type="submit">Xác nhận</Button>
            </div>
          )}
          <table className="table-auto w-full border-collapse">
            <thead className="bg-title-table text-white text-sm uppercase">
              <tr>
                <th className="py-3 px-2">STT</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Tên</th>
                <th className="py-3 px-2">Họ</th>
                <th className="py-3 px-2">Vai trò</th>
                <th className="py-3 px-2">SĐT</th>
                <th className="py-3 px-2">Trạng thái</th>
                <th className="py-3 px-2">Tùy chọn</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((el, idx) => (
                <tr
                  key={el._id}
                  className="border-b hover:bg-sky-50 transition-all text-sm"
                >
                  <td className="text-center py-3 px-2">{idx + 1}</td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <InputForm
                        register={register}
                        errors={errors}
                        id="email"
                        defaultValue={el.email}
                        validate={{
                          required: "Bắt buộc nhập",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Email không hợp lệ",
                          },
                        }}
                        fullWidth
                      />
                    ) : (
                      <span>{el.email}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <InputForm
                        register={register}
                        errors={errors}
                        id="firstName"
                        defaultValue={el.firstName}
                        validate={{ required: "Bắt buộc nhập" }}
                        fullWidth
                      />
                    ) : (
                      <span>{el.firstName}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <InputForm
                        register={register}
                        errors={errors}
                        id="lastName"
                        defaultValue={el.lastName}
                        validate={{ required: "Bắt buộc nhập" }}
                        fullWidth
                      />
                    ) : (
                      <span>{el.lastName}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <Select
                        register={register}
                        errors={errors}
                        id="roleId"
                        defaultValue={el.roleId?._id}
                        validate={{ required: "Bắt buộc chọn" }}
                        options={roleOptions}
                        fullWidth
                      />
                    ) : (
                      <span>{el.roleId?.roleName || "Không rõ"}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <InputForm
                        register={register}
                        errors={errors}
                        id="mobile"
                        defaultValue={el.mobile}
                        validate={{
                          required: "Bắt buộc nhập",
                          pattern: {
                            value: /^0\d{9}$/,
                            message: "SĐT không hợp lệ",
                          },
                        }}
                        fullWidth
                      />
                    ) : (
                      <span>{el.mobile}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <Select
                        register={register}
                        errors={errors}
                        id="isBlocked"
                        defaultValue={el.isBlocked}
                        validate={{ required: "Bắt buộc chọn" }}
                        options={blockStatus}
                        fullWidth
                      />
                    ) : (
                      <span>{el.isBlocked ? "Đã khóa" : "Đang hoạt động"}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="flex justify-center gap-2 text-orange-600">
                      {editElm?._id === el._id ? (
                        <span
                          onClick={() => setEditElm(null)}
                          className="hover:underline cursor-pointer"
                        >
                          Hủy
                        </span>
                      ) : (
                        <span
                          onClick={() => setEditElm(el)}
                          className="hover:underline cursor-pointer text-blue-600"
                        >
                          Sửa
                        </span>
                      )}
                      <span
                        onClick={() => handleDeleteUser(el._id)}
                        className="hover:underline cursor-pointer"
                      >
                        Xoá
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Không có tài khoản nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </form>

        {/* Phân trang nếu backend có hỗ trợ */}
        <div className="w-full flex justify-end mt-8">
          <Pagination totalCount={users?.length || 0} />
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
