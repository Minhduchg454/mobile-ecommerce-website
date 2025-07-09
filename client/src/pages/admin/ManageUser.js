import React, { useCallback, useEffect, useState } from "react";
import { apiGetUsers, apiUpdateUser, apiDeleteUser } from "apis/user";
import { roles, blockStatus } from "ultils/contants";
import moment from "moment";
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
    reset,
  } = useForm({
    emai: "",
    firstname: "",
    lastname: "",
    role: "",
    phone: "",
    isBlocked: "",
  });
  const [users, setUsers] = useState(null);
  const [queries, setQueries] = useState({
    q: "",
  });
  const [update, setUpdate] = useState(false);
  const [editElm, setEditElm] = useState(null);
  const [params] = useSearchParams();
  const fetchUsers = async (params) => {
    const response = await apiGetUsers({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    });
    if (response.success) setUsers(response);
  };

  const render = useCallback(() => {
    setUpdate(!update);
  }, [update]);
  const queriesDebounce = useDebounce(queries.q, 800);

  useEffect(() => {
    const queries = Object.fromEntries([...params]);
    if (queriesDebounce) queries.q = queriesDebounce;
    fetchUsers(queries);
  }, [queriesDebounce, params, update]);
  const handleUpdate = async (data) => {
    const response = await apiUpdateUser(data, editElm._id);
    if (response.success) {
      setEditElm(null);
      render();
      toast.success(response.mes);
    } else toast.error(response.mes);
  };
  const handleDeleteUser = (uid) => {
    Swal.fire({
      title: "Are you sure...",
      text: "Are you ready remove this user?",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await apiDeleteUser(uid);
        if (response.success) {
          render();
          toast.success(response.mes);
        } else toast.error(response.mes);
      }
    });
  };
  return (
    <div
      className={clsx("w-full bg-gray-50 min-h-screen p-4", editElm && "pl-16")}
    >
      {/* Thanh tìm kiếm */}
      <div className="sticky top-0 z-10 bg-white shadow p-4 rounded-xl mb-4 flex justify-between items-center">
        <form className="w-full max-w-lg">
          <InputField
            nameKey={"q"}
            value={queries.q}
            setValue={setQueries}
            style={"w-full"}
            placeholder="🔍 Tìm kiếm tài khoản..."
            isHideLabel
          />
        </form>
      </div>

      {/* Vùng nội dung */}
      <div className="bg-white rounded-xl shadow p-4">
        <form onSubmit={handleSubmit(handleUpdate)}>
          {editElm && (
            <div className="mb-4">
              <Button type="submit">Xác nhận</Button>
            </div>
          )}
          <table className="table-auto w-full border-collapse">
            <thead className="bg-sky-800 text-white text-sm uppercase">
              <tr>
                <th className="py-3 px-2">STT</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Tên</th>
                <th className="py-3 px-2">Họ</th>
                <th className="py-3 px-2">Vai trò</th>
                <th className="py-3 px-2">Số điện thoại</th>
                <th className="py-3 px-2">Trạng thái</th>
                <th className="py-3 px-2">Tùy chọn</th>
              </tr>
            </thead>
            <tbody>
              {users?.users?.map((el, idx) => (
                <tr
                  key={el._id}
                  className="border-b hover:bg-sky-50 transition-all text-sm"
                >
                  <td className="text-center py-3 px-2">{idx + 1}</td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <InputForm
                        register={register}
                        fullWidth
                        errors={errors}
                        defaultValue={editElm?.email}
                        id={"email"}
                        validate={{
                          required: "Require fill.",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        }}
                      />
                    ) : (
                      <span>{el.email}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <InputForm
                        register={register}
                        fullWidth
                        errors={errors}
                        defaultValue={editElm?.firstname}
                        id={"firstname"}
                        validate={{ required: "Require fill." }}
                      />
                    ) : (
                      <span>{el.firstname}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <InputForm
                        register={register}
                        fullWidth
                        errors={errors}
                        defaultValue={editElm?.lastname}
                        id={"lastname"}
                        validate={{ required: "Require fill." }}
                      />
                    ) : (
                      <span>{el.lastname}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <Select
                        register={register}
                        fullWidth
                        errors={errors}
                        defaultValue={+el.role}
                        id={"role"}
                        validate={{ required: "Require fill." }}
                        options={roles}
                      />
                    ) : (
                      <span>
                        {roles.find((role) => +role.code === +el.role)?.value}
                      </span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <InputForm
                        register={register}
                        fullWidth
                        errors={errors}
                        defaultValue={editElm?.mobile}
                        id={"mobile"}
                        validate={{
                          required: "Require fill.",
                          pattern: {
                            value: /^[62|0]+\d{9}/gi,
                            message: "Invalid phone number",
                          },
                        }}
                      />
                    ) : (
                      <span>{el.mobile}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    {editElm?._id === el._id ? (
                      <Select
                        register={register}
                        fullWidth
                        errors={errors}
                        defaultValue={el.isBlocked}
                        id={"isBlocked"}
                        validate={{ required: "Require fill." }}
                        options={blockStatus}
                      />
                    ) : (
                      <span>{el.isBlocked ? "Đã khóa" : "Đang hoạt động"}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="flex justify-center gap-2 items-center text-orange-600">
                      {editElm?._id === el._id ? (
                        <span
                          onClick={() => setEditElm(null)}
                          className="hover:underline cursor-pointer"
                        >
                          Về
                        </span>
                      ) : (
                        <span
                          onClick={() => setEditElm(el)}
                          className="hover:underline cursor-pointer"
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
              {users?.users?.length === 0 && (
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

        {/* Phân trang */}
        <div className="w-full flex justify-end mt-8">
          <Pagination totalCount={users?.counts} />
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
