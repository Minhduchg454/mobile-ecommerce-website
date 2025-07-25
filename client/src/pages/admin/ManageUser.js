import React, { useCallback, useEffect, useState } from "react";
import {
  apiGetUsers,
  apiUpdateUser,
  apiDeleteUser,
  apiGetAllRoles,
  apiGetAllStatusUsers,
} from "../../apis";
import { roles as staticRoles, blockStatus } from "ultils/contants";
import {
  InputField,
  Pagination,
  InputForm,
  Select,
  Button,
  ShowSwal,
} from "components";
import useDebounce from "hooks/useDebounce";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import clsx from "clsx";
import { useSelector } from "react-redux";

const ManageUser = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const { current } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [queries, setQueries] = useState({ q: "" });
  const [update, setUpdate] = useState(false);
  const [editElm, setEditElm] = useState(null);
  const [params] = useSearchParams();
  const [roles, setRoles] = useState([]);
  const [statusUsers, setStatusUsers] = useState([]);
  const fetchUsers = async (params) => {
    const response = await apiGetUsers({ ...params });
    if (response.success) setUsers(response.users);
  };

  const render = useCallback(() => setUpdate((prev) => !prev), []);

  const queriesDebounce = useDebounce(queries.q, 800);

  useEffect(() => {
    const fetchRoles = async () => {
      const response = await apiGetAllRoles();
      if (response.success) setRoles(response.roles);
    };

    const fetchStatusUsers = async () => {
      const response = await apiGetAllStatusUsers();
      if (response.success) setStatusUsers(response.statusUsers);
    };

    fetchRoles();
    fetchStatusUsers();
  }, []);

  useEffect(() => {
    const search = Object.fromEntries([...params]);
    if (queriesDebounce) search.q = queriesDebounce;
    fetchUsers(search);
  }, [queriesDebounce, params, update]);

  const handleUpdate = async (data) => {
    const payload = {
      firstName: data.firstName ?? editElm.firstName,
      lastName: data.lastName ?? editElm.lastName,
      mobile: data.mobile ?? editElm.mobile,
      roleId: data.roleId ?? editElm.roleId?._id,
      statusUserId: data.statusUserId ?? editElm.statusUserId?._id,
    };

    const response = await apiUpdateUser(payload, editElm._id);
    if (response.success) {
      toast.success(response.mes);
      setEditElm(null);
      render();
    } else {
      toast.error(response.mes);
    }
  };

  const handleDeleteUser = (uid) => {
    ShowSwal({
      title: "Xác nhận",
      text: "Bạn có chắc muốn xoá tài khoản này?",
      showCancelButton: true,
      icon: "warning",
      variant: "danger",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await apiDeleteUser(uid);
        if (response.success) {
          toast.success("Xóa tài khoản thành công");
          render();
        } else toast.error(response.mes);
      }
    });
  };

  const roleOptions = roles.map((r) => ({
    code: r._id, // giá trị sẽ gửi lên server
    value: r.roleName, // hiển thị
  }));
  const statusOptions = statusUsers.map((s) => ({
    code: s._id,
    value: s.statusUserName,
  }));

  return (
    <div className={clsx("w-full min-h-screen p-4", editElm && "pl-16")}>
      {/* Tìm kiếm */}
      <div className="sticky top-0 z-10 bg-white shadow p-4 rounded-xl mb-4">
        <form className="w-full">
          <InputForm
            id="q"
            label=""
            inputClassName="bg-[#E5E7EB]"
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
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <form onSubmit={handleSubmit(handleUpdate)}>
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
              {[...users]
                .sort((a, b) => {
                  const isAdminA = a.roleId?.roleName === "admin" ? -1 : 1;
                  const isAdminB = b.roleId?.roleName === "admin" ? -1 : 1;
                  return isAdminA - isAdminB;
                })
                .map((el, idx) => (
                  <tr
                    key={el._id}
                    className={clsx(
                      "border-b transition-all text-sm",
                      editElm?._id === el._id
                        ? "bg-yellow-50"
                        : "hover:bg-sky-50",
                      (el.roleId?.roleName === "admin" ||
                        el._id === current._id) &&
                        "opacity-50 pointer-events-none"
                    )}
                  >
                    <td className="text-center py-3 px-2">{idx + 1}</td>

                    {/* Email */}
                    <td className="text-center py-3 px-2">
                      <span>{el.email}</span>
                    </td>

                    {/* First Name */}
                    <td className="text-center py-3 px-2">
                      {editElm?._id === el._id ? (
                        <input
                          {...register("firstName", {
                            required: "Không được để trống",
                          })}
                          defaultValue={el.firstName}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        <span>{el.firstName}</span>
                      )}
                    </td>

                    {/* Last Name */}
                    <td className="text-center py-3 px-2">
                      {editElm?._id === el._id ? (
                        <input
                          {...register("lastName", {
                            required: "Không được để trống",
                          })}
                          defaultValue={el.lastName}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        <span>{el.lastName}</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="text-center py-3 px-2">
                      {editElm?._id === el._id ? (
                        <Select
                          register={register}
                          errors={errors}
                          id="roleId"
                          defaultValue={el.roleId?._id}
                          options={roleOptions}
                          fullWidth
                        />
                      ) : (
                        <span>{el.roleId?.roleName || "Không rõ"}</span>
                      )}
                    </td>

                    {/* Mobile */}
                    <td className="text-center py-3 px-2">
                      {editElm?._id === el._id ? (
                        <input
                          {...register("mobile", {
                            pattern: {
                              value: /^0\d{9}$/,
                              message: "SĐT không hợp lệ",
                            },
                          })}
                          defaultValue={el.mobile}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        <span>{el.mobile}</span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="text-center py-3 px-2">
                      {editElm?._id === el._id ? (
                        <Select
                          register={register}
                          errors={errors}
                          id="statusUserId"
                          defaultValue={el.statusUserId?._id}
                          options={statusOptions}
                          fullWidth
                        />
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            el.statusUserId?.statusUserName?.toLowerCase() ===
                            "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {el.statusUserId?.statusUserName || "Không rõ"}
                        </span>
                      )}
                    </td>

                    {/* Tùy chọn */}
                    <td className="text-center py-3 px-2">
                      <div className="flex justify-center gap-2 text-orange-600">
                        {editElm?._id === el._id ? (
                          <>
                            <button
                              type="submit"
                              className="hover:underline cursor-pointer text-green-600"
                            >
                              Lưu
                            </button>
                            <span
                              onClick={() => setEditElm(null)}
                              className="hover:underline cursor-pointer text-red-600"
                            >
                              Hủy
                            </span>
                          </>
                        ) : (
                          <>
                            {el.roleId?.roleName !== "admin" &&
                            current._id !== el._id ? (
                              <span
                                onClick={() => setEditElm(el)}
                                className="hover:underline cursor-pointer text-blue-600"
                              >
                                Sửa
                              </span>
                            ) : (
                              <span className="text-gray-400 cursor-not-allowed opacity-60">
                                Sửa
                              </span>
                            )}
                            {el.roleId?.roleName !== "admin" &&
                            current._id !== el._id ? (
                              <span
                                onClick={() => handleDeleteUser(el._id)}
                                className="hover:underline cursor-pointer"
                              >
                                Xoá
                              </span>
                            ) : (
                              <span className="text-gray-400 cursor-not-allowed opacity-60">
                                Xoá
                              </span>
                            )}
                          </>
                        )}
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
